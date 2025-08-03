const defaultTonePrompts = {
  "Smart Contrarian": `Write 2 contrarian but respectful LinkedIn comments that offer a different perspective to the post. Avoid being rude.`,
  "Agreement with Value": `Write 2 thoughtful comments that agree with the post and add extra insight or a real-life example.`,
  "Ask a Question": `Write 2 engaging questions I can ask the post author to spark a conversation. Be concise and curious.`,
  Friendly: `Write 2 friendly and encouraging comments as if responding to a friend. Keep it human and casual.`,
  Celebratory: `Write 2 congratulatory comments that sound genuine and energetic, suitable for posts like promotions or achievements.`,
  Constructive: `Write 2 comments that offer polite suggestions or additional resources in a helpful tone.`,
  "Offer Help": `Write 2 helpful LinkedIn comments that offer a resource, idea, or assistance based on the post. Keep it supportive and practical.`,
  Contribution: `Write 2 comments that build upon the post by adding a new idea, different angle, or additional insight. Show you're engaged.`,
  "Disagreement - Contrary": `Write 2 respectful LinkedIn comments that disagree with the post and present an alternative view. Be thoughtful, not combative.`,
  Criticism: `Write 2 polite and constructive criticisms related to the post. Keep them focused on ideas, not personal attacks.`,
  "Funny Sarcastic": `Write 2 clever or sarcastic comments that still relate to the post's topic. Add humor while staying relevant.`,
  "Perspective (Why / What / How)": `Write 2 thoughtful comments that explore the post's topic by asking Why, What if, or How questions or ideas. Show deeper thinking.`,
  "Professional Industry Specific": `Write 2 comments that sound industry-savvy and professional. Use appropriate terminology and insight based on the post.`,
  Improve: `Improve this comment and make it more thoughtful, clearer, and better suited for a professional conversation on LinkedIn.`,
};

const defaultToneGuidelines = {
  "Smart Contrarian": `- Start each comment by addressing \${firstNameWithPrefix} directly.\n- Respectfully challenge the post's view.\n- Keep tone civil and thought-provoking.`,
  "Agreement with Value": `- Address \${firstNameWithPrefix} directly.\n- Add extra value, a personal story, or insight.\n- Keep tone appreciative and humble.`,
  "Ask a Question": `- Start with \${firstNameWithPrefix}.\n- Ask thoughtful, curious questions.\n- Avoid yes/no questions.`,
  Friendly: `- Use a casual tone and mention something specific you liked.\n- Start with \${firstNameWithPrefix}.\n- Keep it short and warm.`,
  Celebratory: `- Use an enthusiastic tone.\n- Start with \${firstNameWithPrefix}.\n- Celebrate the achievement naturally.`,
  Constructive: `- Offer a helpful suggestion without sounding critical.\n- Start with \${firstNameWithPrefix}.\n- Be kind and relevant.`,
  "Offer Help": `- Begin with \${firstNameWithPrefix}.\n- Offer a tip, link, or support.\n- Be genuine and generous, not promotional.`,
  Contribution: `- Address \${firstNameWithPrefix}.\n- Build on the post with a new idea.\n- Avoid repeating what's already said.`,
  "Disagreement - Contrary": `- Start with \${firstNameWithPrefix}.\n- Respectfully disagree.\n- Offer reasoning without being dismissive.`,
  Criticism: `- Begin with something neutral or positive.\n- Share constructive criticism clearly.\n- Avoid personal language or judgment.`,
  "Funny Sarcastic": `- Make it playful, not offensive.\n- Use wit to highlight a point.\n- Still relate to the post.\n- Start with \${firstNameWithPrefix}.`,
  "Perspective (Why / What / How)": `- Use a thought-provoking tone.\n- Ask a question or offer a new lens.\n- Show curiosity and engagement.\n- Begin with \${firstNameWithPrefix}.`,
  "Professional Industry Specific": `- Use formal tone and industry terms.\n- Mention trends, tools, or metrics if relevant.\n- Address \${firstNameWithPrefix}.`,
  Improve: `- Rewrite the comment to sound clearer, more articulate.\n- Maintain the same idea and emotion.\n- Make it suitable for professional platforms.`,
};

const defaultToneEmojis = {
  "Smart Contrarian": "🤔",
  "Agreement with Value": "👍",
  "Ask a Question": "❓",
  Friendly: "😊",
  Celebratory: "🎉",
  Constructive: "🔧",
  "Offer Help": "🤝",
  Contribution: "💡",
  "Disagreement - Contrary": "🔄",
  Criticism: "📝",
  "Funny Sarcastic": "😏",
  "Perspective (Why / What / How)": "🔍",
  "Professional Industry Specific": "💼",
  Improve: "✨",
};

document.addEventListener("DOMContentLoaded", () => {
  // Initialize tone management (this will handle all other initializations)
  initToneManagement();
});

