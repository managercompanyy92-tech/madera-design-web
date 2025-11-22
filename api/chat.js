// chat.js — логика AI-ассистента Madera

document.addEventListener("DOMContentLoaded", () => {
  // ================== КОНФИГ ==================
  // URL серверной функции на Vercel (api/chat.js)
  const API_URL = "/api/chat";

  // Функция, которая пытается найти элемент по нескольким вариантам
  function $multi(selectors) {
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  // ================== ПОИСК ЭЛЕМЕНТОВ ==================
  // Кнопка открытия виджета (кнопка "AI-ассистент")
  const openButton = $multi([
    "[data-ai-open]",
    "[data-chat-open]",
    ".ai-assistant-open",
    "#ai-assistant-open",
    "#ai-assistant-button"
  ]);

  // Контейнер виджета (вся карточка чата)
  const widget = $multi([
    "[data-ai-widget]",
    "[data-chat-widget]",
    ".ai-assistant-widget",
    "#ai-assistant-widget",
    "#ai-widget"
  ]);

  // Кнопка закрытия (крестик)
  const closeButton = widget
    ? widget.querySelector("[data-ai-close], [data-chat-close], .ai-assistant-close, #ai-assistant-close")
    : null;

  // Контейнер сообщений
  const messages = widget
    ? widget.querySelector("[data-ai-messages], [data-chat-messages], .ai-assistant-messages, #ai-assistant-messages")
    : null;

  // Форма ввода
  const form = widget
    ? widget.querySelector("[data-ai-form], [data-chat-form], .ai-assistant-form, #ai-assistant-form, form")
    : null;

  // Поле ввода текста
  const input = widget
    ? widget.querySelector("[data-ai-input], [data-chat-input], .ai-assistant-input, #ai-assistant-input, input[type='text'], textarea")
    : null;

  console.log("AI-ассистент: элементы UI", {
    openButton,
    widget,
    closeButton,
    messages,
    form,
    input
  });

  // Если чего-то критически не хватает — выходим
  if (!widget || !messages || !form || !input) {
    console.warn(
      "AI-ассистент: не могу инициализировать чат — отсутствуют обязательные элементы.\n" +
        "Убедись, что в HTML у блока чата есть атрибуты:\n" +
        "data-ai-widget, data-ai-messages, data-ai-form, data-ai-input\n" +
        "или соответствующие классы/ID."
    );
    return;
  }

  // ================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==================

  function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
  }

  function createMessageElement(text, role) {
    const el = document.createElement("div");
    el.classList.add("ai-message", `ai-message--${role}`);
    el.textContent = text;
    return el;
  }

  function addMessage(text, role) {
    const el = createMessageElement(text, role);
    messages.appendChild(el);
    scrollToBottom();
    return el;
  }

  function replaceMessage(tempEl, text, role) {
    if (!tempEl) {
      addMessage(text, role);
      return;
    }
    tempEl.className = "";
    tempEl.classList.add("ai-message", `ai-message--${role}`);
    tempEl.textContent = text;
    scrollToBottom();
  }

  function setInputDisabled(disabled) {
    input.disabled = disabled;
  }

  // ================== ОТПРАВКА В BACKEND ==================

  async function sendMessageToAssistant(rawText) {
    const text = (rawText || "").trim();
    if (!text) return;

    console.log("AI-ассистент: отправляю сообщение в API:", text);

    // 1. Добавляем сообщение пользователя
    addMessage(text, "user");
    input.value = "";

    // 2. Ставим заглушку "думаю"
    setInputDisabled(true);
    const thinkingEl = addMessage("Ассистент думает…", "assistant");

    // Текст по умолчанию (на случай ошибок)
    let finalText =
      "Спасибо за вопрос! Сейчас AI-ассистент в демо-режиме. " +
      "Менеджер свяжется с вами после отправки заявки в разделе «Заказ».";

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: text })
      });

      console.log("AI-ассистент: ответ API статус", response.status);

      if (!response.ok) {
        console.error("AI-ассистент: ошибка ответа API", response.status);
      } else {
        const data = await response.json();
        console.log("AI-ассистент: тело ответа API", data);

        if (data && typeof data.reply === "string" && data.reply.trim()) {
          finalText = data.reply.trim();
        } else {
          console.warn(
            "AI-ассистент: в ответе API нет поля reply, использую текст по умолчанию."
          );
        }
      }
    } catch (error) {
      console.error("AI-ассистент: ошибка сети / запроса", error);
      finalText =
        "Не удалось получить ответ от AI-ассистента. " +
        "Проверьте подключение к интернету и попробуйте ещё раз, " +
        "либо оставьте заявку в разделе «Заказ».";
    } finally {
      replaceMessage(thinkingEl, finalText, "assistant");
      setInputDisabled(false);
      input.focus();
    }
  }

  // ================== ОБРАБОТЧИКИ UI ==================

  // Открытие виджета
  if (openButton) {
    openButton.addEventListener("click", () => {
      widget.classList.add("ai-widget--open");
      input.focus();
      console.log("AI-ассистент: виджет ОТКРЫТ");
    });
  } else {
    console.warn(
      "AI-ассистент: кнопка открытия не найдена. " +
        "Добавь элемент с data-ai-open или классом .ai-assistant-open."
    );
  }

  // Закрытие виджета
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      widget.classList.remove("ai-widget--open");
      console.log("AI-ассистент: виджет ЗАКРЫТ");
    });
  }

  // Отправка по submit формы (кнопка «Отправить»)
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (input.disabled) return;
    sendMessageToAssistant(input.value);
  });

  // Отправка по Enter (без Shift)
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.disabled) return;
      sendMessageToAssistant(input.value);
    }
  });

  console.log("AI-ассистент Madera: chat.js успешно инициализирован");
});
