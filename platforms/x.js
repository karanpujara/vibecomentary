/**
 * X (Twitter) platform implementation
 * Extends BasePlatform with X-specific functionality
 */
class XPlatform extends BasePlatform {
  constructor() {
    super();
  }

  getPlatformName() {
    return "X (Twitter)";
  }

  getPlatformIcon() {
    return "🐦";
  }

  isPlatformPage() {
    return (
      window.location.hostname.includes("twitter.com") ||
      window.location.hostname.includes("x.com")
    );
  }

  getPageType() {
    const path = window.location.pathname;
    if (path.includes("/status/")) {
      return "individual-post";
    }
    return "feed";
  }

  findPosts() {
    const pageType = this.getPageType();

    if (pageType === "individual-post") {
      this.log("🔍 Detected individual tweet page");
      const tweet =
        document.querySelector('[data-testid="tweet"]') ||
        document.querySelector('article[data-testid="tweet"]') ||
        document.querySelector(".css-1dbjc4n.r-1wbh5a2.r-dnmrzs");

      if (tweet) {
        this.log("✅ Found individual tweet container");
        return [tweet];
      } else {
        this.log("❌ No individual tweet container found");
        return [];
      }
    } else {
      this.log("🔍 Detected X feed page");
      const tweets = document.querySelectorAll(
        '[data-testid="tweet"], article[data-testid="tweet"]'
      );
      this.log(`📊 Found ${tweets.length} tweets`);
      return Array.from(tweets);
    }
  }

  extractPostText(post) {
    // X has character limits, so we extract the tweet text
    const tweetTextElement =
      post.querySelector('[data-testid="tweetText"]') ||
      post.querySelector(
        ".css-901oao.r-1nao33i.r-37j5jr.r-a023e6.r-16dba41.r-rjixqe.r-bcqeeo.r-bnwqim.r-qvutc0"
      ) ||
      post.querySelector("[lang]");

    if (tweetTextElement) {
      return tweetTextElement.innerText.slice(0, 280); // X character limit
    }

    return post.innerText.slice(0, 280);
  }

  extractAuthorName(post) {
    this.log("🔍 Attempting to extract author name...");

    // Enhanced selectors for current X interface
    const authorSelectors = [
      '[data-testid="User-Name"] a',
      '[data-testid="User-Name"] span',
      '[data-testid="User-Name"] div',
      '[data-testid="User-Name"]',
      'a[role="link"][href*="/status"]',
      'a[href*="/status"] span',
      'a[href*="/status"] div',
      ".css-901oao.css-bfa6kz.r-1re7ezh.r-6koalj.r-1qd0xha.r-a023e6.r-16dba41.r-1blvdjr.r-1ny4l3l.r-1loqt21",
      ".css-1dbjc4n.r-1wbh5a2.r-dnmrzs a",
      // New selectors for current X interface
      'div[data-testid="User-Name"] a',
      'div[data-testid="User-Name"] span',
      'div[data-testid="User-Name"] div',
      'article a[role="link"]',
      'article a[href*="/status"]',
    ];

    let nameElem = null;
    let usedSelector = "";

    for (const selector of authorSelectors) {
      nameElem = post.querySelector(selector);
      if (nameElem) {
        usedSelector = selector;
        this.log(`✅ Found author element with selector: ${selector}`);
        break;
      }
    }

    let fullName = "";
    if (nameElem) {
      fullName = nameElem.innerText.trim();
      this.log(`📝 Raw author name: "${fullName}"`);

      // If the name is empty or too short, try to get it from parent elements
      if (!fullName || fullName.length < 2) {
        const parent = nameElem.parentElement;
        if (parent) {
          const parentText = parent.innerText.trim();
          this.log(`🔄 Trying parent element text: "${parentText}"`);
          if (parentText && parentText.length > 2) {
            fullName = parentText;
          }
        }
      }
    } else {
      this.log("❌ No author element found with any selector");
      fullName = this.findNameInTweetHeader(post);
    }

    // Additional debugging
    this.log(`🔍 Final extracted name before processing: "${fullName}"`);

    const processedName = this.processAuthorName(fullName);
    this.log(`🎯 Final processed author name: "${processedName}"`);

    return processedName;
  }

