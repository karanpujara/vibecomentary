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
      /* Base styles for all platforms */
      
      /* Modal Container - positioned bottom-right like working backup */
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
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #666;
        padding: 4px;
        border-radius: 4px;
        transition: background-color 0.2s;
      }

      #vibe-close:hover {
        background-color: #f0f0f0;
      }

      /* Close button specific styling */
      #vibe-modal #vibe-close {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #333;
        padding: 4px;
        border-radius: 4px;
        transition: background-color 0.2s;
      }

      #vibe-modal #vibe-close:hover {
        background-color: #f0f0f0;
        color: #333;
      }

      /* Section Styling - ONLY for our extension */
      #vibe-modal .improve-section,
      #vibe-modal .tone-section,
      #vibe-modal .dm-section {
        margin-bottom: 16px;
        padding: 12px;
        background: #f8f9fa;
        border-radius: 6px;
        border: 1px solid #e9ecef;
      }

      /* Labels - ONLY for our extension */
      #vibe-modal label {
        font-weight: 600;
        color: #333;
        margin-bottom: 6px;
        display: block;
      }

      /* Form Elements - ONLY for our extension */
      #vibe-modal textarea,
      #vibe-modal select {
        width: 100%;
        padding: 7px;
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
        border-color: #0073b1;
        box-shadow: 0 0 0 2px rgba(0, 115, 177, 0.2);
        color: #333 !important;
        background-color: #ffffff !important;
      }

      #vibe-modal textarea[readonly] {
        background-color: #ffffff !important;
        color: #333 !important;
        cursor: text;
      }

      /* Buttons - ONLY for our extension elements (excluding close button) */
      #vibe-modal button:not(#vibe-close),
      #vibe-modal .copy-btn {
        background: #0073b1;
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
        background: #005a8b;
      }

      #vibe-modal button:disabled {
        background: #ccc;
        cursor: not-allowed;
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
          
          /* LinkedIn modal positioning */
          #vibe-modal {
            position: fixed;
            bottom: 30px;
            right: 30px;
            top: auto;
            left: auto;
            transform: none;
            width: 420px;
            max-height: 80vh;
          }

          /* LinkedIn-specific content styling */
          #vibe-modal .vibe-comment {
            background: #f5f5f5;
            border: 1px solid #d1ecf1;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 14px;
          }

          #vibe-modal .dm-section {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 16px;
          }

          #vibe-modal .dm-section > div:first-child {
            color: #495057;
            font-weight: 600;
            margin-bottom: 8px;
          }

          /* LinkedIn tone section */
          #vibe-modal .tone-section {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 12px;
          }

          /* LinkedIn improve section */
          #vibe-modal .improve-section {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 20px;
          }

          /* LinkedIn responsive adjustments */
          @media (max-width: 768px) {
            #vibe-modal {
              bottom: 20px;
              right: 20px;
              width: calc(100vw - 40px);
              max-width: 400px;
            }
          }
        `;
        break;

      case "X (Twitter)":
        platformCSS = `
          /* X (Twitter) specific styles - scoped to our extension only */
          
          /* X modal positioning - same as LinkedIn (bottom-right) */
          #vibe-modal {
            position: fixed !important;
            bottom: 30px !important;
            right: 30px !important;
            top: auto !important;
            left: auto !important;
            transform: none !important;
            width: 420px !important;
            max-height: 80vh !important;
            border-radius: 8px !important;
            border: 2px solid #0073b1 !important;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
            background: white !important;
            z-index: 999999 !important;
          }

          /* X-specific content styling - same as LinkedIn */
          #vibe-modal .vibe-comment {
            background: #f5f5f5;
            border: 1px solid #d1ecf1;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 14px;
          }

          #vibe-modal .dm-section {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 16px;
          }

          #vibe-modal .dm-section > div:first-child {
            color: #495057;
            font-weight: 600;
            margin-bottom: 8px;
          }

          /* X tone section - same as LinkedIn */
          #vibe-modal .tone-section {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 12px;
          }

          /* X improve section - same as LinkedIn */
          #vibe-modal .improve-section {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 20px;
          }

          /* X-specific button styling - same as LinkedIn */
          #vibe-modal button {
            background: #0073b1;
            border-radius: 4px;
            font-weight: 500;
            padding: 6px 10px;
          }

          /* X button positioning and styling */
          .x-twitter .vibe-btn {
            background-color: #0073b1 !important;
            color: white !important;
            border: none !important;
            border-radius: 4px !important;
            padding: 6px 10px !important;
            margin: 0 !important;
            cursor: pointer !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            transition: background-color 0.2s !important;
            z-index: 1000 !important;
            display: inline-block !important;
          }

          .x-twitter .vibe-btn:hover {
            background-color: #005a8b !important;
          }

          #vibe-modal button:hover {
            background: #005a8b;
          }

          #vibe-modal .copy-btn {
            background: #6c757d !important;
            border-radius: 4px !important;
            color: white !important;
            border: none !important;
            padding: 6px 12px !important;
            cursor: pointer !important;
            font-size: 12px !important;
            margin-top: 6px !important;
            margin-right: 8px !important;
            transition: background-color 0.2s !important;
          }

          #vibe-modal #copy-dm {
            background: #6c757d !important;
            border-radius: 4px !important;
            color: white !important;
            border: none !important;
            padding: 6px 12px !important;
            cursor: pointer !important;
            font-size: 12px !important;
            margin-top: 6px !important;
            margin-right: 8px !important;
            transition: background-color 0.2s !important;
          }

          #vibe-modal .copy-btn:hover {
            background: #5a6268 !important;
          }

          #vibe-modal #copy-dm:hover {
            background: #5a6268 !important;
          }

          /* X form elements - same as LinkedIn */
          #vibe-modal textarea,
          #vibe-modal select {
            border: 1px solid #ddd;
            border-radius: 4px;
            background: #ffffff !important;
            color: #333 !important;
          }

          #vibe-modal textarea:focus,
          #vibe-modal select:focus {
            border-color: #0073b1;
            box-shadow: 0 0 0 2px rgba(0, 115, 177, 0.2);
            color: #333 !important;
            background: #ffffff !important;
          }

          /* X responsive adjustments - same as LinkedIn */
          @media (max-width: 768px) {
            #vibe-modal {
              bottom: 20px;
              right: 20px;
              width: calc(100vw - 40px);
              max-width: 400px;
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
        border: 2px solid #0073b1;
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
        background: #0073b1;
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
        background-color: #0073b1 !important;
        color: white !important;
        border: none !important;
        padding: 6px 12px !important;
        border-radius: 4px !important;
        cursor: pointer !important;
        font-size: 14px !important;
        margin-top: 8px !important;
      }

      #vibe-modal #improveCommentBtn:hover {
        background-color: #005a8b !important;
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
        background: #0073b1 !important;
        color: white !important;
        border: none !important;
        padding: 6px 12px !important;
        border-radius: 4px !important;
        cursor: pointer !important;
        margin-bottom: 12px !important;
      }

      #vibe-modal #copy-dm {
        background: #0073b1 !important;
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
