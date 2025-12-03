// src/ai-chat.js
(function () {
  const panel = document.getElementById("ai-panel");
  const toggleBtn = document.getElementById("ai-toggle");
  const closeBtn = document.getElementById("ai-close");
  const input = document.getElementById("ai-input");
  const sendBtn = document.getElementById("ai-send");
  const messagesBox = document.getElementById("ai-messages");

  // Если нужных элементов нет на странице — спокойно выходим
  if (!panel || !toggleBtn || !closeBtn || !input || !sendBtn || !messagesBox) {
    return;
  }

  const API_URL = "/api/ai-designer";
  let history = [];

  // 🔥 Прячем старый встроенный чат по тексту "Быстрый выбор стиля"
  function hideLegacyChat() {
    try {
      const allNodes = Array.from(document.querySelectorAll("*"));
      const legacyLabel = allNodes.find((el) =>
        el.textContent && el.textContent.includes("Быстрый выбор стиля")
      );

      if (legacyLabel) {
        const container = legacyLabel.closest("section, div, form, .block");
        if (container) {
          container.style.display = "none";
        }
      }
    } catch (e) {
      console.error("Не удалось спрятать старый чат:", e);
    }
  }

  // Открытие / закрытие
  function openChat() {
    panel.classList.add("ai-open");
    input.focus();
  }

  function closeChat() {
    panel.classList.remove("ai-open");
  }

  toggleBtn.addEventListener("click", openChat);
  closeBtn.addEventListener("click", closeChat);

  // Добавление текстового сообщения
  function addMessage(role, text) {
    const row = document.createElement("div");
    row.className = `ai-msg ai-${role}`;
    row.textContent = text;
    messagesBox.appendChild(row);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  // Определяем, просит ли человек дизайн-картинку
  function detectImageRequest(text) {
    const keywords = [
      "визуал",
      "дизайн",
      "картинку",
      "фото",
      "покажи вариант",
      "сгенерируй",
      "ультрареалистичный",
      "реалистичный",
      "визуализацию",
      "оформи дизайн",
      "сделай дизайн",
      "как будет выглядеть",
    ];

    const lower = text.toLowerCase();
    return keywords.some((k) => lower.includes(k));
  }

  // Отправка сообщения
  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessage("user", text);
    history.push({ role: "user", content: text });
    input.value = "";
    sendBtn.disabled = true;

    const isImageRequest = detectImageRequest(text);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          imageRequest: isImageRequest,
        }),
      });

      const data = await res.json();

      if (data.type === "image") {
        // Пока только текст, но оставляем на будущее
        addMessage(
          "assistant",
          "Подготовлю визуализацию по вашему запросу. Сейчас опишу идею словами."
        );
        history.push({
          role: "assistant",
          content: "Подготовлю визуализацию по вашему запросу.",
        });
      } else {
        addMessage("assistant", data.text || "Готово, чем ещё помочь?");
        history.push({
          role: "assistant",
          content: data.text || "",
        });
      }
    } catch (e) {
      console.error(e);
      addMessage(
        "assistant",
        "Извините, сервис временно недоступен. Попробуйте ещё раз чуть позже."
      );
    } finally {
      sendBtn.disabled = false;
    }
  }

  sendBtn.addEventListener("click", sendMessage);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });

  // Запускаем скрытие старого чата после загрузки страницы
  if (document.readyState === "complete" || document.readyState === "interactive") {
    hideLegacyChat();
  } else {
    document.addEventListener("DOMContentLoaded", hideLegacyChat);
  }
})();
