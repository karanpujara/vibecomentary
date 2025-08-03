/**
 * AI Service
 * Handles all AI-related operations including API calls, prompt generation, and response processing
 */
class AIService {
  constructor() {
    this.activePost = null;
  }

  setActivePost(post) {
    this.activePost = post;
  }

  async getSelectedModel() {
    try {
      return new Promise((resolve) => {
        chrome.storage.local.get(["vibeModel"], (res) => {
          resolve(res.vibeModel || "gpt-3.5-turbo");
        });
      });
    } catch (error) {
      console.error("Error getting selected model:", error);
      return "gpt-3.5-turbo"; // Fallback to default
    }
  }

  /**
   * Validate API key with basic checks only
   * OpenAI API keys can vary in length, so we only check essential format
   */
  validateAPIKey(apiKey) {
    if (!apiKey || typeof apiKey !== "string") {
      return { valid: false, error: "API key is required" };
    }

    if (!apiKey.startsWith("sk-")) {
      return { valid: false, error: "API key must start with sk-" };
    }

    // Only check for obvious issues like whitespace
    if (
      apiKey.includes(" ") ||
      apiKey.includes("\n") ||
      apiKey.includes("\t")
    ) {
      return { valid: false, error: "API key contains invalid characters" };
    }

    // Very basic length check - just ensure it's not obviously wrong
    if (apiKey.length < 5) {
      return { valid: false, error: "API key seems too short" };
    }

    return { valid: true };
  }

