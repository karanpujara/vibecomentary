/**
 * LinkedIn platform implementation
 * Extends BasePlatform with LinkedIn-specific functionality
 */
class LinkedInPlatform extends BasePlatform {
  constructor() {
    super();
  }

  getPlatformName() {
    return "LinkedIn";
  }

  getPlatformIcon() {
    return "💼";
  }

  isPlatformPage() {
    return window.location.hostname.includes("linkedin.com");
  }

  getPageType() {
    if (
      window.location.pathname.includes("/post/") ||
      window.location.pathname.includes("/posts/")
    ) {
      return "individual-post";
    }
    return "feed";
  }

  findPosts() {
    const pageType = this.getPageType();

    if (pageType === "individual-post") {
      this.log("🔍 Detected individual post page");
      const individualPost =
        document.querySelector('[data-test-id="post-content"]') ||
        document.querySelector(".feed-shared-update-v2") ||
        document.querySelector('[data-test-id="post"]') ||
        document.querySelector(".artdeco-card");

      if (individualPost) {
        this.log("✅ Found individual post container");
        return [individualPost];
      } else {
        this.log("❌ No individual post container found");
        return [];
      }
    } else {
      this.log("🔍 Detected feed page");
      const posts = document.querySelectorAll("div.feed-shared-update-v2");
      this.log(`📊 Found ${posts.length} feed posts`);
      return Array.from(posts);
    }
  }

  extractPostText(post) {
    return post.innerText.slice(0, 800);
  }

  extractAuthorName(post) {
    this.log("🔍 Attempting to extract author name...");

    // Look specifically for the actual post author, avoiding engagement text
    const primaryAuthorSelectors = [
      // Target the main post author container (not engagement text)
      ".update-components-actor__title .vkuIMwJqnfPHDzHlNmoKRlkfXcRjORP",
      ".update-components-actor__title span",
      ".update-components-actor__title",

      // Look for the main post author link
      ".update-components-actor__meta-link .update-components-actor__title",
      ".update-components-actor__meta-link",

      // Fallback to general actor selectors
      ".feed-shared-actor__name",
      ".feed-shared-actor__name-link",
      '[data-test-id="post-author"]',
      '[data-test-id="author-name"]',
    ];

    let nameElem = null;
    for (const selector of primaryAuthorSelectors) {
      nameElem = post.querySelector(selector);
      if (nameElem) {
        this.log(`✅ Found author element with selector: ${selector}`);
        break;
      }
    }

    let fullName = "";
    if (nameElem) {
      fullName = nameElem.innerText.trim();
      this.log(`📝 Raw author name: "${fullName}"`);

      // Additional validation: check if this looks like a real author name
      if (this.isValidAuthorName(fullName)) {
        this.log(`✅ Valid author name found: "${fullName}"`);
      } else {
        this.log(`⚠️ Potentially invalid author name, trying fallback...`);
        fullName = this.findNameInPostHeader(post);
      }
    } else {
      this.log("❌ No author element found with primary selectors");
      fullName = this.findNameInPostHeader(post);
    }

    // Final validation: make sure we didn't pick up engagement text
    if (fullName && this.containsEngagementText(fullName)) {
      this.log(
        `⚠️ Name contains engagement text, trying alternative extraction...`
      );
      fullName = this.findAlternativeAuthorName(post);
    }

    return this.processAuthorName(fullName);
  }

  containsEngagementText(text) {
    const engagementPatterns = [
      /likes?\s+this/i,
      /and\s+\d+\s+others/i,
      /reposted/i,
      /shared/i,
      /commented/i,
      /celebrates/i,
      /congratulates/i,
    ];

    return engagementPatterns.some((pattern) => pattern.test(text));
  }

  findAlternativeAuthorName(post) {
    this.log("🔄 Trying alternative author name extraction...");

    // Look specifically for the actual post author area, avoiding engagement text
    const authorArea =
      post.querySelector(".update-components-actor") ||
      post.querySelector(".feed-shared-actor") ||
      post;

    // Look for the first valid name that's not engagement text
    const allTextElements = authorArea.querySelectorAll(
      "a, span, div, strong, b"
    );

    for (const element of allTextElements) {
      const text = element.textContent?.trim();
      if (
        text &&
        this.isValidAuthorName(text) &&
        !this.containsEngagementText(text)
      ) {
        // Additional check: make sure it's not just a single word from engagement
        const words = text.split(" ").filter((w) => w.length > 0);
        if (words.length >= 1 && words[0].length >= 3) {
          this.log(`✅ Found alternative author name: "${text}"`);
          return text;
        }
      }
    }

    this.log("❌ No alternative author name found");
    return "";
  }

