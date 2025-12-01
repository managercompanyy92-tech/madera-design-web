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

- Нужно поздороваться красиво только один раз в самом первом ответе.

- Но мы дополнительно удаляем из ответов формальные приветствия вроде "Здравствуйте" / "Добрый день" / "Меня зовут..." и т.п., чтобы в интерфейсе клиент сразу видел суть ответа.

`.trim(),

  };


  // ---------------------------------------------------------------------------

  // СОСТОЯНИЕ ЧАТА

  // ---------------------------------------------------------------------------

  const chatState = {

    messages: [], // { role: "user" | "assistant", text: string }

  };


  // ---------------------------------------------------------------------------

  // ПОМОЩНИКИ ДЛЯ DOM

  // ---------------------------------------------------------------------------

  function qs(selector) {

    return document.querySelector(selector);

  }


  function setStatus(text) {

    const statusEl = qs("[data-madera-chat-status]");

    if (!statusEl) return;

    statusEl.textContent = text;

  }


  // ---------------------------------------------------------------------------

  // РАБОТА С СООБЩЕНИЯМИ В ИНТЕРФЕЙСЕ

  // ---------------------------------------------------------------------------

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


  // ---------------------------------------------------------------------------

  // ЖЁСТКАЯ ОЧИСТКА ПОВТОРНЫХ ПРИВЕТСТВИЙ

  // ---------------------------------------------------------------------------

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

        return trimmed;

      }

      return trimmed;

    }


    const filtered = parts.filter((p) => !isGreetingSentence(p));


    if (filtered.length === 0) {

      return trimmed;

    }


    return filtered.join(" ").trim();

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

  // ОБРАБОТЧИК ОТПРАВКИ ФОРМЫ МАЛЕНЬКОГО ЧАТА (ЕСЛИ ИСПОЛЬЗУЕТСЯ)

  // ---------------------------------------------------------------------------

  async function handleFormSubmit(event) {

    event.preventDefault();


    const input = qs("[data-madera-chat-input]");

    if (!input) return;


    const raw = input.value || "";

    const messageText = raw.trim();

    if (!messageText) return;


    appendMessage("user", messageText);

    addToHistory("user", messageText);

    input.value = "";


    setStatus("Думаем над вашим запросом…");


    const form = qs("[data-madera-chat-form]");

    const sendBtn = form?.querySelector(".madera-chat__send");

    const voiceBtn = form?.querySelector(".madera-chat__voice");


    input.disabled = true;

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

      input.disabled = false;

      if (sendBtn) sendBtn.disabled = false;

      if (voiceBtn) voiceBtn.disabled = false;

      input.focus();

    }

  }


  // ---------------------------------------------------------------------------

  // ГОЛОСОВОЙ ВВОД (ПОКА ЗАГЛУШКА)

  // ---------------------------------------------------------------------------

  function setupVoicePlaceholder() {

    const voiceBtn = qs("[data-madera-chat-voice]");

    if (!voiceBtn) return;


    voiceBtn.addEventListener("click", () => {

      alert(

        "Голосовой ввод пока в демо-режиме. Позже здесь появится полноценная запись и распознавание речи."

      );

    });

  }


  // ---------------------------------------------------------------------------

  // ИНИЦИАЛИЗАЦИЯ

  // ---------------------------------------------------------------------------

  function initChat() {

    const openBtn = qs("[data-madera-chat-open]");

    const closeBtn = qs("[data-madera-chat-close]");

    const form = qs("[data-madera-chat-form]");

    const chatPanel = qs("[data-madera-chat]");


    // БЛОК AI-ДИЗАЙНЕРА, КУДА НАДО СКРОЛЛИТЬ

    const aiDesignerSection = qs("[data-ai-designer]");

    const aiDesignerInput = aiDesignerSection

      ? aiDesignerSection.querySelector("[data-ai-designer-input]")

      : null;


    // 1) КНОПКА-КРУЖОК AI-ASSISTANT MADERA

    if (openBtn) {

      openBtn.addEventListener("click", (event) => {

        event.preventDefault();

        event.stopPropagation();


        // Всегда только скроллим к блоку AI-дизайнера

        if (aiDesignerSection) {

          aiDesignerSection.scrollIntoView({

            behavior: "smooth",

            block: "start",

          });


          if (aiDesignerInput) {

            setTimeout(() => {

              aiDesignerInput.focus();

            }, 400);

          }

        }

      });

    }


    // 2) КНОПКА ЗАКРЫТИЯ МАЛЕНЬКОГО ЧАТА (если он вообще используется)

    if (closeBtn && chatPanel) {

      closeBtn.addEventListener("click", (event) => {

        event.preventDefault();

        chatPanel.classList.remove("madera-chat--open");

      });

    }


    // 3) ОТПРАВКА СООБЩЕНИЙ В МАЛЕНЬКОМ ЧАТЕ

    if (form) {

      form.addEventListener("submit", handleFormSubmit);

    }


    setupVoicePlaceholder();


    setStatus(

      "Готова помочь. Можно написать вопрос или воспользоваться AI-дизайнером на странице."

    );

  }


  document.addEventListener("DOMContentLoaded", initChat);

})();
// -------------------------------------------------------------
// ГЛОБАЛЬНАЯ ФУНКЦИЯ: перейти в каталог → найти AI-дизайнера → фокус
// -------------------------------------------------------------
function goToAIDesigner() {
  // 1. Переключаем SPA на маршрут "catalog"
  window.location.hash = "catalog";

  // 2. Задержка — ждём рендер SPA
  setTimeout(() => {
    // Находим блок AI-дизайнера
    const section = document.querySelector('[data-ai-designer]');
    const input = document.querySelector('[data-ai-designer-input]');

    if (section) {
      // Плавная прокрутка к блоку
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    // 3. Ещё небольшая задержка — даём странице докрутиться
    setTimeout(() => {
      if (input) input.focus();
    }, 400);

  }, 300);
}


// -------------------------------------------------------------
// ПРИКРЕПЛЯЕМ ФУНКЦИЮ К АВАТАРКЕ
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const avatar = document.querySelector('[data-madera-chat-open]');
  if (avatar) {
    avatar.addEventListener('click', (e) => {
      e.preventDefault();
      goToAIDesigner();
    });
  }
});
