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
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadUserProfile();

    // Initialize post tone setup if we're on the tone-setup panel
    if (
      document.getElementById("tone-setup-panel").classList.contains("active")
    ) {
      this.initPostToneSetup();
    }
  }

  setupEventListeners() {
    // Navbar navigation
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        this.switchPanel(e.currentTarget.dataset.panel);
      });
    });

    // Platform selection
    document.querySelectorAll(".platform-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.selectPlatform(e.target.dataset.platform);
      });
    });

    // Form submission
    document
      .getElementById("createPostForm")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        this.generatePost();
      });

    // Copy button
    document.getElementById("copyBtn").addEventListener("click", () => {
      this.copyPost();
    });

    // Regenerate button
    document.getElementById("regenerateBtn").addEventListener("click", () => {
      this.generatePost();
    });

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
      });
    }

    // Initialize length info
    this.updateLengthInfo();
  }

  switchPanel(panelName) {
    // Update navbar active state
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active");
    });
    document
      .querySelector(`[data-panel="${panelName}"]`)
      .classList.add("active");

    // Hide all panels
    document.querySelectorAll(".content-panel").forEach((panel) => {
      panel.classList.remove("active");
    });

    // Show selected panel
    document.getElementById(`${panelName}-panel`).classList.add("active");
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

      // Add custom post tones
      Object.keys(customPostTones).forEach((toneName) => {
        const customTone = customPostTones[toneName];
        const option = document.createElement("option");
        option.value = toneName;
        option.textContent = `${customTone.emoji} ${toneName}`;
        toneSelect.appendChild(option);
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
      }: ~${config.target} characters (${platformName})`;
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
    const topic = document.getElementById("topic").value.trim();
    const tone = document.getElementById("tone").value;

    if (!topic || !tone) {
      alert("Please fill in both topic and tone fields.");
      return;
    }

    // Show loading state
    this.showLoading(true);
    this.hideGeneratedPost();

    try {
      // Get API key and selected model
      const result = await chrome.storage.local.get(["vibeOpenAIKey"]);
      const apiKey = result.vibeOpenAIKey;
      const model =
        document.getElementById("modelSelect").value || "gpt-3.5-turbo";

      if (!apiKey || !apiKey.startsWith("sk-")) {
        throw new Error(
          "Please configure your OpenAI API key in settings first."
        );
      }

      // Generate post
      const post = await this.createPostWithAI(apiKey, topic, tone, model);

      // Display result
      this.displayGeneratedPost(post);
    } catch (error) {
      console.error("Error generating post:", error);
      alert(`Error generating post: ${error.message}`);
    } finally {
      this.showLoading(false);
    }
  }

  async createPostWithAI(apiKey, topic, tone, model) {
    const platformName = this.getPlatformDisplayName();
    const lengthConfig = this.getLengthConfig();

    const prompt = await this.buildPostPrompt(
      topic,
      tone,
      platformName,
      lengthConfig.max
    );

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
              "You are an expert social media content creator. Create engaging, platform-appropriate posts that are authentic and valuable to the audience.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `OpenAI API Error: ${error.error?.message || "Unknown error"}`
      );
    }

    const data = await response.json();
    const generatedPost = data.choices[0].message.content.trim();

    return this.cleanPostContent(generatedPost);
  }

  async buildPostPrompt(topic, tone, platformName, characterLimit) {
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

    return `Create a ${selectedLength} post for ${platformName} about: "${topic}"

Prompt: ${prompt}

Guidelines: ${guideline}

Platform-specific requirements:
- Platform: ${platformName}
- Length: ${selectedLength} (target: ${lengthConfig.target} characters, max: ${
      lengthConfig.max
    } characters)
- Style: ${this.getPlatformStyle()}
- Include relevant hashtags if appropriate
- Make it engaging and authentic
- Keep the post within ${lengthConfig.max} characters

Post content:`;
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

  cleanPostContent(content) {
    // Remove any AI-generated prefixes or labels
    return content
      .replace(/^(Post|Content|Generated Post):\s*/gi, "")
      .replace(/^(Here's your|Here is your|Here's a|Here is a)\s+/gi, "")
      .trim();
  }

  displayGeneratedPost(post) {
    document.getElementById("postContent").value = post;
    this.updateCharacterCount();
    document.getElementById("generatedPost").style.display = "block";
    document.getElementById("placeholder").style.display = "none";
  }

  updateCharacterCount() {
    const postContent = document.getElementById("postContent").value;
    const characterCount = postContent.length;
    const limit = this.characterLimits[this.selectedPlatform];

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
    const loading = document.getElementById("loading");
    const generateBtn = document.getElementById("generateBtn");
    const placeholder = document.getElementById("placeholder");
    const loadingAnimation = document.getElementById("loadingAnimation");
    const generatedPost = document.getElementById("generatedPost");

    if (show) {
      loading.style.display = "block";
      loadingAnimation.style.display = "block";
      generateBtn.disabled = true;
      generateBtn.textContent = "⏳ Generating...";
      placeholder.style.display = "none";
      generatedPost.style.display = "none";

      // Force restart animations
      setTimeout(() => {
        const pencil = loadingAnimation.querySelector(".pencil");
        const pencilTrail = loadingAnimation.querySelector(".pencil-trail");
        const sparkles = loadingAnimation.querySelectorAll(".sparkle");
        const writingChars = loadingAnimation.querySelectorAll(".writing-char");

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

        writingChars.forEach((char, index) => {
          char.style.animation = "none";
          char.offsetHeight; // Trigger reflow
          char.style.animation = `charAppear 0.3s ease-in-out forwards`;
          char.style.animationDelay = `${0.2 + index * 0.2}s`;
        });
      }, 100);
    } else {
      loading.style.display = "none";
      loadingAnimation.style.display = "none";
      generateBtn.disabled = false;
      generateBtn.textContent = "✨ Generate Post";
    }
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

    // Update tab active state
    document.querySelectorAll(".post-tab").forEach((tab) => {
      tab.classList.remove("active");
    });
    const activeTab = document.querySelector(`[data-post-tab="${tabName}"]`);
    if (activeTab) {
      activeTab.classList.add("active");
      console.log("Activated tab:", tabName);
    } else {
      console.error("Tab not found:", tabName);
    }

    // Hide all tab contents
    document.querySelectorAll(".post-tab-content").forEach((content) => {
      content.classList.remove("active");
    });

    // Show selected tab content
    const tabContent = document.getElementById(tabName);
    if (tabContent) {
      tabContent.classList.add("active");
      console.log("Activated tab content:", tabName);
    } else {
      console.error("Tab content not found:", tabName);
    }
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

    chrome.storage.local.get(
      ["postTonePrompts", "postToneGuidelines"],
      (result) => {
        const postTonePrompts = result.postTonePrompts || {};
        const postToneGuidelines = result.postToneGuidelines || {};

        postTonePrompts[toneName] = prompt;
        postToneGuidelines[toneName] = guideline;

        chrome.storage.local.set(
          { postTonePrompts, postToneGuidelines },
          () => {
            alert(`✅ Post tone "${toneName}" saved successfully!`);
          }
        );
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
        const card = this.createPostToneCard(
          toneName,
          customTone.prompt,
          customTone.guideline,
          customTone.emoji,
          "custom"
        );
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
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const manager = new CreatePostManager();

  // Ensure post tone setup is initialized after a short delay
  setTimeout(() => {
    if (document.getElementById("tone-setup-panel")) {
      manager.initPostToneSetup();
    }
  }, 100);
});
