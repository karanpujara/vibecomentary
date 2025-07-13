document.addEventListener("DOMContentLoaded", function () {
  const apiInput = document.getElementById("apiKey");
  const toneDropdown = document.getElementById("tone");
  const modalToneSelect = document.getElementById("modalTone");
  const emojiSelect = document.getElementById("emoji");
  const commentBoxes = document.querySelectorAll(".comment-box span");
  const dmBox = document.querySelector(".dm-box span");
  const regenerateBtn = document.getElementById("regenerate");
  const copyBtn = document.getElementById("copy");

  const emojiMap = {
    "Smart Contrarian": "🤔",
    "Agreement with Value": "✅",
    "Ask a Question": "❓",
    Friendly: "💬",
    Celebratory: "🎉",
    Constructive: "🛠️",
  };

  // ✅ Load saved values (API key, tone, emoji)
  chrome.storage.local.get(
    ["vibeOpenAIKey", "vibeTone", "vibeEmoji"],
    (result) => {
      if (apiInput) apiInput.value = result.vibeOpenAIKey || "";
      const tone = result.vibeTone || "Smart Contrarian";
      const emoji = result.vibeEmoji || emojiMap[tone] || "💬";
      if (toneDropdown) toneDropdown.value = tone;
      if (modalToneSelect) modalToneSelect.value = tone;
      if (emojiSelect) emojiSelect.value = emoji;

      updateSuggestions();
    }
  );

  // ✅ Save API Key
  apiInput?.addEventListener("change", (e) => {
    chrome.storage.local.set({ vibeOpenAIKey: e.target.value }, () => {
      console.log("✅ API Key saved");
    });
  });

  // ✅ Sync tone from main dropdown
  toneDropdown?.addEventListener("change", () => {
    const selectedTone = toneDropdown.value;
    const selectedEmoji = emojiMap[selectedTone] || "💬";

    emojiSelect.value = selectedEmoji;
    if (modalToneSelect) modalToneSelect.value = selectedTone;

    chrome.storage.local.set({
      vibeTone: selectedTone,
      vibeEmoji: selectedEmoji,
    });

    updateSuggestions();
  });

  // ✅ Sync tone from modal dropdown
  modalToneSelect?.addEventListener("change", (e) => {
    const newTone = e.target.value;

    toneDropdown.value = newTone;
    emojiSelect.value = emojiMap[newTone] || "💬";

    chrome.storage.local.set({
      vibeTone: newTone,
      vibeEmoji: emojiSelect.value,
    });

    updateSuggestions();
  });

  // ✅ Save emoji if changed manually
  emojiSelect?.addEventListener("change", () => {
    chrome.storage.local.set({
      vibeEmoji: emojiSelect.value,
    });
  });

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
      case "Friendly":
        return {
          comments: [
            "This is such great news. Congratulations!",
            "Love the positive energy here. Wishing you the best!",
          ],
          dm: "Hi! Just read your post. Congrats and best wishes!",
        };
      case "Celebratory":
        return {
          comments: [
            "Huge win! Your hard work is clearly paying off 🎉",
            "Awesome moment—enjoy the success 🥳",
          ],
          dm: "This deserves a celebration! Sending best wishes.",
        };
      case "Constructive":
        return {
          comments: [
            "Interesting points raised. How do you address scalability?",
            "Curious—what's the fallback if X doesn't work?",
          ],
          dm: "I liked your take and had a few thoughts. Would love to connect!",
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

  // ✅ Regenerate suggestions
  regenerateBtn?.addEventListener("click", updateSuggestions);

  // ✅ Copy all
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

  // ✅ Copy one
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
});
