console.log("✅ Content script loaded");
console.log("📍 Current URL:", window.location.href);

// Initialize services
let platformManager = null;
let cssManager = null;
let modalManager = null;
let aiService = null;

// Initialize the architecture
async function initializeServices() {
  try {
    // Initialize all services
    platformManager = new PlatformManager();
    cssManager = new CSSManager();
    modalManager = new ModalManager();
    aiService = new AIService();

    // Detect platform and initialize CSS
    const platform = platformManager.detectPlatform();
    if (platform) {
      const platformName = platform.getPlatformName();
      cssManager.initialize(platformName);
      aiService.setCurrentPlatform(platform);
      console.log(`✅ Initialized for platform: ${platformName}`);
    } else {
      console.log("⚠️ No supported platform detected, using default styling");
      cssManager.initialize("LinkedIn"); // Fallback to LinkedIn styling
    }

    // Setup modal manager callbacks
    setupModalCallbacks();

    return true;
  } catch (error) {
    console.error("❌ Failed to initialize services:", error);
    return false;
  }
}

// Setup modal manager callbacks
function setupModalCallbacks() {
  if (modalManager) {
    // Handle tone changes
    modalManager.toneChangeCallback = async (newTone) => {
      await handleToneChange(newTone);
    };

    // Handle comment improvement
    modalManager.improveCallback = async (commentText) => {
      await handleCommentImprovement(commentText);
    };
  }
}

// Helper function to check if extension context is valid
function isExtensionContextValid() {
  return (
    typeof chrome !== "undefined" &&
    chrome.storage &&
    chrome.runtime &&
    chrome.runtime.id
  );
}

// Inject buttons under posts
function injectButtonUnderPost() {
  // Use platform manager if available, otherwise fall back to old logic
  if (platformManager && platformManager.isSupportedPlatform()) {
    injectButtonWithPlatformManager();
  } else {
    injectButtonWithLegacyLogic();
  }
}

function injectButtonWithPlatformManager() {
  const platform = platformManager.getCurrentPlatform();
  const posts = platform.findPosts();

  posts.forEach((post) => {
    if (post.querySelector(".vibe-btn")) return;

    const actionButton = platform.findActionButton(post);
    if (!actionButton) {
      return;
    }

    const btn = platform.createActionButton(platform.getPlatformName());
    if (!btn) {
      return;
    }

    btn.addEventListener("click", async () => {
      aiService.setActivePost(post);
      await handleButtonClick(post, platform);
    });

    platform.injectButton(post, btn);
  });
}

function injectButtonWithLegacyLogic() {
  // Handle both feed posts and individual post pages
  let posts = [];
  let isIndividualPost = false;

  // Check if we're on an individual post page
  if (
    window.location.pathname.includes("/post/") ||
    window.location.pathname.includes("/posts/")
  ) {
    console.log("🔍 Detected individual post page");
    // For individual post pages, look for the main post container
    const individualPost =
      document.querySelector('[data-test-id="post-content"]') ||
      document.querySelector(".feed-shared-update-v2") ||
      document.querySelector('[data-test-id="post"]') ||
      document.querySelector(".artdeco-card");

    if (individualPost) {
      posts = [individualPost];
      isIndividualPost = true;
      console.log("✅ Found individual post container");
    } else {
      console.log("❌ No individual post container found");
    }
  } else {
    console.log("🔍 Detected feed page");
    // For feed pages, use the original selector
    posts = document.querySelectorAll("div.feed-shared-update-v2");
    console.log(`📊 Found ${posts.length} feed posts`);
  }

  posts.forEach((post) => {
    if (post.querySelector(".vibe-btn")) return;

    // Look for comment button with different selectors for different page types
    let commentButton = post.querySelector('button[aria-label*="Comment"]');

    if (!commentButton) {
      // Try alternative selectors for individual post pages
      commentButton =
        post.querySelector('button[aria-label*="comment"]') ||
        post.querySelector('button[aria-label*="Reply"]') ||
        post.querySelector('[data-test-id="comment-button"]') ||
        post.querySelector(".social-actions__comment-button");
    }

    if (!commentButton) {
      console.log("❌ No comment button found for post");
      return;
    }

    console.log("✅ Found comment button");

    const btn = document.createElement("button");
    btn.innerText = "💬 Suggest Comments";
    btn.className = "vibe-btn";

    btn.addEventListener("click", async () => {
      aiService.setActivePost(post);
      await handleButtonClick(post);
    });

    commentButton.parentElement?.appendChild(btn);
  });
}