  findNameInTweetHeader(post) {
    this.log("🔄 Trying fallback author name extraction...");

    // Try multiple strategies for finding the author name
    const strategies = [
      // Strategy 1: Look for links that might contain the author name
      () => {
        const links = post.querySelectorAll('a[href*="/status"]');
        for (const link of links) {
          const text = link.textContent?.trim();
          if (text && text.length > 2 && text.length < 50) {
            // Look for patterns like "Dr Alex Young" or "Alex Young"
            const nameMatch = text.match(
              /^(Dr\.?\s*)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/
            );
            if (nameMatch) {
              this.log(`✅ Found author name in link: "${nameMatch[0]}"`);
              return nameMatch[0];
            }
          }
        }
        return null;
      },

      // Strategy 2: Look for elements with role="link"
      () => {
        const linkElements = post.querySelectorAll('[role="link"]');
        for (const element of linkElements) {
          const text = element.textContent?.trim();
          if (text && text.length > 2 && text.length < 50) {
            const nameMatch = text.match(
              /^(Dr\.?\s*)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/
            );
            if (nameMatch) {
              this.log(
                `✅ Found author name in role="link": "${nameMatch[0]}"`
              );
              return nameMatch[0];
            }
          }
        }
        return null;
      },

      // Strategy 3: Look for any text that looks like a name
      () => {
        const allElements = post.querySelectorAll("a, span, div");
        for (const element of allElements) {
          const text = element.textContent?.trim();
          if (
            text &&
            text.length > 2 &&
            text.length < 50 &&
            /^[A-Z][a-z]+/.test(text)
          ) {
            const commonTexts = [
              "Twitter",
              "X",
              "Home",
              "Explore",
              "Notifications",
              "Messages",
              "Bookmarks",
              "Lists",
              "Profile",
              "More",
              "Reply",
              "Retweet",
              "Like",
              "Share",
              "Follow",
              "Following",
            ];

            if (!commonTexts.some((common) => text.includes(common))) {
              const nameMatch = text.match(
                /^(Dr\.?\s*)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/
              );
              if (nameMatch) {
                this.log(
                  `✅ Found author name in general search: "${nameMatch[0]}"`
                );
                return nameMatch[0];
              }
            }
          }
        }
        return null;
      },
    ];

    // Try each strategy
    for (let i = 0; i < strategies.length; i++) {
      const result = strategies[i]();
      if (result) {
        return result;
      }
    }

    this.log("❌ No author name found with any fallback strategy");
    return "";
  }

  processAuthorName(fullName) {
    const knownPrefixes = ["Dr.", "Mr.", "Ms.", "Mrs.", "Prof."];
    const nameParts = fullName.split(" ").filter(Boolean);

    this.log(`🔍 Processing name parts: [${nameParts.join(", ")}]`);

    let firstNameWithPrefix = "the author";
    if (nameParts.length > 0) {
      if (knownPrefixes.includes(nameParts[0])) {
        // For titles like "Dr.", include both title and first name
        firstNameWithPrefix = `${nameParts[0]} ${nameParts[1] || ""}`.trim();
        this.log(`✅ Using title + first name: "${firstNameWithPrefix}"`);
      } else {
        // For regular names, just use the first name
        firstNameWithPrefix = nameParts[0];
        this.log(`✅ Using first name only: "${firstNameWithPrefix}"`);
      }

      // Additional validation - make sure we have a reasonable name
      if (
        firstNameWithPrefix.length < 2 ||
        firstNameWithPrefix === "the author"
      ) {
        this.log(
          `⚠️ Name seems invalid, trying to extract from full name: "${fullName}"`
        );

        // Try to extract a proper name from the full text
        const nameMatch = fullName.match(
          /^(Dr\.?\s*)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/
        );
        if (nameMatch) {
          firstNameWithPrefix = nameMatch[0].trim();
          this.log(`✅ Extracted valid name: "${firstNameWithPrefix}"`);
        }
      }

      this.log(`🎯 Final firstNameWithPrefix: "${firstNameWithPrefix}"`);
    } else {
      this.log('❌ No name parts found, using fallback: "the author"');
    }

    return firstNameWithPrefix;
  }

