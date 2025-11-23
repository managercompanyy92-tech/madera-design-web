// src/main.js

// Импорт данных каталога
import { catalogCategories } from "./utils/catalogCategories.js";
import { catalogItems } from "./utils/catalogItems.js";

// Тарифы за погонный метр
const BASE_RATES = {
  standard: 4000,
  premium: 5000,
};

// URL ассистента
const ASSISTANT_API_URL = "/api/assistant";

// Корневой контейнер
const appRoot = document.getElementById("app");

// Состояние выбранной категории каталога
let selectedCatalogCategoryId = null;

// ------------------------- VIEW-ФУНКЦИИ ----------------------------------

// Главная
function renderHome() {
  return `
    <section class="page page--home">
      <div class="hero">
        <div class="hero__content">
          <h1 class="hero__title">
            Современная корпусная мебель на заказ в Душанбе
          </h1>
          <p class="hero__subtitle">
            Премиальный сервис, дизайн с поддержкой искусственного интеллекта, онлайн-калькулятор стоимости
            и прозрачный статус заказа на каждом этапе.
          </p>
          <div class="hero__actions">
            <button class="btn btn--primary" data-route="order">
              Рассчитать и оформить заказ
            </button>
            <button class="btn btn--ghost" data-route="catalog">
              Смотреть каталог идей
            </button>
          </div>
          <p class="hero__note">
            Сделаем интерьер, который впечатляет с первого взгляда
            — и приносит «вау-эффект» каждый день.
          </p>
        </div>
        <div class="hero__side">
          <div class="hero-card">
            <div class="hero-card__label">AI &amp; маркетинг</div>
            <ul class="hero-card__list">
              <li>Персональные рекомендации дизайна</li>
              <li>AI-чат 24/7 по мебели и стоимости</li>
              <li>Визуализация интерьера до заказа</li>
              <li>Прозрачный статус заказа в приложении</li>
            </ul>
          </div>
        </div>
      </div>

      <section class="highlights">
        <div class="highlights__item">
          <div class="highlights__title">Премиальный тёмный дизайн</div>
          <p class="highlights__text">
            Фирменная палитра: глубокий графит и благородный оранжевый (#E97A00).
            Интерфейс, который сразу транслирует уровень бренда.
          </p>
        </div>
        <div class="highlights__item">
          <div class="highlights__title">Цифровая воронка продаж</div>
          <p class="highlights__text">
            От вдохновения до оплаты: каталог, калькулятор, онлайн-заказ, кредиты,
            партнёрская программа — всё в одном веб-приложении.
          </p>
        </div>
        <div class="highlights__item">
          <div class="highlights__title">Сделано для Душанбе</div>
          <p class="highlights__text">
            Локальный бренд, локальное производство, адаптация под реальные квартиры
            и запросы клиентов Душанбе.
          </p>
        </div>
      </section>
    </section>
  `;
}

