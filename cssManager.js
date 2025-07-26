/**
 * CSS Manager
 * Handles platform-specific styling and CSS injection
 */
class CSSManager {
  constructor() {
    this.injectedStyles = new Set();
    this.platformClass = null;
  }

  /**
   * Initialize CSS for the current platform
   * @param {string} platformName - Name of the platform
   */
  initialize(platformName = "LinkedIn") {
    try {
      console.log(`🎨 Initializing CSS for platform: ${platformName}`);

      this.setPlatformClass(platformName);
      this.injectBaseCSS();
      this.injectPlatformCSS(platformName);

      console.log("✅ CSS initialization complete");
    } catch (error) {
      // CSS initialization failed silently
    }
  }

  /**
   * Set platform-specific CSS class
   * @param {string} platformName - Name of the platform
   */
  setPlatformClass(platformName) {
    const platformClasses = {
      LinkedIn: "linkedin",
      "X (Twitter)": "x-twitter",
      Farcaster: "farcaster",
    };

    this.platformClass = platformClasses[platformName] || "default";

    // Don't add platform class to body to avoid affecting the entire page
    // Instead, we'll use more specific CSS selectors
    console.log(
      `🎨 Platform detected: ${platformName} (class: ${this.platformClass})`
    );
  }

  /**
   * Inject base CSS
   */
  injectBaseCSS() {
    if (this.injectedStyles.has("base")) {
      return;
    }

    const baseCSS = `
      /* UNIFIED MODAL DESIGN FOR ALL PLATFORMS */
      /* Based on Farcaster's beautiful design */
      
      /* Modal Container */
      #vibe-modal {
        position: fixed;
        bottom: 30px;
        right: 30px;
        top: auto;
        left: auto;
        transform: none;
        width: 420px;
        max-height: 80vh;
        border-radius: 8px;
        border: 2px solid #8B5CF6;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        background: white;
        z-index: 999999;
        padding: 16px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-sizing: border-box;
        overflow-y: auto;
      }

      /* Modal Content - needs relative positioning for absolute close button */
      #vibe-modal .vibe-modal-content {
        position: relative;
      }

      /* Modal Header */
      .vibe-modal-content .vibe-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: bold;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid #eee;
      }

      #tone-heading {
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }

      #vibe-close {
        background: none !important;
        border: none !important;
        font-size: 18px !important;
        cursor: pointer !important;
        color: #333 !important;
        padding: 4px !important;
        border-radius: 4px !important;
        transition: background-color 0.2s !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        position: absolute !important;
        top: 8px !important;
        right: 8px !important;
        z-index: 1000 !important;
      }

      #vibe-close:hover {
        background-color: #f0f0f0 !important;
        color: #333 !important;
      }

      /* IMPROVE SECTION - Light Yellow */
      #vibe-modal .improve-section {
        background: #fef3c7;
        border: 1px solid #fde68a;
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 20px;
      }

      /* TONE SECTION - Light Blue */
      #vibe-modal .tone-section {
        background: #f0f9ff;
        border: 1px solid #bae6fd;
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 12px;
      }

      /* COMMENT BOXES - Light Gray */
      #vibe-modal .vibe-comment {
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 14px;
      }

      /* DM SECTION - Light Purple */
      #vibe-modal .dm-section {
        background: #f3e8ff;
        border: 1px solid #ddd6fe;
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 16px;
        margin-top: 16px;
      }

      /* DM SECTION LABEL - Ensure black text */
      #vibe-modal .dm-section > div:first-child {
        color: #333 !important;
        font-weight: bold !important;
        margin-bottom: 6px !important;
        font-size: 14px !important;
      }

      /* COMMENTS CONTAINER - Light Yellow */
      #vibe-modal .vibe-comments {
        background: #fef3c7;
        border: 1px solid #fde68a;
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 16px;
      }

      /* FORM ELEMENTS */
      #vibe-modal textarea,
      #vibe-modal select {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        font-family: inherit;
        box-sizing: border-box;
        transition: border-color 0.2s;
        color: #333 !important;
        background-color: #ffffff !important;
      }

      #vibe-modal textarea:focus,
      #vibe-modal select:focus {
        outline: none;
        border-color: #8B5CF6;
        box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
        color: #333 !important;
        background-color: #ffffff !important;
      }

      /* SPECIFIC SELECT ELEMENT STYLING - Ensure visibility */
      #vibe-modal #modalTone,
      #vibe-modal select#modalTone {
        color: #333 !important;
        background-color: #ffffff !important;
        font-size: 14px !important;
        font-weight: normal !important;
        text-shadow: none !important;
        -webkit-text-fill-color: #333 !important;
        -webkit-text-stroke: none !important;
        text-overflow: visible !important;
        overflow: visible !important;
        white-space: normal !important;
        line-height: 1.4 !important;
        padding: 8px !important;
        height: auto !important;
        min-height: 36px !important;
      }

      #vibe-modal #modalTone option,
      #vibe-modal select#modalTone option {
        color: #333 !important;
        background-color: #ffffff !important;
        font-size: 14px !important;
        font-weight: normal !important;
        text-shadow: none !important;
        -webkit-text-fill-color: #333 !important;
        -webkit-text-stroke: none !important;
        padding: 4px 8px !important;
        line-height: 1.4 !important;
        white-space: normal !important;
        text-overflow: visible !important;
        overflow: visible !important;
      }

      /* OVERRIDE ANY PLATFORM-SPECIFIC SELECT STYLING */
      #vibe-modal select,
      #vibe-modal select *,
      #vibe-modal #modalTone,
      #vibe-modal #modalTone * {
        color: #333 !important;
        background-color: #ffffff !important;
        font-size: 14px !important;
        font-weight: normal !important;
        text-shadow: none !important;
        -webkit-text-fill-color: #333 !important;
        -webkit-text-stroke: none !important;
        text-overflow: visible !important;
        overflow: visible !important;
        white-space: normal !important;
        line-height: 1.4 !important;
      }

      /* BUTTONS */
      #vibe-modal button:not(#vibe-close) {
        background: #8B5CF6;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: background-color 0.2s;
        margin-top: 6px;
      }

      #vibe-modal button:hover {
        background: #7C3AED;
      }

      #vibe-modal .copy-btn {
        background: #6c757d !important;
        color: white !important;
        border: none !important;
        padding: 6px 12px !important;
        border-radius: 4px !important;
        cursor: pointer !important;
        font-size: 12px !important;
        margin-top: 6px !important;
        margin-right: 8px !important;
        transition: background-color 0.2s !important;
        display: inline-block !important;
        text-align: center !important;
        user-select: none !important;
        pointer-events: auto !important;
        z-index: 1000 !important;
      }

      #vibe-modal .copy-btn:hover {
        background: #5a6268 !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
      }

      #vibe-modal .copy-btn:active {
        transform: translateY(0) !important;
        box-shadow: 0 1px 2px rgba(0,0,0,0.1) !important;
      }

      /* LABELS */
      #vibe-modal label {
        font-weight: 600;
        color: #333;
        margin-bottom: 6px;
        display: block;
      }

      /* EDITABLE CONTENT */
      .editable-content {
        width: 100%;
        padding: 8px;
        border-radius: 6px;
        border: 1px solid #ccc;
        font-size: 14px;
        color: #333;
        background-color: #ffffff;
        min-height: 40px;
        line-height: 1.4;
        margin-bottom: 8px;
        cursor: text;
        user-select: text;
        box-sizing: border-box;
      }

      .editable-content:focus {
        outline: none;
        border-color: #8B5CF6;
        box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
      }

      /* UNIFIED TEXT SELECTION - Common for all platforms */
      #vibe-modal ::selection,
      #vibe-modal *::selection,
      .editable-content::selection,
      .editable-content *::selection {
        background-color: #8B5CF6;
        color: white;
      }

      #vibe-modal ::-moz-selection,
      #vibe-modal *::-moz-selection,
      .editable-content::-moz-selection,
      .editable-content *::-moz-selection {
        background-color: #8B5CF6;
        color: white;
      }

      #vibe-modal .copy-btn {
        background: #6c757d !important;
        color: white !important;
        border: none !important;
        padding: 6px 12px !important;
        border-radius: 4px !important;
        cursor: pointer !important;
        font-size: 12px !important;
        margin-top: 6px !important;
        margin-right: 8px !important;
        transition: background-color 0.2s !important;
        display: inline-block !important;
        text-align: left !important;
      }

      #vibe-modal .copy-btn:hover {
        background: #5a6268 !important;
      }

      /* DM copy button specific styling */
      #vibe-modal #copy-dm {
        background: #6c757d !important;
        color: white !important;
        border: none !important;
        padding: 6px 12px !important;
        border-radius: 4px !important;
        cursor: pointer !important;
        font-size: 12px !important;
        margin-top: 6px !important;
        margin-right: 8px !important;
        transition: background-color 0.2s !important;
      }

      #vibe-modal #copy-dm:hover {
        background: #5a6268 !important;
      }

      /* Improved comment copy button specific styling */
      #vibe-modal #copyImprovedBtn {
        background: #6c757d !important;
        color: white !important;
        border: none !important;
        padding: 6px 12px !important;
        border-radius: 4px !important;
        cursor: pointer !important;
        font-size: 12px !important;
        transition: background-color 0.2s !important;
      }

      #vibe-modal #copyImprovedBtn:hover {
        background: #5a6268 !important;
      }

      /* Platform-specific button - make it very specific */
      button.vibe-btn,
      .vibe-btn {
        background-color: #8B5CF6 !important;
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

      /* Loading States - ONLY for our extension */
      #vibe-modal #improveLoader {
        color: #666;
        font-style: italic;
        display: none;
      }

      #vibe-modal #improvedCommentBox {
        display: none;
      }

      /* Improved Comment Box - ONLY for our extension */
      #vibe-modal #improvedCommentBox {
        background: #f0f8f0;
        border: 1px solid #d4edda;
        padding: 12px;
        border-radius: 6px;
        margin-bottom: 16px;
      }

      #vibe-modal #improvedCommentBox strong {
        color: #155724;
      }

      #vibe-modal #improvedCommentText {
        margin: 8px 0;
        line-height: 1.5;
        color: #333;
      }

      /* Responsive Design */
      @media (max-width: 480px) {
        #vibe-modal {
          width: 95vw;
          padding: 12px;
        }
        
        .vibe-btn {
          font-size: 12px;
          padding: 4px 8px;
        }
      }

      /* Accessibility - ONLY for our extension */
      @media (prefers-reduced-motion: reduce) {
        #vibe-modal * {
          transition: none !important;
        }
      }

      /* High contrast mode */
      @media (prefers-contrast: high) {
        #vibe-modal {
          border-width: 3px;
        }
        
        #vibe-modal button {
          border: 2px solid currentColor;
        }
      }

      /* Character Counter - ONLY for our extension */
      #vibe-modal .char-counter {
        font-size: 12px;
        color: #666;
        margin-top: 4px;
      }
    `;

    this.injectCSS(baseCSS, "vibe-base-css");
    this.injectedStyles.add("base");
    console.log("🎨 Unified CSS injected successfully");
  }

