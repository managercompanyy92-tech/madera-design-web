// chat.js

(function () {
  const API_URL = "https://your-backend.example.com/api/assistant"; // замените на свой backend при необходимости

  const chatRoot = document.querySelector("[data-madera-chat]");
  const openBtn = document.querySelector("[data-madera-chat-open]");
  const closeBtn = chatRoot?.querySelector("[data-madera-chat-close]");
  const messagesEl = chatRoot?.querySelector("[data-madera-chat-messages]");
  const statusEl = chatRoot?.querySelector("[data-madera-chat-status]");
  const formEl = chatRoot?.querySelector("[data-madera-chat-form]");
  const inputEl = chatRoot?.querySelector("[data-madera-chat-input]");
  const voiceBtn = chatRoot?.querySelector("[data-madera-chat-voice]");

  if (!chatRoot || !openBtn || !formEl || !messagesEl || !inputEl) {
    console.warn("Madera chat: DOM elements not found");
    return;
  }

  /* ------------------------ ОТКРЫТИЕ / ЗАКРЫТИЕ ЧАТА ------------------------ */

  function openChat() {
    chatRoot.classList.add("madera-chat--open");
    if (inputEl) inputEl.focus();
  }

  function closeChat() {
    chatRoot.classList.remove("madera-chat--open");
    stopRecognition();
  }

  openBtn.addEventListener("click", openChat);
  closeBtn?.addEventListener("click", closeChat);

  /* ------------------------------ РЕНДЕР СООБЩЕНИЙ ------------------------------ */

  function appendMessage(text, role = "bot") {
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

  /* -------------------------- ГОЛОСОВОЙ ОТВЕТ (TTS) -------------------------- */

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

  /* ------------------------- ОТПРАВКА НА BACKEND / ФОЛБЭК ------------------------- */

  async function sendToAssistant(message) {
    statusEl.textContent = "Думаю над ответом…";

    // Попытка обратиться к backend API
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.reply || data.text || "";
        if (reply) {
          return reply;
        }
      }
    } catch (e) {
      console.warn("API error, fallback to локальная логика:", e);
    }

    // Локальный фолбэк, если API нет или отвечает с ошибкой
    const lower = message.toLowerCase();

    if (lower.includes("цена") || lower.includes("стоим")) {
      return "Базовые тарифы: около 4000 сомони за погонный метр для ЛДСП (Стандарт) и 5000 сомони для МДФ фасадов (Премиум). Минимальный объём — 3 погонных метра.";
    }

    if (lower.includes("минимал")) {
      return "Минимальный объём заказа — 3 погонных метра. Это помогает сохранять качество сервиса и оптимальную загрузку производства.";
    }

    if (lower.includes("кредит") || lower.includes("рассроч")) {
      return "Оплата возможна частями и в кредит через партнёрские банки. Конкретные условия можно обсудить с менеджером после расчёта проекта.";
    }

    if (lower.includes("адрес") || lower.includes("где находитесь")) {
      return "Шоурум и производство Madera Design находятся в Душанбе. Точный адрес и схему проезда вам уточнит менеджер при согласовании замера.";
    }

    return "Я зафиксировала ваш вопрос. Ориентировочные тарифы: 4000 / 5000 сом за погонный метр, минимальный объём — 3 пог. метра. За точными цифрами лучше заполнить заявку в разделе «Заказ» — менеджер всё посчитает.";
  }

  /* ------------------------------ ОТПРАВКА ФОРМЫ ------------------------------ */

  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = (inputEl.value || "").trim();
    if (!text) return;

    appendMessage(text, "user");
    inputEl.value = "";

    const reply = await sendToAssistant(text);
    appendMessage(reply, "bot");
    statusEl.textContent =
      "Готова к следующему вопросу. Голосовой и текстовый ввод доступны.";
    speak(reply);
  });

  inputEl.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      formEl.dispatchEvent(new Event("submit", { cancelable: true }));
    }
  });

  /* --------------------------- ГОЛОСОВОЙ ВВОД (STT) --------------------------- */

  let recognition = null;
  let recognizing = false;

  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = "ru-RU";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.addEventListener("start", () => {
      recognizing = true;
      voiceBtn.classList.add("madera-chat__voice--active");
      statusEl.textContent = "Слушаю… говорите ваш вопрос.";
    });

    recognition.addEventListener("end", () => {
      recognizing = false;
      voiceBtn.classList.remove("madera-chat__voice--active");
      statusEl.textContent =
        "Готова к следующему вопросу. Голосовой и текстовый ввод доступны.";
    });

    recognition.addEventListener("result", (event) => {
      const transcript = event.results[0][0].transcript;
      inputEl.value = transcript;
      formEl.dispatchEvent(new Event("submit", { cancelable: true }));
    });
  } else {
    console.warn("SpeechRecognition API not supported");
  }

  function startRecognition() {
    if (!recognition || recognizing) return;
    recognition.start();
  }

  function stopRecognition() {
    if (!recognition || !recognizing) return;
    recognition.stop();
  }

  voiceBtn.addEventListener("click", () => {
    if (!recognition) {
      statusEl.textContent =
        "Голосовой ввод не поддерживается в этом браузере. Попробуйте последний Chrome.";
      return;
    }
    if (recognizing) {
      stopRecognition();
    } else {
      startRecognition();
    }
  });
})();
