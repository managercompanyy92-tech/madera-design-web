(function () {
  const panel = document.getElementById("aiChatPanel");
  const toggleBtn = document.getElementById("aiChatToggle");
  const closeBtn = document.getElementById("aiChatClose");
  const input = document.getElementById("aiChatInput");
  const sendBtn = document.getElementById("aiChatSend");
  const messagesBox = document.getElementById("aiChatMessages");

  if (!panel || !toggleBtn || !input || !sendBtn) return;

  const API_URL = "/api/ai-designer";

  let history = [];

  // Открытие чата
  function openChat() {
    panel.classList.add("ai-open");
    input.focus();
  }

  // Закрытие чата
  function closeChat() {
    panel.classList.remove("ai-open");
  }

  toggleBtn.addEventListener("click", openChat);
  closeBtn.addEventListener("click", closeChat);

  // Добавление текста в чат
  function addMessage(role, text) {
    const row = document.createElement("div");
    row.className = `ai-msg ai-${role}`;
    row.textContent = text;
    messagesBox.appendChild(row);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  // Добавление картинки
  function addImage(url, text) {
    const wrapper = document.createElement("div");
    wrapper.className = "ai-msg ai-assistant";

    const img = document.createElement("img");
    img.src = url;
    img.className = "ai-image";

    const caption = document.createElement("div");
    caption.className = "ai-caption";
    caption.textContent = text || "Визуализация готова.";

    wrapper.appendChild(img);
    wrapper.appendChild(caption);

    messagesBox.appendChild(wrapper);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  // Определяем, просит ли человек дизайн
  function detectImageRequest(text) {
    const keywords = [
      "визуал",
      "дизайн",
      "картинку",
      "фото",
      "покажи вариант",
      "сгенерируй",
      "ултрареалистичный",
      "реалистичный",
      "визуализацию",
      "оформи дизайн",
      "сделай дизайн",
      "как будет выглядеть"
    ];

    return keywords.some((k) => text.toLowerCase().includes(k));
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
          imageRequest: isImageRequest ? text : null,
        }),
      });

      const data = await res.json();

      if (data.type === "image") {
        addImage(data.url, data.text);
        history.push({ role: "assistant", content: "[IMAGE GENERATED]" });
      } else {
        addMessage("assistant", data.text);
        history.push({ role: "assistant", content: data.text });
      }
    } catch (e) {
      console.error(e);
      addMessage(
        "assistant",
        "Извините, сервис временно недоступен. Попробуйте чуть позже."
      );
    }

    sendBtn.disabled = false;
  }

  sendBtn.addEventListener("click", sendMessage);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });
})();
