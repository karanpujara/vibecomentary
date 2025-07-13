console.log("✅ VibeCommentary contentScript loaded");

// Inject test button to confirm script is running
const testBtn = document.createElement("button");

chrome.storage.local.get("vibeOpenAIKey", (result) => {
  console.log("✅ API Key from chrome.storage:", result.vibeOpenAIKey);
});
testBtn.innerText = "Test Inject";
testBtn.style.cssText = `
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 9999;
  background-color: green;
  color: white;
  border: none;
  padding: 10px;
  font-size: 14px;
`;
document.body.appendChild(testBtn);

function injectButtonUnderPost() {
  const posts = document.querySelectorAll("div.feed-shared-update-v2");

  posts.forEach((post) => {
    if (post.querySelector(".vibe-btn")) return;

    const commentButton = post.querySelector('button[aria-label*="Comment"]');
    if (!commentButton) {
      console.log("❌ No suitable comment button found for a post");
      return;
    }

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
      const tone = localStorage.getItem("vibeTone") || "Friendly";
      const emoji = localStorage.getItem("vibeEmoji") || "💬";
      const postText = post.innerText.slice(0, 800);
      const prompt = `Write 2 LinkedIn comments in a ${tone} tone (don't repeat the post), for this post:\n\n"${postText}"`;

      chrome.storage.local.get("vibeOpenAIKey", async (result) => {
        const apiKey = result.vibeOpenAIKey;
        if (!apiKey) {
          alert("⚠️ Please set your OpenAI API key in the extension popup.");
          return;
        }

        console.log("✅ Retrieved API Key in content script:", apiKey);

        try {
          const res = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
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
            }
          );

          const data = await res.json();
          const text = data.choices?.[0]?.message?.content || "";
          const comments = text
            .split(/\n+/)
            .map((l) => l.trim())
            .filter((l) => l.length > 10)
            .slice(0, 2);

          showVibeModal(`${emoji} ${tone}`, comments);
        } catch (err) {
          console.error("❌ OpenAI error", err);
          alert("Failed to get suggestions. Check your key or try again.");
        }
      });
    });

    commentButton.parentElement?.appendChild(btn);
  });
}

setInterval(injectButtonUnderPost, 2000);

function showVibeModal(toneLabel, comments) {
  const old = document.querySelector("#vibe-modal");
  if (old) old.remove();

  const modal = document.createElement("div");
  modal.id = "vibe-modal";
  modal.innerHTML = `
    <div class="vibe-modal-content" style="background:#fff; border:1px solid #ccc; padding:16px; max-width:400px; position:fixed; top:100px; left:50%; transform:translateX(-50%); z-index:9999; box-shadow:0 2px 10px rgba(0,0,0,0.2); border-radius:8px;">
      <div class="vibe-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <span style="font-weight:bold;">${toneLabel}</span>
        <button id="vibe-close" style="border:none; background:none; font-size:16px;">✖</button>
      </div>
      <div class="vibe-comments">
        ${comments
          .map(
            (c, i) => `
          <div class="vibe-comment" style="margin-bottom:10px;">
            <textarea readonly style="width:100%; padding:6px; border-radius:4px; border:1px solid #ccc;">${c}</textarea>
            <button class="copy-btn" data-index="${i}" style="margin-top:4px;">📋 Copy</button>
          </div>`
          )
          .join("")}
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById("vibe-close").onclick = () => modal.remove();
  modal.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.onclick = () => {
      const i = btn.dataset.index;
      navigator.clipboard.writeText(comments[i]);
      btn.innerText = "✅ Copied!";
      setTimeout(() => (btn.innerText = "📋 Copy"), 1500);
    };
  });
}