// Input sanitization function
function sanitizeHTML(str) {
  if (typeof str !== "string") return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Safe notification system
function showNotification(message, type = "info") {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll(".notification");
  existingNotifications.forEach((notification) => notification.remove());

  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
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
    animation: slideIn 0.3s ease-out;
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
    @keyframes slideIn {
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

// Initialize tone management
function initToneManagement() {
  // Load custom tones
  loadCustomTones();

  // Initialize emoji picker
  initEmojiPicker();

  // Initialize tab switching
  initTabSwitching();

  // Initialize bulk actions
  initBulkActions();

  // Show default tab
  showTab("general");
}

// Create custom tone
function createCustomTone() {
  const nameInput = document.getElementById("toneName");
  const emojiInput = document.getElementById("toneEmoji");
  const promptInput = document.getElementById("tonePrompt");
  const guidelineInput = document.getElementById("toneGuideline");

  const name = nameInput.value.trim();
  const emoji = emojiInput.value.trim();
  const prompt = promptInput.value.trim();
  const guideline = guidelineInput.value.trim();

  if (!name || !emoji || !prompt || !guideline) {
    showNotification("Please fill in all fields.", "error");
    return;
  }

  // Validate input length
  if (name.length > 50) {
    showNotification("Tone name must be less than 50 characters.", "error");
    return;
  }

  if (prompt.length > 1000) {
    showNotification("Prompt must be less than 1000 characters.", "error");
    return;
  }

  if (guideline.length > 1000) {
    showNotification("Guideline must be less than 1000 characters.", "error");
    return;
  }

  chrome.storage.local.get(["customTones"], (result) => {
    const customTones = result.customTones || {};

    // Check if tone name already exists
    if (customTones[name]) {
      showNotification(
        `A tone with the name "${name}" already exists.`,
        "error"
      );
      return;
    }

    customTones[name] = {
      emoji: emoji,
      prompt: prompt,
      guideline: guideline,
    };

    chrome.storage.local.set({ customTones }, () => {
      clearCustomToneForm();
      loadCustomTones();
      updateTonesGrid();
      showNotification(`✅ "${name}" created successfully!`, "success");
    });
  });
}

// Load and display custom tones
function loadCustomTones() {
  chrome.storage.local.get(["customTones"], (result) => {
    const customTones = result.customTones || {};
    const addToneCustomTonesGrid = document.getElementById(
      "addToneCustomTonesGrid"
    );

    if (addToneCustomTonesGrid) {
      addToneCustomTonesGrid.innerHTML = "";
      Object.keys(customTones).forEach((toneName) => {
        const tone = customTones[toneName];
        const card = document.createElement("div");
        card.className = "tone-card";

        // Use sanitized HTML to prevent XSS
        card.innerHTML = `
          <div class="tone-header">
            <span class="tone-emoji">${sanitizeHTML(tone.emoji)}</span>
            <span class="tone-name">${sanitizeHTML(toneName)}</span>
            <span class="tone-type custom">Custom</span>
          </div>
          <div class="form-group">
            <label>Prompt:</label>
            <textarea class="tone-prompt" data-tone="${sanitizeHTML(
              toneName
            )}" rows="3">${sanitizeHTML(tone.prompt)}</textarea>
          </div>
          <div class="form-group">
            <label>Guideline:</label>
            <textarea class="tone-guideline" data-tone="${sanitizeHTML(
              toneName
            )}" rows="3">${sanitizeHTML(tone.guideline)}</textarea>
          </div>
          <div class="tone-actions">
            <button class="btn btn-primary save-tone" data-tone="${sanitizeHTML(
              toneName
            )}">Save</button>
            <button class="btn btn-danger delete-tone" data-tone="${sanitizeHTML(
              toneName
            )}">Delete</button>
          </div>
        `;

        // Add event listeners
        const saveBtn = card.querySelector(".save-tone");
        const deleteBtn = card.querySelector(".delete-tone");

        saveBtn.addEventListener("click", () => {
          const prompt = card.querySelector(".tone-prompt").value.trim();
          const guideline = card.querySelector(".tone-guideline").value.trim();

          chrome.storage.local.get(["customTones"], (res) => {
            const customTones = res.customTones || {};
            if (customTones[toneName]) {
              customTones[toneName].prompt = prompt;
              customTones[toneName].guideline = guideline;
              chrome.storage.local.set({ customTones }, () => {
                loadCustomTones();
                updateTonesGrid();
                showNotification(`✅ ${toneName} updated!`, "success");
              });
            }
          });
        });

        deleteBtn.addEventListener("click", () => {
          if (confirm(`Are you sure you want to delete "${toneName}"?`)) {
            chrome.storage.local.get(["customTones"], (res) => {
              const customTones = res.customTones || {};
              delete customTones[toneName];
              chrome.storage.local.set({ customTones }, () => {
                loadCustomTones();
                updateTonesGrid();
                showNotification(`🗑️ "${toneName}" deleted!`, "success");
              });
            });
          }
        });

        addToneCustomTonesGrid.appendChild(card);
      });
    }
  });
}

// Delete custom tone
function deleteCustomTone(toneName) {
  if (confirm(`Are you sure you want to delete "${toneName}"?`)) {
    chrome.storage.local.get(["customTones"], (result) => {
      const customTones = result.customTones || {};
      delete customTones[toneName];

      chrome.storage.local.set({ customTones }, () => {
        loadCustomTones();
        updateTonesGrid();
        showNotification(`🗑️ "${toneName}" deleted successfully.`, "success");
      });
    });
  }
}

// Tab switching functionality
function initTabSwitching() {
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const tabName = this.getAttribute("data-tab");
      showTab(tabName);
    });
  });
}