  /**
   * Fetch suggestions from OpenAI API
   */
  async fetchSuggestions(apiKey, tone, emoji, postText, postEl = null) {
    try {
      // Validate API key first
      const validation = this.validateAPIKey(apiKey);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const model = await this.getSelectedModel();
      const platform = this.getCurrentPlatform();

      // Get custom prompts and guidelines
      const customPrompts = await this.getCustomPrompts();
      const customGuidelines = await this.getCustomGuidelines();
      const customTones = await this.getCustomTones();

      // Determine prompt and guideline
      let prompt, guideline;

      if (customTones && customTones[tone]) {
        // Custom tone
        prompt = customTones[tone].prompt;
        guideline = customTones[tone].guideline;
      } else if (customPrompts && customPrompts[tone]) {
        // Custom prompt for default tone
        prompt = customPrompts[tone];
        guideline =
          customGuidelines && customGuidelines[tone]
            ? customGuidelines[tone]
            : this.getDefaultGuidelines()[tone] || "";
      } else {
        // Default tone
        prompt =
          this.getDefaultPrompts()[tone] ||
          "Write 2 engaging comments for this post.";
        guideline = this.getDefaultGuidelines()[tone] || "";
      }

      // Ensure prompt requests exactly 2 comments
      if (
        !prompt.toLowerCase().includes("write 2") &&
        !prompt.toLowerCase().includes("2 comments")
      ) {
        prompt = `Write 2 ${prompt}`;
      }

      // Extract author name and user profile name
      let authorName = "the author";
      let userProfileName = "";

      if (platform && postEl) {
        try {
          authorName = platform.extractAuthorName(postEl) || "the author";
          userProfileName = platform.extractUserProfileName() || "";
        } catch (error) {
          console.error("Error extracting names:", error);
        }
      }

      // Process author name replacement
      let firstNameWithPrefix = authorName;
      const processedGuideline = guideline.replace(
        /\$\{firstNameWithPrefix\}/g,
        firstNameWithPrefix
      );

      // Build the comment prompt
      const commentPrompt = `${prompt}

Guidelines:
${processedGuideline}

IMPORTANT: 
- When addressing the author, use "${firstNameWithPrefix}" (the author's name) and NOT any names mentioned in the post content.
- Do NOT mention comment generation, AI tools, or the fact that you're generating comments.
- Focus on the post content and respond naturally as if you're a real person commenting.
- Generate exactly 2 comments.

Please format your response with each comment on a separate line, separated by a blank line.

Post:
"${postText}"`;

      // Build the DM prompt
      const platformName = platform
        ? platform.getPlatformName()
        : "this platform";
      const safeUserProfileName = userProfileName || "Your Name";

      const dmPrompt = `Write a short, personalized DM message I can send to ${firstNameWithPrefix} on ${platformName} in a "${tone}" tone. 

IMPORTANT INSTRUCTIONS:
- Do NOT repeat the post content verbatim
- Create a genuine, personal message that relates to their post
- Start with "Hello ${firstNameWithPrefix}, " followed by your message on the same line
- Keep it brief and conversational
- End with a line break, then "Best," on a new line, then "${safeUserProfileName}" on the next line

Example format:
Hello ${firstNameWithPrefix}, [your personal message here]
Best,
${safeUserProfileName}

Post they shared:
"${postText}"`;

      // Make separate API calls for comments and DM
      let commentRes, dmRes;
      try {
        [commentRes, dmRes] = await Promise.all([
          this.makeAPIRequest(commentPrompt, apiKey, model),
          this.makeAPIRequest(dmPrompt, apiKey, model),
        ]);

        const commentData = await commentRes.json();
        const dmData = await dmRes.json();

        if (commentData.error) {
          console.error(
            "❌ OpenAI API Error Details:",
            JSON.stringify(commentData.error, null, 2)
          );
          this.showOpenAIErrorAlert(commentData.error);
          throw new Error(
            `OpenAI API Error: ${commentData.error.message} (Type: ${
              commentData.error.type || "unknown"
            })`
          );
        }

        if (dmData.error) {
          console.error(
            "❌ OpenAI DM API Error Details:",
            JSON.stringify(dmData.error, null, 2)
          );
          // Don't throw for DM errors, just log them
        }

        const commentContent = commentData.choices?.[0]?.message?.content;
        const dmContent = dmData.choices?.[0]?.message?.content;

        if (!commentContent) {
          console.error(
            "❌ No content in response:",
            JSON.stringify(commentData, null, 2)
          );
          throw new Error("No content received from OpenAI for comments");
        }

        // Parse comments using the original logic
        const parsed = this.parseAIResponse(
          commentContent,
          platform,
          authorName,
          userProfileName
        );

        // Process DM content properly
        let processedDm = "No DM suggestion found.";
        if (dmContent) {
          // Clean the DM content similar to how we clean improved comments
          processedDm = this.cleanImprovedText(dmContent);

          // Additional DM-specific cleaning
          processedDm = processedDm
            .replace(/^(DM|Direct Message|Message):\s*/gi, "") // Remove DM labels
            .replace(
              /^(Here's a DM|Here's a message|Here's a direct message):\s*/gi,
              ""
            ) // Remove introductory text
            .trim();

          // Extract only the first DM message if multiple are generated
          const lines = processedDm.split("\n");
          let firstDmLines = [];
          let foundFirstDm = false;

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Look for the start of a DM (Hello + name pattern)
            if (line.match(/^Hello\s+\w+,\s*/i) && !foundFirstDm) {
              foundFirstDm = true;
              firstDmLines.push(line);
            } else if (foundFirstDm) {
              // Continue collecting lines until we hit another "Hello" or empty line
              if (line.match(/^Hello\s+\w+,\s*/i)) {
                break; // Stop at the next DM
              }
              if (
                line === "" &&
                i < lines.length - 1 &&
                lines[i + 1].match(/^Hello\s+\w+,\s*/i)
              ) {
                break; // Stop before next DM
              }
              firstDmLines.push(line);
            }
          }

          // If we found a DM, use it; otherwise use the original cleaned content
          if (foundFirstDm && firstDmLines.length > 0) {
            processedDm = firstDmLines.join("\n").trim();
          }

          // Clean up any remaining variables in DM content
          processedDm = processedDm.replace(
            /\$\{firstNameWithPrefix\}/g,
            firstNameWithPrefix
          );
          processedDm = processedDm.replace(
            /\$\{authorName\}/g,
            firstNameWithPrefix
          );
          processedDm = processedDm.replace(
            /\$\{userName\}/g,
            firstNameWithPrefix
          );

          // Check if the DM is just repeating the post content
          const postTextLower = postText.toLowerCase().trim();
          const dmLower = processedDm.toLowerCase().trim();

          // If DM contains more than 70% of the post text, it's likely just repeating
          const postWords = postTextLower
            .split(/\s+/)
            .filter((word) => word.length > 2);
          const dmWords = dmLower
            .split(/\s+/)
            .filter((word) => word.length > 2);

          if (postWords.length > 0 && dmWords.length > 0) {
            const matchingWords = postWords.filter((word) =>
              dmWords.includes(word)
            );
            const similarityRatio = matchingWords.length / postWords.length;

            if (similarityRatio > 0.7) {
              console.log(
                "⚠️ DM appears to be repeating post content, using fallback"
              );
              processedDm = "No DM suggestion found.";
            }
          }

          // If the cleaned DM is empty or too short, use fallback
          if (!processedDm || processedDm.length < 5) {
            processedDm = "No DM suggestion found.";
          }
        }

        console.log("📝 Raw DM content:", dmContent);
        console.log("✨ Processed DM content:", processedDm);

        return {
          comments: parsed.comments,
          dmSuggestion: processedDm,
          success: true,
        };
      } catch (err) {
        throw new Error(
          "Failed to get suggestions. Check your key or try again."
        );
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      this.showOpenAIErrorAlert(error);
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

      // Log the model being used for debugging
      console.log("🤖 Using model:", selectedModel);
      console.log("🔑 API Key length:", apiKey.length);

      // Get custom prompts and guidelines from storage
      const customPrompts = await this.getCustomPrompts();
      const customGuidelines = await this.getCustomGuidelines();

      // Use custom improve prompt if available, otherwise use default
      let improvePrompt;
      let improveGuideline;

      if (customPrompts && customPrompts.Improve) {
        // Use custom prompt without platform name
        improvePrompt = customPrompts.Improve;
        improveGuideline =
          customGuidelines && customGuidelines.Improve
            ? customGuidelines.Improve
            : `- Rewrite the comment to sound clearer, more articulate.\n- Maintain the same idea and emotion.\n- Make it suitable for professional platforms.`;
      } else {
        // Use default with platform name
        const platformName = this.getCurrentPlatform()
          ? this.getCurrentPlatform().getPlatformName()
          : "this platform";
        improvePrompt = `Improve this comment and make it more thoughtful, clearer, and better suited for a professional conversation on ${platformName}.`;
        improveGuideline = `- Rewrite the comment to sound clearer, more articulate.\n- Maintain the same idea and emotion.\n- Make it suitable for professional platforms.`;
      }

      const fullPrompt = `${improvePrompt}\n\nGuidelines:\n${improveGuideline}\n\nHere is my writeup:\n"${commentText}"`;

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

      // Log the full response for debugging
      console.log("🔧 Full OpenAI response:", data);

      if (data.error) {
        console.error(
          "❌ OpenAI Improve API Error Details:",
          JSON.stringify(data.error, null, 2)
        );

        // Show user-friendly alert based on error type
        this.showOpenAIErrorAlert(data.error);

        throw new Error(
          `OpenAI API Error: ${data.error.message} (Type: ${
            data.error.type || "unknown"
          })`
        );
      }

      const rawImproved = data.choices?.[0]?.message?.content?.trim();

      if (rawImproved) {
        // Debug logging to see what the AI returned
        console.log("🔧 Raw AI response:", rawImproved);

        // Clean the improved text to remove quotes, labels, and formatting
        const cleanedImproved = this.cleanImprovedText(rawImproved);
        console.log("✨ Cleaned improved text:", cleanedImproved);

        return { success: true, improvedText: cleanedImproved };
      } else {
        console.error(
          "❌ No content in improve response:",
          JSON.stringify(data, null, 2)
        );
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

    // Clean up any remaining variable placeholders that might have been generated literally
    cleaned = cleaned.replace(/\$\{firstNameWithPrefix\}/g, "the author");
    cleaned = cleaned.replace(/\$\{authorName\}/g, "the author");
    cleaned = cleaned.replace(/\$\{platformName\}/g, "this platform");
    cleaned = cleaned.replace(/\$\{tone\}/g, "this tone");

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

    // Clean up any remaining variables in comments
    comments = comments.map((comment) => {
      // Replace any remaining ${firstNameWithPrefix} variables with the actual author name
      let cleanedComment = comment.replace(
        /\$\{firstNameWithPrefix\}/g,
        authorName
      );

      // Also replace any other common variable patterns
      cleanedComment = cleanedComment.replace(/\$\{authorName\}/g, authorName);
      cleanedComment = cleanedComment.replace(/\$\{userName\}/g, authorName);

      console.log("🔧 Comment variable replacement:");
      console.log("📝 Original:", comment);
      console.log("✨ Cleaned:", cleanedComment);

      return cleanedComment;
    });

    // Format comments and DM using platform-specific formatting
    if (platform) {
      comments = comments.map((comment) =>
        platform.formatComment(comment, authorName)
      );
      dmSuggestion = platform.formatDM(
        dmSuggestion,
        authorName,
        userProfileName || null
      );
    }

    return { comments, dmSuggestion };
  }

  /**
   * Show user-friendly alert for OpenAI API errors
   */
  showOpenAIErrorAlert(error) {
    let title = "🤖 OpenAI API Error";
    let message = "";
    let action = "";

    switch (error.code) {
      case "insufficient_quota":
        title = "💰 Quota Exceeded";
        message = "Your OpenAI account has exceeded its quota.";
        action =
          "Please check your plan and billing details at platform.openai.com";
        break;

      case "invalid_api_key":
        title = "🔑 Invalid API Key";
        message = "The OpenAI API key is invalid or incorrect.";
        action = "Please check your API key in the extension settings";
        break;

      case "rate_limit_exceeded":
        title = "⏱️ Rate Limit Exceeded";
        message = "You've exceeded the rate limit for API calls.";
        action = "Please wait a few minutes and try again";
        break;

      case "model_not_found":
        title = "🤖 Model Not Available";
        message = "The selected model is not available on your account.";
        action = "Please try switching to gpt-3.5-turbo in the extension popup";
        break;

      case "billing_not_active":
        title = "💳 Billing Required";
        message = "Your OpenAI account requires billing setup.";
        action = "Please add a payment method at platform.openai.com";
        break;

      default:
        title = "🤖 OpenAI API Error";
        message = error.message || "An error occurred with the OpenAI API.";
        action = "Please check your OpenAI account status";
    }

    const alertMessage = `${title}\n\n${message}\n\n💡 ${action}\n\nThis is not an issue with our extension - it's related to your OpenAI account.`;
    alert(alertMessage);
  }

  /**
   * Make API request to OpenAI
   */
  async makeAPIRequest(prompt, apiKey, model) {
    console.log("🚀 Making API request with model:", model);
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
   * Get custom tones from storage
   */
  async getCustomTones() {
    try {
      const data = await this.getStorageData(["customTones"]);
      return data.customTones || null;
    } catch (error) {
      console.error("Error getting custom tones:", error);
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
      "Funny Sarcastic":
        "Write 2 clever, sarcastic comments that respond to the post content with humor. Make jokes about the topic, not about comment generation.",
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
        "- Make clever jokes about the post content.\n- Use sarcasm or wit related to the topic.\n- Do NOT mention comment generation or AI tools.\n- Keep it lighthearted and relevant to the post.",
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
