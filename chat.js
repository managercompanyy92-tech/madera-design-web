// chat.js — фронтенд-логика виджета AI-ассистента Madera
// Работает с HTML-разметкой, где есть data-madera-* атрибуты

(function () {
  document.addEventListener("DOMContentLoaded", initMaderaChat);

  function initMaderaChat() {
    const chatEl = document.querySelector("[data-madera-chat]");
    const openButtons = document.querySelectorAll("[data-madera-chat-open]");
    const closeButton = document.querySelector("[data-madera-chat-close]");
    const form = document.querySelector("[data-madera-chat-form]");
    const input = document.querySelector("[data-madera-chat-input]");
    const messagesEl = document.querySelector("[data-madera-chat-messages]");
    const statusEl = document.querySelector("[data-madera-chat-status]");
    const voiceBtn = document.querySelector("[data-madera-chat-voice]");

    if (
      !chatEl ||
      !openButtons.length ||
      !closeButton ||
      !form ||
      !input ||
      !messagesEl
    ) {
      console.warn("[Madera AI] Не найдены элементы чата. Проверь data-атрибуты.");
      return;
    }

    // --- Состояния и константы ---------------------------------------------

    const STORAGE_KEY = "maderaChatHistoryV1";

    const DEFAULT_STATUS =
      (statusEl && statusEl.textContent.trim()) ||
      "Онлайн-ассистент. Точный расчёт сделает менеджер после замера.";

    const QUICK_QUESTIONS = [
      "Сколько стоит кухня 3 метра?",
      "Сколько стоит кухня 5 метров с фасадом МДФ?",
      "Сколько стоит шкаф-купе 4 метра?",
      "Сколько стоит прихожая 3 метра?",
    ];

    let history = [];
    let isLoading = false;
    let isRecognizing = false;
    let recognition = null;

    // --- Вспомогательные функции ------------------------------------------

    function openChat() {
      chatEl.classList.add("madera-chat--open");
      // Автофокус в поле ввода
      setTimeout(() => input.focus(), 50);
    }

    function closeChat() {
      chatEl.classList.remove("madera-chat--open");
    }

    function setStatus(text) {
      if (!statusEl) return;
      statusEl.textContent = text;
    }

    function updateStatus() {
      if (isRecognizing) {
        setStatus("Слушаю вас…");
      } else if (isLoading) {
        setStatus("AI-ассистент обрабатывает ваш запрос…");
      } else {
        setStatus(DEFAULT_STATUS);
      }
    }

    function scrollMessagesToBottom() {
      if (!messagesEl) return;
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function saveHistory() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      } catch (e) {
        console.warn("[Madera AI] Не удалось сохранить историю чата:", e);
      }
    }

    function loadHistory() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return;
        history = parsed;
        // Восстанавливаем визуальные сообщения
        history.forEach((msg) => {
          if (!msg || !msg.role || !msg.content) return;
          appendMessage(
            msg.role === "user" ? "user" : "bot",
            msg.content,
            false
          );
        });
        scrollMessagesToBottom();
      } catch (e) {
        console.warn("[Madera AI] Не удалось прочитать историю чата:", e);
      }
    }

    /**
     * Добавить сообщение в чат.
     * role: 'user' | 'bot'
     * save: нужно ли сохранять в историю (по умолчанию true)
     */
    function appendMessage(role, text, save = true) {
      if (!messagesEl || !text) return;

      const wrapper = document.createElement("div");
      wrapper.classList.add("madera-chat__message");
      if (role === "user") {
        wrapper.classList.add("madera-chat__message--user");
      } else {
        wrapper.classList.add("madera-chat__message--bot");
      }

      const bubble = document.createElement("div");
      bubble.classList.add("madera-chat__bubble");
      bubble.textContent = text;

      wrapper.appendChild(bubble);
      messagesEl.appendChild(wrapper);

      if (save) {
        history.push({
          role: role === "user" ? "user" : "assistant",
          content: text,
        });
        saveHistory();
      }

      scrollMessagesToBottom();
    }

    // Создание блока быстрых вопросов (FAQ)
    function createQuickQuestions() {
      if (!messagesEl || QUICK_QUESTIONS.length === 0) return;

      const container = document.createElement("div");
      container.style.marginBottom = "6px";
      container.style.display = "flex";
      container.style.flexWrap = "wrap";
      container.style.gap = "4px";

      QUICK_QUESTIONS.forEach((q) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = q;
        btn.style.fontSize = "11px";
        btn.style.padding = "4px 8px";
        btn.style.borderRadius = "999px";
        btn.style.border = "1px solid var(--madera-border)";
        btn.style.background = "var(--madera-bg-soft)";
        btn.style.color = "var(--madera-text-soft)";
        btn.style.cursor = "pointer";
        btn.style.whiteSpace = "nowrap";

        btn.addEventListener("click", () => {
          handleUserMessage(q);
        });

        container.appendChild(btn);
      });

      // Вставляем блок быстрых вопросов в начало списка сообщений
      messagesEl.insertBefore(container, messagesEl.firstChild);
    }

    // --- Работа с backend ---------------------------------------------------

    async function sendToBackend(message) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!res.ok) {
          console.error("[Madera AI] Backend responded with status", res.status);
          throw new Error("Bad response from server");
        }

        const data = await res.json();
        console.log("[Madera AI] Response:", data);

        const reply =
          data?.reply?.trim() ||
          "Извините, произошла ошибка. Попробуйте позже.";

        return reply;
      } catch (error) {
        clearTimeout(timeout);
        console.error("[Madera AI] ERROR:", error);
        throw error;
      }
    }

    async function handleUserMessage(textFromOutside) {
      const text =
        typeof textFromOutside === "string"
          ? textFromOutside.trim()
          : input.value.trim();

      if (!text) return;

      // Если сообщение пришло из поля ввода — очищаем его
      if (!textFromOutside && input) {
        input.value = "";
      }

      appendMessage("user", text);

      isLoading = true;
      updateStatus();

      try {
        const reply = await sendToBackend(text);
        appendMessage("bot", reply);
      } catch (e) {
        appendMessage(
          "bot",
          "Извините, сейчас не получается получить ответ. Попробуйте ещё раз чуть позже."
        );
      } finally {
        isLoading = false;
        updateStatus();
      }
    }

    // --- Голосовой ввод ----------------------------------------------------

    function initSpeechRecognition() {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        console.warn(
          "[Madera AI] В браузере нет поддержки SpeechRecognition (голосовой ввод недоступен)."
        );
        return null;
      }

      const rec = new SpeechRecognition();
      rec.lang = "ru-RU";
      rec.continuous = false;
      rec.interimResults = false;

      rec.onstart = () => {
        isRecognizing = true;
        if (voiceBtn) {
          voiceBtn.classList.add("madera-chat__voice--active");
        }
        updateStatus();
      };

      rec.onend = () => {
        isRecognizing = false;
        if (voiceBtn) {
          voiceBtn.classList.remove("madera-chat__voice--active");
        }
        updateStatus();
      };

      rec.onerror = (event) => {
        console.error("[Madera AI] SpeechRecognition error:", event.error);
        isRecognizing = false;
        if (voiceBtn) {
          voiceBtn.classList.remove("madera-chat__voice--active");
        }
        updateStatus();
      };

      rec.onresult = (event) => {
        try {
          const transcript = Array.from(event.results)
            .map((result) => result[0]?.transcript || "")
            .join(" ")
            .trim();

          if (!transcript) return;

          // Можно подсветить распознанный текст в поле
          if (input) {
            input.value = transcript;
          }

          // Автоматически отправляем распознанный вопрос
          handleUserMessage(transcript);
        } catch (e) {
          console.error("[Madera AI] Ошибка обработки голосового ввода:", e);
        }
      };

      return rec;
    }

    function toggleVoiceRecognition() {
      if (!recognition) {
        recognition = initSpeechRecognition();
      }
      if (!recognition) return;

      if (isRecognizing) {
        recognition.stop();
      } else {
        try {
          recognition.start();
        } catch (e) {
          // В некоторых браузерах повторный start может бросить ошибку
          console.error("[Madera AI] Не удалось запустить распознавание:", e);
        }
      }
    }

    // --- Навешиваем обработчики -------------------------------------------

    openButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        openChat();
      });
    });

    closeButton.addEventListener("click", (e) => {
      e.preventDefault();
      closeChat();
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      handleUserMessage();
    });

    if (voiceBtn) {
      voiceBtn.addEventListener("click", (e) => {
        e.preventDefault();
        toggleVoiceRecognition();
      });
    }

    // Открытие чата по клавише "Escape" (закрытие) и "Ctrl+Shift+A" (открыть)
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && chatEl.classList.contains("madera-chat--open")) {
        closeChat();
      }
      if (e.key.toLowerCase() === "a" && e.ctrlKey && e.shiftKey) {
        openChat();
      }
    });

    // --- Инициализация при загрузке страницы -------------------------------

    createQuickQuestions();
    loadHistory();
    updateStatus();

    console.log("[Madera AI] Чат инициализирован.");
  }
})();