  /**
   * Inject platform-specific CSS
   * @param {string} platformName - Name of the platform
   */
  injectPlatformCSS(platformName) {
    if (this.injectedStyles.has(`platform-${platformName}`)) {
      return;
    }

    let platformCSS = "";

    switch (platformName) {
      case "LinkedIn":
        platformCSS = `
          /* LinkedIn-specific styles - scoped to our extension only */
          /* ✅ ALL MODAL STYLING NOW HANDLED BY UNIFIED CSS */
          
          /* LinkedIn Button Styling - Center above comment button */
          /* Only apply to LinkedIn pages to avoid conflicts with X */
          .feed-shared-update-v2 .vibe-btn,
          [data-test-id="post-content"] .vibe-btn,
          .artdeco-card .vibe-btn {
            background-color: #8B5CF6 !important;
            color: white !important;
            border: 2px solid #8B5CF6 !important;
            border-radius: 8px !important;
            padding: 6px 12px !important;
            margin: 6px auto !important;
            cursor: pointer !important;
            font-size: 13px !important;
            font-weight: 600 !important;
            transition: all 0.2s ease !important;
            display: block !important;
            width: fit-content !important;
            text-align: center !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            box-sizing: border-box !important;
            text-decoration: none !important;
            line-height: 1.3 !important;
            white-space: nowrap !important;
            overflow: visible !important;
            text-overflow: unset !important;
            max-width: none !important;
            position: relative !important;
            z-index: 1 !important;
            min-width: 80px !important;
          }

          .feed-shared-update-v2 .vibe-btn:hover,
          [data-test-id="post-content"] .vibe-btn:hover,
          .artdeco-card .vibe-btn:hover {
            background-color: #7C3AED !important;
            transform: translateY(-1px) !important;
            box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3) !important;
          }

          .feed-shared-update-v2 .vibe-btn:active,
          [data-test-id="post-content"] .vibe-btn:active,
          .artdeco-card .vibe-btn:active {
            transform: translateY(0) !important;
            box-shadow: 0 1px 4px rgba(139, 92, 246, 0.3) !important;
          }

          /* Center the button in LinkedIn's action bar */
          .feed-shared-update-v2 .social-actions__comment-button + .vibe-btn,
          .feed-shared-update-v2 button[aria-label*="Comment"] + .vibe-btn,
          [data-test-id="post-content"] .social-actions__comment-button + .vibe-btn,
          [data-test-id="post-content"] button[aria-label*="Comment"] + .vibe-btn {
            margin: 8px auto !important;
            display: block !important;
            width: fit-content !important;
          }

          /* Ensure proper spacing when button is before comment button */
          .feed-shared-update-v2 .vibe-btn + .social-actions__comment-button,
          .feed-shared-update-v2 .vibe-btn + button[aria-label*="Comment"],
          [data-test-id="post-content"] .vibe-btn + .social-actions__comment-button,
          [data-test-id="post-content"] .vibe-btn + button[aria-label*="Comment"] {
            margin-top: 4px !important;
          }
          
          /* LinkedIn responsive adjustments */
          @media (max-width: 768px) {
            #vibe-modal {
              bottom: 20px;
              right: 20px;
              width: calc(100vw - 40px);
              max-width: 400px;
            }
            
            .feed-shared-update-v2 .vibe-btn,
            [data-test-id="post-content"] .vibe-btn,
            .artdeco-card .vibe-btn {
              font-size: 11px !important;
              padding: 4px 8px !important;
              min-width: 70px !important;
            }
          }
        `;
        break;

      case "X (Twitter)":
        platformCSS = `
          /* X (Twitter) specific styles - scoped to our extension only */
          /* ✅ ALL MODAL STYLING NOW HANDLED BY UNIFIED CSS */
          
          /* X Button Styling - Make it look proper and centered */
          .vibe-btn {
            background-color: #8B5CF6 !important;
            color: white !important;
            border: none !important;
            border-radius: 20px !important;
            padding: 6px 12px !important;
            margin: 6px 0 !important;
            cursor: pointer !important;
            font-size: 13px !important;
            font-weight: 600 !important;
            transition: all 0.2s ease !important;
            display: block !important;
            width: fit-content !important;
            text-align: center !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            box-sizing: border-box !important;
            text-decoration: none !important;
            line-height: 1.3 !important;
            white-space: nowrap !important;
            overflow: visible !important;
            text-overflow: unset !important;
            max-width: none !important;
            position: relative !important;
            z-index: 1 !important;
            min-width: 80px !important;
          }

          .vibe-btn:hover {
            background-color: #7C3AED !important;
            transform: translateY(-1px) !important;
            box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3) !important;
          }

          .vibe-btn:active {
            transform: translateY(0) !important;
            box-shadow: 0 1px 4px rgba(139, 92, 246, 0.3) !important;
          }

          /* Center the button in X's action bar */
          [data-testid="tweet"] .vibe-btn {
            margin: 8px auto !important;
            display: block !important;
            width: fit-content !important;
          }

          /* Ensure proper spacing in action button area */
          [data-testid="tweet"] [role="group"] + .vibe-btn,
          [data-testid="tweet"] [data-testid="reply"] + .vibe-btn {
            margin-top: 8px !important;
            margin-bottom: 8px !important;
          }
          
          /* X responsive adjustments */
          @media (max-width: 768px) {
            #vibe-modal {
              bottom: 20px;
              right: 20px;
              width: calc(100vw - 40px);
              max-width: 400px;
            }
            
            .vibe-btn {
              font-size: 11px !important;
              padding: 4px 8px !important;
              max-width: 80px !important;
            }
          }
        `;
        break;

      case "Farcaster":
        platformCSS = `
          /* Farcaster-specific styles - scoped to our extension only */
          /* ✅ ALL MODAL STYLING NOW HANDLED BY UNIFIED CSS */
          
          /* Farcaster Button Styling - Square design to match X */
          .vibe-btn.farcaster-btn {
            background-color: #8B5CF6 !important;
            color: white !important;
            border: 2px solid #8B5CF6 !important;
            border-radius: 8px !important;
            padding: 6px 12px !important;
            margin: 6px 0 !important;
            cursor: pointer !important;
            font-size: 13px !important;
            font-weight: 600 !important;
            transition: all 0.2s ease !important;
            display: inline-block !important;
            width: fit-content !important;
            text-align: center !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            box-sizing: border-box !important;
            text-decoration: none !important;
            line-height: 1.3 !important;
            white-space: nowrap !important;
            overflow: visible !important;
            text-overflow: unset !important;
            max-width: none !important;
            position: relative !important;
            z-index: 1 !important;
            min-width: 80px !important;
          }

          .vibe-btn.farcaster-btn:hover {
            background-color: #7C3AED !important;
            transform: translateY(-1px) !important;
            box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3) !important;
          }

          .vibe-btn.farcaster-btn:active {
            transform: translateY(0) !important;
            box-shadow: 0 1px 4px rgba(139, 92, 246, 0.3) !important;
          }
          
          /* Farcaster responsive adjustments */
          @media (max-width: 768px) {
            #vibe-modal {
              bottom: 20px;
              right: 20px;
              width: calc(100vw - 40px);
              max-width: 400px;
            }
            
            .vibe-btn.farcaster-btn {
              font-size: 11px !important;
              padding: 4px 8px !important;
              min-width: 70px !important;
            }
          }
        `;
        break;

      default:
        // Default platform styles (if any)
        break;
    }

    if (platformCSS) {
      this.injectCSS(platformCSS, `vibe-${platformName.toLowerCase()}-css`);
      this.injectedStyles.add(`platform-${platformName}`);
      console.log(`🎨 Platform CSS injected for: ${platformName}`);
    }
  }

