document.addEventListener("DOMContentLoaded", () => {
  const apiStatus = document.getElementById("apiStatus");
  const modelSelect = document.getElementById("modelSelect");

  // Check OpenAI key
  chrome.storage.local.get("vibeOpenAIKey", (result) => {
    if (result.vibeOpenAIKey && result.vibeOpenAIKey.startsWith("sk-")) {
      apiStatus.textContent = "✅ Connected";
      apiStatus.style.color = "green";
    } else {
      apiStatus.textContent = "❌ Disconnected";
      apiStatus.style.color = "red";
    }
  });

  // Load current model selection
  chrome.storage.local.get("vibeModel", (res) => {
    modelSelect.value = res.vibeModel || "gpt-3.5-turbo";
  });

  modelSelect.addEventListener("change", (e) => {
    chrome.storage.local.set({ vibeModel: e.target.value });
  });

  document.getElementById("openCreate").addEventListener("click", () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("create.html") });
  });

  document.getElementById("openSettings").addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });

  document.getElementById("openGuide").addEventListener("click", () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("guide.html") });
  });
});
