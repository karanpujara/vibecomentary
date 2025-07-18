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
          <button id="copyImprovedBtn" class="copy-btn" type="button">📋 Copy</button>
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

    // Debug: Verify copy buttons are properly set up
    this.verifyCopyButtons();

    // Ensure all copy buttons are properly initialized
    this.initializeCopyButtons();

    // Initialize improved comment functionality
    this.initializeImprovedComment();
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

    // Copy buttons - Unified event handling for all platforms
    this.modal.addEventListener("click", (e) => {
      console.log("🔍 Click event on:", e.target);
      console.log("🔍 Target classes:", e.target.classList.toString());
      console.log("🔍 Target ID:", e.target.id);

      // Handle comment copy buttons
      if (e.target.classList.contains("copy-btn")) {
        const index = e.target.dataset.index;
        const buttonId = e.target.id;

        console.log("📋 Copy button clicked:", {
          index,
          buttonId,
          element: e.target,
        });

        // Determine what type of copy button this is
        if (buttonId === "copy-dm") {
          console.log("📋 DM copy button clicked");
          this.copyDM();
        } else if (buttonId === "copyImprovedBtn") {
          console.log("📋 Improved copy button clicked");
          this.copyImprovedComment();
        } else if (index !== undefined) {
          console.log("📋 Comment copy button clicked, index:", index);
          this.copyToClipboard(index);
        } else {
          // Fallback: find the index by button position within comment sections only
          const commentButtons = this.modal.querySelectorAll(
            ".vibe-comment .copy-btn"
          );
          const buttonIndex = Array.from(commentButtons).indexOf(e.target);
          console.log(
            "📋 Using fallback index (comment buttons only):",
            buttonIndex
          );
          this.copyToClipboard(buttonIndex);
        }
        return;
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
              <div class="editable-content" data-index="${i}" id="comment-content-${i}" style="width:100%; padding:8px; border-radius:6px; border:1px solid #ccc; font-size:14px; color:#333; background-color:#ffffff; min-height:40px; line-height:1.4; margin-bottom:8px; cursor: text; user-select: text;">${c
                .replace(
                  /(Comment\s*\d+:|^\d+\.|First comment:|Second comment:)/gi,
                  ""
                )
                .replace(/\*\*Comment\s*\d+:\*\*/gi, "")
                .trim()}</div>
              <button class="copy-btn" data-index="${i}" id="copy-comment-${i}" type="button">📋 Copy</button>
            </div>`
            )
            .join("")}
        </div>
      </div>
    `;
  }

  renderDM(dmSuggestion) {
    return `
      <div class="dm-section">
        <div style="font-weight:bold; margin-bottom:6px;">💌 DM Suggestion</div>
        <div class="editable-content" id="dm-content">${
          dmSuggestion || "No DM suggestion available."
        }</div>
        <button id="copy-dm" class="copy-btn" type="button">📋 Copy</button>
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
    console.log("📋 Copying comment with index:", index, "type:", typeof index);

    // Convert index to number if it's a string
    const numericIndex = parseInt(index, 10);
    if (isNaN(numericIndex)) {
      console.error("❌ Invalid index:", index);
      return;
    }

    // Try multiple selectors to find the comment div
    let commentDiv = null;

    // Method 1: Try data-index selector
    commentDiv = this.modal.querySelectorAll(
      `.vibe-comment .editable-content[data-index="${numericIndex}"]`
    )[0];

    // Method 2: Try by position in vibe-comment containers (most reliable)
    if (!commentDiv) {
      const commentContainers = this.modal.querySelectorAll(".vibe-comment");
      console.log(
        `🔍 Found ${commentContainers.length} comment containers, looking for index ${numericIndex}`
      );
      if (commentContainers[numericIndex]) {
        commentDiv =
          commentContainers[numericIndex].querySelector(".editable-content");
        console.log(
          `✅ Found comment div in container ${numericIndex}:`,
          commentDiv
        );
      } else {
        console.error(`❌ Comment container ${numericIndex} not found`);
      }
    }

    // Method 3: Try by position in all editable-content elements within vibe-comment
    if (!commentDiv) {
      const allEditableContent = this.modal.querySelectorAll(
        ".vibe-comment .editable-content"
      );
      console.log(
        `🔍 Found ${allEditableContent.length} editable content elements, looking for index ${numericIndex}`
      );
      commentDiv = allEditableContent[numericIndex];
      if (commentDiv) {
        console.log(
          `✅ Found comment div at position ${numericIndex}:`,
          commentDiv
        );
      }
    }

    if (!commentDiv) {
      console.error("❌ Comment div not found for index:", numericIndex);
      console.log(
        "🔍 Available comment divs:",
        this.modal.querySelectorAll(".vibe-comment .editable-content").length
      );
      return;
    }

    const textToCopy = commentDiv.textContent.trim();
    console.log("📋 Text to copy:", textToCopy);

    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          console.log("✅ Text copied successfully");
          this.updateCopyButton(numericIndex, "✅ Copied!");
        })
        .catch((err) => {
          console.error("❌ Clipboard API failed:", err);
          this.fallbackCopy(textToCopy, numericIndex);
        });
    } else {
      console.log("⚠️ Clipboard API not available, using fallback");
      this.fallbackCopy(textToCopy, numericIndex);
    }
  }

  copyImprovedComment() {
    console.log("📋 Copying improved comment");

    // Try multiple selectors to find the improved comment text
    let textElement = this.modal.querySelector("#improvedCommentText");

    if (!textElement) {
      console.log("🔍 Trying alternative selectors for improved comment text");
      textElement = this.modal.querySelector("[id='improvedCommentText']");
    }

    if (!textElement) {
      console.log("🔍 Trying to find by class name");
      textElement = this.modal.querySelector(
        "#improvedCommentBox .editable-content"
      );
    }

    if (!textElement) {
      console.log(
        "🔍 Trying to find any editable content in improved comment box"
      );
      const improvedBox = this.modal.querySelector("#improvedCommentBox");
      if (improvedBox) {
        textElement = improvedBox.querySelector(".editable-content");
      }
    }

    if (!textElement) {
      console.error("❌ Improved comment text element not found");
      console.log("🔍 Available elements in modal:", {
        improvedCommentBox: this.modal.querySelector("#improvedCommentBox"),
        improvedCommentText: this.modal.querySelector("#improvedCommentText"),
        allEditableContent: this.modal.querySelectorAll(".editable-content"),
        allDivs: this.modal.querySelectorAll("div[id*='improved']"),
      });
      return;
    }

    const textToCopy = textElement.textContent.trim();
    console.log("📋 Improved text to copy:", textToCopy);

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          console.log("✅ Improved text copied successfully");
          this.updateCopyButtonById("copyImprovedBtn", "✅ Copied!");
        })
        .catch((err) => {
          console.error("❌ Clipboard API failed for improved comment:", err);
          this.fallbackCopy(textToCopy, null, "copyImprovedBtn");
        });
    } else {
      this.fallbackCopy(textToCopy, null, "copyImprovedBtn");
    }
  }

  copyDM() {
    console.log("📋 Copying DM");

    const dmDiv = this.modal.querySelector("#dm-content");
    console.log("🔍 DM div found:", dmDiv);
    if (!dmDiv) {
      console.error("❌ DM content element not found");
      // Try alternative selectors
      const alternativeDmDiv = this.modal.querySelector("[id='dm-content']");
      console.log("🔍 Alternative DM div found:", alternativeDmDiv);
      if (alternativeDmDiv) {
        console.log("✅ Found DM div with alternative selector");
        const textToCopy = alternativeDmDiv.textContent.trim();
        console.log("📋 DM text to copy:", textToCopy);
        this.copyDMContent(textToCopy);
        return;
      }
      return;
    }

    const textToCopy = dmDiv.textContent.trim();
    console.log("📋 DM text to copy:", textToCopy);
    this.copyDMContent(textToCopy);
  }

  // Helper method to copy DM content
  copyDMContent(textToCopy) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          console.log("✅ DM copied successfully");
          this.updateCopyButtonById("copy-dm", "✅ Copied!");
        })
        .catch((err) => {
          console.error("❌ Clipboard API failed for DM:", err);
          this.fallbackCopy(textToCopy, null, "copy-dm");
        });
    } else {
      this.fallbackCopy(textToCopy, null, "copy-dm");
    }
  }

  // Helper method to update copy button text
  updateCopyButton(index, newText) {
    console.log("📋 Updating copy button at index:", index);

    // Try multiple methods to find the button
    let btn = null;

    // Method 1: Try by data-index attribute (most reliable)
    btn = this.modal.querySelector(`.copy-btn[data-index="${index}"]`);
    if (btn) {
      console.log(`✅ Found button by data-index ${index}:`, btn);
    }

    // Method 2: Try by position in vibe-comment containers only
    if (!btn) {
      const commentContainers = this.modal.querySelectorAll(".vibe-comment");
      console.log(
        `🔍 Found ${commentContainers.length} comment containers, looking for button at index ${index}`
      );
      if (commentContainers[index]) {
        btn = commentContainers[index].querySelector(".copy-btn");
        console.log(`✅ Found button in container ${index}:`, btn);
      } else {
        console.error(`❌ Comment container ${index} not found`);
      }
    }

    // Method 3: Try by position in comment copy buttons only (fallback)
    if (!btn) {
      const commentButtons = this.modal.querySelectorAll(
        ".vibe-comment .copy-btn"
      );
      console.log(
        `🔍 Found ${commentButtons.length} comment copy buttons, looking for index ${index}`
      );
      btn = commentButtons[index];
      if (btn) {
        console.log(`✅ Found button at position ${index}:`, btn);
      }
    }

    if (btn) {
      console.log("✅ Found button to update:", btn);
      btn.innerText = newText;
      setTimeout(() => (btn.innerText = "📋 Copy"), 1500);
    } else {
      console.error("❌ Could not find copy button for index:", index);
    }
  }

  // Helper method to update copy button by ID
  updateCopyButtonById(buttonId, newText) {
    console.log(`📋 Updating copy button by ID: ${buttonId}`);
    const btn = this.modal.querySelector(`#${buttonId}`);
    if (btn) {
      console.log(`✅ Found button with ID ${buttonId}:`, btn);
      btn.innerText = newText;
      setTimeout(() => (btn.innerText = "📋 Copy"), 1500);
    } else {
      console.error(`❌ Could not find button with ID: ${buttonId}`);
      // Try alternative selectors
      const alternativeBtn = this.modal.querySelector(`[id="${buttonId}"]`);
      if (alternativeBtn) {
        console.log(
          `✅ Found button with alternative selector:`,
          alternativeBtn
        );
        alternativeBtn.innerText = newText;
        setTimeout(() => (alternativeBtn.innerText = "📋 Copy"), 1500);
      } else {
        console.error(
          `❌ Button not found with any selector for ID: ${buttonId}`
        );
      }
    }
  }

  // Fallback copy method for older browsers
  fallbackCopy(text, index = null, buttonId = null) {
    console.log("📋 Using fallback copy method");

    // Create temporary textarea
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "-9999px";
    document.body.appendChild(textarea);

    try {
      textarea.select();
      textarea.setSelectionRange(0, 99999); // For mobile devices
      const successful = document.execCommand("copy");

      if (successful) {
        console.log("✅ Fallback copy successful");
        if (index !== null) {
          this.updateCopyButton(index, "✅ Copied!");
        } else if (buttonId) {
          this.updateCopyButtonById(buttonId, "✅ Copied!");
        }
      } else {
        console.error("❌ Fallback copy failed");
        alert("Copy failed. Please select and copy the text manually.");
      }
    } catch (err) {
      console.error("❌ Fallback copy error:", err);
      alert("Copy failed. Please select and copy the text manually.");
    } finally {
      document.body.removeChild(textarea);
    }
  }

  // Debug method to verify copy buttons are properly set up
  verifyCopyButtons() {
    console.log("🔍 Verifying copy buttons setup...");

    // Check comment copy buttons
    const commentButtons = this.modal.querySelectorAll(".copy-btn");
    console.log(`📋 Found ${commentButtons.length} copy buttons`);

    commentButtons.forEach((btn, index) => {
      console.log(`📋 Button ${index}:`, {
        classList: btn.classList.toString(),
        id: btn.id,
        dataIndex: btn.dataset.index,
        textContent: btn.textContent,
        style: btn.style.cssText,
      });
    });

    // Check specific buttons
    const dmButton = this.modal.querySelector("#copy-dm");
    const improvedButton = this.modal.querySelector("#copyImprovedBtn");

    console.log("📋 DM button:", dmButton ? "Found" : "Not found");
    console.log("📋 Improved button:", improvedButton ? "Found" : "Not found");

    // Check if buttons are clickable
    commentButtons.forEach((btn, index) => {
      const rect = btn.getBoundingClientRect();
      console.log(`📋 Button ${index} position:`, {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        visible: rect.width > 0 && rect.height > 0,
      });
    });
  }

  // Initialize all copy buttons with proper attributes
  initializeCopyButtons() {
    console.log("🔧 Initializing copy buttons...");

    // Get comment copy buttons only
    const commentButtons = this.modal.querySelectorAll(
      ".vibe-comment .copy-btn"
    );
    const dmButton = this.modal.querySelector("#copy-dm");
    const improvedButton = this.modal.querySelector("#copyImprovedBtn");

    // Initialize comment buttons with proper indices
    commentButtons.forEach((btn, index) => {
      // Ensure button has proper attributes
      if (!btn.id) {
        btn.id = `copy-comment-${index}`;
      }

      // Set data-index to match the comment index
      btn.dataset.index = index.toString();

      // Ensure button is clickable
      btn.style.pointerEvents = "auto";
      btn.style.cursor = "pointer";
      btn.style.userSelect = "none";

      console.log(`🔧 Initialized comment button ${index}:`, {
        id: btn.id,
        dataIndex: btn.dataset.index,
        classList: btn.classList.toString(),
      });
    });

    // Verify button-to-content mapping
    this.verifyButtonContentMapping();

    console.log(`🔧 Initialized ${commentButtons.length} comment copy buttons`);
    console.log(`🔧 DM button:`, dmButton ? "Found" : "Not found");
    console.log(`🔧 Improved button:`, improvedButton ? "Found" : "Not found");
  }

  // Initialize improved comment functionality
  initializeImprovedComment() {
    console.log("🔧 Initializing improved comment functionality...");

    const improvedBox = this.modal.querySelector("#improvedCommentBox");
    const improvedText = this.modal.querySelector("#improvedCommentText");
    const copyButton = this.modal.querySelector("#copyImprovedBtn");

    console.log("🔧 Improved comment elements:", {
      improvedBox: improvedBox ? "Found" : "Not found",
      improvedText: improvedText ? "Found" : "Not found",
      copyButton: copyButton ? "Found" : "Not found",
    });

    if (copyButton) {
      // Ensure the copy button is properly set up
      copyButton.style.pointerEvents = "auto";
      copyButton.style.cursor = "pointer";
      copyButton.style.userSelect = "none";
      console.log("🔧 Improved comment copy button initialized");
    }

    if (improvedText) {
      // Ensure the text element is properly set up
      improvedText.style.userSelect = "text";
      improvedText.style.cursor = "text";
      console.log("🔧 Improved comment text element initialized");
    }
  }

  // Verify that button indices match content indices
  verifyButtonContentMapping() {
    console.log("🔍 Verifying button-to-content mapping...");

    const commentContainers = this.modal.querySelectorAll(".vibe-comment");
    const commentButtons = this.modal.querySelectorAll(
      ".vibe-comment .copy-btn"
    );

    console.log(
      `🔍 Found ${commentContainers.length} comment containers and ${commentButtons.length} comment buttons`
    );

    commentContainers.forEach((container, index) => {
      const content = container.querySelector(".editable-content");
      const button = container.querySelector(".copy-btn");

      console.log(`🔍 Container ${index}:`, {
        hasContent: !!content,
        contentDataIndex: content?.dataset.index,
        hasButton: !!button,
        buttonDataIndex: button?.dataset.index,
        buttonId: button?.id,
        contentText: content?.textContent?.slice(0, 50) + "...",
      });

      // Verify data-index matches
      if (content && button) {
        const contentIndex = content.dataset.index;
        const buttonIndex = button.dataset.index;

        if (contentIndex !== buttonIndex) {
          console.warn(
            `⚠️ Index mismatch in container ${index}: content=${contentIndex}, button=${buttonIndex}`
          );
        } else {
          console.log(`✅ Container ${index}: indices match (${contentIndex})`);
        }
      }
    });
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
