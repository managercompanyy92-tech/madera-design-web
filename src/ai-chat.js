// src/ai-chat.js
// Фронтенд-логика чата AI-дизайнера Madera Design

(function () {
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

      // 1. Нормальный ответ от бэкенда
      if (data && typeof data.reply === "string" && data.reply.trim().length > 0) {
        return data.reply.trim();
      }

      // 2. Бэкенд вернул error
      if (data && typeof data.error === "string" && data.error.trim().length > 0) {
        return data.error.trim();
      }

      // 3. Нечто странное
      return "Не получилось получить ответ от AI-дизайнера. Попробуйте ещё раз.";
    } catch (err) {
      console.error("AI_DESIGNER_FRONT_NETWORK_ERROR", err);
      return "Похоже, есть временная проблема c соединением. Попробуйте ещё раз чуть позже.";
    }
  }

  // ---------------------------------------------------------------------------
  // ОБРАБОТЧИК ОТПРАВКИ ФОРМЫ
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

    // 1) КНОПКА-КРУЖОК AI-ASSISTANT MADERA (скроллит к блоку AI-дизайнера)
    if (openBtn) {
      openBtn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

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
