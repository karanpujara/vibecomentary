/**
 * Base class for all social media platforms
 * Defines the interface that all platform implementations must follow
 */
class BasePlatform {
  constructor() {
    if (this.constructor === BasePlatform) {
      throw new Error("BasePlatform cannot be instantiated directly");
    }
  }

  // Platform identification
  getPlatformName() {
    throw new Error("getPlatformName() must be implemented");
  }

  getPlatformIcon() {
    throw new Error("getPlatformIcon() must be implemented");
  }

  // Page detection
  isPlatformPage() {
    throw new Error("isPlatformPage() must be implemented");
  }

  getPageType() {
    throw new Error("getPageType() must be implemented");
  }

  // Content extraction
  findPosts() {
    throw new Error("findPosts() must be implemented");
  }

  extractPostText(post) {
    throw new Error("extractPostText() must be implemented");
  }

  extractAuthorName(post) {
    throw new Error("extractAuthorName() must be implemented");
  }

  extractUserProfileName() {
    throw new Error("extractUserProfileName() must be implemented");
  }

  // UI injection
  findActionButton(post) {
    throw new Error("findActionButton() must be implemented");
  }

  injectButton(post, buttonElement) {
    throw new Error("injectButton() must be implemented");
  }

  // Content types
  getContentTypes() {
    return ["comment", "reply", "quote", "dm"];
  }

  // Platform-specific formatting
  formatComment(comment, authorName) {
    return comment; // Default implementation
  }

  formatDM(dm, authorName, userProfileName) {
    return dm; // Default implementation
  }

  // Platform-specific limits
  getCharacterLimits() {
    return {
      comment: 1000,
      dm: 1000,
      reply: 1000,
    };
  }

  // Platform-specific tone mappings
  getToneMappings() {
    return {
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
  }

  // Platform-specific prompts
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

  // Platform-specific guidelines
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

  // Error handling
  handleError(error, context) {
    // Only log critical errors
    console.error(`[${this.getPlatformName()}] Error in ${context}:`, error);
    return {
      success: false,
      error: error.message,
      context,
    };
  }

  // Debug logging - reduced noise
  log(message, level = "info") {
    // Only log errors and warnings in production
    if (level === "info" || level === "debug") {
      return;
    }

    const prefix = `[${this.getPlatformName()}]`;
    switch (level) {
      case "error":
        console.error(prefix, message);
        break;
      case "warn":
        console.warn(prefix, message);
        break;
      default:
        // Skip info and debug logs
        break;
    }
  }
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = BasePlatform;
}
