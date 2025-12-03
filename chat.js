// chat.js
// Фронтенд-логика для окна "AI-дизайнер Madera".
// Работает с разметкой из index.html и backend-эндпоинтом /api/ai-designer.
//
// Возможности:
// - открытие/закрытие окна;
// - отправка текстовых сообщений на backend;
// - базовый голосовой ввод (Web Speech API, если есть);
// - вывод ответов ассистента;
// - задание статуса ("печатает..." / ошибки).

(function () {
  "use strict";

  // Проверяем, что DOM загрузился
  document.addEventListener("DOMContentLoaded", function () {
    const chatRoot = document.querySelector("[data-madera-chat]");
    const openBtn = document.querySelector("[data-madera-chat-open]");
    const closeBtn = document.querySelector("[data-madera-chat-close]");
    const messagesBox = document.querySelector("[data-madera-chat-messages]");
    const statusEl = document.querySelector("[data-madera-chat-status]");
    const form = document.querySelector("[data-madera-chat-form]");
    const input = document.querySelector("[data-madera-chat-input]");
    const voiceBtn = document.querySelector("[data-madera-chat-voice]");

    if (!chatRoot || !openBtn || !closeBtn || !messagesBox || !form || !input) {
      console.warn("Madera chat: не найден один из DOM-элементов.");
      return;
    }

    /* ---------------------------- ОТКРЫТЬ / ЗАКРЫТЬ ---------------------------- */

    function openChat() {
      chatRoot.classList.add("madera-chat--open");
      try {
        input.focus();
      } catch (e) {}
    }

    function closeChat() {
      chatRoot.classList.remove("madera-chat--open");
    }

   openBtn?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    // 1) Если на странице уже есть AI-дизайнер — просто открыть его
    if (typeof window.openAiDesignerChat === "function") {
      window.openAiDesignerChat();
      return;
    }

    // 2) Если окно ещё не создано, но есть init-функция — инициализируем и открываем
    if (typeof window.initAiDesignerChat === "function") {
      window.initAiDesignerChat();

      if (typeof window.openAiDesignerChat === "function") {
        window.openAiDesignerChat();
      }
      return;
    }

    // 3) Если ни один вариант не сработал — пишем в консоль, но ничего не ломаем
    console.warn("Блок AI-дизайнера не найден на этой странице.");
  });

    /* ----------------------------- РЕНДЕР СООБЩЕНИЙ --------------------------- */

    function appendMessage(role, text) {
      if (!text || !text.trim()) return;

      const wrapper = document.createElement("div");
      wrapper.classList.add("madera-chat__message");
      if (role === "user") {
        wrapper.classList.add("madera-chat__message--user");
      } else {
        wrapper.classList.add("madera-chat__message--bot");
      }

      const bubble = document.createElement("div");
      bubble.classList.add("madera-chat__bubble");
      bubble.textContent = text.trim();

      wrapper.appendChild(bubble);
      messagesBox.appendChild(wrapper);

      messagesBox.scrollTop = messagesBox.scrollHeight;
    }

    function setStatus(text) {
      if (!statusEl) return;
      statusEl.textContent = text || "";
    }

    /* --------------------------- ОТПРАВКА НА BACKEND --------------------------- */

    async function sendToBackend(messageText) {
      const safeText = (messageText || "").trim();
      if (!safeText) return;

      // Показать сообщение пользователя
      appendMessage("user", safeText);
      setStatus("AI-дизайнер думает над ответом…");

      try {
        const formData = new FormData();
        formData.append("message", safeText);

        const response = await fetch("/api/ai-designer", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          console.error("AI_DESIGNER_HTTP_ERROR:", response.status);
          appendMessage(
            "bot",
            "Сейчас временно есть сложности с сервером. Попробуйте ещё раз чуть позже."
          );
          setStatus("Не удалось получить ответ от сервера.");
          return;
        }

        const data = await response.json();
        const replyText =
          (data && data.reply) ||
          "Спасибо за сообщение. Я готов помочь с вашим интерьером и мебелью.";

        appendMessage("bot", replyText);
        setStatus("Готова помочь. Голосовые и текстовые запросы поддерживаются.");

        // Базовое озвучивание ответа (если доступно)
        if ("speechSynthesis" in window) {
          try {
            const utter = new SpeechSynthesisUtterance(replyText);
            utter.lang = "ru-RU";
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utter);
          } catch (e) {
            console.warn("SpeechSynthesis error:", e);
          }
        }
      } catch (err) {
        console.error("AI_DESIGNER_FETCH_ERROR:", err);
        appendMessage(
          "bot",
          "Похоже, есть проблема с подключением. Проверьте интернет и попробуйте снова."
        );
        setStatus("Ошибка сети при обращении к AI-дизайнеру.");
      }
    }

  // ===== Новый обработчик отправки AI-дизайнеру =====
form.addEventListener("submit", async function (evt) {
  evt.preventDefault();

  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  appendMessage("user", text);
  input.value = "";

  try {
    const resp = await fetch("/api/ai-designer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        context: "Каталог — пользователь задаёт вопрос о мебели или дизайне."
      })
    });

    let reply = "Спасибо! Сейчас предложу решение...";

    if (resp.ok) {
      const data = await resp.json().catch(() => null);
      if (data?.reply) reply = data.reply;
    } else {
      reply = "Сервис временно недоступен. Попробуйте ещё раз через минуту.";
    }

    appendMessage("bot", reply);
  } catch (err) {
    appendMessage(
      "bot",
      "Произошла ошибка соединения. Проверьте интернет и попробуйте позже."
    );
  }
});

    /* -------------------------- ГОЛОСОВОЙ ВВОД (WEB API) ---------------------- */

    let recognition = null;
    let isListening = false;

    function initSpeechRecognition() {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.warn("SpeechRecognition API не поддерживается в этом браузере.");
        return null;
      }
      const rec = new SpeechRecognition();
      rec.lang = "ru-RU";
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      return rec;
    }

    if (voiceBtn) {
      voiceBtn.addEventListener("click", function () {
        // Первый клик — создаём recognition, если его ещё нет
        if (!recognition) {
          recognition = initSpeechRecognition();
          if (!recognition) {
            setStatus(
              "Голосовой ввод не поддерживается в этом браузере. Напишите текстом."
            );
            return;
          }

          recognition.addEventListener("result", (event) => {
            try {
              const transcript = event.results[0][0].transcript;
              input.value = transcript;
              setStatus("Текст распознан. Можете отредактировать и отправить.");
            } catch (e) {
              console.warn("SpeechRecognition result error:", e);
            }
          });

          recognition.addEventListener("error", (event) => {
            console.warn("SpeechRecognition error:", event.error);
            setStatus("Не удалось распознать речь. Попробуйте ещё раз.");
          });

          recognition.addEventListener("end", () => {
            isListening = false;
            voiceBtn.classList.remove("madera-chat__voice--active");
          });
        }

        if (!isListening) {
          // запуск распознавания
          try {
            recognition.start();
            isListening = true;
            voiceBtn.classList.add("madera-chat__voice--active");
            setStatus("Слушаю… говорите.");
          } catch (e) {
            console.warn("SpeechRecognition start error:", e);
            setStatus("Не удалось запустить голосовой ввод.");
          }
        } else {
          // остановка
          try {
            recognition.stop();
          } catch (e) {
            console.warn("SpeechRecognition stop error:", e);
          }
          isListening = false;
          voiceBtn.classList.remove("madera-chat__voice--active");
          setStatus("Готова помочь. Голосовые и текстовые запросы поддерживаются.");
        }
      });
    }

    // На всякий случай статус по умолчанию
    setStatus("Готова помочь. Голосовые и текстовые запросы поддерживаются.");
  });
})();
