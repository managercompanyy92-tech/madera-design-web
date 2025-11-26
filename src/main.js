// src/main.js

// ДАННЫЕ КАТАЛОГА
// Предполагаю, что у тебя есть файлы:
//   src/data/catalogCategories.js  (export const catalogCategories = [...])
//   src/data/catalogItems.js       (export const catalogItems = [...])
// Если названия другие — поправь импорты.
import { catalogCategories } from "./data/catalogCategories.js";
import { catalogItems } from "./data/catalogItems.js";

/* ==========================================================================
   ГЛОБАЛЬНОЕ СОСТОЯНИЕ ПРИЛОЖЕНИЯ
   ========================================================================== */

let currentPage = "home"; // 'home' | 'catalog' | 'order' | 'profile' | 'more'
let selectedCatalogCategoryId = null; // id категории каталога

/* ==========================================================================
   ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
   ========================================================================== */

function $(selector) {
  return document.querySelector(selector);
}

function formatPrice(num) {
  if (num == null || Number.isNaN(num)) return "";
  return num.toLocaleString("ru-RU") + " сом";
}

/* ==========================================================================
   РОУТЕР (hash-навигация)
   ========================================================================== */

function applyHashRoute() {
  const hash = window.location.hash || "#home";

  // Каталог с выбранной категорией: #catalog-<id>
  if (hash.startsWith("#catalog-")) {
    const id = hash.replace("#catalog-", "");
    currentPage = "catalog";
    selectedCatalogCategoryId = id || null;
    return;
  }

  switch (hash) {
    case "#catalog":
      currentPage = "catalog";
      selectedCatalogCategoryId = null;
      break;
    case "#order":
      currentPage = "order";
      selectedCatalogCategoryId = null;
      break;
    case "#profile":
      currentPage = "profile";
      selectedCatalogCategoryId = null;
      break;
    case "#more":
      currentPage = "more";
      selectedCatalogCategoryId = null;
      break;
    case "#home":
    default:
      currentPage = "home";
      selectedCatalogCategoryId = null;
      break;
  }
}

function navigateTo(page, options = {}) {
  if (page === "catalog" && options.categoryId) {
    window.location.hash = `#catalog-${options.categoryId}`;
  } else {
    window.location.hash = `#${page}`;
  }
  // hashchange сам вызовет applyHashRoute() и renderApp()
}

/* ==========================================================================
   ШАПКА + НИЖНЯЯ НАВИГАЦИЯ
   ========================================================================== */

function renderShell(innerHtml) {
  return `
    <div class="app-shell">
      <header class="app-header">
        <div class="app-header__brand">
          <div class="app-header__logo">MADERA DESIGN</div>
          <div class="app-header__tagline">
            Партнёр в создании современного интерьера
          </div>
        </div>
        <button class="btn btn--outline" data-action="go-order">
          Оформить заказ
        </button>
      </header>

      <main class="app-main">
        ${innerHtml}
      </main>

      <nav class="app-nav">
        <button class="app-nav__item ${
          currentPage === "home" ? "app-nav__item--active" : ""
        }" data-page="home">
          Главная
        </button>
        <button class="app-nav__item ${
          currentPage === "catalog" ? "app-nav__item--active" : ""
        }" data-page="catalog">
          Каталог
        </button>
        <button class="app-nav__item ${
          currentPage === "order" ? "app-nav__item--active" : ""
        }" data-page="order">
          Заказ
        </button>
        <button class="app-nav__item ${
          currentPage === "profile" ? "app-nav__item--active" : ""
        }" data-page="profile">
          Профиль
        </button>
        <button class="app-nav__item ${
          currentPage === "more" ? "app-nav__item--active" : ""
        }" data-page="more">
          Ещё
        </button>
      </nav>
    </div>
  `;
}

/* ==========================================================================
   ГЛАВНАЯ
   ========================================================================== */

