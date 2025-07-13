document.addEventListener("DOMContentLoaded", function () {
  const apiInput = document.getElementById("apiKey"); // ✅ FIXED
  const toneDropdown = document.getElementById("tone");
  const commentBoxes = document.querySelectorAll(".comment-box span");
  const dmBox = document.querySelector(".dm-box span");
  const regenerateBtn = document.getElementById("regenerate");
  const copyBtn = document.getElementById("copy");
  const toneSelect = document.getElementById("tone");
  const emojiSelect = document.getElementById("emoji");

  // ✅ Load API Key from chrome.storage.local
  if (apiInput) {
    chrome.storage.local.get("vibeOpenAIKey", (result) => {
      apiInput.value = result.vibeOpenAIKey || "";
    });

    // ✅ Save to chrome.storage.local when changed
    apiInput.addEventListener("change", (e) => {
      const newKey = e.target.value;
      chrome.storage.local.set({ vibeOpenAIKey: newKey }, () => {
        console.log("✅ API Key saved to chrome.storage.local");
      });
    });
  }

  // ✅ Load & save tone and emoji using localStorage
  if (toneSelect && emojiSelect) {
    toneSelect.value = localStorage.getItem("vibeTone") || "Smart Contrarian";
    emojiSelect.value = localStorage.getItem("vibeEmoji") || "None";

    [toneSelect, emojiSelect].forEach((el) => {
      el.addEventListener("change", () => {
        localStorage.setItem("vibeTone", toneSelect.value);
        localStorage.setItem("vibeEmoji", emojiSelect.value);
      });
    });
  }

  function getMockSuggestions(tone) {
    switch (tone) {
      case "Smart Contrarian":
        return {
          comments: [
            "Interesting view. Do you think this would work for larger teams?",
            "I like this idea, but could it lead to complexity later?",
          ],
          dm: "Hi there, I read your post and it raised a smart point. Would love to connect and share ideas.",
        };
      case "Agreement with Value":
        return {
          comments: [
            "Totally agree. We applied something similar last year.",
            "Yes this is true. Works really well when users face quick decisions.",
          ],
          dm: "Hi, I liked your post and fully agree with your point. Happy to stay in touch if I can help.",
        };
      case "Ask a Question":
        return {
          comments: [
            "This is helpful. What inspired you to try it this way?",
            "Great point. Are you testing this live already?",
          ],
          dm: "Hey, your post caught my attention. Curious what led to that insight. Let me know if you are open to connect.",
        };
      default:
        return {
          comments: ["This is a good insight.", "Helpful to think about."],
          dm: "Read your post. Good stuff. Wishing you the best with it.",
        };
    }
  }

  function updateSuggestions() {
    const selectedTone = toneDropdown?.value || "Smart Contrarian";
    const suggestions = getMockSuggestions(selectedTone);

    if (commentBoxes[0])
      commentBoxes[0].textContent = suggestions.comments[0] || "No comment";
    if (commentBoxes[1])
      commentBoxes[1].textContent = suggestions.comments[1] || "No comment";
    if (dmBox) dmBox.textContent = suggestions.dm || "No DM";
  }

  regenerateBtn?.addEventListener("click", updateSuggestions);
  toneDropdown?.addEventListener("change", updateSuggestions);

  copyBtn?.addEventListener("click", () => {
    const text = Array.from(
      document.querySelectorAll(".comment-box span, .dm-box span")
    )
      .map((el) => el.textContent)
      .join("\n\n");
    navigator.clipboard.writeText(text).then(() => {
      copyBtn.textContent = "Copied!";
      setTimeout(() => {
        copyBtn.textContent = "Copy All";
      }, 1500);
    });
  });

  document.querySelectorAll(".copy-one").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const text = e.target.parentNode.querySelector("span").textContent;
      navigator.clipboard.writeText(text).then(() => {
        e.target.textContent = "✅";
        setTimeout(() => {
          e.target.textContent = "📋";
        }, 1000);
      });
    });
  });

  document.getElementById("openSettings").addEventListener("click", () => {
    chrome.runtime.openOptionsPage().catch((err) => console.error(err));
  });

  updateSuggestions();
});
