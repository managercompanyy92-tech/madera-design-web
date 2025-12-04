// src/ai-chat.js
// Фронт-чат Madera Design: текст + визуализации через /api/ai-designer

// ========== Конфиг ==========

const AI_CHAT_CONFIG = {
  apiEndpoint: "/api/ai-designer",
  storageKey: "madera_ai_chat_history",
  maxMessagesInHistory: 50,
};

// ========== Вспомогательные функции ==========

function loadFromStorage(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn("Failed to load from storage", e);
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("Failed to save to storage", e);
  }
}

function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Определяем, просит ли человек картинку / визуализацию
function detectImageRequest(text) {
  if (!text) return false;
  const lower = text.toLowerCase();

  const keywords = [
    // русские
    "визуал",
    "визуализ",
    "картинку",
    "картинка",
    "фото",
    "рендер",
    "сделай дизайн",
    "сделай визуализацию",
    "как будет выглядеть",

    // английские
    "render",
    "design image",
    "visualization",

    // таджикские / смешанные
    "дизайн кун",
    "сурат",
    "расм",
    "накша",
  ];

  return keywords.some((k) => lower.includes(k));
}

// ========== Класс ChatUI ==========

class ChatUI {
  constructor(root = document) {
    // DOM-элементы (подстрой под свою разметку при необходимости)
    this.messagesContainer =
      root.querySelector('[data-ai-chat="messages"]') ||
      root.querySelector(".ai-chat-messages") ||
      root.querySelector("#ai-chat-messages");

    this.form =
      root.querySelector('[data-ai-chat="form"]') ||
      root.querySelector(".ai-chat-form");

    this.input =
      root.querySelector('[data-ai-chat="input"]') ||
      root.querySelector(".ai-chat-input") ||
      root.querySelector("#ai-chat-input");

    this.sendButton =
      root.querySelector('[data-ai-chat="send"]') ||
      root.querySelector(".ai-chat-send") ||
      root.querySelector("#ai-chat-send");

    this.loader =
      root.querySelector('[data-ai-chat="loader"]') ||
      root.querySelector(".ai-chat-loader");

    this.errorBox =
      root.querySelector('[data-ai-chat="error"]') ||
      root.querySelector(".ai-chat-error");

    this.clearHistoryButton =
      root.querySelector('[data-ai-chat="clear-history"]') ||
      root.querySelector(".ai-chat-clear-history");

    this.suggestionButtons = Array.from(
      root.querySelectorAll('[data-ai-chat="suggestion"]')
    );

    // Состояние
    this.messages = [];
    this.isLoading = false;
    this.abortController = null;

    this.init();
  }

  // ===== Инициализация =====

  init() {
    this.restoreHistory();
    this.bindEvents();
    this.updateUIState();
  }

  bindEvents() {
    if (this.form && this.input) {
      this.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSubmit();
      });

