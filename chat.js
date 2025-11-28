// chat.js

(function () {
  // Адрес вашего бэкенда AI-дизайнера
  const API_URL = "https://your-backend-endpoint.example.com/chat"; // Замените на свой URL

  // Настройки AI-дизайнера
  const AI_DESIGNER_CONFIG = {
    systemPrompt:
      "Ты — AI-дизайнер мебели и интерьера для бренда Madera Design в Душанбе. " +
      "Помогаешь клиенту спроектировать корпусную мебель (кухни, шкафы, гардеробные, детские и т.п.). " +
      "Отвечай кратко и по делу, без сложных технических терминов. " +
      "Всегда вежливо обращайся на «вы». Перед подсчётом стоимости уточняй размеры и пожелания.",
    // Сколько последних сообщений хранить в истории (и отправлять на бэкенд)
    maxContextMessages: 10,
  };

  // Поиск DOM-элементов
  const chatRoot = document.querySelector("[data-madera-chat]");
  const openBtn = document.querySelector("[data-madera-chat-open]");
  const closeBtn = chatRoot?.querySelector("[data-madera-chat-close]");
  const messagesEl = chatRoot?.querySelector("[data-madera-chat-messages]");
  const statusEl = chatRoot?.querySelector("[data-madera-chat-status]");
  const formEl = chatRoot?.querySelector("[data-madera-chat-form]");
  const inputEl = chatRoot?.querySelector("[data-madera-chat-input]");
  const voiceBtn = chatRoot?.querySelector("[data-madera-chat-voice]");

  if (!chatRoot || !openBtn || !closeBtn || !messagesEl || !statusEl || !formEl || !inputEl) {
    console.warn(
      "Madera chat: не удалось найти часть DOM-элементов. Чат не инициализирован."
    );
    return;
  }

  // ---------------- Состояние ----------------

  let isOpen = false;

  // История сообщений (для контекста диалога)
  const chatState = {
    messages: [],
  };

  function addToHistory(role, text) {
    const cleanedText = (text || "").trim();
    if (!cleanedText) return;

    chatState.messages.push({
      role, // "user" | "assistant"
      text: cleanedText,
      timestamp: Date.now(),
    });

    // Ограничиваем длину истории
    if (chatState.messages.length > AI_DESIGNER_CONFIG.maxContextMessages) {
      const extra = chatState.messages.length - AI_DESIGNER_CONFIG.maxContextMessages;
      chatState.messages.splice(0, extra);
    }
  }
// Убираем повторяющееся приветствие ассистента,
// если это уже не первое сообщение в диалоге
function normalizeAssistantReply(text) {
  if (!text) return text;
  const trimmed = text.trim();

  // Проверяем, есть ли уже ответы ассистента в истории
  const isFirstAssistant =
    !chatState.messages.some(m => m.role === "assistant");

  // Если это не первый ответ ассистента и он начинается с "Здравствуйте" —
  // обрезаем приветствие
  if (!isFirstAssistant) {
    return trimmed
      .replace(/^здравствуй(те)?[,! ]*/i, "")
      .trim();
  }

  return trimmed;
}
  // ---------------- Вспомогательные функции ----------------

  function openChat() {
    if (isOpen) return;
    chatRoot.classList.add("madera-chat--open");
    isOpen = true;
    inputEl.focus();
  }

  function closeChat() {
    if (!isOpen) return;
    chatRoot.classList.remove("madera-chat--open");
    isOpen = false;
  }

  function appendMessage(role, text) {
    const trimmed = (text || "").trim();
    if (!trimmed) return;

    const msgEl = document.createElement("div");
    msgEl.className = "madera-chat__message madera-chat__message--" + role;

    const bubbleEl = document.createElement("div");
    bubbleEl.className = "madera-chat__bubble";
    bubbleEl.textContent = trimmed;

    msgEl.appendChild(bubbleEl);
    messagesEl.appendChild(msgEl);

    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function setStatus(text) {
    if (!statusEl) return;
    statusEl.textContent = text;
  }

  function setLoading(isLoading) {
    if (isLoading) {
      formEl.classList.add("madera-chat__form--loading");
      inputEl.setAttribute("disabled", "disabled");
    } else {
      formEl.classList.remove("madera-chat__form--loading");
      inputEl.removeAttribute("disabled");
    }
  }

  // ---------------- Работа с бэкендом ----------------

  async function sendMessageToServer(messageText) {
    try {
      const payload = {
        message: messageText,
        // Эти поля можно использовать на бэкенде для более умного контекста.
        history: chatState.messages,
        systemPrompt: AI_DESIGNER_CONFIG.systemPrompt,
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Bad response: " + response.status);
      }

      const data = await response.json();

      const replyText =
        (data && (data.reply || data.message || data.answer)) ||
        "Извините, сейчас не получается ответить. Попробуйте ещё раз позже.";

      return replyText;
    } catch (error) {
      console.error("Madera chat: ошибка запроса к серверу", error);
      throw error;
    }
  }

  // ---------------- Обработчики событий ----------------

  openBtn.addEventListener("click", (event) => {
    event.preventDefault();
    openChat();
  });

  closeBtn.addEventListener("click", (event) => {
    event.preventDefault();
    closeChat();
  });

  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();

    const messageText = inputEl.value.trim();
    if (!messageText) return;

    appendMessage("user", messageText);
    addToHistory("user", messageText);

    inputEl.value = "";
    setLoading(true);
    setStatus("Думаю над предложением по вашему интерьеру...");

    try {
      const replyText = await sendMessageToServer(messageText);
      appendMessage("assistant", replyText);
      addToHistory("assistant", replyText);
      setStatus("Готова помочь. Задайте вопрос о мебели или интерьере.");
    } catch (error) {
      const fallback =
        "Извините, сейчас не получается ответить. Попробуйте ещё раз чуть позже.";
      appendMessage("assistant", fallback);
      addToHistory("assistant", fallback);
      setStatus("Не удалось получить ответ. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  });

  // ---------------- Голосовой ввод ----------------

  function initVoiceInput() {
    if (!voiceBtn) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      voiceBtn.disabled = true;
      voiceBtn.title = "Голосовой ввод не поддерживается в этом браузере";
      return;
    }

    const recognizer = new SpeechRecognition();
    recognizer.lang = "ru-RU";
    recognizer.continuous = false;
    recognizer.interimResults = false;

    voiceBtn.addEventListener("click", (event) => {
      event.preventDefault();
      try {
        recognizer.start();
        setStatus("Слушаю вас...");
      } catch (error) {
        console.error("Madera chat: ошибка запуска распознавания речи", error);
      }
    });

    recognizer.addEventListener("result", (event) => {
      const text = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join(" ")
        .trim();

      if (text) {
        inputEl.value = text;
        setStatus(
          "Текст распознан. При необходимости скорректируйте и нажмите «Отправить»."
        );
        inputEl.focus();
      } else {
        setStatus("Не удалось распознать речь. Попробуйте ещё раз.");
      }
    });

    recognizer.addEventListener("end", () => {
      if (statusEl.textContent === "Слушаю вас...") {
        setStatus("Готова помочь. Задайте вопрос о мебели или интерьере.");
      }
    });

    recognizer.addEventListener("error", (event) => {
      console.error("Madera chat: ошибка распознавания речи", event);
      setStatus("Не удалось распознать речь. Попробуйте ещё раз.");
    });
  }

  // ---------------- Инициализация ----------------

  const initialGreeting =
    "Привет! Я AI-дизайнер Madera Design. За несколько вопросов помогу прикинуть дизайн и стоимость шкафа, кухни или другой мебели под ваш интерьер.";

  appendMessage("assistant", initialGreeting);
  addToHistory("assistant", initialGreeting);
  setStatus("Готова помочь. Задайте вопрос о мебели или интерьере.");

  initVoiceInput();
})();
