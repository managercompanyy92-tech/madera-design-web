// src/ai-chat.js
// Круглый чат Madera Design: текст + визуализации через /api/ai-designer

const API_URL = "/api/ai-designer";
const STORAGE_KEY = "madera_ai_chat_history";
const MAX_HISTORY = 50;

// === DOM-элементы (адаптированы под типичную разметку виджета) ===
const chatRoot = document; // если будет отдельный контейнер — можно заменить

const messagesBox =
  chatRoot.querySelector('[data-ai-chat="messages"]') ||
  chatRoot.querySelector(".ai-chat-messages");

const inputEl =
  chatRoot.querySelector('[data-ai-chat="input"]') ||
  chatRoot.querySelector(".ai-chat-input");

const formEl =
  chatRoot.querySelector('[data-ai-chat="form"]') ||
  chatRoot.querySelector(".ai-chat-form");

const sendBtn =
  chatRoot.querySelector('[data-ai-chat="send"]') ||
  chatRoot.querySelector(".ai-chat-send");

const loaderEl =
  chatRoot.querySelector('[data-ai-chat="loader"]') ||
  chatRoot.querySelector(".ai-chat-loader");

const errorBox =
  chatRoot.querySelector('[data-ai-chat="error"]') ||
  chatRoot.querySelector(".ai-chat-error");

const clearHistoryBtn =
  chatRoot.querySelector('[data-ai-chat="clear-history"]') ||
  chatRoot.querySelector(".ai-chat-clear-history");

// при наличии кнопок открытия/закрытия чата
const openChatBtn =
  chatRoot.querySelector('[data-ai-chat="open"]') ||
  chatRoot.querySelector(".ai-chat-open");

const closeChatBtn =
  chatRoot.querySelector('[data-ai-chat="close"]') ||
  chatRoot.querySelector(".ai-chat-close");

const chatWindow =
  chatRoot.querySelector('[data-ai-chat="window"]') ||
  chatRoot.querySelector(".ai-chat-window");

// === Состояние ===
let history = [];
let isSending = false;

// === Вспомогательные функции ===

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

function setLoadingState(loading) {
  isSending = loading;

  if (sendBtn) sendBtn.disabled = loading;
  if (inputEl) inputEl.disabled = loading;
  if (loaderEl) loaderEl.style.display = loading ? "flex" : "none";
}

function showError(message) {
  if (!errorBox) return;
  if (!message) {
    errorBox.textContent = "";
    errorBox.style.display = "none";
    return;
  }
  errorBox.textContent = message;
  errorBox.style.display = "block";
}

function scrollMessagesToBottom() {
  if (!messagesBox) return;
  messagesBox.scrollTop = messagesBox.scrollHeight;
}

// === Работа с localStorage ===

function loadHistory() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.warn("Failed to load chat history", e);
    return [];
  }
}

function saveHistory() {
  try {
    const trimmed = history.slice(-MAX_HISTORY);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn("Failed to save chat history", e);
  }
}

// === Рендер сообщений ===

function appendMessage(role, text) {
  if (!messagesBox) return;
  const msgEl = document.createElement("div");
  msgEl.className = `ai-chat-msg ai-chat-msg--${role}`;

  msgEl.innerHTML = `
    <div class="ai-chat-msg__bubble">
      ${escapeHtml(text)}
    </div>
  `;

  messagesBox.appendChild(msgEl);
  scrollMessagesToBottom();
}

// Добавление изображения в чат (визуализация)
function appendImage(url, caption) {
  if (!messagesBox || !url) return;

  const msgEl = document.createElement("div");
  msgEl.className = "ai-chat-msg ai-chat-msg--assistant ai-chat-msg--image";

  const imgEl = document.createElement("img");
  imgEl.className = "ai-chat-msg__image";
  imgEl.src = url;
  imgEl.alt = caption || "AI design";

  msgEl.appendChild(imgEl);

  if (caption) {
    const captionEl = document.createElement("div");
    captionEl.className = "ai-chat-msg__caption";
    captionEl.textContent = caption;
    msgEl.appendChild(captionEl);
  }

  messagesBox.appendChild(msgEl);
  scrollMessagesToBottom();
}

// Восстановление истории из localStorage
function renderHistory() {
  if (!messagesBox) return;
  messagesBox.innerHTML = "";
  history.forEach((msg) => {
    if (msg.type === "image" && msg.url) {
      appendImage(msg.url, msg.caption);
    } else {
      appendMessage(msg.role || "assistant", msg.content || "");
    }
  });
}

// === Основная логика отправки сообщений ===

async function sendMessage() {
  if (!inputEl) return;
  const text = (inputEl.value || "").trim();
  if (!text || isSending) return;

  showError(null);

  // 1. Добавляем пользовательское сообщение в чат и историю
  appendMessage("user", text);
  history.push({ role: "user", content: text });
  saveHistory();

  // 2. Определяем, просит ли человек визуализацию
  const isImageRequest = detectImageRequest(text);

  // 3. Очищаем поле ввода
  inputEl.value = "";

  // 4. Отправляем запрос на /api/ai-designer
  setLoadingState(true);

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: history.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        imageRequest: isImageRequest,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(errText || `Ошибка сервера (${res.status})`);
    }

    const data = await res.json();

    // 5. Обрабатываем вариант с картинкой
    if (data.type === "image" && data.url) {
      const caption = data.text || "";
      appendImage(data.url, caption);

      history.push({
        role: "assistant",
        type: "image",
        url: data.url,
        caption,
        content: ((caption || "") + " [image]").trim(),
      });
      saveHistory();
      return;
    }

    // 6. Обычный текстовый ответ (универсальный формат)
    const answer =
      data.text ||
      data.reply ||
      data.answer ||
      "Извините, сейчас не удалось получить ответ. Попробуйте позже.";

    appendMessage("assistant", answer);
    history.push({ role: "assistant", content: answer });
    saveHistory();
  } catch (err) {
    console.error(err);
    showError(err.message || "Произошла ошибка при запросе к AI-сервису.");
  } finally {
    setLoadingState(false);
    if (inputEl) inputEl.focus();
  }
}

// === Обработчики событий ===

function initChat() {
  // загрузка истории
  history = loadHistory();
  renderHistory();

  // отправка по кнопке / submit формы
  if (formEl) {
    formEl.addEventListener("submit", function (e) {
      e.preventDefault();
      sendMessage();
    });
  } else if (sendBtn) {
    sendBtn.addEventListener("click", function () {
      sendMessage();
    });
  }

  // отправка по Enter (без Shift)
  if (inputEl) {
    inputEl.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  // очистка истории
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", function () {
      history = [];
      saveHistory();
      if (messagesBox) messagesBox.innerHTML = "";
      showError(null);
    });
  }

  // открытие/закрытие круглого чата (если элементы есть)
  if (openChatBtn && chatWindow) {
    openChatBtn.addEventListener("click", function () {
      chatWindow.classList.add("ai-chat-window--open");
      if (inputEl) inputEl.focus();
    });
  }

  if (closeChatBtn && chatWindow) {
    closeChatBtn.addEventListener("click", function () {
      chatWindow.classList.remove("ai-chat-window--open");
    });
  }
}

// === Инициализация после загрузки DOM ===
document.addEventListener("DOMContentLoaded", initChat);