// Каталог
function renderCatalog() {
  // список категорий
  if (!selectedCatalogCategoryId) {
    const cards = catalogCategories
      .map(
        (cat) => `
          <button class="catalog-category-card" data-category-id="${cat.id}">
            <div class="catalog-category-card__image-wrap">
              <img src="${cat.image}" alt="${cat.title}" class="catalog-category-card__img" />
              <div class="catalog-category-card__icon">
                <span>≡</span>
              </div>
            </div>
            <div class="catalog-category-card__bottom">
              <span class="catalog-category-card__title">${cat.title}</span>
              <span class="catalog-category-card__arrow">›</span>
            </div>
          </button>
        `
      )
      .join("");

    return `
      <section class="page page--catalog">
        <h1 class="page__title">Каталог мебели</h1>
        <p class="page__subtitle">
          Выберите категорию — дальше покажем вдохновляющие идеи, а затем поможем посчитать стоимость и оформить заказ.
        </p>

        <div class="catalog-categories-grid">
          ${cards}
        </div>
      </section>
    `;
  }

  // внутренние идеи
  const category = catalogCategories.find(
    (cat) => cat.id === selectedCatalogCategoryId
  );
  const items = catalogItems.filter(
    (item) => item.categoryId === selectedCatalogCategoryId
  );

  const itemCards = items
    .map(
      (item) => `
        <div class="catalog-item-card">
          <div class="catalog-item-card__image-wrap">
            <img src="${item.image}" alt="${item.title}" class="catalog-item-card__img" />
          </div>
          <div class="catalog-item-card__info">
            <div class="catalog-item-card__title">${item.title}</div>
            <div class="catalog-item-card__desc">${item.description}</div>
            <button class="btn btn--primary catalog-item-card__btn" data-route="order">
              Рассчитать стоимость
            </button>
          </div>
        </div>
      `
    )
    .join("");

  return `
    <section class="page page--catalog">
      <button class="catalog-back" data-action="catalog-back">
        ← Все категории
      </button>

      <h1 class="page__title">${category ? category.title : "Категория"}</h1>
      <p class="page__subtitle">
        Выберите идею, которая ближе к вашему вкусу. На следующих шагах адаптируем дизайн под размеры
        вашей квартиры и посчитаем стоимость.
      </p>

      <div class="catalog-items-grid">
        ${
          itemCards ||
          "<div class='page__placeholder'>Идеи для этой категории появятся чуть позже.</div>"
        }
      </div>
    </section>
  `;
}

// Заказ (калькулятор + форма + маркетинг)
// (логика та же, что и в твоём предыдущем варианте, чтобы не раздувать ответ)
function renderOrder() {
  return `
    <section class="page page--order">
      <h1 class="page__title">Онлайн-калькулятор и заказ мебели</h1>
      <p class="page__subtitle">
        Оцените базовую стоимость вашего проекта за несколько секунд. Это ориентировочный расчёт — 
        точную цену вы получите после замера и согласования дизайн-проекта.
      </p>

      <div class="order-layout">
        <div>
          <!-- калькулятор (укороченная верстка, как раньше) -->
          <div class="order-calc">
            <div class="order-calc__header">
              <div class="order-calc__title">Быстрый расчёт стоимости</div>
              <div class="order-calc__tag">от 3 пог. метров</div>
            </div>

            <div class="order-calc__row">
              <label class="order-calc__label" for="order-length">
                Длина проекта, погонные метры
              </label>
              <input
                id="order-length"
                type="number"
                min="1"
                step="0.1"
                placeholder="Например, 4.5"
                class="order-calc__input"
                data-calc-length
              />
              <div class="order-calc__hint">
                Минимальный объём заказа — <strong>3 пог. метра</strong>.
              </div>
            </div>

            <div class="order-calc__row">
              <div class="order-calc__label">Материал и тариф</div>
              <div class="order-calc__tariffs">
                <label class="order-calc-tariff">
                  <input type="radio" name="tariff" value="standard" checked />
                  <span class="order-calc-tariff__body">
                    <span class="order-calc-tariff__name">Стандарт</span>
                    <span class="order-calc-tariff__price">
                      ≈ ${BASE_RATES.standard.toLocaleString("ru-RU")} сом / п.м.
                    </span>
                  </span>
                </label>
                <label class="order-calc-tariff">
                  <input type="radio" name="tariff" value="premium" />
                  <span class="order-calc-tariff__body">
                    <span class="order-calc-tariff__name">Премиум</span>
                    <span class="order-calc-tariff__price">
                      ≈ ${BASE_RATES.premium.toLocaleString("ru-RU")} сом / п.м.
                    </span>
                  </span>
                </label>
              </div>
            </div>

            <div class="order-calc__actions">
              <button class="btn btn--primary" data-action="calc-price">
                Рассчитать стоимость
              </button>
              <div class="order-calc__note">
                Расчёт ориентировочный, без учёта сложных форм и техники.
              </div>
            </div>

            <div class="order-calc__result">
              Введите длину и выберите тариф, затем нажмите «Рассчитать стоимость».
            </div>
          </div>

          <!-- тут можешь оставить свою форму заявки как раньше -->
        </div>

        <div class="order-info">
          <div class="order-info__card">
            <div class="order-info__badge">Маркетинг & доверие</div>
            <h2 class="order-info__title">Почему клиенты выбирают Madera Design</h2>
            <ul class="order-info__list">
              <li>Прозрачные тарифы: 4000 / 5000 сомони за погонный метр.</li>
              <li>Договор, сроки и статус заказа — в одном интерфейсе.</li>
              <li>AI-помощник подбирает идеи под ваш стиль и бюджет.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  `;
}

