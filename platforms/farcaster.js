/**
 * Farcaster platform implementation
 * Extends BasePlatform with Farcaster-specific functionality
 */
class FarcasterPlatform extends BasePlatform {
  constructor() {
    super();
  }

  getPlatformName() {
    return "Farcaster";
  }

  getPlatformIcon() {
    return "🔮";
  }

  isPlatformPage() {
    return (
      window.location.hostname.includes("farcaster.xyz") ||
      window.location.hostname.includes("warpcast.com")
    );
  }

  getPageType() {
    const path = window.location.pathname;
    if (path.includes("/cast/") || path.includes("/post/")) {
      return "individual-post";
    }
    return "feed";
  }

  findPosts() {
    console.log("🔍 Finding Farcaster posts...");
    console.log("🔍 Current URL:", window.location.href);
    console.log("🔍 Document ready state:", document.readyState);

    // Strategy 1: Look for posts using the exact structure from the user's HTML
    let posts = document.querySelectorAll(
      'div[class*="relative cursor-pointer py-2 hover:bg-overlay-faint border-t border-faint"]'
    );
    console.log(
      `🔍 Strategy 1 found ${posts.length} posts with full class structure`
    );

    // Strategy 1.5: Also look for posts that just have "relative" class (like the first post)
    if (posts.length === 0) {
      const allRelativeDivs = document.querySelectorAll(
        'div[class*="relative"]'
      );
      console.log(
        `🔍 Found ${allRelativeDivs.length} total divs with "relative" class`
      );

      posts = allRelativeDivs;
      const filteredPosts = Array.from(posts).filter((post) => {
        // Must have engagement row
        const hasEngagement = post.querySelector(
          ".mr-4.mt-3.flex.flex-row.items-center"
        );
        // Must have substantial content (not just empty divs)
        const hasSubstantialContent = (post.textContent?.length || 0) > 20;
        // Must not be a nested relative div (should be a top-level post)
        const isTopLevel = !post.parentElement?.classList.contains("relative");
        // Must have a cast ID (indicates it's a real post)
        const hasCastId = post.id && post.id.startsWith("cast:");

        console.log(`🔍 Checking div:`, {
          element: post,
          classes: post.className,
          hasEngagement,
          hasSubstantialContent,
          isTopLevel,
          hasCastId,
          textLength: post.textContent?.length || 0,
        });

        return hasEngagement && hasSubstantialContent && isTopLevel;
      });

      if (filteredPosts.length > 0) {
        console.log(
          `✅ Found ${filteredPosts.length} posts using relative-only selector`
        );
        posts = filteredPosts;
      } else {
        console.log("❌ No posts found with relative-only selector");
      }
    }

    if (posts.length > 0) {
      console.log(
        `✅ Found ${posts.length} posts using relative cursor-pointer selector`
      );
    } else {
      console.log(
        "❌ No posts found with primary selector, trying fallback..."
      );

      // Strategy 2: Look for any div with relative class that contains engagement
      posts = document.querySelectorAll('div[class*="relative"]');
      const filteredPosts = Array.from(posts).filter((post) => {
        const hasEngagement = post.querySelector(
          ".mr-4.mt-3.flex.flex-row.items-center"
        );
        const hasSubstantialContent = (post.textContent?.length || 0) > 50;
        const isTopLevel = !post.parentElement?.classList.contains("relative");
        const hasCastId = post.id && post.id.startsWith("cast:");
        return hasEngagement && hasSubstantialContent && isTopLevel;
      });

      if (filteredPosts.length > 0) {
        console.log(
          `✅ Found ${filteredPosts.length} posts using relative + engagement fallback`
        );
        posts = filteredPosts;
      } else {
        console.log(
          "❌ No posts found with fallback selector, trying engagement-only..."
        );

        // Strategy 3: Find posts by looking for engagement rows and walking up
        const engagementRows = document.querySelectorAll(
          ".mr-4.mt-3.flex.flex-row.items-center"
        );
        console.log(
          `🔍 Strategy 3 found ${engagementRows.length} engagement rows`
        );
        const postContainers = [];

        engagementRows.forEach((row, index) => {
          console.log(`🔍 Processing engagement row ${index}:`, row);

          // Find the parent post container
          let parent = row.parentElement;
          let depth = 0;
          while (
            parent &&
            !parent.classList.contains("relative") &&
            parent.tagName !== "BODY" &&
            depth < 10
          ) {
            parent = parent.parentElement;
            depth++;
          }

          console.log(
            `🔍 Engagement row ${index} - Found parent at depth ${depth}:`,
            parent
          );

          if (
            parent &&
            parent.classList.contains("relative") &&
            !postContainers.includes(parent) &&
            !parent.parentElement?.classList.contains("relative")
          ) {
            postContainers.push(parent);
            console.log(`✅ Added post container ${index}:`, parent);
          } else {
            console.log(
              `❌ Skipped engagement row ${index} - no suitable parent found`
            );
          }
        });

        console.log(
          `✅ Found ${postContainers.length} posts using engagement-only method`
        );
        posts = postContainers;
      }
    }

    // Strategy 4: Last resort - look for any div with engagement that we might have missed
    if (posts.length === 0) {
      console.log(
        "🔍 Strategy 4: Last resort search for any engagement-containing divs"
      );
      const allDivs = document.querySelectorAll("div");
      const potentialPosts = Array.from(allDivs).filter((div) => {
        const hasEngagement = div.querySelector(
          ".mr-4.mt-3.flex.flex-row.items-center"
        );
        const hasContent = (div.textContent?.length || 0) > 50;
        const isNotNested = !div.parentElement?.querySelector(
          ".mr-4.mt-3.flex.flex-row.items-center"
        );

        if (hasEngagement && hasContent && isNotNested) {
          console.log("🔍 Found potential post in last resort search:", div);
          return true;
        }
        return false;
      });

      if (potentialPosts.length > 0) {
        console.log(
          `✅ Found ${potentialPosts.length} posts using last resort method`
        );
        posts = potentialPosts;
      }
    }

    // Debug: Log details about each post found
    posts.forEach((post, index) => {
      console.log(`🔍 Post ${index}:`, {
        element: post,
        classes: post.className,
        id: post.id,
        hasEngagement: !!post.querySelector(
          ".mr-4.mt-3.flex.flex-row.items-center"
        ),
        hasCastId: post.id && post.id.startsWith("cast:"),
        textContent: post.textContent?.slice(0, 100) + "...",
      });
    });

    return Array.from(posts);
  }

