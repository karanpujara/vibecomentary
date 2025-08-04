// Default post tone prompts
const defaultPostTonePrompts = {
  Professional: `Create a professional post about the given topic. Use industry-specific language and maintain a business-focused tone.`,
  Casual: `Create a casual, friendly post about the given topic. Use conversational language and be approachable.`,
  Educational: `Create an educational post that teaches or shares knowledge about the given topic. Be informative and helpful.`,
  Storytelling: `Create a storytelling post that shares a personal experience or narrative related to the given topic. Be authentic and engaging.`,
  Question: `Create a post that asks thought-provoking questions about the given topic to encourage engagement and discussion.`,
  Announcement: `Create an announcement post about the given topic. Be clear, exciting, and informative.`,
  Insight: `Create an insightful post that shares a unique perspective or observation about the given topic. Be thoughtful and reflective.`,
};

// Default post tone guidelines
const defaultPostToneGuidelines = {
  Professional: `- Use professional language and industry terminology\n- Maintain credibility and authority\n- Focus on business value and insights\n- Keep tone formal but accessible`,
  Casual: `- Use conversational, friendly language\n- Be approachable and relatable\n- Include personal touches when appropriate\n- Keep tone warm and engaging`,
  Educational: `- Focus on teaching and sharing knowledge\n- Use clear, simple explanations\n- Include practical tips or examples\n- Be helpful and informative`,
  Storytelling: `- Share personal experiences or narratives\n- Be authentic and genuine\n- Create emotional connection\n- Use descriptive language`,
  Question: `- Ask thought-provoking questions\n- Encourage audience engagement\n- Avoid yes/no questions\n- Spark meaningful discussion`,
  Announcement: `- Be clear and direct\n- Share exciting news or updates\n- Include relevant details\n- Maintain enthusiasm`,
  Insight: `- Share unique perspectives\n- Offer thoughtful observations\n- Encourage deeper thinking\n- Be reflective and analytical`,
};

// Default post tone emojis
const defaultPostToneEmojis = {
  Professional: "💼",
  Casual: "😊",
  Educational: "📚",
  Storytelling: "📖",
  Question: "❓",
  Announcement: "📢",
  Insight: "💡",
};

// Default template
const defaultTemplate = {
  name: "Key points - One liners",
  sampleFormat: `In the AI era, distribution is the difference between innovation and obscurity.

Businesses are harnessing AI, but the real challenge lies in distribution strategies. Here's why it matters 👇

AI can create groundbreaking products, but without strategic distribution, they're just ideas.

Distribution channels need to be agile, responsive, and tech-savvy.

I've engaged with numerous industry leaders.

They're not just developing AI solutions. They're redefining how these solutions reach consumers.

Distribution is now a blend of technology and strategy.

Traditionally strong channels are evolving.

AI-driven analytics are transforming supply chains, optimizing delivery routes, and predicting market demands.

Yet, many organizations overlook distribution in their AI strategies.

A product that can't reach its audience is a missed opportunity.

And as AI continues to advance, so does the complexity of distribution networks.

This isn't just logistics.

It's about ensuring that innovative products find the right market at the right time.

AI's impact on distribution also means jobs are changing.

Roles are shifting towards data-driven decision-making.

Skills in AI and distribution are becoming intertwined.

The future workforce needs to adapt.

Start investing in distribution strategy now.

Train your teams to understand and leverage AI in distribution.

This is how you stay competitive.

Leaders, it's time to act.

Invest in AI-informed distribution strategies.

They're not just a nice to have; they're essential.`,
};

// Platform-specific length configurations
const platformLengthConfigs = {
  linkedin: {
    short: { min: 200, max: 500, target: 350 },
    medium: { min: 800, max: 1500, target: 1200 },
    long: { min: 1500, max: 3000, target: 2500 },
  },
  x: {
    short: { min: 50, max: 100, target: 75 },
    medium: { min: 100, max: 200, target: 150 },
    long: { min: 200, max: 280, target: 250 },
  },
  farcaster: {
    short: { min: 100, max: 200, target: 150 },
    medium: { min: 200, max: 320, target: 260 },
    long: { min: 320, max: 320, target: 320 },
  },
};

// Create Post functionality
class CreatePostManager {
  constructor() {
    this.selectedPlatform = "linkedin";
    this.characterLimits = {
      linkedin: 3000,
      x: 280,
      farcaster: 320,
    };
    this.editingTemplateName = null; // Track which template is being edited
    this.init();
  }

  init() {
    console.log("CreatePostManager init() called");

    this.setupEventListeners();
    this.loadUserProfile();
    this.updateToneDropdown();
    this.initTemplates().then(() => {
      // Update dropdown after templates are initialized
      setTimeout(() => {
        this.updateWritingStyleDropdown();
      }, 500); // Add delay to ensure DOM is ready
    });

    // Initialize submenu states
    this.initSubmenuStates();

    // Initialize other components
    this.updateLengthInfo();
    this.initPostToneSetup();

    // Check if a template is already selected and display it
    setTimeout(() => {
      const selectedTemplate = document.getElementById("writingStyle")?.value;
      if (selectedTemplate) {
        console.log("Template already selected on init:", selectedTemplate);
        this.handleTemplateSelection();
      }
    }, 500);

    // Initialize the generate button with the correct click handler
    const generateBtn = document.getElementById("generateBtn");
    if (generateBtn) {
      generateBtn.onclick = () => this.generatePost();
    }

    console.log("CreatePostManager init() completed");
  }

