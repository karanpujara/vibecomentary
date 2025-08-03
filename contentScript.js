// Debug mode toggle - can be enabled via settings
const DEBUG_MODE = false;

// Logger utility for conditional debug logging
class Logger {
  static debug(...args) {
    if (DEBUG_MODE) {
      console.log("[DEBUG]", ...args);
    }
  }

  static error(...args) {
    console.error("[ERROR]", ...args);
  }

  static info(...args) {
    if (DEBUG_MODE) {
      console.log("[INFO]", ...args);
    }
  }
}

// Error handler utility
class ErrorHandler {
  static handle(error, context) {
    Logger.error(`Error in ${context}:`, error);

    const userMessage = this.getUserFriendlyMessage(error);
    this.showNotification(userMessage, "error");
  }

  static getUserFriendlyMessage(error) {
    if (error.message.includes("API key")) {
      return "Please check your API key in settings";
    }
    if (error.message.includes("network")) {
      return "Network error. Please check your connection";
    }
    if (error.message.includes("rate limit")) {
      return "Too many requests. Please wait a moment and try again";
    }
    return "An unexpected error occurred. Please try again.";
  }

  static showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `vibe-notification vibe-notification-${type}`;
    notification.textContent = message;

    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 6px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      max-width: 300px;
      word-wrap: break-word;
      animation: vibeSlideIn 0.3s ease-out;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    // Set background color based on type
    switch (type) {
      case "success":
        notification.style.backgroundColor = "#10b981";
        break;
      case "error":
        notification.style.backgroundColor = "#ef4444";
        break;
      case "warning":
        notification.style.backgroundColor = "#f59e0b";
        break;
      default:
        notification.style.backgroundColor = "#3b82f6";
    }