      // Отправка по Enter (кроме Shift+Enter)
      this.input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.handleSubmit();
        }
      });
    }

    if (this.clearHistoryButton) {
      this.clearHistoryButton.addEventListener("click", () =>
        this.handleClearHistory()
      );
    }

    if (this.suggestionButtons.length > 0) {
      this.suggestionButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          const text = btn.dataset.text || btn.textContent || "";
          this.handleSuggestionClick(text.trim());
        });
      });
    }
  }

  // ===== История =====

  restoreHistory() {
    const stored = loadFromStorage(AI_CHAT_CONFIG.storageKey, []);
    if (Array.isArray(stored) && stored.length > 0) {
      this.messages = stored;
      this.renderAllMessages();
    }
  }

  persistHistory() {
    const toSave = this.messages.slice(
      -AI_CHAT_CONFIG.maxMessagesInHistory
    );
    saveToStorage(AI_CHAT_CONFIG.storageKey, toSave);
  }

  handleClearHistory() {
    this.messages = [];
    this.persistHistory();
    if (this.messagesContainer) {
      this.messagesContainer.innerHTML = "";
    }
    this.showError(null);
  }

  // ===== Рендер =====

  renderAllMessages() {
    if (!this.messagesContainer) return;
    this.messagesContainer.innerHTML = "";
    this.messages.forEach((m) => {
      if (m.type === "image" && m.url) {
        this.appendImageMessage(m.url, m.caption, { persist: false });
      } else {
        this.appendMessageToDOM(m);
      }
    });
    this.scrollToBottom();
  }

  appendMessageToDOM(message) {
    if (!this.messagesContainer) return;
    const wrapper = document.createElement("div");
    wrapper.classList.add("ai-chat-message");
    wrapper.classList.add(`ai-chat-message--${message.role}`);

    wrapper.innerHTML = `
      <div class="ai-chat-message__bubble">
        ${escapeHtml(message.content)}
      </div>
    `;

    this.messagesContainer.appendChild(wrapper);
  }

  // Добавление изображения в чат (визуализация)
  appendImageMessage(url, caption, options = { persist: true }) {
    if (!this.messagesContainer || !url) return;

    const msgEl = document.createElement("div");
    msgEl.classList.add("ai-chat-message", "ai-chat-message--assistant", "ai-chat-message--image");

    const imgEl = document.createElement("img");
    imgEl.classList.add("ai-chat-message__image");
    imgEl.src = url;
    imgEl.alt = caption || "AI design";

    msgEl.appendChild(imgEl);

    if (caption) {
      const captionEl = document.createElement("div");
      captionEl.classList.add("ai-chat-message__caption");
      captionEl.textContent = caption;
      msgEl.appendChild(captionEl);
    }

    this.messagesContainer.appendChild(msgEl);
    this.scrollToBottom();

    if (options.persist) {
      // сохраняем в истории как спец-сообщение
      this.messages.push({
        role: "assistant",
        type: "image",
        url,
        caption: caption || "",
        // текстовое описание для контекста модели
        content: ((caption || "").trim() + " [image]").trim(),
      });
      this.persistHistory();
    }
  }

  scrollToBottom() {
    if (!this.messagesContainer) return;
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  addMessage(role, content, options = { render: true, persist: true }) {
    const msg = { role, content: (content || "").trim() };
    this.messages.push(msg);

    if (options.render) {
      this.appendMessageToDOM(msg);
      this.scrollToBottom();
    }

    if (options.persist) {
      this.persistHistory();
    }

    return msg;
  }

  // ===== UI-состояние =====

  setLoading(isLoading) {
    this.isLoading = isLoading;

    if (this.loader) {
      this.loader.style.display = isLoading ? "flex" : "none";
    }

    if (this.sendButton) {
      this.sendButton.disabled = isLoading;
    }

    if (this.input) {
      this.input.disabled = isLoading;
    }
  }

  showError(message) {
    if (!this.errorBox) return;

    if (!message) {
      this.errorBox.textContent = "";
      this.errorBox.style.display = "none";
      return;
    }

    this.errorBox.textContent = message;
    this.errorBox.style.display = "block";
  }

  updateUIState() {
    this.setLoading(this.isLoading);
  }

  // ===== Обработка действий пользователя =====

  handleSuggestionClick(text) {
    if (!text) return;
    if (this.input) {
      this.input.value = text;
      this.input.focus();
    }
    this.handleSubmit();
  }

  handleSubmit() {
    if (!this.input) return;
    const text = (this.input.value || "").trim();
    if (!text || this.isLoading) return;

    this.showError(null);
    this.sendUserMessage(text);
  }

  // ===== Работа с API (включая imageRequest) =====

  async sendUserMessage(text) {
    // 1. Добавляем сообщение пользователя в чат и историю
    this.addMessage("user", text);

    // 2. Вычисляем, просит ли человек визуализацию
    const isImageRequest = detectImageRequest(text);

    // 3. Очищаем поле ввода
    if (this.input) {
      this.input.value = "";
    }

    // 4. Готовим запрос
    this.setLoading(true);
    this.abortController = new AbortController();

    try {
      const payloadMessages = this.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(AI_CHAT_CONFIG.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: this.abortController.signal,
        body: JSON.stringify({
          messages: payloadMessages,
          imageRequest: isImageRequest,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(
          errorText || `Ошибка сервера (${response.status})`
        );
      }

      const data = await response.json();

      // 5. Обрабатываем вариант с картинкой
      if (data && data.type === "image" && data.url) {
        const caption = data.text || "";
        this.appendImageMessage(data.url, caption);

        // в history для модели уже записали спец-сообщение внутри appendImageMessage
        return;
      }

      // 6. Обычный текстовый ответ (совместим со старыми форматами)
      if (
        data &&
        (typeof data.text === "string" ||
          typeof data.reply === "string" ||
          typeof data.answer === "string")
      ) {
        const answer =
          data.text ||
          data.reply ||
          data.answer ||
          "Извините, сейчас не удалось получить ответ. Попробуйте позже.";

        this.addMessage("assistant", answer);
        return;
      }

      // 7. Формат { messages: [...] }, как ранее
      if (data && Array.isArray(data.messages)) {
        const assistantMessages = data.messages.filter(
          (m) => m.role === "assistant"
        );
        if (assistantMessages.length === 0) {
          throw new Error("Пустой ответ от модели");
        }

        assistantMessages.forEach((m) =>
          this.addMessage("assistant", m.content)
        );
        return;
      }

      throw new Error("Неподдерживаемый формат ответа от API");
    } catch (err) {
      if (err.name === "AbortError") {
        this.showError("Запрос был прерван.");
      } else {
        console.error(err);
        this.showError(
          err.message || "Произошла ошибка при запросе к AI-сервису."
        );
      }
    } finally {
      this.setLoading(false);
      this.abortController = null;
    }
  }

  // ===== Публичные методы =====

  sendSystemMessage(content) {
    this.addMessage("system", content);
  }

  abortRequest() {
    if (this.abortController) {
      this.abortController.abort();
    }
  }
}

// ========== Автоинициализация ==========

document.addEventListener("DOMContentLoaded", () => {
  window.maderaAIChat = new ChatUI(document);
});
