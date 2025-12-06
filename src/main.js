// src/main.js 

import { catalogCategories } from "./utils/catalogCategories.js";
import { catalogItems } from "./utils/catalogItems.js";

// Тарифы за погонный метр (сомони)
const BASE_RATES = {
  standard: 4000,
  premium: 5000,
};

const appRoot = document.getElementById("app");
let selectedCatalogCategoryId = null;

/* ------------------------------ VIEW-ФУНКЦИИ ------------------------------ */

function renderHome() {
  return `
    <style>
    .hero-face-btn-wrapper {
  position: relative;
  display: inline-block;
}

.hero-face-btn-wrapper::before {
  content: "";
  position: absolute;
  top: -5px;      /* регулирует расстояние сверху */
  bottom: -5px;   /* регулирует расстояние снизу */
  left: -3px;    /* увеличь это значение – появится обводка слева */
  right: -3px;   /* увеличь это значение – появится обводка справа */

  border-radius: 80px; 
  border: 2px solid rgba(255,140,0,0.6);
  box-shadow: 0 0 18px rgba(255,140,0,0.8);
  pointer-events: none; 
  animation: heroBtnOutlinePulse 2.2s infinite ease-in-out;
}

@keyframes heroBtnOutlinePulse {
  0%   { transform: scale(1); opacity: 0.8; }
  50%  { transform: scale(1.06); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
}
/* Уменьшение кнопки — основной регулятор */
.hero-face-btn {
  padding: 6px 12px !important;   /* было 16–22px → уменьшили */
  font-size: 14px !important;       /* было 16px → уменьшили */
  border-radius: 20px !important;   /* было ~26px → уменьшили */
  min-width: 160px !important;      /* если стоит фикс, уменьшаем */
}

/* Уменьшаем светящуюся обводку */
.hero-face-btn::before {
  transform: scale(0.88) !important;   /* уменьшает glowing-ring */
}

.hero-face-btn::after {
  transform: scale(0.92) !important;
}
    /* Базовый масштаб кнопки */
:root {
  --hero-btn-scale: 0.92;  /* УМЕНЬШАЙ ИЛИ УВЕЛИЧИВАЙ ТОЛЬКО ЭТО ЗНАЧЕНИЕ */
}
      /* Обводка и фон для трёх нижних блоков на главной */
      .highlights__item--accent {
        border: 1px solid rgba(255, 140, 0, 0.7);
        border-radius: 20px;
        background: rgba(255, 140, 0, 0.04);
        padding: 20px;
      }

      /* ГЛАВНАЯ КНОПКА: ярко-оранжевый фон + свечение + пульс */
      .hero-face-btn.hero-face-btn--primary {
        position: relative;
        z-index: 1;
        overflow: visible;

        /* более оранжевый фон */
        background: linear-gradient(135deg, #ff7a00 0%, #ff9a1f 50%, #ff7a00 100%) !important;
        background-color: #ff7a00 !important;
        color: #1f1200 !important;

        font-weight: 600;

        /* мощное свечение самой кнопки */
        box-shadow:
          0 0 22px rgba(255, 122, 0, 0.75),
          0 6px 14px rgba(0, 0, 0, 0.45);

        border: none !important;
        transform: translateY(0);
        transition: 0.25s ease;

        /* лёгкий пульс всей кнопки */
        animation: brightPulse 2.2s infinite ease-in-out;
      }
      /* Уменьшаем кнопку и всё содержимое */
      .hero-face-btn.hero-face-btn--primary {
  position: relative;
  background: #ff8c00;
  color: #000;
  font-weight: 600;
  border-radius: 40px;
  padding: 14px 22px;
  border: none;
  transform: scale(var(--hero-btn-scale));
  transform-origin: center;
  animation: brightPulse 2.4s infinite ease-in-out;
}

/* Но во время пульса — тоже уменьшаем */
@keyframes brightPulse {
  0% {
    transform: scale(0.88);
  }
  50% {
    transform: scale(0.93);       /* лёгкое увеличение, но аккуратное */
  }
  100% {
    transform: scale(0.88);
  }
}

/* Анимация обводки — тоже уменьшаем */
@keyframes borderGlow {
  0% {
    transform: scale(0.88);
  }
  50% {
    transform: scale(0.95);        /* чуть увеличивается, но аккуратно */
  }
  100% {
    transform: scale(0.88);
  }
}

      /* Светящаяся обводка вокруг кнопки */
      .hero-face-btn.hero-face-btn--primary::before {
        content: "";
        position: absolute;
        inset: -6px;              /* отступ обводки от кнопки */
        border-radius: inherit;   /* повторяем форму кнопки */

        border: 2px solid rgba(255, 140, 0, 0.9);
        box-shadow: 0 0 24px rgba(255, 140, 0, 0.9);
        opacity: 0.7;

        z-index: -1;

        /* «дышащая» анимация обводки */
        animation: borderGlow 2.4s infinite ease-in-out;
      }

      /* Поведение при наведении (hover) */
      .hero-face-btn.hero-face-btn--primary:hover {
        transform: translateY(-2px) scale(1.03);
        box-shadow:
          0 0 30px rgba(255, 140, 0, 1),
          0 8px 18px rgba(0, 0, 0, 0.5);
      }

      /* Пульс самой кнопки */
      @keyframes brightPulse {
        0% {
          box-shadow:
            0 0 18px rgba(255, 122, 0, 0.6),
            0 6px 14px rgba(0, 0, 0, 0.45);
          transform: scale(1);
        }
        50% {
          box-shadow:
            0 0 32px rgba(255, 140, 0, 0.95),
            0 6px 14px rgba(0, 0, 0, 0.45);
          transform: scale(1.03);
        }
        100% {
          box-shadow:
            0 0 18px rgba(255, 122, 0, 0.6),
            0 6px 14px rgba(0, 0, 0, 0.45);
          transform: scale(1);
        }
      }

      /* Пульс/сияние обводки вокруг */
      @keyframes borderGlow {
        0% {
          opacity: 0.45;
          transform: scale(1);
        }
        50% {
          opacity: 1;
          transform: scale(1.08);
        }
        100% {
          opacity: 0.45;
          transform: scale(1);
        }
      }
    </style>

    <section class="page page--home">
      ...
 <div class="hero-photo">
  <div class="hero-photo__inner hero-face-card">
    <img
      class="hero-face-img"
      src="/public/face/face.jpg"
      alt="Специалист Madera Design"
    />

    <!-- Полупрозрачная плашка с текстом и кнопками прямо НА фото -->
    <div class="hero-face-info">
      <h3 class="hero-face-title">
        Мебель на заказ в <span class="hero-city">ДУШАНБЕ!</span>
      </h3>
      <p class="hero-face-text">
        Мы проектируем мебель, анализируя пространство и ваш стиль жизни.
      </p>

      <div class="hero-face-actions">
        <div class="hero-face-btn-wrapper">
  <button 
    class="hero-face-btn hero-face-btn--primary"
    type="button"
    data-nav="order"
  >
    Рассчитать и оформить заказ
  </button>
</div>
        <button
          class="hero-face-btn hero-face-btn--secondary"
          type="button"
          data-nav="catalog"
        >
          Смотреть каталог идей
        </button>
      </div>
    </div>
  </div>
</div>

        <!-- Основной текст под фото -->
        <div class="hero__content">
          <p class="hero__subtitle">
            Премиальный сервис, дизайн с поддержкой искусственного интеллекта,
            онлайн-калькулятор стоимости и прозрачный статус заказа на каждом этапе.
          </p>

          <div class="hero__actions">
            <button class="btn btn--primary" data-nav="order">
              Рассчитать и оформить заказ
            </button>
            <button class="btn btn--ghost" data-nav="catalog">
              Смотреть каталог идей
            </button>
          </div>

          <p class="hero__note">
            Сделаем интерьер, который впечатляет с первого взгляда —
            и приносит «вау-эффект» каждый день.
          </p>
        </div>

        <!-- Карточка AI & маркетинг аккуратно под текстом -->
        <div class="hero__side">
          <div class="hero-card">
            <div class="hero-card__label">AI &amp; МАРКЕТИНГ</div>
            <ul class="hero-card__list">
              <li>Персональные рекомендации дизайна</li>
              <li>AI-чат 24/7 по мебели и стоимости</li>
              <li>Визуализация интерьера до заказа</li>
              <li>Прозрачный статус заказа в приложении</li>
            </ul>
          </div>
        </div>
      </div>

      <section class="highlights" style="margin-top: 12px;">
        <div class="highlights__item
        highlights__item--accent">
          <div class="highlights__title">Премиальный сервис, дизайн с поддержкой искусственного интеллекта,
            онлайн-калькулятор стоимости и прозрачный статус заказа на каждом этапе.</div>
          <p class="highlights__text">
            Фирменная палитра: глубокий графит и благородный оранжевый.
            Интерфейс, который сразу транслирует уровень бренда.
          </p>
        </div>
        <div class="highlights__item
        highlights__item--accent">
          <div class="highlights__title">От вдохновения до оплаты: каталог, калькулятор, онлайн-заказ,
            кредиты, партнёрская программа — всё в одном веб-приложении.</div>
          <p class="highlights__text">
            От вдохновения до оплаты: каталог, калькулятор, онлайн-заказ,
            кредиты, партнёрская программа — всё в одном веб-приложении.
          </p>
        </div>
        <div class="highlights__item
        highlights__item--accent">
          <div class="highlights__title">Локальный бренд, локальное производство, адаптация под реальные
            квартиры и запросы клиентов Душанбе.</div>
          <p class="highlights__text">
            Локальный бренд, локальное производство, адаптация под реальные
            квартиры и запросы клиентов Душанбе.
          </p>
        </div>
      </section>
    </section>
  `;
}  