  extractUserProfileName() {
    this.log("🔍 Attempting to extract user profile name...");

    const profileSelectors = [
      '[data-testid="SideNav_AccountSwitcher_Button"]',
      '[data-testid="AppTabBar_Profile_Link"]',
      '.css-1dbjc4n.r-1wbh5a2.r-dnmrzs[data-testid="SideNav_AccountSwitcher_Button"]',
      '[data-testid="SideNav_AccountSwitcher_Button"] span',
      '.css-1dbjc4n.r-1wbh5a2.r-dnmrzs a[href*="/home"]',
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

      const nameMatch = profileText.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
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
      'a[href*="/home"], a[href*="/profile"]'
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
        if (nameMatch && nameMatch[1] !== "Twitter" && nameMatch[1] !== "X") {
          this.log(`✅ Found name in navigation: ${nameMatch[1]}`);
          return nameMatch[1];
        }
      }
    }

    // Method 2: Profile pictures
    const profilePics = document.querySelectorAll(
      'img[alt*="profile"], img[alt*="avatar"]'
    );
    for (const pic of profilePics) {
      const label = pic.getAttribute("alt") || "";
      const nameMatch = label.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
      if (nameMatch && nameMatch[1] !== "Twitter" && nameMatch[1] !== "X") {
        this.log(`✅ Found name in profile picture: ${nameMatch[1]}`);
        return nameMatch[1];
      }
    }

    // Method 3: Page title
    const pageTitle = document.title;
    const nameMatch = pageTitle.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
    if (nameMatch && nameMatch[1] !== "Twitter" && nameMatch[1] !== "X") {
      this.log(`✅ Found name in page title: ${nameMatch[1]}`);
      return nameMatch[1];
    }

