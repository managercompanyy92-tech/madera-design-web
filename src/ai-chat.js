// src/ai-chat.js

(function () {
  const toggleBtn = document.getElementById("aiChatToggle");
  const panel = document.getElementById("aiChatPanel");
  const closeBtn = document.getElementById("aiChatClose");
  const input = document.getElementById("aiChatInput");
  const sendBtn = document.getElementById("aiChatSend");
  const messagesBox = document.getElementById("aiChatMessages");

  if (!toggleBtn || !panel || !input || !sendBtn || !messagesBox) {
    return;
  }

  const API_URL = "/api/chat"; // Поменяй на свой реальный endpoint
  const history = [];

  function openChat() {
    panel.classList.add("ai-chat-panel--open");
    panel.setAttribute("aria-hidden", "false");
    input.focus();
  }

  function closeChat() {
    panel.classList.remove("ai-chat-panel--open");
    panel.setAttribute("aria-hidden", "true");
  }

  function appendMessage(role, text) {
    const msgEl = document.createElement("div");
    msgEl.className =
      "ai-chat-msg " + (role === "user" ? "ai-chat-msg--user" : "ai-chat-msg--bot");
    const textEl = document.createElement("div");
    textEl.className = "ai-chat-msg__text";
    textEl.textContent = text;
    msgEl.appendChild(textEl);
    messagesBox.appendChild(msgEl);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  async function sendMessage() {
    const text = (input.value || "").trim();
    if (!text) return;

    appendMessage("user", text);
    history.push({ role: "user", content: text });
    input.value = "";
    input.focus();

    sendBtn.disabled = true;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          history,
        }),
      });

      if (!res.ok) {
        throw new Error("Bad response: " + res.status);
      }

      const data = await res.json();
      const answer = data?.reply || data?.answer || data?.message;

      const botText =
        typeof answer === "string" && answer.trim()
          ? answer.trim()
          : "Спасибо за вопрос! Сейчас AI-ассистент в демо-режиме. Менеджер свяжется с вами после отправки заявки в разделе «Заказ».";

      appendMessage("assistant", botText);
      history.push({ role: "assistant", content: botText });
    } catch (e) {
      console.error(e);
      appendMessage(
        "assistant",
        "Извините, сейчас не получается получить ответ от сервера. Попробуйте ещё раз чуть позже или оставьте заявку в разделе «Заказ»."
      );
    } finally {
      sendBtn.disabled = false;
    }
  }

  // Открытие/закрытие по клику
  toggleBtn.addEventListener("click", () => {
    const isOpen = panel.classList.contains("ai-chat-panel--open");
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  });

  closeBtn.addEventListener("click", closeChat);

  // Отправка по кнопке
  sendBtn.addEventListener("click", sendMessage);

  // Enter для отправки
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  });

  // Простое открытие свайпом вверх (на мобильных)
  let startY = null;

  window.addEventListener(
    "touchstart",
    (e) => {
      const touch = e.touches[0];
      startY = touch.clientY;
    },
    { passive: true }
  );

  window.addEventListener(
    "touchend",
    (e) => {
      if (startY == null) return;
      const touch = e.changedTouches[0];
      const deltaY = startY - touch.clientY;

      // если человек сделал свайп вверх с нижней части экрана — открываем чат
      if (deltaY > 60 && startY > window.innerHeight - 140) {
        openChat();
      }
      startY = null;
    },
    { passive: true }
  );
})();