  /**
   * Inject CSS into the page
   * @param {string} css - CSS content
   * @param {string} id - Unique ID for the style element
   */
  injectCSS(css, id) {
    // Remove existing style element if it exists
    const existingStyle = document.getElementById(id);
    if (existingStyle) {
      existingStyle.remove();
    }

    // Create new style element
    const style = document.createElement("style");
    style.id = id;
    style.textContent = css;
    document.head.appendChild(style);

    console.log(`🎨 Injected CSS: ${id}`);
  }

  /**
   * Remove all injected styles
   */
  cleanup() {
    // Remove all injected style elements
    this.injectedStyles.forEach((styleId) => {
      const styleElement = document.getElementById(`vibe-${styleId}-css`);
      if (styleElement) {
        styleElement.remove();
      }
    });

    this.injectedStyles.clear();
    this.platformClass = null;

    console.log("🧹 Cleaned up all injected styles");
  }

  /**
   * Get current platform class
   * @returns {string} Platform CSS class
   */
  getPlatformClass() {
    return this.platformClass;
  }

  /**
   * Check if styles are injected
   * @param {string} styleType - Type of style to check
   * @returns {boolean} Whether the style is injected
   */
  isStyleInjected(styleType) {
    return this.injectedStyles.has(styleType);
  }

