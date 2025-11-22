// src/main.js

// Корневой контейнер приложения
const appRoot = document.getElementById('app');

/**
 * VIEW-ФУНКЦИИ
 * Каждая функция возвращает HTML-разметку для конкретного «экрана» (раздела).
 */

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

function renderCatalog() {
  return `
    <section class="page">
      <h1 class="page__title">Каталог мебели</h1>
      <p class="page__subtitle">
        Вдохновляющие дизайн-идеи для кухонь, гостиных, спален, детских и гардеробных.
        На старте это концепты, которые мы адаптируем под вашу квартиру.
      </p>
      <div class="page__placeholder">
        Здесь появится интерактивный каталог с фильтрами по стилю,
        AI-рекомендациями и привязкой к онлайн-калькулятору стоимости.
      </div>
    </section>
  `;
}

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
 * КАРТА РОУТОВ (разделов)
 */
const VIEWS = {
  home: renderHome,
  catalog: renderCatalog,
  order: renderOrder,
  profile: renderProfile,
  more: renderMore
};

/**
 * РЕНДЕР ОПРЕДЕЛЁННОГО РАЗДЕЛА
 */
function renderRoute(route) {
  const viewFn = VIEWS[route] || VIEWS.home;
  const main = document.getElementById('app-main');
  if (!main) return;

  main.innerHTML = viewFn();

  // Подсветка активной кнопки нижней навигации
  const navButtons = appRoot.querySelectorAll('.app-nav__item');
  navButtons.forEach((btn) => {
    const r = btn.getAttribute('data-route');
    btn.classList.toggle('app-nav__item--active', r === route);
  });
}

/**
 * РЕНДЕР ОБОЛОЧКИ ПРИЛОЖЕНИЯ (шапка + контент + нижняя навигация)
 */
function renderLayout(initialRoute = 'home') {
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
 * ПРОСТОЙ РОУТЕР НА ОСНОВЕ ДЕЛЕГАЦИИ СОБЫТИЙ
 * Любой элемент с атрибутом data-route будет переключать раздел.
 */
function setupRouter() {
  appRoot.addEventListener('click', (event) => {
    const target = event.target.closest('[data-route]');
    if (!target) return;

    const route = target.getAttribute('data-route');
    renderRoute(route);
  });
}

/**
 * ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
 */
function initApp() {
  renderLayout('home');
}

initApp();