  setupEventListeners() {
    // Navbar navigation
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        // Don't trigger navigation if clicking the toggle icon
        if (e.target.classList.contains("nav-toggle")) {
          return;
        }
        this.switchPanel(e.currentTarget.dataset.panel);
      });
    });

    // Toggle icon clicks for submenu visibility
    document.querySelectorAll(".nav-toggle").forEach((toggle) => {
      toggle.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent triggering nav-item click

        const navItem = toggle.closest(".nav-item");
        const submenu = navItem.nextElementSibling;

        if (submenu && submenu.classList.contains("nav-submenu")) {
          const isCollapsed = submenu.classList.contains("collapsed");

          if (isCollapsed) {
            // Expand submenu
            submenu.classList.remove("collapsed");
            toggle.textContent = "➖";
            toggle.classList.add("expanded");
          } else {
            // Collapse submenu
            submenu.classList.add("collapsed");
            toggle.textContent = "➕";
            toggle.classList.remove("expanded");
          }
        }
      });
    });

    // Submenu navigation
    document.querySelectorAll(".nav-submenu-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        const panel = e.currentTarget.dataset.panel;
        const postTab = e.currentTarget.dataset.postTab;
        const templateTab = e.currentTarget.dataset.templateTab;

        console.log("Submenu clicked:", { panel, postTab, templateTab });
        console.log("Current target:", e.currentTarget);

        // Add active state to the clicked submenu item
        document.querySelectorAll(".nav-submenu-item").forEach((subItem) => {
          subItem.classList.remove("active");
        });
        e.currentTarget.classList.add("active");

        this.switchPanel(panel, postTab, templateTab);
      });
    });

    // Platform selection
    document.querySelectorAll(".platform-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.selectPlatform(e.target.dataset.platform);
      });
    });

    // Form submission
    const createPostForm = document.getElementById("createPostForm");
    if (createPostForm) {
      createPostForm.addEventListener("submit", (e) => {
        e.preventDefault();
        console.log("Form submitted, calling generatePost...");
        console.log("Form submission event target:", e.target);
        console.log("Form submission event type:", e.type);
        this.generatePost();
      });
    } else {
      console.error("createPostForm not found!");
    }

    // Note: Button click handler is managed by showLoading() function
    // to allow for cancel functionality during generation

    // Copy button
    document.getElementById("copyBtn").addEventListener("click", () => {
      this.copyPost();
    });

    // Regenerate button
    document.getElementById("regenerateBtn").addEventListener("click", () => {
      this.generatePost();
    });

    // Post content textarea - update character count as user edits
    const postContent = document.getElementById("postContent");
    if (postContent) {
      postContent.addEventListener("input", () => {
        this.updateCharacterCount();
      });
    }

    // Tone dropdown change - update template display
    const toneSelect = document.getElementById("tone");
    if (toneSelect) {
      toneSelect.addEventListener("change", () => {
        // Only update template content if a post is already generated
        const postContent = document.getElementById("postContent");
        const hasGeneratedPost =
          postContent && postContent.value.trim().length > 0;

        if (hasGeneratedPost) {
          const selectedTemplate =
            document.getElementById("writingStyle").value;
          if (selectedTemplate && selectedTemplate !== "no-template") {
            chrome.storage.local.get(["templates"], (result) => {
              const templates = result.templates || {};
              const template = templates[selectedTemplate];
              if (template && template.sampleFormat) {
                const existingTemplateSample =
                  document.querySelector(".template-sample");
                if (existingTemplateSample) {
                  // Just update the content, don't create new section
                  const formattedContent = template.sampleFormat
                    .replace(/\n/g, "<br>")
                    .replace(/\s{2,}/g, "&nbsp;&nbsp;");

                  existingTemplateSample.innerHTML = `
                    <div style="margin-top: 15px; padding: 15px; background: white; border: 1px solid #e9ecef; border-radius: 6px; max-height: 200px; overflow: hidden;">
                      <div style="font-weight: 600; color: #333; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #e0e0e0;">
                        📋 Template: ${selectedTemplate}
                      </div>
                      <div style="white-space: pre-wrap; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #444; font-size: 14px; max-height: 120px; overflow-y: auto;">
                        ${formattedContent}
                      </div>
                    </div>
                  `;
                }
              }
            });
          }
        }
        // Remove the call to handleTemplateSelection() that was causing the issue
      });
    }

    // Update tone dropdown with custom tones
    this.updateToneDropdown();

    // Set up post tone event listeners immediately
    this.setupPostToneEventListeners();

    // Set up model selection event listener
    const modelSelect = document.getElementById("modelSelect");
    if (modelSelect) {
      modelSelect.addEventListener("change", () => {
        chrome.storage.local.set({ createPostModel: modelSelect.value }, () => {
          console.log(
            "✅ Create post model preference saved:",
            modelSelect.value
          );
        });
      });
    }

    // Set up length selection event listener
    const lengthSelect = document.getElementById("lengthSelect");
    if (lengthSelect) {
      lengthSelect.addEventListener("change", () => {
        this.updateLengthInfo();
        // Update character count when length changes
        this.updateCharacterCount();
      });
    }

    // Initialize length info
    this.updateLengthInfo();

    // Templates form event listeners
    this.setupTemplateEventListeners();
  }

  switchPanel(panelName, postTab = null, templateTab = null) {
    // Hide all panels
    document.querySelectorAll(".content-panel").forEach((panel) => {
      panel.classList.remove("active");
    });

    // Remove active state from all nav items and submenu items
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active");
    });
    document.querySelectorAll(".nav-submenu-item").forEach((item) => {
      item.classList.remove("active");
    });

    // Add active state to the selected nav item
    const selectedNavItem = document.querySelector(
      `[data-panel="${panelName}"]`
    );
    if (selectedNavItem) {
      selectedNavItem.classList.add("active");
    }

    // Show selected panel
    document.getElementById(`${panelName}-panel`).classList.add("active");

    // If switching to tone-setup panel
    if (panelName === "tone-setup") {
      // Initialize post tone setup if not already done
      this.initPostToneSetup();

      // If a specific tab is requested, switch to it
      if (postTab) {
        // Immediate switch for better responsiveness
        console.log("Switching to post tab from submenu:", postTab);
        this.switchPostTab(postTab);
      } else {
        // Default to first tab if no specific tab requested
        console.log("Defaulting to first post tab");
        this.switchPostTab("post-tones");
      }
    }

    // If switching to templates panel
    if (panelName === "templates") {
      // Initialize templates if not already done
      this.initTemplates();

      // If a specific tab is requested, switch to it
      if (templateTab) {
        this.switchTemplateTab(templateTab);
      } else {
        // Default to first tab if no specific tab requested
        this.switchTemplateTab("writing-styles");
      }
    }
  }

  selectPlatform(platform) {
    this.selectedPlatform = platform;

    // Update UI
    document.querySelectorAll(".platform-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    document
      .querySelector(`[data-platform="${platform}"]`)
      .classList.add("active");

    // Update length info for the new platform
    this.updateLengthInfo();

    // Update character count if post is generated
    this.updateCharacterCount();
  }

  async loadUserProfile() {
    try {
      const result = await chrome.storage.local.get([
        "userProfileName",
        "createPostModel",
      ]);
      this.userProfileName = result.userProfileName || "Your Name";

      // Load saved create post model preference (separate from main extension)
      const modelSelect = document.getElementById("modelSelect");
      if (modelSelect) {
        modelSelect.value = result.createPostModel || "gpt-3.5-turbo";
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      this.userProfileName = "Your Name";
    }
  }

  updateToneDropdown() {
    chrome.storage.local.get(["customPostTones"], (result) => {
      const customPostTones = result.customPostTones || {};
      const toneSelect = document.getElementById("tone");

      // Keep existing default options
      const defaultOptions = Array.from(toneSelect.options);

      // Clear and re-add default options
      toneSelect.innerHTML = "";
      defaultOptions.forEach((option) => {
        toneSelect.appendChild(option);
      });

      // Track existing values to prevent duplicates
      const existingValues = new Set();
      Array.from(toneSelect.options).forEach((option) => {
        existingValues.add(option.value);
      });

      // Add custom post tones (avoiding duplicates)
      Object.keys(customPostTones).forEach((toneName) => {
        // Skip if this tone name already exists
        if (existingValues.has(toneName)) {
          console.log("Skipping duplicate tone:", toneName);
          return;
        }

        const customTone = customPostTones[toneName];
        const option = document.createElement("option");
        option.value = toneName;
        option.textContent = `${customTone.emoji} ${toneName}`;
        toneSelect.appendChild(option);
        existingValues.add(toneName); // Add to set to prevent future duplicates
      });
    });
  }

  updateLengthInfo() {
    const lengthSelect = document.getElementById("lengthSelect");
    const lengthInfo = document.getElementById("lengthInfo");

    if (!lengthSelect || !lengthInfo) return;

    const selectedLength = lengthSelect.value;
    const platformConfig = platformLengthConfigs[this.selectedPlatform];

    if (platformConfig && platformConfig[selectedLength]) {
      const config = platformConfig[selectedLength];
      const platformName = this.getPlatformDisplayName();

      lengthInfo.textContent = `${
        selectedLength.charAt(0).toUpperCase() + selectedLength.slice(1)
      }: ~${config.max} characters (${platformName})`;
    }
  }

  getLengthConfig() {
    const lengthSelect = document.getElementById("lengthSelect");
    const selectedLength = lengthSelect ? lengthSelect.value : "medium";
    const platformConfig = platformLengthConfigs[this.selectedPlatform];

    return platformConfig && platformConfig[selectedLength]
      ? platformConfig[selectedLength]
      : { min: 100, max: 500, target: 300 };
  }

  async generatePost() {
    console.log("generatePost function called!");

    const topic = document.getElementById("topic").value.trim();
    const tone = document.getElementById("tone").value;
    const selectedTemplate = document.getElementById("writingStyle").value;

    console.log("Form values:", { topic, tone, selectedTemplate });

    if (!topic || !tone) {
      this.showNotification("Please fill in topic and tone.", "error");
      return;
    }

    console.log("Starting post generation with:", {
      topic,
      tone,
      selectedTemplate,
    });

    // Show loading state
    this.showLoading(true);
    this.hideGeneratedPost();

    try {
      // Get API key and selected model
      const result = await chrome.storage.local.get([
        "vibeOpenAIKey",
        "templates",
      ]);
      const apiKey = result.vibeOpenAIKey;
      const templates = result.templates || {};
      const model =
        document.getElementById("modelSelect").value || "gpt-3.5-turbo";

      console.log("Retrieved data:", {
        hasApiKey: !!apiKey,
        apiKeyStartsWith: apiKey?.substring(0, 5),
        templateCount: Object.keys(templates).length,
        model,
      });

      if (!apiKey || !apiKey.startsWith("sk-")) {
        throw new Error(
          "Please configure your OpenAI API key in settings first."
        );
      }

      let post;

      // Check if a template is selected (not placeholder and not "no-template")
      if (
        selectedTemplate &&
        selectedTemplate !== "no-template" &&
        templates[selectedTemplate]
      ) {
        // Get the selected template
        const template = templates[selectedTemplate];
        console.log("Template found:", selectedTemplate);

        // Generate post using the topic content and template format
        post = await this.createPostWithTemplate(
          apiKey,
          topic,
          tone,
          template,
          model
        );
      } else {
        // No template selected or "Don't include Template" selected
        console.log("No template selected, generating post without template");
        post = await this.createPostWithoutTemplate(apiKey, topic, tone, model);
      }

      console.log("Post generated successfully, displaying...");

      // Display result
      this.displayGeneratedPost(post, selectedTemplate || null);
    } catch (error) {
      console.error("Error generating post:", error);
      const errorMessage = this.getUserFriendlyErrorMessage(error);
      this.showNotification(errorMessage, "error");
    } finally {
      console.log("Finishing post generation, hiding loading...");
      this.showLoading(false);
    }
  }

  async createPostWithTemplate(apiKey, topic, tone, template, model) {
    try {
      const platformName = this.getPlatformDisplayName();
      const lengthConfig = this.getLengthConfig();
      const characterLimit = lengthConfig.max; // Define characterLimit here

      console.log("Creating post with template:", {
        platformName,
        characterLimit,
        model,
        topic: topic.substring(0, 50) + "...",
      });

      const prompt = await this.buildPostPrompt(
        topic,
        tone,
        template.sampleFormat, // Use the sample format as the writing style
        platformName,
        characterLimit
      );

      console.log("Prompt built, making API call...");

      // Add timeout to prevent infinite loading
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
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
                  "You are an expert social media content creator. Create engaging, platform-appropriate posts that are authentic and valuable to the audience. ALWAYS respect character limits strictly.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            max_tokens: Math.min(500, Math.floor(characterLimit * 0.4)), // Limit tokens to help enforce character limit
            temperature: 0.7,
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      console.log("API response received:", response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error("API Error:", error);

        // Create a more specific error with status code and details
        const errorMessage = error.error?.message || "Unknown error";
        const statusCode = response.status;

        let specificError;
        if (statusCode === 401) {
          specificError = new Error(
            "Invalid API key. Please check your OpenAI API key in settings."
          );
        } else if (statusCode === 403) {
          specificError = new Error(
            "Access forbidden. Please check your OpenAI API key permissions."
          );
        } else if (statusCode === 429) {
          specificError = new Error(
            "Rate limit reached. Please wait a moment and try again."
          );
        } else if (statusCode === 500) {
          specificError = new Error(
            "OpenAI service temporarily unavailable. Please try again later."
          );
        } else {
          specificError = new Error(
            `API Error (${statusCode}): ${errorMessage}`
          );
        }

        throw specificError;
      }

      const data = await response.json();
      console.log("API data received:", data);

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("Invalid response format from OpenAI API");
      }

      const generatedPost = data.choices[0].message.content.trim();
      console.log("Post generated successfully, length:", generatedPost.length);

      return this.cleanPostContent(generatedPost);
    } catch (error) {
      console.error("Error in createPostWithTemplate:", error);
      if (error.name === "AbortError") {
        throw new Error("Request timed out. Please try again.");
      }
      throw error;
    }
  }

  async buildPostPrompt(
    topic,
    tone,
    templateFormat,
    platformName,
    characterLimit
  ) {
    // Get stored post tone data
    const result = await chrome.storage.local.get([
      "postTonePrompts",
      "postToneGuidelines",
      "customPostTones",
    ]);
    const postTonePrompts = result.postTonePrompts || {};
    const postToneGuidelines = result.postToneGuidelines || {};
    const customPostTones = result.customPostTones || {};

    // Get prompt and guideline for the selected tone
    let prompt, guideline;

    if (customPostTones[tone]) {
      // Custom tone
      prompt = customPostTones[tone].prompt;
      guideline = customPostTones[tone].guideline;
    } else {
      // Default tone
      prompt =
        postTonePrompts[tone] ||
        defaultPostTonePrompts[tone] ||
        this.getToneInstructions(tone);
      guideline =
        postToneGuidelines[tone] || defaultPostToneGuidelines[tone] || "";
    }

    // Get length configuration
    const lengthConfig = this.getLengthConfig();
    const lengthSelect = document.getElementById("lengthSelect");
    const selectedLength = lengthSelect ? lengthSelect.value : "medium";

    // Determine hashtag strategy based on platform and tone
    const hashtagStrategy = this.getHashtagStrategy(platformName, tone);

    return `Create a ${selectedLength} post for ${platformName} about "${topic}".

CRITICAL: You are writing about "${topic}". The template below is ONLY to show you the desired FORMAT (short lines, line breaks, etc.). DO NOT copy ANY words, phrases, or ideas from it.

TEMPLATE FORMAT REFERENCE (for structure only):
${templateFormat}

REQUIREMENTS:
- Topic: "${topic}"
- Tone: ${tone}
- Platform: ${platformName}
- Length: ${characterLimit} characters maximum
- Format: Use short lines and line breaks like the template
- Content: Write COMPLETELY ORIGINAL content about "${topic}"

TONE GUIDELINES:
- ${prompt}
- ${guideline}

PLATFORM STYLE: ${this.getPlatformStyle()}
HASHTAGS: ${hashtagStrategy}

INSTRUCTIONS:
1. Write about "${topic}" using your own ideas and insights
2. Use short lines and line breaks for readability
3. Do not copy any words, phrases, or concepts from the template
4. Create fresh, engaging content about "${topic}"
5. Stay within ${characterLimit} characters

Generate your post about "${topic}":`;
  }

  getToneInstructions(tone) {
    const instructions = {
      Professional:
        "Use a professional, business-focused tone. Include industry insights and maintain credibility.",
      Casual:
        "Use a friendly, conversational tone. Be approachable and relatable.",
      Educational:
        "Focus on teaching or sharing knowledge. Be informative and helpful.",
      Storytelling:
        "Tell a personal story or experience. Be authentic and engaging.",
      Question:
        "Ask thought-provoking questions to encourage engagement and discussion.",
      Announcement:
        "Make an announcement or share news. Be clear and exciting.",
      Insight:
        "Share a unique perspective or observation. Be thoughtful and reflective.",
    };

    return instructions[tone] || "Use an engaging and authentic tone.";
  }

  getPlatformStyle() {
    const styles = {
      linkedin: "Professional, industry-focused, business-oriented",
      x: "Concise, engaging, hashtag-friendly",
      farcaster: "Community-focused, authentic, conversational",
    };

    return styles[this.selectedPlatform] || "Engaging and platform-appropriate";
  }

  getPlatformDisplayName() {
    const names = {
      linkedin: "LinkedIn",
      x: "X (Twitter)",
      farcaster: "Farcaster",
    };

    return names[this.selectedPlatform] || "social media";
  }

  getHashtagStrategy(platformName, tone) {
    // Platform-specific hashtag strategies
    const platformStrategies = {
      "X (Twitter)": {
        default: "Use 1-2 relevant hashtags only if they add value to the post",
        Professional: "Avoid hashtags unless discussing industry trends",
        Casual: "Use 1-2 casual hashtags if natural",
        Educational: "Use 1-2 educational hashtags if relevant",
        Storytelling: "Avoid hashtags to keep story authentic",
        Question: "Avoid hashtags to encourage natural discussion",
        Announcement:
          "Use 1-2 relevant hashtags if announcing something specific",
        Insight: "Avoid hashtags to keep focus on the insight",
      },
      LinkedIn: {
        default:
          "Use 2-3 professional hashtags only if discussing industry topics",
        Professional: "Use 2-3 industry-relevant hashtags",
        Casual: "Avoid hashtags to keep it personal",
        Educational: "Use 2-3 educational hashtags if teaching something",
        Storytelling: "Avoid hashtags to keep story authentic",
        Question: "Avoid hashtags to encourage natural discussion",
        Announcement: "Use 2-3 relevant hashtags for announcements",
        Insight: "Use 1-2 hashtags if sharing industry insights",
      },
      Farcaster: {
        default: "Avoid hashtags to keep it community-focused",
        Professional: "Avoid hashtags",
        Casual: "Avoid hashtags",
        Educational: "Avoid hashtags",
        Storytelling: "Avoid hashtags",
        Question: "Avoid hashtags",
        Announcement: "Avoid hashtags",
        Insight: "Avoid hashtags",
      },
    };

    const platformStrategy =
      platformStrategies[platformName] || platformStrategies["X (Twitter)"];
    return platformStrategy[tone] || platformStrategy.default;
  }

  cleanPostContent(content) {
    // Remove any AI-generated prefixes or labels
    return content
      .replace(/^(Post|Content|Generated Post):\s*/gi, "")
      .replace(/^(Here's your|Here is your|Here's a|Here is a)\s+/gi, "")
      .trim();
  }

  displayGeneratedPost(post, templateName = null) {
    document.getElementById("postContent").value = post;
    this.updateCharacterCount();
    document.getElementById("generatedPost").style.display = "block";

    // Hide the placeholder area completely after post generation
    const placeholder = document.getElementById("placeholder");
    if (placeholder) {
      placeholder.style.display = "none";
    }

    // Remove any existing template indicator
    const existingIndicator = document.querySelector(".template-indicator");
    if (existingIndicator) {
      existingIndicator.remove();
    }

    // Add template sample directly below the generated post if template was used
    if (templateName) {
      // Get the template sample format
      chrome.storage.local.get(["templates"], (result) => {
        const templates = result.templates || {};
        const template = templates[templateName];

        if (template && template.sampleFormat) {
          // Create template preview card at the bottom
          const outputSection = document.querySelector(".output-section");
          if (outputSection) {
            // Remove any existing template cards
            const existingTemplateCards = outputSection.querySelectorAll(
              ".template-preview-card"
            );
            existingTemplateCards.forEach((card) => card.remove());

            // Create new template card
            const templateCard = document.createElement("div");
            templateCard.className = "template-preview-card";
            templateCard.style.cssText = `
              margin-top: 40px;
              padding: 15px;
              background: white;
              border: 1px solid #e9ecef;
              border-radius: 6px;
              max-height: 200px;
              overflow: hidden;
            `;

            // Format the sample format to preserve line breaks and formatting
            const formattedContent = template.sampleFormat
              .replace(/\n/g, "<br>")
              .replace(/\s{2,}/g, "&nbsp;&nbsp;"); // Preserve multiple spaces

            templateCard.innerHTML = `
              <div style="font-weight: 600; color: #333; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #e0e0e0;">
                📋 Template: ${templateName}
              </div>
              <div style="white-space: pre-wrap; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #444; font-size: 14px; max-height: 120px; overflow-y: auto;">
                ${formattedContent}
              </div>
            `;

            // Add template card after the generated post
            outputSection.appendChild(templateCard);
          }
        }
      });
    }
  }

  restoreTemplateDisplay() {
    const selectedTemplate = document.getElementById("writingStyle").value;
    const generatedPost = document.getElementById("generatedPost");
    const placeholder = document.getElementById("placeholder");
    const postContent = document.getElementById("postContent");

    // Check if a post has been generated (more reliable detection)
    const hasGeneratedPost = postContent && postContent.value.trim().length > 0;

    if (hasGeneratedPost) {
      // Post has been generated, update the existing template sample
      if (selectedTemplate && selectedTemplate !== "no-template") {
        // Get the template sample format
        chrome.storage.local.get(["templates"], (result) => {
          const templates = result.templates || {};
          const template = templates[selectedTemplate];

          if (template && template.sampleFormat) {
            // Find existing template sample
            const existingTemplateSample =
              document.querySelector(".template-sample");

            // Format the sample format to preserve line breaks and formatting
            const formattedContent = template.sampleFormat
              .replace(/\n/g, "<br>")
              .replace(/\s{2,}/g, "&nbsp;&nbsp;");

            if (existingTemplateSample) {
              // Update existing template sample
              existingTemplateSample.innerHTML = `
                    <div style="margin-top: 15px; padding: 15px; background: white; border: 1px solid #e9ecef; border-radius: 6px; max-height: 200px; overflow: hidden;">
                      <div style="font-weight: 600; color: #333; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #e0e0e0;">
                        📋 Template: ${selectedTemplate}
                      </div>
                      <div style="white-space: pre-wrap; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #444; font-size: 14px; max-height: 120px; overflow-y: auto;">
                        ${formattedContent}
                      </div>
                    </div>
                  `;
            } else {
              // Create new template sample if none exists
              const templateSample = document.createElement("div");
              templateSample.className = "template-sample";
              templateSample.innerHTML = `
                <div style="margin-top: 15px; padding: 15px; background: white; border: 1px solid #e9ecef; border-radius: 6px; max-height: 300px; overflow: hidden;">
                  <div style="font-weight: 600; color: #333; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #e0e0e0;">
                    📋 Template: ${selectedTemplate}
                  </div>
                  <div style="white-space: pre-wrap; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #444; font-size: 14px; max-height: 220px; overflow-y: auto;">
                    ${formattedContent}
                  </div>
                </div>
              `;
              generatedPost.appendChild(templateSample);
            }
          }
        });
      } else {
        // No template selected, remove any existing template samples
        const existingTemplateSamples =
          document.querySelectorAll(".template-sample");
        existingTemplateSamples.forEach((sample) => sample.remove());
      }
    } else {
      // No post generated yet, update the placeholder area
      if (selectedTemplate && selectedTemplate !== "no-template") {
        this.handleTemplateSelection();
      } else {
        // Clear the placeholder if no template selected
        if (placeholder) {
          placeholder.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 60px 20px; height: 300px; background: white; border: 1px solid #e9ecef; border-radius: 6px; margin: 0;">
              <h3 style="margin: 0 0 20px 0; color: rgb(139, 92, 246); font-size: 18px;">📝 Ready to Craft</h3>
              <p style="font-size: 16px; margin: 0 0 25px 0; color: #666; line-height: 1.5;">
                Fill in the form on the left and click "Craft Post" to<br>
                create your content.
              </p>
              <div style="font-size: 48px; margin: 0 0 25px 0; opacity: 0.6;">✨</div>
              <p style="font-size: 14px; color: #888; margin: 0;">
                Your crafted post will appear here
              </p>
            </div>
          `;
          placeholder.style.display = "block";
        }
      }
    }
  }

  updateCharacterCount() {
    const postContent = document.getElementById("postContent").value;
    const characterCount = postContent.length;
    const lengthConfig = this.getLengthConfig();
    const limit = lengthConfig.max;

    const countElement = document.getElementById("characterCount");
    countElement.textContent = `${characterCount}/${limit} characters`;

    // Update color based on usage
    countElement.className = "character-count";
    if (characterCount > limit) {
      countElement.classList.add("error");
    } else if (characterCount > limit * 0.9) {
      countElement.classList.add("warning");
    }
  }

  async copyPost() {
    const postContent = document.getElementById("postContent").value;

    try {
      await navigator.clipboard.writeText(postContent);

      // Show success feedback
      const copyBtn = document.getElementById("copyBtn");
      const originalText = copyBtn.textContent;
      copyBtn.textContent = "✅ Copied!";
      copyBtn.style.backgroundColor = "#28a745";

      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.backgroundColor = "";
      }, 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      alert("Failed to copy post. Please copy manually.");
    }
  }

  showLoading(show) {
    const generateBtn = document.getElementById("generateBtn");
    const placeholder = document.getElementById("placeholder");
    const generatedPost = document.getElementById("generatedPost");

    if (show) {
      generateBtn.disabled = true;
      generateBtn.textContent = "⏳ Crafting...";
      generateBtn.onclick = () => this.stopLoading(); // Allow canceling

      // Replace placeholder content with loading animation instead of hiding
      if (placeholder) {
        placeholder.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 60px 20px; min-height: 300px; background: white; border-radius: 6px; margin: 0;">
            <div style="font-size: 24px; color: rgb(139, 92, 246); margin-bottom: 20px;">Crafting...</div>
            <div class="magic-writing-animation" style="margin-bottom: 20px;">
              <div class="pencil-container">
                <div class="pencil" style="font-size: 32px;">✏️</div>
                <div class="pencil-trail" style="width: 60px; height: 2px; background: linear-gradient(90deg, #ff6b6b, #4ecdc4); margin: 10px auto;"></div>
              </div>
              <div class="sparkles" style="margin: 15px 0;">
                <span class="sparkle" style="font-size: 20px; margin: 0 5px;">✨</span>
                <span class="sparkle" style="font-size: 20px; margin: 0 5px;">⭐</span>
                <span class="sparkle" style="font-size: 20px; margin: 0 5px;">💫</span>
                <span class="sparkle" style="font-size: 20px; margin: 0 5px;">🌟</span>
                <span class="sparkle" style="font-size: 20px; margin: 0 5px;">✨</span>
              </div>
            </div>
            <p style="color: #666; font-size: 14px; margin: 0;">
              ✨ Crafting your perfect post with AI magic ✨
            </p>
          </div>
        `;
      }

      generatedPost.style.display = "none";

      // Force restart animations
      setTimeout(() => {
        const pencil = placeholder.querySelector(".pencil");
        const pencilTrail = placeholder.querySelector(".pencil-trail");
        const sparkles = placeholder.querySelectorAll(".sparkle");

        if (pencil) {
          pencil.style.animation = "none";
          pencil.offsetHeight; // Trigger reflow
          pencil.style.animation = "pencilWrite 2s ease-in-out infinite";
        }

        if (pencilTrail) {
          pencilTrail.style.animation = "none";
          pencilTrail.offsetHeight; // Trigger reflow
          pencilTrail.style.animation = "pencilTrail 2s ease-in-out infinite";
        }

        sparkles.forEach((sparkle, index) => {
          sparkle.style.animation = "none";
          sparkle.offsetHeight; // Trigger reflow
          sparkle.style.animation = `sparkleFloat 3s ease-in-out infinite`;
          sparkle.style.animationDelay = `${index * 0.5}s`;
        });
      }, 100);
    } else {
      generateBtn.disabled = false;
      generateBtn.textContent = "✨ Craft Post";
      generateBtn.onclick = () => this.generatePost(); // Restore normal function

      // Check if there's a generated post to show
      const postContent = document.getElementById("postContent");
      const hasGeneratedPost =
        postContent && postContent.value.trim().length > 0;

      if (hasGeneratedPost) {
        // If there's a generated post, show it and hide placeholder
        if (generatedPost) generatedPost.style.display = "block";
        if (placeholder) placeholder.style.display = "none";
      } else {
        // No generated post, restore placeholder to original state
        if (placeholder) {
          placeholder.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 60px 20px; min-height: 300px; background: white; border-radius: 6px; margin: 0;">
              <div style="font-size: 48px; color: #e0e0e0; margin-bottom: 20px;">✨</div>
              <h3 style="color: #666; margin-bottom: 10px; font-size: 18px;">Your AI-Generated Post</h3>
              <p style="color: #999; font-size: 14px; margin: 0;">
                Click "Craft Post" to generate your perfect social media post
              </p>
            </div>
          `;
        }

        // Show placeholder and hide generated post
        if (placeholder) placeholder.style.display = "block";
        if (generatedPost) generatedPost.style.display = "none";
      }
    }
  }

  stopLoading() {
    console.log("User canceled generation");
    this.showLoading(false);
    this.showNotification("Post generation canceled.", "info");
  }

  hideGeneratedPost() {
    document.getElementById("generatedPost").style.display = "none";
    document.getElementById("placeholder").style.display = "block";
  }

  // Post Tone Setup Methods
  initPostToneSetup() {
    this.setupPostToneEventListeners();
    this.updatePostTonesGrid();
    this.updateAddPostToneCustomTonesGrid();
    this.initPostEmojiPicker();
  }

  setupPostToneEventListeners() {
    console.log("Setting up post tone event listeners...");

    // Post tab switching
    document.querySelectorAll(".post-tab").forEach((tab) => {
      console.log("Adding click listener to tab:", tab.dataset.postTab);
      tab.addEventListener("click", (e) => {
        console.log("Tab clicked:", e.currentTarget.dataset.postTab);
        this.switchPostTab(e.currentTarget.dataset.postTab);
      });
    });

    // Custom post tone creation
    const createBtn = document.getElementById("createCustomPostToneBtn");
    if (createBtn) {
      createBtn.addEventListener("click", () => {
        console.log("Create custom post tone clicked");
        this.createCustomPostTone();
      });
    }

    const clearBtn = document.getElementById("clearCustomPostToneBtn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        console.log("Clear custom post tone clicked");
        this.clearCustomPostToneForm();
      });
    }

    // Bulk actions
    const saveAllBtn = document.getElementById("saveAllPostTonesBtn");
    if (saveAllBtn) {
      saveAllBtn.addEventListener("click", () => {
        console.log("Save all post tones clicked");
        this.saveAllPostTones();
      });
    }

    const resetAllBtn = document.getElementById("resetAllPostTonesBtn");
    if (resetAllBtn) {
      resetAllBtn.addEventListener("click", () => {
        console.log("Reset all post tones clicked");
        this.resetAllPostTones();
      });
    }

    console.log("Post tone event listeners setup complete");
  }

  switchPostTab(tabName) {
    console.log("Switching to post tab:", tabName);

    // Simple approach: directly target the tabs by their data attributes
    const tabs = document.querySelectorAll(".post-tab");
    tabs.forEach((tab) => {
      const tabData = tab.getAttribute("data-post-tab");
      if (tabData === tabName) {
        // This is the active tab
        tab.classList.add("active");
        tab.style.backgroundColor = "#667eea";
        tab.style.color = "#ffffff";
        tab.style.borderBottom = "3px solid #667eea";
        tab.style.fontWeight = "bold";
        console.log("Activated tab:", tabData);
      } else {
        // This is not the active tab
        tab.classList.remove("active");
        tab.style.backgroundColor = "";
        tab.style.color = "";
        tab.style.borderBottom = "";
        tab.style.fontWeight = "";
        console.log("Deactivated tab:", tabData);
      }
    });

    // Update submenu active state
    document.querySelectorAll(".nav-submenu-item").forEach((item) => {
      const itemData = item.getAttribute("data-post-tab");
      if (itemData === tabName) {
        item.classList.add("active");
        console.log("Activated submenu item:", itemData);
      } else {
        item.classList.remove("active");
        console.log("Deactivated submenu item:", itemData);
      }
    });

    // Hide all tab contents and show the selected one
    const contents = document.querySelectorAll(".post-tab-content");
    contents.forEach((content) => {
      if (content.id === tabName) {
        content.classList.add("active");
        console.log("Activated content:", content.id);
      } else {
        content.classList.remove("active");
        console.log("Deactivated content:", content.id);
      }
    });
  }

  updatePostTonesGrid() {
    chrome.storage.local.get(
      ["postTonePrompts", "postToneGuidelines", "customPostTones"],
      (result) => {
        const postTonePrompts = result.postTonePrompts || {};
        const postToneGuidelines = result.postToneGuidelines || {};
        const customPostTones = result.customPostTones || {};

        const grid = document.getElementById("postTonesGrid");
        grid.innerHTML = "";

        // Add default tones
        Object.keys(defaultPostTonePrompts).forEach((toneName) => {
          const card = this.createPostToneCard(
            toneName,
            defaultPostTonePrompts[toneName],
            defaultPostToneGuidelines[toneName],
            defaultPostToneEmojis[toneName],
            "default",
            postTonePrompts[toneName] || defaultPostTonePrompts[toneName],
            postToneGuidelines[toneName] || defaultPostToneGuidelines[toneName]
          );
          grid.appendChild(card);
        });

        // Add custom tones
        Object.keys(customPostTones).forEach((toneName) => {
          const customTone = customPostTones[toneName];
          const card = this.createPostToneCard(
            toneName,
            customTone.prompt,
            customTone.guideline,
            customTone.emoji,
            "custom"
          );
          grid.appendChild(card);
        });
      }
    );
  }

  createPostToneCard(
    toneName,
    prompt,
    guideline,
    emoji,
    type,
    currentPrompt = null,
    currentGuideline = null
  ) {
    const card = document.createElement("div");
    card.className = "post-tone-card";

    const currentPromptText = currentPrompt || prompt;
    const currentGuidelineText = currentGuideline || guideline;

    card.innerHTML = `
      <div class="post-tone-header">
        <span class="post-tone-emoji">${emoji}</span>
        <span class="post-tone-name">${toneName}</span>
        <span class="post-tone-type ${type}">${
      type === "default" ? "Default" : "Custom"
    }</span>
      </div>
      <div class="form-group">
        <label>Prompt:</label>
        <textarea class="post-tone-prompt" data-tone="${toneName}" rows="3">${currentPromptText}</textarea>
      </div>
      <div class="form-group">
        <label>Guideline:</label>
        <textarea class="post-tone-guideline" data-tone="${toneName}" rows="3">${currentGuidelineText}</textarea>
      </div>
      <div class="post-tone-actions">
        <button class="btn btn-primary save-post-tone" data-tone="${toneName}">Save</button>
        ${
          type === "default"
            ? `<button class="btn btn-secondary reset-post-tone" data-tone="${toneName}">Reset</button>`
            : `<button class="btn btn-danger delete-post-tone" data-tone="${toneName}">Delete</button>`
        }
      </div>
    `;

    // Add event listeners
    card.querySelector(".save-post-tone").addEventListener("click", () => {
      this.savePostTone(toneName);
    });

    if (type === "default") {
      card.querySelector(".reset-post-tone").addEventListener("click", () => {
        this.resetPostTone(toneName);
      });
    } else {
      card.querySelector(".delete-post-tone").addEventListener("click", () => {
        this.deleteCustomPostTone(toneName);
      });
    }

    return card;
  }

  savePostTone(toneName) {
    const card = document
      .querySelector(`[data-tone="${toneName}"]`)
      .closest(".post-tone-card");
    const prompt = card.querySelector(".post-tone-prompt").value;
    const guideline = card.querySelector(".post-tone-guideline").value;

    // Check if this is a custom tone or default tone
    chrome.storage.local.get(
      ["postTonePrompts", "postToneGuidelines", "customPostTones"],
      (result) => {
        const postTonePrompts = result.postTonePrompts || {};
        const postToneGuidelines = result.postToneGuidelines || {};
        const customPostTones = result.customPostTones || {};

        // If it's a custom tone, save to customPostTones
        if (customPostTones[toneName]) {
          customPostTones[toneName].prompt = prompt;
          customPostTones[toneName].guideline = guideline;
          chrome.storage.local.set({ customPostTones }, () => {
            this.updateAddPostToneCustomTonesGrid();
            alert(`✅ Custom post tone "${toneName}" saved successfully!`);
          });
        } else {
          // If it's a default tone, save to postTonePrompts/postToneGuidelines
          postTonePrompts[toneName] = prompt;
          postToneGuidelines[toneName] = guideline;
          chrome.storage.local.set(
            { postTonePrompts, postToneGuidelines },
            () => {
              alert(`✅ Post tone "${toneName}" saved successfully!`);
            }
          );
        }
      }
    );
  }

  resetPostTone(toneName) {
    chrome.storage.local.get(
      ["postTonePrompts", "postToneGuidelines"],
      (result) => {
        const postTonePrompts = result.postTonePrompts || {};
        const postToneGuidelines = result.postToneGuidelines || {};

        delete postTonePrompts[toneName];
        delete postToneGuidelines[toneName];

        chrome.storage.local.set(
          { postTonePrompts, postToneGuidelines },
          () => {
            this.updatePostTonesGrid();
            alert(`✅ Post tone "${toneName}" reset to default!`);
          }
        );
      }
    );
  }

  saveAllPostTones() {
    const cards = document.querySelectorAll(".post-tone-card");
    const postTonePrompts = {};
    const postToneGuidelines = {};

    cards.forEach((card) => {
      const toneName = card.querySelector(".post-tone-prompt").dataset.tone;
      const prompt = card.querySelector(".post-tone-prompt").value;
      const guideline = card.querySelector(".post-tone-guideline").value;

      postTonePrompts[toneName] = prompt;
      postToneGuidelines[toneName] = guideline;
    });

    chrome.storage.local.set({ postTonePrompts, postToneGuidelines }, () => {
      alert("✅ All post tones saved successfully!");
    });
  }

  resetAllPostTones() {
    if (confirm("Are you sure you want to reset all post tones to default?")) {
      chrome.storage.local.remove(
        ["postTonePrompts", "postToneGuidelines"],
        () => {
          this.updatePostTonesGrid();
          alert("✅ All post tones reset to default!");
        }
      );
    }
  }

  createCustomPostTone() {
    const name = document.getElementById("customPostToneName").value.trim();
    const emoji = document.getElementById("customPostToneEmoji").value.trim();
    const prompt = document.getElementById("customPostTonePrompt").value.trim();
    const guideline = document
      .getElementById("customPostToneGuideline")
      .value.trim();

    if (!name || !emoji || !prompt || !guideline) {
      alert("Please fill in all fields for the custom post tone.");
      return;
    }

    chrome.storage.local.get(["customPostTones"], (result) => {
      const customPostTones = result.customPostTones || {};

      if (customPostTones[name]) {
        alert("A post tone with this name already exists.");
        return;
      }

      customPostTones[name] = {
        emoji,
        prompt,
        guideline,
      };

      chrome.storage.local.set({ customPostTones }, () => {
        this.clearCustomPostToneForm();
        this.updatePostTonesGrid();
        this.updateAddPostToneCustomTonesGrid();
        alert(`✅ Custom post tone "${name}" created successfully!`);
      });
    });
  }

  clearCustomPostToneForm() {
    document.getElementById("customPostToneName").value = "";
    document.getElementById("customPostToneEmoji").value = "";
    document.getElementById("customPostTonePrompt").value = "";
    document.getElementById("customPostToneGuideline").value = "";
  }

  deleteCustomPostTone(toneName) {
    if (
      confirm(
        `Are you sure you want to delete the custom post tone "${toneName}"?`
      )
    ) {
      chrome.storage.local.get(["customPostTones"], (result) => {
        const customPostTones = result.customPostTones || {};
        delete customPostTones[toneName];

        chrome.storage.local.set({ customPostTones }, () => {
          this.updatePostTonesGrid();
          this.updateAddPostToneCustomTonesGrid();
          alert(`✅ Custom post tone "${toneName}" deleted successfully!`);
        });
      });
    }
  }

  updateAddPostToneCustomTonesGrid() {
    chrome.storage.local.get(["customPostTones"], (result) => {
      const customPostTones = result.customPostTones || {};
      const grid = document.getElementById("addPostToneCustomTonesGrid");
      grid.innerHTML = "";

      Object.keys(customPostTones).forEach((toneName) => {
        const customTone = customPostTones[toneName];
        const card = document.createElement("div");
        card.className = "post-tone-card";
        card.innerHTML = `
          <div class="post-tone-header">
            <span class="post-tone-emoji">${customTone.emoji}</span>
            <span class="post-tone-name">${toneName}</span>
            <span class="post-tone-type custom">Custom</span>
          </div>
          <div class="form-group">
            <label>Prompt:</label>
            <textarea class="post-tone-prompt" data-tone="${toneName}" rows="3">${customTone.prompt}</textarea>
          </div>
          <div class="form-group">
            <label>Guideline:</label>
            <textarea class="post-tone-guideline" data-tone="${toneName}" rows="3">${customTone.guideline}</textarea>
          </div>
          <div class="post-tone-actions">
            <button class="btn btn-primary save-post-tone" data-tone="${toneName}">Save</button>
            <button class="btn btn-danger delete-post-tone" data-tone="${toneName}">Delete</button>
          </div>
        `;

        // Event delegation for Save/Delete - same as comment tones
        card
          .querySelector(".post-tone-actions")
          .addEventListener("click", (e) => {
            if (e.target.tagName !== "BUTTON") return;
            const action = e.target.classList.contains("save-post-tone")
              ? "save"
              : "delete";
            const tName = e.target.getAttribute("data-tone");

            if (action === "save") {
              const prompt = card
                .querySelector(".post-tone-prompt")
                .value.trim();
              const guideline = card
                .querySelector(".post-tone-guideline")
                .value.trim();

              chrome.storage.local.get(["customPostTones"], (res) => {
                const cPostTones = res.customPostTones || {};
                if (cPostTones[tName]) {
                  cPostTones[tName].prompt = prompt;
                  cPostTones[tName].guideline = guideline;
                  chrome.storage.local.set(
                    { customPostTones: cPostTones },
                    () => {
                      this.updateAddPostToneCustomTonesGrid();
                      this.updatePostTonesGrid();
                      alert(`✅ ${tName} updated!`);
                    }
                  );
                }
              });
            } else if (action === "delete") {
              if (confirm(`Are you sure you want to delete "${tName}"?`)) {
                chrome.storage.local.get(["customPostTones"], (res) => {
                  const cPostTones = res.customPostTones || {};
                  delete cPostTones[tName];
                  chrome.storage.local.set(
                    { customPostTones: cPostTones },
                    () => {
                      this.updateAddPostToneCustomTonesGrid();
                      this.updatePostTonesGrid();
                      alert(`🗑️ "${tName}" deleted!`);
                    }
                  );
                });
              }
            }
          });

        grid.appendChild(card);
      });
    });
  }

  initPostEmojiPicker() {
    const emojiPickerBtn = document.getElementById("postEmojiPickerBtn");
    const emojiPickerDropdown = document.getElementById(
      "postEmojiPickerDropdown"
    );
    const emojiSearch = document.getElementById("postEmojiSearch");
    const emojiCategories = document.getElementById("postEmojiCategories");
    const emojiGrid = document.getElementById("postEmojiGrid");

    // Emoji data (simplified version)
    const emojiData = {
      Smileys: [
        "😀",
        "😃",
        "😄",
        "😁",
        "😆",
        "😅",
        "😂",
        "🤣",
        "😊",
        "😇",
        "🙂",
        "🙃",
        "😉",
        "😌",
        "😍",
        "🥰",
        "😘",
        "😗",
        "😙",
        "😚",
        "😋",
        "😛",
        "😝",
        "😜",
        "🤪",
        "🤨",
        "🧐",
        "🤓",
        "😎",
        "🤩",
        "🥳",
        "😏",
        "😒",
        "😞",
        "😔",
        "😟",
        "😕",
        "🙁",
        "☹️",
        "😣",
        "😖",
        "😫",
        "😩",
        "🥺",
        "😢",
        "😭",
        "😤",
        "😠",
        "😡",
        "🤬",
        "🤯",
        "😳",
        "🥵",
        "🥶",
        "😱",
        "😨",
        "😰",
        "😥",
        "😓",
        "🤗",
        "🤔",
        "🤭",
        "🤫",
        "🤥",
        "😶",
        "😐",
        "😑",
        "😯",
        "😦",
        "😧",
        "😮",
        "😲",
        "🥱",
        "😴",
        "🤤",
        "😪",
        "😵",
        "🤐",
        "🥴",
        "🤢",
        "🤮",
        "🤧",
        "😷",
        "🤒",
        "🤕",
      ],
      Objects: [
        "💼",
        "📚",
        "📖",
        "❓",
        "📢",
        "💡",
        "🔧",
        "🤝",
        "🎉",
        "✨",
        "🌟",
        "⭐",
        "💫",
        "🔥",
        "💥",
        "⚡",
        "💦",
        "💨",
        "💢",
        "💫",
        "💤",
        "💭",
        "💬",
        "💮",
        "💯",
        "💢",
        "💥",
        "💫",
        "💦",
        "💨",
        "💩",
        "💪",
        "🦵",
        "🦶",
        "🦷",
        "🦴",
        "👀",
        "👁️",
        "👂",
        "👃",
        "🧠",
        "🫀",
        "🫁",
        "🦿",
        "🦾",
        "🦻",
        "🦷",
        "🦴",
        "👀",
        "👁️",
        "👂",
        "👃",
        "🧠",
        "🫀",
        "🫁",
        "🦿",
        "🦾",
        "🦻",
      ],
      Nature: [
        "🌱",
        "🌲",
        "🌳",
        "🌴",
        "🌵",
        "🌾",
        "🌿",
        "☘️",
        "🍀",
        "🍁",
        "🍂",
        "🍃",
        "🌺",
        "🌸",
        "🌼",
        "🌻",
        "🌞",
        "🌝",
        "🌛",
        "🌜",
        "🌚",
        "🌕",
        "🌖",
        "🌗",
        "🌘",
        "🌑",
        "🌒",
        "🌓",
        "🌔",
        "🌙",
        "🌎",
        "🌍",
        "🌏",
        "💫",
        "⭐",
        "🌟",
        "✨",
        "⚡",
        "☄️",
        "💥",
        "🔥",
        "🌪️",
        "🌈",
        "☀️",
        "🌤️",
        "⛅",
        "🌥️",
        "☁️",
        "🌦️",
        "🌧️",
        "⛈️",
        "🌩️",
        "🌨️",
        "☃️",
        "⛄",
        "🌬️",
        "💨",
        "💧",
        "💦",
        "☔",
        "☂️",
        "🌊",
        "🌫️",
      ],
    };

    let currentCategory = "Smileys";

    // Toggle emoji picker - make entire wrapper clickable
    const emojiInputWrapper = emojiPickerBtn.closest(".emoji-input-wrapper");
    const emojiInput = document.getElementById("customPostToneEmoji");

    // Function to toggle emoji picker
    const toggleEmojiPicker = () => {
      emojiPickerDropdown.style.display =
        emojiPickerDropdown.style.display === "block" ? "none" : "block";
      if (emojiPickerDropdown.style.display === "block") {
        showPostEmojis(emojiData[currentCategory]);
        showPostCategories(Object.keys(emojiData));
      }
    };

    // Add click listener to the input field
    emojiInput.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleEmojiPicker();
    });

    // Close emoji picker when clicking outside
    document.addEventListener("click", (e) => {
      if (
        !emojiInputWrapper.contains(e.target) &&
        !emojiPickerDropdown.contains(e.target)
      ) {
        emojiPickerDropdown.style.display = "none";
      }
    });

    // Search functionality
    emojiSearch.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const allEmojis = Object.values(emojiData).flat();
      const filteredEmojis = allEmojis.filter(
        (emoji) =>
          emoji.includes(searchTerm) ||
          emoji.charCodeAt(0).toString(16).includes(searchTerm)
      );
      showPostEmojis(filteredEmojis);
    });

    function showPostCategories(categories) {
      emojiCategories.innerHTML = categories
        .map(
          (category) =>
            `<button class="category-tab ${
              category === currentCategory ? "active" : ""
            }" data-category="${category}">${getCategoryIcon(
              category
            )}</button>`
        )
        .join("");

      emojiCategories.querySelectorAll(".category-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
          currentCategory = tab.dataset.category;
          showPostCategories(categories);
          showPostEmojis(emojiData[currentCategory]);
        });
      });
    }

    function showPostEmojis(emojis) {
      emojiGrid.innerHTML = emojis
        .map(
          (emoji) =>
            `<button class="emoji-button" data-emoji="${emoji}">${emoji}</button>`
        )
        .join("");

      emojiGrid.querySelectorAll(".emoji-button").forEach((btn) => {
        btn.addEventListener("click", () => {
          document.getElementById("customPostToneEmoji").value =
            btn.dataset.emoji;
          emojiPickerDropdown.style.display = "none";
        });
      });
    }

    function getCategoryIcon(category) {
      const icons = {
        Smileys: "😀",
        Objects: "💼",
        Nature: "🌱",
      };
      return icons[category] || "😀";
    }
  }

  // Templates functionality
  initTemplates() {
    this.setupTemplateEventListeners();
    return this.initDefaultTemplates().then(() => {
      this.updateTemplatesGrid();
      this.initTemplateTabSwitching();
    });
  }

  initDefaultTemplates() {
    return new Promise((resolve) => {
      chrome.storage.local.get(["templates"], (result) => {
        const templates = result.templates || {};

        // Check if default template exists, if not add it
        if (!templates[defaultTemplate.name]) {
          templates[defaultTemplate.name] = {
            name: defaultTemplate.name,
            sampleFormat: defaultTemplate.sampleFormat,
            createdAt: new Date().toISOString(),
          };

          chrome.storage.local.set({ templates }, () => {
            console.log("Default template added successfully");
            resolve();
          });
        } else {
          console.log("Default template already exists");
          resolve();
        }
      });
    });
  }

  initTemplateTabSwitching() {
    const tabButtons = document.querySelectorAll("[data-tab]");
    const tabContents = document.querySelectorAll(".tab-content");

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const targetTab = button.getAttribute("data-tab");
        this.switchTemplateTab(targetTab);
      });
    });
  }

  switchTemplateTab(tabName) {
    // Map submenu tab names to actual tab IDs
    const tabMapping = {
      "writing-styles": "template-styles",
      "create-template": "create-template",
    };

    const actualTabName = tabMapping[tabName] || tabName;

    const tabButtons = document.querySelectorAll("[data-tab]");
    const tabContents = document.querySelectorAll(".tab-content");

    // Remove active class from all buttons and contents
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    tabContents.forEach((content) => content.classList.remove("active"));

    // Add active class to clicked button and corresponding content
    const activeButton = document.querySelector(
      `[data-tab="${actualTabName}"]`
    );
    const activeContent = document.getElementById(`${actualTabName}-tab`);

    if (activeButton) {
      activeButton.classList.add("active");
    }
    if (activeContent) {
      activeContent.classList.add("active");
    }
  }

  setupTemplateEventListeners() {
    // Template creation button
    const createTemplateBtn = document.getElementById("createTemplateBtn");
    if (createTemplateBtn) {
      createTemplateBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.createTemplate();
      });
    }

    // Clear template form
    const clearTemplateBtn = document.getElementById("clearTemplateBtn");
    if (clearTemplateBtn) {
      clearTemplateBtn.addEventListener("click", () => {
        this.clearTemplateForm();
      });
    }

    // Sample format character count
    const sampleFormat = document.getElementById("sampleFormat");
    if (sampleFormat) {
      sampleFormat.addEventListener("input", () => {
        this.updateSampleFormatCount();
      });
    }
  }

  createTemplate() {
    const name = document.getElementById("templateName").value.trim();
    const sampleFormat = document.getElementById("sampleFormat").value.trim();

    if (!name || !sampleFormat) {
      this.showNotification(
        "Please fill in both template name and sample format fields.",
        "error"
      );
      return;
    }

    // Validate template name length
    if (name.length > 50) {
      this.showNotification(
        "Template name must be less than 50 characters.",
        "error"
      );
      return;
    }

    // Validate sample format length
    if (sampleFormat.length > 3000) {
      this.showNotification(
        "Sample format must be less than 3000 characters.",
        "error"
      );
      return;
    }

    chrome.storage.local.get(["templates"], (result) => {
      const templates = result.templates || {};

      // Check if template name already exists (only for new templates, not when editing)
      if (templates[name] && this.editingTemplateName !== name) {
        this.showNotification(
          `A template with the name "${name}" already exists.`,
          "error"
        );
        return;
      }

      // Create template object
      const template = {
        name: name,
        sampleFormat: sampleFormat,
        createdAt: new Date().toISOString(),
      };

      // If editing, remove the old template name first
      if (this.editingTemplateName && this.editingTemplateName !== name) {
        delete templates[this.editingTemplateName];
      }

      templates[name] = template;

      chrome.storage.local.set({ templates }, () => {
        this.clearTemplateForm();
        this.updateTemplatesGrid();
        this.updateWritingStyleDropdown();

        const action = this.editingTemplateName ? "updated" : "created";
        this.showNotification(
          `✅ Template "${name}" ${action} successfully!`,
          "success"
        );

        // Reset editing state
        this.editingTemplateName = null;
        this.updateCreateButton();
      });
    });
  }

  updateSampleFormatCount() {
    const textarea = document.getElementById("sampleFormat");
    const countElement = document.getElementById("sampleFormatCount");

    if (textarea && countElement) {
      const count = textarea.value.length;
      const maxLength = 3000;

      countElement.textContent = `${count} characters`;

      if (count > maxLength * 0.9) {
        countElement.style.color = count > maxLength ? "#dc3545" : "#ffc107";
      } else {
        countElement.style.color = "#6c757d";
      }
    }
  }

  clearTemplateForm() {
    document.getElementById("templateName").value = "";
    document.getElementById("sampleFormat").value = "";
    this.updateSampleFormatCount();

    // Reset editing state
    this.editingTemplateName = null;
    this.updateCreateButton();
  }

  updateTemplatesGrid() {
    const templatesGrid = document.getElementById("templatesGrid");
    if (!templatesGrid) return;

    chrome.storage.local.get(["templates"], (result) => {
      const templates = result.templates || {};
      const templateNames = Object.keys(templates);

      if (templateNames.length === 0) {
        templatesGrid.innerHTML = `
          <div class="no-templates-message">
            <h3>📋 No Templates Yet</h3>
            <p>Create your first template to get started!</p>
          </div>
        `;
      } else {
        templatesGrid.innerHTML = "";
        templateNames.forEach((templateName) => {
          const template = templates[templateName];
          const card = this.createTemplateCard(templateName, template);
          templatesGrid.appendChild(card);
        });
      }
    });

    // Also update the Create Template tab grid
    this.updateCreateTemplateTemplatesGrid();
  }

  updateCreateTemplateTemplatesGrid() {
    const createTemplateGrid = document.getElementById(
      "createTemplateTemplatesGrid"
    );
    if (!createTemplateGrid) return;

    chrome.storage.local.get(["templates"], (result) => {
      const templates = result.templates || {};
      const templateNames = Object.keys(templates);

      // Filter out the default template for the Create Template tab
      const customTemplateNames = templateNames.filter(
        (name) => name !== defaultTemplate.name
      );

      if (customTemplateNames.length === 0) {
        createTemplateGrid.innerHTML = `
          <div class="no-templates-message">
            <h3>📋 No Custom Templates Yet</h3>
            <p>Create your first custom template to get started!</p>
          </div>
        `;
      } else {
        createTemplateGrid.innerHTML = "";
        customTemplateNames.forEach((templateName) => {
          const template = templates[templateName];
          const card = this.createTemplateCard(templateName, template);
          createTemplateGrid.appendChild(card);
        });
      }
    });
  }

  updateWritingStyleDropdown() {
    // Wait for the element to exist before proceeding
    const waitForElement = () => {
      const writingStyleSelect = document.getElementById("writingStyle");
      if (!writingStyleSelect) {
        console.log("writingStyleSelect not found, retrying in 100ms...");
        setTimeout(waitForElement, 100);
        return;
      }

      if (!writingStyleSelect.parentNode) {
        console.log(
          "writingStyleSelect parent node not found, retrying in 100ms..."
        );
        setTimeout(waitForElement, 100);
        return;
      }

      // Element exists, proceed with the update
      try {
        chrome.storage.local.get(["templates"], (result) => {
          const templates = result.templates || {};
          const templateNames = Object.keys(templates);

          // Clear existing options and add placeholder as first option
          writingStyleSelect.innerHTML =
            '<option value="" disabled selected>Choose a template...</option>';

          // Add "Don't include Template" option
          const noTemplateOption = document.createElement("option");
          noTemplateOption.value = "no-template";
          noTemplateOption.textContent = "Don't include Template";
          writingStyleSelect.appendChild(noTemplateOption);

          // Add template options
          templateNames.forEach((templateName) => {
            const option = document.createElement("option");
            option.value = templateName;

            // Add "(default)" indicator for the default template
            const isDefault = templateName === defaultTemplate.name;
            option.textContent = `📋 ${templateName}${
              isDefault ? " (default)" : ""
            }`;

            writingStyleSelect.appendChild(option);
          });

          // Add change event listener to show template preview
          writingStyleSelect.addEventListener("change", (e) => {
            e.preventDefault(); // Prevent any form submission
            e.stopPropagation(); // Stop event bubbling
            console.log(
              "Template selection changed:",
              writingStyleSelect.value
            );
            this.handleTemplateSelection();
          });
        });
      } catch (error) {
        console.error("Error in updateWritingStyleDropdown:", error);
      }
    };

    // Start the waiting process
    waitForElement();
  }

  handleTemplateSelection() {
    const selectedTemplate = document.getElementById("writingStyle").value;
    const placeholder = document.getElementById("placeholder");
    const postContent = document.getElementById("postContent");

    console.log("=== handleTemplateSelection Debug ===");
    console.log("Selected template:", selectedTemplate);
    console.log("Placeholder element:", placeholder);
    console.log("Placeholder display:", placeholder?.style.display);

    // Check if a post has been generated
    const hasGeneratedPost = postContent && postContent.value.trim().length > 0;

    if (!selectedTemplate || selectedTemplate === "no-template") {
      console.log(
        "No template selected or 'Don't include Template' selected, clearing placeholder"
      );

      if (hasGeneratedPost) {
        // Post is generated, remove template card from output section
        const outputSection = document.querySelector(".output-section");
        if (outputSection) {
          const existingTemplateCards = outputSection.querySelectorAll(
            ".template-preview-card"
          );
          existingTemplateCards.forEach((card) => card.remove());
        }
      } else {
        // No post generated, clear the ready to generate area
        if (placeholder) {
          placeholder.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 60px 20px; height: 300px; background: white; border: 1px solid #e9ecef; border-radius: 6px; margin: 0;">
              <h3 style="margin: 0 0 20px 0; color: rgb(139, 92, 246); font-size: 18px;">📝 Ready to Craft</h3>
              <p style="font-size: 16px; margin: 0 0 25px 0; color: #666; line-height: 1.5;">
                Fill in the form on the left and click "Craft Post" to<br>
                create your content.
              </p>
              <div style="font-size: 48px; margin: 0 0 25px 0; opacity: 0.6;">✨</div>
              <p style="font-size: 14px; color: #888; margin: 0;">
                Your crafted post will appear here
              </p>
            </div>
          `;
          placeholder.style.display = "block";
        }
      }

      return;
    }

    // Get the selected template's sample format
    chrome.storage.local.get(["templates"], (result) => {
      const templates = result.templates || {};
      const template = templates[selectedTemplate];

      console.log("Storage result:", result);
      console.log("Templates object:", templates);
      console.log("Template found:", template);
      console.log("Template keys:", Object.keys(templates));

      if (template && template.sampleFormat) {
        console.log("Sample format length:", template.sampleFormat.length);
        console.log(
          "Sample format preview:",
          template.sampleFormat.substring(0, 100) + "..."
        );

        // Format the sample format to preserve line breaks and formatting
        const formattedContent = template.sampleFormat
          .replace(/\n/g, "<br>")
          .replace(/\s{2,}/g, "&nbsp;&nbsp;"); // Preserve multiple spaces

        console.log(
          "Formatted content preview:",
          formattedContent.substring(0, 100) + "..."
        );

        if (hasGeneratedPost) {
          // Post is generated, create template card below the generated post
          const outputSection = document.querySelector(".output-section");
          if (outputSection) {
            // Remove any existing template cards
            const existingTemplateCards = outputSection.querySelectorAll(
              ".template-preview-card"
            );
            existingTemplateCards.forEach((card) => card.remove());

            // Create new template card
            const templateCard = document.createElement("div");
            templateCard.className = "template-preview-card";
            templateCard.style.cssText = `
              margin-top: 40px;
              padding: 15px;
              background: white;
              border: 1px solid #e9ecef;
              border-radius: 6px;
              max-height: 200px;
              overflow: hidden;
            `;

            templateCard.innerHTML = `
              <div style="font-weight: 600; color: #333; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #e0e0e0;">
                📋 Template: ${selectedTemplate}
              </div>
              <div style="white-space: pre-wrap; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #444; font-size: 14px; max-height: 120px; overflow-y: auto;">
                ${formattedContent}
              </div>
            `;

            // Add template card after the generated post
            outputSection.appendChild(templateCard);

            // Scroll down to show the template card
            setTimeout(() => {
              templateCard.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
              });
            }, 100);
          }
        } else {
          // No post generated, show template preview in placeholder
          if (placeholder) {
            placeholder.innerHTML = `
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px 20px; height: 300px; background: white; border-radius: 6px; margin: 0;">
                <h3 style="margin: 0 0 15px 0; color: rgb(139, 92, 246); font-size: 18px;">📋 Selected Template</h3>
                <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 6px; padding: 15px; margin: 0 0 25px 0; max-width: 90%; max-height: 150px; overflow-y: auto;">
                  <div style="font-weight: 600; color: #333; margin-bottom: 8px; font-size: 14px;">
                    ${selectedTemplate}
                  </div>
                  <div style="white-space: pre-wrap; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.4; color: #444; font-size: 12px;">
                    ${formattedContent}
                  </div>
                </div>
                <p style="font-size: 14px; color: #666; margin: 0;">
                  Click "Craft Post" to generate content using this template
                </p>
              </div>
            `;
          }
        }
      } else {
        console.log("❌ Template or sampleFormat not found:", {
          hasTemplate: !!template,
          hasSampleFormat: !!template?.sampleFormat,
          hasPlaceholder: !!placeholder,
        });
      }
    });
  }

  createTemplateCard(templateName, template) {
    const card = document.createElement("div");
    card.className = "template-card";

    // Check if this is the default template
    const isDefaultTemplate = templateName === defaultTemplate.name;

    card.innerHTML = `
      <div class="template-header">
        <h3 class="template-name">${templateName}</h3>
        ${
          isDefaultTemplate
            ? '<span class="default-badge" style="background: #28a745; color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px; margin-left: 10px;">Default</span>'
            : ""
        }
      </div>
      <div class="form-group">
        <label>Sample Format:</label>
        <textarea class="template-sample-format" data-template="${templateName}" rows="8">${
      template.sampleFormat
    }</textarea>
      </div>
      <div class="template-actions">
        <button class="btn btn-primary save-template" data-template="${templateName}">Save</button>
        ${
          isDefaultTemplate
            ? `<button class="btn btn-secondary reset-template" data-template="${templateName}">Reset</button>`
            : `<button class="btn btn-danger delete-template" data-template="${templateName}">Delete</button>`
        }
      </div>
    `;

    // Add event listeners
    const saveBtn = card.querySelector(".save-template");
    saveBtn.addEventListener("click", () => {
      this.saveTemplate(templateName);
    });

    if (isDefaultTemplate) {
      const resetBtn = card.querySelector(".reset-template");
      resetBtn.addEventListener("click", () => {
        this.resetTemplate(templateName);
      });
    } else {
      const deleteBtn = card.querySelector(".delete-template");
      deleteBtn.addEventListener("click", () => {
        this.deleteTemplate(templateName);
      });
    }

    return card;
  }

  useTemplate(templateName, template) {
    // Switch to create post panel and populate the topic field with the template format
    this.switchPanel("create-post");

    // Populate the topic field with the sample format
    document.getElementById("topic").value = template.sampleFormat;
    this.updateCharacterCount();

    this.showNotification(
      `✅ Template "${templateName}" applied! You can now modify the content and generate your post.`,
      "success"
    );
  }

  editTemplate(templateName, template) {
    // Set editing state
    this.editingTemplateName = templateName;

    // Switch to templates panel first
    this.switchPanel("templates");

    // Populate the form with template data
    document.getElementById("templateName").value = templateName;
    document.getElementById("sampleFormat").value = template.sampleFormat || "";
    this.updateSampleFormatCount();

    // Switch to create template tab
    this.switchTemplateTab("create-template");

    // Update button text
    this.updateCreateButton();

    // Scroll to the form
    setTimeout(() => {
      document
        .getElementById("templateName")
        .scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  updateCreateButton() {
    const createBtn = document.getElementById("createTemplateBtn");
    if (createBtn) {
      if (this.editingTemplateName) {
        createBtn.textContent = "Update Template";
        createBtn.className = "btn btn-success";
      } else {
        createBtn.textContent = "Create Template";
        createBtn.className = "btn btn-success";
      }
    }
  }

  deleteTemplate(templateName) {
    if (
      confirm(`Are you sure you want to delete the template "${templateName}"?`)
    ) {
      chrome.storage.local.get(["templates"], (result) => {
        const templates = result.templates || {};
        delete templates[templateName];

        chrome.storage.local.set({ templates }, () => {
          this.updateTemplatesGrid();
          this.updateWritingStyleDropdown();
          this.showNotification(
            `✅ Template "${templateName}" deleted successfully!`,
            "success"
          );
        });
      });
    }
  }

  saveTemplate(templateName) {
    const card = document
      .querySelector(`[data-template="${templateName}"]`)
      .closest(".template-card");
    const sampleFormat = card.querySelector(".template-sample-format").value;

    chrome.storage.local.get(["templates"], (result) => {
      const templates = result.templates || {};

      // Update the template with new content
      templates[templateName] = {
        name: templateName,
        sampleFormat: sampleFormat,
        createdAt: new Date().toISOString(),
      };

      chrome.storage.local.set({ templates }, () => {
        this.updateWritingStyleDropdown();
        this.showNotification(
          `✅ Template "${templateName}" saved successfully!`,
          "success"
        );
      });
    });
  }

  resetTemplate(templateName) {
    if (templateName === defaultTemplate.name) {
      if (
        confirm(`Are you sure you want to reset "${templateName}" to default?`)
      ) {
        chrome.storage.local.get(["templates"], (result) => {
          const templates = result.templates || {};

          // Reset to default
          templates[templateName] = {
            name: defaultTemplate.name,
            sampleFormat: defaultTemplate.sampleFormat,
            createdAt: new Date().toISOString(),
          };

          chrome.storage.local.set({ templates }, () => {
            this.updateTemplatesGrid();
            this.updateWritingStyleDropdown();
            this.showNotification(
              `✅ Template "${templateName}" reset to default!`,
              "success"
            );
          });
        });
      }
    } else {
      this.showNotification(`Only default templates can be reset.`, "info");
    }
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  getUserFriendlyErrorMessage(error) {
    console.log("Processing error for user-friendly message:", error);

    // Handle different error types with specific messages
    if (error.message.includes("API key")) {
      return "🔑 Please configure your OpenAI API key in settings first.";
    }

    if (
      error.message.includes("rate limit") ||
      error.message.includes("Rate limit")
    ) {
      return "⏱️ OpenAI rate limit reached. Please wait a moment and try again.";
    }

    if (error.message.includes("quota") || error.message.includes("billing")) {
      return "💳 OpenAI billing quota exceeded. Please check your OpenAI account billing.";
    }

    if (
      error.message.includes("timeout") ||
      error.message.includes("timed out")
    ) {
      return "⏰ Request timed out. Please check your internet connection and try again.";
    }

    if (error.message.includes("network") || error.message.includes("fetch")) {
      return "🌐 Network error. Please check your internet connection and try again.";
    }

    if (
      error.message.includes("401") ||
      error.message.includes("Unauthorized")
    ) {
      return "🔐 Invalid API key. Please check your OpenAI API key in settings.";
    }

    if (error.message.includes("403") || error.message.includes("Forbidden")) {
      return "🚫 Access forbidden. Please check your OpenAI API key permissions.";
    }

    if (error.message.includes("429")) {
      return "🚦 Too many requests. Please wait a moment and try again.";
    }

    if (
      error.message.includes("500") ||
      error.message.includes("Internal Server Error")
    ) {
      return "🔧 OpenAI service temporarily unavailable. Please try again later.";
    }

    if (error.message.includes("Invalid response format")) {
      return "📝 Unexpected response from AI service. Please try again.";
    }

    if (error.message.includes("No content generated")) {
      return "🤖 AI couldn't generate content. Please try with different input.";
    }

    // Default error message
    return `❌ ${
      error.message || "An unexpected error occurred. Please try again."
    }`;
  }

  showNotification(message, type = "info") {
    console.log("showNotification called:", { message, type });

    // Remove existing notifications
    const existingNotifications = document.querySelectorAll(".notification");
    existingNotifications.forEach((notification) => notification.remove());

    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
      </div>
    `;

    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${
        type === "success"
          ? "#d4edda"
          : type === "error"
          ? "#f8d7da"
          : "#d1ecf1"
      };
      color: ${
        type === "success"
          ? "#155724"
          : type === "error"
          ? "#721c24"
          : "#0c5460"
      };
      border: 1px solid ${
        type === "success"
          ? "#c3e6cb"
          : type === "error"
          ? "#f5c6cb"
          : "#bee5eb"
      };
      border-radius: 8px;
      padding: 12px 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      max-width: 400px;
      font-size: 14px;
      font-weight: 500;
      animation: slideIn 0.3s ease-out;
    `;

    // Add animation styles
    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .notification-close {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: inherit;
        opacity: 0.7;
        padding: 0;
        line-height: 1;
      }
      .notification-close:hover {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);

    // Add to page
    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);

    // Close button functionality
    const closeBtn = notification.querySelector(".notification-close");
    closeBtn.addEventListener("click", () => {
      notification.remove();
    });
  }

  initSubmenuStates() {
    // Set Templates submenu to collapsed by default
    const templatesNavItem = document.querySelector('[data-panel="templates"]');
    if (templatesNavItem) {
      const submenu = templatesNavItem.nextElementSibling;
      if (submenu && submenu.classList.contains("nav-submenu")) {
        submenu.classList.add("collapsed");
      }
    }

    // Set Tone Setup submenu to collapsed by default
    const toneSetupNavItem = document.querySelector(
      '[data-panel="tone-setup"]'
    );
    if (toneSetupNavItem) {
      const submenu = toneSetupNavItem.nextElementSibling;
      if (submenu && submenu.classList.contains("nav-submenu")) {
        submenu.classList.add("collapsed");
      }
    }
  }

  async createPostWithoutTemplate(apiKey, topic, tone, model) {
    try {
      const platformName = this.getPlatformDisplayName();
      const lengthConfig = this.getLengthConfig();
      const characterLimit = lengthConfig.max;

      console.log("Creating post without template:", {
        platformName,
        characterLimit,
        model,
        topic: topic.substring(0, 50) + "...",
      });

      const prompt = await this.buildPostPromptWithoutTemplate(
        topic,
        tone,
        platformName,
        characterLimit
      );

      console.log("Prompt built, making API call...");

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
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
                content: `You are a professional social media content creator. Create engaging, platform-appropriate posts that follow the given tone and guidelines. Always stay within the specified character limit.`,
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            max_tokens: Math.min(500, Math.floor(characterLimit * 0.4)),
            temperature: 0.7,
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);

        // Create a more specific error with status code and details
        const errorMessage = errorData.error?.message || "Unknown error";
        const statusCode = response.status;

        let specificError;
        if (statusCode === 401) {
          specificError = new Error(
            "Invalid API key. Please check your OpenAI API key in settings."
          );
        } else if (statusCode === 403) {
          specificError = new Error(
            "Access forbidden. Please check your OpenAI API key permissions."
          );
        } else if (statusCode === 429) {
          specificError = new Error(
            "Rate limit reached. Please wait a moment and try again."
          );
        } else if (statusCode === 500) {
          specificError = new Error(
            "OpenAI service temporarily unavailable. Please try again later."
          );
        } else {
          specificError = new Error(
            `API Error (${statusCode}): ${errorMessage}`
          );
        }

        throw specificError;
      }

      const data = await response.json();
      const generatedPost = data.choices[0]?.message?.content?.trim();

      if (!generatedPost) {
        throw new Error("No content generated from AI");
      }

      console.log(
        "Post generated without template:",
        generatedPost.substring(0, 100) + "..."
      );

      return this.cleanPostContent(generatedPost);
    } catch (error) {
      console.error("Error in createPostWithoutTemplate:", error);
      if (error.name === "AbortError") {
        throw new Error("Request timed out. Please try again.");
      }
      throw error;
    }
  }

  async buildPostPromptWithoutTemplate(
    topic,
    tone,
    platformName,
    characterLimit
  ) {
    // Get stored post tone data
    const result = await chrome.storage.local.get([
      "postTonePrompts",
      "postToneGuidelines",
      "customPostTones",
    ]);
    const postTonePrompts = result.postTonePrompts || {};
    const postToneGuidelines = result.postToneGuidelines || {};
    const customPostTones = result.customPostTones || {};

    // Get prompt and guideline for the selected tone
    let prompt, guideline;

    if (customPostTones[tone]) {
      // Custom tone
      prompt = customPostTones[tone].prompt;
      guideline = customPostTones[tone].guideline;
    } else {
      // Default tone
      prompt =
        postTonePrompts[tone] ||
        defaultPostTonePrompts[tone] ||
        this.getToneInstructions(tone);
      guideline =
        postToneGuidelines[tone] || defaultPostToneGuidelines[tone] || "";
    }

    // Get length configuration
    const lengthConfig = this.getLengthConfig();
    const lengthSelect = document.getElementById("lengthSelect");
    const selectedLength = lengthSelect ? lengthSelect.value : "medium";

    // Determine hashtag strategy based on platform and tone
    const hashtagStrategy = this.getHashtagStrategy(platformName, tone);

    return `Create a ${selectedLength} post for ${platformName} about "${topic}".

REQUIREMENTS:
- Topic: "${topic}"
- Tone: ${tone}
- Platform: ${platformName}
- Length: ${characterLimit} characters maximum
- Format: Create engaging, readable content with appropriate line breaks
- Content: Write original, engaging content about "${topic}"

TONE GUIDELINES:
- ${prompt}
- ${guideline}

PLATFORM STYLE: ${this.getPlatformStyle()}
HASHTAGS: ${hashtagStrategy}

INSTRUCTIONS:
1. Write about "${topic}" using your own ideas and insights
2. Create engaging, platform-appropriate content
3. Use clear, readable formatting with line breaks where appropriate
4. Follow the tone guidelines for style and approach
5. Stay within ${characterLimit} characters
6. Make the content compelling and shareable

Generate your post about "${topic}":`;
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded event fired");
  const manager = new CreatePostManager();

  // Initialize the manager
  manager.init();

  // Ensure post tone setup is initialized after a short delay
  setTimeout(() => {
    if (document.getElementById("tone-setup-panel")) {
      manager.initPostToneSetup();
    }
  }, 100);
});