/* ----------------------------- КАТАЛОГ МЕБЕЛИ ----------------------------- */

function renderCatalog() {
  // Первый уровень: только категории + мини-квиз
  if (!selectedCatalogCategoryId) {
    const cards = catalogCategories
      .map(
        (cat) => `
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

  <div class="catalog-category-card__discount">
    <div class="catalog-category-card__discount-badge">
      СКИДКИ И ПАРТНЁРЫ
    </div>
    <div class="catalog-category-card__discount-text">
      −5% при заказе напрямую • −10% по промокоду партнёра
    </div>
  </div>
</div>
        </button>
      `
      )
      .join("");

    return `
      <section class="page page--catalog">
        <h1 class="page__title">Каталог мебели Madera Design</h1>
        <p class="page__subtitle">
          Ответьте на 3 вопроса - покажем подходящие идеи, примерный бюджет и поможем подготовиться к заказу!
        </p>

        <!-- Мини-квиз: с чего начинаем -->
        <div class="catalog-quiz">
          <div class="catalog-quiz__block">
            <div class="catalog-quiz__label">1. С чего планируете начать интерьер?</div>
            <div class="catalog-quiz__options">
              <button class="catalog-quiz__option" data-quiz-step="category"

  data-quiz-value="Кухня"data-quiz-type="kitchens">Кухня</button>
              <button class="catalog-quiz__option" data-quiz-step="category"
  data-quiz-value="Гардеробная" data-quiz-type="wardrobes">Гардеробная</button>
              <button class="catalog-quiz__option" data-quiz-step="category"

  data-quiz-value="Спальня"data-quiz-type="bedrooms">Спальня</button>
              <button class="catalog-quiz__option" data-quiz-step="category"

  data-quiz-value="Детская" data-quiz-type="kids">Детская</button>
              <button class="catalog-quiz__option" data-quiz-step="category"

  data-quiz-value="Прихожая" data-quiz-type="hallways">Прихожая</button>
              <button class="catalog-quiz__option" data-quiz-step="category"

  data-quiz-value="Гостиная"data-quiz-type="livingrooms">Гостиная</button>
            </div>
          </div>

          <div class="catalog-quiz__block">
            <div class="catalog-quiz__label">2. Какая цель проекта?</div>
            <div class="catalog-quiz__options"> 
              <button class="catalog-quiz__option" data-quiz-step="goal" data-quiz-goal="self">
                Для себя надолго
              </button>
              <button class="catalog-quiz__option" data-quiz-goal="rent">
                Квартира под сдачу
              </button>
              <button class="catalog-quiz__option" data-quiz-goal="sale">
                Готовлю к продаже
              </button>
            </div>
          </div>

          <div class="catalog-quiz__block">
            <div class="catalog-quiz__label">3. Какой ориентировочный бюджет на мебель?</div>
            <div class="catalog-quiz__options"> 

              <button class="catalog-quiz__option" data-quiz-step="budget"data-quiz-budget="low">
                до 15&nbsp;000 сом
              </button>
              <button class="catalog-quiz__option" data-quiz-budget="mid">
                15–30&nbsp;000 сом
              </button>
              <button class="catalog-quiz__option" data-quiz-budget="high">
                выше 30&nbsp;000 сом
              </button>
            </div>
          </div>

          <div class="catalog-quiz__footer">
            <div class="catalog-quiz__hint">
              Даже если вы пока просто присматриваетесь, мини-квиз поможет понять диапазон бюджета и с чего лучше начать именно Вам!
            </div>
            <div class="catalog-quiz__actions">
              <button class="btn btn--ghost"
data-route="order"> 
                Получить быстрый расчет и идеи.
              </button>
              <button class="btn btn--outline" data-action="open-chat">
                Обсудить с AI-дизайнером мою ситуацию.
              </button>
            </div>
          </div>
        </div>
       <!-- Блок "Скидки и партнёры" под квизом -->

      <div class="catalog-discount-info">

        <div class="catalog-discount-info__title">Скидки и партнёры</div>

        <ul class="catalog-discount-info__list">

          <li>5% скидка — если оформляете заказ напрямую через компанию</li>

          <li>10% скидка — если укажете промокод партнёра</li>

          <li>Партнёры получают 5% от суммы каждого приведённого заказа</li>

        </ul>

        <div class="catalog-discount-info__note">

          Мы принимаем заказы от 3 погонных метров и выше.

        </div>

      
        <div class="catalog-categories-grid">
          ${cards}
        </div>
      </section>
    `;
  }

  // Второй уровень: идеи внутри выбранной категории
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
            <img
              src="${item.image}"
              alt="${item.title}"
              class="catalog-item-card__img"
            />
          </div>
          <div class="catalog-item-card__info">
            <div class="catalog-item-card__title">${item.title}</div>
            <div class="catalog-item-card__desc">${item.description}</div>
            <button
              class="btn btn--primary catalog-item-card__btn"
              data-route="order"
            >
              Рассчитать такую же композицию под мою квартиру
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

      <h1 class="page__title">
        ${category ? category.name || category.title : "Категория"}
      </h1>
      <p class="page__subtitle">
        Выберите идею, которая ближе к вашему вкусу. На следующих шагах адаптируем дизайн
        под размеры вашей квартиры и посчитаем стоимость.
      </p>

      <div class="catalog-category-bridge">
        <div class="catalog-category-bridge__text">
          Чаще всего такие композиции занимают от 3 до 5 погонных метров. Мы принимаем заказы 
          от 3 пог. метров и выше. Можно сразу перейти к расчёту:
        </div>
        <button class="btn btn--outline" data-route="order">
          Быстрый расчёт для этой категории
        </button>
      </div>

      <div class="catalog-items-grid">
        ${
          itemCards ||
          "<div class='page__placeholder'>Идеи для этой категории появятся чуть позже. Сейчас мы готовим новые 3D-сценарии специально под рынок Душанбе.</div>"
        }
      </div>
    </section>
  `;
}

/* ----------------------------- РАЗДЕЛ «ЗАКАЗ» ----------------------------- */

function renderOrder() {
  return `
  <style>
  .order-form--accent {
    border: 1px solid rgba(255, 153, 0, 0.35);
    box-shadow: 0 0 0 1px rgba(255, 153, 0, 0.25);
    border-radius: 18px;
  }
</style>
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
                    <span class="order-calc-tariff__price">≈ ${BASE_RATES.standard.toLocaleString(
                      "ru-RU"
                    )} сом / п.м.</span>
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
                    <span class="order-calc-tariff__price">≈ ${BASE_RATES.premium.toLocaleString(
                      "ru-RU"
                    )} сом / п.м.</span>
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
          <div class="order-form order-form--accent">
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
                  <option value="livingrooms">Гостиные</option>
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
        <div class="order-form order-form--accent">
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

/* -------------------------- ЛИЧНЫЙ КАБИНЕТ -------------------------- */

function renderProfile() {
  return `
  <style>
  .order-info__card--accent {
    border: 1px solid rgba(255, 153, 0, 0.35);
    box-shadow: 0 0 0 1px rgba(255, 153, 0, 0.25);
    border-radius: 18px;
  }
</style>
    <section class="page page--profile">
      <h1 class="page__title">Личный кабинет</h1>
      <p class="page__subtitle">
        Здесь клиент будет видеть статусы своих заказов, промокоды, бонусы и связь с менеджером.
        Сейчас это демонстрационный макет — позже мы подключим сюда реальный backend.
      </p>

      <div class="order-layout">
        <!-- Левая колонка: заказы + профиль -->
        <div>
          <!-- Мои заказы -->
          <div class="order-form order-info__card--accent"> 
            <div class="order-form__header">
              <div class="order-form__title">Мои заказы</div>
              <div class="order-form__subtitle">
                Здесь будет список всех ваших заказов в Madera Design с этапами и статусами.
              </div>
            </div>

            <div class="page__placeholder">
              <strong>Пример (демо):</strong><br/><br/>
              • Заказ №MD-001 — кухня 4,5 м, тариф «Премиум», статус: <strong>в работе</strong><br/>
              • Заказ №MD-002 — гардеробная 3 м, тариф «Стандарт», статус: <strong>ожидает замера</strong><br/><br/>
              В реальной версии здесь будет таблица с датой, суммой, этапом («Замер», «Дизайн», «Производство», «Монтаж»)
              и быстрым переходом в чат с менеджером по конкретному заказу.
            </div>
          </div>

          <!-- Профиль клиента -->
          <div class="order-form order-info__card--accent">
            <div class="order-form__header">
              <div class="order-form__title">Профиль клиента</div>
              <div class="order-form__subtitle">
                Базовые данные, чтобы менеджеру было проще вести коммуникацию и подбирать решения.
              </div>
            </div>

            <div class="order-form__grid">
              <div class="order-form__row">
                <label class="order-form__label">Имя</label>
                <input
                  type="text"
                  class="order-form__input"
                  placeholder="Как к вам обращаться?"
                  disabled
                  value="(будет подтягиваться из заявок)"
                />
              </div>

              <div class="order-form__row">
                <label class="order-form__label">Телефон / WhatsApp</label>
                <input
                  type="text"
                  class="order-form__input"
                  placeholder="+992 ..."
                  disabled
                  value="(будет подтягиваться из заявок)"
                />
              </div>

              <div class="order-form__row order-form__row--full">
                <label class="order-form__label">Предпочтительный стиль интерьера</label>
                <input
                  type="text"
                  class="order-form__input"
                  placeholder="Современный / минимализм / классика ..."
                  disabled
                  value="(будет сохраняться после первых заказов)"
                />
              </div>
            </div>

            <div class="order-form__footer">
              <div class="order-form__note">
                В дальнейшем клиент сможет самостоятельно обновлять свои данные и предпочтения,
                а система будет предлагать идеи под его стиль и бюджет.
              </div>
            </div>
          </div>
        </div>

        <!-- Правая колонка: партнёрка + план развития -->
        <div class="order-form order-info__card--accent">
          <!-- Партнёрская программа -->
          <div class="order-info__card">
            <div class="order-info__badge">Партнёрская программа</div>
            <h2 class="order-info__title">Зарабатывайте вместе с Madera Design</h2>
            <ul class="order-info__list">
              <li>Клиент получает личный промокод на скидку для друзей.</li>
              <li>За каждый заказ по вашему промокоду — бонусы или денежное вознаграждение.</li>
              <li>Бонусы можно использовать на свои будущие проекты или обслуживание.</li>
            </ul>
          </div>

          <!-- Как будет работать личный кабинет -->
          <div class="order-info__next">
            <div class="order-info__next-text">
              <strong>Дальнейшее развитие личного кабинета:</strong><br/><br/>
              1. Подключение реального backend и базы заказов.<br/>
              2. Отображение этапов заказа в реальном времени.<br/>
              3. История диалогов с AI-ассистентом и менеджерами.<br/>
              4. Управление промокодами и партнёрскими начислениями.
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

/* ------------------------- РАЗДЕЛ «ЕЩЁ» / ИНФО ------------------------- */

function renderMore() {
  return `
  <style>
  .order-info__card {
    border: 1px solid rgba(255, 140, 0, 0.4);
    border-radius: 20px;
    box-shadow: 0 0 12px rgba(255, 140, 0, 0.2);
    padding: 20px;
  }
</style>
  <style>
  .order-info__badge {
    font-size: 15px !important; /* сделает крупнее */
    letter-spacing: 2px;         /* красивый фирменный стиль */
  }
</style>
  <style>
  .order-info__card .order-info__list,
  .order-info__card .order-info__subtitle,
  .order-info__card .order-info__title {
    font-size: 16px !important;
    line-height: 1.45;
  }
  }
</style>
    <section class="page page--more">
      <h1 class="page__title">Информация о сервисе Madera Design</h1>
      <p class="page__subtitle">
        Madera Design — это современный сервис по созданию корпусной мебели в Душанбе.

Мы объединяем дизайн, производство и цифровые инструменты, чтобы дать клиенту максимально понятный, прозрачный и удобный опыт заказа мебели.

Здесь вы найдёте ответы на самые частые вопросы:

из чего мы делаем мебель, какие реальные сроки, как формируется стоимость, какие гарантии мы предоставляем и как работает сервис после монтажа.      </p>
<style>
  .order-info__card .order-info__text {
    font-size: 14px;
    line-height: 1.45;
  }
</style>

    <section class="highlights">

  <!-- Блок 1 — Материалы и фурнитура -->
  <div class="order-info__card">
    <div class="order-info__badge">Материалы и фурнитура</div>

    <p class="order-info__text">
      Мы используем только проверенные материалы и фурнитуру, рассчитанные на долгий срок службы.
      <br><br>
      • Корпус — ЛДСП российских производителей.<br>
      • Фасады — ЛДСП или турецкий МДФ, в зависимости от выбранного тарифа.<br>
      • Фурнитура — Blum или качественные проверенные аналоги: направляющие, петли, механизмы плавного закрывания.
      <br><br>
      Мы подбираем материалы так, чтобы сочетать долговечность, эстетику и оптимальную стоимость.
    </p>
  </div>

  <!-- Блок 2 — Сроки и этапы -->
  <div class="order-info__card">
    <div class="order-info__badge">Сроки изготовления</div>

    <p class="order-info__text">
      Сроки зависят от объёма проекта и рассчитываются в рабочих днях (Пн–Пт). 
      Отсчёт начинается после утверждения дизайн-проекта и 100% оплаты.
      <br><br>
      <strong>Корпусная мебель:</strong><br>
      • 3–6 пог. м → 15 рабочих дней<br>
      • 6–9 пог. м → 20 рабочих дней<br>
      • 9–12 пог. м → 25 рабочих дней
      <br><br>
      <strong>Мебель для квартиры:</strong><br>
      • до 70 м² → 30 рабочих дней<br>
      • 70–100 м² → 40 рабочих дней<br>
      • 100–130 м² → 50 рабочих дней
      <br><br>
      Производственный процесс можно ускорить, если позволяет загрузка производства — уточняйте при заказе.
    </p>
  </div>

  <!-- Блок 3 — Цена и прозрачность -->
  <div class="order-info__card">
    <div class="order-info__badge">Стоимость и бюджет</div>

    <p class="order-info__text">
      Мы работаем в двух категориях:
      <br>
      • Стандарт — ≈ 4000 сомони / пог. м<br>
      • Премиум — ≈ 5000 сомони / пог. м
      <br><br>
      Цена формируется индивидуально и зависит от стиля, типа фасадов, уровня фурнитуры,
      наполнения и интеграции техники.
      <br><br>
      <strong>Как рассчитываем стоимость:</strong><br>
      Длина в погонных метрах × 4000 (стандарт) или × 5000 (премиум).  
      <br>Минимальный заказ — 3 погонных метра.
      <br><br>
      <strong>Пример:</strong><br>
      Кухня 4,5 м:<br>
      • Стандарт — ≈ 18 000 сомони<br>
      • Премиум — ≈ 22 500 сомони
      <br><br>
      Мы можем адаптировать проект под ваш бюджет без потери качества:
      упростить фасады, подобрать доступную фурнитуру, убрать лишние механизмы,
      оптимизировать внутреннее наполнение.
      <br><br>
      Мы не используем дешёвые или ненадёжные материалы — качество бренда важнее «самой низкой цены».
    </p>
  </div>

</section>

      <div class="order-layout" style="margin-top: 18px;">
        <div>
          <!-- Оплата и рассрочка -->
<div class="order-info__card">
  <div class="order-info__badge">Оплата и рассрочка</div>
  <h2 class="order-info__title">Как можно оплатить заказ</h2>

  <ul class="order-info__list">
    <li>Оплата только <strong>по безналичному расчёту</strong> — через банковские сервисы или электронные кошельки.</li>
    <li>После оплаты вы получаете чек и персональный номер заказа.</li>
  </ul>

      <div style="margin-top: 5px;"></div>
  <h3 class="order-info__subtitle">Запуск в производство</h3>
  <ul class="order-info__list">
      <div style="margin-top: 5px;"></div>
    <li>Изготовление начинается <strong>после 100% оплаты</strong> утверждённой сметы.</li>
    <li>Частичная оплата и расчёт после монтажа не предусмотрены — это гарантирует точные сроки и стабильную работу производства.</li>
  </ul>

      <div style="margin-top: 5px;"></div>
  <h3 class="order-info__subtitle">Рассрочка / кредит</h3>
  <ul class="order-info__list">
      <div style="margin-top: 5px;"></div>
    <li>Доступны партнёрские программы:</li>
    <li>— до <strong>6 месяцев</strong> — переплата <strong>10%</strong></li>
    <li>— до <strong>12 месяцев</strong> — переплата <strong>20%</strong></li>
    <li>— до <strong>18 месяцев</strong> — переплата <strong>30%</strong></li>
  </ul>
</div>

          <!-- Гарантия и сервис -->
<div class="order-info__card">
  <div class="order-info__badge">Гарантия и сервис</div>
  <h2 class="order-info__title">Что мы гарантируем</h2>

  <ul class="order-info__list">
    <li>Официальная гарантия 12 месяцев на всю корпусную мебель Madera Design.</li>
    <li>Гарантия включает фабричные дефекты ЛДСП/МДФ, производственные недочёты, ошибки сборки и некорректную работу фурнитуры.</li>
    <li>Гарантия не распространяется на механические повреждения, воздействие воды/огня/химии и вмешательство сторонних мастеров.</li>
  </ul>

      <div style="margin-top: 5px;"></div>
  <h3 class="order-info__subtitle">Сервис и сопровождение</h3>
  <ul class="order-info__list">
  
      <div style="margin-top: 5px;"></div>
    <li>Работаем официально: договор, смета, чертежи, акт приёмки-передачи, гарантийный талон.</li>
    <li>При гарантийном случае мастер выезжает, проводит диагностику и устраняет проблему.</li>
    <li>После окончания гарантии можем консультировать и помогать: настройка фасадов, замена фурнитуры, мелкий сервис.</li>
  </ul>

      <div style="margin-top: 5px;"></div>
  <h3 class="order-info__subtitle">Путь клиента</h3>
  <ul class="order-info__list">
  
      <div style="margin-top: 5px;"></div>
    <li>Замер → дизайн-проект → договор → производство → монтаж → гарантийное сопровождение.</li>
  </ul>
</div>

        <div class="order-info">
          <!-- О компании -->
<div class="order-info__card">
  <div class="order-info__badge">О компании</div>
  <h2 class="order-info__title">Madera Design — мебель нового формата</h2>

  <ul class="order-info__list">
    <li>Современный дизайн и функциональные решения.</li>
    <li>Собственное производство и команда монтажа в Душанбе.</li>
    <li>Цифровой сервис: AI-менеджер, AI-дизайнер, онлайн-калькулятор и статус заказа в приложении.</li>
  </ul>
</div>

          <!-- Частые вопросы (FAQ) -->
<div class="order-info__card">
  <div class="order-info__badge">Частые вопросы (FAQ)</div>
  <h2 class="order-info__title">Ответы на основные вопросы</h2>

  <ul class="order-info__list">

    <li>
      <strong>1. Стоимость и бюджет</strong><br><br>

      <strong>1.1. Сколько стоит метр кухни или шкафа?</strong><br>
      Стандарт — ≈ 4000 сомони / пог. м<br>
      Премиум — ≈ 5000 сомони / пог. м<br>
      Цена зависит от стиля, типа фасадов, уровня фурнитуры, наполнения и интеграции техники.
      <br><br>

      <strong>1.2. Сколько будет стоить мой проект?</strong><br>
      Формула: длина × 4000 (стандарт) или × 5000 (премиум).  
      Минимальный заказ — 3 пог. метра.<br>
      Пример кухни 4,5 м:  
      • Стандарт ≈ 18 000 сомони  
      • Премиум ≈ 22 500 сомони  
      <br><br>

      <strong>1.3. Можно ли уложиться в конкретный бюджет?</strong><br>
      Да. Оптимизируем фасады, фурнитуру, механизмы и наполнение, сохранив качество.
      Мы не работаем с дешёвыми и ненадёжными материалами.
    </li>
      <div style="margin-top: 5px;"></div>
    <li>
      <strong>2. Сроки изготовления</strong><br><br>

      Корпусная мебель:<br>
      • 3–6 пог. м → 15 рабочих дней<br>
      • 6–9 пог. м → 20 рабочих дней<br>
      • 9–12 пог. м → 25 рабочих дней<br><br>

      Мебель для квартиры:<br>
      • до 70 м² → 30 дней<br>
      • 70–100 м² → 40 дней<br>
      • 100–130 м² → 50 дней<br><br>

      Возможность ускорения обсуждается индивидуально.
    </li>
      <div style="margin-top: 5px;"></div>
    <li>
      <strong>3. Материалы и качество</strong><br><br>
      Используем ЛДСП, МДФ, фурнитуру с доводчиками, стойкие покрытия.  
      Премиум — расширенный дизайн, улучшенные механизмы, повышенная надёжность.
    </li>
      <div style="margin-top: 5px;"></div>
    <li>
      <strong>4. Гарантия и сервис</strong><br><br>
      • Гарантия 12 месяцев на всю продукцию Madera Design.<br>
      • Покрывает фабричные дефекты, производственные ошибки, фурнитуру.<br>
      • При необходимости мастер выезжает и устраняет проблему.<br>
      • После гарантийного срока обеспечиваем сервисную поддержку.
    </li>
      <div style="margin-top: 5px;"></div>
    <li>
      <strong>5. Дизайн и стиль</strong><br><br>
      • Помогаем с планировкой и стилем.<br>
      • Создаём мебель «как на фото» или по вашему эскизу.<br>
      • Подсказываем тренды по фасадам, оттенкам, текстурам.
    </li>
      <div style="margin-top: 5px;"></div>
    <li>
      <strong>6. Процесс работы</strong><br><br>
      Полный путь:  
      замер → дизайн-проект → договор → производство → монтаж → гарантийное сопровождение.<br><br>
      Работает специалист по замерам. Предоставляем договор, смету, чертежи и гарантийный талон.
    </li>
      <div style="margin-top: 5px;"></div>
    <li>   
       <strong>7. Оплата и рассрочка</strong><br><br>
      • Возможна оплата частями или в кредит.<br>
      • Есть несколько условий рассрочки.<br>
      • Индивидуальные акции обсуждаются в рамках проекта.
    </li>
  </ul>
</div>
   </section>
  `;
}
/* --------------------------- AI-ДИЗАЙНЕР (CHAT) --------------------------- */

let aiChatRoot = null;
let aiChatMessagesEl = null;
let aiChatInputEl = null;
let aiChatIsSending = false;

// состояние вложений
let aiChatFiles = [];
let aiChatVoiceBlob = null;
let aiChatIsRecording = false;
let aiChatMediaRecorder = null;

function initAiDesignerChat() {
  if (typeof document === "undefined") return;
  if (aiChatRoot) return;

  aiChatRoot = document.createElement("div");
  aiChatRoot.className = "ai-chat";
  aiChatRoot.innerHTML = `
    <div class="ai-chat__window">
      <div class="ai-chat__header">
        <div class="ai-chat__title">AI-дизайнер Madera Design</div>
        <button type="button" class="ai-chat__close" data-ai-chat-close>×</button>
      </div>

      <div class="ai-chat__subtitle">
        Задайте вопрос про интерьер или загрузите фото/план квартиры — предложу решения и помогу подготовиться к заказу.
      </div>

      <div class="ai-chat__messages"></div>

      <div class="ai-chat__attachments">
        <div class="ai-chat__attachments-list" data-ai-chat-attachments></div>
      </div>

      <div class="ai-chat__toolbar">
        <button type="button" class="ai-chat__icon-btn" data-ai-chat-file>
          📎
        </button>
        <button type="button" class="ai-chat__icon-btn" data-ai-chat-mic>
          🎙
        </button>
        <span class="ai-chat__toolbar-hint">
          Можно прикрепить фото, видео, PDF или записать голосовое.
        </span>
        <input
          type="file"
          data-ai-chat-file-input
          multiple
          accept="image/*,video/*,application/pdf,application/vnd.*,.pdf"
          style="display: none;"
        />
      </div>

      <form class="ai-chat__form">
        <textarea
          class="ai-chat__input"
          rows="2"
          placeholder="Например: «Кухня 4 м, современный стиль, тёплые оттенки, нужен остров и высокий шкаф под технику»"
        ></textarea>
        <button type="submit" class="ai-chat__send">Отправить</button>
      </form>
    </div>
  `.trim();

  document.body.appendChild(aiChatRoot);

  aiChatMessagesEl = aiChatRoot.querySelector(".ai-chat__messages");
  aiChatInputEl = aiChatRoot.querySelector(".ai-chat__input");

  const closeBtn = aiChatRoot.querySelector("[data-ai-chat-close]");
  if (closeBtn) closeBtn.addEventListener("click", hideAiChat);

  const form = aiChatRoot.querySelector(".ai-chat__form");
  if (form) form.addEventListener("submit", handleAiChatSubmit);

  const fileBtn = aiChatRoot.querySelector("[data-ai-chat-file]");
  const fileInput = aiChatRoot.querySelector("[data-ai-chat-file-input]");
  const micBtn = aiChatRoot.querySelector("[data-ai-chat-mic]");

  if (fileBtn && fileInput) {
    fileBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", handleAiChatFilesSelected);
  }

  if (micBtn) {
    micBtn.addEventListener("click", () => toggleAiChatRecording(micBtn));
  }
}
// Открыть окно AI-дизайнера (если нужно — создать)
function openAiDesignerChat() {
  // если окно ещё не создано — создаём
  if (!aiChatRoot) {
    if (typeof initAiDesignerChat === "function") {
      initAiDesignerChat();
    }
  }

  if (!aiChatRoot) return;

  // показываем окно
  aiChatRoot.classList.add("ai-chat--open");

  // фокус в поле ввода
  try {
    const input = aiChatRoot.querySelector("[data-ai-chat-input]");
    if (input) {
      input.focus();
    }
  } catch (e) {
    console.warn("AI designer: не удалось установить фокус", e);
  }
}

function showAiChat(initialQuestion = "") {
  if (!aiChatRoot) return;
  aiChatRoot.classList.add("ai-chat--visible");

  if (aiChatMessagesEl && aiChatMessagesEl.children.length === 0) {
    appendAiMessage(
      "assistant",
      "Здравствуйте! Я AI-дизайнер Madera Design. Можете описать задачу, прикрепить фото комнаты или PDF-план. Я предложу варианты планировки, цвета и мебели и помогу подготовиться к заказу."
    );
  }

  if (initialQuestion && aiChatInputEl && !aiChatInputEl.value) {
    aiChatInputEl.value = initialQuestion;
  }

  setTimeout(() => {
    aiChatInputEl && aiChatInputEl.focus();
  }, 50);
}

function hideAiChat() {
  if (!aiChatRoot) return;
  aiChatRoot.classList.remove("ai-chat--visible");
}

function appendAiMessage(role, text) {
  if (!aiChatMessagesEl) return null;

  const item = document.createElement("div");
  item.className =
    "ai-chat__message " +
    (role === "user" ? "ai-chat__message--user" : "ai-chat__message--assistant");

  if (text) {
    const p = document.createElement("p");
    p.className = "ai-chat__message-text";
    p.textContent = text;
    item.appendChild(p);
  }

  aiChatMessagesEl.appendChild(item);
  aiChatMessagesEl.scrollTop = aiChatMessagesEl.scrollHeight;
  return item;
}

/* ---------- работа с файлами ---------- */

function handleAiChatFilesSelected(event) {
  const input = event.target;
  const files = Array.from(input.files || []);
  if (!files.length) return;

  aiChatFiles = aiChatFiles.concat(files);
  input.value = "";

  renderAiChatAttachments();
}

function renderAiChatAttachments() {
  const container = aiChatRoot?.querySelector("[data-ai-chat-attachments]");
  if (!container) return;

  container.innerHTML = "";

  if (!aiChatFiles.length && !aiChatVoiceBlob) {
    container.style.display = "none";
    return;
  }

  container.style.display = "flex";

  aiChatFiles.forEach((file, index) => {
    const tag = document.createElement("button");
    tag.type = "button";
    tag.className = "ai-chat__attachment-tag";
    tag.textContent = file.name;
    tag.title = file.name;
    tag.addEventListener("click", () => {
      aiChatFiles.splice(index, 1);
      renderAiChatAttachments();
    });
    container.appendChild(tag);
  });

  if (aiChatVoiceBlob) {
    const tag = document.createElement("button");
    tag.type = "button";
    tag.className = "ai-chat__attachment-tag ai-chat__attachment-tag--voice";
    tag.textContent = "Голосовое сообщение";
    tag.addEventListener("click", () => {
      aiChatVoiceBlob = null;
      renderAiChatAttachments();
    });
    container.appendChild(tag);
  }
}

/* ---------- голосовые сообщения ---------- */

async function toggleAiChatRecording(micBtn) {
  if (aiChatIsRecording) {
    // стоп записи
    aiChatIsRecording = false;
    micBtn.classList.remove("ai-chat__icon-btn--active");
    if (aiChatMediaRecorder && aiChatMediaRecorder.state !== "inactive") {
      aiChatMediaRecorder.stop();
    }
    return;
  }

  // старт записи
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const chunks = [];
    aiChatMediaRecorder = new MediaRecorder(stream);

    aiChatMediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    aiChatMediaRecorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      aiChatVoiceBlob = new Blob(chunks, { type: "audio/webm" });
      renderAiChatAttachments();
    };

    aiChatIsRecording = true;
    micBtn.classList.add("ai-chat__icon-btn--active");
    aiChatMediaRecorder.start();
  } catch (error) {
    console.error("AI_CHAT_MIC_ERROR", error);
    appendAiMessage(
      "assistant",
      "Не удалось получить доступ к микрофону. Проверьте разрешения браузера."
    );
  }
}

/* ---------- отправка запроса ---------- */

async function handleAiChatSubmit(event) {
  event.preventDefault();
  if (!aiChatInputEl || aiChatIsSending) return;

  const text = (aiChatInputEl.value || "").trim();
  if (!text && !aiChatFiles.length && !aiChatVoiceBlob) return;

  aiChatIsSending = true;

  let userText = text || "";
  if (aiChatFiles.length) {
    userText += (userText ? "\n" : "") + `Прикреплено файлов: ${aiChatFiles.length}`;
  }
  if (aiChatVoiceBlob) {
    userText += (userText ? "\n" : "") + "Прикреплено голосовое сообщение.";
  }

  appendAiMessage("user", userText || "Файлы/голосовое сообщение без текста");
  aiChatInputEl.value = "";

  const typingPlaceholder = appendAiMessage(
    "assistant",
    "Думаю над предложениями для вашего интерьера…"
  );
  if (typingPlaceholder) {
    typingPlaceholder.classList.add("ai-chat__message--typing");
  }

  try {
    const formData = new FormData();
    if (text) formData.append("message", text);

    aiChatFiles.forEach((file) => {
      formData.append("files", file);
    });

    if (aiChatVoiceBlob) {
      formData.append("voice", aiChatVoiceBlob, "voice-message.webm");
    }

    const res = await fetch("/api/ai-designer", {
      method: "POST",
      body: formData,
    });

    let reply =
      "Извините, сейчас сервис временно недоступен. Попробуйте ещё раз чуть позже.";
    let audioUrl = null;
    let designs = [];

    if (res.ok) {
      const data = await res.json();
      if (data) {
        if (typeof data.reply === "string" && data.reply.trim()) {
          reply = data.reply.trim();
        }
        if (typeof data.audioUrl === "string") {
          audioUrl = data.audioUrl;
        }
        if (Array.isArray(data.designs)) {
          designs = data.designs;
        }
      }
    }

    if (typingPlaceholder) {
      typingPlaceholder.classList.remove("ai-chat__message--typing");
      const textEl = typingPlaceholder.querySelector(".ai-chat__message-text");
      if (textEl) textEl.textContent = reply;

      // аудио-ответ
      if (audioUrl) {
        const audioWrapper = document.createElement("div");
        audioWrapper.className = "ai-chat__audio";
        const audio = document.createElement("audio");
        audio.controls = true;
        audio.src = audioUrl;
        audioWrapper.appendChild(audio);
        typingPlaceholder.appendChild(audioWrapper);
      }

      // превью дизайнов
      if (designs.length) {
        const gallery = document.createElement("div");
        gallery.className = "ai-chat__designs";

        designs.forEach((d) => {
          if (!d || !d.url) return;
          const card = document.createElement("a");
          card.href = d.url;
          card.target = "_blank";
          card.rel = "noopener noreferrer";
          card.className = "ai-chat__design-card";

          const img = document.createElement("img");
          img.src = d.url;
          img.alt = d.title || "Вариант дизайна";
          card.appendChild(img);

          if (d.title) {
            const caption = document.createElement("div");
            caption.className = "ai-chat__design-caption";
            caption.textContent = d.title;
            card.appendChild(caption);
          }

          gallery.appendChild(card);
        });

        typingPlaceholder.appendChild(gallery);
      }
    }
  } catch (error) {
    console.error("AI_CHAT_ERROR", error);
    if (typingPlaceholder) {
      typingPlaceholder.classList.remove("ai-chat__message--typing");
      const textEl = typingPlaceholder.querySelector(".ai-chat__message-text");
      if (textEl) {
        textEl.textContent =
          "Не удалось получить ответ. Проверьте интернет и попробуйте ещё раз.";
      }
    }
  } finally {
    aiChatIsSending = false;
    aiChatFiles = [];
    aiChatVoiceBlob = null;
    renderAiChatAttachments();

    if (aiChatMessagesEl) {
      aiChatMessagesEl.scrollTop = aiChatMessagesEl.scrollHeight;
    }
  }
}
/* --------------------------------- ROUTES --------------------------------- */

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

  // Подсветка активной кнопки в нижнем меню
  const navButtons = appRoot.querySelectorAll(".app-nav__item");
  navButtons.forEach((btn) => {
    const r = btn.getAttribute("data-route");
    btn.classList.toggle("app-nav__item--active", r === route);
  });
}

// Читаем маршрут из #hash при первой загрузке
function getInitialRoute() {
  if (typeof window === "undefined") return "home";

  const hash = window.location.hash.replace("#", "").trim();
  if (hash && VIEWS[hash]) {
    return hash;
  }
  return "home";
}

/* ------------------------- ЛОГИКА КАЛЬКУЛЯТОРА --------------------------- */

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

/* ------------------------ ОТПРАВКА ЗАЯВКИ + СЕГМЕНТ ----------------------- */

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

  let leadSegment = "cold";
  let leadLabel = "Холодный лид";
  let leadAdvice =
    "Клиент на стадии вдохновения и изучения идей. Важно не давить, а мягко сопровождать и давать полезные материалы.";

  if (readiness === "soon" && (Number.isNaN(length) || length >= 3)) {
    leadSegment = "hot";
    leadLabel = "Горячий лид";
    leadAdvice =
      "Клиент готов к заказу в ближайшее время и понимает минимальный объём. Важно быстро связаться, закрепить дизайн и зафиксировать условия.";
  } else if (readiness === "thinking") {
    leadSegment = "warm";
    leadLabel = "Тёплый лид";
    leadAdvice =
      "Клиент сравнивает варианты. Нужны аргументы: кейсы, примеры работ, прозрачные цены, преимущества сервиса Madera Design.";
  }

  const payload = {
    name,
    phone,
    category,
    length: Number.isNaN(length) ? null : length,
    tariff: tariffText || null,
    promo: promo || null,
    comment: comment || null,
    readiness,
    minAgree,
    leadSegment,
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
      <div class="order-form__result-ai">
        <div class="order-form__result-ai-label">${leadLabel}</div>
        <div class="order-form__result-ai-text">
          ${leadAdvice}
        </div>
      </div>
    </div>
  `;
}