  isValidAuthorName(name) {
    // Check if the name looks like a real person's name
    if (!name || name.length < 2 || name.length > 50) return false;

    // Should start with a capital letter
    if (!/^[A-Z]/.test(name)) return false;

    // Should contain only letters, spaces, and common name characters
    if (!/^[A-Za-z\s\-'\.]+$/.test(name)) return false;

    // Should not contain common non-name words
    const nonNameWords = [
      "celebrates",
      "congratulates",
      "thanks",
      "shares",
      "posted",
      "wrote",
      "LinkedIn",
      "Messaging",
      "Network",
      "Jobs",
      "Notifications",
      "Work",
      "Learning",
      "Follow",
      "Connect",
      "View",
      "profile",
      "post",
      "comment",
      "likes",
      "this",
      "and",
      "others",
      "reposted",
      "shared",
      "commented",
    ];

    if (
      nonNameWords.some((word) =>
        name.toLowerCase().includes(word.toLowerCase())
      )
    ) {
      return false;
    }

    // Additional check: avoid single words that might be from engagement text
    const words = name.split(" ").filter((w) => w.length > 0);
    if (words.length === 1 && words[0].length < 4) {
      return false;
    }

    return true;
  }

  findNameInPostHeader(post) {
    this.log("🔄 Trying fallback author name extraction...");

    // Look for the most likely author elements first
    const prioritySelectors = [
      // Look for profile links that indicate the post author
      "a[href*='/in/']",
      ".feed-shared-actor a[href*='/in/']",
      ".post-author a[href*='/in/']",

      // Look for elements with specific classes that indicate author
      ".feed-shared-actor__name",
      ".post-author",
      ".author-name",
    ];

    for (const selector of prioritySelectors) {
      const elements = post.querySelectorAll(selector);
      for (const element of elements) {
        const text = element.textContent?.trim();
        if (text && this.isValidAuthorName(text)) {
          this.log(
            `✅ Found author name with priority selector ${selector}: "${text}"`
          );
          return text;
        }
      }
    }

    // Fallback: look for any text that looks like a name
    const headerElements = post.querySelectorAll("a, span, div, strong, b");

    for (const element of headerElements) {
      const text = element.textContent?.trim();
      if (
        text &&
        text.length > 2 &&
        text.length < 50 &&
        /^[A-Z][a-z]+/.test(text) &&
        this.isValidAuthorName(text)
      ) {
        this.log(`✅ Found author name in fallback: "${text}"`);
        return text;
      }
    }

    this.log("❌ No valid author name found in fallback");
    return "";
  }

  processAuthorName(fullName) {
    const knownPrefixes = ["Dr.", "Mr.", "Ms.", "Mrs.", "Prof."];
    const nameParts = fullName.split(" ").filter(Boolean);

    this.log(`🔍 Processing name parts: [${nameParts.join(", ")}]`);

    let firstNameWithPrefix = "the author";
    if (nameParts.length > 0) {
      if (knownPrefixes.includes(nameParts[0])) {
        firstNameWithPrefix = `${nameParts[0]} ${nameParts[1] || ""}`.trim();
      } else {
        firstNameWithPrefix = nameParts[0];
      }
      this.log(`✅ Final firstNameWithPrefix: "${firstNameWithPrefix}"`);
    } else {
      this.log('❌ No name parts found, using fallback: "the author"');
    }

    return firstNameWithPrefix;
  }

  extractUserProfileName() {
    this.log("🔍 Attempting to extract user profile name...");

    const profileSelectors = [
      ".profile-card-name.text-heading-large",
      "h3.profile-card-name",
      ".profile-card-name",
      '[data-control-name="identity_welcome_message"]',
      ".global-nav__me-photo[aria-label]",
      '[data-test-id="profile-nav-item"]',
      ".nav-item__profile-member-photo[aria-label]",
      ".global-nav__me",
      ".nav-item__profile-member-photo",
      ".global-nav__me-photo",
      '[data-test-id="global-nav__me"]',
      ".global-nav__me .nav-item__profile-member-photo",
      ".global-nav__me .nav-item__profile-member-photo[aria-label]",
    ];

    let userProfileElement = null;
    for (const selector of profileSelectors) {
      userProfileElement = document.querySelector(selector);
      if (userProfileElement) {
        this.log(`✅ Found profile element with selector: ${selector}`);
        break;
      }
    }

    let userProfileName = "Your Name";
    if (userProfileElement) {
      const profileText =
        userProfileElement.textContent ||
        userProfileElement.getAttribute("aria-label") ||
        userProfileElement.getAttribute("title") ||
        "";

      this.log("📝 Raw profile text:", profileText);

      const nameMatch = profileText.match(
        /(?:View\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)(?:\s*'s\s*profile)?/
      );
      if (nameMatch) {
        userProfileName = nameMatch[1];
        this.log(`✅ Extracted profile name: ${userProfileName}`);
      } else {
        this.log("❌ Could not extract name from profile text");
      }
    } else {
      this.log("❌ No profile element found with any selector");
    }

    if (userProfileName === "Your Name") {
      userProfileName = this.findUserProfileNameFallback();
    }

    this.log(`🎯 Final user profile name: ${userProfileName}`);
    return userProfileName;
  }

  findUserProfileNameFallback() {
    this.log("🔄 Trying additional fallback methods...");

    // Method 1: Navigation elements
    const navElements = document.querySelectorAll(
      'a[href*="/in/"], a[href*="/mynetwork/"], a[href*="/messaging/"]'
    );
    for (const element of navElements) {
      const text = element.textContent?.trim();
      if (
        text &&
        text.length > 0 &&
        text.length < 50 &&
        /^[A-Z][a-z]+/.test(text)
      ) {
        const nameMatch = text.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
        if (
          nameMatch &&
          nameMatch[1] !== "LinkedIn" &&
          nameMatch[1] !== "Messaging"
        ) {
          this.log(`✅ Found name in navigation: ${nameMatch[1]}`);
          return nameMatch[1];
        }
      }
    }

    // Method 2: Profile pictures
    const profilePics = document.querySelectorAll(
      'img[aria-label*="profile"], img[alt*="profile"]'
    );
    for (const pic of profilePics) {
      const label =
        pic.getAttribute("aria-label") || pic.getAttribute("alt") || "";
      const nameMatch = label.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
      if (nameMatch && nameMatch[1] !== "LinkedIn") {
        this.log(`✅ Found name in profile picture: ${nameMatch[1]}`);
        return nameMatch[1];
      }
    }

    // Method 3: Page title
    const pageTitle = document.title;
    const nameMatch = pageTitle.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
    if (nameMatch && nameMatch[1] !== "LinkedIn") {
      this.log(`✅ Found name in page title: ${nameMatch[1]}`);
      return nameMatch[1];
    }

    // Method 4: Header area
    const headerElements = document.querySelectorAll(
      'header, .global-nav, .nav-bar, [role="banner"]'
    );
    for (const header of headerElements) {
      const textElements = header.querySelectorAll("span, div, a");
      for (const element of textElements) {
        const text = element.textContent?.trim();
        if (
          text &&
          text.length > 2 &&
          text.length < 30 &&
          /^[A-Z][a-z]+/.test(text)
        ) {
          const commonTexts = [
            "LinkedIn",
            "Messaging",
            "Network",
            "Jobs",
            "Notifications",
            "Work",
            "Learning",
          ];
          if (!commonTexts.some((common) => text.includes(common))) {
            const nameMatch = text.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
            if (nameMatch) {
              this.log(`✅ Found name in header: ${nameMatch[1]}`);
              return nameMatch[1];
            }
          }
        }
      }
    }

    // Method 5: Profile card structure
    this.log("🔍 Looking for profile card structure...");
    const profileCardName = document.querySelector(
      ".profile-card-name.text-heading-large, h3.profile-card-name, .profile-card-name"
    );
    if (profileCardName) {
      const nameText = profileCardName.textContent?.trim();
      if (nameText && nameText.length > 0) {
        this.log(`✅ Found name in profile card: ${nameText}`);
        return nameText;
      }
    }

    const profileContainer = document.querySelector(".display-flex.mt1");
    if (profileContainer) {
      const nameElement = profileContainer.querySelector("h3");
      if (nameElement) {
        const nameText = nameElement.textContent?.trim();
        if (nameText && nameText.length > 0) {
          this.log(`✅ Found name in profile container: ${nameText}`);
          return nameText;
        }
      }
    }

    return "Your Name";
  }

  findActionButton(post) {
    const selectors = [
      'button[aria-label*="Comment"]',
      'button[aria-label*="comment"]',
      'button[aria-label*="Reply"]',
      '[data-test-id="comment-button"]',
      ".social-actions__comment-button",
    ];

    for (const selector of selectors) {
      const button = post.querySelector(selector);
      if (button) {
        this.log("✅ Found comment button");
        return button;
      }
    }

    this.log("❌ No comment button found for post");
    return null;
  }

  injectButton(post, buttonElement) {
    const commentButton = this.findActionButton(post);
    if (commentButton && commentButton.parentElement) {
      // Insert the button before the comment button instead of after
      commentButton.parentElement.insertBefore(buttonElement, commentButton);
      return true;
    }
    return false;
  }

  createActionButton(platformName) {
    const btn = document.createElement("button");
    btn.innerText = "📝✨";
    btn.className = "vibe-btn";
    return btn;
  }

  // LinkedIn-specific formatting
  formatDM(dm, authorName, userProfileName) {
    // LinkedIn DMs should start with greeting and end with signature
    return `Hello ${authorName}, ${dm}\n\nBest,\n${userProfileName}`;
  }

  // LinkedIn-specific limits
  getCharacterLimits() {
    return {
      comment: 1000,
      dm: 1000,
      reply: 1000,
    };
  }

  // LinkedIn-specific prompts
  getDefaultPrompts() {
    return {
      "Smart Contrarian":
        "Write 2 contrarian but respectful LinkedIn comments that offer a different perspective to the post. Avoid being rude.",
      "Agreement with Value":
        "Write 2 thoughtful comments that agree with the post and add extra insight or a real-life example.",
      "Ask a Question":
        "Write 2 engaging questions I can ask the post author to spark a conversation. Be concise and curious.",
      Friendly:
        "Write 2 friendly and encouraging comments as if responding to a friend. Keep it human and casual.",
      Celebratory:
        "Write 2 congratulatory comments that sound genuine and energetic, suitable for posts like promotions or achievements.",
      Constructive:
        "Write 2 comments that offer polite suggestions or additional resources in a helpful tone.",
      "Offer Help":
        "Write 2 comments that offer genuine help or support based on the post content. Be specific and sincere.",
      Contribution:
        "Write 2 comments that contribute a fresh angle, useful resource, or related insight to enrich the discussion.",
      "Disagreement - Contrary":
        "Write 2 respectful comments that disagree with the post and back up a different viewpoint with logic or evidence.",
      Criticism:
        "Write 2 polite and professional criticisms that point out potential gaps, risks, or flaws in the post.",
      "Funny Sarcastic":
        "Write 2 comments that are playful, witty, or sarcastic without being offensive. Make it feel clever.",
      "Perspective (Why / What / How)":
        'Write 2 comments that add thoughtful "why", "what", or "how" perspectives to the topic. Encourage deeper thinking.',
      "Professional Industry Specific":
        "Write 2 comments that sound like an expert in the same industry. Use relevant terms and insights.",
    };
  }

  // LinkedIn-specific guidelines
  getDefaultGuidelines() {
    return {
      "Smart Contrarian":
        "- Start each comment by addressing ${firstNameWithPrefix} directly.\n- Respectfully challenge the post's view.\n- Keep tone civil and thought-provoking.",
      "Agreement with Value":
        "- Address ${firstNameWithPrefix} directly.\n- Add extra value, a personal story, or insight.\n- Keep tone appreciative and humble.",
      "Ask a Question":
        "- Start with ${firstNameWithPrefix}.\n- Ask thoughtful, curious questions.\n- Avoid yes/no questions.",
      Friendly:
        "- Use a casual tone and mention something specific you liked.\n- Start with ${firstNameWithPrefix}.\n- Keep it short and warm.",
      Celebratory:
        "- Use an enthusiastic tone.\n- Start with ${firstNameWithPrefix}.\n- Celebrate the achievement naturally.",
      Constructive:
        "- Offer a helpful suggestion without sounding critical.\n- Start with ${firstNameWithPrefix}.\n- Be kind and relevant.",
      "Offer Help":
        '- Be supportive and generous.\n- Mention something specific you can help with.\n- Start with ${firstNameWithPrefix} or "Happy to help!"',
      Contribution:
        "- Share a link, idea, or resource.\n- Add your perspective briefly.\n- Start by agreeing or building on ${firstNameWithPrefix}'s thought.",
      "Disagreement - Contrary":
        "- Be respectful but bold.\n- Use facts or reasoning.\n- Mention ${firstNameWithPrefix} by name when disagreeing.",
      Criticism:
        "- Keep it constructive and avoid harsh language.\n- Point out a flaw or missing piece politely.\n- Mention ${firstNameWithPrefix} respectfully.",
      "Funny Sarcastic":
        "- Add humor, puns, or playful exaggeration.\n- Keep it lighthearted.\n- Tag ${firstNameWithPrefix} for effect.",
      "Perspective (Why / What / How)":
        '- Ask a "why", "what", or "how" style question.\n- Expand the conversation intellectually.\n- Mention ${firstNameWithPrefix} at start.',
      "Professional Industry Specific":
        "- Use domain language and examples.\n- Mention trends or stats.\n- Begin with ${firstNameWithPrefix} to make it direct.",
    };
  }
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = LinkedInPlatform;
}