// Handle button click
async function handleButtonClick(post, platform = null) {
  // Retry mechanism for extension context issues
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      // Check if Chrome extension APIs are available
      if (!isExtensionContextValid()) {
        retryCount++;
        if (retryCount >= maxRetries) {
          alert(
            "Extension context invalid. Please refresh the page and try again."
          );
          return;
        }
        // Wait a bit before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }

      const result = await new Promise((resolve, reject) => {
        chrome.storage.local.get(
          ["vibeOpenAIKey", "vibeTone", "vibeEmoji"],
          (result) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(result);
            }
          }
        );
      });

      const apiKey = result.vibeOpenAIKey;
      const tone = result.vibeTone || "Friendly";

      // Complete emoji map to ensure we always have an emoji
      const emojiMap = {
        "Smart Contrarian": "🤔",
        "Agreement with Value": "✅",
        "Ask a Question": "❓",
        Friendly: "💬",
        Celebratory: "🎉",
        Constructive: "🛠️",
        "Offer Help": "🤝",
        Contribution: "📚",
        "Disagreement - Contrary": "⚡",
        Criticism: "🧐",
        "Funny Sarcastic": "😏",
        "Perspective (Why / What / How)": "🔍",
        "Professional Industry Specific": "🏢",
      };

      const emoji = result.vibeEmoji || emojiMap[tone] || "💬";

      if (!apiKey || apiKey.trim() === "") {
        alert("⚠️ Please set your OpenAI API key in the extension settings.");
        return;
      }

      // Use platform-specific text extraction if available
      let postText;
      if (platform) {
        postText = platform.extractPostText(post);
      } else {
        postText = post.innerText.slice(0, 800);
      }

      document.querySelectorAll("[data-vibe-post]").forEach((el) => {
        el.removeAttribute("data-vibe-post");
      });

      // Tag only the current post
      post.setAttribute("data-vibe-post", postText);

      await fetchSuggestions(apiKey, tone, emoji, postText, post);
      break; // Success, exit the retry loop
    } catch (error) {
      retryCount++;
      if (retryCount >= maxRetries) {
        alert("Extension error. Please refresh the page and try again.");
        return;
      }
      // Wait a bit before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

// Fetch suggestions using AI service
async function fetchSuggestions(apiKey, tone, emoji, postText, postEl = null) {
  try {
    // Show loading modal
    const toneLabel = `${emoji} ${tone}`;
    const platformName = platformManager
      .getCurrentPlatform()
      ?.getPlatformName();

    modalManager.show(toneLabel, [], "", true, platformName);

    // Fetch suggestions from AI service
    const result = await aiService.fetchSuggestions(
      apiKey,
      tone,
      emoji,
      postText,
      postEl
    );

    if (result.success) {
      // Show results in modal
      modalManager.show(
        toneLabel,
        result.comments,
        result.dmSuggestion,
        false,
        platformName
      );
    } else {
      throw new Error("Failed to fetch suggestions");
    }
  } catch (error) {
    console.error("❌ Failed to fetch suggestions:", error);
    alert(`❌ Error: ${error.message}`);

    // Hide modal on error
    modalManager.hide();
  }
}

// Handle tone change
async function handleToneChange(newTone) {
  try {
    const result = await new Promise((resolve, reject) => {
      chrome.storage.local.get(["vibeOpenAIKey", "vibeEmoji"], (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(result);
        }
      });
    });

    const apiKey = result.vibeOpenAIKey;
    const emojiMap = {
      "Smart Contrarian": "🤔",
      "Agreement with Value": "✅",
      "Ask a Question": "❓",
      Friendly: "💬",
      Celebratory: "🎉",
      Constructive: "🛠️",
      "Offer Help": "🤝",
      Contribution: "📚",
      "Disagreement - Contrary": "⚡",
      Criticism: "🧐",
      "Funny Sarcastic": "😏",
      "Perspective (Why / What / How)": "🔍",
      "Professional Industry Specific": "🏢",
    };

    const emoji = result.vibeEmoji || emojiMap[newTone] || "💬";

    if (!apiKey) {
      alert("⚠️ Please set your OpenAI API key in the extension settings.");
      return;
    }

    // Get the current post text
    const activePost = aiService.activePostElement;
    if (!activePost) {
      alert("❌ No active post found. Please try again.");
      return;
    }

    const platform = platformManager.getCurrentPlatform();
    let postText;
    if (platform) {
      postText = platform.extractPostText(activePost);
    } else {
      postText = activePost.innerText.slice(0, 800);
    }

    // Fetch new suggestions with the new tone
    await fetchSuggestions(apiKey, newTone, emoji, postText, activePost);
  } catch (error) {
    console.error("❌ Failed to change tone:", error);
    alert(`❌ Error changing tone: ${error.message}`);
  }
}

