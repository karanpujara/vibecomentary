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
        // Must have engagement row OR be the original post in a conversation
        const hasEngagement = post.querySelector(
          ".mr-4.mt-3.flex.flex-row.items-center"
        );

        // Check if this might be the original post (has more engagement metrics)
        const hasOriginalPostEngagement = post.querySelector(
          '[class*="flex"][class*="items-center"]'
        );

        // Must have substantial content (not just empty divs)
        const hasSubstantialContent = (post.textContent?.length || 0) > 20;
        // Must not be a nested relative div (should be a top-level post)
        const isTopLevel = !post.parentElement?.classList.contains("relative");
        // Must have a cast ID (indicates it's a real post) OR be the first post in conversation
        const hasCastId = post.id && post.id.startsWith("cast:");

        // Check if this is the first post in the conversation (original post)
        const isFirstPost =
          post ===
          post.parentElement?.querySelector(
            'div[class*="relative"]:first-child'
          );

        console.log(`🔍 Checking div:`, {
          element: post,
          classes: post.className,
          hasEngagement,
          hasOriginalPostEngagement,
          hasSubstantialContent,
          isTopLevel,
          hasCastId,
          isFirstPost,
          textLength: post.textContent?.length || 0,
        });

        return (
          (hasEngagement || hasOriginalPostEngagement) &&
          hasSubstantialContent &&
          isTopLevel
        );
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

    // Strategy 4: Look specifically for the original post in conversation threads
    if (posts.length === 0 || posts.length === 1) {
      console.log(
        "🔍 Strategy 4: Looking for original post in conversation threads"
      );

      // Look for the main conversation container
      const conversationContainer =
        document.querySelector('[class*="conversation"]') ||
        document.querySelector('[class*="thread"]') ||
        document.querySelector("main");

      if (conversationContainer) {
        // Find the first post in the conversation (original post)
        const firstPost =
          conversationContainer.querySelector(
            'div[class*="relative"]:first-child'
          ) ||
          conversationContainer.querySelector("article:first-child") ||
          conversationContainer.querySelector('[class*="post"]:first-child');

        if (firstPost && !posts.includes(firstPost)) {
          console.log("✅ Found original post in conversation:", firstPost);
          posts = [firstPost, ...posts];
        }
      }
    }

    // Strategy 5: Last resort - look for any div with engagement that we might have missed
    if (posts.length === 0) {
      console.log(
        "🔍 Strategy 5: Last resort search for any engagement-containing divs"
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
    console.log("🔍 Extracting post text from Farcaster post...");

    // Strategy 1: Look for the main text content in the post with better targeting
    const textSelectors = [
      '[class*="text-base"]',
      '[class*="leading-5"]',
      '[class*="line-clamp"]',
      'div[class*="text"]',
      "p",
      'span[class*="text"]',
      // More specific Farcaster selectors
      '[class*="whitespace-pre-wrap"]',
      '[class*="break-words"]',
    ];

    for (const selector of textSelectors) {
      const textElements = post.querySelectorAll(selector);
      for (const element of textElements) {
        const text = element.textContent || element.innerText;
        if (text && text.trim().length > 10 && text.trim().length < 500) {
          // More sophisticated filtering - allow @ mentions but exclude timestamps and usernames
          const trimmedText = text.trim();

          // Skip if this looks like just a username or timestamp
          if (
            !trimmedText.match(/^[a-zA-Z0-9._]+$/i) && // Not just a username
            !trimmedText.match(/^\d+[hdw] ago$/i) && // Not just a timestamp
            !trimmedText.match(/^@[a-zA-Z0-9._]+$/i) && // Not just a single @ mention
            trimmedText.split(" ").length > 3 // Has multiple words
          ) {
            console.log("✅ Found post text:", trimmedText);
            return trimmedText.slice(0, 320);
          }
        }
      }
    }

    // Strategy 2: Look for text in the main post container with better filtering
    const mainContainer = post.querySelector(".relative.flex.flex-col");
    if (mainContainer) {
      const textElements = mainContainer.querySelectorAll("div, p, span");
      for (const element of textElements) {
        const text = element.textContent || element.innerText;
        if (text && text.trim().length > 10 && text.trim().length < 500) {
          const trimmedText = text.trim();

          // Skip usernames, timestamps, and engagement text
          if (
            !trimmedText.match(/^\d+[hdw] ago$/i) && // Not just timestamp
            !trimmedText.match(/^\d+ comments?$/i) && // Not just comment count
            !trimmedText.match(/^\d+ recasts?$/i) && // Not just recast count
            !trimmedText.match(/^\d+ likes?$/i) && // Not just like count
            !trimmedText.match(/^@[a-zA-Z0-9._]+$/i) && // Not just single @ mention
            trimmedText.split(" ").length > 3 // Has multiple words
          ) {
            console.log("✅ Found post text in main container:", trimmedText);
            return trimmedText.slice(0, 320);
          }
        }
      }
    }

    // Strategy 3: Get all text and filter out non-content more intelligently
    const allText = post.textContent || post.innerText;
    const lines = allText
      .split("\n")
      .map((line) => line.trim())
      .filter(
        (line) =>
          line.length > 15 && // Longer minimum length
          line.length < 300 && // Shorter maximum to avoid getting too much
          !line.match(/^\d+[hdw] ago$/i) && // Not just timestamp
          !line.match(/^\d+ comments?$/i) && // Not just comment count
          !line.match(/^\d+ recasts?$/i) && // Not just recast count
          !line.match(/^\d+ likes?$/i) && // Not just like count
          !line.match(/^@[a-zA-Z0-9._]+$/i) && // Not just single @ mention
          line.split(" ").length > 3 && // Has multiple words
          !line.includes("recasted by") && // Not recast text
          !line.includes("from") // Not from text
      );

    if (lines.length > 0) {
      console.log("✅ Found post text from filtered lines:", lines[0]);
      return lines[0].slice(0, 320);
    }

    console.log("❌ No post text found");
    return "No content available";
  }

  extractAuthorName(post) {
    console.log("🔍 Extracting author name from Farcaster post...");

    // Strategy 1: Look for the original creator (not recaster)
    // In Farcaster, recasts show "recasted by X from Y" - we want Y (original creator)
    const recastText = post.textContent || post.innerText;
    const recastMatch = recastText.match(/recasted by .+ from (.+)/i);
    if (recastMatch) {
      const originalCreator = recastMatch[1].trim();
      console.log("✅ Found original creator from recast:", originalCreator);
      return originalCreator;
    }

    // Strategy 2: Look for "from" pattern in text
    const fromMatch = recastText.match(/from (.+?)(?:\s|$)/i);
    if (fromMatch) {
      const originalCreator = fromMatch[1].trim();
      console.log(
        "✅ Found original creator from 'from' pattern:",
        originalCreator
      );
      return originalCreator;
    }

    // Strategy 3: Look for the main post author in the header area (most reliable)
    const headerSelectors = [
      // Look for the main post header area
      '[class*="flex"][class*="justify-between"]',
      '[class*="flex"][class*="items-center"]',
      // More specific Farcaster selectors
      '[class*="mr-4"][class*="flex"][class*="flex-row"]',
      '[class*="flex"][class*="flex-row"][class*="justify-between"]',
    ];

    for (const headerSelector of headerSelectors) {
      const headerElement = post.querySelector(headerSelector);
      if (headerElement) {
        // Look for author links in the header
        const authorLinks = headerElement.querySelectorAll('a[href^="/"]');
        for (const link of authorLinks) {
          const authorName = link.textContent?.trim();
          if (authorName && authorName.length > 0 && authorName.length < 50) {
            // Skip if this looks like a recaster indicator
            if (
              !authorName.includes("recasted") &&
              !authorName.includes("from")
            ) {
              console.log("✅ Found main post author in header:", authorName);
              return authorName;
            }
          }
        }
      }
    }

    // Strategy 4: Look for author links with better targeting
    const authorSelectors = [
      'a[href^="/"][class*="font-semibold"]',
      'a[href^="/"][class*="text-inherit"]',
      'a[href^="/"]',
      '[class*="font-semibold"] a[href^="/"]',
      // Add more specific selectors for Farcaster
      'a[href*="/profile"]',
      'a[href*="/user"]',
      '[data-testid="user-name"]',
      '[class*="username"]',
    ];

    const allAuthorLinks = [];
    for (const selector of authorSelectors) {
      const authorElements = post.querySelectorAll(selector);
      for (const element of authorElements) {
        const authorName = element.textContent || element.innerText;
        if (
          authorName &&
          authorName.trim().length > 0 &&
          authorName.trim().length < 50
        ) {
          // Skip if this looks like a recaster indicator
          if (
            !authorName.includes("recasted") &&
            !authorName.includes("from")
          ) {
            // Check if this is in a like notification (skip these)
            const isInLikeNotification =
              element.closest(".mb-px.flex.flex-row.items-center") !== null;

            // Check if this is the main post author (in the post header area)
            const isMainPostAuthor =
              element.closest(".mr-4.flex.flex-row.justify-between") !== null ||
              element.closest('[class*="flex"][class*="justify-between"]') !==
                null;

            // Check if this looks like a proper Farcaster username
            const isProperUsername =
              /\.(eth|base|polygon|arbitrum|optimism|zora)$/i.test(
                authorName
              ) ||
              authorName.includes(".") ||
              authorName.length > 5;

            // Check if this username is mentioned in the post content (should be excluded)
            const postText = post.textContent || post.innerText;
            const isMentionedInContent =
              postText.includes(`@${authorName}`) ||
              postText.includes(authorName);

            allAuthorLinks.push({
              name: authorName.trim(),
              element: element,
              isInLikeNotification: isInLikeNotification,
              isMainPostAuthor: isMainPostAuthor,
              isProperUsername: isProperUsername,
              isMentionedInContent: isMentionedInContent,
            });
          }
        }
      }
    }

    // Prioritize main post authors (original creator) FIRST
    const mainPostAuthors = allAuthorLinks.filter(
      (link) => link.isMainPostAuthor && !link.isInLikeNotification
    );
    if (mainPostAuthors.length > 0) {
      console.log("✅ Found main post author:", mainPostAuthors[0].name);
      return mainPostAuthors[0].name;
    }

    // Then prioritize proper usernames (but only if they're not in post content)
    const properUsernames = allAuthorLinks.filter(
      (link) =>
        link.isProperUsername &&
        !link.isInLikeNotification &&
        !link.isMentionedInContent
    );
    if (properUsernames.length > 0) {
      console.log(
        "✅ Found proper username (not in content):",
        properUsernames[0].name
      );
      return properUsernames[0].name;
    }

    // Last fallback to any author found (excluding like notifications and content mentions)
    const validAuthors = allAuthorLinks.filter(
      (link) => !link.isInLikeNotification && !link.isMentionedInContent
    );
    if (validAuthors.length > 0) {
      console.log("✅ Found author as fallback:", validAuthors[0].name);
      return validAuthors[0].name;
    }

    console.log("❌ No author name found, using fallback");
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
        "Write 2 clever, sarcastic Farcaster replies that respond to the post content with humor. Make jokes about the topic, not about comment generation. Keep it witty and brief.",
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
        "- Make clever jokes about the post content.\n- Use sarcasm or wit related to the topic.\n- Do NOT mention comment generation or AI tools.\n- Only mention @${firstNameWithPrefix} when directly addressing them.\n- Keep it under 320 characters.",
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
