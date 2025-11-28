// chat.js
// Лаунчер круглой кнопки "AI-assistant Madera" -> AI-дизайнер

(function () {
  function initChatLauncher() {
    // Круглая кнопка в правом нижнем углу
    const openBtn = document.querySelector("[data-madera-chat-open]");
    if (!openBtn) return;

    openBtn.addEventListener("click", (event) => {
      event.preventDefault();

      // Если на странице уже есть функции AI-дизайнера — используем их
      if (typeof window.openAiDesignerChat === "function") {
        window.openAiDesignerChat();
        return;
      }

      // Если окно ещё не инициализировано, но есть init-функция — сначала создаём, потом открываем
      if (typeof window.initAiDesignerChat === "function") {
        window.initAiDesignerChat();

        if (typeof window.openAiDesignerChat === "function") {
          window.openAiDesignerChat();
        } else {
          console.warn(
            "AI-дизайнер инициализирован, но функция openAiDesignerChat не найдена."
          );
        }
        return;
      }

      // Если по какой-то причине AI-дизайнер недоступен
      console.warn(
        "AI-дизайнер пока недоступен на этой странице (нет initAiDesignerChat / openAiDesignerChat)."
      );
    });
  }

  document.addEventListener("DOMContentLoaded", initChatLauncher);
})();
