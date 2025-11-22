// chat.js
// Требуемая разметка (можешь подстроить под свой HTML):
// - Кнопка открытия чата: [data-chat-open]
// - Кнопка закрытия чата (крестик в окне): [data-chat-close]
// - Контейнер виджета чата: [data-chat-widget]
// - Контейнер сообщений: [data-chat-messages]
// - Форма отправки сообщения: [data-chat-form]
// - Поле ввода: [data-chat-input]
// - Кнопка отправки: [data-chat-send] (может быть <button> в форме)

document.addEventListener("DOMContentLoaded", () => {
  const widget = document.querySelector("[data-chat-widget]");
  const openBtn = document.querySelector("[data-chat-open]");
  const closeBtn = document.querySelector("[data-chat-close]");
  const form = document.querySelector("[data-chat-form]");
  const input = document.querySelector("[data-chat-input]");
  const messages = document.querySelector("[data-chat-messages]");
  const sendBtn = document.querySelector("[data-chat-send]") || form?.querySelector("button[type='submit']");

  if (!widget || !openBtn || !closeBtn || !form || !input || !messages) {
    console.warn("Chat widget: не найдены необходимые элементы в разметке.");
    return;
  }

  // Открыть чат
  openBtn.addEventListener("click", () => {
    widget.classList.add("chat-open");
    input.focus();
  });

  // Закрыть чат
  closeBtn.addEventListener("click", () => {
    widget.classList.remove("chat-open");
  });

  // Отправка сообщения по submit формы
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await handleSendMessage();
  });

  // Основная логика отправки
  async function handleSendMessage() {
    const text = input.value.trim();
    if (!text) return;

    appendMessage("user", text);
    input.value = "";
    input.focus();

    setInputDisabled(true);

    const typingEl = showTypingIndicator();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: text })
      });

      removeTypingIndicator(typingEl);

      if (!response.ok) {
        console.error("Chat API error:", response.status, response.statusText);
        appendMessage(
          "assistant",
          "Извините, сейчас не удалось получить ответ от AI. Попробуйте ещё раз позже."
        );
        return;
      }

      const data = await response.json();
      const reply = (data && data.reply) || "Извините, я не смог сформировать ответ.";
      appendMessage("assistant", reply);
    } catch (error) {
      console.error("Chat API request failed:", error);
      removeTypingIndicator(typingEl);
      appendMessage(
        "assistant",
        "Возникла ошибка при соединении с сервером. Проверьте интернет и попробуйте снова."
      );
    } finally {
      setInputDisabled(false);
    }
  }

  // Добавление сообщения в окно чата
  function appendMessage(role, text) {
    const messageEl = document.createElement("div");
    messageEl.classList.add("chat-message", `chat-message--${role}`);

    const bubble = document.createElement("div");
    bubble.classList.add("chat-bubble");
    bubble.textContent = text;

    messageEl.appendChild(bubble);
    messages.appendChild(messageEl);
    scrollToBottom();
  }

  // Индикатор "Ассистент печатает..."
  function showTypingIndicator() {
    const messageEl = document.createElement("div");
    messageEl.classList.add("chat-message", "chat-message--assistant", "chat-message--typing");
    messageEl.dataset.typing = "true";

    const bubble = document.createElement("div");
    bubble.classList.add("chat-bubble");

    const dots = document.createElement("span");
    dots.classList.add("chat-typing-dots");
    dots.textContent = "Ассистент печатает…";

    bubble.appendChild(dots);
    messageEl.appendChild(bubble);
    messages.appendChild(messageEl);
    scrollToBottom();

    return messageEl;
  }

  function removeTypingIndicator(el) {
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    } else {
      const existing = messages.querySelector("[data-typing='true']");
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }
    }
  }

  // Блокировка/разблокировка ввода во время запроса
  function setInputDisabled(disabled) {
    input.disabled = disabled;
    if (sendBtn) sendBtn.disabled = disabled;
  }

  // Скролл вниз
  function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
  }
});