/* -------------------------------- РОУТЕР ---------------------------------- */

function setCatalogCategory(categoryId) {
  selectedCatalogCategoryId = categoryId;
  renderRoute("catalog");
  if (typeof window !== "undefined") {
    window.location.hash = "catalog";
  }
}

// Навигация внутри приложения
function setupRouter() {
  appRoot.addEventListener("click", (event) => {
    const target = event.target;

    // Кнопки с data-route (нижнее меню, CTA в шапке и т.п.)
    const routeTarget = target.closest("[data-route]");
    if (routeTarget) {
      const route = routeTarget.getAttribute("data-route");

      if (route === "catalog") {
        selectedCatalogCategoryId = null;
      }

      renderRoute(route);

      if (typeof window !== "undefined") {
        window.location.hash = route;
      }
      return;
    }

    // Клик по категории каталога
    const categoryTarget = target.closest("[data-category-id]");
    if (categoryTarget) {
      const categoryId = categoryTarget.getAttribute("data-category-id");
      setCatalogCategory(categoryId);
      return;
    }

    // Кнопка "← Все категории"
    const backTarget = target.closest("[data-action='catalog-back']");
    if (backTarget) {
      selectedCatalogCategoryId = null;
      renderRoute("catalog");
      if (typeof window !== "undefined") {
        window.location.hash = "catalog";
      }
      return;
    }
    // Открыть окно AI-дизайнера
    const chatTarget = target.closest("[data-action='open-chat']");
    if (chatTarget) {
      showAiChat();
      return;
    }
    // Калькулятор
    const calcTarget = target.closest("[data-action='calc-price']");
    if (calcTarget) {
      handleCalcPrice();
      return;
    }

    // Отправка заявки
    const submitTarget = target.closest("[data-action='submit-order']");
    if (submitTarget) {
      handleOrderSubmit();
      return;
    }
  });
}

