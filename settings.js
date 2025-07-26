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
  "Smart Contrarian": `- Start each comment by addressing \${firstNameWithPrefix} directly.\n- Respectfully challenge the post’s view.\n- Keep tone civil and thought-provoking.`,
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

// Default tone emojis mapping
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
  const apiKeyInput = document.getElementById("apiKey");
  const saveKeyBtn = document.getElementById("saveKeyBtn");
  const clearKeyBtn = document.getElementById("clearKeyBtn");
  const exportBtn = document.getElementById("exportBtn");
  const importBtn = document.getElementById("importBtn");
  const importFile = document.getElementById("importFile");

  // Store the actual API key for masking/unmasking
  let actualApiKey = "";

  exportBtn.addEventListener("click", () => {
    chrome.storage.local.get(
      ["vibeOpenAIKey", "tonePrompts", "toneGuidelines", "customTones"],
      (data) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "be-visible-settings.json";
        a.click();
        URL.revokeObjectURL(url);
      }
    );
  });

  importBtn.addEventListener("click", () => {
    if (!importFile.files[0])
      return alert("Please select a JSON file to import.");
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const imported = JSON.parse(e.target.result);
        const {
          vibeOpenAIKey = "",
          tonePrompts = {},
          toneGuidelines = {},
          customTones = {},
        } = imported;
        chrome.storage.local.set(
          { vibeOpenAIKey, tonePrompts, toneGuidelines, customTones },
          () => {
            alert(
              "✅ Settings imported! All tones and custom tones have been updated."
            );

            // Update API key display
            actualApiKey = vibeOpenAIKey || "";
            if (actualApiKey.length > 10) {
              apiKeyInput.value =
                actualApiKey.substring(0, 10) +
                "*".repeat(actualApiKey.length - 10);
            } else {
              apiKeyInput.value = actualApiKey;
            }

            // Refresh all grids and lists
            if (typeof window.loadCustomTones === "function") {
              window.loadCustomTones();
            }
            if (typeof window.updateTonesGrid === "function") {
              window.updateTonesGrid();
            }
            if (typeof window.updateAddToneCustomTonesGrid === "function") {
              window.updateAddToneCustomTonesGrid();
            }
          }
        );
      } catch (err) {
        alert("❌ Failed to import. Make sure it’s a valid Vibe JSON file.");
      }
    };
    reader.readAsText(importFile.files[0]);
  });

  chrome.storage.local.get(["vibeOpenAIKey"], (result) => {
    // Store the actual API key and mask it for display
    actualApiKey = result.vibeOpenAIKey || "";
    if (actualApiKey.length > 10) {
      apiKeyInput.value =
        actualApiKey.substring(0, 10) + "*".repeat(actualApiKey.length - 10);
    } else {
      apiKeyInput.value = actualApiKey;
    }
  });

  // Add event listeners for API key masking
  apiKeyInput.addEventListener("focus", () => {
    // Show the actual key when user focuses on the input
    apiKeyInput.value = actualApiKey;
  });

  apiKeyInput.addEventListener("blur", () => {
    // Mask the key when user leaves the input
    if (actualApiKey.length > 10) {
      apiKeyInput.value =
        actualApiKey.substring(0, 10) + "*".repeat(actualApiKey.length - 10);
    } else {
      apiKeyInput.value = actualApiKey;
    }
  });

  apiKeyInput.addEventListener("input", (e) => {
    // Update the actual key as user types
    actualApiKey = e.target.value;
  });

  saveKeyBtn.addEventListener("click", () => {
    const key = actualApiKey.trim();
    chrome.storage.local.set({ vibeOpenAIKey: key }, () => {
      alert("✅ API key saved.");
      // Update the stored actual key and mask it
      actualApiKey = key;
      if (actualApiKey.length > 10) {
        apiKeyInput.value =
          actualApiKey.substring(0, 10) + "*".repeat(actualApiKey.length - 10);
      } else {
        apiKeyInput.value = actualApiKey;
      }
    });
  });

  clearKeyBtn.addEventListener("click", () => {
    chrome.storage.local.remove("vibeOpenAIKey", () => {
      // Clear both the input and the stored actualApiKey variable
      actualApiKey = "";
      apiKeyInput.value = "";
      alert("🗑️ API key removed.");
    });
  });

  // Custom Tone Functionality
  const customToneNameInput = document.getElementById("customToneName");
  const customToneEmojiInput = document.getElementById("customToneEmoji");
  const customTonePromptInput = document.getElementById("customTonePrompt");
  const customToneGuidelineInput = document.getElementById(
    "customToneGuideline"
  );
  const createCustomToneBtn = document.getElementById("createCustomToneBtn");
  const clearCustomToneBtn = document.getElementById("clearCustomToneBtn");
  const customTonesList = document.getElementById("customTonesList");

  // Load and display custom tones
  window.loadCustomTones = function () {
    chrome.storage.local.get(["customTones"], (result) => {
      const customTones = result.customTones || {};

      // Load in Tones tab
      const customTonesList = document.getElementById("customTonesList");
      if (customTonesList) {
        customTonesList.innerHTML = "";
        Object.keys(customTones).forEach((toneName) => {
          const tone = customTones[toneName];
          const toneElement = createCustomToneElement(toneName, tone);
          customTonesList.appendChild(toneElement);
        });
      }

      // Load in Add Tone tab
      const addToneCustomTonesList = document.getElementById(
        "addToneCustomTonesList"
      );
      if (addToneCustomTonesList) {
        addToneCustomTonesList.innerHTML = "";
        Object.keys(customTones).forEach((toneName) => {
          const tone = customTones[toneName];
          const toneElement = createCustomToneElement(toneName, tone);
          addToneCustomTonesList.appendChild(toneElement);
        });
      }
    });
  };

  // Create custom tone element for display
  window.createCustomToneElement = function (toneName, tone) {
    const toneDiv = document.createElement("div");
    toneDiv.className = "custom-tone-item";

    const header = document.createElement("div");
    header.className = "custom-tone-header";

    const title = document.createElement("div");
    title.className = "custom-tone-title";
    title.innerHTML = `<span class="custom-tone-emoji">${tone.emoji}</span>${toneName}`;

    header.appendChild(title);

    const content = document.createElement("div");
    content.className = "custom-tone-content";
    content.textContent = `Prompt: ${tone.prompt.substring(0, 50)}...`;

    const preview = document.createElement("div");
    preview.className = "custom-tone-preview";
    preview.innerHTML = `<strong>Guideline:</strong> ${tone.guideline.substring(
      0,
      100
    )}...`;

    toneDiv.appendChild(header);
    toneDiv.appendChild(content);
    toneDiv.appendChild(preview);

    return toneDiv;
  };

  // Delete custom tone
  window.deleteCustomTone = function (toneName) {
    if (confirm(`Are you sure you want to delete "${toneName}"?`)) {
      chrome.storage.local.get(["customTones"], (result) => {
        const customTones = result.customTones || {};
        delete customTones[toneName];

        chrome.storage.local.set({ customTones }, () => {
          loadCustomTones();
          updateTonesGrid(); // Refresh the tones grid
          alert(`🗑️ "${toneName}" deleted successfully.`);
        });
      });
    }
  };

  // Clear custom tone form
  window.clearCustomToneForm = function () {
    customToneNameInput.value = "";
    customToneEmojiInput.value = "";
    customTonePromptInput.value = "";
    customToneGuidelineInput.value = "";
  };

  // Create custom tone
  createCustomToneBtn.addEventListener("click", () => {
    const name = customToneNameInput.value.trim();
    const emoji = customToneEmojiInput.value.trim();
    const prompt = customTonePromptInput.value.trim();
    const guideline = customToneGuidelineInput.value.trim();

    if (!name || !emoji || !prompt || !guideline) {
      alert(
        "❌ Please fill in all fields (name, emoji, prompt, and guideline)."
      );
      return;
    }

    // Check if tone name already exists (including default tones)
    const existingTones = Object.keys(defaultTonePrompts);
    chrome.storage.local.get(["customTones"], (result) => {
      const customTones = result.customTones || {};
      const allTones = [...existingTones, ...Object.keys(customTones)];

      if (allTones.includes(name)) {
        alert(
          "❌ A tone with this name already exists. Please choose a different name."
        );
        return;
      }

      // Save custom tone
      const newCustomTones = {
        ...customTones,
        [name]: { emoji, prompt, guideline },
      };
      chrome.storage.local.set({ customTones: newCustomTones }, () => {
        clearCustomToneForm();
        loadCustomTones();
        updateTonesGrid(); // Refresh the tones grid
        if (typeof window.updateAddToneCustomTonesGrid === "function") {
          window.updateAddToneCustomTonesGrid(); // Refresh the Add Tone tab grid
        }
        alert(`✨ Custom tone "${name}" created successfully!`);
      });
    });
  });

  // Clear custom tone form
  clearCustomToneBtn.addEventListener("click", clearCustomToneForm);

  // Load custom tones on page load
  loadCustomTones();

  // --- Modern Emoji Picker ---
  const emojiInput = document.getElementById("customToneEmoji");
  const emojiPickerBtn = document.getElementById("emojiPickerBtn");
  const emojiPickerDropdown = document.getElementById("emojiPickerDropdown");
  const emojiSearch = document.getElementById("emojiSearch");
  const emojiCategories = document.getElementById("emojiCategories");
  const emojiGrid = document.getElementById("emojiGrid");

  // Emoji categories with icons and emojis
  const emojiCategoriesData = {
    Recent: { icon: "🕐", emojis: [] },
    Smileys: {
      icon: "😀",
      emojis: [
        "😀",
        "😁",
        "😂",
        "🤣",
        "😃",
        "😄",
        "😅",
        "😆",
        "😉",
        "😊",
        "😋",
        "😎",
        "😍",
        "😘",
        "🥰",
        "😗",
        "😙",
        "😚",
        "🙂",
        "🤗",
        "🤩",
        "🤔",
        "🤨",
        "😐",
        "😑",
        "😶",
        "🙄",
        "😏",
        "😣",
        "😥",
        "😮",
        "🤐",
        "😯",
        "😪",
        "😫",
        "🥱",
        "😴",
        "😌",
        "😛",
        "😜",
        "😝",
        "🤤",
        "😒",
        "😓",
        "😔",
        "😕",
        "🙃",
        "🤑",
        "😲",
        "☹️",
        "🙁",
        "😖",
        "😞",
        "😟",
        "😤",
        "😢",
        "😭",
        "😦",
        "😧",
        "😨",
        "😩",
        "🤯",
        "😬",
        "😰",
        "😱",
        "🥵",
        "🥶",
        "😳",
        "🤪",
        "😵",
        "😡",
        "😠",
        "🤬",
        "😷",
        "🤒",
        "🤕",
        "🤢",
        "🤮",
        "🤧",
        "😇",
        "🥳",
        "🥸",
        "😎",
        "🤓",
        "🧐",
        "😺",
        "😸",
        "😹",
        "😻",
        "😼",
        "😽",
        "🙀",
        "😿",
        "😾",
      ],
    },
    Business: {
      icon: "💼",
      emojis: [
        "💼",
        "🤝",
        "🏆",
        "💡",
        "🚀",
        "🎯",
        "💪",
        "🌟",
        "🔥",
        "💎",
        "🎉",
        "💬",
        "🎭",
        "⚡",
        "🧠",
        "💯",
        "🎪",
        "🏢",
        "📚",
        "🛠️",
        "🔍",
        "🎨",
        "⚙️",
        "🌱",
        "📈",
        "📉",
        "📝",
        "📣",
        "📦",
        "🛒",
        "💰",
        "💳",
        "📅",
        "📆",
        "🗓️",
        "📊",
        "📋",
        "📁",
        "📂",
        "🗂️",
        "🗃️",
        "🗄️",
        "📌",
        "📍",
        "📎",
        "🖇️",
        "✏️",
        "🖊️",
        "🖋️",
        "📝",
        "🗒️",
        "📏",
        "📐",
        "🔒",
        "🔓",
        "🔑",
        "🗝️",
        "🔨",
        "🪓",
        "⏰",
        "⏳",
        "⌛",
        "📢",
        "🔔",
        "🔕",
        "📣",
        "📯",
      ],
    },
    Food: {
      icon: "🍕",
      emojis: [
        "🍕",
        "🍔",
        "🍟",
        "🌭",
        "🍿",
        "🧂",
        "🥨",
        "🥯",
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
        "🥪",
        "🥙",
        "🧆",
        "🌮",
        "🌯",
        "🥗",
        "🥘",
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
        "☕",
        "🫖",
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
      ],
    },
    Animals: {
      icon: "🐶",
      emojis: [
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
        "🐥",
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
        "🦒",
        "🦘",
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
    },
    Travel: {
      icon: "✈️",
      emojis: [
        "✈️",
        "🛩️",
        "🛫",
        "🛬",
        "🪂",
        "💺",
        "🛰️",
        "🚀",
        "🛸",
        "🚁",
        "🛶",
        "⛵",
        "🚤",
        "🛥️",
        "🛳️",
        "⛴️",
        "🚢",
        "🚗",
        "🚕",
        "🚙",
        "🚌",
        "🚎",
        "🏎️",
        "🚓",
        "🚑",
        "🚒",
        "🚐",
        "🚚",
        "🚛",
        "🚜",
        "🛴",
        "🚲",
        "🛵",
        "🏍️",
        "🚨",
        "🚔",
        "🚍",
        "🚘",
        "🚖",
        "🚡",
        "🚠",
        "🚟",
        "🚃",
        "🚋",
        "🚞",
        "🚝",
        "🚄",
        "🚅",
        "🚈",
        "🚂",
        "🚆",
        "🚇",
        "🚊",
        "🚉",
        "✈️",
        "🛫",
        "🛬",
        "🛩️",
        "🛪",
        "🛨️",
        "🛥️",
        "🛳️",
        "⛴️",
        "🚢",
        "🚤",
        "⛵",
        "🛶",
        "🚁",
        "🛸",
        "🚀",
        "🛰️",
        "🪂",
        "💺",
        "🎫",
        "🎟️",
        "🎪",
        "🎭",
        "🎨",
        "🎬",
        "🎤",
        "🎧",
        "🎼",
        "🎹",
        "🥁",
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
        "🕹️",
        "🎮",
        "🎰",
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
        "🕹️",
      ],
    },
    Objects: {
      icon: "💡",
      emojis: [
        "💡",
        "🔦",
        "🕯️",
        "🪔",
        "🧯",
        "🛢️",
        "💸",
        "💵",
        "💴",
        "💶",
        "💷",
        "🪙",
        "🏦",
        "🏧",
        "🏨",
        "🏩",
        "🏪",
        "🏫",
        "🏬",
        "🏭",
        "🏯",
        "🏰",
        "💒",
        "🗼",
        "🗽",
        "⛪",
        "🕌",
        "🛕",
        "🕍",
        "⛩️",
        "🕋",
        "⛲",
        "⛺",
        "🌁",
        "🌃",
        "🏙️",
        "🌄",
        "🌅",
        "🌆",
        "🌇",
        "🌉",
        "♨️",
        "🎠",
        "🎡",
        "🎢",
        "💈",
        "🎪",
        "🚂",
        "🚃",
        "🚄",
        "🚅",
        "🚆",
        "🚇",
        "🚈",
        "🚉",
        "🚊",
        "🚝",
        "🚞",
        "🚋",
        "🚌",
        "🚍",
        "🚎",
        "🚏",
        "🚐",
        "🚑",
        "🚒",
        "🚓",
        "🚔",
        "🚕",
        "🚖",
        "🚗",
        "🚘",
        "🚙",
        "🚚",
        "🚛",
        "🚜",
        "🏎️",
        "🏍️",
        "🛵",
        "🛴",
        "🚲",
        "🛶",
        "⛵",
        "🚤",
        "🛥️",
        "🛳️",
        "⛴️",
        "🚢",
        "🚁",
        "🛸",
        "🚀",
        "🛰️",
        "🪂",
        "💺",
        "🛩️",
        "🛫",
        "🛬",
        "✈️",
        "🛪",
        "🛨️",
        "🛥️",
        "🛳️",
        "⛴️",
        "🚢",
        "🚤",
        "⛵",
        "🛶",
        "🚁",
        "🛸",
        "🚀",
        "🛰️",
        "🪂",
        "💺",
      ],
    },
  };

  let currentCategory = "Smileys";
  let recentEmojis = JSON.parse(localStorage.getItem("recentEmojis") || "[]");

  // Initialize emoji picker
  function initEmojiPicker() {
    // Create category tabs
    Object.keys(emojiCategoriesData).forEach((category, index) => {
      const tab = document.createElement("button");
      tab.type = "button";
      tab.innerHTML = emojiCategoriesData[category].icon;
      tab.setAttribute("data-category", category);
      tab.style.cssText =
        "padding: 12px; border: none; background: none; cursor: pointer; font-size: 20px; border-bottom: 2px solid transparent;";
      emojiCategories.appendChild(tab);
    });

    // Show initial category (Smileys instead of Recent)
    selectCategory("Smileys");
  }

  // Select category and show emojis
  function selectCategory(category) {
    currentCategory = category;

    // Update tab styling
    const tabs = emojiCategories.querySelectorAll("button");
    tabs.forEach((tab, index) => {
      const categoryName = Object.keys(emojiCategoriesData)[index];
      if (categoryName === category) {
        tab.style.borderBottomColor = "#007bff";
        tab.style.color = "#007bff";
      } else {
        tab.style.borderBottomColor = "transparent";
        tab.style.color = "#666";
      }
    });

    // Show emojis for category
    showEmojis(
      category === "Recent"
        ? recentEmojis
        : emojiCategoriesData[category].emojis
    );
  }

  // Show emojis in grid
  function showEmojis(emojis) {
    console.log("Showing emojis:", emojis.length);
    emojiGrid.innerHTML = "";

    if (emojis.length === 0) {
      emojiGrid.innerHTML =
        '<div style="text-align: center; color: #666; padding: 20px;">No emojis found</div>';
      return;
    }

    emojis.forEach((emoji) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = emoji;
      btn.setAttribute("data-emoji", emoji);
      btn.style.cssText =
        "width: 40px; height: 40px; border: none; background: none; cursor: pointer; font-size: 24px; border-radius: 6px; margin: 2px;";
      btn.onmouseenter = () => (btn.style.background = "#f0f0f0");
      btn.onmouseleave = () => (btn.style.background = "none");
      emojiGrid.appendChild(btn);
    });
    console.log("Created", emojis.length, "emoji buttons");
  }

  // Select emoji
  function selectEmoji(emoji) {
    console.log("Emoji selected:", emoji);
    emojiInput.value = emoji;

    // Add to recent emojis
    if (!recentEmojis.includes(emoji)) {
      recentEmojis.unshift(emoji);
      if (recentEmojis.length > 8) recentEmojis.pop();
      localStorage.setItem("recentEmojis", JSON.stringify(recentEmojis));
    }

    // Close picker
    emojiPickerDropdown.style.display = "none";
  }

  // Search emojis
  emojiSearch.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  emojiSearch.addEventListener("input", (e) => {
    e.stopPropagation();
    const query = e.target.value.toLowerCase().trim();
    if (query === "") {
      selectCategory(currentCategory);
      return;
    }

    // Search all emojis from all categories
    const allEmojis = [];
    Object.keys(emojiCategoriesData).forEach((category) => {
      if (category !== "Recent") {
        // Don't include Recent in search
        allEmojis.push(...emojiCategoriesData[category].emojis);
      }
    });

    // Filter emojis based on search query
    const filtered = allEmojis.filter((emoji) => {
      // Simple search - just check if the emoji character matches common search terms
      const searchTerms = {
        smile: [
          "😀",
          "😁",
          "😂",
          "🤣",
          "😃",
          "😄",
          "😅",
          "😆",
          "😉",
          "😊",
          "😋",
          "😎",
          "😍",
          "😘",
          "🥰",
          "😗",
          "😙",
          "😚",
          "🙂",
          "🤗",
          "🤩",
        ],
        laugh: [
          "😀",
          "😁",
          "😂",
          "🤣",
          "😃",
          "😄",
          "😅",
          "😆",
          "😉",
          "😊",
          "😋",
          "😎",
        ],
        cry: [
          "😢",
          "😭",
          "😦",
          "😧",
          "😨",
          "😩",
          "🤯",
          "😬",
          "😰",
          "😱",
          "🥵",
          "🥶",
          "😳",
          "🤪",
          "😵",
        ],
        angry: ["😡", "😠", "🤬"],
        sick: ["😷", "🤒", "🤕", "🤢", "🤮", "🤧"],
        love: ["😍", "😘", "🥰", "😗", "😙", "😚"],
        business: [
          "💼",
          "🤝",
          "🏆",
          "💡",
          "🚀",
          "🎯",
          "💪",
          "🌟",
          "🔥",
          "💎",
          "🎉",
          "💬",
          "🎭",
          "⚡",
          "🧠",
          "💯",
          "🎪",
          "🏢",
          "📚",
          "🛠️",
          "🔍",
          "🎨",
          "⚙️",
          "🌱",
        ],
        food: [
          "🍕",
          "🍔",
          "🍟",
          "🌭",
          "🍿",
          "🧂",
          "🥨",
          "🥯",
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
          "🥪",
          "🥙",
          "🧆",
          "🌮",
          "🌯",
          "🥗",
          "🥘",
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
          "☕",
          "🫖",
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
        ],
        animal: [
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
          "🐥",
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
          "🦒",
          "🦘",
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
        travel: [
          "✈️",
          "🛩️",
          "🛫",
          "🛬",
          "🪂",
          "💺",
          "🛰️",
          "🚀",
          "🛸",
          "🚁",
          "🛶",
          "⛵",
          "🚤",
          "🛥️",
          "🛳️",
          "⛴️",
          "🚢",
          "🚗",
          "🚕",
          "🚙",
          "🚌",
          "🚎",
          "🏎️",
          "🚓",
          "🚑",
          "🚒",
          "🚐",
          "🚚",
          "🚛",
          "🚜",
          "🛴",
          "🚲",
          "🛵",
          "🏍️",
          "🚨",
          "🚔",
          "🚍",
          "🚘",
          "🚖",
          "🚡",
          "🚠",
          "🚟",
          "🚃",
          "🚋",
          "🚞",
          "🚝",
          "🚄",
          "🚅",
          "🚈",
          "🚂",
          "🚆",
          "🚇",
          "🚊",
          "🚉",
        ],
        heart: [
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
        ],
        star: ["⭐", "🌟", "✨", "⚡", "💫", "⭐", "🌟", "✨", "⚡", "💫"],
        fire: ["🔥", "💥", "⚡", "🔥", "💥", "⚡"],
        money: ["💰", "💳", "💵", "💴", "💶", "💷", "🪙", "🏦", "🏧"],
        music: [
          "🎵",
          "🎶",
          "🎼",
          "🎤",
          "🎧",
          "🎹",
          "🥁",
          "🎷",
          "🎺",
          "🎸",
          "🪕",
          "🎻",
        ],
        sport: [
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
          "🤼‍♀️",
          "🤼",
          "🤸‍♀️",
          "🤸",
          "⛹️‍♀️",
          "⛹️",
          "🤺",
          "🤾‍♀️",
          "🤾",
          "🏌️‍♀️",
          "🏌️",
          "🏇",
          "🧘‍♀️",
          "🧘",
          "🏄‍♀️",
          "🏄",
          "🏊‍♀️",
          "🏊",
          "🤽‍♀️",
          "🤽",
          "🚣‍♀️",
          "🚣",
          "🏊‍♀️",
          "🏊",
          "🚴‍♀️",
          "🚴",
          "🚵‍♀️",
          "🚵",
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
          "🎭",
          "🩰",
          "🎨",
          "🎬",
          "🎤",
          "🎧",
          "🎼",
          "🎹",
          "🥁",
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
          "🕹️",
        ],
      };

      // Check if query matches any search terms
      for (const [term, emojis] of Object.entries(searchTerms)) {
        if (term.includes(query) && emojis.includes(emoji)) {
          return true;
        }
      }

      // Also check if the emoji is in the search term's emoji list
      for (const [term, emojis] of Object.entries(searchTerms)) {
        if (query.includes(term) && emojis.includes(emoji)) {
          return true;
        }
      }

      return false;
    });

    showEmojis(filtered);
  });

  // Event listeners
  emojiPickerBtn.onclick = (e) => {
    console.log("Emoji picker button clicked");
    e.stopPropagation();
    emojiPickerDropdown.style.display =
      emojiPickerDropdown.style.display === "none" ? "block" : "none";
    console.log("Dropdown display:", emojiPickerDropdown.style.display);
  };
  emojiInput.onclick = (e) => {
    console.log("Emoji input clicked");
    e.stopPropagation();
    emojiPickerDropdown.style.display =
      emojiPickerDropdown.style.display === "none" ? "block" : "none";
    console.log("Dropdown display:", emojiPickerDropdown.style.display);
  };

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (
      !emojiPickerDropdown.contains(e.target) &&
      !emojiInput.contains(e.target) &&
      !emojiPickerBtn.contains(e.target)
    ) {
      emojiPickerDropdown.style.display = "none";
    }
  });

  // Add click event to emoji grid to prevent closing and handle emoji selection
  emojiGrid.addEventListener("click", (e) => {
    console.log(
      "Emoji grid clicked, target:",
      e.target.tagName,
      e.target.textContent
    );
    e.stopPropagation();

    // Check if clicked element is an emoji button
    if (e.target.tagName === "BUTTON" && e.target.hasAttribute("data-emoji")) {
      const emoji = e.target.getAttribute("data-emoji");
      console.log("Emoji button clicked via delegation:", emoji);
      selectEmoji(emoji);
    } else {
      console.log("Clicked element is not an emoji button");
      console.log("Target attributes:", e.target.attributes);
    }
  });

  // Add click event to emoji categories to prevent closing and handle category selection
  emojiCategories.addEventListener("click", (e) => {
    e.stopPropagation();

    // Check if clicked element is a category tab
    if (
      e.target.tagName === "BUTTON" &&
      e.target.hasAttribute("data-category")
    ) {
      const category = e.target.getAttribute("data-category");
      console.log("Category tab clicked via delegation:", category);
      selectCategory(category);
    }
  });

  // Add click event to the entire dropdown to test if clicks are being registered
  emojiPickerDropdown.addEventListener("click", (e) => {
    console.log("Dropdown clicked at:", e.clientX, e.clientY);
    console.log(
      "Clicked element:",
      e.target.tagName,
      e.target.className || e.target.id
    );
  });

  // Debug: Check if elements exist
  console.log("Emoji elements found:", {
    emojiInput: !!emojiInput,
    emojiPickerBtn: !!emojiPickerBtn,
    emojiPickerDropdown: !!emojiPickerDropdown,
    emojiSearch: !!emojiSearch,
    emojiCategories: !!emojiCategories,
    emojiGrid: !!emojiGrid,
  });

  // Initialize picker
  initEmojiPicker();

  // Initialize tab switching
  initTabSwitching();

  // Initialize bulk action buttons
  initBulkActions();

  // Bulk actions functionality
  function initBulkActions() {
    const saveAllBtn = document.getElementById("saveAllTonesBtn");
    const resetAllBtn = document.getElementById("resetAllTonesBtn");

    if (saveAllBtn) {
      saveAllBtn.addEventListener("click", saveAllTones);
    }

    if (resetAllBtn) {
      resetAllBtn.addEventListener("click", resetAllTones);
    }
  }

  // Save all tones function
  function saveAllTones() {
    const tonePrompts = {};
    const toneGuidelines = {};

    // Get all tone names (default + custom)
    const allToneNames = [...Object.keys(defaultTonePrompts)];

    // Add custom tones
    chrome.storage.local.get("customTones", (result) => {
      const customTones = result.customTones || {};
      allToneNames.push(...Object.keys(customTones));

      // Collect all prompts and guidelines
      allToneNames.forEach((toneName) => {
        const promptTextarea = document.getElementById(`prompt-${toneName}`);
        const guidelineTextarea = document.getElementById(
          `guideline-${toneName}`
        );

        if (promptTextarea) {
          tonePrompts[toneName] = promptTextarea.value.trim();
        }
        if (guidelineTextarea) {
          toneGuidelines[toneName] = guidelineTextarea.value.trim();
        }
      });

      // Save to storage
      chrome.storage.local.set({ tonePrompts, toneGuidelines }, () => {
        alert(`✅ All ${allToneNames.length} tones saved successfully!`);
      });
    });
  }

  // Reset all tones function
  function resetAllTones() {
    if (
      confirm(
        "Are you sure you want to reset ALL tones to their default values? This will overwrite any custom changes."
      )
    ) {
      // Reset default tones to original values
      Object.keys(defaultTonePrompts).forEach((toneName) => {
        const promptTextarea = document.getElementById(`prompt-${toneName}`);
        const guidelineTextarea = document.getElementById(
          `guideline-${toneName}`
        );

        if (promptTextarea) {
          promptTextarea.value = defaultTonePrompts[toneName];
        }
        if (guidelineTextarea) {
          guidelineTextarea.value = defaultToneGuidelines[toneName];
        }
      });

      // Save the reset values
      chrome.storage.local.set(
        {
          tonePrompts: defaultTonePrompts,
          toneGuidelines: defaultToneGuidelines,
        },
        () => {
          alert("🔄 All tones reset to default values!");
        }
      );
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
      // Initialize tones grid and custom tones when tones tab is shown
      setTimeout(() => {
        console.log("Initializing tones tab...");
        try {
          if (typeof window.updateTonesGrid === "function") {
            console.log("Calling updateTonesGrid...");
            window.updateTonesGrid();
          } else {
            console.log("updateTonesGrid function not found");
          }
          if (typeof window.loadCustomTones === "function") {
            console.log("Calling loadCustomTones...");
            window.loadCustomTones();
          } else {
            console.log("loadCustomTones function not found");
          }
        } catch (error) {
          console.error("Error initializing tones tab:", error);
        }
      }, 100);
    } else if (tabName === "add-tone") {
      // Initialize custom tones when add-tone tab is shown
      setTimeout(() => {
        console.log("Initializing add-tone tab...");
        try {
          if (typeof window.loadCustomTones === "function") {
            console.log("Calling loadCustomTones for add-tone tab...");
            window.loadCustomTones();
          } else {
            console.log("loadCustomTones function not found");
          }
        } catch (error) {
          console.error("Error initializing add-tone tab:", error);
        }
      }, 100);
    }
  }

  // Initialize tones grid (only if we're on the tones tab)
  if (document.getElementById("tones").classList.contains("active")) {
    updateTonesGrid();
  }

  // Function to update the tones grid
  window.updateTonesGrid = function () {
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
        const defaultTones = Object.keys(defaultTonePrompts);
        console.log("Default tones:", defaultTones);
        defaultTones.forEach((toneName) => {
          console.log("Creating card for:", toneName);
          const toneCard = createToneCard(toneName, "default");
          tonesGrid.appendChild(toneCard);

          // Update the textareas with saved values (use getElementById for IDs with spaces)
          const promptTextarea = document.getElementById(`prompt-${toneName}`);
          const guidelineTextarea = document.getElementById(
            `guideline-${toneName}`
          );
          if (promptTextarea) {
            promptTextarea.value =
              savedPrompts[toneName] || defaultTonePrompts[toneName];
          }
          if (guidelineTextarea) {
            guidelineTextarea.value =
              savedGuidelines[toneName] || defaultToneGuidelines[toneName];
          }
        });

        // Add custom tones
        console.log("Custom tones:", Object.keys(customTones));
        Object.keys(customTones).forEach((toneName) => {
          console.log("Creating custom card for:", toneName);
          const toneCard = createToneCard(
            toneName,
            "custom",
            customTones[toneName]
          );
          tonesGrid.appendChild(toneCard);
        });
        console.log("Total cards created:", tonesGrid.children.length);
      }
    );
  };

  // Function to create a tone card
  window.createToneCard = function (toneName, type, customTone = null) {
    const card = document.createElement("div");
    card.className = "tone-card";

    const emoji = customTone
      ? customTone.emoji
      : defaultToneEmojis[toneName] || "🎯";

    // For default tones, we need to get the saved values from storage
    let prompt, guideline;
    if (customTone) {
      prompt = customTone.prompt;
      guideline = customTone.guideline;
    } else {
      // For default tones, we'll use a placeholder and load the actual values after creation
      prompt = defaultTonePrompts[toneName];
      guideline = defaultToneGuidelines[toneName];
    }

    card.innerHTML = `
      <div class="tone-header">
        <span class="tone-emoji">${emoji}</span>
        <span class="tone-name">${toneName}</span>
        <span class="tone-type ${type}">${
      type === "default" ? "Default" : "Custom"
    }</span>
      </div>
      <div class="form-group">
        <label>Prompt:</label>
        <textarea id="prompt-${toneName}" placeholder="Enter prompt text...">${prompt}</textarea>
      </div>
      <div class="form-group">
        <label>Guideline:</label>
        <textarea id="guideline-${toneName}" placeholder="Enter guideline text...">${guideline}</textarea>
      </div>
      <div class="tone-actions">
        <button class="btn btn-primary" data-action="save" data-tone="${toneName}">Save</button>
        <button class="btn btn-secondary" data-action="reset" data-tone="${toneName}">Reset</button>
        ${
          type === "custom"
            ? `<button class="btn btn-danger" data-action="delete" data-tone="${toneName}">Delete</button>`
            : ""
        }
      </div>
    `;

    // Add event listeners to buttons
    const buttons = card.querySelectorAll("button[data-action]");
    buttons.forEach((button) => {
      button.addEventListener("click", function () {
        const action = this.getAttribute("data-action");
        const tone = this.getAttribute("data-tone");

        switch (action) {
          case "save":
            window.saveIndividualTone(tone);
            break;
          case "reset":
            window.resetIndividualTone(tone);
            break;
          case "delete":
            window.deleteCustomTone(tone);
            break;
        }
      });
    });

    return card;
  };

  // Debug: Check dropdown visibility after initialization
  setTimeout(() => {
    console.log("Dropdown visibility check:", {
      display: emojiPickerDropdown.style.display,
      visibility: emojiPickerDropdown.style.visibility,
      opacity: emojiPickerDropdown.style.opacity,
      position: emojiPickerDropdown.style.position,
      zIndex: emojiPickerDropdown.style.zIndex,
    });
  }, 1000);

  // Helper functions for tone management
  window.saveIndividualTone = function (toneName) {
    console.log("saveIndividualTone called for:", toneName);
    const promptTextarea = document.getElementById(`prompt-${toneName}`);
    const guidelineTextarea = document.getElementById(`guideline-${toneName}`);

    console.log("Found textareas:", { promptTextarea, guidelineTextarea });

    if (promptTextarea && guidelineTextarea) {
      const prompt = promptTextarea.value.trim();
      const guideline = guidelineTextarea.value.trim();

      console.log("Values to save:", { prompt, guideline });

      chrome.storage.local.get(["tonePrompts", "toneGuidelines"], (result) => {
        const tonePrompts = result.tonePrompts || {};
        const toneGuidelines = result.toneGuidelines || {};

        tonePrompts[toneName] = prompt;
        toneGuidelines[toneName] = guideline;

        console.log("Saving to storage:", { tonePrompts, toneGuidelines });

        chrome.storage.local.set({ tonePrompts, toneGuidelines }, () => {
          console.log("Save completed for:", toneName);
          alert(`✅ ${toneName} tone saved successfully!`);
        });
      });
    } else {
      console.error("Textareas not found for tone:", toneName);
      alert(`❌ Error: Could not find textareas for ${toneName}`);
    }
  };

  window.resetIndividualTone = function (toneName) {
    const promptTextarea = document.getElementById(`prompt-${toneName}`);
    const guidelineTextarea = document.getElementById(`guideline-${toneName}`);

    if (promptTextarea && guidelineTextarea) {
      promptTextarea.value = defaultTonePrompts[toneName] || "";
      guidelineTextarea.value = defaultToneGuidelines[toneName] || "";

      // Also save the reset values to storage
      chrome.storage.local.get(["tonePrompts", "toneGuidelines"], (result) => {
        const tonePrompts = result.tonePrompts || {};
        const toneGuidelines = result.toneGuidelines || {};

        tonePrompts[toneName] = defaultTonePrompts[toneName] || "";
        toneGuidelines[toneName] = defaultToneGuidelines[toneName] || "";

        chrome.storage.local.set({ tonePrompts, toneGuidelines }, () => {
          alert(`🔄 ${toneName} tone reset to default!`);
        });
      });
    }
  };
  // --- End Modern Emoji Picker ---

  // --- Custom Tones Management Grid for Add Tone Tab ---
  window.updateAddToneCustomTonesGrid = function () {
    const grid = document.getElementById("addToneCustomTonesGrid");
    if (!grid) return;
    chrome.storage.local.get(["customTones"], (result) => {
      const customTones = result.customTones || {};
      grid.innerHTML = "";
      Object.keys(customTones).forEach((toneName) => {
        const tone = customTones[toneName];
        const card = document.createElement("div");
        card.className = "tone-card";
        card.innerHTML = `
          <div class="tone-header">
            <span class="tone-emoji">${tone.emoji}</span>
            <span class="tone-name">${toneName}</span>
            <span class="tone-type custom">Custom</span>
          </div>
          <div class="form-group">
            <label>Prompt:</label>
            <textarea id="addtone-prompt-${toneName}" placeholder="Enter prompt text...">${tone.prompt}</textarea>
          </div>
          <div class="form-group">
            <label>Guideline:</label>
            <textarea id="addtone-guideline-${toneName}" placeholder="Enter guideline text...">${tone.guideline}</textarea>
          </div>
          <div class="tone-actions">
            <button class="btn btn-primary" data-action="save" data-tone="${toneName}">Save</button>
            <button class="btn btn-danger" data-action="delete" data-tone="${toneName}">Delete</button>
          </div>
        `;
        // Event delegation for Save/Delete
        card
          .querySelector(".tone-actions")
          .addEventListener("click", function (e) {
            if (e.target.tagName !== "BUTTON") return;
            const action = e.target.getAttribute("data-action");
            const tName = e.target.getAttribute("data-tone");
            if (action === "save") {
              const prompt = card
                .querySelector(`#addtone-prompt-${tName}`)
                .value.trim();
              const guideline = card
                .querySelector(`#addtone-guideline-${tName}`)
                .value.trim();
              chrome.storage.local.get(["customTones"], (res) => {
                const cTones = res.customTones || {};
                if (cTones[tName]) {
                  cTones[tName].prompt = prompt;
                  cTones[tName].guideline = guideline;
                  chrome.storage.local.set({ customTones: cTones }, () => {
                    window.loadCustomTones();
                    window.updateAddToneCustomTonesGrid();
                    window.updateTonesGrid && window.updateTonesGrid();
                    alert(`✅ ${tName} updated!`);
                  });
                }
              });
            } else if (action === "delete") {
              if (confirm(`Are you sure you want to delete "${tName}"?`)) {
                chrome.storage.local.get(["customTones"], (res) => {
                  const cTones = res.customTones || {};
                  delete cTones[tName];
                  chrome.storage.local.set({ customTones: cTones }, () => {
                    window.loadCustomTones();
                    window.updateAddToneCustomTonesGrid();
                    window.updateTonesGrid && window.updateTonesGrid();
                    alert(`🗑️ "${tName}" deleted!`);
                  });
                });
              }
            }
          });
        grid.appendChild(card);
      });
    });
  };

  // Update showTab to call updateAddToneCustomTonesGrid for add-tone tab
  const origShowTab = showTab;
  showTab = function (tabName) {
    origShowTab(tabName);
    if (tabName === "add-tone") {
      setTimeout(() => {
        window.updateAddToneCustomTonesGrid &&
          window.updateAddToneCustomTonesGrid();
      }, 100);
    }
  };
});
