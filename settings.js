const defaultTonePrompts = {
  "Smart Contrarian": `Write 2 contrarian but respectful LinkedIn comments that offer a different perspective to the post. Avoid being rude.`,
  "Agreement with Value": `Write 2 thoughtful comments that agree with the post and add extra insight or a real-life example.`,
  "Ask a Question": `Write 2 engaging questions I can ask the post author to spark a conversation. Be concise and curious.`,
  Friendly: `Write 2 friendly and encouraging comments as if responding to a friend. Keep it human and casual.`,
  Celebratory: `Write 2 congratulatory comments that sound genuine and energetic, suitable for posts like promotions or achievements.`,
  Constructive: `Write 2 comments that offer polite suggestions or additional resources in a helpful tone.`,
};

document.addEventListener("DOMContentLoaded", () => {
  const apiKeyInput = document.getElementById("apiKey");
  const saveKeyBtn = document.getElementById("saveKey");
  const clearKeyBtn = document.getElementById("clearKey");
  const savePromptsBtn = document.getElementById("savePrompts");
  const resetPromptsBtn = document.getElementById("resetPrompts");
  const toneContainer = document.getElementById("tonePromptsContainer");

  // Load stored API key
  chrome.storage.local.get(["vibeOpenAIKey", "tonePrompts"], (result) => {
    apiKeyInput.value = result.vibeOpenAIKey || "";

    const storedPrompts = result.tonePrompts || {};
    Object.keys(defaultTonePrompts).forEach((tone) => {
      const textarea = document.createElement("textarea");
      textarea.id = `prompt-${tone}`;
      textarea.placeholder = tone;
      textarea.value = storedPrompts[tone] || defaultTonePrompts[tone];

      const label = document.createElement("label");
      label.innerText = `🗣️ ${tone}`;
      label.style.fontWeight = "bold";

      toneContainer.appendChild(label);
      toneContainer.appendChild(textarea);
    });
  });

  saveKeyBtn.addEventListener("click", () => {
    const key = apiKeyInput.value.trim();
    chrome.storage.local.set({ vibeOpenAIKey: key }, () => {
      alert("✅ API key saved.");
    });
  });

  clearKeyBtn.addEventListener("click", () => {
    chrome.storage.local.remove("vibeOpenAIKey", () => {
      apiKeyInput.value = "";
      alert("🗑️ API key removed.");
    });
  });

  savePromptsBtn.addEventListener("click", () => {
    const tonePrompts = {};
    Object.keys(defaultTonePrompts).forEach((tone) => {
      const textarea = document.getElementById(`prompt-${tone}`);
      if (textarea) {
        tonePrompts[tone] = textarea.value.trim();
      }
    });
    chrome.storage.local.set({ tonePrompts }, () => {
      alert("✅ Prompts saved!");
    });
  });

  resetPromptsBtn.addEventListener("click", () => {
    Object.keys(defaultTonePrompts).forEach((tone) => {
      const textarea = document.getElementById(`prompt-${tone}`);
      if (textarea) {
        textarea.value = defaultTonePrompts[tone];
      }
    });
    chrome.storage.local.set({ tonePrompts: defaultTonePrompts }, () => {
      alert("🔄 Prompts reset to default.");
    });
  });
});
