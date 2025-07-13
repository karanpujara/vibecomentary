console.log("✅ VibeCommentary contentScript loaded");
let activePostElement = null;
function injectButtonUnderPost() {
  const posts = document.querySelectorAll("div.feed-shared-update-v2");

  posts.forEach((post) => {
    if (post.querySelector(".vibe-btn")) return;

    const commentButton = post.querySelector('button[aria-label*="Comment"]');
    if (!commentButton) return;

    const btn = document.createElement("button");
    btn.innerText = "💬 Suggest Comments";
    btn.className = "vibe-btn";
    btn.style.cssText = `
      background-color: #0073b1;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 6px 10px;
      margin-left: 8px;
      cursor: pointer;
      font-size: 14px;
    `;

    btn.addEventListener("click", async () => {
      activePostElement = post;
      chrome.storage.local.get(
        ["vibeOpenAIKey", "vibeTone", "vibeEmoji"],
        async (result) => {
          const apiKey = result.vibeOpenAIKey;
          const tone = result.vibeTone || "Friendly";
          const emoji = result.vibeEmoji || "💬";

          if (!apiKey) {
            alert("⚠️ Please set your OpenAI API key in the extension popup.");
            return;
          }

          const postText = post.innerText.slice(0, 800);
          document.querySelectorAll("[data-vibe-post]").forEach((el) => {
            el.removeAttribute("data-vibe-post");
          });

          // Tag only the current post
          post.setAttribute("data-vibe-post", postText);

          await fetchSuggestions(apiKey, tone, emoji, postText);
        }
      );
    });

    commentButton.parentElement?.appendChild(btn);
  });
}

setInterval(injectButtonUnderPost, 2000);

