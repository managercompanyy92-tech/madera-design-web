// src/ai-designer.js
// Фронтенд большого блока "AI-дизайнер" в разделе "Каталог"

(function () {
  // -------------------- НАСТРОЙКИ --------------------
  const AI_DESIGNER_CONFIG = {
    systemPrompt: `
Ты — AI-дизайнер и менеджер по продажам компании Madera Design (Душанбе).

ТВОЯ РОЛЬ:
- Интерьерный дизайнер международного уровня.
- Эксперт по корпусной мебели (кухни, гардеробные, шкафы, гостиные, спальни, детские, прихожие).
- Сильный менеджер по продажам, который мягко ведёт к заказу.

СТИЛЬ:
- Отвечай на английском, русском и таджикском языках, кратко и структурированно.
- Используй списки, короткие абзацы, понятные формулировки.
- Обращайся к клиенту на "вы".
- Сразу переходи к сути, без длинных приветствий.

ЦЕНЫ И СКИДКИ:
- Заказы принимаем от 3 погонных метров и выше.
- Ориентировочные тарифы:
  - "Стандарт" — около 4000 сомони за погонный метр.
  - "Премиум" — около 5000 сомони за погонный метр.
- Скидки:
  - 5% — если клиент заказывает напрямую через компанию Madera Design.
  - 10% — если клиент использует промокод партнёра (партнёр получает 5% от суммы заказа).
- Если клиент просит оценку:
  - аккуратно спроси длину в погонных метрах и предполагаемый тариф,
  - рассчитай: длина * ставка,
  - при необходимости учти скидку,
  - честно укажи, что это предварительная оценка до замера и детализации.

ДИЗАЙН:
- Всегда уточняй:
  - тип помещения,
  - размеры и высоту потолка,
  - расположение окон и дверей,
  - стиль (минимализм, современный, неоклассика и т.п.),
  - цвета и материалы, которые нравятся,
  - есть ли встроенная техника.
- Дай конкретные идеи по композиции, материалам, фасадам и фурнитуре.
- Если клиент описывает или присылает свой проект — отметь сильные стороны и предложи 2–3 улучшения.

ВЕДЕНИЕ ДИАЛОГА:
- Не давай медицинских, юридических и финансовых советов.
- Не критикуй конкурентов, фокусируйся на сильных сторонах Madera Design.
- В конце ответов, когда уместно, мягко предлагай следующий шаг:
  - замер,
  - расчёт через раздел "Заказ",
  - встречу/созвон.
`.trim(),
  };

  const state = {
    messages: [], // { role: "user" | "assistant", text: string }
  };

  // -------------------- ВСПОМОГАТЕЛЬНОЕ --------------------
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function setStatus(text, root) {
    const el =
      $("[data-ai-designer-status]", root) ||
      $("[data-madera-chat-status]", root);
    if (!el) return;
    el.textContent = text;
  }

  function appendMessage(role, text, root) {
    const box =
      $("[data-ai-designer-messages]", root) ||
      $("[data-madera-chat-messages]", root);
    if (!box) return;

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
    box.appendChild(wrapper);
    box.scrollTop = box.scrollHeight;
  }

  function addToHistory(role, text) {
    state.messages.push({ role, text });
  }

  // Удаляем лишние приветствия в начале ответа
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
    if (filtered.length === 0) return trimmed;
    return filtered.join(" ").trim();
  }

  async function sendToBackend(messageText) {
    try {
      const res = await fetch("/api/ai-designer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
          history: state.messages,
          systemPrompt: AI_DESIGNER_CONFIG.systemPrompt,
        }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch (e) {
        console.error("AI_DESIGNER_FRONT_PARSE_ERROR", e);
      }

      console.log("AI_DESIGNER_FRONT_RESPONSE", data);

      if (data && typeof data.reply === "string" && data.reply.trim()) {
        return data.reply.trim();
      }
      if (data && typeof data.error === "string" && data.error.trim()) {
        return data.error.trim();
      }

      return "Не получилось получить ответ от AI-дизайнера. Попробуйте ещё раз.";
    } catch (err) {
      console.error("AI_DESIGNER_FRONT_NETWORK_ERROR", err);
      return "Похоже, есть временная проблема с подключением. Попробуйте ещё раз чуть позже.";
    }
  }

  // -------------------- ОСНОВНАЯ ЛОГИКА --------------------
  function initAiDesigner() {
    // Корневой блок AI-дизайнера в каталоге
    const root =
      document.querySelector("[data-ai-designer]") ||
      document.getElementById("ai-designer");

    if (!root) {
      // На этой странице блока может не быть — просто выходим
      return;
    }

    const input =
      $("[data-ai-designer-input]", root) ||
      root.querySelector("textarea, input[type='text']");
    const sendBtn =
      $("[data-ai-designer-send]", root) ||
      root.querySelector("button[type='submit'], button");

    // Стартовый статус
    setStatus(
      "Опишите задачу, и AI-дизайнер Madera предложит идеи и примерный бюджет.",
      root
    );

    async function handleSend() {
      if (!input) return;
      const raw = input.value || "";
      const messageText = raw.trim();
      if (!messageText) return;

      appendMessage("user", messageText, root);
      addToHistory("user", messageText);
      input.value = "";
      setStatus("Думаю над вашим запросом…", root);

      if (sendBtn) sendBtn.disabled = true;
      input.disabled = true;

      try {
        const rawReply = await sendToBackend(messageText);
        const replyText = normalizeAssistantReply(rawReply);

        appendMessage("assistant", replyText, root);
        addToHistory("assistant", replyText);
        setStatus("Готова помочь с вашим следующим вопросом.", root);
      } catch (e) {
        console.error("AI_DESIGNER_FRONT_ERROR", e);
        appendMessage(
          "assistant",
          "Произошла ошибка при обработке запроса. Попробуйте ещё раз.",
          root
        );
        setStatus("Возникла временная ошибка. Можно попробовать ещё раз.", root);
      } finally {
        if (sendBtn) sendBtn.disabled = false;
        input.disabled = false;
        input.focus();
      }
    }

    if (sendBtn) {
      sendBtn.addEventListener("click", (e) => {
        e.preventDefault();
        handleSend();
      });
    }

    if (input) {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          handleSend();
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", initAiDesigner);
})();