function renderHome() {
  return `
    <section class="page page--home">
      <div class="hero">
        <div class="hero__content">
          <h1 class="hero__title">
            Современная корпусная мебель на заказ в Душанбе
          </h1>
          <p class="hero__subtitle">
            Премиальный сервис, дизайн с поддержкой искусственного интеллекта,
            онлайн-калькулятор стоимости и прозрачный статус заказа на каждом этапе.
          </p>
          <div class="hero__actions">
            <button class="btn btn--primary" data-action="go-order">
              Рассчитать и оформить заказ
            </button>
            <button class="btn btn--ghost" data-action="go-catalog">
              Смотреть каталог идей
            </button>
          </div>
          <div class="hero__note">
            Сделаем интерьер, который впечатляет с первого взгляда —
            и приносит «вау-эффект» каждый день.
          </div>
        </div>

        <aside class="hero__side">
          <div class="hero-card">
            <div class="hero-card__label">AI & Маркетинг</div>
            <ul class="hero-card__list">
              <li>Персональные рекомендации дизайна</li>
              <li>AI-чат 24/7 по мебели и стоимости</li>
              <li>Визуализация интерьера до заказа</li>
              <li>Прозрачный статус заказа в приложении</li>
            </ul>
          </div>
        </aside>
      </div>

      <section class="highlights">
        <article class="highlights__item">
          <h3 class="highlights__title">Премиальный дизайн</h3>
          <p class="highlights__text">
            Тщательно продуманные сценарии освещения, хранения и эргономики под вашу планировку.
          </p>
        </article>
        <article class="highlights__item">
          <h3 class="highlights__title">Цифровая воронка продаж</h3>
          <p class="highlights__text">
            Квиз-каталог, быстрый расчёт и прозрачный онбординг клиента — всё в одном веб-приложении.
          </p>
        </article>
        <article class="highlights__item">
          <h3 class="highlights__title">Сделано для Душанбе</h3>
          <p class="highlights__text">
            Работаем с проверенными подрядчиками, адаптируем решения под местный рынок и планировки.
          </p>
        </article>
      </section>
    </section>
  `;
}

/* ==========================================================================
   КАТАЛОГ
   ========================================================================== */

// Квиз вверху каталога (маркетинговый блок)
function renderCatalogQuiz() {
  return `
    <!-- Мини-квиз: с чего начинаете интерьер -->
    <div class="catalog-quiz">
      <div class="catalog-quiz__block">
        <div class="catalog-quiz__label">1. Что планируете в первую очередь?</div>
        <div class="catalog-quiz__options">
          <button class="catalog-quiz__option">Кухня</button>
          <button class="catalog-quiz__option">Гардеробная</button>
          <button class="catalog-quiz__option">Спальня</button>
          <button class="catalog-quiz__option">Детская</button>
          <button class="catalog-quiz__option">Прихожая</button>
          <button class="catalog-quiz__option">Гостиная</button>
        </div>
      </div>

      <div class="catalog-quiz__block">
        <div class="catalog-quiz__label">2. Цель проекта</div>
        <div class="catalog-quiz__options">
          <button class="catalog-quiz__option">Для себя надолго</button>
          <button class="catalog-quiz__option">Квартира под сдачу</button>
          <button class="catalog-quiz__option">Готовлю к продаже</button>
        </div>
      </div>

      <div class="catalog-quiz__block">
        <div class="catalog-quiz__label">3. Примерный бюджет на мебель</div>
        <div class="catalog-quiz__options">
          <button class="catalog-quiz__option">до 15&nbsp;000 сом</button>
          <button class="catalog-quiz__option">15–30&nbsp;000 сом</button>
          <button class="catalog-quiz__option">выше 30&nbsp;000 сом</button>
        </div>
      </div>

      <div class="catalog-quiz__footer">
        <div class="catalog-quiz__text">
          Даже если вы пока «просто смотрите идеи», квиз помогает подобрать
          более точные сценарии под вашу ситуацию.
        </div>
        <div class="catalog-quiz__actions">
          <button class="btn btn--ghost" data-action="go-order">
            Перейти к быстрому расчёту
          </button>
          <button class="btn btn--outline" data-action="open-ai-designer">
            Спросить AI-дизайнера, с чего начать
          </button>
        </div>
      </div>
    </div>
  `;
}