  extractPostText(post) {
    // Look for the text content in the post
    const textElement = post.querySelector(
      '.line-clamp-feed, [class*="text-base"], [class*="leading-5"]'
    );
    if (textElement) {
      const text = textElement.textContent || textElement.innerText;
      if (text && text.trim().length > 0) {
        return text.trim().slice(0, 320);
      }
    }

    // Fallback: get all text from the post
    const allText = post.textContent || post.innerText;
    return allText.slice(0, 320);
  }

  extractAuthorName(post) {
    // Look for the author name in the post
    const authorElement = post.querySelector(
      'a[href^="/"][class*="font-semibold"], a[href^="/"][class*="text-inherit"]'
    );
    if (authorElement) {
      const authorName = authorElement.textContent || authorElement.innerText;
      if (authorName && authorName.trim().length > 0) {
        return authorName.trim();
      }
    }

    return "Unknown";
  }

  extractUserProfileName() {
    try {
      // Try to extract the current user's profile name from the page
      // Look for common selectors that might contain the user's name
      const selectors = [
        'nav a[href*="/profile"]', // Navigation profile links
        '[data-testid="user-name"]', // Common test ID
        ".user-name", // Common class
        '[aria-label*="profile"]', // Aria labels
        'header a[href*="/"]', // Header profile links
        ".profile-name", // Profile name class
      ];

      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
          // Skip if this element is inside a post (to avoid getting post authors)
          const isInsidePost = element.closest('[id^="cast:"]');
          if (isInsidePost) {
            console.log("🔍 Skipping element inside post:", element);
            continue;
          }

          const name = element.textContent || element.innerText;
          if (name && name.trim().length > 0) {
            console.log("🔍 Found user profile name:", name.trim());
            return name.trim();
          }
        }
      }

