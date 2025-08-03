document.addEventListener("DOMContentLoaded", () => {
  const apiKeyInput = document.getElementById("apiKey");
  const saveKeyBtn = document.getElementById("saveKeyBtn");
  const clearKeyBtn = document.getElementById("clearKeyBtn");
  const exportBtn = document.getElementById("exportBtn");
  const importBtn = document.getElementById("importBtn");
  const importFile = document.getElementById("importFile");

  let actualApiKey = "";

  // Load current API key
  chrome.storage.local.get("vibeOpenAIKey", (result) => {
    if (result.vibeOpenAIKey) {
      actualApiKey = result.vibeOpenAIKey;
      apiKeyInput.value = "•".repeat(20);
    }
  });

  // Save API key
  saveKeyBtn.addEventListener("click", () => {
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
      showNotification("Please enter an API key.", "error");
      return;
    }

    if (!apiKey.startsWith("sk-")) {
      showNotification(
        "Please enter a valid OpenAI API key (should start with 'sk-').",
        "error"
      );
      return;
    }

    chrome.storage.local.set({ vibeOpenAIKey: apiKey }, () => {
      actualApiKey = apiKey;
      apiKeyInput.value = "•".repeat(20);
      showNotification("✅ API key saved successfully!", "success");
    });
  });

  // Clear API key
  clearKeyBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear your API key?")) {
      chrome.storage.local.remove("vibeOpenAIKey", () => {
        actualApiKey = "";
        apiKeyInput.value = "";
        showNotification("🗑️ API key cleared successfully!", "success");
      });
    }
  });

  // Export settings
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
        showNotification("✅ Settings exported successfully!", "success");
      }
    );
  });

  // Safe JSON parsing with validation
  function safeJSONParse(jsonString, maxSize = 1024 * 1024) {
    // 1MB limit
    if (jsonString.length > maxSize) {
      throw new Error("File too large (max 1MB)");
    }

    const parsed = JSON.parse(jsonString);

    // Validate structure
    if (typeof parsed !== "object" || parsed === null) {
      throw new Error("Invalid JSON structure");
    }

    // Validate expected fields
    const expectedFields = [
      "vibeOpenAIKey",
      "tonePrompts",
      "toneGuidelines",
      "customTones",
    ];
    const hasValidFields = expectedFields.some((field) => field in parsed);

    if (!hasValidFields) {
      throw new Error("Invalid settings file format");
    }

    return parsed;
  }

  // Show notification instead of alert
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

  // Import settings
  importBtn.addEventListener("click", () => {
    if (!importFile.files[0]) {
      showNotification("Please select a JSON file to import.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const imported = safeJSONParse(e.target.result);
        const {
          vibeOpenAIKey = "",
          tonePrompts = {},
          toneGuidelines = {},
          customTones = {},
        } = imported;

        chrome.storage.local.set(
          { vibeOpenAIKey, tonePrompts, toneGuidelines, customTones },
          () => {
            // Update the API key input if imported
            if (vibeOpenAIKey) {
              actualApiKey = vibeOpenAIKey;
              apiKeyInput.value = "•".repeat(20);
            }

            showNotification(
              "✅ Settings imported! All tones and custom tones have been updated.",
              "success"
            );
          }
        );
      } catch (error) {
        showNotification(
          `❌ Error importing settings: ${error.message}`,
          "error"
        );
        console.error("Import error:", error);
      }
    };
    reader.readAsText(importFile.files[0]);
  });

  // API key input handling for masking/unmasking
  apiKeyInput.addEventListener("focus", () => {
    if (actualApiKey) {
      apiKeyInput.value = actualApiKey;
    }
  });

  apiKeyInput.addEventListener("blur", () => {
    if (actualApiKey && apiKeyInput.value === actualApiKey) {
      apiKeyInput.value = "•".repeat(20);
    }
  });
});
