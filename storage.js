const tones = [
  "Smart Contrarian",
  "Agreement with Value",
  "Ask a Question",
  "Friendly",
  "Celebratory",
  "Constructive",
];

// Load saved data on page load
document.addEventListener("DOMContentLoaded", () => {
  // Load API key
  chrome.storage.local.get(["vibeOpenAIKey"], (res) => {
    const key = res.vibeOpenAIKey || "";
    document.getElementById("apiKey").value = key;
  });

  // Load tone prompts
  chrome.storage.local.get(["tonePrompts"], (res) => {
    const savedPrompts = res.tonePrompts || {};
    const container = document.getElementById("tone-training-fields");

    tones.forEach((tone) => {
      const saved = savedPrompts[tone] || "";
      const div = document.createElement("div");
      div.style.marginBottom = "16px";

      div.innerHTML = `
        <label for="prompt-${tone}"><b>${tone}</b></label>
        <textarea id="prompt-${tone}" placeholder="Enter prompt for ${tone}...">${saved}</textarea>
        <div class="char-counter" id="count-${tone}" style="font-size: 12px; color: #666;">${saved.length} characters</div>
      `;
      container.appendChild(div);
    });

    updateCustomPromptCount();
    attachCounterListeners();
  });
});

// API Key - Save
document.getElementById("saveKey").addEventListener("click", () => {
  const key = document.getElementById("apiKey").value.trim();
  chrome.storage.local.set({ vibeOpenAIKey: key }, () => {
    showStatus("apiStatus", "✅ Saved!");
  });
});

// API Key - Remove
document.getElementById("clearKey").addEventListener("click", () => {
  chrome.storage.local.remove("vibeOpenAIKey", () => {
    document.getElementById("apiKey").value = "";
    showStatus("apiStatus", "❌ Removed!");
  });
});

// Save Prompts
document.getElementById("saveTonePrompts").addEventListener("click", () => {
  const updatedPrompts = {};
  tones.forEach((tone) => {
    const val = document.getElementById(`prompt-${tone}`).value.trim();
    if (val.length > 0) updatedPrompts[tone] = val;
  });

  chrome.storage.local.set({ tonePrompts: updatedPrompts }, () => {
    updateCustomPromptCount();
    showStatus("saveStatus", "✅ Prompts saved!");
  });
});

// Reset Prompts
document.getElementById("resetTonePrompts").addEventListener("click", () => {
  if (!confirm("Are you sure you want to clear all custom tone prompts?"))
    return;

  chrome.storage.local.remove("tonePrompts", () => {
    tones.forEach((tone) => {
      document.getElementById(`prompt-${tone}`).value = "";
      document.getElementById(`count-${tone}`).innerText = "0 characters";
    });
    updateCustomPromptCount();
    showStatus("saveStatus", "🧹 Prompts cleared!");
  });
});

// Helpers
function showStatus(id, msg) {
  const el = document.getElementById(id);
  el.innerText = msg;
  setTimeout(() => (el.innerText = ""), 2000);
}

function updateCustomPromptCount() {
  chrome.storage.local.get(["tonePrompts"], (res) => {
    const prompts = res.tonePrompts || {};
    const count = Object.keys(prompts).length;
    document.getElementById(
      "customPromptCount"
    ).innerText = `📝 ${count} / ${tones.length} tones customized`;
  });
}

function attachCounterListeners() {
  tones.forEach((tone) => {
    const textarea = document.getElementById(`prompt-${tone}`);
    const counter = document.getElementById(`count-${tone}`);
    textarea.addEventListener("input", () => {
      counter.innerText = `${textarea.value.length} characters`;
    });
  });
}
