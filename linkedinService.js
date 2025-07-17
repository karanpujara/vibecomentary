class LinkedInService {
  constructor() {
    this.activePostElement = null;
  }

  // Detect if we're on LinkedIn
  isLinkedInPage() {
    return window.location.hostname.includes("linkedin.com");
  }

  // Detect page type
  getPageType() {
    if (
      window.location.pathname.includes("/post/") ||
      window.location.pathname.includes("/posts/")
    ) {
      return "individual-post";
    }
    return "feed";
  }

  // Find posts on the page
  findPosts() {
    const pageType = this.getPageType();

    if (pageType === "individual-post") {
      console.log("🔍 Detected individual post page");
      const individualPost =
        document.querySelector('[data-test-id="post-content"]') ||
        document.querySelector(".feed-shared-update-v2") ||
        document.querySelector('[data-test-id="post"]') ||
        document.querySelector(".artdeco-card");

      if (individualPost) {
        console.log("✅ Found individual post container");
        return [individualPost];
      } else {
        console.log("❌ No individual post container found");
        return [];
      }
    } else {
      console.log("🔍 Detected feed page");
      const posts = document.querySelectorAll("div.feed-shared-update-v2");
      console.log(`📊 Found ${posts.length} feed posts`);
      return Array.from(posts);
    }
  }

  // Find comment button for a post
  findCommentButton(post) {
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
        console.log("✅ Found comment button");
        return button;
      }
    }

    console.log("❌ No comment button found for post");
    return null;
  }

  // Extract author name from post
  extractAuthorName(post) {
    console.log("🔍 Attempting to extract author name...");

    const authorSelectors = [
      ".feed-shared-actor__name",
      '[data-test-id="post-author"]',
      ".feed-shared-actor__name-link",
      ".post-author",
      ".author-name",
      '[data-test-id="author-name"]',
      ".feed-shared-actor__name a",
      ".feed-shared-actor__name span",
      ".feed-shared-actor__name strong",
      ".feed-shared-actor__name b",
    ];

    let nameElem = null;
    for (const selector of authorSelectors) {
      nameElem = post.querySelector(selector);
      if (nameElem) {
        console.log(`✅ Found author element with selector: ${selector}`);
        break;
      }
    }

    let fullName = "";
    if (nameElem) {
      fullName = nameElem.innerText.trim();
      console.log(`📝 Raw author name: "${fullName}"`);
    } else {
      console.log("❌ No author element found with any selector");
      // Fallback: search for name-like text
      fullName = this.findNameInPostHeader(post);
    }

    return this.processAuthorName(fullName);
  }

  findNameInPostHeader(post) {
    console.log("🔄 Trying fallback author name extraction...");
    const headerElements = post.querySelectorAll("a, span, div, strong, b");

    for (const element of headerElements) {
      const text = element.textContent?.trim();
      if (
        text &&
        text.length > 2 &&
        text.length < 50 &&
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
          "Follow",
          "Connect",
        ];

        if (!commonTexts.some((common) => text.includes(common))) {
          const nameMatch = text.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
          if (nameMatch) {
            console.log(`✅ Found author name in fallback: "${nameMatch[1]}"`);
            return nameMatch[1];
          }
        }
      }
    }
    return "";
  }

  processAuthorName(fullName) {
    const knownPrefixes = ["Dr.", "Mr.", "Ms.", "Mrs.", "Prof."];
    const nameParts = fullName.split(" ").filter(Boolean);

    console.log(`🔍 Processing name parts: [${nameParts.join(", ")}]`);

    let firstNameWithPrefix = "the author";
    if (nameParts.length > 0) {
      if (knownPrefixes.includes(nameParts[0])) {
        firstNameWithPrefix = `${nameParts[0]} ${nameParts[1] || ""}`.trim();
      } else {
        firstNameWithPrefix = nameParts[0];
      }
      console.log(`✅ Final firstNameWithPrefix: "${firstNameWithPrefix}"`);
    } else {
      console.log('❌ No name parts found, using fallback: "the author"');
    }

    return firstNameWithPrefix;
  }

  // Extract user's own profile name
  extractUserProfileName() {
    console.log("🔍 Attempting to extract user profile name...");

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
        console.log(`✅ Found profile element with selector: ${selector}`);
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

      console.log("📝 Raw profile text:", profileText);

      const nameMatch = profileText.match(
        /(?:View\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)(?:\s*'s\s*profile)?/
      );
      if (nameMatch) {
        userProfileName = nameMatch[1];
        console.log(`✅ Extracted profile name: ${userProfileName}`);
      } else {
        console.log("❌ Could not extract name from profile text");
      }
    } else {
      console.log("❌ No profile element found with any selector");
    }

    // Try fallback methods if still using default
    if (userProfileName === "Your Name") {
      userProfileName = this.findUserProfileNameFallback();
    }

    console.log(`🎯 Final user profile name: ${userProfileName}`);
    return userProfileName;
  }

  findUserProfileNameFallback() {
    console.log("🔄 Trying additional fallback methods...");

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
          console.log(`✅ Found name in navigation: ${nameMatch[1]}`);
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
        console.log(`✅ Found name in profile picture: ${nameMatch[1]}`);
        return nameMatch[1];
      }
    }

    // Method 3: Page title
    const pageTitle = document.title;
    const nameMatch = pageTitle.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
    if (nameMatch && nameMatch[1] !== "LinkedIn") {
      console.log(`✅ Found name in page title: ${nameMatch[1]}`);
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
              console.log(`✅ Found name in header: ${nameMatch[1]}`);
              return nameMatch[1];
            }
          }
        }
      }
    }

    // Method 5: Profile card structure
    console.log("🔍 Looking for profile card structure...");
    const profileCardName = document.querySelector(
      ".profile-card-name.text-heading-large, h3.profile-card-name, .profile-card-name"
    );
    if (profileCardName) {
      const nameText = profileCardName.textContent?.trim();
      if (nameText && nameText.length > 0) {
        console.log(`✅ Found name in profile card: ${nameText}`);
        return nameText;
      }
    }

    const profileContainer = document.querySelector(".display-flex.mt1");
    if (profileContainer) {
      const nameElement = profileContainer.querySelector("h3");
      if (nameElement) {
        const nameText = nameElement.textContent?.trim();
        if (nameText && nameText.length > 0) {
          console.log(`✅ Found name in profile container: ${nameText}`);
          return nameText;
        }
      }
    }

    return "Your Name";
  }

  // Extract post text
  extractPostText(post) {
    return post.innerText.slice(0, 800);
  }

  // Tag post for identification
  tagPost(post, postText) {
    document.querySelectorAll("[data-vibe-post]").forEach((el) => {
      el.removeAttribute("data-vibe-post");
    });
    post.setAttribute("data-vibe-post", postText);
  }
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = LinkedInService;
}
