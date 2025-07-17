class ModalManager {
  constructor() {
    this.modal = null;
    this.isVisible = false;
  }

  getFallbackHTML() {
    return `
      <div id="vibe-modal">
        <div class="vibe-modal-content">
          <div class="vibe-header">
            <span id="tone-heading">Loading...</span>
            <button id="vibe-close">✖</button>
          </div>
          <div id="content">Loading...</div>
        </div>
      </div>
    `;
  }

  createModal() {
    const modal = document.createElement("div");
    modal.id = "vibe-modal";

    modal.innerHTML = `
      <div class="vibe-modal-content">

        <div class="vibe-header">
          <span id="tone-heading"></span>
          <button id="vibe-close">✖</button>
        </div>

        <!-- ✍️ Improve Your Own Comment -->
        <div class="improve-section">
          <label>✍️ Write your thoughts (optional)</label>
          <textarea id="manualCommentInput" placeholder="Type your comment here..." style="resize: none; overflow: hidden; min-height: 40px;"></textarea>
          <div style="text-align: right;">
            <button id="improveCommentBtn">✨ Improve</button>
          </div>
          <div id="improveLoader" style="display: none; text-align: center; padding: 10px; font-size: 14px; color: #333; font-weight: 500;">
            <span>⏳ Hold on! Improving<span class="dots">...</span></span>
          </div>
        </div>

        <!-- Improved Comment Output -->
        <div id="improvedCommentBox" style="display:none;">
          <strong>✅ Improved Version:</strong>
          <div class="editable-content" id="improvedCommentText" style="width:100%; padding:8px; border-radius:6px; border:1px solid #ccc; font-size:14px; color:#333; background-color:#ffffff; min-height:40px; line-height:1.4; margin:8px 0; cursor: text; user-select: text;"></div>
          <button id="copyImprovedBtn">📋 Copy</button>
        </div>

        <!-- 🎯 Change Tone -->
        <div class="tone-section">
          <label for="modalTone">🎯 Change Tone:</label>
          <select id="modalTone">
            <option value="Smart Contrarian">🤔 Smart Contrarian</option>
            <option value="Agreement with Value">✅ Agreement with Value</option>
            <option value="Ask a Question">❓ Ask a Question</option>
            <option value="Friendly">💬 Friendly</option>
            <option value="Celebratory">🎉 Celebratory</option>
            <option value="Constructive">🛠️ Constructive</option>
            <option value="Offer Help">🤝 Offer Help</option>
            <option value="Contribution">📚 Contribution</option>
            <option value="Disagreement - Contrary">⚡ Disagreement - Contrary</option>
            <option value="Criticism">🧐 Criticism</option>
            <option value="Funny Sarcastic">😏 Funny Sarcastic</option>
            <option value="Perspective (Why / What / How)">🔍 Perspective (Why / What / How)</option>
            <option value="Professional Industry Specific">🏢 Professional Industry Specific</option>
          </select>
        </div>

        <!-- Content Area -->
        <div id="modal-content"></div>
      </div>
    `;

    return modal;
  }

  async show(
    toneLabel,
    comments,
    dmSuggestion,
    isLoading = false,
    platformName = null
  ) {
    // Remove existing modal
    this.hide();

    // Create new modal
    this.modal = this.createModal();
    document.body.appendChild(this.modal);

    // Set tone heading
    const toneHeading = this.modal.querySelector("#tone-heading");
    if (toneHeading) {
      toneHeading.textContent = toneLabel || "💬 Friendly";
    }

    // Set current tone in dropdown
    const toneSelect = this.modal.querySelector("#modalTone");
    if (toneSelect) {
      const currentTone = toneLabel?.replace(/^.*?\s/, "") || "Friendly";
      toneSelect.value = currentTone;
    }

    // Render content
    const contentArea = this.modal.querySelector("#modal-content");
    if (contentArea) {
      if (isLoading) {
        contentArea.innerHTML = `<div style="text-align:center; padding:20px; font-size: 16px; color: #333; font-weight: 500;">⏳ Generating suggestions...</div>`;
      } else {
        const commentsHTML = this.renderComments(comments, platformName);
        const dmHTML = this.renderDM(dmSuggestion);
        contentArea.innerHTML = commentsHTML + dmHTML;
        console.log("Modal content rendered:", {
          comments: comments.length,
          dmSuggestion: !!dmSuggestion,
          platformName: platformName,
        });
      }
    }

    // Setup event listeners
    this.setupEventListeners();

    // Setup drag functionality
    this.setupDrag();
  }

  hide() {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
  }

  setupEventListeners() {
    if (!this.modal) return;

    // Close button
    const closeBtn = this.modal.querySelector("#vibe-close");
    if (closeBtn) {
      closeBtn.onclick = () => this.hide();
    }

    // Tone change
    const toneSelect = this.modal.querySelector("#modalTone");
    if (toneSelect && this.toneChangeCallback) {
      toneSelect.onchange = (e) => this.toneChangeCallback(e.target.value);
    }

    // Manual comment input auto-resize
    const manualInput = this.modal.querySelector("#manualCommentInput");
    if (manualInput) {
      this.autoResizeTextarea(manualInput);
      manualInput.addEventListener("input", () => {
        this.autoResizeTextarea(manualInput);
      });
    }

    // Improve button
    const improveBtn = this.modal.querySelector("#improveCommentBtn");
    if (improveBtn && this.improveCallback) {
      improveBtn.onclick = () => {
        const manualText = this.modal
          .querySelector("#manualCommentInput")
          .value.trim();
        if (!manualText) {
          alert("✍️ Please write something first.");
          return;
        }
        this.showImproveLoader();
        this.improveCallback(manualText);
      };
    }

    // Copy buttons
    this.modal.addEventListener("click", (e) => {
      if (e.target.classList.contains("copy-btn")) {
        this.copyToClipboard(e.target.dataset.index);
      }
      if (e.target.id === "copyImprovedBtn") {
        this.copyImprovedComment();
      }
      if (e.target.id === "copy-dm") {
        this.copyDM();
      }
    });

    // Handle click-to-edit functionality for editable content
    this.modal.addEventListener("click", (e) => {
      if (e.target.classList.contains("editable-content")) {
        this.convertToTextarea(e.target);
      }
    });
  }

  setupDrag() {
    if (!this.modal) return;

    const dragTarget = this.modal.querySelector(".vibe-modal-content");
    if (!dragTarget) return;

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    dragTarget.addEventListener("mousedown", (e) => {
      const tag = e.target.tagName.toLowerCase();
      if (
        ["input", "select", "textarea", "button", "option", "label"].includes(
          tag
        )
      )
        return;

      // Don't start dragging if clicking on editable content areas
      if (e.target.classList.contains("editable-content")) {
        return;
      }

      isDragging = true;
      const rect = dragTarget.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      e.preventDefault();
      dragTarget.style.cursor = "grabbing";

      // Add dragging class to prevent blue borders
      if (this.modal && this.modal.classList) {
        this.modal.classList.add("dragging");
      }
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging || !this.modal) return;

      // Calculate new position
      const newX = e.clientX - offsetX;
      const newY = e.clientY - offsetY;

      // Ensure modal stays within viewport bounds with proper margins
      const modalWidth = this.modal.offsetWidth;
      const modalHeight = this.modal.offsetHeight;
      const maxX = window.innerWidth - modalWidth - 20; // 20px margin
      const maxY = window.innerHeight - modalHeight - 20; // 20px margin

      const boundedX = Math.max(20, Math.min(newX, maxX));
      const boundedY = Math.max(20, Math.min(newY, maxY));

      // Ensure the modal can be dragged to the top of the viewport
      // Allow dragging up to 20px from the top, not just 20px from the bottom
      const minY = 20;
      const boundedYWithTop = Math.max(minY, Math.min(newY, maxY));

      // Debug logging for drag positioning
      console.log("🖱️ Drag Debug:", {
        newX,
        newY,
        boundedX,
        boundedY,
        modalWidth,
        modalHeight,
        maxX,
        maxY,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      });

      // Apply position to the entire modal container with !important to override platform CSS
      this.modal.style.setProperty("left", `${boundedX}px`, "important");
      this.modal.style.setProperty("top", `${boundedYWithTop}px`, "important");
      this.modal.style.setProperty("right", "auto", "important");
      this.modal.style.setProperty("bottom", "auto", "important");
      this.modal.style.setProperty("position", "fixed", "important");
      this.modal.style.setProperty("transform", "none", "important");
      this.modal.style.setProperty("z-index", "999999", "important");

      // Reset the inner content positioning and prevent overflow
      dragTarget.style.position = "relative";
      dragTarget.style.left = "auto";
      dragTarget.style.top = "auto";
      dragTarget.style.right = "auto";
      dragTarget.style.bottom = "auto";
      dragTarget.style.transform = "none";
      dragTarget.style.overflow = "hidden";
      dragTarget.style.maxWidth = "100%";
      dragTarget.style.boxSizing = "border-box";
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
      if (dragTarget) {
        dragTarget.style.cursor = "default";
      }

      // Remove dragging class to restore normal styling
      if (this.modal && this.modal.classList) {
        this.modal.classList.remove("dragging");
      }
    });
  }

  renderComments(comments, platformName = null) {
    // Get platform-specific labels
    let commentLabel = "Comment";

    // Use "Comment Insights" for all platforms to match LinkedIn
    commentLabel = "Comment";

    return `
      <div class="vibe-comments">
        <div id="comments-section">
          <div style="font-weight:bold; margin-bottom:6px; color: #333;">💡 ${commentLabel} Insights</div>
          ${comments
            .map(
              (c, i) => `
            <div class="vibe-comment" style="margin-bottom:14px;">
              <div class="editable-content" data-index="${i}" style="width:100%; padding:8px; border-radius:6px; border:1px solid #ccc; font-size:14px; color:#333; background-color:#ffffff; min-height:40px; line-height:1.4; margin-bottom:8px; cursor: text; user-select: text;">${c
                .replace(
                  /(Comment\s*\d+:|^\d+\.|First comment:|Second comment:)/gi,
                  ""
                )
                .replace(/\*\*Comment\s*\d+:\*\*/gi, "")
                .trim()}</div>
              <button class="copy-btn" data-index="${i}">📋 Copy</button>
            </div>`
            )
            .join("")}
        </div>
      </div>
    `;
  }

  renderDM(dmSuggestion) {
    return `
      <div class="dm-section" style="margin-top:20px; border-top:1px solid #ddd; padding-top:12px;">
        <div style="font-weight:bold; margin-bottom:6px;">💌 DM Suggestion</div>
        <div class="editable-content" id="dm-content" style="width:100%; padding:8px; border-radius:6px; border:1px solid #ccc; font-size:14px; color:#333; background-color:#ffffff; min-height:40px; line-height:1.4; margin-bottom:8px; cursor: text; user-select: text;">${
          dmSuggestion || "No DM suggestion available."
        }</div>
        <button id="copy-dm" class="copy-btn">📋 Copy</button>
      </div>
    `;
  }

  // Event handlers (to be implemented by main script)
  onToneChange(newTone) {
    // This will be set by the main script
    if (this.toneChangeCallback) {
      this.toneChangeCallback(newTone);
    }
  }

  copyToClipboard(index) {
    const commentDiv = this.modal.querySelectorAll(
      `.vibe-comment .editable-content[data-index="${index}"]`
    )[0];
    if (commentDiv) {
      navigator.clipboard.writeText(commentDiv.textContent);
      const btn = this.modal.querySelectorAll(".copy-btn")[index];
      btn.innerText = "✅ Copied!";
      setTimeout(() => (btn.innerText = "📋 Copy"), 1500);
    }
  }

  copyImprovedComment() {
    const text = this.modal.querySelector("#improvedCommentText").textContent;
    if (text) {
      navigator.clipboard.writeText(text);
      const btn = this.modal.querySelector("#copyImprovedBtn");
      if (btn) {
        btn.innerText = "✅ Copied!";
        setTimeout(() => (btn.innerText = "📋 Copy"), 1500);
      }
    }
  }

  copyDM() {
    const dmDiv = this.modal.querySelector("#dm-content");
    if (dmDiv) {
      navigator.clipboard.writeText(dmDiv.textContent);
      const btn = this.modal.querySelector("#copy-dm");
      if (btn) {
        btn.innerText = "✅ Copied!";
        setTimeout(() => (btn.innerText = "📋 Copy"), 1500);
      }
    }
  }

  /**
   * Show improve loader with dot animation
   */
  showImproveLoader() {
    const improveBtn = this.modal.querySelector("#improveCommentBtn");
    const loader = this.modal.querySelector("#improveLoader");

    if (improveBtn) {
      improveBtn.disabled = true;
      improveBtn.style.display = "none";
    }

    if (loader) {
      loader.style.display = "block";
      this.startDotAnimation();
    }
  }

  /**
   * Hide improve loader
   */
  hideImproveLoader() {
    const improveBtn = this.modal.querySelector("#improveCommentBtn");
    const loader = this.modal.querySelector("#improveLoader");

    if (improveBtn) {
      improveBtn.disabled = false;
      improveBtn.style.display = "inline-block";
    }

    if (loader) {
      loader.style.display = "none";
      this.stopDotAnimation();
    }
  }

  /**
   * Start dot animation
   */
  startDotAnimation() {
    const dotsElement = this.modal.querySelector(".dots");
    if (dotsElement) {
      let dots = "";
      this.dotInterval = setInterval(() => {
        dots = dots.length >= 3 ? "" : dots + ".";
        dotsElement.textContent = dots;
      }, 500);
    }
  }

  /**
   * Stop dot animation
   */
  stopDotAnimation() {
    if (this.dotInterval) {
      clearInterval(this.dotInterval);
      this.dotInterval = null;
    }
  }

  /**
   * Auto-resize textarea to fit content
   */
  autoResizeTextarea(textarea) {
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto";

    // Set height to scrollHeight to fit content
    textarea.style.height = textarea.scrollHeight + "px";

    // Ensure minimum height
    const minHeight = 40;
    if (textarea.scrollHeight < minHeight) {
      textarea.style.height = minHeight + "px";
    }
  }

  /**
   * Convert editable content div to textarea for editing
   */
  convertToTextarea(element) {
    // Don't convert if it's already a textarea
    if (element.tagName.toLowerCase() === "textarea") {
      return;
    }

    const originalText = element.textContent;
    const originalStyles = element.getAttribute("style");

    // Create textarea with same styling
    const textarea = document.createElement("textarea");
    textarea.value = originalText;
    textarea.className = "editable-content";
    textarea.setAttribute("style", originalStyles);
    textarea.style.resize = "none";
    textarea.style.fontFamily = "inherit";
    textarea.style.overflow = "hidden";

    // Replace the div with textarea
    element.parentNode.replaceChild(textarea, element);

    // Auto-resize functionality
    this.autoResizeTextarea(textarea);

    // Focus and select all text
    textarea.focus();
    textarea.select();

    // Handle blur event to convert back to div
    textarea.addEventListener("blur", () => {
      this.convertToDiv(textarea, originalStyles);
    });

    // Handle Enter key to convert back to div
    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.convertToDiv(textarea, originalStyles);
      }
    });

    // Auto-resize on input
    textarea.addEventListener("input", () => {
      this.autoResizeTextarea(textarea);
    });
  }

  /**
   * Convert textarea back to div
   */
  convertToDiv(textarea, originalStyles) {
    const text = textarea.value;
    const div = document.createElement("div");
    div.className = "editable-content";
    div.setAttribute("style", originalStyles);
    div.textContent = text;

    // Preserve data attributes
    if (textarea.dataset.index) {
      div.dataset.index = textarea.dataset.index;
    }
    if (textarea.id) {
      div.id = textarea.id;
    }

    textarea.parentNode.replaceChild(div, textarea);
  }

  async improveComment() {
    const input = this.modal.querySelector("#manualCommentInput");
    const loader = this.modal.querySelector("#improveLoader");
    const improveBtn = this.modal.querySelector("#improveCommentBtn");

    if (!input.value.trim()) {
      alert("Please enter a comment to improve");
      return;
    }

    loader.style.display = "block";
    improveBtn.disabled = true;

    try {
      // This will be implemented by the main script
      if (this.improveCallback) {
        await this.improveCallback(input.value);
      }
    } catch (error) {
      alert("Failed to improve comment. Please try again.");
    } finally {
      loader.style.display = "none";
      improveBtn.disabled = false;
    }
  }
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = ModalManager;
}