function showTab(tabName) {
  console.log("Switching to tab:", tabName);

  // Hide all tab contents
  const tabContents = document.querySelectorAll(".tab-content");
  tabContents.forEach((content) => content.classList.remove("active"));

  // Remove active class from all tabs
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((tab) => tab.classList.remove("active"));

  // Show selected tab content
  const targetContent = document.getElementById(tabName);
  if (targetContent) {
    targetContent.classList.add("active");
    console.log("Tab content activated:", tabName);
  } else {
    console.error("Tab content not found:", tabName);
  }

  // Add active class to clicked tab
  event.target.classList.add("active");

  // Initialize content based on tab
  if (tabName === "tones") {
    setTimeout(() => {
      console.log("Initializing tones tab...");
      try {
        if (typeof updateTonesGrid === "function") {
          console.log("Calling updateTonesGrid...");
          updateTonesGrid();
        } else {
          console.log("updateTonesGrid function not found");
        }
        if (typeof loadCustomTones === "function") {
          console.log("Calling loadCustomTones...");
          loadCustomTones();
        } else {
          console.log("loadCustomTones function not found");
        }
      } catch (error) {
        console.error("Error initializing tones tab:", error);
      }
    }, 100);
  } else if (tabName === "add-tone") {
    setTimeout(() => {
      console.log("Initializing add-tone tab...");
      try {
        if (typeof loadCustomTones === "function") {
          console.log("Calling loadCustomTones for add-tone tab...");
          loadCustomTones();
        } else {
          console.log("loadCustomTones function not found");
        }
      } catch (error) {
        console.error("Error initializing add-tone tab:", error);
      }
    }, 100);
  }
}

// Function to update the tones grid
function updateTonesGrid() {
  console.log("updateTonesGrid called");
  const tonesGrid = document.getElementById("tonesGrid");
  if (!tonesGrid) {
    console.error("tonesGrid element not found");
    return;
  }
  console.log("Found tonesGrid element");

  tonesGrid.innerHTML = "";

  // Load saved values from storage first
  chrome.storage.local.get(
    ["tonePrompts", "toneGuidelines", "customTones"],
    (result) => {
      const savedPrompts = result.tonePrompts || {};
      const savedGuidelines = result.toneGuidelines || {};
      const customTones = result.customTones || {};

      // Add default tones with saved values
      Object.keys(defaultTonePrompts).forEach((toneName) => {
        const card = createToneCard(
          toneName,
          savedPrompts[toneName] || defaultTonePrompts[toneName],
          savedGuidelines[toneName] || defaultToneGuidelines[toneName],
          defaultToneEmojis[toneName],
          "default"
        );
        tonesGrid.appendChild(card);
      });

      // Add custom tones
      Object.keys(customTones).forEach((toneName) => {
        const customTone = customTones[toneName];
        const card = createToneCard(
          toneName,
          customTone.prompt,
          customTone.guideline,
          customTone.emoji,
          "custom"
        );
        tonesGrid.appendChild(card);
      });
    }
  );
}

// Create tone card
function createToneCard(toneName, prompt, guideline, emoji, type) {
  const card = document.createElement("div");
  card.className = "tone-card";
  const safeId = createSafeId("tone", toneName);

  card.innerHTML = `
    <div class="tone-header">
      <span class="tone-emoji">${emoji}</span>
      <span class="tone-name">${toneName}</span>
      <span class="tone-type ${type}">${
    type === "custom" ? "Custom" : "Default"
  }</span>
    </div>
    <div class="form-group">
      <label>Prompt:</label>
      <textarea class="tone-prompt" data-tone="${toneName}" rows="3">${prompt}</textarea>
    </div>
    <div class="form-group">
      <label>Guideline:</label>
      <textarea class="tone-guideline" data-tone="${toneName}" rows="3">${guideline}</textarea>
    </div>
    <div class="tone-actions">
      <button class="btn btn-primary save-tone" data-tone="${toneName}">Save</button>
      <button class="btn btn-secondary reset-tone" data-tone="${toneName}">Reset</button>
      ${
        type === "custom"
          ? `<button class="btn btn-danger delete-tone" data-tone="${toneName}">Delete</button>`
          : ""
      }
    </div>
  `;

  // Add event listeners
  const saveBtn = card.querySelector(".save-tone");
  const resetBtn = card.querySelector(".reset-tone");
  const deleteBtn = card.querySelector(".delete-tone");

  saveBtn.addEventListener("click", () => saveIndividualTone(toneName));
  resetBtn.addEventListener("click", () => resetIndividualTone(toneName));
  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => deleteCustomTone(toneName));
  }

  return card;
}

// Save individual tone
function saveIndividualTone(toneName) {
  try {
    const promptElement = document.querySelector(`[data-tone="${toneName}"]`);
    const guidelineElement = document.querySelector(
      `[data-tone="${toneName}"] + .form-group textarea`
    );

    if (!promptElement || !guidelineElement) {
      showNotification(
        `Could not find elements for tone: ${toneName}`,
        "error"
      );
      return;
    }

    const prompt = promptElement.value.trim();
    const guideline = guidelineElement.value.trim();

    if (!prompt || !guideline) {
      showNotification("Please fill in both prompt and guideline.", "error");
      return;
    }

    chrome.storage.local.get(["tonePrompts", "toneGuidelines"], (result) => {
      const tonePrompts = result.tonePrompts || {};
      const toneGuidelines = result.toneGuidelines || {};

      tonePrompts[toneName] = prompt;
      toneGuidelines[toneName] = guideline;

      chrome.storage.local.set({ tonePrompts, toneGuidelines }, () => {
        showNotification(`✅ ${toneName} saved successfully!`, "success");
      });
    });
  } catch (error) {
    console.error("Error saving tone:", error);
    showNotification(`Error saving ${toneName}: ${error.message}`, "error");
  }
}