// Реакция на кнопки "Назад/Вперёд" в браузере
function setupHashListener() {
  if (typeof window === "undefined") return;

  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.replace("#", "").trim();
    if (!hash || !VIEWS[hash]) return;

    if (hash === "catalog") {
      selectedCatalogCategoryId = null;
    }

    renderRoute(hash);
  });
}

/* ------------------------- РЕНДЕР ОБОЛОЧКИ SPA --------------------------- */

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
  setupHashListener();
  renderRoute(initialRoute);
}

/* ------------------------------ ИНИЦИАЛИЗАЦИЯ ----------------------------- */

function initApp() {
  const initialRoute = getInitialRoute();
  renderLayout(initialRoute);
  initAiDesignerChat(); // <--- добавили
  // === Аккуратное восстановление навигации кнопок ===
document.addEventListener('DOMContentLoaded', function () {
  // Ищем все кнопки с атрибутом data-nav
  const navButtons = document.querySelectorAll('[data-nav]');

  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-nav');

      // Безопасный переход по разделам
      if (target === 'order') {
        // Кнопка "Рассчитать и оформить заказ"
        window.location.href = '/#ai-designer';
      } else if (target === 'catalog') {
        // Кнопка "Смотреть каталог идей"
        window.location.href = '/#catalog';
      }
    });
  });
});
}

