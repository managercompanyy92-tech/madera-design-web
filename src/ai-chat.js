// src/ai-chat.js
// Клиентский скрипт для AI-ассистента / AI-дизайнера (плавающий чат)

(function () {
  const toggleBtn = document.getElementById("ai-chat-toggle");
  const panel = document.getElementById("ai-chat-panel");
  const closeBtn = document.getElementById("ai-chat-close");
  const input = document.getElementById("ai-chat-input");
  const sendBtn = document.getElementById("ai-chat-send");
  const messagesBox = document.getElementById("ai-chat-messages");

  // Если на странице нет нужных элементов — просто выходим
  if (!toggleBtn || !panel || !input || !sendBtn || !messagesBox || !closeBtn) {
    return;
  }

  // ВАЖНО: используем единый многоязычный бэкенд-эндпоинт
  // с бизнес-логикой, ценами и языками (русский / английский / таджикский)
  const API_URL = "/api/ai-designer";

  const history = [];

  // Открытие чата
  function openChat() {
    panel.classList.add("ai-chat-panel--open");
    panel.setAttribute("aria-hidden", "false");
    input.focus();
  }

  // Закрытие чата
  function closeChat() {
    panel.classList.remove("ai-chat-panel--open");
    panel.setAttribute("aria-hidden", "true");
  }

  // Добавление сообщения в окно
  function appendMessage(role, text) {
    const msgEl = document.createElement("div");
    msgEl.className = "ai-chat-msg " + (role === "user" ? "ai-chat-msg--user" : "ai-chat-msg--assistant");

    const textEl = document.createElement("div");
    textEl.className = "ai-chat-msg__text";
    textEl.textContent = text;

    msgEl.appendChild(textEl);
    messagesBox.appendChild(msgEl);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  // Отправка сообщения
  async function sendMessage() {
    const text = (input.value || "").trim();
    if (!text) return;

    // Показать сообщение пользователя
    appendMessage("user", text);
    history.push({ role: "user", content: text });

    input.value = "";
    input.focus();
    sendBtn.disabled = true;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // ВАЖНО: формат тела для api/chat.js
        body: JSON.stringify({
          message: text,
          history, // полный контекст диалога
        }),
      });

      if (!res.ok) {
        throw new Error("AI request failed with status " + res.status);
      }

      const data = await res.json();
      const answer = data.reply || data.answer || data.message;

      const botText =
        typeof answer === "string" && answer.trim()
          ? answer.trim()
          : "Извините, сейчас сервис временно недоступен. Попробуйте, пожалуйста, ещё раз чуть позже.";

      appendMessage("assistant", botText);
      history.push({ role: "assistant", content: botText });
    } catch (e) {
      console.error(e);
      appendMessage(
        "assistant",
        "Извините, не удалось получить ответ от сервиса. Попробуйте, пожалуйста, ещё раз чуть позже."
      );
    } finally {
      sendBtn.disabled = false;
    }
  }

  // Открытие / закрытие по клику на аватар
  toggleBtn.addEventListener("click", () => {
    const isOpen = panel.classList.contains("ai-chat-panel--open");
    if (isOpen) closeChat();
    else openChat();
  });

  // Закрыть по крестику
  closeBtn.addEventListener("click", closeChat);

  // Отправка по кнопке
  sendBtn.addEventListener("click", sendMessage);

  // Отправка по Enter
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
    (e) => {
      startY = e.touches[0].clientY;
    },
    { passive: true }
  );

  window.addEventListener(
    "touchend",
    (e) => {
      if (startY == null) return;
      const deltaY = startY - e.changedTouches[0].clientY;

      // Если пользователь провёл пальцем вверх больше чем на 60px
      // и чат сейчас закрыт — открываем
      if (deltaY > 60 && !panel.classList.contains("ai-chat-panel--open")) {
        openChat();
      }

      startY = null;
    },
    { passive: true }
  );
})();
