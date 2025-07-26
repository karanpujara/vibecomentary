/**
 * Platform Manager
 * Detects and manages different social media platforms
 */
class PlatformManager {
  constructor() {
    this.platforms = new Map();
    this.currentPlatform = null;
    this.initializePlatforms();
  }

  initializePlatforms() {
    // Register all available platforms
    this.registerPlatform(new LinkedInPlatform());
    this.registerPlatform(new XPlatform());
    this.registerPlatform(new FarcasterPlatform());
    // Add more platforms here as they're implemented
  }

  registerPlatform(platform) {
    this.platforms.set(platform.getPlatformName(), platform);
    console.log(`✅ Registered platform: ${platform.getPlatformName()}`);
  }

  detectPlatform() {
    for (const [name, platform] of this.platforms) {
      if (platform.isPlatformPage()) {
        this.currentPlatform = platform;
        console.log(`🎯 Detected platform: ${name}`);
        return platform;
      }
    }

    console.log("❌ No supported platform detected");
    return null;
  }

  getCurrentPlatform() {
    if (!this.currentPlatform) {
      this.currentPlatform = this.detectPlatform();
    }
    return this.currentPlatform;
  }

  isSupportedPlatform() {
    return this.getCurrentPlatform() !== null;
  }

  getSupportedPlatforms() {
    return Array.from(this.platforms.keys());
  }

  // Helper methods that delegate to current platform
  getPlatformName() {
    const platform = this.getCurrentPlatform();
    return platform ? platform.getPlatformName() : "Unknown";
  }

  getPlatformIcon() {
    const platform = this.getCurrentPlatform();
    return platform ? platform.getPlatformIcon() : "❓";
  }

  getPageType() {
    const platform = this.getCurrentPlatform();
    return platform ? platform.getPageType() : "unknown";
  }

  findPosts() {
    const platform = this.getCurrentPlatform();
    return platform ? platform.findPosts() : [];
  }

  extractPostText(post) {
    const platform = this.getCurrentPlatform();
    return platform ? platform.extractPostText(post) : "";
  }

  extractAuthorName(post) {
    const platform = this.getCurrentPlatform();
    return platform ? platform.extractAuthorName(post) : "the author";
  }

  extractUserProfileName() {
    const platform = this.getCurrentPlatform();
    return platform ? platform.extractUserProfileName() : "Your Name";
  }

  findActionButton(post) {
    const platform = this.getCurrentPlatform();
    return platform ? platform.findActionButton(post) : null;
  }

  injectButton(post, buttonElement) {
    const platform = this.getCurrentPlatform();
    return platform ? platform.injectButton(post, buttonElement) : false;
  }

  getContentTypes() {
    const platform = this.getCurrentPlatform();
    return platform ? platform.getContentTypes() : ["comment"];
  }

  formatComment(comment, authorName) {
    const platform = this.getCurrentPlatform();
    return platform ? platform.formatComment(comment, authorName) : comment;
  }

  formatDM(dm, authorName, userProfileName) {
    const platform = this.getCurrentPlatform();
    return platform ? platform.formatDM(dm, authorName, userProfileName) : dm;
  }

  getCharacterLimits() {
    const platform = this.getCurrentPlatform();
    return platform
      ? platform.getCharacterLimits()
      : { comment: 1000, dm: 1000, reply: 1000 };
  }

  getToneMappings() {
    const platform = this.getCurrentPlatform();
    return platform ? platform.getToneMappings() : {};
  }

  getDefaultPrompts() {
    const platform = this.getCurrentPlatform();
    return platform ? platform.getDefaultPrompts() : {};
  }

  getDefaultGuidelines() {
    const platform = this.getCurrentPlatform();
    return platform ? platform.getDefaultGuidelines() : {};
  }

  // Platform-specific button creation
  createActionButton(platformName) {
    const platform = this.getCurrentPlatform();
    if (!platform) {
      return null;
    }

    // Delegate to the current platform's createActionButton method
    return platform.createActionButton(platformName);
  }

  // Platform-specific modal customization
  getModalTitle() {
    const platform = this.getCurrentPlatform();
    if (!platform) return "📝✨";

    return `${platform.getPlatformIcon()} 📝✨`;
  }

  // Platform-specific content type labels
  getContentTypeLabels() {
    const platform = this.getCurrentPlatform();
    if (!platform) return { comment: "Comment", dm: "DM" };

    const platformName = platform.getPlatformName();
    switch (platformName) {
      case "LinkedIn":
        return { comment: "Comment", dm: "DM" };
      case "X (Twitter)":
        return { comment: "Reply", dm: "DM" };
      case "Farcaster":
        return { comment: "Cast", dm: "Message" };
      default:
        return { comment: "Comment", dm: "DM" };
    }
  }

  // Platform-specific validation
  validateContent(content, contentType) {
    const platform = this.getCurrentPlatform();
    if (!platform) return { valid: true, message: "" };

    const limits = platform.getCharacterLimits();
    const limit = limits[contentType] || 1000;

    if (content.length > limit) {
      return {
        valid: false,
        message: `Content exceeds ${platform.getPlatformName()} limit of ${limit} characters`,
      };
    }

    return { valid: true, message: "" };
  }

  // Platform-specific error messages
  getErrorMessage(errorType) {
    const platform = this.getCurrentPlatform();
    const platformName = platform
      ? platform.getPlatformName()
      : "this platform";

    const messages = {
      no_posts_found: `No posts found on ${platformName}. Please refresh the page and try again.`,
      no_author_found: `Could not find the author name on ${platformName}.`,
      no_profile_found: `Could not find your profile name on ${platformName}.`,
      injection_failed: `Failed to inject button on ${platformName}. Please refresh the page.`,
      unsupported_platform: `This platform is not yet supported. Supported platforms: ${this.getSupportedPlatforms().join(
        ", "
      )}`,
    };

    return messages[errorType] || "An error occurred. Please try again.";
  }

  // Debug information
  getDebugInfo() {
    const platform = this.getCurrentPlatform();
    return {
      currentPlatform: platform ? platform.getPlatformName() : "None",
      supportedPlatforms: this.getSupportedPlatforms(),
      pageType: this.getPageType(),
      isSupported: this.isSupportedPlatform(),
      url: window.location.href,
    };
  }
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = PlatformManager;
}
