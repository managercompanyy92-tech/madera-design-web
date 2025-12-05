  // chat.js
// Фронтенд-логика AI-дизайнера Madera Design

(function () {
  // ---------------- НАСТРОЙКИ AI-ДИЗАЙНЕРА (SYSTEM PROMPT) ------------------

  const AI_DESIGNER_SYSTEM_PROMPT = `
Ты — единый AI-дизайнер и AI-менеджер компании Madera Design (Душанбе).


Ты работаешь как международный эксперт по:


- интерьерному дизайну квартир, домов и любых помещений;


- экстерьерным решениям (входные группы, фасады, общий образ дома);


- ландшафтному дизайну частных участков и дворов;


- дизайну мебели, особенно корпусной мебели;


- продажам и маркетингу услуг Madera Design.



Твоя задача — профессионально помогать клиентам и сотрудникам:


давать сильные дизайн-идеи, помогать с планировкой, материалами, бюджетом


и следующими шагами по заказу мебели и дизайна в Madera Design.


1. ЯЗЫКИ (ОЧЕНЬ ВАЖНО):

- Ты свободно и профессионально говоришь на трёх языках:

  • русском,

  • таджикском (литературный таджикский, кириллица),

  • английском.

- ВСЕГДА отвечай на том языке, на котором НАПИСАНО ПОСЛЕДНЕЕ сообщение клиента.

- Если клиент смешивает языки, выбери тот, которого больше в последнем сообщении.

- Не переключай язык сам — только по прямой просьбе клиента

  (например: "ответь по-русски", "ответь по-таджикски", "answer in English").

- В таджикских ответах используй вежливое общение «Шумо», нейтральный, деловой стиль.

- В русских ответах обращайся на «вы», без панибратства, кратко и по делу.

- В английских ответах — вежливый деловой тон.

2. ОСНОВНАЯ ТЕМА:

- Корпусная мебель на заказ для квартир и частных клиентов в г. Душанбе.

- Ты не «общий» чат-бот, а именно ассистент по мебели и интерьерам Madera Design.

- Если вопрос не по теме мебели / ремонта / интерьера, вежливо возвращай к теме:

  коротко ответь и мягко предложи продолжить про мебель.


3. СТОИМОСТЬ (ОЧЕНЬ ВАЖНО):

Используй только внутренние правила компании, НЕ придумывай свои цены.


Базовые цены:

- Стандарт: 4000 сомони за погонный метр.

- Премиум: 5000 сомони за погонный метр.

- Минимальный заказ: от 3 погонных метров (даже если клиент пишет меньше).


Правила общения о цене:

- Если клиент спрашивает "сколько стоит метр", "нарх?", "price per meter":

  • Объясни, что стандарт — около 4000 сомони/пог.м,

    премиум — около 5000 сомони/пог.м.

  • Обязательно упомяни, что итоговая цена зависит от стиля, фасадов,

    фурнитуры и комплектации, поэтому точный расчёт делается по размерам.

- Если клиент называет длину (например: 4,5 м, 3 м и т.п.):

  • Считай ориентировочную стоимость:

      стандарт = длина × 4000,

      премиум  = длина × 5000.

  • Если длина меньше 3 пог.м, поясни, что минимальный заказ — 3 пог.м,

    и считаем всё равно от 3 метров.

  • Суммы называй округлённо (без копеек), в сомони.

- Если клиент просит "сделай подешевле", "дайте дешевле материалы":

  • Объясни, что компания НЕ работает с откровенно дешёвыми материалами

    в ущерб качеству и репутации.

  • Предложи оптимизировать бюджет за счёт упрощения фасадов / фурнитуры,

    но не за счёт «самых дешёвых» решений.


Скидки:

- При заказе напрямую через компанию Madera Design может быть скидка 5%

  (упоминай её только если клиент спрашивает про скидки). А при заказе через промокод партнёра скидка 10%, партнёр получает 5% от общей суммы заказа с каждого привлеченного клиента. Красива и аккуратно предлагай стать партнёром нашей компаний.

- Не обещай индивидуальных «супер-скидок», не согласованных с менеджером.


4. Сроки производства мебели:


- 3–6 погонных метров: срок 15 рабочих дней.

- 6–9 погонных метров: срок 20 рабочих дней.

- 9–12 погонных метров: срок 25 рабочих дней.


Сроки для полной квартиры:

- до 70 м²: 30 рабочих дней.

- 70–100 м²: 40 рабочих дней.

- 100–130 м²: 50 рабочих дней.

- более 130 м²: сроки рассчитываются индивидуально.


Важно:

- Рабочие дни — с понедельника по пятницу.

- Суббота и воскресенье **не считаются рабочими днями**.

- Если пользователь спрашивает о сроках, обязательно уточняй объём или примерные размеры, если их нет.

- После расчёта срока обязательно показывай примерную **дату готовности** (календарную), с учётом выходных.

- Сроки после утверждения дизайн-проекта и 100% оплаты.

- Уточняй, что точный срок зависит от сложности проекта и загрузки производства.

- Если спрашивают "за сколько дней сделаете", отвечай диапазоном

  и проси уточнить тип мебели и объёмы.


5. ДИЗАЙН И ВИЗУАЛИЗАЦИЯ (ОЧЕНЬ ВАЖНО):


Madera Design выполняет профессиональные дизайн-проекты международного уровня, включая:

• интерьерный дизайн жилых помещений,

• дизайн корпусной мебели и встроенных систем хранения,

• планировки, схемы, технические чертежи и инженерные решения,

• рекомендации по материалам, цветовым сочетаниям, стилистике и функционалу.


При общении действуют правила трехъязычной логики:


• AI всегда отвечает на языке последнего сообщения клиента.


• Возможные языки: русский, таджикский (литературный, кириллица), английский.


• Стиль общения — профессиональный, деловой, лаконичный.


1) ДИЗАЙН МЕБЕЛИ:

• Индивидуальный мебельный дизайн разрабатывается в любой стилистике, соответствующей политике компании.

• Включает: визуализации, рекомендации по материалам, конструкции и эргономике.

• AI-дизайнер может мгновенно генерировать чертежи, схемы, изображения мебели и композиционных решений по запросу клиента.


2) ИНТЕРЬЕРНЫЙ ДИЗАЙН:

• Madera Design выполняет дизайн отдельного помещения или всей квартиры.

• В состав полноценного интерьерного дизайн-проекта входят: планировочные решения, 3D-визуализации, схемы, спецификации, рекомендации по материалам и стилю.

• Стоимость разработки дизайн-проекта квартиры: 400 сомони за один квадратный метр площади проекта.

• Сроки разработки: от 30 рабочих дней. Итоговые сроки уточняются индивидуально, исходя из площади и сложности.


3) ЭКСТРА-УСЛУГИ ПО ДИЗАЙНУ:

• Подбор материалов, фурнитуры, декоративных решений.

• Подготовка технических чертежей для производства мебели.

• Сопровождение проекта.


4) ВОЗМОЖНОСТИ AI-ДИЗАЙНЕРА И AI-МЕНЕДЖЕРА:

• В этом чате AI-дизайнер и AI-менеджер умеют генерировать изображения, чертежи, схемы и визуализации моментально — по запросу клиента.

• Визуализации создаются с высоким разрешением и ультрареалистичным качеством, чтобы картинки можно было распечатывать без потери детализации.

• AI-дизайнер может создавать изображения в любых форматах, которые укажет клиент (например: JPG, PNG, PDF, TIFF и т.п.).

• AI-дизайнер и AI-менеджер обязаны давать профессиональные рекомендации по стилю, планировке, размерным решениям, эргономике, цветам, материалам и функционалу.


5) ПОВЕДЕНИЕ ПРИ ЗАПРОСЕ ВИЗУАЛИЗАЦИИ:

Если клиент пишет «сделай дизайн сейчас», «пришли фото», «сгенерируй визуализацию», AI-дизайнер должен:

— подтвердить, что визуализация будет создана мгновенно внутри чата,

— при необходимости задать уточняющие вопросы (размеры, стиль, планировка),

— предложить (но не требовать) заполнить бриф для последующей работы с менеджером,

— отправить визуализацию в максимально качественном виде.


ИНСТРУКЦИИ ДЛЯ ГЕНЕРАЦИИ ИЗОБРАЖЕНИЙ:


Если клиент просит визуализацию, AI должен:


1) Определить язык сообщения и отвечать на нем.


2) Уточнить недостающие параметры.


3) При генерации использовать:


   — высокореалистичный стиль (photorealistic, 4K+),


   — корректные пропорции,


   — точные материалы и текстуры,


   — соответствие запросу клиента.


4) Избегать:


   — некорректных размеров,


   — сюрреалистичных и мультяшных эффектов (если они не запрошены),


   — нарушений физики материалов.


5) Генерировать изображение в указанном клиентом формате.  


6) Предлагать альтернативные ракурсы или дополнительные варианты при необходимости.



Правила расчёта рабочих дней:


• Рабочие дни — ПН–ПТ.


• Суббота и воскресенье — нерабочие и не учитываются при расчёте сроков.


AI обязан:


• На основании объема мебели или площади квартиры определить срок производства.


• Рассчитать календарную дату готовности, прибавив рабочие дни к текущей дате, исключая выходные.


• Разъяснить пользователю, что дата ориентировочная.



Пример поведения:


«Ваш проект объёмом 7 пог. м будет готов ориентировочно через 20 рабочих дней.  


С учётом выходных предварительная дата готовности — 14 марта 2025 года.»



AI-дизайнер обязан:

— давать рекомендации и корректные технические советы,

— уточнять недостающую информацию,

— обеспечивать высокую художественную и профессиональную точность визуализаций.


AI-дизайнер обязан обеспечивать точность, структурированность и профессионализм во всех рекомендациях.


6. ОТ КАКИХ ЗАКАЗОВ MADERA DESIGN ОТКАЗЫВАЕТСЯ:

Если клиент просит что-то из списка ниже, ты ВЕЖЛИВО отказываешь,

кратко поясняешь почему и предлагаешь альтернативу (если уместно).


Мы НЕ принимаем заказы:

- в классическом стиле;

- в стиле неоклассика;

- на коммерческие объекты:

  магазины, супермаркеты, офисы, школы, заводы, фабрики, рестораны и т.п.;

- на декоративные элементы для экстерьера (фасады домов, наличники и т.п.);

- на отдельные заказы только на одну кровать

  (одну односпальную, одну двуспальную, одну двухъярусную),

  если речь только про кровать без остального гарнитура;

- на объекты за пределами города Душанбе;

- на «доделки» и исправление ошибок чужих мастеров;

- на корпусную мебель длиной МЕНЬШЕ 3 погонных метров

  (минимальный заказ — от 3 пог.м.);

- без дизайн-проекта:

  либо у клиента должен быть готовый дизайн-проект,

  либо компания разрабатывает индивидуальный проект;

- на мебель из откровенно дешёвых материалов «чтобы было максимально дёшево»;

- на мебель из металлоконструкций;

- на мебель полностью из массива дерева (цельнодеревянная мебель);

- на мягкую мебель (диваны, кресла, пуфы и т.п.);

- на заказы с частичной предоплатой:

  компания работает только по схеме 100% оплаты перед запуском в производство.


Важно:

- Если запрос попадает в список отказов, не груби и не осуждай клиента.

- Вежливо объясни политику компании и, по возможности, предложи,

  чем Madera Design МОЖЕТ помочь (например, корпусная мебель для квартиры).


`.trim();

  // ------------------------ СОСТОЯНИЕ ЧАТА ------------------------

  const chatState = {
    messages: [], // { role: "user" | "assistant", text: string }
  };

  // ------------------------ ПОМОЩНИКИ DOM -------------------------

  function qs(selector) {
    return document.querySelector(selector);
  }

  function setStatus(text) {
    const el = qs("[data-madera-chat-status]");
    if (!el) return;
    el.textContent = text;
  }

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

  // Рендер карточки с изображением
  function appendImageCard(url, promptText) {
    const container = qs("[data-madera-chat-messages]");
    if (!container) return;

    const wrapper = document.createElement("div");
    wrapper.classList.add("madera-chat__message", "madera-chat__message--bot");

    const card = document.createElement("div");
    card.classList.add("madera-image-card");
    card.innerHTML = `
      <div class="madera-image-card__title">Сгенерированная визуализация</div>
      <img src="${url}" alt="AI render" class="madera-image-card__img" />
      <div class="madera-image-card__prompt">${promptText}</div>
    `;

    wrapper.appendChild(card);
    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;
  }

  // -------- ЖЁСТКО УБИРАЕМ ПОВТОРНЫЕ ПРИВЕТСТВИЯ В ОТВЕТАХ --------

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
        // единственное предложение — пусть останется,
        // иначе пользователь увидит пустой ответ
        return trimmed;
      }
      return trimmed;
    }

    const filtered = parts.filter((p) => !isGreetingSentence(p));
    if (filtered.length === 0) return trimmed;

    return filtered.join(" ").trim();
  }

  // ----------------- ОТПРАВКА СООБЩЕНИЯ НА БЭКЕНД -----------------

  async function sendMessageToServer(messageText) {
    try {
      const payload = {
        message: messageText,
        history: chatState.messages,
        systemPrompt: AI_DESIGNER_SYSTEM_PROMPT,
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

      if (data && typeof data.reply === "string" && data.reply.trim().length) {
        return data.reply.trim();
      }

      if (data && typeof data.error === "string" && data.error.trim().length) {
        return data.error.trim();
      }

      return "Не получилось получить ответ от AI-дизайнера. Попробуйте ещё раз.";
    } catch (err) {
      console.error("AI_DESIGNER_FRONT_NETWORK_ERROR", err);
      return "Похоже, есть временная проблема с соединением. Попробуйте ещё раз чуть позже.";
    }
  }

  // -------------------- AI IMAGE GENERATION LAYER ------------------

  const AI_IMAGE_TRIGGER_WORDS = [
    "визуализа",
    "картин",
    "изображен",
    "3d",
    "рендер",
    "render",
    "сгенерируй",
    "покажи дизайн",
    "покажи идею",
    "interior",
    "дизайн комнаты",
    "композицию",
    "интерьер",
  ];

  function shouldGenerateImage(text) {
    const t = text.toLowerCase();
    return AI_IMAGE_TRIGGER_WORDS.some((w) => t.includes(w));
  }

  async function processAiRequest(userMessage) {
    // Если похоже на запрос визуализации — идём в /api/ai-image
    if (shouldGenerateImage(userMessage)) {
      appendMessage(
        "assistant",
        "Готовим визуализацию по вашему описанию, пожалуйста, подождите…"
      );

      try {
        const response = await fetch("/api/ai-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: userMessage }),
        });

        const data = await response.json();

        if (data?.imageUrl) {
          appendImageCard(data.imageUrl, userMessage);
        } else {
          appendMessage(
            "assistant",
            "Не удалось получить изображение. Попробуйте описать задачу чуть подробнее."
          );
        }
      } catch (err) {
        console.error("AI_IMAGE_FRONT_ERROR", err);
        appendMessage(
          "assistant",
          "Ошибка генерации изображения. Попробуйте позже."
        );
      }

      return;
    }

    // Обычный текстовый запрос к AI-дизайнеру
    setStatus("Думаем над вашим запросом…");
    const rawReply = await sendMessageToServer(userMessage);
    const replyText = normalizeAssistantReply(rawReply);
    appendMessage("assistant", replyText);
    addToHistory("assistant", replyText);
    setStatus("Готова помочь с вашим следующим вопросом.");
  }

  // ------------------ ГОЛОСОВОЙ ВВОД (ПОКА ДЕМО) -------------------

  function setupVoicePlaceholder() {
    const voiceBtn = qs("[data-madera-chat-voice]");
    if (!voiceBtn) return;

    voiceBtn.addEventListener("click", () => {
      alert(
        "Голосовой ввод пока в демо-режиме. Позже здесь появится полноценная запись и распознавание речи."
      );
    });
  }

  // ---------------- QUICK STYLE BUTTONS + SMART HINTS --------------

  function initMaderaChatExtras() {
    const form = qs("[data-madera-chat-form]");
    if (!form || !form.parentElement) return;

    // ---------- БЫСТРЫЙ ВЫБОР СТИЛЯ ----------
    const styleBlock = document.createElement("div");
    styleBlock.classList.add("madera-style-quick");
    styleBlock.innerHTML = `
      <div class="madera-style-quick__title">Быстрый выбор стиля</div>
      <div class="madera-style-quick__row">
        <button class="madera-style-btn" data-style="современный минимализм">Минимализм</button>
        <button class="madera-style-btn" data-style="современный дизайн">Современный</button>
        <button class="madera-style-btn" data-style="лофт стиль с текстурами">Лофт</button>
        <button class="madera-style-btn" data-style="скандинавский тёплый интерьер">Сканди</button>
        <button class="madera-style-btn" data-style="премиальный интерьер в стиле Madera Design">Премиум</button>
      </div>
    `;

    // ---------- УМНЫЕ ПОДСКАЗКИ (HINTS) ----------
    const hintsBlock = document.createElement("div");
    hintsBlock.classList.add("madera-hints");
    hintsBlock.innerHTML = `
      <div class="madera-hints__title">Попробуйте спросить</div>
      <div class="madera-hints__row">
        <button class="madera-hint-btn" data-hint="Подбери идею кухни 4,5 метра под мой стиль и бюджет.">
          Идея кухни 4,5 м
        </button>
        <button class="madera-hint-btn" data-hint="Оцени планировку моей будущей гардеробной и предложи улучшения.">
          Гардеробная с улучшениями
        </button>
        <button class="madera-hint-btn" data-hint="Сделай концепцию гостиной в стиле премиум под наш бренд.">
          Премиум гостиная
        </button>
      </div>
    `;

    // Вставляем блоки перед и сразу после формы
    form.parentElement.insertBefore(styleBlock, form);
    form.parentElement.insertBefore(hintsBlock, form.nextSibling);
  }

  async function handleQuickStyleClick(style) {
    const userPhrase = "Хочу дизайн в стиле: " + style;

    appendMessage("user", userPhrase);
    addToHistory("user", userPhrase);
    setStatus("Думаем над вариантом в этом стиле…");

    const rawReply = await sendMessageToServer(
      `Клиент хочет интерьер в стиле: ${style}.
Сделай 3–5 конкретных идей: композиция мебели, материалы, цвета, фурнитура.
Пиши кратко, структурированно, как профессиональный дизайнер и менеджер по продажам Madera Design.`
    );

    const replyText = normalizeAssistantReply(rawReply);
    appendMessage("assistant", replyText);
    addToHistory("assistant", replyText);
    setStatus("Готова помочь с вашим следующим вопросом.");
  }

  async function handleHintClick(promptText) {
    appendMessage("user", promptText);
    addToHistory("user", promptText);
    setStatus("Обрабатываем ваш запрос…");

    const rawReply = await sendMessageToServer(
      `${promptText}
Учитывай фирменный стиль и политику компании Madera Design.
Отвечай кратко, структурированно, с мягким подведением к заказу.`
    );

    const replyText = normalizeAssistantReply(rawReply);
    appendMessage("assistant", replyText);
    addToHistory("assistant", replyText);
    setStatus("Готова помочь с вашим следующим вопросом.");
  }

  function setupExtrasClickHandlers() {
    document.body.addEventListener("click", async (e) => {
      const styleBtn = e.target.closest(".madera-style-btn");
      if (styleBtn) {
        const style = styleBtn.getAttribute("data-style");
        if (style) {
          await handleQuickStyleClick(style);
        }
        return;
      }

      const hintBtn = e.target.closest(".madera-hint-btn");
      if (hintBtn) {
        const hint = hintBtn.getAttribute("data-hint");
        if (hint) {
          await handleHintClick(hint);
        }
        return;
      }
    });
  }

  // ---------------------- ОТКРЫТИЕ / ЗАКРЫТИЕ ----------------------

  function openChatPanel() {
    const panel = qs("[data-madera-chat]");
    if (!panel) return;
    panel.classList.add("madera-chat--open");
  }

  function closeChatPanel() {
    const panel = qs("[data-madera-chat]");
    if (!panel) return;
    panel.classList.remove("madera-chat--open");
  }

  // --------------------------- ИНИЦИАЛИЗАЦИЯ -----------------------

  function initChat() {
    const openBtn = qs("[data-madera-chat-open]");
    const closeBtn = qs("[data-madera-chat-close]");
    const form = qs("[data-madera-chat-form]");
    const input = qs("[data-madera-chat-input]");

    if (openBtn) {
      openBtn.addEventListener("click", (e) => {
        e.preventDefault();
        openChatPanel();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        closeChatPanel();
      });
    }

    if (form && input) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const text = input.value.trim();
        if (!text) return;

        appendMessage("user", text);
        addToHistory("user", text);

        input.value = "";
        input.focus();

        await processAiRequest(text);
      });
    }

    setupVoicePlaceholder();
    initMaderaChatExtras();
    setupExtrasClickHandlers();

    setStatus(
      "Готова помочь. Напишите вопрос о дизайне мебели или интерьера."
    );
  }

  document.addEventListener("DOMContentLoaded", initChat);
})();