// Reset individual tone
function resetIndividualTone(toneName) {
  if (confirm(`Are you sure you want to reset "${toneName}" to default?`)) {
    chrome.storage.local.get(["tonePrompts", "toneGuidelines"], (result) => {
      const tonePrompts = result.tonePrompts || {};
      const toneGuidelines = result.toneGuidelines || {};

      delete tonePrompts[toneName];
      delete toneGuidelines[toneName];

      chrome.storage.local.set({ tonePrompts, toneGuidelines }, () => {
        updateTonesGrid();
        showNotification(`🔄 ${toneName} reset to default!`, "success");
      });
    });
  }
}

// Bulk actions
function initBulkActions() {
  const saveAllBtn = document.getElementById("saveAllTones");
  const resetAllBtn = document.getElementById("resetAllTones");

  if (saveAllBtn) {
    saveAllBtn.addEventListener("click", saveAllTones);
  }

  if (resetAllBtn) {
    resetAllBtn.addEventListener("click", resetAllTones);
  }
}

// Save all tones
function saveAllTones() {
  try {
    const toneCards = document.querySelectorAll(".tone-card");
    let hasChanges = false;

    toneCards.forEach((card) => {
      const toneName = card.querySelector(".tone-name").textContent;
      const promptElement = card.querySelector(".tone-prompt");
      const guidelineElement = card.querySelector(".tone-guideline");

      if (promptElement && guidelineElement) {
        const prompt = promptElement.value.trim();
        const guideline = guidelineElement.value.trim();

        if (prompt && guideline) {
          hasChanges = true;
        }
      }
    });

    if (!hasChanges) {
      showNotification("No changes to save.", "warning");
      return;
    }

    chrome.storage.local.get(["tonePrompts", "toneGuidelines"], (result) => {
      const tonePrompts = result.tonePrompts || {};
      const toneGuidelines = result.toneGuidelines || {};

      toneCards.forEach((card) => {
        const toneName = card.querySelector(".tone-name").textContent;
        const promptElement = card.querySelector(".tone-prompt");
        const guidelineElement = card.querySelector(".tone-guideline");

        if (promptElement && guidelineElement) {
          const prompt = promptElement.value.trim();
          const guideline = guidelineElement.value.trim();

          if (prompt && guideline) {
            tonePrompts[toneName] = prompt;
            toneGuidelines[toneName] = guideline;
          }
        }
      });

      chrome.storage.local.set({ tonePrompts, toneGuidelines }, () => {
        showNotification("✅ All tones saved successfully!", "success");
      });
    });
  } catch (error) {
    console.error("Error saving all tones:", error);
    showNotification(`Error saving tones: ${error.message}`, "error");
  }
}

// Reset all tones
function resetAllTones() {
  if (confirm("Are you sure you want to reset all tones to default?")) {
    chrome.storage.local.remove(["tonePrompts", "toneGuidelines"], () => {
      updateTonesGrid();
      showNotification("🔄 All tones reset to default!", "success");
    });
  }
}