// Блок про скидки, который идёт под квизом
function renderCatalogDiscountInfo() {
  return `
    <div class="catalog-discount-info">
      <div class="catalog-discount-info__title">Скидки и на заказ</div>
      <ul class="catalog-discount-info__list">
        <li>5% скидка — если оформляете заказ напрямую через компанию</li>
        <li>10% скидка — если укажете промокод партнёра</li>
        <li>Партнёры получают 5% от суммы каждого приведённого заказа</li>
      </ul>
      <div class="catalog-discount-info__note">
        Мы принимаем заказы от 3 погонных метров и выше.
      </div>
    </div>
  `;
}

// Первый уровень: список категорий
function renderCatalogCategories() {
  const cards = catalogCategories
    .map((cat) => {
      return `
        <button
          class="catalog-category-card"
          data-category-id="${cat.id}"
        >
          <div class="catalog-category-card__image-wrap">
            <img
              src="${cat.cover || cat.image || ""}"
              alt="${cat.name || cat.title || ""}"
              class="catalog-category-card__img"
            />
          </div>

          <div class="catalog-category-card__bottom">
            <div class="catalog-category-card__title-row">
              <div class="catalog-category-card__title">
                ${cat.name || cat.title || ""}
              </div>
              <div class="catalog-category-card__arrow">›</div>
            </div>

            <div class="catalog-category-card__info">
              ${
                cat.tagline
                  ? `<div class="catalog-category-tagline">${cat.tagline}</div>`
                  : ""
              }
              ${
                cat.benefit
                  ? `<div class="catalog-category-benefit">${cat.benefit}</div>`
                  : ""
              }
              ${
                cat.statsLabel
                  ? `<div class="catalog-category-stats">${cat.statsLabel}</div>`
                  : ""
              }
              ${
                cat.discountLabel
                  ? `
                <div class="catalog-category-card__discount">
                  <div class="catalog-category-card__discount-badge">
                    Скидки и бонусы
                  </div>
                  <div class="catalog-category-card__discount-text">
                    ${cat.discountLabel}
                  </div>
                </div>`
                  : ""
              }
            </div>
          </div>
        </button>
      `;
    })
    .join("");

  return `
    <section class="page page--catalog">
      <h1 class="page__title">Каталог мебели</h1>
      <p class="page__subtitle">
        Выберите направление, в котором планируете начинать интерьер.
        Дальше покажем идеи, а затем — ориентировочный расчёт стоимости под вашу квартиру.
      </p>

      ${renderCatalogQuiz()}
      ${renderCatalogDiscountInfo()}

      <div class="catalog-categories">
        <div class="catalog-categories-grid">
          ${cards}
        </div>
      </div>
    </section>
  `;
}

