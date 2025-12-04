// src/ai-chat.js 
// Клиентский скрипт для AI-дизайнера Madera Design

(function () {
  const toggleBtn = document.getElementById("aiChatToggle");
  const panel = document.getElementById("aiChatPanel");
  const closeBtn = document.getElementById("aiChatClose");
  const input = document.getElementById("aiChatInput");
  const sendBtn = document.getElementById("aiChatSend");
  const messagesBox = document.getElementById("aiChatMessages");

  if (!toggleBtn || !panel || !input || !sendBtn || !messagesBox) {
    return;
  }

  // Используем новый бекенд эндпоинт
  const API_URL = "/api/ai-designer";

  const history = [];

  function openChat() {
    panel.classList.add("ai-chat-panel--open");
    panel.setAttribute("aria-hidden", "false");
    input.focus();
  }

  function closeChat() {
    panel.classList.remove("ai-chat-panel--open");
    panel.setAttribute("aria-hidden", "true");
  }

  function appendMessage(role, text) {
    const msgEl = document.createElement("div");
    msgEl.className =
      "ai-chat-msg " + (role === "user" ? "ai-chat-msg--user" : "ai-chat-msg--bot");
    const textEl = document.createElement("div");
    textEl.className = "ai-chat-msg__text";
    textEl.textContent = text;
    msgEl.appendChild(textEl);
    messagesBox.appendChild(msgEl);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  async function sendMessage() {
    const text = (input.value || "").trim();
    if (!text) return;

    appendMessage("user", text);
    history.push({ role: "user", content: text });
    input.value = "";
    input.focus();
    sendBtn.disabled = true;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      if (!res.ok) throw new Error("Bad response: " + res.status);

      const data = await res.json();
      const answer = data?.reply || data?.answer || data?.message;

      const botText =
        typeof answer === "string" && answer.trim()
          ? answer.trim()
          : "Извините, сейчас сервис временно недоступен. Попробуйте позже.";

      appendMessage("assistant", botText);
      history.push({ role: "assistant", content: botText });
    } catch (e) {
      console.error(e);
      appendMessage(
        "assistant",
        "Извините, не удалось получить ответ. Попробуйте снова чуть позже."
      );
    } finally {
      sendBtn.disabled = false;
    }
  }

  toggleBtn.addEventListener("click", () => {
    const isOpen = panel.classList.contains("ai-chat-panel--open");
    if (isOpen) closeChat();
    else openChat();
  });

  closeBtn.addEventListener("click", closeChat);
  sendBtn.addEventListener("click", sendMessage);

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  });

  // Свайп вверх для открытия на мобильных
  let startY = null;
  window.addEventListener(
    "touchstart",
    (e) => (startY = e.touches[0].clientY),
    { passive: true }
  );
  window.addEventListener(
    "touchend",
    (e) => {
      if (startY == null) return;
      const deltaY = startY - e.changedTouches[0].clientY;
      if (deltaY > 60 && startY > window.innerHeight - 140) openChat();
      startY = null;
    },
    { passive: true }
  );
})();
