// chat.js
// Фронтенд-логика AI-дизайнера Madera

(function () {
  // ---------------------------------------------------------------------------
  // НАСТРОЙКИ AI-ДИЗАЙНЕРА (РОЛЬ, СТИЛЬ, ПОВЕДЕНИЕ)
  // ---------------------------------------------------------------------------
  const AI_DESIGNER_CONFIG = {
    systemPrompt: `
Ты — AI-дизайнер и менеджер по продажам компании Madera Design (Душанбе).

ТВОЯ РОЛЬ:
- Ты высококлассный интерьерный дизайнер международного уровня.
- Ты эксперт по дизайну мебели: кухни, гардеробные, спальни, детские, гостиные, прихожие.
- Ты профессиональный менеджер по продажам: мягко ведёшь к сделке, без давления, с уважением.

СТИЛЬ ОБЩЕНИЯ:
- Отвечай на русском языке.
- Пиши кратко, по делу, без "воды", но при этом дружелюбно и уважительно.
- Структурируй ответы: списки, короткие абзацы, понятные формулировки.
- На сложные темы делай 3–5 чётких пунктов, не длинное полотно текста.
- К клиенту обращайся вежливо, на "вы".

ПОВЕДЕНИЕ:
- Ты всегда представляешь интересы компании Madera Design.
- Говори от первого лица множественного числа: "мы реализуем", "мы рекомендуем", "в Madera Design мы...".
- Береги репутацию компании, корректно реагируй на любой негатив.
- Никогда не спорь с клиентом в грубой форме, не переходи на личности.

ПРОДАЖИ И МАРКЕТИНГ:
- Аккуратно подводи клиента к следующему шагу: замер, расчёт, встреча в шоуруме.
- Уточняй важные параметры: тип помещения, размеры, стиль, бюджет, сроки.
- Если клиент "только смотрит" — давай полезные советы и мягко предлагай сохранить контакт.
- Всегда помни про систему скидок Madera Design:
  - Мы принимаем заказы от 3 погонных метров и выше.
  - Если клиент заказывает напрямую через компанию — 5% скидка.
  - Если клиент использует промокод партнёра — 10% скидка, а партнёр получает 5% от суммы заказа.
- Если уместно, аккуратно напоминай про эти условия, но не в каждом сообщении.

ДИЗАЙН И ВИЗУАЛИЗАЦИИ:
- Ты умеешь предлагать планировочные решения и композиции мебели (словами).
- Если клиент описывает помещение или прикрепляет фото/план, уточни:
  - размеры,
  - высоту потолка,
  - расположение окон/дверей,
  - пожелания по стилю (минимализм, современный, неоклассика и т.д.),
  - бытовую технику, которую нужно встроить.
- Дальше давай конкретные идеи: где разместить кухню/шкаф, какие фасады, какой цвет, какая фурнитура.
- Если клиент просит оценить свой дизайн-проект — корректно разбери плюсы и минусы, предложи улучшения.

ОГРАНИЧЕНИЯ И ЭТИКЕТ:
- Если вопрос вне темы дизайна, мебели или работы компании — отвечай кратко и мягко возвращай диалог к интерьеру.
- Не давай юридических, медицинских или финансовых консультаций.
- Не критикуй конкурентов, говори только о преимуществах Madera Design.

ВАЖНО ПРО ДИАЛОГ:
- Поздоровайся красиво ТОЛЬКО в самом первом своём ответе в рамках одной переписки.
- Если в истории диалога уже есть твои ответы — НЕ начинай снова с "Здравствуйте" или длинного приветствия.
- В следующих сообщениях отвечай сразу по сути вопроса, без повторных приветствий.
`.trim(),
  };

  // ---------------------------------------------------------------------------
  // СОСТОЯНИЕ ЧАТА
  // ---------------------------------------------------------------------------
  const chatState = {
    isOpen: false,
    isRecording: false,
    messages: [], // { role: "user" | "assistant", text: string }
  };

  // ---------------------------------------------------------------------------
  // ПОМОЩНИКИ ДЛЯ DOM
  // ---------------------------------------------------------------------------
  function qs(selector) {
    return document.querySelector(selector);
  }

  function qsa(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  // ---------------------------------------------------------------------------
  // РАБОТА С СООБЩЕНИЯМИ В ИНТЕРФЕЙСЕ
  // ---------------------------------------------------------------------------
  function appendMessage(role, text) {
    const container = document.querySelector("[data-madera-chat-messages]");
    if (!container) return;

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
    container.appendChild(wrapper);

    container.scrollTop = container.scrollHeight;
  }

  function addToHistory(role, text) {
    chatState.messages.push({ role, text });
  }

  // Убираем повторяющиеся приветствия ассистента
  function normalizeAssistantReply(text) {
    if (!text) return text;
    const trimmed = text.trim();

    // Есть ли уже ответы ассистента в истории?
    const isFirstAssistant =
      !chatState.messages.some((m) => m.role === "assistant");

    // Для самого первого ответа — оставляем приветствие как есть
    if (isFirstAssistant) {
      return trimmed;
    }

    let t = trimmed;

    // 1) Удаляем первое приветственное предложение в начале текста
    //    Здравствуйте..., Привет..., Добрый день..., Доброе утро/вечер...
    const greetingSentenceRegex = new RegExp(
      String.raw`^(\s*(здравствуй(те)?|привет|добрый\s+(день|вечер|утро)|доброе\s+(утро|день|вечер))[^.!?]*[.!?])`,
      "i"
    );
    t = t.replace(greetingSentenceRegex, "").trimStart();

    // 2) Убираем фразы типа "Я рада/рад приветствовать вас..." в начале
    const welcomeSentenceRegex = /^(\s*(я\s+рад[а]?|рад[а]?\s+приветствовать)[^.!?]*[.!?])/i;
    t = t.replace(welcomeSentenceRegex, "").trimStart();

    // Если после обрезки всё исчезло, чтобы не показывать пустой ответ — вернём оригинальный текст
    if (!t) {
      return trimmed;
    }

    return t;
  }

  function setStatus(text) {
    const statusEl = document.querySelector("[data-madera-chat-status]");
    if (!statusEl) return;
    statusEl.textContent = text;
  }

  // ---------------------------------------------------------------------------
  // ОТКРЫТИЕ / ЗАКРЫТИЕ ЧАТА
  // ---------------------------------------------------------------------------
  function openChat() {
    const panel = document.querySelector("[data-madera-chat]");
    if (!panel) return;
    panel.classList.add("madera-chat--open");
    chatState.isOpen = true;
  }

  function closeChat() {
    const panel = document.querySelector("[data-madera-chat]");
    if (!panel) return;
    panel.classList.remove("madera-chat--open");
    chatState.isOpen = false;
  }

  // ---------------------------------------------------------------------------
  // ОТПРАВКА СООБЩЕНИЯ НА БЭКЕНД
  // ---------------------------------------------------------------------------
  async function sendMessageToServer(messageText) {
    try {
      const payload = {
        message: messageText,
        history: chatState.messages,
        systemPrompt: AI_DESIGNER_CONFIG.systemPrompt,
      };

      const response = await fetch("/api/ai-designer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error("AI_DESIGNER_HTTP_ERROR", response.status);
        return "Сейчас не получается связаться с AI-дизайнером. Попробуйте ещё раз чуть позже.";
      }

      const data = await response.json();
      const reply = data && (data.reply || data.answer || data.message);

      if (!reply || typeof reply !== "string") {
        return "Я получила пустой ответ от сервера. Давайте попробуем ещё раз или переформулируем вопрос.";
      }

      return reply;
    } catch (err) {
      console.error("AI_DESIGNER_NETWORK_ERROR", err);
      return "Похоже, есть временная проблема с подключением. Попробуйте ещё раз через минуту.";
    }
  }

  // ---------------------------------------------------------------------------
  // ОБРАБОТЧИК ОТПРАВКИ ФОРМЫ
  // ---------------------------------------------------------------------------
  async function handleFormSubmit(event) {
    event.preventDefault();

    const input = document.querySelector("[data-madera-chat-input]");
    if (!input) return;

    const raw = input.value || "";
    const messageText = raw.trim();
    if (!messageText) return;

    // Добавляем сообщение пользователя
    appendMessage("user", messageText);
    addToHistory("user", messageText);
    input.value = "";

    setStatus("Думаю над вашим запросом…");

    // Отключаем поля на время запроса
    const form = document.querySelector("[data-madera-chat-form]");
    const sendBtn = form?.querySelector(".madera-chat__send");
    const voiceBtn = form?.querySelector(".madera-chat__voice");

    if (input) input.disabled = true;
    if (sendBtn) sendBtn.disabled = true;
    if (voiceBtn) voiceBtn.disabled = true;

    try {
      const rawReply = await sendMessageToServer(messageText);
      const replyText = normalizeAssistantReply(rawReply);

      appendMessage("assistant", replyText);
      addToHistory("assistant", replyText);
      setStatus("Готова помочь с вашим следующим вопросом.");
    } catch (e) {
      console.error("CHAT_FRONT_ERROR", e);
      appendMessage(
        "assistant",
        "Произошла ошибка при обработке запроса. Попробуйте, пожалуйста, ещё раз."
      );
      setStatus("Возникла временная ошибка. Можно попробовать ещё раз.");
    } finally {
      if (input) input.disabled = false;
      if (sendBtn) sendBtn.disabled = false;
      if (voiceBtn) voiceBtn.disabled = false;
      input.focus();
    }
  }

  // ---------------------------------------------------------------------------
  // ГОЛОСОВОЙ ВВОД (ПОКА ПРОСТО ЗАГЛУШКА, БЕЗ ЛОМА)
  // ---------------------------------------------------------------------------
  function setupVoicePlaceholder() {
    const voiceBtn = document.querySelector("[data-madera-chat-voice]");
    if (!voiceBtn) return;

    voiceBtn.addEventListener("click", () => {
      // Здесь позже можно подключить Web Speech API или свой бэкенд для распознавания речи.
      alert(
        "Голосовой ввод пока в демо-режиме. Позже здесь появится полноценная запись и распознавание речи."
      );
    });
  }

  // ---------------------------------------------------------------------------
  // ИНИЦИАЛИЗАЦИЯ ЧАТА
  // ---------------------------------------------------------------------------
  function initChat() {
    const openBtn = document.querySelector("[data-madera-chat-open]");
    const closeBtn = document.querySelector("[data-madera-chat-close]");
    const form = document.querySelector("[data-madera-chat-form]");

    if (openBtn) {
      openBtn.addEventListener("click", () => {
        openChat();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        closeChat();
      });
    }

    if (form) {
      form.addEventListener("submit", handleFormSubmit);
    }

    setupVoicePlaceholder();

    // Стартовый статус
    setStatus("Готова помочь. Можно написать или задать вопрос голосом.");
  }

  document.addEventListener("DOMContentLoaded", initChat);
})();
