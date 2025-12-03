(function () {
  const panel = document.getElementById("aiChatPanel");
  const toggleBtn = document.getElementById("aiChatToggle");
  const closeBtn = document.getElementById("aiChatClose");
  const input = document.getElementById("aiChatInput");
  const sendBtn = document.getElementById("aiChatSend");
  const messagesBox = document.getElementById("aiChatMessages");

  if (!panel || !toggleBtn || !input || !sendBtn || !messagesBox) return;

  const DESIGN_API = "/api/ai-designer";
  const IMAGE_API = "/api/ai-image";
  let history = [];

  // === UI ===
  function openChat() {
    panel.classList.add("ai-fullscreen");
    input.focus();
  }

  function closeChat() {
    panel.classList.remove("ai-fullscreen");
  }

  toggleBtn.addEventListener("click", openChat);
  closeBtn.addEventListener("click", closeChat);

  // === Helpers ===
  function addMessage(role, text) {
    const msg = document.createElement("div");
    msg.className = `ai-msg ai-${role}`;
    msg.textContent = text;
    messagesBox.appendChild(msg);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  function addImage(url, caption) {
    const wrapper = document.createElement("div");
    wrapper.className = "ai-msg ai-assistant";

    const img = document.createElement("img");
    img.src = url;
    img.alt = "Визуализация дизайна";
    img.className = "ai-image";

    const text = document.createElement("div");
    text.className = "ai-caption";
    text.textContent = caption || "Визуализация по вашему описанию.";

    wrapper.appendChild(img);
    wrapper.appendChild(text);
    messagesBox.appendChild(wrapper);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  function isDesignRequest(text) {
    const words = [
      "дизайн",
      "визуал",
      "визуализация",
      "покажи",
      "сделай проект",
      "реалистичный",
      "вариант",
      "3d",
      "интерьер",
      "оформи"
    ];
    return words.some((w) => text.toLowerCase().includes(w));
  }

  // === Main Logic ===
  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessage("user", text);
    history.push({ role: "user", content: text });
    input.value = "";
    sendBtn.disabled = true;

    try {
      const wantsDesign = isDesignRequest(text);

      if (wantsDesign) {
        addMessage("assistant", "Создаю визуализацию...");
        const imgRes = await fetch(IMAGE_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: text }),
        });
        const imgData = await imgRes.json();

        if (imgData?.url) {
          addImage(imgData.url, "Вот визуализация по вашему описанию.");
        } else {
          addMessage(
            "assistant",
            "Не удалось создать изображение. Попробуйте уточнить запрос."
          );
        }
        sendBtn.disabled = false;
        return;
      }

      const res = await fetch(DESIGN_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      const data = await res.json();
      const reply = data?.reply || data?.text || data?.answer;

      addMessage("assistant", reply || "Готово. Хотите визуализацию?");
      history.push({ role: "assistant", content: reply });
    } catch (err) {
      console.error(err);
      addMessage(
        "assistant",
        "Сервис временно недоступен. Попробуйте позже или оставьте заявку."
      );
    } finally {
      sendBtn.disabled = false;
    }
  }

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });
})();
