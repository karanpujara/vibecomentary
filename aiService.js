/**
 * AI Service
 * Handles all AI-related operations including API calls, prompt generation, and response processing
 */
class AIService {
  constructor() {
    this.activePostElement = null;
  }

  setActivePost(post) {
    this.activePostElement = post;
  }

  /**
   * Get selected model from storage
   */
  async getSelectedModel() {
    return new Promise((resolve, reject) => {
      try {
        if (typeof chrome === "undefined" || !chrome.storage) {
          reject(new Error("Chrome extension APIs not available"));
          return;
        }

        chrome.storage.local.get(["vibeModel"], (res) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(res.vibeModel || "gpt-3.5-turbo");
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Fetch suggestions from OpenAI API
   */
  async fetchSuggestions(apiKey, tone, emoji, postText, postEl = null) {
    try {
      const selectedModel = await this.getSelectedModel();

      // Get platform-specific data
      const platform = this.getCurrentPlatform();
      const authorName = platform
        ? platform.extractAuthorName(postEl || this.activePostElement)
        : "the author";
      const userProfileName = platform
        ? platform.extractUserProfileName()
        : "Your Name";

      // Get custom prompts and guidelines from storage, fallback to platform-specific or default
      const customPrompts = await this.getCustomPrompts();
      const customGuidelines = await this.getCustomGuidelines();

      // Use custom prompts if available, otherwise use platform-specific or default
      const prompts =
        customPrompts ||
        (platform ? platform.getDefaultPrompts() : this.getDefaultPrompts());

      // For guidelines, merge custom with defaults to ensure all tones have guidelines
      const defaultGuidelines = platform
        ? platform.getDefaultGuidelines()
        : this.getDefaultGuidelines();

      const guidelines = customGuidelines
        ? { ...defaultGuidelines, ...customGuidelines } // Merge defaults with custom
        : defaultGuidelines;

      const prompt = prompts[tone] || this.getDefaultPrompts()[tone];
      const guidelineRaw =
        guidelines[tone] || this.getDefaultGuidelines()[tone];

      // Debug logging to verify custom prompts are being used
      console.log("🎯 Using prompts for tone:", tone);
      console.log("📝 Custom prompts available:", !!customPrompts);
      console.log("📋 Custom guidelines available:", !!customGuidelines);
      console.log("🔧 Final prompt:", prompt);
      console.log("📋 Final guideline:", guidelineRaw);
      console.log("📋 Custom guidelines object:", customGuidelines);
      console.log("📋 Guidelines for this tone:", guidelines[tone]);

      // Process author name replacement
      let firstNameWithPrefix = authorName;
      const guideline = guidelineRaw.replace(
        /\$\{firstNameWithPrefix\}/g,
        firstNameWithPrefix
      );

      const finalPrompt = `${prompt}

Guidelines:
${guideline}

Please format your response with each comment on a separate line, separated by a blank line.

Post:
"${postText}"`;

      // Create DM prompt like the working backup
      const platformName = platform
        ? platform.getPlatformName()
        : "this platform";
      const dmPrompt = `Write a short DM message I can send to ${firstNameWithPrefix} on ${platformName} in a "${tone}" tone. Be human, brief, and relevant to the post. 

IMPORTANT: Start the message with "Hello ${firstNameWithPrefix}, " followed immediately by the main content on the same line. Do not add line breaks after the greeting. Keep it compact since only the first 2 lines are visible in DM preview.

End the message with a line break, then "Best," on a new line, then "${userProfileName}" on the next line.

Post:
"${postText}"`;

      console.log("🤖 Sending requests to OpenAI...");
      console.log("📝 Comment prompt:", finalPrompt);
      console.log("📝 DM prompt:", dmPrompt);

      // Make separate API calls for comments and DM like the working backup
      let commentRes, dmRes;
      try {
        [commentRes, dmRes] = await Promise.all([
          this.makeAPIRequest(finalPrompt, apiKey, selectedModel),
          this.makeAPIRequest(dmPrompt, apiKey, selectedModel),
        ]);

        const commentData = await commentRes.json();
        const dmData = await dmRes.json();

        console.log("📊 Comment response:", commentData);
        console.log("📊 DM response:", dmData);

        if (commentData.error) {
          throw new Error(`OpenAI API Error: ${commentData.error.message}`);
        }

        const commentContent = commentData.choices?.[0]?.message?.content;
        const dmContent = dmData.choices?.[0]?.message?.content;

        if (!commentContent) {
          throw new Error("No content received from OpenAI for comments");
        }

        // Parse comments using the working backup logic
        const parsed = this.parseAIResponse(
          commentContent,
          platform,
          authorName,
          userProfileName
        );

        return {
          comments: parsed.comments,
          dmSuggestion: dmContent || "No DM suggestion found.",
          success: true,
        };
      } catch (err) {
        throw new Error(
          "Failed to get suggestions. Check your key or try again."
        );
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Improve a user's comment
   */
  async improveComment(commentText) {
    try {
      const storage = await this.getStorageData(["vibeOpenAIKey", "vibeModel"]);
      const apiKey = storage.vibeOpenAIKey;
      const selectedModel = storage.vibeModel || "gpt-3.5-turbo";

      if (!apiKey) {
        throw new Error("Missing API key");
      }

      const platformName = this.getCurrentPlatform()
        ? this.getCurrentPlatform().getPlatformName()
        : "this platform";
      const defaultImprovePrompt = `Improve this comment and make it more thoughtful, clearer, and better suited for a professional conversation on ${platformName}.`;
      const defaultImproveGuideline = `- Rewrite the comment to sound clearer, more articulate.\n- Maintain the same idea and emotion.\n- Make it suitable for professional platforms.`;

      const fullPrompt = `${defaultImprovePrompt}\n\nGuidelines:\n${defaultImproveGuideline}\n\nHere is my comment:\n"${commentText}"\n\nImprove it:`;

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              {
                role: "system",
                content: "You are a helpful writing assistant.",
              },
              { role: "user", content: fullPrompt },
            ],
            temperature: 0.7,
          }),
        }
      );

      const data = await response.json();
      const rawImproved = data.choices?.[0]?.message?.content?.trim();

      if (rawImproved) {
        // Debug logging to see what the AI returned
        console.log("🔧 Raw AI response:", rawImproved);

        // Clean the improved text to remove quotes, labels, and formatting
        const cleanedImproved = this.cleanImprovedText(rawImproved);
        console.log("✨ Cleaned improved text:", cleanedImproved);

        return { success: true, improvedText: cleanedImproved };
      } else {
        throw new Error("No improvement generated");
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Clean improved text to remove quotes, labels, and formatting
   */
  cleanImprovedText(text) {
    if (!text) return text;

    let cleaned = text.trim();

    // Remove common labels and prefixes (more comprehensive)
    cleaned = cleaned.replace(
      /^(Improved version|Improved comment|Here's the improved version|Here's the improved comment|Improved:|Enhanced version|Enhanced comment|Better version|Better comment|Certainly! Here's a refined version of your comment:|Here's a refined version:|Here's an improved version:|Here's a better version:|Here's the refined version:|Here's the improved version:|Here's the better version:|Certainly! Here's an improved version:|Certainly! Here's a better version:|Here's a more polished version:|Here's a clearer version:|Here's a more professional version:)\s*/gi,
      ""
    );

    // Remove any introductory text that ends with a colon (more general approach)
    cleaned = cleaned.replace(/^[^"]*?:\s*/, "");

    // Remove quotes at the beginning and end (more aggressive)
    cleaned = cleaned.replace(/^["'""]+\s*/, ""); // Remove leading quotes
    cleaned = cleaned.replace(/\s*["'""]+$/, ""); // Remove trailing quotes

    // Remove markdown formatting
    cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, "$1"); // Remove bold
    cleaned = cleaned.replace(/\*(.*?)\*/g, "$1"); // Remove italic
    cleaned = cleaned.replace(/`(.*?)`/g, "$1"); // Remove code blocks

    // Remove extra whitespace and normalize
    cleaned = cleaned.replace(/\s+/g, " ").trim();

    // More aggressive quote removal - check if entire text is wrapped in quotes
    if (
      (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
      (cleaned.startsWith("'") && cleaned.endsWith("'"))
    ) {
      cleaned = cleaned.slice(1, -1).trim();
    }

    // Additional check for quotes that might have been missed
    // Remove any remaining quotes at the very beginning or end
    cleaned = cleaned.replace(/^["'""]/, ""); // Remove any remaining leading quote
    cleaned = cleaned.replace(/["'""]$/, ""); // Remove any remaining trailing quote

    // Final trim to clean up any extra spaces
    cleaned = cleaned.trim();

    return cleaned;
  }

  /**
   * Parse AI response to extract comments and DM
   */
  parseAIResponse(content, platform, authorName, userProfileName) {
    // More robust comment parsing - using exact logic from working backup
    let comments = [];

    // First, try to split by common separators
    let parts = content.split(/\n\s*\n|\n(?=\d+\.|\nComment\s*\d+:)/);

    // If we don't get enough parts, try splitting by single newlines
    if (parts.length < 2) {
      parts = content.split(/\n+/);
    }

    // Process each part
    for (let part of parts) {
      part = part.trim();
      if (part.length < 10) continue;

      // Clean the comment text - using exact regex from working backup
      let cleanComment = part
        .replace(
          /^(Comment\s*\d+:|^\d+\.|First comment:|Second comment:|Activate:)/gi,
          ""
        )
        .replace(/\*\*Comment\s*\d+:\*\*/gi, "")
        .replace(/^["'\d\.\)\s-]+/, "") // Remove leading quotes, numbers, etc.
        .replace(/["']$/, "") // Remove trailing quotes
        .trim();

      if (cleanComment.length >= 10) {
        comments.push(cleanComment);
      }
    }

    // If we still don't have enough comments, try a different approach
    if (comments.length < 2) {
      // Split the entire content into roughly equal parts
      const lines = content
        .split(/\n+/)
        .filter((line) => line.trim().length > 10);
      if (lines.length >= 2) {
        const midPoint = Math.ceil(lines.length / 2);
        const firstHalf = lines.slice(0, midPoint).join(" ").trim();
        const secondHalf = lines.slice(midPoint).join(" ").trim();

        if (firstHalf.length >= 10) comments[0] = firstHalf;
        if (secondHalf.length >= 10) comments[1] = secondHalf;
      }
    }

    // Ensure we have exactly 2 comments
    while (comments.length < 2) {
      comments.push("");
    }

    // Take only the first 2 comments
    comments = comments.slice(0, 2);

    // For DM, we'll handle it separately since it comes from a different API call
    let dmSuggestion = "";

    // Format comments and DM using platform-specific formatting
    if (platform) {
      comments = comments.map((comment) =>
        platform.formatComment(comment, authorName)
      );
      dmSuggestion = platform.formatDM(
        dmSuggestion,
        authorName,
        userProfileName
      );
    }

    return { comments, dmSuggestion };
  }

  /**
   * Make API request to OpenAI
   */
  async makeAPIRequest(prompt, apiKey, model) {
    return fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful social media assistant that generates engaging comments and DM suggestions.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });
  }

  /**
   * Get current platform
   */
  getCurrentPlatform() {
    // This will be set by the main script
    return this.currentPlatform;
  }

  /**
   * Set current platform
   */
  setCurrentPlatform(platform) {
    this.currentPlatform = platform;
  }

  /**
   * Get storage data
   */
  async getStorageData(keys) {
    return new Promise((resolve, reject) => {
      if (typeof chrome === "undefined" || !chrome.storage) {
        reject(new Error("Chrome extension APIs not available"));
        return;
      }

      chrome.storage.local.get(keys, (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Get custom prompts from storage
   */
  async getCustomPrompts() {
    try {
      const data = await this.getStorageData(["tonePrompts"]);
      return data.tonePrompts || null;
    } catch (error) {
      console.error("Error getting custom prompts:", error);
      return null;
    }
  }

  /**
   * Get custom guidelines from storage
   */
  async getCustomGuidelines() {
    try {
      const data = await this.getStorageData(["toneGuidelines"]);
      return data.toneGuidelines || null;
    } catch (error) {
      console.error("Error getting custom guidelines:", error);
      return null;
    }
  }

  /**
   * Default prompts (fallback)
   */
  getDefaultPrompts() {
    return {
      "Smart Contrarian":
        "Write 2 contrarian but respectful comments that offer a different perspective.",
      "Agreement with Value":
        "Write 2 thoughtful comments that agree and add extra insight.",
      "Ask a Question": "Write 2 engaging questions to spark conversation.",
      Friendly: "Write 2 friendly and encouraging comments.",
      Celebratory: "Write 2 congratulatory comments that sound genuine.",
      Constructive: "Write 2 comments that offer polite suggestions.",
      "Offer Help": "Write 2 comments that offer genuine help or support.",
      Contribution: "Write 2 comments that contribute fresh insights.",
      "Disagreement - Contrary": "Write 2 respectful comments that disagree.",
      Criticism: "Write 2 polite and professional criticisms.",
      "Funny Sarcastic": "Write 2 playful, witty comments.",
      "Perspective (Why / What / How)":
        "Write 2 comments that add thoughtful perspectives.",
      "Professional Industry Specific": "Write 2 expert-level comments.",
    };
  }

  /**
   * Default guidelines (fallback)
   */
  getDefaultGuidelines() {
    return {
      "Smart Contrarian":
        "- Start by addressing the author directly.\n- Respectfully challenge the view.\n- Keep tone civil.",
      "Agreement with Value":
        "- Address the author directly.\n- Add extra value or insight.\n- Keep tone appreciative.",
      "Ask a Question":
        "- Start with the author's name.\n- Ask thoughtful questions.\n- Avoid yes/no questions.",
      Friendly:
        "- Use a casual tone.\n- Start with the author's name.\n- Keep it short and warm.",
      Celebratory:
        "- Use an enthusiastic tone.\n- Start with the author's name.\n- Celebrate naturally.",
      Constructive:
        "- Offer helpful suggestions.\n- Start with the author's name.\n- Be kind and relevant.",
      "Offer Help":
        "- Be supportive and generous.\n- Mention specific help you can offer.\n- Start with the author's name.",
      Contribution:
        "- Share a resource or insight.\n- Add your perspective briefly.\n- Start by building on their thought.",
      "Disagreement - Contrary":
        "- Be respectful but bold.\n- Use facts or reasoning.\n- Mention the author by name.",
      Criticism:
        "- Keep it constructive.\n- Point out gaps politely.\n- Mention the author respectfully.",
      "Funny Sarcastic":
        "- Add humor or wit.\n- Keep it lighthearted.\n- Tag the author for effect.",
      "Perspective (Why / What / How)":
        '- Ask "why", "what", or "how" questions.\n- Expand the conversation.\n- Mention the author at start.',
      "Professional Industry Specific":
        "- Use domain language.\n- Mention trends or stats.\n- Begin with the author's name.",
    };
  }
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = AIService;
}