    return "Your Name";
  }

  findActionButton(post) {
    const selectors = [
      '[data-testid="reply"]',
      '[data-testid="retweet"]',
      '[data-testid="like"]',
      'div[role="button"][data-testid="reply"]',
      'div[role="button"][data-testid="retweet"]',
    ];

    for (const selector of selectors) {
      const button = post.querySelector(selector);
      if (button) {
        this.log("✅ Found action button");
        return button;
      }
    }

    this.log("❌ No action button found for tweet");
    return null;
  }

  injectButton(post, buttonElement) {
    // Check if button already exists to prevent duplicates
    if (post.querySelector(".vibe-btn")) {
      this.log("⏭️ Button already exists, skipping injection");
      return false;
    }

    const actionButton = this.findActionButton(post);
    if (actionButton && actionButton.parentElement) {
      // Find the action buttons container (usually has role="group")
      const actionGroup =
        actionButton.closest('[role="group"]') || actionButton.parentElement;

      // Insert the button directly before the action buttons group
      if (actionGroup && actionGroup.parentElement) {
        // Add better styling to avoid overlapping with comment count
        buttonElement.style.cssText = `
          display: block;
          margin: 12px 0 8px 0;
          width: fit-content;
          clear: both;
          position: relative;
          z-index: 10;
          float: left;
        `;

        actionGroup.parentElement.insertBefore(buttonElement, actionGroup);
        this.log("✅ Button injected successfully above action row");
        return true;
      }
    }

    this.log("❌ No action button found for injection");
    return false;
  }

  createActionButton(platformName) {
    const btn = document.createElement("button");
    btn.innerText = "💬 Comment Suggestions";
    btn.className = "vibe-btn";
    return btn;
  }

  // X-specific formatting
  formatComment(comment, authorName) {
    // Only add @mention if the comment doesn't already have it and it's contextually appropriate
    const trimmedComment = comment.trim();

    // If comment already starts with @authorName, don't add it again
    if (trimmedComment.startsWith(`@${authorName}`)) {
      return comment;
    }

    // If comment already has any @mention, don't add another
    if (trimmedComment.includes("@")) {
      return comment;
    }

    // For X, only add @mention for direct responses or when addressing the author
    // Let the AI decide when to include mentions based on the tone and context
    return comment;
  }

  formatDM(dm, authorName, userProfileName) {
    // X DMs are more casual
    return `Hey ${authorName}, ${dm}\n\n- ${userProfileName}`;
  }

  // X-specific limits
  getCharacterLimits() {
    return {
      comment: 280,
      dm: 1000,
      reply: 280,
    };
  }

  // X-specific prompts
  getDefaultPrompts() {
    return {
      "Smart Contrarian":
        "Write 2 contrarian but respectful X replies that offer a different perspective. Keep it concise.",
      "Agreement with Value":
        "Write 2 thoughtful X replies that agree and add extra insight. Be brief.",
      "Ask a Question":
        "Write 2 engaging questions as X replies to spark conversation. Keep it short.",
      Friendly:
        "Write 2 friendly and encouraging X replies. Keep it casual and brief.",
      Celebratory:
        "Write 2 congratulatory X replies that sound genuine. Be energetic but concise.",
      Constructive:
        "Write 2 X replies that offer polite suggestions. Keep it helpful and brief.",
      "Offer Help":
        "Write 2 X replies that offer genuine help or support. Be specific and concise.",
      Contribution:
        "Write 2 X replies that contribute fresh insights. Keep it brief but valuable.",
      "Disagreement - Contrary":
        "Write 2 respectful X replies that disagree. Use facts, keep it brief.",
      Criticism:
        "Write 2 polite X replies that point out gaps. Keep it constructive and brief.",
      "Funny Sarcastic":
        "Write 2 playful, witty X replies. Keep it clever and brief.",
      "Perspective (Why / What / How)":
        "Write 2 X replies that add thoughtful perspectives. Keep it brief.",
      "Professional Industry Specific":
        "Write 2 expert-level X replies. Use relevant terms, keep it brief.",
    };
  }

  // X-specific guidelines
  getDefaultGuidelines() {
    return {
      "Smart Contrarian":
        "- Only mention @${firstNameWithPrefix} when directly addressing them.\n- Respectfully challenge the view.\n- Keep it under 280 characters.",
      "Agreement with Value":
        "- Only mention @${firstNameWithPrefix} when directly addressing them.\n- Add extra value or insight.\n- Keep it under 280 characters.",
      "Ask a Question":
        "- Only mention @${firstNameWithPrefix} when directly addressing them.\n- Ask thoughtful questions.\n- Keep it under 280 characters.",
      Friendly:
        "- Use a casual tone.\n- Only mention @${firstNameWithPrefix} when directly addressing them.\n- Keep it under 280 characters.",
      Celebratory:
        "- Use an enthusiastic tone.\n- Only mention @${firstNameWithPrefix} when directly addressing them.\n- Keep it under 280 characters.",
      Constructive:
        "- Offer helpful suggestions.\n- Only mention @${firstNameWithPrefix} when directly addressing them.\n- Keep it under 280 characters.",
      "Offer Help":
        "- Be supportive and generous.\n- Only mention @${firstNameWithPrefix} when directly addressing them.\n- Keep it under 280 characters.",
      Contribution:
        "- Share a resource or insight.\n- Only mention @${firstNameWithPrefix} when directly addressing them.\n- Keep it under 280 characters.",
      "Disagreement - Contrary":
        "- Be respectful but bold.\n- Only mention @${firstNameWithPrefix} when directly addressing them.\n- Keep it under 280 characters.",
      Criticism:
        "- Keep it constructive.\n- Only mention @${firstNameWithPrefix} when directly addressing them.\n- Keep it under 280 characters.",
      "Funny Sarcastic":
        "- Add humor or wit.\n- Only mention @${firstNameWithPrefix} when directly addressing them.\n- Keep it under 280 characters.",
      "Perspective (Why / What / How)":
        '- Ask "why", "what", or "how" questions.\n- Only mention @${firstNameWithPrefix} when directly addressing them.\n- Keep it under 280 characters.',
      "Professional Industry Specific":
        "- Use domain language.\n- Only mention @${firstNameWithPrefix} when directly addressing them.\n- Keep it under 280 characters.",
    };
  }
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = XPlatform;
}