  getModalCSS() {
    return `
      /* Modal-specific styling only */
      #vibe-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 999999;
        background: white;
        border: 2px solid rgb(139, 92, 246);
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        padding: 16px;
        width: 350px;
        font-family: sans-serif;
      }

      .vibe-modal-content .vibe-header {
        display: flex;
        justify-content: space-between;
        font-weight: bold;
        margin-bottom: 12px;
      }

      .vibe-comments textarea {
        width: 100%;
        height: 60px;
        resize: none;
        margin-bottom: 8px;
        font-size: 14px;
      }

      .copy-btn {
        background: rgb(139, 92, 246);
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        margin-bottom: 12px;
      }

      #vibe-modal #vibe-close {
        background: none !important;
        border: none !important;
        color: #666 !important;
        font-size: 18px !important;
        cursor: pointer !important;
        padding: 0 !important;
        margin: 0 !important;
      }

      #vibe-modal #vibe-close:hover {
        color: #333 !important;
      }

      #vibe-modal #improveCommentBtn {
        background-color: rgb(139, 92, 246) !important;
        color: white !important;
        border: none !important;
        padding: 6px 12px !important;
        border-radius: 4px !important;
        cursor: pointer !important;
        font-size: 14px !important;
        margin-top: 8px !important;
      }

      #vibe-modal #improveCommentBtn:hover {
        background-color: rgb(124, 82, 221) !important;
      }

      #vibe-modal select {
        border: 1px solid #ccc !important;
        border-radius: 4px !important;
        padding: 4px !important;
        font-size: 14px !important;
        background: white !important;
      }

      #vibe-modal #improvedCommentBox {
        background: #f3f3f3 !important;
        border: 1px solid #ccc !important;
        border-radius: 6px !important;
        padding: 10px !important;
        margin-bottom: 16px !important;
      }

      #vibe-modal #copyImprovedBtn {
        background: rgb(139, 92, 246) !important;
        color: white !important;
        border: none !important;
        padding: 6px 12px !important;
        border-radius: 4px !important;
        cursor: pointer !important;
        margin-bottom: 12px !important;
      }

      #vibe-modal #copy-dm {
        background: rgb(139, 92, 246) !important;
        color: white !important;
        border: none !important;
        padding: 6px 12px !important;
        border-radius: 4px !important;
        cursor: pointer !important;
        margin-bottom: 12px !important;
      }
    `;
  }
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = CSSManager;
}