initApp();
// ГЛОБАЛЬНЫЙ обработчик только для верхних кнопок на фото
// Работает в режиме capture, поэтому срабатывает раньше всего остального
document.addEventListener(
  'click',
  function (event) {
    const btn = event.target.closest('.hero-face-btn[data-nav]');
    if (!btn) return; // кликнули не по нужной кнопке

    const nav = btn.dataset.nav;

    // Нас интересуют только две кнопки на фото
    if (nav !== 'order' && nav !== 'catalog') {
      return;
    }

    // Полностью перехватываем событие
    event.preventDefault();
    event.stopPropagation();

    let target = null;

    if (nav === 'order') {
      // Список возможных ID блока заказа
      const selectors = [
        '#order',
        '#order-start',
        '#calculator',
        '#quiz',
        '#form',
        '#ai-design',
      ];

      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) {
          target = el;
          break;
        }
      }
    }

    if (nav === 'catalog') {
      // Основной блок каталога
      target =
        document.querySelector('#catalog') ||
        document.querySelector('#ideas') ||
        document.querySelector('#portfolio');
    }

    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    } else {
      // Жёсткий запасной вариант — меняем hash, если вообще ничего не нашли
      if (nav === 'order') {
        window.location.hash = '#order';
      } else if (nav === 'catalog') {
        window.location.hash = '#catalog';
      }
    }
  },
  true // <-- режим capture, чтобы наш код выстреливал всегда
);
function goToOrderWithDescription(desc) {
  console.log("TODO goToOrderWithDescription:", desc);
}