// Handle comment improvement
async function handleCommentImprovement(commentText) {
  try {
    const result = await aiService.improveComment(commentText);

    if (result.success) {
      // Show improved comment
      const improvedBox = modalManager.modal.querySelector(
        "#improvedCommentBox"
      );
      const improvedText = modalManager.modal.querySelector(
        "#improvedCommentText"
      );

      if (improvedBox && improvedText) {
        improvedText.innerText = result.improvedText;
        improvedBox.style.display = "block";
      }
    } else {
      throw new Error("Failed to improve comment");
    }
  } catch (error) {
    console.error("❌ Failed to improve comment:", error);
    alert(`❌ Error improving comment: ${error.message}`);
  } finally {
    // Hide the improve loader when done (success or error)
    modalManager.hideImproveLoader();
  }
}

// Initialize services when the script loads
initializeServices().then((success) => {
  if (success) {
    console.log("✅ Services initialized successfully");
    // Start the button injection interval
    setInterval(injectButtonUnderPost, 2000);
  } else {
    console.log("⚠️ Using legacy button injection");
    // Fall back to legacy injection
    setInterval(injectButtonUnderPost, 2000);
  }
});

// Fallback: Ensure CSS is applied even if services fail
setTimeout(() => {
  if (!cssManager) {
    console.log("🔄 Fallback: Applying basic CSS");
    const fallbackCSS = `
      /* Extension-specific button styling only - very specific */
      button.vibe-btn,
      .vibe-btn {
        background-color: #0073b1 !important;
        color: white !important;
        border: none !important;
        border-radius: 4px !important;
        padding: 6px 10px !important;
        margin-left: 8px !important;
        cursor: pointer !important;
        font-size: 14px !important;
        font-weight: 500 !important;
        transition: background-color 0.2s !important;
        z-index: 1000 !important;
        display: inline-block !important;
        text-decoration: none !important;
        box-sizing: border-box !important;
        font-family: inherit !important;
      }
      button.vibe-btn:hover,
      .vibe-btn:hover {
        background-color: #005a8b !important;
      }
      
      /* Modal-specific styling only */
      #vibe-modal {
        position: fixed;
        bottom: 30px;
        right: 30px;
        z-index: 999999;
        background: white;
        border: 2px solid #0073b1;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        padding: 16px;
        width: 420px;
        max-width: 90vw;
        max-height: 90vh;
        overflow-y: auto;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-sizing: border-box;
      }
    `;
    const style = document.createElement("style");
    style.textContent = fallbackCSS;
    document.head.appendChild(style);
    console.log("✅ Fallback CSS applied");
  }
}, 1000);
