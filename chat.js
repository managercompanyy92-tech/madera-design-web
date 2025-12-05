  // chat.js
// Фронтенд-логика AI-дизайнера Madera Design

(function () {
  // ---------------- НАСТРОЙКИ AI-ДИЗАЙНЕРА (SYSTEM PROMPT) ------------------

  const AI_DESIGNER_SYSTEM_PROMPT = `

`.trim();

  // ------------------------ СОСТОЯНИЕ ЧАТА ------------------------

  const chatState = {
    messages: [], // { role: "user" | "assistant", text: string }
  };

  // ------------------------ ПОМОЩНИКИ DOM -------------------------

  function qs(selector) {
    return document.querySelector(selector);
  }

  function setStatus(text) {
    const el = qs("[data-madera-chat-status]");
    if (!el) return;
    el.textContent = text;
  }

  function appendMessage(role, text) {
    const container = qs("[data-madera-chat-messages]");
    if (!container) return;

    const wrapper = document.createElement("div");
    wrapper.classList.add("madera-chat__message");
    wrapper.classList.add(
      role === "user"
        ? "madera-chat__message--user"
        : "madera-chat__message--bot"
    );

    const bubble = document.createElement("div");
    bubble.classList.add("madera-chat__bubble");
    bubble.textContent = text;

    wrapper.appendChild(bubble);
    container.appendChild(wrapper);

    container.scrollTop = container.scrollHeight;
  }

  function addToHistory(role, text) {
    chatState.messages.push({ role, text });
  }

  // Рендер карточки с изображением
  function appendImageCard(url, promptText) {
    const container = qs("[data-madera-chat-messages]");
    if (!container) return;

    const wrapper = document.createElement("div");
    wrapper.classList.add("madera-chat__message", "madera-chat__message--bot");

    const card = document.createElement("div");
    card.classList.add("madera-image-card");
    card.innerHTML = `
      <div class="madera-image-card__title">Сгенерированная визуализация</div>
      <img src="${url}" alt="AI render" class="madera-image-card__img" />
      <div class="madera-image-card__prompt">${promptText}</div>
    `;

    wrapper.appendChild(card);
    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;
  }

  // -------- ЖЁСТКО УБИРАЕМ ПОВТОРНЫЕ ПРИВЕТСТВИЯ В ОТВЕТАХ --------

  function normalizeAssistantReply(text) {
    if (!text) return text;
    const trimmed = text.trim();
    if (!trimmed) return trimmed;

    let parts = trimmed
      .split(/(?<=[.!?])\s+|\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (parts.length === 0) return trimmed;

    function isGreetingSentence(sentence) {
      const s = sentence.toLowerCase();

      if (
        s.includes("здравствуйте") ||
        s.includes("здравствуй") ||
        s.includes("добрый день") ||
        s.includes("добрый вечер") ||
        s.includes("доброе утро") ||
        s.startsWith("привет") ||
        s.includes("приветствую")
      ) {
        return true;
      }

      if (
        s.includes("меня зовут") ||
        s.includes("я ваш ai") ||
        s.includes("я ваша ai") ||
        s.includes("я ваш дизайнер") ||
        s.includes("я ваша дизайнер") ||
        s.includes("я виртуальный дизайнер") ||
        s.includes("я виртуальный ассистент") ||
        s.includes("я – ai") ||
        s.includes("я — ai") ||
        s.includes("рада приветствовать") ||
        s.includes("рад приветствовать") ||
        s.includes("рад знакомству") ||
        s.includes("рада знакомству") ||
        s.includes("спасибо, что обратились") ||
        s.includes("спасибо что обратились")
      ) {
        return true;
      }

      return false;
    }

    if (parts.length === 1) {
      if (isGreetingSentence(parts[0])) {
        // единственное предложение — пусть останется,
        // иначе пользователь увидит пустой ответ
        return trimmed;
      }
      return trimmed;
    }

    const filtered = parts.filter((p) => !isGreetingSentence(p));
    if (filtered.length === 0) return trimmed;

    return filtered.join(" ").trim();
  }

  // ----------------- ОТПРАВКА СООБЩЕНИЯ НА БЭКЕНД -----------------

  async function sendMessageToServer(messageText) {
    try {
      const payload = {
        message: messageText,
        history: chatState.messages,
        systemPrompt: AI_DESIGNER_SYSTEM_PROMPT,
      };

      const response = await fetch("/api/ai-designer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let data = null;
      try {
        data = await response.json();
      } catch (parseErr) {
        console.error("AI_DESIGNER_FRONT_PARSE_ERROR", parseErr);
      }

      console.log("AI_DESIGNER_FRONT_RESPONSE", data);

      if (data && typeof data.reply === "string" && data.reply.trim().length) {
        return data.reply.trim();
      }

      if (data && typeof data.error === "string" && data.error.trim().length) {
        return data.error.trim();
      }

      return "Не получилось получить ответ от AI-дизайнера. Попробуйте ещё раз.";
    } catch (err) {
      console.error("AI_DESIGNER_FRONT_NETWORK_ERROR", err);
      return "Похоже, есть временная проблема с соединением. Попробуйте ещё раз чуть позже.";
    }
  }

  // -------------------- AI IMAGE GENERATION LAYER ------------------

  const AI_IMAGE_TRIGGER_WORDS = [
    "визуализа",
    "картин",
    "изображен",
    "3d",
    "рендер",
    "render",
    "сгенерируй",
    "покажи дизайн",
    "покажи идею",
    "interior",
    "дизайн комнаты",
    "композицию",
    "интерьер",
  ];

  function shouldGenerateImage(text) {
    const t = text.toLowerCase();
    return AI_IMAGE_TRIGGER_WORDS.some((w) => t.includes(w));
  }

  async function processAiRequest(userMessage) {
    // Если похоже на запрос визуализации — идём в /api/ai-image
    if (shouldGenerateImage(userMessage)) {
      appendMessage(
        "assistant",
        "Готовим визуализацию по вашему описанию, пожалуйста, подождите…"
      );

      try {
        const response = await fetch("/api/ai-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: userMessage }),
        });

        const data = await response.json();

        if (data?.imageUrl) {
          appendImageCard(data.imageUrl, userMessage);
        } else {
          appendMessage(
            "assistant",
            "Не удалось получить изображение. Попробуйте описать задачу чуть подробнее."
          );
        }
      } catch (err) {
        console.error("AI_IMAGE_FRONT_ERROR", err);
        appendMessage(
          "assistant",
          "Ошибка генерации изображения. Попробуйте позже."
        );
      }

      return;
    }

    // Обычный текстовый запрос к AI-дизайнеру
    setStatus("Думаем над вашим запросом…");
    const rawReply = await sendMessageToServer(userMessage);
    const replyText = normalizeAssistantReply(rawReply);
    appendMessage("assistant", replyText);
    addToHistory("assistant", replyText);
    setStatus("Готова помочь с вашим следующим вопросом.");
  }

  // ------------------ ГОЛОСОВОЙ ВВОД (ПОКА ДЕМО) -------------------

  function setupVoicePlaceholder() {
    const voiceBtn = qs("[data-madera-chat-voice]");
    if (!voiceBtn) return;

    voiceBtn.addEventListener("click", () => {
      alert(
        "Голосовой ввод пока в демо-режиме. Позже здесь появится полноценная запись и распознавание речи."
      );
    });
  }

  // ---------------- QUICK STYLE BUTTONS + SMART HINTS --------------

  function initMaderaChatExtras() {
    const form = qs("[data-madera-chat-form]");
    if (!form || !form.parentElement) return;

    // ---------- БЫСТРЫЙ ВЫБОР СТИЛЯ ----------
    const styleBlock = document.createElement("div");
    styleBlock.classList.add("madera-style-quick");
    styleBlock.innerHTML = `
      <div class="madera-style-quick__title">Быстрый выбор стиля</div>
      <div class="madera-style-quick__row">
        <button class="madera-style-btn" data-style="современный минимализм">Минимализм</button>
        <button class="madera-style-btn" data-style="современный дизайн">Современный</button>
        <button class="madera-style-btn" data-style="лофт стиль с текстурами">Лофт</button>
        <button class="madera-style-btn" data-style="скандинавский тёплый интерьер">Сканди</button>
        <button class="madera-style-btn" data-style="премиальный интерьер в стиле Madera Design">Премиум</button>
      </div>
    `;

    // ---------- УМНЫЕ ПОДСКАЗКИ (HINTS) ----------
    const hintsBlock = document.createElement("div");
    hintsBlock.classList.add("madera-hints");
    hintsBlock.innerHTML = `
      <div class="madera-hints__title">Попробуйте спросить</div>
      <div class="madera-hints__row">
        <button class="madera-hint-btn" data-hint="Подбери идею кухни 4,5 метра под мой стиль и бюджет.">
          Идея кухни 4,5 м
        </button>
        <button class="madera-hint-btn" data-hint="Оцени планировку моей будущей гардеробной и предложи улучшения.">
          Гардеробная с улучшениями
        </button>
        <button class="madera-hint-btn" data-hint="Сделай концепцию гостиной в стиле премиум под наш бренд.">
          Премиум гостиная
        </button>
      </div>
    `;

    // Вставляем блоки перед и сразу после формы
    form.parentElement.insertBefore(styleBlock, form);
    form.parentElement.insertBefore(hintsBlock, form.nextSibling);
  }

  async function handleQuickStyleClick(style) {
    const userPhrase = "Хочу дизайн в стиле: " + style;

    appendMessage("user", userPhrase);
    addToHistory("user", userPhrase);
    setStatus("Думаем над вариантом в этом стиле…");

    const rawReply = await sendMessageToServer(
      `Клиент хочет интерьер в стиле: ${style}.
Сделай 3–5 конкретных идей: композиция мебели, материалы, цвета, фурнитура.
Пиши кратко, структурированно, как профессиональный дизайнер и менеджер по продажам Madera Design.`
    );

    const replyText = normalizeAssistantReply(rawReply);
    appendMessage("assistant", replyText);
    addToHistory("assistant", replyText);
    setStatus("Готова помочь с вашим следующим вопросом.");
  }

  async function handleHintClick(promptText) {
    appendMessage("user", promptText);
    addToHistory("user", promptText);
    setStatus("Обрабатываем ваш запрос…");

    const rawReply = await sendMessageToServer(
      `${promptText}
Учитывай фирменный стиль и политику компании Madera Design.
Отвечай кратко, структурированно, с мягким подведением к заказу.`
    );

    const replyText = normalizeAssistantReply(rawReply);
    appendMessage("assistant", replyText);
    addToHistory("assistant", replyText);
    setStatus("Готова помочь с вашим следующим вопросом.");
  }

  function setupExtrasClickHandlers() {
    document.body.addEventListener("click", async (e) => {
      const styleBtn = e.target.closest(".madera-style-btn");
      if (styleBtn) {
        const style = styleBtn.getAttribute("data-style");
        if (style) {
          await handleQuickStyleClick(style);
        }
        return;
      }

      const hintBtn = e.target.closest(".madera-hint-btn");
      if (hintBtn) {
        const hint = hintBtn.getAttribute("data-hint");
        if (hint) {
          await handleHintClick(hint);
        }
        return;
      }
    });
  }

  // ---------------------- ОТКРЫТИЕ / ЗАКРЫТИЕ ----------------------

  function openChatPanel() {
    const panel = qs("[data-madera-chat]");
    if (!panel) return;
    panel.classList.add("madera-chat--open");
  }

  function closeChatPanel() {
    const panel = qs("[data-madera-chat]");
    if (!panel) return;
    panel.classList.remove("madera-chat--open");
  }

  // --------------------------- ИНИЦИАЛИЗАЦИЯ -----------------------

  function initChat() {
    const openBtn = qs("[data-madera-chat-open]");
    const closeBtn = qs("[data-madera-chat-close]");
    const form = qs("[data-madera-chat-form]");
    const input = qs("[data-madera-chat-input]");

    if (openBtn) {
      openBtn.addEventListener("click", (e) => {
        e.preventDefault();
        openChatPanel();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        closeChatPanel();
      });
    }

    if (form && input) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const text = input.value.trim();
        if (!text) return;

        appendMessage("user", text);
        addToHistory("user", text);

        input.value = "";
        input.focus();

        await processAiRequest(text);
      });
    }

    setupVoicePlaceholder();
    initMaderaChatExtras();
    setupExtrasClickHandlers();

    setStatus(
      "Готова помочь. Напишите вопрос о дизайне мебели или интерьера."
    );
  }

  document.addEventListener("DOMContentLoaded", initChat);
})();
