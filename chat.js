// -----------------------------
// Настройки и DOM-элементы
// -----------------------------

// Backend API endpoint (серверная функция на Vercel)
const API_URL = "/api/ai-designer";

// Кнопка-аватар, панель чата и элементы внутри
const chatOpenBtn   = document.querySelector("[data-madera-chat-open]");
const chatCloseBtn  = document.querySelector("[data-madera-chat-close]");
const chatPanel     = document.querySelector("[data-madera-chat]");
const chatForm      = document.querySelector("[data-madera-chat-form]");
const chatInput     = document.querySelector("[data-madera-chat-input]");
const messagesEl    = document.querySelector("[data-madera-chat-messages]");
const statusEl      = document.querySelector("[data-madera-chat-status]");

// Если что-то не найдено — тихо выходим, чтобы не ломать страницу
if (!chatPanel || !chatForm || !chatInput || !messagesEl) {
  console.warn("[Madera Chat] Не найдены элементы чата в DOM");
}

// История сообщений (для возможного будущего использования)
const history = [];

// -----------------------------
// Утилита: добавление сообщений
// -----------------------------

function addMessage(role, text, options = {}) {
  const item = document.createElement("div");
  item.className = `madera-chat__message madera-chat__message--${role}`;

  const bubble = document.createElement("div");
  bubble.className = "madera-chat__bubble";
  bubble.textContent = text;

  item.appendChild(bubble);

  if (options.isError) {
    item.classList.add("madera-chat__message--error");
  }

  messagesEl.appendChild(item);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  // сохраняем в историю
  history.push({ role, content: text });
}

// -----------------------------
// Голосовой ответ (TTS)
// -----------------------------

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

// -----------------------------
// Отправка сообщения на backend
// -----------------------------

async function sendToAssistant(message) {
  statusEl.textContent = "Думаю над ответом…";

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message,
        history // на будущее — история диалога
      })
    });

    if (res.ok) {
      const data = await res.json();
      const reply = data.reply || data.text || "";

      if (reply) {
        return reply;
      }
    }

    // Если ответ не ok или пустой — перейдём к фолбэку
    console.warn("[Madera Chat] Нестандартный ответ API");
  } catch (e) {
    console.warn("API error, fallback to локальный ответ:", e);
  }

  // -----------------------------
  // Локальный фолбэк (если API упал)
  // -----------------------------
  const lower = message.toLowerCase();

  if (lower.includes("кухн")) {
    return "Могу помочь с планировкой кухни: уточните размер помещения, высоту потолка и где стоят окна/двери. Я предложу несколько вариантов размещения шкафов и техники.";
  }

  if (lower.includes("шкаф") || lower.includes("гардероб")) {
    return "По шкафу-купе или гардеробу: напишите ширину стены, высоту потолка и что именно хотите хранить (одежда, обувь, коробки), я предложу оптимальное наполнение.";
  }

  return "Я зафиксировал ваш запрос. Детализируйте, пожалуйста, размеры помещения и стиль, который вам нравится — так я смогу дать более точную рекомендацию.";
}

// -----------------------------
// Обработчики UI
// -----------------------------

// Открытие чата
if (chatOpenBtn) {
  chatOpenBtn.addEventListener("click", () => {
    chatPanel.classList.add("madera-chat--open");
    chatInput.focus();
  });
}

// Закрытие чата
if (chatCloseBtn) {
  chatCloseBtn.addEventListener("click", () => {
    chatPanel.classList.remove("madera-chat--open");
  });
}

// Отправка формы
if (chatForm) {
  chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const text = chatInput.value.trim();
    if (!text) return;

    // Добавляем сообщение пользователя
    addMessage("user", text);
    chatInput.value = "";
    statusEl.textContent = "Отправляю запрос…";

    // Получаем ответ ассистента
    const reply = await sendToAssistant(text);

    // Добавляем ответ ассистента
    addMessage("assistant", reply);
    statusEl.textContent = "Готова помочь. Голосовые и текстовые ответы доступны.";

    // Озвучиваем ответ
    speak(reply);
  });
}

// Можно добавить обработчик на кнопку голосового ввода, если позже подключим распознавание речи
// const voiceBtn = document.querySelector("[data-madera-chat-voice]");
// ...