async function fetchSuggestions(apiKey, tone, emoji, postText, postEl = null) {
  showVibeModal(`${emoji} ${tone}`, [], "", true);

  chrome.storage.local.get(["tonePrompts", "toneGuidelines"], async (res) => {
    const defaultTonePrompts = {
      "Smart Contrarian": `Write 2 contrarian but respectful LinkedIn comments that offer a different perspective to the post. Avoid being rude.`,
      "Agreement with Value": `Write 2 thoughtful comments that agree with the post and add extra insight or a real-life example.`,
      "Ask a Question": `Write 2 engaging questions I can ask the post author to spark a conversation. Be concise and curious.`,
      Friendly: `Write 2 friendly and encouraging comments as if responding to a friend. Keep it human and casual.`,
      Celebratory: `Write 2 congratulatory comments that sound genuine and energetic, suitable for posts like promotions or achievements.`,
      Constructive: `Write 2 comments that offer polite suggestions or additional resources in a helpful tone.`,
    };

    const defaultToneGuidelines = {
      "Smart Contrarian": `- Start each comment by addressing \${firstNameWithPrefix} directly.\n- Respectfully challenge the post’s view.\n- Keep tone civil and thought-provoking.`,
      "Agreement with Value": `- Address \${firstNameWithPrefix} directly.\n- Add extra value, a personal story, or insight.\n- Keep tone appreciative and humble.`,
      "Ask a Question": `- Start with \${firstNameWithPrefix}.\n- Ask thoughtful, curious questions.\n- Avoid yes/no questions.`,
      Friendly: `- Use a casual tone and mention something specific you liked.\n- Start with \${firstNameWithPrefix}.\n- Keep it short and warm.`,
      Celebratory: `- Use an enthusiastic tone.\n- Start with \${firstNameWithPrefix}.\n- Celebrate the achievement naturally.`,
      Constructive: `- Offer a helpful suggestion without sounding critical.\n- Start with \${firstNameWithPrefix}.\n- Be kind and relevant.`,
    };

    const customPrompt = res.tonePrompts?.[tone]?.trim();
    const customGuidelineRaw = res.toneGuidelines?.[tone]?.trim();

    let firstNameWithPrefix = "the author";
    let fullName = "";

    if (postEl) {
      const nameElem =
        postEl.querySelector(".update-components-actor__title span span") ||
        postEl.querySelector(".feed-shared-actor__name");

      if (nameElem) fullName = nameElem.innerText.trim();
    }

    const knownPrefixes = ["Dr.", "Mr.", "Ms.", "Mrs.", "Prof."];
    const nameParts = fullName.split(" ").filter(Boolean);

    if (nameParts.length > 0) {
      if (knownPrefixes.includes(nameParts[0])) {
        firstNameWithPrefix = `${nameParts[0]} ${nameParts[1] || ""}`.trim();
      } else {
        firstNameWithPrefix = nameParts[0];
      }
    }

    const tonePrompt =
      customPrompt ||
      defaultTonePrompts[tone] ||
      `Write 2 LinkedIn comments in a "${tone}" tone.`;

    const toneGuideline = (
      customGuidelineRaw ||
      defaultToneGuidelines[tone] ||
      ""
    ).replace(/\$\{firstNameWithPrefix\}/g, firstNameWithPrefix);

    const prompt = `${tonePrompt}

Guidelines:
${toneGuideline}

Post:
"${postText}"`;

    const dmPrompt = `Write a short DM message I can send to ${firstNameWithPrefix} on LinkedIn in a "${tone}" tone. Be human, brief, and relevant to the post.

Post:
"${postText}"`;

    try {
      const [commentRes, dmRes] = await Promise.all([
        fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
          }),
        }),
        fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: dmPrompt }],
            temperature: 0.7,
          }),
        }),
      ]);

      const commentData = await commentRes.json();
      const dmData = await dmRes.json();

      const comments = (commentData.choices?.[0]?.message?.content || "")
        .split(/\n+/)
        .map((l) =>
          l
            .trim()
            .replace(/^["'\d\.\)\s-]+/, "")
            .replace(/["']$/, "")
        )
        .filter((l) => l.length > 10)
        .slice(0, 2);

      const dmSuggestion =
        dmData.choices?.[0]?.message?.content || "No DM suggestion found.";

      // Optional: flag fallback to "The author"
      if (
        comments.some(
          (c) => c.startsWith("The author") || c.includes("The author")
        )
      ) {
        console.warn(
          "⚠️ One or more comments used fallback 'The author'. Check prompt/guideline injection."
        );
      }

      showVibeModal(`${emoji} ${tone}`, comments, dmSuggestion);
    } catch (err) {
      console.error("❌ OpenAI error", err);
      alert("Failed to get suggestions. Check your key or try again.");
    }
  });
}

