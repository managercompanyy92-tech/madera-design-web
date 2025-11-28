// chat.js
// Логика AI-дизайнера Madera Design

(function () {
  // Безопасная инициализация: если браузер очень старый или DOM не готов, просто выходим
  if (typeof window === "undefined" || typeof document === "undefined") return;

  // --- Поиск элементов в DOM ---

  const chatRoot = document.querySelector("[data-madera-chat]");
  const openBtn = document.querySelector("[data-madera-chat-open]");
  const closeBtn = chatRoot?.querySelector("[data-madera-chat-close]");
  const form = chatRoot?.querySelector("[data-madera-chat-form]");
  const input = chatRoot?.querySelector("[data-madera-chat-input]");
  const messagesEl = chatRoot?.querySelector("[data-madera-chat-messages]");
  const statusEl = chatRoot?.querySelector("[data-madera-chat-status]");
  const voiceBtn = chatRoot?.querySelector("[data-madera-chat-voice]");

  if (!chatRoot || !openBtn || !closeBtn || !form || !input || !messagesEl || !statusEl) {
    // Если что-то не нашли, тихо выходим, чтобы не ломать страницу
    return;
  }

  // --- Вспомогательные функции UI ---

  function openChat() {
    chatRoot.classList.add("madera-chat--open");
    // Автофокус в поле ввода с небольшой задержкой
    setTimeout(() => input.focus(), 150);
  }

  function closeChat() {
    chatRoot.classList.remove("madera-chat--open");
  }

  function scrollMessagesToBottom() {
    requestAnimationFrame(() => {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    });
  }

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function createMessageElement(role, text) {
    const wrapper = document.createElement("div");
    wrapper.className = "madera-chat__message madera-chat__message--" + role;

    const bubble = document.createElement("div");
    bubble.className = "madera-chat__bubble";
    bubble.textContent = text;

    wrapper.appendChild(bubble);
    return wrapper;
  }

  function addMessage(role, text) {
    const msgEl = createMessageElement(role, text);
    messagesEl.appendChild(msgEl);
    scrollMessagesToBottom();
  }

  // --- Голосовой ввод ---

  let recognition = null;
  let isRecognizing = false;

  function initSpeechRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;

    const recog = new SR();
    recog.lang = "ru-RU";
    recog.interimResults = false;
    recog.maxAlternatives = 1;

    recog.addEventListener("start", () => {
      isRecognizing = true;
      if (voiceBtn) {
        voiceBtn.classList.add("madera-chat__voice--active");
      }
      setStatus("Слушаю вас…");
    });

    recog.addEventListener("end", () => {
      isRecognizing = false;
      if (voiceBtn) {
        voiceBtn.classList.remove("madera-chat__voice--active");
      }
      setStatus("Готова помочь. Голосовые и текстовые сообщения работают.");
    });

    recog.addEventListener("result", (event) => {
      const transcript = Array.from(event.results)
        .map((res) => res[0].transcript)
        .join(" ");

      if (transcript) {
        input.value = transcript.trim();
        input.focus();
      }
    });

    recog.addEventListener("error", () => {
      isRecognizing = false;
      if (voiceBtn) {
        voiceBtn.classList.remove("madera-chat__voice--active");
      }
      setStatus("Не удалось распознать голос. Попробуйте ещё раз или напишите текст.");
    });

    return recog;
  }

  if (voiceBtn) {
    recognition = initSpeechRecognition();

    if (recognition) {
      voiceBtn.addEventListener("click", () => {
        if (isRecognizing) {
          recognition.stop();
        } else {
          try {
            recognition.start();
          } catch (e) {
            // Иногда браузер бросает ошибку при повторном запуске — игнорируем
          }
        }
      });
    } else {
      // Если распознавание речи недоступно — прячем кнопку, чтобы не путать пользователя
      voiceBtn.style.display = "none";
    }
  }

  // --- Взаимодействие с бэкендом ---

  async function sendToAssistant(messageText) {
    // Здесь используем универсальный текст статуса — ты можешь изменить его по вкусу
    setStatus("AI-дизайнер Madera думает над решением…");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
        }),
      });

      if (!response.ok) {
        throw new Error("Ошибка сети");
      }

      const data = await response.json();
      const reply =
        (data && (data.reply || data.answer || data.message)) ||
        "У меня сейчас не получилось получить ответ от сервера. Давайте попробуем ещё раз чуть позже.";

      addMessage("assistant", reply);
      setStatus("Готова помочь. Задайте новый вопрос про вашу мебель или интерьер.");
    } catch (error) {
      addMessage(
        "assistant",
        "Похоже, связь с сервером временно недоступна. " +
          "Проверьте интернет и попробуйте ещё раз. Я никуда не исчезну."
      );
      setStatus("Не удалось связаться с сервером. Попробуйте отправить вопрос ещё раз.");
    }
  }

  // --- Обработчики событий ---

  openBtn.addEventListener("click", () => {
    openChat();
  });

  closeBtn.addEventListener("click", () => {
    closeChat();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const text = input.value.trim();
    if (!text) return;

    // Сообщение пользователя
    addMessage("user", text);
    input.value = "";

    // Отправляем запрос к AI-дизайнеру
    sendToAssistant(text);
  });

  // Дополнительно: открытие чата по клавише "Enter" при фокусе на кнопке-аватаре
  openBtn.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openChat();
    }
  });

  // Стартовый статус
  setStatus("Готова помочь. Задайте вопрос о мебели или интерьере.");

})();
