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

document.addEventListener("DOMContentLoaded", () => {
  const apiKeyInput = document.getElementById("apiKey");
  const saveKeyBtn = document.getElementById("saveKey");
  const clearKeyBtn = document.getElementById("clearKey");
  const savePromptsBtn = document.getElementById("savePrompts");
  const resetPromptsBtn = document.getElementById("resetPrompts");
  const toneContainer = document.getElementById("tonePromptsContainer");

  // Store the actual API key for masking/unmasking
  let actualApiKey = "";

  document.getElementById("exportSettings").addEventListener("click", () => {
    chrome.storage.local.get(["tonePrompts", "toneGuidelines"], (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "vibe-settings.json";
      a.click();
      URL.revokeObjectURL(url);
    });
  });

  document.getElementById("importSettings").addEventListener("click", () => {
    const fileInput = document.getElementById("importFile");
    const file = fileInput.files[0];
    if (!file) return alert("Please select a JSON file to import.");

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const imported = JSON.parse(e.target.result);
        const { tonePrompts = {}, toneGuidelines = {} } = imported;

        chrome.storage.local.set({ tonePrompts, toneGuidelines }, () => {
          alert("✅ Settings imported! Refresh the page to see updates.");
        });
      } catch (err) {
        alert("❌ Failed to import. Make sure it’s a valid Vibe JSON file.");
      }
    };
    reader.readAsText(file);
  });

  chrome.storage.local.get(
    ["vibeOpenAIKey", "tonePrompts", "toneGuidelines"],
    (result) => {
      // Store the actual API key and mask it for display
      actualApiKey = result.vibeOpenAIKey || "";
      if (actualApiKey.length > 10) {
        apiKeyInput.value =
          actualApiKey.substring(0, 10) + "*".repeat(actualApiKey.length - 10);
      } else {
        apiKeyInput.value = actualApiKey;
      }
      const storedPrompts = result.tonePrompts || {};
      const storedGuidelines = result.toneGuidelines || {};

      Object.keys(defaultTonePrompts).forEach((tone) => {
        // Create prompt label
        const promptLabel = document.createElement("label");
        promptLabel.innerText = "Write a prompt:";
        promptLabel.style.fontWeight = "bold";
        promptLabel.style.fontSize = "14px";
        promptLabel.style.marginBottom = "6px";
        promptLabel.style.display = "block";

        const promptTextarea = document.createElement("textarea");
        promptTextarea.id = `prompt-${tone}`;
        promptTextarea.placeholder = `Prompt for ${tone}`;
        promptTextarea.value = storedPrompts[tone] || defaultTonePrompts[tone];

        // Create guideline label
        const guidelineLabel = document.createElement("label");
        guidelineLabel.innerText = "Do's and Don't guideline for AI:";
        guidelineLabel.style.fontWeight = "bold";
        guidelineLabel.style.fontSize = "14px";
        guidelineLabel.style.marginBottom = "6px";
        guidelineLabel.style.marginTop = "12px";
        guidelineLabel.style.display = "block";

        const guidelineTextarea = document.createElement("textarea");
        guidelineTextarea.id = `guideline-${tone}`;
        guidelineTextarea.placeholder = `Guidelines for ${tone}`;
        guidelineTextarea.value =
          storedGuidelines[tone] || defaultToneGuidelines[tone];

        const saveBtn = document.createElement("button");
        saveBtn.textContent = "💾 Save";
        saveBtn.className = "individual-save";
        saveBtn.style.backgroundColor = "#0073b1";
        saveBtn.style.color = "white";
        saveBtn.addEventListener("click", () => {
          chrome.storage.local.get(["tonePrompts", "toneGuidelines"], (res) => {
            const updatedPrompts = res.tonePrompts || {};
            const updatedGuidelines = res.toneGuidelines || {};
            updatedPrompts[tone] = promptTextarea.value.trim();
            updatedGuidelines[tone] = guidelineTextarea.value.trim();
            chrome.storage.local.set(
              {
                tonePrompts: updatedPrompts,
                toneGuidelines: updatedGuidelines,
              },
              () => {
                alert(`✅ ${tone} saved.`);
              }
            );
          });
        });

        const resetBtn = document.createElement("button");
        resetBtn.textContent = "🧹 Reset";
        resetBtn.className = "individual-reset";
        resetBtn.style.backgroundColor = "gray";
        resetBtn.style.color = "white";
        resetBtn.addEventListener("click", () => {
          promptTextarea.value = defaultTonePrompts[tone];
          guidelineTextarea.value = defaultToneGuidelines[tone];
          chrome.storage.local.get(["tonePrompts", "toneGuidelines"], (res) => {
            const updatedPrompts = res.tonePrompts || {};
            const updatedGuidelines = res.toneGuidelines || {};
            updatedPrompts[tone] = defaultTonePrompts[tone];
            updatedGuidelines[tone] = defaultToneGuidelines[tone];
            chrome.storage.local.set(
              {
                tonePrompts: updatedPrompts,
                toneGuidelines: updatedGuidelines,
              },
              () => {
                alert(`🔄 ${tone} reset to default.`);
              }
            );
          });
        });

        const label = document.createElement("label");
        label.innerText = `🗣️ ${tone}`;
        label.style.fontWeight = "bold";

        const wrapper = document.createElement("div");
        wrapper.style.marginBottom = "20px";
        wrapper.appendChild(label);
        wrapper.appendChild(promptLabel);
        wrapper.appendChild(promptTextarea);
        wrapper.appendChild(guidelineLabel);
        wrapper.appendChild(guidelineTextarea);

        // Create a container for the buttons and right-align them
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "tone-buttons";
        buttonContainer.appendChild(saveBtn);
        buttonContainer.appendChild(resetBtn);
        wrapper.appendChild(buttonContainer);

        toneContainer.appendChild(wrapper);
      });
    }
  );

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

  savePromptsBtn.addEventListener("click", () => {
    const tonePrompts = {};
    const toneGuidelines = {};
    Object.keys(defaultTonePrompts).forEach((tone) => {
      const promptTextarea = document.getElementById(`prompt-${tone}`);
      const guidelineTextarea = document.getElementById(`guideline-${tone}`);
      if (promptTextarea) {
        tonePrompts[tone] = promptTextarea.value.trim();
      }
      if (guidelineTextarea) {
        toneGuidelines[tone] = guidelineTextarea.value.trim();
      }
    });
    chrome.storage.local.set({ tonePrompts, toneGuidelines }, () => {
      alert("✅ All prompts + guidelines saved.");
    });
  });

  resetPromptsBtn.addEventListener("click", () => {
    Object.keys(defaultTonePrompts).forEach((tone) => {
      const promptTextarea = document.getElementById(`prompt-${tone}`);
      const guidelineTextarea = document.getElementById(`guideline-${tone}`);
      if (promptTextarea) {
        promptTextarea.value = defaultTonePrompts[tone];
      }
      if (guidelineTextarea) {
        guidelineTextarea.value = defaultToneGuidelines[tone];
      }
    });
    chrome.storage.local.set(
      {
        tonePrompts: defaultTonePrompts,
        toneGuidelines: defaultToneGuidelines,
      },
      () => {
        alert("🔄 All prompts and guidelines reset to default.");
      }
    );
  });
});