// Второй уровень: идеи внутри выбранной категории
function renderCatalogCategoryDetails() {
  const category = catalogCategories.find(
    (c) => String(c.id) === String(selectedCatalogCategoryId)
  );

  const items = catalogItems.filter(
    (item) => String(item.categoryId) === String(selectedCatalogCategoryId)
  );

  const itemCards = items
    .map((item) => {
      return `
        <article class="catalog-item-card">
          <div class="catalog-item-card__image-wrap">
            <img
              src="${item.image || ""}"
              alt="${item.title || ""}"
              class="catalog-item-card__img"
            />
          </div>
          <div class="catalog-item-card__info">
            <div class="catalog-item-card__title">${item.title || ""}</div>
            ${
              item.description
                ? `<div class="catalog-item-card__desc">${item.description}</div>`
                : ""
            }
            ${
              item.priceFrom
                ? `<div class="catalog-item-card__meta">
                    Примерный чек клиентов: от ${formatPrice(item.priceFrom)}
                  </div>`
                : ""
            }
            <button class="btn btn--ghost catalog-item-card__btn" data-action="go-order">
              Рассчитать такой проект
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  return `
    <section class="page page--catalog">
      <button class="catalog-back" data-action="catalog-back">
        ← Все категории
      </button>

      <h1 class="page__title">
        ${category ? category.name || category.title : "Категория"}
      </h1>
      <p class="page__subtitle">
        Выберите идею, которая ближе к вашему вкусу. На следующих шагах
        адаптируем дизайн под размеры вашей квартиры и посчитаем стоимость.
      </p>

      <!-- ВНИМАНИЕ: длинный текст про визуализации УДАЛЁН. 
           Никакого блока catalog-ideas-note здесь больше нет. -->

      <div class="catalog-items-grid">
        ${
          itemCards ||
          "<div class='page__placeholder'>Идеи для этой категории появятся чуть позже.</div>"
        }
      </div>
    </section>
  `;
}

function renderCatalog() {
  // если категория не выбрана – показываем список категорий
  if (!selectedCatalogCategoryId) {
    return renderCatalogCategories();
  }
  // иначе – внутренние идеи
  return renderCatalogCategoryDetails();
}

/* ==========================================================================
   СТРАНИЦА ЗАКАЗА (упрощённая версия, но рабочая)
   ========================================================================== */

function renderOrder() {
  return `
    <section class="page page--order">
      <h1 class="page__title">Онлайн-расчёт и заявка</h1>
      <p class="page__subtitle">
        Укажите примерные параметры проекта — система подскажет диапазон бюджета
        и подготовит заявку на детальный расчёт.
      </p>

      <div class="order-layout">
        <div class="order-calc">
          <div class="order-calc__header">
            <div class="order-calc__title">Быстрый расчёт кухни или гардеробной</div>
            <div class="order-calc__tag">Черновой расчёт</div>
          </div>

          <div class="order-calc__row">
            <div class="order-calc__label">Примерная длина мебели, погонные метры</div>
            <input
              type="number"
              min="0"
              step="0.1"
              id="order-length"
              class="order-calc__input"
              placeholder="Например, 3.5"
            />
            <div class="order-calc__hint">
              Мы принимаем заказы от 3 погонных метров и выше.
            </div>
          </div>

          <div class="order-calc__row">
            <div class="order-calc__label">Тариф</div>
            <div class="order-calc__tariffs">
              <label class="order-calc-tariff">
                <input type="radio" name="order-tariff" value="9000" checked />
                <div class="order-calc-tariff__body">
                  <span class="order-calc-tariff__name">Старт</span>
                  <span class="order-calc-tariff__price">от 9 000 сом/п.м.</span>
                  <span class="order-calc-tariff__desc">
                    Базовые решения с хорошими материалами.
                  </span>
                </div>
              </label>

              <label class="order-calc-tariff">
                <input type="radio" name="order-tariff" value="13000" />
                <div class="order-calc-tariff__body">
                  <span class="order-calc-tariff__name">Комфорт</span>
                  <span class="order-calc-tariff__price">от 13 000 сом/п.м.</span>
                  <span class="order-calc-tariff__desc">
                    Баланс дизайна, фурнитуры и фишек хранения.
                  </span>
                </div>
              </label>

              <label class="order-calc-tariff">
                <input type="radio" name="order-tariff" value="17000" />
                <div class="order-calc-tariff__body">
                  <span class="order-calc-tariff__name">Премиум</span>
                  <span class="order-calc-tariff__price">от 17 000 сом/п.м.</span>
                  <span class="order-calc-tariff__desc">
                    Максимум дизайна, фурнитуры и индивидуальных решений.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div class="order-calc__row">
            <div class="order-calc__label">Тип скидки</div>
            <div class="order-calc__tariffs">
              <label class="order-calc-tariff">
                <input type="radio" name="order-discount" value="0" checked />
                <div class="order-calc-tariff__body">
                  <span class="order-calc-tariff__name">Без скидки</span>
                  <span class="order-calc-tariff__desc">
                    Просто черновой расчёт без учёта скидок.
                  </span>
                </div>
              </label>

              <label class="order-calc-tariff">
                <input type="radio" name="order-discount" value="5" />
                <div class="order-calc-tariff__body">
                  <span class="order-calc-tariff__name">Клиент компании −5%</span>
                  <span class="order-calc-tariff__desc">
                    Заказ оформляется напрямую через Madera Design.
                  </span>
                </div>
              </label>

              <label class="order-calc-tariff">
                <input type="radio" name="order-discount" value="10" />
                <div class="order-calc-tariff__body">
                  <span class="order-calc-tariff__name">По промокоду партнёра −10%</span>
                  <span class="order-calc-tariff__desc">
                    Партнёр получает 5% от суммы заказа.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div class="order-calc__actions">
            <button class="btn btn--primary" id="order-calc-btn">
              Посчитать ориентировочную стоимость
            </button>
            <div class="order-calc__note">
              Итог не является публичной офертой — окончательная стоимость
              фиксируется в коммерческом предложении и договоре.
            </div>
          </div>

          <div class="order-calc__result" id="order-calc-result"></div>
        </div>

        <aside class="order-info">
          <div class="order-info__card">
            <div class="order-info__badge">Как мы работаем</div>
            <div class="order-info__title">Цифровая воронка для ваших заявок</div>
            <ul class="order-info__list">
              <li>Вы заполняете параметры и оставляете контакты</li>
              <li>Менеджер уточняет детали и присылает КП</li>
              <li>После согласования запускаем производство</li>
            </ul>
          </div>

          <div class="order-info__next">
            <div class="order-info__next-text">
              Хотите обсудить проект с AI-дизайнером до заявки?
            </div>
            <button class="btn btn--outline" data-action="open-ai-designer">
              Задать вопрос AI-ассистенту
            </button>
          </div>
        </aside>
      </div>
    </section>
  `;
}

/* ==========================================================================
   ПРОФИЛЬ / ЕЩЁ (заглушки)
   ========================================================================== */

function renderProfile() {
  return `
    <section class="page">
      <h1 class="page__title">Профиль</h1>
      <p class="page__subtitle">
        В будущих релизах здесь появится личный кабинет клиента:
        статусы заказов, история проектов и рекомендации.
      </p>
      <div class="page__placeholder">
        Сейчас раздел в разработке. Оставьте заявку через вкладку «Заказ» —
        и мы свяжемся с вами лично.
      </div>
    </section>
  `;
}

function renderMore() {
  return `
    <section class="page">
      <h1 class="page__title">Ещё</h1>
      <p class="page__subtitle">
        Дополнительные разделы и сервисы будут появляться здесь по мере развития Madera Design.
      </p>
      <div class="page__placeholder">
        Если вы блогер, дизайнер или застройщик и хотите стать партнёром,
        расскажите о себе в заявке — мы предложим условия сотрудничества.
      </div>
    </section>
  `;
}

/* ==========================================================================
   ВЫБОР СТРАНИЦЫ
   ========================================================================== */

function renderPage() {
  switch (currentPage) {
    case "home":
      return renderHome();
    case "catalog":
      return renderCatalog();
    case "order":
      return renderOrder();
    case "profile":
      return renderProfile();
    case "more":
      return renderMore();
    default:
      return renderHome();
  }
}

/* ==========================================================================
   РЕНДЕР ВСЕГО ПРИЛОЖЕНИЯ
   ========================================================================== */

function renderApp() {
  const root = document.getElementById("app");
  if (!root) return;

  const pageHtml = renderPage();
  root.innerHTML = renderShell(pageHtml);

  attachEvents();
}

/* ==========================================================================
   СОБЫТИЯ
   ========================================================================== */

function attachEvents() {
  const root = document.getElementById("app");
  if (!root) return;

  // Нижняя навигация
  root.querySelectorAll(".app-nav__item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = btn.getAttribute("data-page");
      if (!page) return;
      navigateTo(page);
    });
  });

  // Кнопки "оформить заказ" / "перейти к расчёту"
  root.querySelectorAll('[data-action="go-order"]').forEach((btn) => {
    btn.addEventListener("click", () => navigateTo("order"));
  });

  // Кнопка "перейти в каталог"
  root.querySelectorAll('[data-action="go-catalog"]').forEach((btn) => {
    btn.addEventListener("click", () => navigateTo("catalog"));
  });

  // Клик по категории каталога
  root
    .querySelectorAll(".catalog-category-card[data-category-id]")
    .forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-category-id");
        if (!id) return;
        navigateTo("catalog", { categoryId: id });
      });
    });

  // Кнопка "назад ко всем категориям"
  const backBtn = root.querySelector('[data-action="catalog-back"]');
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      navigateTo("catalog");
    });
  }

  // Калькулятор на странице заказа
  const calcBtn = $("#order-calc-btn");
  if (calcBtn) {
    calcBtn.addEventListener("click", handleOrderCalc);
  }
}

/* ==========================================================================
   ЛОГИКА КАЛЬКУЛЯТОРА
   ========================================================================== */

function handleOrderCalc() {
  const lengthInput = $("#order-length");
  const resultEl = $("#order-calc-result");
  if (!lengthInput || !resultEl) return;

  const lengthValue = parseFloat(lengthInput.value.replace(",", "."));
  if (!lengthValue || lengthValue <= 0) {
    resultEl.innerHTML =
      '<div class="order-calc__result-error">Укажите, пожалуйста, длину мебели.</div>';
    return;
  }

  if (lengthValue < 3) {
    resultEl.innerHTML =
      '<div class="order-calc__result-error">Мы принимаем заказы от 3 погонных метров и выше.</div>';
    return;
  }

  const tariffRadio = document.querySelector(
    'input[name="order-tariff"]:checked'
  );
  const discountRadio = document.querySelector(
    'input[name="order-discount"]:checked'
  );

  const pricePerMeter = tariffRadio ? Number(tariffRadio.value) : 9000;
  const discountPercent = discountRadio ? Number(discountRadio.value) : 0;

  const basePrice = lengthValue * pricePerMeter;
  const discountAmount = (basePrice * discountPercent) / 100;
  const finalPrice = basePrice - discountAmount;

  let discountText = "Без скидки.";
  if (discountPercent === 5) {
    discountText =
      "5% скидка — заказ оформляется напрямую через компанию Madera Design.";
  } else if (discountPercent === 10) {
    discountText =
      "10% скидка по промокоду партнёра. Партнёр получает 5% от суммы заказа.";
  }

  resultEl.innerHTML = `
    <div class="order-calc__result-ok">
      <div class="order-calc__result-main">
        Ориентировочная стоимость мебели:
        <span class="order-calc__result-price">${formatPrice(
          finalPrice
        )}</span>
      </div>
      <div class="order-calc__result-details">
        Расчёт сделан из ${lengthValue.toFixed(
          1
        )} погонных метров по тарифу ~${formatPrice(
    pricePerMeter
  )} за метр с учётом выбранной скидки.
      </div>
      <div class="order-calc__result-next">
        ${discountText} Точный расчёт вы получите после замера и согласования комплектации.
      </div>
    </div>
  `;
}

/* ==========================================================================
   ИНИЦИАЛИЗАЦИЯ
   ========================================================================== */

function init() {
  applyHashRoute();
  renderApp();

  window.addEventListener("hashchange", () => {
    applyHashRoute();
    renderApp();
  });
}

document.addEventListener("DOMContentLoaded", init);