// Личный кабинет и «Ещё» — заглушки
function renderProfile() {
  return `
    <section class="page">
      <h1 class="page__title">Личный кабинет</h1>
      <p class="page__subtitle">
        Здесь позже появятся статусы заказов, партнёрская программа и бонусы.
      </p>
      <div class="page__placeholder">
        Заглушка: раздел в разработке.
      </div>
    </section>
  `;
}

function renderMore() {
  return `
    <section class="page">
      <h1 class="page__title">Дополнительно</h1>
      <p class="page__subtitle">
        Материалы, цены, сроки, документы, акции и контакты Madera Design.
      </p>
      <div class="page__placeholder">
        Здесь позже появится структурированное меню знаний о компании.
      </div>
    </section>
  `;
}

// ------------------------- РОУТЕР -----------------------------------------

const VIEWS = {
  home: renderHome,
  catalog: renderCatalog,
  order: renderOrder,
  profile: renderProfile,
  more: renderMore,
};

function renderRoute(route) {
  const viewFn = VIEWS[route] || VIEWS.home;
  const main = document.getElementById("app-main");
  if (!main) return;

  main.innerHTML = viewFn();

  const navButtons = appRoot.querySelectorAll(".app-nav__item");
  navButtons.forEach((btn) => {
    const r = btn.getAttribute("data-route");
    btn.classList.toggle("app-nav__item--active", r === route);
  });
}

// ------------------------- КАЛЬКУЛЯТОР ------------------------------------

function handleCalcPrice() {
  const main = document.getElementById("app-main");
  if (!main) return;

  const lengthInput = main.querySelector("[data-calc-length]");
  const tariffInput = main.querySelector("input[name='tariff']:checked");
  const resultBox = main.querySelector(".order-calc__result");

  if (!lengthInput || !tariffInput || !resultBox) return;

  const raw = String(lengthInput.value || "").replace(",", ".");
  const length = parseFloat(raw);

  if (Number.isNaN(length) || length <= 0) {
    resultBox.innerHTML = `
      <div class="order-calc__result-error">
        Пожалуйста, введите корректную длину проекта в погонных метрах.
      </div>
    `;
    return;
  }

  if (length < 3) {
    resultBox.innerHTML = `
      <div class="order-calc__result-error">
        Минимальный объём заказа — 3 погонных метра. Сейчас указано: ${length.toFixed(
          1
        )} м.
      </div>
    `;
    return;
  }

  const tariff = tariffInput.value;
  const rate = BASE_RATES[tariff] || BASE_RATES.standard;
  const price = length * rate;

  const formatter = new Intl.NumberFormat("ru-RU");

  resultBox.innerHTML = `
    <div class="order-calc__result-ok">
      <div class="order-calc__result-main">
        Ориентировочная стоимость проекта при длине
        <strong>${length.toFixed(1)} пог. м</strong> и тарифе
        <strong>${tariff === "premium" ? "Премиум" : "Стандарт"}</strong>:
      </div>
      <div class="order-calc__result-price">
        ≈ ${formatter.format(price)} сомони
      </div>
      <div class="order-calc__result-details">
        Для точного расчёта оставьте заявку — менеджер уточнит детали и сделает финальный просчёт.
      </div>
    </div>
  `;
}

// ------------------------- НОВЫЙ AI-ЧАТ -----------------------------------