      // If no profile name found, return null instead of throwing error
      console.log("🔍 No user profile name found, will handle gracefully");
      return null;
    } catch (error) {
      console.log("🔍 Error extracting user profile name:", error);
      return null;
    }
  }

  findActionButton(post) {
    // Look for any button in the engagement row
    const engagementRow = post.querySelector(
      ".mr-4.mt-3.flex.flex-row.items-center"
    );
    if (engagementRow) {
      const buttons = engagementRow.querySelectorAll("button");
      if (buttons.length > 0) {
        return buttons[0];
      }
    }

    // If no buttons found in engagement row, return the post itself as fallback
    // This ensures we can still inject buttons even if no action buttons are found
    return post;
  }

  injectButton(post, buttonElement) {
    console.log("🔍 Injecting button into Farcaster post...");
    console.log("🔍 Post element:", post);
    console.log("🔍 Button element:", buttonElement);

    // Remove any existing buttons and wrappers first
    const existingButtons = post.querySelectorAll(".vibe-btn, .farcaster-btn");
    existingButtons.forEach((btn) => btn.remove());

    // Also remove any existing wrapper divs to prevent spacing issues
    const existingWrappers = post.querySelectorAll(
      'div[style*="display: flex"][style*="justify-content: center"]'
    );
    existingWrappers.forEach((wrapper) => wrapper.remove());

    // Add Farcaster-specific class
    buttonElement.classList.add("farcaster-btn");

    // Apply styling
    buttonElement.style.cssText = `
      background-color: #8B5CF6 !important;
      color: white !important;
      border: none !important;
      border-radius: 4px !important;
      padding: 6px 12px !important;
      cursor: pointer !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      transition: background-color 0.2s !important;
      display: inline-block !important;
      text-decoration: none !important;
      box-sizing: border-box !important;
      font-family: inherit !important;
      white-space: nowrap !important;
      position: relative !important;
      visibility: visible !important;
      opacity: 1 !important;
      z-index: 10000 !important;
    `;

    // Add hover effect
    buttonElement.addEventListener("mouseenter", () => {
      buttonElement.style.backgroundColor = "#7C3AED !important";
    });

    buttonElement.addEventListener("mouseleave", () => {
      buttonElement.style.backgroundColor = "#8B5CF6 !important";
    });

    // Add click event prevention
    buttonElement.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    // Find the engagement row (the exact structure from user's HTML)
    const engagementRow = post.querySelector(
      ".mr-4.mt-3.flex.flex-row.items-center"
    );

    console.log(
      "🔍 Looking for engagement row with selector: .mr-4.mt-3.flex.flex-row.items-center"
    );
    console.log("🔍 Engagement row found:", engagementRow);

    if (engagementRow) {
      console.log("✅ Found engagement row, injecting button below it");

      // Check if we already have a button wrapper after this engagement row
      const nextSibling = engagementRow.nextSibling;
      if (
        nextSibling &&
        nextSibling.classList &&
        nextSibling.classList.contains("vibe-button-wrapper")
      ) {
        console.log(
          "⚠️ Button wrapper already exists after engagement row, skipping"
        );
        return true;
      }

      // Insert button directly after engagement row
      console.log("🔍 Attempting direct button insertion...");

      // Create a simple container div
      const container = document.createElement("div");
      container.style.cssText = `
        display: flex !important;
        justify-content: center !important;
        margin-top: 8px !important;
        margin-bottom: 8px !important;
        width: 100% !important;
        padding-left: 64px !important;
        padding-right: 16px !important;
      `;

      container.appendChild(buttonElement);

      // Insert at the end of the post's main container
      const postMainContainer = post.querySelector(".relative.flex.flex-col");
      if (postMainContainer) {
        console.log("🔍 Inserting at end of post main container");
        postMainContainer.appendChild(container);
      } else {
        console.log("🔍 Fallback: inserting after engagement row");
        engagementRow.parentElement.insertBefore(
          container,
          engagementRow.nextSibling
        );
      }

      console.log("🔍 Direct insertion completed");
      console.log("🔍 Container element:", container);
      console.log(
        "🔍 Button in container:",
        container.querySelector(".vibe-btn")
      );

      console.log("✅ Button injected successfully");
      console.log("🔍 Container element:", container);
      console.log(
        "🔍 Button element in DOM:",
        container.querySelector(".vibe-btn")
      );
      console.log("🔍 Container parent:", container.parentElement);
      console.log("🔍 Container next sibling:", container.nextSibling);
      console.log("🔍 Container innerHTML:", container.innerHTML);
      console.log("🔍 Container children count:", container.children.length);

      // Force a repaint to ensure visibility
      container.style.display = "flex";
      container.offsetHeight; // Force reflow

      // Add a timeout to check if button is still there
      setTimeout(() => {
        console.log(
          "🔍 After timeout - Button still in DOM:",
          document.querySelector(`#${buttonElement.id}`)
        );
        console.log(
          "🔍 After timeout - Container still in DOM:",
          container.parentElement
        );
      }, 1000);

      return true;
    } else {
      console.log("❌ Could not find engagement row");
      return false;
    }
  }

  createActionButton(platformName) {
    const btn = document.createElement("button");
    btn.innerText = "💬 Suggest Comments";
    btn.className = "vibe-btn farcaster-btn";
    btn.id = "vibe-test-button-" + Date.now();
    btn.setAttribute("data-vibe-debug", "true");
    return btn;
  }

  // Farcaster-specific formatting
  formatComment(comment, authorName) {
    const trimmedComment = comment.trim();

    // If comment already starts with @authorName, don't add it again
    if (trimmedComment.startsWith(`@${authorName}`)) {
      return comment;
    }

    // If comment already has any @mention, don't add another
    if (trimmedComment.includes("@")) {
      return comment;
    }

    return comment;
  }

  formatDM(dm, authorName, userProfileName) {
    if (userProfileName) {
      return `Hey ${authorName}, ${dm}\n\n- ${userProfileName}`;
    } else {
      return `Hey ${authorName}, ${dm}`;
    }
  }

  // Farcaster-specific limits
  getCharacterLimits() {
    return {
      comment: 320,
      dm: 1000,
      reply: 320,
    };
  }

  // Farcaster-specific prompts
  getDefaultPrompts() {
    return {
      "Smart Contrarian":
        "Write 2 contrarian but respectful Farcaster replies that offer a different perspective. Keep it concise.",
      "Agreement with Value":
        "Write 2 thoughtful Farcaster replies that agree and add extra insight. Be brief.",
      "Ask a Question":
        "Write 2 engaging questions as Farcaster replies to spark conversation. Keep it short.",
      Friendly:
        "Write 2 friendly and encouraging Farcaster replies. Keep it casual and brief.",
      Celebratory:
        "Write 2 congratulatory Farcaster replies that sound genuine. Be energetic but concise.",
      Constructive:
        "Write 2 Farcaster replies that offer polite suggestions. Keep it helpful and brief.",
      "Offer Help":
        "Write 2 Farcaster replies that offer genuine help or support. Be specific and concise.",
      Contribution:
        "Write 2 Farcaster replies that contribute fresh insights. Keep it brief but valuable.",
      "Disagreement - Contrary":
        "Write 2 respectful Farcaster replies that disagree. Use facts, keep it brief.",
      Criticism:
        "Write 2 polite Farcaster replies that point out gaps. Keep it constructive and brief.",
      "Funny Sarcastic":
        "Write 2 playful, witty Farcaster replies. Keep it clever and brief.",
      "Perspective (Why / What / How)":
        "Write 2 Farcaster replies that add thoughtful perspectives. Keep it brief.",
      "Professional Industry Specific":
        "Write 2 expert-level Farcaster replies. Use relevant terms, keep it brief.",
    };
  }

  // Farcaster-specific guidelines
  getDefaultGuidelines() {
    return {
      "Smart Contrarian":
        "- Only mention @${firstNameWithPrefix} when directly addressing them.\n- Respectfully challenge the view.\n- Keep it under 320 characters.",
      "Agreement with Value":
        "- Only mention @${firstNameWithPrefix} when directly addressing them.\n- Add extra value or insight.\n- Keep it under 320 characters.",
      "Ask a Question":
        "- Only mention @${firstNameWithPrefix} when directly addressing them.\n- Ask thoughtful questions.\n- Keep it under 320 characters.",
      Friendly:
        "- Use a casual tone.\n- Only mention @${firstNameWithPrefix} when directly addressing them.\n- Keep it under 320 characters.",
      Celebratory:
        "- Use an enthusiastic tone.\n- Only mention @${firstNameWithPrefix} when directly addressing them.\n- Keep it under 320 characters.",
      Constructive:
        "- Offer helpful suggestions.\n- Only mention @${firstNameWithPrefix} when directly addressing them.\n- Keep it under 320 characters.",
      "Offer Help":
        "- Be supportive and generous.\n- Only mention @${firstNameWithPrefix} when directly addressing them.\n- Keep it under 320 characters.",
      Contribution:
        "- Share a resource or insight.\n- Only mention @${firstNameWithPrefix} when directly addressing them.\n- Keep it under 320 characters.",
      "Disagreement - Contrary":
        "- Be respectful but bold.\n- Only mention @${firstNameWithPrefix} when directly addressing them.\n- Keep it under 320 characters.",
      Criticism:
        "- Keep it constructive.\n- Only mention @${firstNameWithPrefix} when directly addressing them.\n- Keep it under 320 characters.",
      "Funny Sarcastic":
        "- Add humor or wit.\n- Only mention @${firstNameWithPrefix} when directly addressing them.\n- Keep it under 320 characters.",
      "Perspective (Why / What / How)":
        '- Ask "why", "what", or "how" questions.\n- Only mention @${firstNameWithPrefix} when directly addressing them.\n- Keep it under 320 characters.',
      "Professional Industry Specific":
        "- Use domain language.\n- Only mention @${firstNameWithPrefix} when directly addressing them.\n- Keep it under 320 characters.",
    };
  }
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = FarcasterPlatform;
}