function showVibeModal(toneLabel, comments, dmSuggestion, isLoading = false) {
  const old = document.querySelector("#vibe-modal");
  if (old) old.remove();

  const currentTone = toneLabel.replace(/^.*?\s/, "");

  const modal = document.createElement("div");
  modal.id = "vibe-modal";

  modal.innerHTML = `
    <div class="vibe-modal-content" style="background:#fff;border:1px solid #ccc;padding:16px;width:420px;position:fixed;bottom:30px;right:30px;z-index:9999;box-shadow:0 2px 12px rgba(0,0,0,0.2);border-radius:8px;
    font-family:Arial, sans-serif;max-height:90vh;overflow-y:auto;box-sizing:border-box;">

      <div class="vibe-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <span id="tone-heading" style="font-weight:bold; font-size:16px;">${toneLabel}</span>
        <button id="vibe-close" style="border:none; background:none; font-size:18px; cursor:pointer;">✖</button>
      </div>

      <div style="margin-bottom:12px;">
        <label for="modalTone">🎯 Change Tone:</label>
        <select id="modalTone" style="width: 100%; padding: 4px; margin-top: 4px;">
          <option value="Smart Contrarian">Smart Contrarian</option>
          <option value="Agreement with Value">Agreement with Value</option>
          <option value="Ask a Question">Ask a Question</option>
          <option value="Friendly">Friendly</option>
          <option value="Celebratory">Celebratory</option>
          <option value="Constructive">Constructive</option>
        </select>
      </div>

      ${
        isLoading
          ? `<div style="text-align:center; padding:20px;">⏳ Generating suggestions...</div>`
          : `
        <div class="vibe-comments">
          ${comments
            .map(
              (c, i) => `
            <div class="vibe-comment" style="margin-bottom:14px;">
              <textarea readonly style="width:100%; padding:8px; border-radius:6px; border:1px solid #ccc; font-size:14px;">${c}</textarea>
              <button class="copy-btn" data-index="${i}" style="margin-top:6px; padding:4px 8px; border:none; border-radius:4px; background:#eee; cursor:pointer;">📋 Copy</button>
            </div>`
            )
            .join("")}
          <div class="vibe-dm" style="margin-top:20px; border-top:1px solid #ddd; padding-top:12px;">
            <div style="font-weight:bold; margin-bottom:6px;">💌 DM Suggestion</div>
            <textarea readonly style="width:100%; padding:8px; border-radius:6px; border:1px solid #ccc; font-size:14px;">${dmSuggestion}</textarea>
            <button id="copy-dm" style="margin-top:6px; padding:4px 8px; border:none; border-radius:4px; background:#eee; cursor:pointer;">📋 Copy DM</button>
          </div>
        </div>`
      }
    </div>
  `;

  document.body.appendChild(modal);

  const select = document.getElementById("modalTone");
  if (select) select.value = currentTone;

  const dragTarget = modal.querySelector(".vibe-modal-content");
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  dragTarget.addEventListener("mousedown", (e) => {
    const tag = e.target.tagName.toLowerCase();
    if (
      ["input", "select", "textarea", "button", "option", "label"].includes(tag)
    )
      return;
    isDragging = true;
    const rect = dragTarget.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    e.preventDefault();
    dragTarget.style.cursor = "grabbing";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    dragTarget.style.left = `${e.clientX - offsetX}px`;
    dragTarget.style.top = `${e.clientY - offsetY}px`;
    dragTarget.style.right = "auto";
    dragTarget.style.bottom = "auto";
    dragTarget.style.position = "fixed";
    dragTarget.style.transform = "none";
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    dragTarget.style.cursor = "default";
  });

  document.getElementById("vibe-close").onclick = () => modal.remove();

  if (!isLoading) {
    modal.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.onclick = () => {
        const i = btn.dataset.index;
        navigator.clipboard.writeText(comments[i]);
        btn.innerText = "✅ Copied!";
        setTimeout(() => (btn.innerText = "📋 Copy"), 1500);
      };
    });

    document.getElementById("copy-dm").onclick = () => {
      navigator.clipboard.writeText(dmSuggestion);
      const btn = document.getElementById("copy-dm");
      btn.innerText = "✅ Copied!";
      setTimeout(() => (btn.innerText = "📋 Copy DM"), 1500);
    };
  }

  document.getElementById("modalTone").onchange = (e) => {
    const newTone = e.target.value;
    const emojiMap = {
      "Smart Contrarian": "🤔",
      "Agreement with Value": "✅",
      "Ask a Question": "❓",
      Friendly: "💬",
      Celebratory: "🎉",
      Constructive: "🛠️",
    };

    chrome.storage.local.set({
      vibeTone: newTone,
      vibeEmoji: emojiMap[newTone] || "💬",
    });

    const postText = activePostElement?.innerText?.slice(0, 800) || "";

    chrome.storage.local.get(["vibeOpenAIKey"], (res) => {
      // Pass postEl as 5th argument so we can extract name correctly again
      fetchSuggestions(
        res.vibeOpenAIKey,
        newTone,
        emojiMap[newTone],
        postText,
        activePostElement
      );
    });
  };
}