// Emoji picker functionality
function initEmojiPicker() {
  const emojiInput = document.getElementById("customToneEmoji");
  const emojiPickerDropdown = document.getElementById("emojiPickerDropdown");
  const emojiSearch = document.getElementById("emojiSearch");
  const emojiCategories = document.getElementById("emojiCategories");
  const emojiGrid = document.getElementById("emojiGrid");

  if (!emojiInput || !emojiPickerDropdown) return;

  // Emoji data
  const emojiData = {
    "Smileys & Emotion": [
      "😀",
      "😃",
      "😄",
      "😁",
      "😆",
      "😅",
      "😂",
      "🤣",
      "😊",
      "😇",
      "🙂",
      "🙃",
      "😉",
      "😌",
      "😍",
      "🥰",
      "😘",
      "😗",
      "😙",
      "😚",
      "😋",
      "😛",
      "😝",
      "😜",
      "🤪",
      "🤨",
      "🧐",
      "🤓",
      "😎",
      "🤩",
      "🥳",
      "😏",
      "😒",
      "😞",
      "😔",
      "😟",
      "😕",
      "🙁",
      "☹️",
      "😣",
      "😖",
      "😫",
      "😩",
      "🥺",
      "😢",
      "😭",
      "😤",
      "😠",
      "😡",
      "🤬",
      "🤯",
      "😳",
      "🥵",
      "🥶",
      "😱",
      "😨",
      "😰",
      "😥",
      "😓",
      "🤗",
      "🤔",
      "🤭",
      "🤫",
      "🤥",
      "😶",
      "😐",
      "😑",
      "😯",
      "😦",
      "😧",
      "😮",
      "😲",
      "🥱",
      "😴",
      "🤤",
      "😪",
      "😵",
      "🤐",
      "🥴",
      "🤢",
      "🤮",
      "🤧",
      "😷",
      "🤒",
      "🤕",
    ],
    "People & Body": [
      "👋",
      "🤚",
      "🖐️",
      "✋",
      "🖖",
      "👌",
      "🤌",
      "🤏",
      "✌️",
      "🤞",
      "🤟",
      "🤘",
      "🤙",
      "👈",
      "👉",
      "👆",
      "🖕",
      "👇",
      "☝️",
      "👍",
      "👎",
      "✊",
      "👊",
      "🤛",
      "🤜",
      "👏",
      "🙌",
      "👐",
      "🤲",
      "🤝",
      "🙏",
      "✍️",
      "💪",
      "🦾",
      "🦿",
      "🦵",
      "🦶",
      "👂",
      "🦻",
      "👃",
      "🧠",
      "🫀",
      "🫁",
      "🦷",
      "🦴",
      "👀",
      "👁️",
      "👅",
      "👄",
      "💋",
      "🩸",
    ],
    "Animals & Nature": [
      "🐶",
      "🐱",
      "🐭",
      "🐹",
      "🐰",
      "🦊",
      "🐻",
      "🐼",
      "🐻‍❄️",
      "🐨",
      "🐯",
      "🦁",
      "🐮",
      "🐷",
      "🐸",
      "🐵",
      "🙈",
      "🙉",
      "🙊",
      "🐒",
      "🐔",
      "🐧",
      "🐦",
      "🐤",
      "🐣",
      "🦆",
      "🦅",
      "🦉",
      "🦇",
      "🐺",
      "🐗",
      "🐴",
      "🦄",
      "🐝",
      "🐛",
      "🦋",
      "🐌",
      "🐞",
      "🐜",
      "🦟",
      "🦗",
      "🕷️",
      "🕸️",
      "🦂",
      "🐢",
      "🐍",
      "🦎",
      "🦖",
      "🦕",
      "🐙",
      "🦑",
      "🦐",
      "🦞",
      "🦀",
      "🐡",
      "🐠",
      "🐟",
      "🐬",
      "🐳",
      "🐋",
      "🦈",
      "🐊",
      "🐅",
      "🐆",
      "🦓",
      "🦍",
      "🦧",
      "🐘",
      "🦛",
      "🦏",
      "🐪",
      "🐫",
      "🦙",
      "🦒",
      "🐃",
      "🐂",
      "🐄",
      "🐎",
      "🐖",
      "🐏",
      "🐑",
      "🦙",
      "🐐",
      "🦌",
      "🐕",
      "🐩",
      "🦮",
      "🐕‍🦺",
      "🐈",
      "🐈‍⬛",
      "🐓",
      "🦃",
      "🦚",
      "🦜",
      "🦢",
      "🦩",
      "🕊️",
      "🐇",
      "🦝",
      "🦨",
      "🦡",
      "🦫",
      "🦦",
      "🦥",
      "🐁",
      "🐀",
      "🐿️",
      "🦔",
    ],
    "Food & Drink": [
      "🍎",
      "🍐",
      "🍊",
      "🍋",
      "🍌",
      "🍉",
      "🍇",
      "🍓",
      "🫐",
      "🍈",
      "🍒",
      "🍑",
      "🥭",
      "🍍",
      "🥥",
      "🥝",
      "🍅",
      "🍆",
      "🥑",
      "🥦",
      "🥬",
      "🥒",
      "🌶️",
      "🫑",
      "🌽",
      "🥕",
      "🫒",
      "🧄",
      "🧅",
      "🥔",
      "🍠",
      "🥐",
      "🥯",
      "🍞",
      "🥖",
      "🥨",
      "🧀",
      "🥚",
      "🍳",
      "🧈",
      "🥞",
      "🧇",
      "🥓",
      "🥩",
      "🍗",
      "🍖",
      "🦴",
      "🌭",
      "🍔",
      "🍟",
      "🍕",
      "🫓",
      "🥪",
      "🥙",
      "🧆",
      "🌮",
      "🌯",
      "🫔",
      "🥗",
      "🥘",
      "🫕",
      "🥫",
      "🍝",
      "🍜",
      "🍲",
      "🍛",
      "🍣",
      "🍱",
      "🥟",
      "🦪",
      "🍤",
      "🍙",
      "🍚",
      "🍘",
      "🍥",
      "🥠",
      "🥮",
      "🍢",
      "🍡",
      "🍧",
      "🍨",
      "🍦",
      "🥧",
      "🧁",
      "🍰",
      "🎂",
      "🍮",
      "🍭",
      "🍬",
      "🍫",
      "🍿",
      "🍪",
      "🌰",
      "🥜",
      "🍯",
      "🥛",
      "🍼",
      "🫖",
      "☕",
      "🍵",
      "🧃",
      "🥤",
      "🧋",
      "🍶",
      "🍺",
      "🍷",
      "🥂",
      "🥃",
      "🍸",
      "🍹",
      "🧉",
      "🍾",
      "🥄",
      "🍴",
      "🍽️",
      "🥄",
      "🥡",
      "🥢",
      "🧂",
    ],
    Activities: [
      "⚽",
      "🏀",
      "🏈",
      "⚾",
      "🥎",
      "🎾",
      "🏐",
      "🏉",
      "🥏",
      "🎱",
      "🪀",
      "🏓",
      "🏸",
      "🏒",
      "🏑",
      "🥍",
      "🏏",
      "🥅",
      "⛳",
      "🪁",
      "🏹",
      "🎣",
      "🤿",
      "🥊",
      "🥋",
      "🎽",
      "🛹",
      "🛷",
      "⛸️",
      "🥌",
      "🎿",
      "⛷️",
      "🏂",
      "🪂",
      "🏋️‍♀️",
      "🏋️",
      "🏋️‍♂️",
      "🤼‍♀️",
      "🤼",
      "🤼‍♂️",
      "🤸‍♀️",
      "🤸",
      "🤸‍♂️",
      "⛹️‍♀️",
      "⛹️",
      "⛹️‍♂️",
      "🤺",
      "🤾‍♀️",
      "🤾",
      "🤾‍♂️",
      "🏌️‍♀️",
      "🏌️",
      "🏌️‍♂️",
      "🏇",
      "🧘‍♀️",
      "🧘",
      "🧘‍♂️",
      "🏄‍♀️",
      "🏄",
      "🏄‍♂️",
      "🏊‍♀️",
      "🏊",
      "🏊‍♂️",
      "🤽‍♀️",
      "🤽",
      "🤽‍♂️",
      "🚣‍♀️",
      "🚣",
      "🚣‍♂️",
      "🧗‍♀️",
      "🧗",
      "🧗‍♂️",
      "🚵‍♀️",
      "🚵",
      "🚵‍♂️",
      "🚴‍♀️",
      "🚴",
      "🚴‍♂️",
      "🏆",
      "🥇",
      "🥈",
      "🥉",
      "🏅",
      "🎖️",
      "🏵️",
      "🎗️",
      "🎫",
      "🎟️",
      "🎪",
      "🤹‍♀️",
      "🤹",
      "🤹‍♂️",
      "🎭",
      "🩰",
      "🎨",
      "🎬",
      "🎤",
      "🎧",
      "🎼",
      "🎹",
      "🥁",
      "🪘",
      "🎷",
      "🎺",
      "🎸",
      "🪕",
      "🎻",
      "🎲",
      "♟️",
      "🎯",
      "🎳",
      "🎮",
      "🎰",
      "🧩",
      "🎨",
      "📱",
      "📲",
      "💻",
      "⌨️",
      "🖥️",
      "🖨️",
      "🖱️",
      "🖲️",
      "💽",
      "💾",
      "💿",
      "📀",
      "🧮",
      "🎥",
      "📺",
      "📻",
      "📷",
      "📸",
      "📹",
      "📼",
      "🔍",
      "🔎",
      "🕯️",
      "💡",
      "🔦",
      "🏮",
      "🪔",
      "📔",
      "📕",
      "📖",
      "📗",
      "📘",
      "📙",
      "📚",
      "📓",
      "📒",
      "📃",
      "📜",
      "📄",
      "📰",
      "🗞️",
      "📑",
      "🔖",
      "🏷️",
      "💰",
      "🪙",
      "💴",
      "💵",
      "💶",
      "💷",
      "🪙",
      "💳",
      "🧾",
      "💸",
      "🪙",
      "💱",
      "💲",
      "✉️",
      "📧",
      "📨",
      "📩",
      "📤",
      "📥",
      "📦",
      "📪",
      "📫",
      "📬",
      "📭",
      "📮",
      "🗳️",
      "✏️",
      "✒️",
      "🖋️",
      "🖊️",
      "🖌️",
      "🖍️",
      "📝",
      "✏️",
      "🔍",
      "🔎",
      "🔏",
      "🔐",
      "🔒",
      "🔓",
    ],
    Objects: [
      "❤️",
      "🧡",
      "💛",
      "💚",
      "💙",
      "💜",
      "🖤",
      "🤍",
      "🤎",
      "💔",
      "❣️",
      "💕",
      "💞",
      "💓",
      "💗",
      "💖",
      "💘",
      "💝",
      "💟",
      "☮️",
      "✝️",
      "☪️",
      "🕉️",
      "☸️",
      "✡️",
      "🔯",
      "🕎",
      "☯️",
      "☦️",
      "🛐",
      "⛎",
      "♈",
      "♉",
      "♊",
      "♋",
      "♌",
      "♍",
      "♎",
      "♏",
      "♐",
      "♑",
      "♒",
      "♓",
      "🆔",
      "⚛️",
      "🉑",
      "☢️",
      "☣️",
      "📴",
      "📳",
      "🈶",
      "🈚",
      "🈸",
      "🈺",
      "🈷️",
      "✴️",
      "🆚",
      "💮",
      "🉐",
      "㊙️",
      "㊗️",
      "🈴",
      "🈵",
      "🈹",
      "🈲",
      "🅰️",
      "🅱️",
      "🆎",
      "🆑",
      "🅾️",
      "🆘",
      "❌",
      "⭕",
      "🛑",
      "⛔",
      "📛",
      "🚫",
      "💯",
      "💢",
      "♨️",
      "🚷",
      "🚯",
      "🚳",
      "🚱",
      "🔞",
      "📵",
      "🚭",
      "❗",
      "❕",
      "❓",
      "❔",
      "‼️",
      "⁉️",
      "🔅",
      "🔆",
      "〽️",
      "⚠️",
      "🚸",
      "🔱",
      "⚜️",
      "🔰",
      "♻️",
      "✅",
      "🈯",
      "💹",
      "❇️",
      "✳️",
      "❎",
      "🌐",
      "💠",
      "Ⓜ️",
      "🌀",
      "💤",
      "🏧",
      "🚾",
      "♿",
      "🅿️",
      "🛗",
      "🛂",
      "🛃",
      "🛄",
      "🛅",
      "🚹",
      "🚺",
      "🚼",
      "🚻",
      "🚮",
      "🎦",
      "📶",
      "🈁",
      "🔣",
      "ℹ️",
      "🔤",
      "🔡",
      "🔠",
      "🆖",
      "🆗",
      "🆙",
      "🆒",
      "🆕",
      "🆓",
      "0️⃣",
      "1️⃣",
      "2️⃣",
      "3️⃣",
      "4️⃣",
      "5️⃣",
      "6️⃣",
      "7️⃣",
      "8️⃣",
      "9️⃣",
      "🔟",
      "🔢",
      "#️⃣",
      "*️⃣",
      "⏏️",
      "▶️",
      "⏸️",
      "⏯️",
      "⏹️",
      "⏺️",
      "⏭️",
      "⏮️",
      "⏩",
      "⏪",
      "⏫",
      "⏬",
      "◀️",
      "🔼",
      "🔽",
      "➡️",
      "⬅️",
      "⬆️",
      "⬇️",
      "↗️",
      "↘️",
      "↙️",
      "↖️",
      "↕️",
      "↔️",
      "↪️",
      "↩️",
      "⤴️",
      "⤵️",
      "🔀",
      "🔁",
      "🔂",
      "🔄",
      "🔃",
      "🎵",
      "🎶",
      "➕",
      "➖",
      "➗",
      "✖️",
      "♾️",
      "💲",
      "💱",
      "™️",
      "©️",
      "®️",
      "👁️‍🗨️",
      "🔚",
      "🔙",
      "🔛",
      "🔝",
      "🔜",
      "〰️",
      "➰",
      "➿",
      "✔️",
      "☑️",
      "🔘",
      "🔴",
      "🟠",
      "🟡",
      "🟢",
      "🔵",
      "🟣",
      "⚫",
      "⚪",
      "🟤",
      "🔺",
      "🔻",
      "🔸",
      "🔹",
      "🔶",
      "🔷",
      "🔳",
      "🔲",
      "▪️",
      "▫️",
      "◾",
      "◽",
      "◼️",
      "◻️",
      "🟥",
      "🟧",
      "🟨",
      "🟩",
      "🟦",
      "🟪",
      "⬛",
      "⬜",
      "🟫",
      "🔈",
      "🔇",
      "🔉",
      "🔊",
      "🔔",
      "🔕",
      "📣",
      "📢",
      "💬",
      "💭",
      "🗯️",
      "♠️",
      "♣️",
      "♥️",
      "♦️",
      "🃏",
      "🎴",
      "🀄",
      "🕐",
      "🕑",
      "🕒",
      "🕓",
      "🕔",
      "🕕",
      "🕖",
      "🕗",
      "🕘",
      "🕙",
      "🕚",
      "🕛",
      "🕜",
      "🕝",
      "🕞",
      "🕟",
      "🕠",
      "🕡",
      "🕢",
      "🕣",
      "🕤",
      "🕥",
      "🕦",
      "🕧",
    ],
    Symbols: [
      "🏁",
      "🚩",
      "🎌",
      "🏴",
      "🏳️",
      "🏳️‍🌈",
      "🏴‍☠️",
      "🇦🇨",
      "🇦🇩",
      "🇦🇪",
      "🇦🇫",
      "🇦🇬",
      "🇦🇮",
      "🇦🇱",
      "🇦🇲",
      "🇦🇴",
      "🇦🇶",
      "🇦🇷",
      "🇦🇸",
      "🇦🇹",
      "🇦🇺",
      "🇦🇼",
      "🇦🇽",
      "🇦🇿",
      "🇧🇦",
      "🇧🇧",
      "🇧🇩",
      "🇧🇪",
      "🇧🇫",
      "🇧🇬",
      "🇧🇭",
      "🇧🇮",
      "🇧🇯",
      "🇧🇱",
      "🇧🇲",
      "🇧🇳",
      "🇧🇴",
      "🇧🇶",
      "🇧🇷",
      "🇧🇸",
      "🇧🇹",
      "🇧🇻",
      "🇧🇼",
      "🇧🇾",
      "🇧🇿",
      "🇨🇦",
      "🇨🇨",
      "🇨🇩",
      "🇨🇫",
      "🇨🇬",
      "🇨🇭",
      "🇨🇮",
      "🇨🇰",
      "🇨🇱",
      "🇨🇲",
      "🇨🇳",
      "🇨🇴",
      "🇨🇵",
      "🇨🇷",
      "🇨🇺",
      "🇨🇻",
      "🇨🇼",
      "🇨🇽",
      "🇨🇾",
      "🇨🇿",
      "🇩🇪",
      "🇩🇯",
      "🇩🇰",
      "🇩🇲",
      "🇩🇴",
      "🇪🇨",
      "🇪🇪",
      "🇪🇬",
      "🇪🇭",
      "🇪🇷",
      "🇪🇸",
      "🇪🇹",
      "🇪🇺",
      "🇫🇮",
      "🇫🇯",
      "🇫🇰",
      "🇫🇲",
      "🇫🇴",
      "🇫🇷",
      "🇬🇦",
      "🇬🇧",
      "🇬🇩",
      "🇬🇪",
      "🇬🇫",
      "🇬🇬",
      "🇬🇭",
      "🇬🇮",
      "🇬🇱",
      "🇬🇲",
      "🇬🇳",
      "🇬🇵",
      "🇬🇶",
      "🇬🇷",
      "🇬🇸",
      "🇬🇹",
      "🇬🇺",
      "🇬🇼",
      "🇬🇾",
      "🇭🇹",
      "🇭🇲",
      "🇭🇳",
      "🇭🇷",
      "🇭🇹",
      "🇭🇺",
      "🇮🇩",
      "🇮🇪",
      "🇮🇱",
      "🇮🇲",
      "🇮🇳",
      "🇮🇴",
      "🇮🇶",
      "🇮🇷",
      "🇮🇸",
      "🇮🇹",
      "🇯🇪",
      "🇯🇲",
      "🇯🇴",
      "🇯🇵",
      "🇰🇪",
      "🇰🇬",
      "🇰🇭",
      "🇰🇮",
      "🇰🇲",
      "🇰🇳",
      "🇰🇵",
      "🇰🇷",
      "🇰🇼",
      "🇰🇾",
      "🇰🇿",
      "🇱🇦",
      "🇱🇧",
      "🇱🇨",
      "🇱🇮",
      "🇱🇰",
      "🇱🇷",
      "🇱🇸",
      "🇱🇹",
      "🇱🇺",
      "🇱🇻",
      "🇱🇾",
      "🇲🇦",
      "🇲🇨",
      "🇲🇩",
      "🇲🇪",
      "🇲🇫",
      "🇲🇬",
      "🇲🇭",
      "🇲🇰",
      "🇲🇱",
      "🇲🇲",
      "🇲🇳",
      "🇲🇴",
      "🇲🇵",
      "🇲🇶",
      "🇲🇷",
      "🇲🇸",
      "🇲🇹",
      "🇲🇺",
      "🇲🇻",
      "🇲🇼",
      "🇲🇽",
      "🇲🇾",
      "🇲🇿",
      "🇳🇦",
      "🇳🇨",
      "🇳🇪",
      "🇳🇫",
      "🇳🇬",
      "🇳🇮",
      "🇳🇱",
      "🇳🇴",
      "🇳🇵",
      "🇳🇷",
      "🇳🇺",
      "🇳🇿",
      "🇴🇲",
      "🇵🇦",
      "🇵🇪",
      "🇵🇫",
      "🇵🇬",
      "🇵🇭",
      "🇵🇰",
      "🇵🇱",
      "🇵🇲",
      "🇵🇳",
      "🇵🇷",
      "🇵🇸",
      "🇵🇹",
      "🇵🇼",
      "🇵🇾",
      "🇶🇦",
      "🇷🇪",
      "🇷🇴",
      "🇷🇸",
      "🇷🇺",
      "🇷🇼",
      "🇸🇦",
      "🇸🇧",
      "🇸🇨",
      "🇸🇩",
      "🇸🇪",
      "🇸🇬",
      "🇸🇭",
      "🇸🇮",
      "🇸🇯",
      "🇸🇰",
      "🇸🇱",
      "🇸🇲",
      "🇸🇳",
      "🇸🇴",
      "🇸🇷",
      "🇸🇸",
      "🇸🇹",
      "🇸🇻",
      "🇸🇽",
      "🇸🇾",
      "🇸🇿",
      "🇹🇦",
      "🇹🇨",
      "🇹🇩",
      "🇹🇯",
      "🇹🇰",
      "🇹🇱",
      "🇹🇲",
      "🇹🇳",
      "🇹🇴",
      "🇹🇷",
      "🇹🇹",
      "🇹🇻",
      "🇹🇼",
      "🇹🇿",
      "🇺🇦",
      "🇺🇬",
      "🇺🇸",
      "🇺🇾",
      "🇺🇿",
      "🇻🇦",
      "🇻🇨",
      "🇻🇪",
      "🇻🇬",
      "🇻🇮",
      "🇻🇳",
      "🇻🇺",
      "🇼🇫",
      "🇼🇸",
      "🇾🇪",
      "🇾🇹",
      "🇿🇦",
      "🇿🇲",
      "🇿🇼",
    ],
  };

  // Toggle emoji picker
  emojiInput.addEventListener("click", (e) => {
    e.stopPropagation();
    emojiPickerDropdown.style.display =
      emojiPickerDropdown.style.display === "block" ? "none" : "block";
    if (emojiPickerDropdown.style.display === "block") {
      showEmojis(emojiData["Smileys & Emotion"]);
      selectCategory("Smileys & Emotion");
    }
  });

  // Close emoji picker when clicking outside
  document.addEventListener("click", () => {
    emojiPickerDropdown.style.display = "none";
  });

  // Search functionality
  emojiSearch.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const allEmojis = Object.values(emojiData).flat();
    const filteredEmojis = allEmojis.filter(
      (emoji) =>
        emoji.includes(searchTerm) ||
        Object.keys(emojiData).find(
          (category) =>
            emojiData[category].includes(emoji) &&
            category.toLowerCase().includes(searchTerm)
        )
    );
    showEmojis(filteredEmojis);
  });

  // Category selection
  Object.keys(emojiData).forEach((category) => {
    const categoryBtn = document.createElement("button");
    categoryBtn.textContent = category;
    categoryBtn.addEventListener("click", () => selectCategory(category));
    emojiCategories.appendChild(categoryBtn);
  });

  function selectCategory(category) {
    // Update active category
    emojiCategories
      .querySelectorAll("button")
      .forEach((btn) => btn.classList.remove("active"));
    event.target.classList.add("active");

    // Show emojis for selected category
    showEmojis(emojiData[category]);
  }

  function showEmojis(emojis) {
    emojiGrid.innerHTML = "";
    emojis.forEach((emoji) => {
      const emojiBtn = document.createElement("button");
      emojiBtn.textContent = emoji;
      emojiBtn.addEventListener("click", () => selectEmoji(emoji));
      emojiGrid.appendChild(emojiBtn);
    });
  }

  function selectEmoji(emoji) {
    emojiInput.value = emoji;
    emojiPickerDropdown.style.display = "none";
  }
}

// Helper function to create safe IDs
function createSafeId(prefix, toneName) {
  return `${prefix}-${toneName.replace(/[^a-zA-Z0-9]/g, "-")}`;
}
