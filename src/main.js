// src/main.js

// Импорт данных каталога
import { catalogCategories } from "./utils/catalogCategories.js";
import { catalogItems } from "./utils/catalogItems.js";

// Тарифы за погонный метр (сомони)
const BASE_RATES = {
  standard: 4000, // ЛДСП фасады
  premium: 5000   // МДФ фасады
};

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

// Раздел «Заказ»: калькулятор + форма + маркетинг
function renderOrder() {
  return `
    <section class="page page--order">
      <h1 class="page__title">Онлайн-калькулятор и заказ мебели</h1>
      <p class="page__subtitle">
        Оцените базовую стоимость вашего проекта за несколько секунд. Это ориентировочный расчёт — 
        точную цену вы получите после замера и согласования дизайн-проекта.
      </p>

      <div class="order-layout">
        <!-- Левая колонка: калькулятор + форма -->
        <div>
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
                Минимальный объём заказа — <strong>3 пог. метра</strong>. Меньшие проекты мы не принимаем.
              </div>
            </div>

            <div class="order-calc__row">
              <div class="order-calc__label">
                Материал и тариф
              </div>
              <div class="order-calc__tariffs">
                <label class="order-calc-tariff">
                  <input
                    type="radio"
                    name="tariff"
                    value="standard"
                    checked
                  />
                  <span class="order-calc-tariff__body">
                    <span class="order-calc-tariff__name">Стандарт</span>
                    <span class="order-calc-tariff__price">≈ ${BASE_RATES.standard.toLocaleString("ru-RU")} сом / п.м.</span>
                    <span class="order-calc-tariff__desc">
                      Корпус и фасады из ЛДСП, фурнитура Blum или аналог высокого качества.
                    </span>
                  </span>
                </label>

                <label class="order-calc-tariff">
                  <input
                    type="radio"
                    name="tariff"
                    value="premium"
                  />
                  <span class="order-calc-tariff__body">
                    <span class="order-calc-tariff__name">Премиум</span>
                    <span class="order-calc-tariff__price">≈ ${BASE_RATES.premium.toLocaleString("ru-RU")} сом / п.м.</span>
                    <span class="order-calc-tariff__desc">
                      Корпус из ЛДСП, фасады из турецкого МДФ, фурнитура Blum. Премиальный внешний вид.
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
                Расчёт предварительный и не учитывает сложные формы, встроенную технику и нестандартные решения.
              </div>
            </div>

            <div class="order-calc__result">
              Введите длину и выберите тариф, затем нажмите «Рассчитать стоимость».
            </div>
          </div>

          <!-- Форма заявки, связанная с калькулятором -->
          <div class="order-form">
            <div class="order-form__header">
              <div class="order-form__title">Заявка на замер и расчёт</div>
              <div class="order-form__subtitle">
                Заполните контактные данные — менеджер свяжется с вами, уточнит детали и сделает точный расчёт.
              </div>
            </div>

            <div class="order-form__grid">
              <div class="order-form__row">
                <label class="order-form__label">Ваше имя*</label>
                <input
                  type="text"
                  class="order-form__input"
                  placeholder="Как к вам обращаться?"
                  data-order-name
                />
              </div>

              <div class="order-form__row">
                <label class="order-form__label">Телефон / WhatsApp*</label>
                <input
                  type="tel"
                  class="order-form__input"
                  placeholder="+992 ..."
                  data-order-phone
                />
              </div>

              <div class="order-form__row">
                <label class="order-form__label">Предпочтительный способ связи</label>
                <select class="order-form__select" data-order-contact-method>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="telegram">Telegram</option>
                  <option value="call">Телефонный звонок</option>
                </select>
              </div>

              <div class="order-form__row">
                <label class="order-form__label">Категория мебели</label>
                <select class="order-form__select" data-order-category>
                  <option value="">Выберите категорию</option>
                  <option value="kitchens">Кухни</option>
                  <option value="bedrooms">Спальни</option>
                  <option value="living">Гостиные</option>
                  <option value="wardrobes">Гардеробные</option>
                  <option value="hallways">Прихожие</option>
                  <option value="kids">Детская мебель</option>
                </select>
              </div>

              <div class="order-form__row">
                <label class="order-form__label">Длина проекта, пог. метры (из калькулятора)</label>
                <input
                  type="text"
                  class="order-form__input"
                  placeholder="Например, 4.5"
                  data-order-length-output
                />
              </div>

              <div class="order-form__row">
                <label class="order-form__label">Выбранный тариф</label>
                <input
                  type="text"
                  class="order-form__input"
                  placeholder="Стандарт / Премиум"
                  data-order-tariff-output
                />
              </div>

              <div class="order-form__row">
                <label class="order-form__label">Промокод (если есть)</label>
                <input
                  type="text"
                  class="order-form__input"
                  placeholder="Введите промокод"
                  data-order-promo
                />
              </div>

              <div class="order-form__row order-form__row--full">
                <label class="order-form__label">Кратко опишите проект</label>
                <textarea
                  class="order-form__textarea"
                  rows="3"
                  placeholder="Кухня в современной квартире, примерно 4.5 м, нужен встроенный холодильник и духовой шкаф..."
                  data-order-comment
                ></textarea>
              </div>

              <div class="order-form__row order-form__row--full">
                <label class="order-form__label">Насколько вы настроены на заказ? (отбор «наших» клиентов)</label>
                <select class="order-form__select" data-order-readiness>
                  <option value="soon">Готов(а) заказать в ближайший месяц</option>
                  <option value="thinking">Пока изучаю варианты и цены</option>
                  <option value="just-looking">Просто смотрю идеи на будущее</option>
                </select>
              </div>

              <div class="order-form__row order-form__row--full order-form__row--checkbox">
                <label class="order-form__checkbox">
                  <input type="checkbox" data-order-minagree />
                  <span>Я понимаю, что минимальный объём заказа — 3 погонных метра и согласен(на) с этим условием</span>
                </label>
              </div>
            </div>

            <div class="order-form__footer">
              <button class="btn btn--primary" data-action="submit-order">
                Отправить заявку на расчёт
              </button>
              <div class="order-form__note">
                Нажимая на кнопку, вы отправляете заявку менеджеру Madera Design. Мы не передаём данные третьим лицам.
              </div>
              <div class="order-form__result" data-order-result></div>
            </div>
          </div>
        </div>

        <!-- Правая колонка: маркетинг + следующий шаг -->
        <div class="order-info">
          <div class="order-info__card">
            <div class="order-info__badge">Маркетинг & доверие</div>
            <h2 class="order-info__title">Почему клиенты выбирают Madera Design</h2>
            <ul class="order-info__list">
              <li>Прозрачные тарифы: 4000 / 5000 сомони за погонный метр без скрытых доплат.</li>
              <li>Договор, сроки и статус заказа — всегда под рукой в веб-приложении.</li>
              <li>AI-помощник подбирает идеи дизайна под ваш стиль и бюджет.</li>
              <li>Послепродажный сервис и настройка фурнитуры в течение года.</li>
            </ul>
          </div>

          <div class="order-info__next">
            <div class="order-info__next-text">
              Готовы обсудить проект? После заявки менеджер свяжется с вами и создаст заказ в системе с отслеживанием статуса.
            </div>
            <button class="btn btn--outline" data-route="profile">
              Перейти к оформлению и статусам заказов
            </button>
          </div>
        </div>
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
 * Обработчик расчёта стоимости
 */
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

  const tariff = tariffInput.value;
  const rate = BASE_RATES[tariff] || BASE_RATES.standard;
  const basePrice = length * rate;

  const formatter = new Intl.NumberFormat("ru-RU");

  if (length < 3) {
    resultBox.innerHTML = `
      <div class="order-calc__result-error">
        Минимальный объём заказа — 3 погонных метра. Сейчас указано: ${length.toFixed(
          1
        )} м.<br />
        Пожалуйста, скорректируйте длину или обсудите с менеджером индивидуально.
      </div>
    `;
    return;
  }

  // Заполняем форму заявки данными из калькулятора
  const lengthField = main.querySelector("[data-order-length-output]");
  const tariffField = main.querySelector("[data-order-tariff-output]");

  if (lengthField) {
    lengthField.value = length.toFixed(1);
  }
  if (tariffField) {
    tariffField.value = tariff === "premium" ? "Премиум" : "Стандарт";
  }

  resultBox.innerHTML = `
    <div class="order-calc__result-ok">
      <div class="order-calc__result-main">
        Ориентировочная стоимость проекта при длине
        <strong>${length.toFixed(1)} пог. м</strong> и тарифе
        <strong>${tariff === "premium" ? "Премиум" : "Стандарт"}</strong>:
      </div>
      <div class="order-calc__result-price">
        ≈ ${formatter.format(basePrice)} сомони
      </div>
      <div class="order-calc__result-details">
        Это базовая цена без учёта сложных форм, встроенной техники и нестандартных решений.
        Точный расчёт вы получите после замера и утверждения дизайн-проекта.
      </div>
      <div class="order-calc__result-next">
        Следующий шаг: отправьте заявку через форму ниже — менеджер свяжется с вами для точного расчёта.
      </div>
    </div>
  `;
}

/**
 * Обработчик отправки заявки
 */
function handleOrderSubmit() {
  const main = document.getElementById("app-main");
  if (!main) return;

  const nameInput = main.querySelector("[data-order-name]");
  const phoneInput = main.querySelector("[data-order-phone]");
  const categorySelect = main.querySelector("[data-order-category]");
  const lengthOutput = main.querySelector("[data-order-length-output]");
  const tariffOutput = main.querySelector("[data-order-tariff-output]");
  const promoInput = main.querySelector("[data-order-promo]");
  const commentInput = main.querySelector("[data-order-comment]");
  const readinessSelect = main.querySelector("[data-order-readiness]");
  const minAgreeCheckbox = main.querySelector("[data-order-minagree]");
  const resultBox = main.querySelector("[data-order-result]");

  if (!resultBox) return;

  const name = (nameInput?.value || "").trim();
  const phone = (phoneInput?.value || "").trim();
  const category = categorySelect?.value || "";
  const lengthStr = (lengthOutput?.value || "").replace(",", ".");
  const length = parseFloat(lengthStr);
  const tariffText = (tariffOutput?.value || "").trim();
  const promo = (promoInput?.value || "").trim();
  const comment = (commentInput?.value || "").trim();
  const readiness = readinessSelect?.value || "soon";
  const minAgree = !!minAgreeCheckbox?.checked;

  // Простая валидация
  if (!name || !phone) {
    resultBox.innerHTML = `
      <div class="order-form__result-error">
        Пожалуйста, укажите ваше имя и телефон для связи.
      </div>
    `;
    return;
  }

  if (!minAgree) {
    resultBox.innerHTML = `
      <div class="order-form__result-error">
        Для продолжения необходимо подтвердить, что вы согласны с минимальным объёмом заказа 3 погонных метра.
      </div>
    `;
    return;
  }

  if (!Number.isNaN(length) && length < 3) {
    resultBox.innerHTML = `
      <div class="order-form__result-error">
        В заявке указана длина менее 3 погонных метров. Уточните длину или обсудите с менеджером возможные варианты.
      </div>
    `;
    return;
  }

  // Заготовка для интеграции с backend / CRM
  const payload = {
    name,
    phone,
    category,
    length: Number.isNaN(length) ? null : length,
    tariff: tariffText || null,
    promo: promo || null,
    comment: comment || null,
    readiness,
    minAgree
  };
  console.log("ORDER_PAYLOAD", payload);

  resultBox.innerHTML = `
    <div class="order-form__result-ok">
      <div class="order-form__result-main">
        Заявка отправлена. Менеджер Madera Design свяжется с вами для уточнения деталей и точного расчёта.
      </div>
      <div class="order-form__result-sub">
        Если вы указали WhatsApp или Telegram, ответ придёт туда. В рабочее время мы обычно отвечаем в течение дня.
      </div>
    </div>
  `;
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

    // Кнопка расчёта стоимости
    const calcTarget = event.target.closest("[data-action='calc-price']");
    if (calcTarget) {
      handleCalcPrice();
      return;
    }

    // Кнопка отправки заявки
    const submitTarget = event.target.closest("[data-action='submit-order']");
    if (submitTarget) {
      handleOrderSubmit();
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
