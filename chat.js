// chat.js
// Логика AI-ассистента Madera: UI, отправка текста, голосовой ввод, TTS

document.addEventListener("DOMContentLoaded", () => {
  const chatRoot = document.querySelector("[data-madera-chat]");
  const openBtn = document.querySelector("[data-madera-chat-open]");
  const closeBtn = document.querySelector("[data-madera-chat-close]");
  const form = document.querySelector("[data-madera-chat-form]");
  const input = document.querySelector("[data-madera-chat-input]");
  const messagesEl = document.querySelector("[data-madera-chat-messages]");
  const statusEl = document.querySelector("[data-madera-chat-status]");
  const voiceBtn = document.querySelector("[data-madera-chat-voice]");

  if (
    !chatRoot ||
    !openBtn ||
    !closeBtn ||
    !form ||
    !input ||
    !messagesEl ||
    !statusEl ||
    !voiceBtn
  ) {
    console.warn("Madera chat: some elements not found");
    return;
  }

  const API_URL = "/api/ai-designer";

  /* --------------------------- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ --------------------------- */

  function appendMessage(text, role) {
    const wrapper = document.createElement("div");
    wrapper.className =
      "madera-chat__message " +
      (role === "user"
        ? "madera-chat__message--user"
        : "madera-chat__message--bot");

    const bubble = document.createElement("div");
    bubble.className = "madera-chat__bubble";
    bubble.textContent = text;

    wrapper.appendChild(bubble);
    messagesEl.appendChild(wrapper);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function setStatus(text) {
    statusEl.textContent = text;
  }

  /* -------------------------------- ГОЛОСОВОЙ ОТВЕТ -------------------------------- */

  function speak(text) {
    if (!("speechSynthesis" in window)) return;

    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "ru-RU";
      utter.rate = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.warn("TTS error:", e);
    }
  }

  /* ----------------------------- ОТПРАВКА НА BACKEND ------------------------------ */

  async function sendToAssistant(message) {
    setStatus("Думаю над ответом…");

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        throw new Error(`Bad status: ${res.status}`);
      }

      const data = await res.json();
      const reply = (data && (data.reply || data.text || data.answer)) || "";

      if (!reply) {
        throw new Error("Empty reply from API");
      }

      return reply;
    } catch (e) {
      console.warn("API error, fallback to local message:", e);
      return "Извините, сейчас сервис временно недоступен. Попробуйте ещё раз чуть позже.";
    } finally {
      // Возвращаем базовый статус
      setStatus("Готова помочь. Голосовые и текстовые запросы поддерживаются.");
    }
  }

  /* ---------------------------- ОБРАБОТЧИК ОТПРАВКИ ФОРМЫ ---------------------------- */

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = (input.value || "").trim();
    if (!text) return;

    // Показываем сообщение пользователя
    appendMessage(text, "user");
    input.value = "";

    // Получаем ответ ассистента
    const reply = await sendToAssistant(text);
    appendMessage(reply, "bot");
    speak(reply);
  });

  /* ------------------------------ ГОЛОСОВОЙ ВВОД ------------------------------ */

  voiceBtn.addEventListener("click", () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("К сожалению, голосовой ввод не поддерживается в этом браузере.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "ru-RU";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setStatus("Слушаю… Говорите ваш запрос.");
      recognition.start();

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        input.value = transcript;
        setStatus("Текст распознан. Нажмите отправить или отредактируйте.");
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        setStatus("Не удалось распознать голос. Попробуйте ещё раз.");
      };

      recognition.onend = () => {
        if (statusEl.textContent.startsWith("Слушаю…")) {
          setStatus(
            "Готова помочь. Голосовые и текстовые запросы поддерживаются."
          );
        }
      };
    } catch (e) {
      console.warn("Speech recognition init error:", e);
      setStatus("Не удалось запустить голосовой ввод.");
    }
  });

  /* -------------------------- ОТКРЫТИЕ / ЗАКРЫТИЕ ЧАТА -------------------------- */

  openBtn.addEventListener("click", () => {
    chatRoot.classList.add("madera-chat--open");
  });

  closeBtn.addEventListener("click", () => {
    chatRoot.classList.remove("madera-chat--open");
  });
});