function openAiDesignerFromQuiz(desc) {
  console.log("TODO openAiDesignerFromQuiz:", desc);
}

// ======================================================================
// ФИНАЛЬНЫЙ ФИКС НИЖНЕЙ НАВИГАЦИИ
// - .app-nav всегда поверх контента
// - внизу страницы создаётся "прокладка", чтобы ничего не заезжало под меню
// ======================================================================
(function setupBottomNavSpacer() {
  if (typeof document === "undefined") return;

  function applyNavSpacer() {
    const nav = document.querySelector(".app-nav");
    if (!nav) return;

    // 1) навигация всегда поверх всего
    nav.style.position = "fixed";
    nav.style.left = "0";
    nav.style.right = "0";
    nav.style.bottom = "0";
    nav.style.zIndex = "9999";

    // 2) ищем/создаём нижний spacer
    let spacer = document.querySelector(".app-nav-spacer");
    if (!spacer) {
      spacer = document.createElement("div");
      spacer.className = "app-nav-spacer";
      spacer.style.width = "100%";
      spacer.style.pointerEvents = "none";
      document.body.appendChild(spacer);
    }

    const navHeight = nav.getBoundingClientRect().height || 60;
    const safeSpace = navHeight + 24; // запас, чтобы точно не перекрывало

    spacer.style.height = safeSpace + "px";
  }

  window.addEventListener("load", applyNavSpacer);
  window.addEventListener("resize", applyNavSpacer);

  // На всякий случай — если динамически грузится контент
  const observer = new MutationObserver(applyNavSpacer);
  observer.observe(document.body, { childList: true, subtree: true });

  // и небольшой таймер после старта
  setTimeout(applyNavSpacer, 1000);
})();