    // Add animation styles
    const style = document.createElement("style");
    style.textContent = `
      @keyframes vibeSlideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.remove();
      style.remove();
    }, 5000);
  }
}

// Initialize services
let platformManager = null;
let cssManager = null;
let modalManager = null;
let aiService = null;
let globalActivePost = null; // Global reference to active post

// Initialize the architecture
async function initializeServices() {
  try {
    Logger.debug("✅ Content script loaded");
    Logger.debug("📍 Current URL:", window.location.href);

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

// Inject button under post with improved error handling
function injectButtonUnderPost() {
  try {
    Logger.debug("🔍 injectButtonUnderPost called");
    Logger.debug("📊 Platform manager:", !!platformManager);

    if (!platformManager) {
      Logger.error("Platform manager not initialized");
      return;
    }

    const platform = platformManager.getCurrentPlatform();
    if (platform) {
      Logger.debug("✅ Using platform manager injection");
      injectButtonWithPlatformManager();
    } else {
      Logger.debug("⚠️ Using legacy injection");
      injectButtonWithLegacyLogic();
    }
  } catch (error) {
    ErrorHandler.handle(error, "injectButtonUnderPost");
  }
}

// Process posts with platform manager
function injectButtonWithPlatformManager() {
  try {
    const platform = platformManager.getCurrentPlatform();
    if (!platform) {
      Logger.error("No platform detected");
      return;
    }

    const posts = platform.findPosts();
    Logger.debug(`📊 Found ${posts.length} posts to process`);

    processPosts(posts, platform);
  } catch (error) {
    ErrorHandler.handle(error, "injectButtonWithPlatformManager");
  }
}

// Process posts with retry mechanism
function processPostsWithRetry() {
  let retryCount = 0;
  const maxRetries = 3;
  const retryDelay = 2000;

  function attemptProcessing() {
    try {
      injectButtonUnderPost();
    } catch (error) {
      retryCount++;
      Logger.error(`Processing attempt ${retryCount} failed:`, error);

      if (retryCount < maxRetries) {
        Logger.info(`Retrying in ${retryDelay}ms...`);
        setTimeout(attemptProcessing, retryDelay);
      } else {
        ErrorHandler.handle(error, "processPostsWithRetry");
      }
    }
  }

  attemptProcessing();
}

// Process individual posts
function processPosts(posts, platform) {
  Logger.debug(`🔍 Processing ${posts.length} posts...`);

  posts.forEach((post, index) => {
    try {
      Logger.debug(`🔍 Processing post ${index}:`, {
        hasButton: !!post.querySelector(".vibe-btn"),
        postText: post.innerText?.slice(0, 100) + "...",
      });

      // Skip if button already exists
      if (post.querySelector(".vibe-btn")) {
        Logger.debug(`⏭️ Post ${index}: Button already exists, skipping`);
        return;
      }

      // Find action button
      const actionButton = platform.findActionButton(post);
      if (!actionButton) {
        Logger.debug(`❌ Post ${index}: No action button found`);
        return;
      }

      // Create and inject button
      const btn = platform.createActionButton();
      if (!btn) {
        Logger.debug(`❌ Post ${index}: Failed to create button`);
        return;
      }

      Logger.debug(`✅ Post ${index}: Created button:`, btn);
      Logger.debug(`🎯 Button text: "${btn.innerText}"`);

      // Add click handler
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        Logger.debug(`🎯 Button clicked for post ${index}`);
        handleButtonClick(post, platform);
      });

      // Inject button
      Logger.debug(`🔍 Attempting to inject button for post ${index}...`);
      const injectionResult = platform.injectButton(post, btn);

      if (!injectionResult) {
        Logger.debug(
          `❌ Post ${index}: Injection failed, post structure:`,
          post
        );
        Logger.debug(`📊 Post classes:`, post.className);
        Logger.debug(`📊 Post children:`, post.children.length);
      }
    } catch (error) {
      Logger.error(`Error processing post ${index}:`, error);
    }
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
    btn.innerText = "📝✨";
    btn.className = "vibe-btn";

    btn.addEventListener("click", async () => {
      aiService.setActivePost(post);
      globalActivePost = post; // Store in global variable
      await handleButtonClick(post);
    });

    commentButton.parentElement?.appendChild(btn);
  });
}

// Handle button click with improved error handling
async function handleButtonClick(post, platform = null) {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      // Validate extension context
      if (!isExtensionContextValid()) {
        throw new Error("Extension context is invalid");
      }

      // Get storage data with proper error handling
      const result = await new Promise((resolve, reject) => {
        chrome.storage.local.get(
          ["vibeOpenAIKey", "vibeTone", "vibeEmoji", "lastSelectedTone"],
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
      const tone =
        result.lastSelectedTone || result.vibeTone || "Agreement with Value";

      Logger.debug("🎯 Tone selection:", {
        lastSelectedTone: result.lastSelectedTone,
        vibeTone: result.vibeTone,
        finalTone: tone,
      });

      // Complete emoji map
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
        "Funny Sarcastic": "🤪",
        "Perspective (Why / What / How)": "🔍",
        "Professional Industry Specific": "🏢",
      };

      const emoji = result.vibeEmoji || emojiMap[tone] || "💬";

      if (!apiKey || apiKey.trim() === "") {
        ErrorHandler.showNotification(
          "⚠️ Please set your OpenAI API key in the extension settings.",
          "warning"
        );
        return;
      }

      // Extract post text
      let postText;
      if (platform) {
        postText = platform.extractPostText(post);
      } else {
        postText = post.innerText.slice(0, 800);
      }

      // Clear previous post tags
      document.querySelectorAll("[data-vibe-post]").forEach((el) => {
        el.removeAttribute("data-vibe-post");
      });

      // Tag current post
      post.setAttribute("data-vibe-post", postText);

      await fetchSuggestions(apiKey, tone, emoji, postText, post);
      break; // Success, exit retry loop
    } catch (error) {
      retryCount++;
      Logger.error(`Button click attempt ${retryCount} failed:`, error);

      if (retryCount >= maxRetries) {
        ErrorHandler.handle(error, "handleButtonClick");
        return;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

// Fetch suggestions using AI service
async function fetchSuggestions(apiKey, tone, emoji, postText, postEl = null) {
  try {
    // Preserve the active post reference before modal operations
    const preservedActivePost = aiService.activePostElement;

    // Show loading modal
    const toneLabel = `${emoji} ${tone}`;
    const platformName = platformManager
      .getCurrentPlatform()
      ?.getPlatformName();

    await modalManager.show(toneLabel, [], "", true, platformName);

    // Restore the active post reference if it was lost
    if (!aiService.activePostElement && preservedActivePost) {
      aiService.setActivePost(preservedActivePost);
    }

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
      await modalManager.show(
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
    ErrorHandler.showNotification(`❌ Error: ${error.message}`, "error");

    // Hide modal on error
    modalManager.hide();
  }
}

// Handle tone change
async function handleToneChange(newTone) {
  try {
    console.log("🎯 Tone changed to:", newTone);

    // Save the last selected tone for future use
    await new Promise((resolve, reject) => {
      chrome.storage.local.set({ lastSelectedTone: newTone }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });

    console.log("✅ Last selected tone saved:", newTone);

    const result = await new Promise((resolve, reject) => {
      chrome.storage.local.get(
        ["vibeOpenAIKey", "vibeEmoji", "customTones"],
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
      "Funny Sarcastic": "🤪",
      "Perspective (Why / What / How)": "🔍",
      "Professional Industry Specific": "🏢",
    };

    // Add custom tones to emoji map
    const customTones = result.customTones || {};
    Object.keys(customTones).forEach((toneName) => {
      emojiMap[toneName] = customTones[toneName].emoji;
    });

    const emoji = result.vibeEmoji || emojiMap[newTone] || "💬";

    if (!apiKey) {
      ErrorHandler.showNotification(
        "⚠️ Please set your OpenAI API key in the extension settings.",
        "warning"
      );
      return;
    }

    // Find the active post dynamically by looking for the modal and finding associated posts
    let activePost = null;

    // Method 1: Look for posts with vibe-btn that are near the modal
    const modal = document.querySelector("#vibe-modal");
    if (modal) {
      console.log("🔍 Modal found, looking for nearby posts...");

      // Find all posts with vibe buttons
      const postsWithButtons = document.querySelectorAll("[data-vibe-post]");
      console.log("🔍 Found posts with vibe buttons:", postsWithButtons.length);

      // Find the post that's closest to the modal or has the most recent interaction
      for (let post of postsWithButtons) {
        const vibeBtn = post.querySelector(".vibe-btn");
        if (vibeBtn) {
          // Check if this post has a vibe button that was recently clicked
          // We'll use the post that has the most recent timestamp or is closest to modal
          activePost = post;
          console.log("🔍 Found potential active post:", post);
          break;
        }
      }
    }

    // Method 2: If no post found near modal, try to find any post with a vibe button
    if (!activePost) {
      console.log(
        "🔍 No post found near modal, looking for any post with vibe button..."
      );
      const anyPostWithButton = document.querySelector("[data-vibe-post]");
      if (anyPostWithButton) {
        activePost = anyPostWithButton;
        console.log("🔍 Found fallback active post:", activePost);
      }
    }

    // Method 3: Last resort - try to find any post element
    if (!activePost) {
      console.log(
        "🔍 No posts with vibe buttons found, looking for any post element..."
      );
      const platform = platformManager.getCurrentPlatform();
      if (platform) {
        const posts = platform.findPosts();
        if (posts && posts.length > 0) {
          activePost = posts[0];
          console.log("🔍 Found first available post:", activePost);
        }
      }
    }

    if (!activePost) {
      console.error("❌ No active post found using any method");
      ErrorHandler.showNotification(
        "❌ No active post found. Please try again.",
        "error"
      );
      return;
    }

    console.log("✅ Active post found dynamically:", activePost);

    const platform = platformManager.getCurrentPlatform();
    let postText;
    if (platform) {
      postText = platform.extractPostText(activePost);
      console.log(
        "✅ Post text extracted using platform:",
        postText.slice(0, 100) + "..."
      );
    } else {
      postText = activePost.innerText.slice(0, 800);
      console.log(
        "✅ Post text extracted using fallback:",
        postText.slice(0, 100) + "..."
      );
    }

    if (!postText || postText.trim() === "") {
      console.error("❌ No post text extracted");
      ErrorHandler.showNotification(
        "❌ Could not extract post text. Please try again.",
        "error"
      );
      return;
    }

    // Update the aiService with the found post
    aiService.setActivePost(activePost);
    globalActivePost = activePost;

    // Fetch new suggestions with the new tone
    await fetchSuggestions(apiKey, newTone, emoji, postText, activePost);
  } catch (error) {
    console.error("❌ Failed to change tone:", error);
    ErrorHandler.showNotification(
      `❌ Error changing tone: ${error.message}`,
      "error"
    );
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
    Logger.error("❌ Failed to improve comment:", error);
    ErrorHandler.showNotification(
      `❌ Error improving comment: ${error.message}`,
      "error"
    );
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
    setInterval(processPostsWithRetry, 2000);
  } else {
    console.log("⚠️ Using legacy button injection");
    // Fall back to legacy injection
    setInterval(processPostsWithRetry, 2000);
  }
});

// Add debugging for Farcaster specifically
if (
  window.location.hostname.includes("farcaster.xyz") ||
  window.location.hostname.includes("warpcast.com")
) {
  console.log("🔍 Farcaster detected, adding extra debugging");

  // Check if platform manager is working
  setTimeout(() => {
    if (platformManager) {
      const platform = platformManager.getCurrentPlatform();
      console.log("🎯 Current platform:", platform?.getPlatformName());

      if (platform) {
        const posts = platform.findPosts();
        console.log("📊 Found posts:", posts.length);
        posts.forEach((post, index) => {
          console.log(`📝 Post ${index}:`, {
            textContent: post.textContent?.slice(0, 100) + "...",
            className: post.className,
            id: post.id,
          });
        });
      }
    }
  }, 3000);
}

// Fallback: Ensure CSS is applied even if services fail
setTimeout(() => {
  if (!cssManager) {
    console.log("🔄 Fallback: Applying basic CSS");
    const fallbackCSS = `
      /* Extension-specific button styling only - very specific */
      button.vibe-btn,
      .vibe-btn {
        background-color: rgb(139, 92, 246) !important;
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
        background-color: rgb(124, 82, 221) !important;
      }
      
      /* Modal-specific styling only */
      #vibe-modal {
        position: fixed;
        bottom: 30px;
        right: 30px;
        z-index: 999999;
        background: white;
        border: 2px solid rgb(139, 92, 246);
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