// обращаемся к корню чата
function getChatRoot() {
  return appRoot.querySelector("[data-ai-chat-root]");
}

function setChatStatus(text) {
  const root = getChatRoot();
  if (!root) return;
  const statusEl = root.querySelector("[data-ai-chat-status]");
  if (statusEl) statusEl.textContent = text;
}

function appendChatMessage(role, text) {
  const root = getChatRoot();
  if (!root) return;
  const container = root.querySelector("[data-chat-messages]");
  if (!container) return;

  const wrapper = document.createElement("div");
  wrapper.className =
    "ai-chat__msg " +
    (role === "user" ? "ai-chat__msg--user" : "ai-chat__msg--bot");

  const bubble = document.createElement("div");
  bubble.className = "ai-chat__msg-text";
  bubble.textContent = text;

  wrapper.appendChild(bubble);
  container.appendChild(wrapper);
  container.scrollTop = container.scrollHeight;
}

function openChat() {
  const root = getChatRoot();
  if (!root) return;
  root.classList.add("ai-chat--open");
  const input = root.querySelector("[data-chat-input]");
  if (input) input.focus();
}

function closeChat() {
  const root = getChatRoot();
  if (!root) return;
  root.classList.remove("ai-chat--open");
}

// запрос к API ассистента
async function sendToAssistant(message, history = []) {
  const payload = { message, history };

  try {
    const res = await fetch(ASSISTANT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Bad response");

    const data = await res.json();
    const reply =
      data.reply || data.answer || data.message || "Спасибо за вопрос!";

    return reply;
  } catch (e) {
    console.error("ASSISTANT_API_ERROR", e);
    return "Сейчас есть сложности с подключением к AI-ассистенту. Попробуйте ещё раз позже или оставьте заявку в разделе «Заказ».";
  }
}

const chatHistory = [];

async function handleChatSend() {
  const root = getChatRoot();
  if (!root) return;

  const input = root.querySelector("[data-chat-input]");
  const messages = root.querySelector("[data-chat-messages]");
  if (!input || !messages) return;

  const text = (input.value || "").trim();
  if (!text) return;

  appendChatMessage("user", text);
  chatHistory.push({ role: "user", content: text });
  input.value = "";

  setChatStatus("AI-ассистент думает над ответом…");

  const reply = await sendToAssistant(text, chatHistory);

  appendChatMessage("assistant", reply);
  chatHistory.push({ role: "assistant", content: reply });

  setChatStatus(
    "Онлайн-ассистент. Для точного расчёта всё равно потребуется менеджер и замер."
  );
}

// свайп вверх по иконке для открытия
function setupChatSwipe(root) {
  const toggle = root.querySelector("[data-action='chat-toggle']");
  if (!toggle) return;

  let startY = null;
  let startX = null;

  toggle.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    startY = t.clientY;
    startX = t.clientX;
  });

  toggle.addEventListener("touchend", (e) => {
    if (startY === null || startX === null) return;
    const t = e.changedTouches[0];
    const dy = startY - t.clientY;
    const dx = Math.abs(startX - t.clientX);

    // в основном вертикальный свайп вверх
    if (dy > 25 && dx < 40) {
      openChat();
    }

    startY = null;
    startX = null;
  });
}

// ------------------------- ОБРАБОТЧИКИ КЛИКОВ -----------------------------

