// src/main.js

// Импорт данных каталога
import { catalogCategories } from "./utils/catalogCategories.js";
import { catalogItems } from "./utils/catalogItems.js";

// Корневой контейнер приложения
const appRoot = document.getElementById("app");

// Состояние выбранной категории каталога (null = показываем список категорий)
let selectedCatalogCategoryId = null;

/**
 * VIEW-ФУНКЦИИ
 * Каждая функция возвращает HTML-разметку для конкретного раздела.
 */

// Главная страница
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

// Каталог: категории + внутренние идеи
function renderCatalog() {
  // Если категория не выбрана — показываем список категорий (первый уровень)
  if (!selectedCatalogCategoryId) {
    const cards = catalogCategories
      .map((cat) => {
        return `
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
        `;
      })
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

  // Если категория выбрана — показываем идеи внутри неё (второй уровень)
  const category = catalogCategories.find((cat) => cat.id === selectedCatalogCategoryId);
  const items = catalogItems.filter((item) => item.categoryId === selectedCatalogCategoryId);

  const itemCards = items
    .map((item) => {
      return `
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
      `;
    })
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

// Страница заказа (позже превратим в калькулятор + форму)
function renderOrder() {
  return `
    <section class="page">
      <h1 class="page__title">Онлайн-заказ мебели</h1>
      <p class="page__subtitle">
        В этом разделе будет максимально простая и продающая форма заказа,
        онлайн-калькулятор, условия оплаты и оформление в кредит.
      </p>
      <div class="page__placeholder">
        На следующих шагах превратим эту страницу в конверсионный экран,
        который отсекает неподходящие заявки и приводит «наших» клиентов.
      </div>
    </section>
  `;
}

// Личный кабинет
function renderProfile() {
  return `
    <section class="page">
      <h1 class="page__title">Личный кабинет</h1>
      <p class="page__subtitle">
        Здесь клиент будет видеть статусы заказов, историю, партнёрский промокод,
        начисленные бонусы и чат с поддержкой.
      </p>
      <div class="page__placeholder">
        Позже мы добавим блоки «Мои заказы», «Партнёрская программа», «Настройки профиля».
      </div>
    </section>
  `;
}

// Раздел «Ещё» — инфо-блоки
function renderMore() {
  return `
    <section class="page">
      <h1 class="page__title">Дополнительно</h1>
      <p class="page__subtitle">
        Информационные разделы: материалы, цены, сроки, документы, акции, о компании,
        дизайн-проект и контакты.
      </p>
      <div class="page__placeholder">
        Здесь позже появится структурированное «меню знаний» о Madera Design и сервисе.
      </div>
    </section>
  `;
}

/**
 * КАРТА РОУТОВ
 */
const VIEWS = {
  home: renderHome,
  catalog: renderCatalog,
  order: renderOrder,
  profile: renderProfile,
  more: renderMore
};

/**
 * Рендер определённого раздела
 */
function renderRoute(route) {
  const viewFn = VIEWS[route] || VIEWS.home;
  const main = document.getElementById("app-main");
  if (!main) return;

  main.innerHTML = viewFn();

  // Подсветка активной кнопки нижней навигации
  const navButtons = appRoot.querySelectorAll(".app-nav__item");
  navButtons.forEach((btn) => {
    const r = btn.getAttribute("data-route");
    btn.classList.toggle("app-nav__item--active", r === route);
  });
}

/**
 * Установка выбранной категории каталога
 */
function setCatalogCategory(categoryId) {
  selectedCatalogCategoryId = categoryId;
  renderRoute("catalog");
}

/**
 * Простой роутер: клики по data-route, data-category-id, data-action
 */
function setupRouter() {
  appRoot.addEventListener("click", (event) => {
    // Переключение разделов
    const routeTarget = event.target.closest("[data-route]");
    if (routeTarget) {
      const route = routeTarget.getAttribute("data-route");
      // При переходе в Каталог с других разделов — сбрасываем выбранную категорию
      if (route === "catalog") {
        selectedCatalogCategoryId = null;
      }
      renderRoute(route);
      return;
    }

    // Клик по категории каталога
    const categoryTarget = event.target.closest("[data-category-id]");
    if (categoryTarget) {
      const categoryId = categoryTarget.getAttribute("data-category-id");
      setCatalogCategory(categoryId);
      return;
    }

    // Кнопка «← Все категории»
    const backTarget = event.target.closest("[data-action='catalog-back']");
    if (backTarget) {
      selectedCatalogCategoryId = null;
      renderRoute("catalog");
      return;
    }
  });
}

/**
 * Рендер оболочки (шапка + контент + нижняя навигация)
 */
function renderLayout(initialRoute = "home") {
  appRoot.innerHTML = `
    <div class="app-shell">
      <header class="app-header">
        <div class="app-header__brand">
          <div class="app-header__logo">Madera Design</div>
          <div class="app-header__tagline">Партнёр в создании современного интерьера</div>
        </div>
        <div class="app-header__cta">
          <button class="btn btn--outline" data-route="order">
            Оформить заказ
          </button>
        </div>
      </header>

      <main class="app-main" id="app-main"></main>

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
}

/**
 * Инициализация приложения
 */
function initApp() {
  renderLayout("home");
}

initApp();
