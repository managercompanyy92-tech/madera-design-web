(function () {
  const panel = document.getElementById("ai-panel");
  const toggleBtn = document.getElementById("ai-toggle");
  const closeBtn = document.getElementById("ai-close");
  const input = document.getElementById("ai-input");
  const sendBtn = document.getElementById("ai-send");
  const messagesBox = document.getElementById("ai-messages");

  if (!panel || !toggleBtn || !closeBtn || !input || !sendBtn) return;

  const TEXT_API = "/api/ai-designer"; 
  const IMAGE_API = "/api/ai-image";

  let history = [];


  // ---------- Открытие / закрытие чата ----------
  function openChat() {
    panel.classList.add("ai-open");
    input.focus();
  }

  function closeChat() {
    panel.classList.remove("ai-open");
  }

  toggleBtn.addEventListener("click", openChat);
  closeBtn.addEventListener("click", closeChat);


  // ---------- Добавление текстового сообщения ----------
  function addMessage(role, text) {
    const row = document.createElement("div");
    row.className = `ai-msg ai-${role}`;
    row.textContent = text;
    messagesBox.appendChild(row);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }


  // ---------- Добавление изображения ----------
  function addImage(url, captionText) {
    const wrapper = document.createElement("div");
    wrapper.className = "ai-msg ai-assistant ai-image-wrapper";

    const img = document.createElement("img");
    img.src = url;
    img.className = "ai-image";

    const caption = document.createElement("div");
    caption.className = "ai-caption";
    caption.textContent = captionText || "Вариант визуализации";

    wrapper.appendChild(img);
    wrapper.appendChild(caption);

    messagesBox.appendChild(wrapper);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }



  // ---------- Определяем, просит ли пользователь картинку ----------
  function needImage(text) {
    const keywords = [
      "визуал",
      "визуализация",
      "сделай дизайн",
      "покажи",
      "покажи вариант",
      "картинку",
      "фото",
      "как будет выглядеть",
      "ультрареалистичный",
      "реалистичный дизайн",
      "сгенерируй"
    ];
    return keywords.some(k => text.toLowerCase().includes(k));
  }


  // ---------- Генерация промпта для изображения ----------
  function buildImagePrompt(userText) {
    return `
Создай ультрареалистичный интерьер мебели по запросу клиента.
Описание клиента: ${userText}

Стиль, материалы, цвет и конфигурация должны быть логичны, современные и премиальные.
Освещение реалистичное. Акцент на деталях. Без людей.
`.trim();
  }


  // ---------- Отправка сообщения ----------
  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessage("user", text);
    history.push({ role: "user", content: text });

    input.value = "";
    sendBtn.disabled = true;

    const reqImage = needImage(text);

    try {
      let response;

      if (reqImage) {
        // ОТПРАВЛЯЕМ НА ГЕНЕРАЦИЮ КАРТИНКИ
        const prompt = buildImagePrompt(text);

        response = await fetch(IMAGE_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });

        const data = await response.json();

        if (data.type === "image") {
          addImage(data.url, data.text);
        } else {
          addMessage("assistant", "Не удалось создать изображение.");
        }

      } else {
        // ОТПРАВЛЯЕМ НА ТЕКСТОВУЮ ЛОГИКУ
        response = await fetch(TEXT_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });

        const data = await response.json();

        addMessage("assistant", data.reply);
        history.push({ role: "assistant", content: data.reply });
      }

    } catch (error) {
      console.error(error);
      addMessage("assistant", "Ошибка соединения. Попробуйте позже.");
    }

    sendBtn.disabled = false;
  }


  sendBtn.addEventListener("click", sendMessage);

  // Отправка по Enter
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });

})();