function setupRouter() {
  appRoot.addEventListener("click", (event) => {
    const routeTarget = event.target.closest("[data-route]");
    if (routeTarget) {
      const route = routeTarget.getAttribute("data-route");
      if (route === "catalog") {
        selectedCatalogCategoryId = null;
      }
      renderRoute(route);
      return;
    }

    const categoryTarget = event.target.closest("[data-category-id]");
    if (categoryTarget) {
      const categoryId = categoryTarget.getAttribute("data-category-id");
      selectedCatalogCategoryId = categoryId;
      renderRoute("catalog");
      return;
    }

    const backTarget = event.target.closest("[data-action='catalog-back']");
    if (backTarget) {
      selectedCatalogCategoryId = null;
      renderRoute("catalog");
      return;
    }

    const calcTarget = event.target.closest("[data-action='calc-price']");
    if (calcTarget) {
      handleCalcPrice();
      return;
    }

    const chatToggle = event.target.closest("[data-action='chat-toggle']");
    if (chatToggle) {
      const root = getChatRoot();
      if (!root) return;
      if (root.classList.contains("ai-chat--open")) {
        closeChat();
      } else {
        openChat();
      }
      return;
    }

    const chatSend = event.target.closest("[data-action='chat-send']");
    if (chatSend) {
      handleChatSend();
      return;
    }
  });

  // Enter в поле чата
  appRoot.addEventListener("keydown", (event) => {
    const target = event.target;
    if (
      target &&
      target.matches("[data-chat-input]") &&
      event.key === "Enter"
    ) {
      event.preventDefault();
      handleChatSend();
    }
  });
}

// ------------------------- РЕНДЕР ОБОЛОЧКИ --------------------------------

function renderLayout(initialRoute = "home") {
  appRoot.innerHTML = `
    <div class="app-shell">
      <header class="app-header">
        <div class="app-header__brand">
          <div class="app-header__logo">Madera Design</div>
          <div class="app-header__tagline">
            Партнёр в создании современного интерьера
          </div>
        </div>
        <div class="app-header__cta">
          <button class="btn btn--outline" data-route="order">
            Оформить заказ
          </button>
        </div>
      </header>

      <main class="app-main" id="app-main"></main>

      <!-- НОВЫЙ AI-ЧАТ С ИКОНКОЙ -->
      <div class="ai-chat" data-ai-chat-root>
        <button
          class="ai-chat__toggle"
          type="button"
          data-action="chat-toggle"
          aria-label="Открыть AI-ассистента"
        >
          🤖
        </button>

        <div class="ai-chat__panel">
          <div class="ai-chat__header">
            <div class="ai-chat__title">AI-ассистент Madera</div>
            <button
              class="ai-chat__close"
              type="button"
              data-action="chat-toggle"
              aria-label="Закрыть чат"
            >
              ×
            </button>
          </div>
          <div class="ai-chat__hint">
            Задайте вопрос по стоимости, материалам или планировке — ассистент подскажет общие варианты.
          </div>

          <div class="ai-chat__messages" data-chat-messages>
            <div class="ai-chat__msg ai-chat__msg--bot">
              <div class="ai-chat__msg-text">
                Здравствуйте! Я AI-ассистент Madera Design. Помогу прикинуть стоимость кухни или шкафа и подсказать по материалам.
              </div>
            </div>
          </div>

          <div class="ai-chat__input-row">
            <input
              type="text"
              class="ai-chat__input"
              placeholder="Напишите ваш вопрос..."
              data-chat-input
            />
            <button
              class="ai-chat__send"
              type="button"
              data-action="chat-send"
              aria-label="Отправить"
            >
              ▶
            </button>
          </div>

          <div
            class="ai-chat__note"
            data-ai-chat-status
          >
            Онлайн-ассистент. Для точного расчёта всё равно потребуется менеджер и замер.
          </div>
        </div>
      </div>

      <nav class="app-nav">
        <button class="app-nav__item" data-route="home">Главная</button>
        <button class="app-nav__item" data-route="catalog">Каталог</button>
        <button class="app-nav__item" data-route="order">Заказ</button>
        <button class="app-nav__item" data-route="profile">Профиль</button>
        <button class="app-nav__item" data-route="more">Ещё</button>
      </nav>
    </div>
  `;

  setupRouter();
  renderRoute(initialRoute);

  const chatRoot = getChatRoot();
  if (chatRoot) {
    setupChatSwipe(chatRoot);
  }
}

// ------------------------- ИНИЦИАЛИЗАЦИЯ ----------------------------------

function initApp() {
  renderLayout("home");
}

initApp();
