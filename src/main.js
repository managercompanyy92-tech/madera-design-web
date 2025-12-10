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
// ===== Аккордеон для раздела «Ещё» (универсальный) =====
document.addEventListener('click', (event) => {
  // Ищем ближайшую карточку раздела «Ещё»
  const card = event.target.closest('.order-info__card');
  if (!card) return;

  // Если кликнули по ссылке внутри — даём открыть ссылку, не трогаем карточку
  if (event.target.closest('a')) {
    return;
  }

  // Переключаем класс "открыто / закрыто"
  card.classList.toggle('order-info__card--open');
});

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
          <div class="order-form order-form--accent" data-measure-form>
            <div class="order-form__header">
              <div class="order-form__title">Заявка на замер и расчёт</div>
              <div class="order-form__subtitle">
  Замер после подтверждения менеджером выполняется в течение трёх рабочих дней.
</div>
            </div>

            <div class="order-form__grid">
              <div class="order-form__row">
                <label class="order-form__label">Ваше имя*</label>
                <input
  type="text"
  class="order-form__input"
  placeholder="Как к вам обращаться?"
  name="name"
/>
              </div>

              <div class="order-form__row">
                <label class="order-form__label">Телефон / WhatsApp*</label>
                <input
  type="tel"
  class="order-form__input"
  placeholder="+992 ..."
  name="phone"
/>
              </div>
<div class="order-form__row order-form__row--full">
    <label class="order-form__label">
      Адрес объекта
      <input
        name="text"
        class="order-form__input"
        placeholder="Например, Душанбе, ул. Рудаки 15, кв. 23"
        data-order-address
      />
    </label>
  </div>

  <div class="order-form__row order-form__row--full">
    <label class="order-form__label">
      Ориентир
      <input
        name="text"
        class="order-form__input"
        placeholder="Например, рядом с ТЦ &laquo;Садбарг&raquo;"
        data-order-landmark
      />
    </label>
  </div>
              <div class="order-form__row">
                <label class="order-form__label">Предпочтительный способ связи</label>
                <select name="order-form__select" data-order-contact-method>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="telegram">Telegram</option>
                  <option value="call">Телефонный звонок</option>
                </select>
              </div>

              <div class="order-form__row">
                <label class="order-form__label">Категория мебели</label>
                <select name="order-form__select" data-order-category>
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
                  name="text"
                  class="order-form__input"
                  placeholder="Например, 4.5"
                  data-order-length-output
                />
              </div>

              <div class="order-form__row">
                <label class="order-form__label">Выбранный тариф</label>
                <input
                  name="text"
                  class="order-form__input"
                  placeholder="Стандарт / Премиум"
                  data-order-tariff-output
                />
              </div>

              <div class="order-form__row">
                <label class="order-form__label">Промокод (если есть)</label>
                <input
                  name="text"
                  class="order-form__input"
                  placeholder="Введите промокод"
                  data-order-promo
                />
              </div>

              <div class="order-form__row">
        <label class="order-form__label">
          <textarea
            name="order-form__textarea"
            rows="3"
            placeholder="Кратко опишите проект: размер, стиль, важные детали..."
            data-order-comment
          ></textarea>
        </label>
      </div>

      <!-- Блок оплаты выездного замера -->
      <div class="order-form__row order-form__row--payment">
        <div class="order-form__payment">
          <div class="order-form__payment-header">
            Оплата выездного замера — <strong>100&nbsp;сомони</strong>
          </div>
          <div class="order-form__payment-text">
            Для подтверждения заявки на выездной замер
            переведите <strong>100&nbsp;сомони</strong> по безналичному расчёту
            на карту <strong>Dushanbe City</strong> по номеру
            <strong>+992&nbsp;012&nbsp;90-03-03</strong>.
            После оплаты прикрепите чек ниже.
            Без прикреплённого чека кнопка
            «Отправить заявку на расчёт» будет недоступна.
          </div>

          <label class="order-form__payment-upload">
            <span class="order-form__payment-upload-label">
              Загрузите чек об оплате
              <span class="order-form__required">*</span>
            </span>
            <input
              type="file"
              class="order-form__input order-form__input--file"
              accept="image/*,.pdf"
              name="paymentCheck"
              required
            />
            <span class="order-form__payment-upload-hint">
              Подойдут фото или скан чека (JPG, PNG, HEIC) либо PDF-файл.
            </span>
            <span
              class="order-form__payment-error"
              data-order-payment-error
              aria-live="polite"
            ></span>
          </label>
        </div>
      </div>

      <div class="order-form__row">
        <label class="order-form__label">
          <select class="order-form__select" data-order-ready>
            <option value="soon">Готов(а) заказать в ближайший месяц</option>
            <option value="thinking">Пока изучаю варианты и цены</option>
            <option value="just-looking">Просто смотрю идеи на будущее</option>
          </select>
        </label>
      </div>

      <div class="order-form__row">
        <label class="order-form__label order-form__label--checkbox">
          <input
            type="checkbox"
            class="order-form__checkbox"
            data-order-minimal
          />
          <span>
            Я понимаю, что минимальный объём заказа — 3 погонных метра
            и согласен(на) с этим условием
          </span>
        </label>
      </div>

      <div class="order-form__footer">
        <button class="order-form__submit" type="submit" data-measure-submit>
  Отправить заявку на расчёт
</button>
      </div>

      <div class="order-form__note">
        Нажимая на кнопку, вы отправляете заявку менеджеру
        Madera Design. Мы не передаём данные третьим лицам.
      </div>
    </div>
  </div>
</div>

<style>
  /* Полное скрытие служебного текста "ТЁПЛЫЙ/ХОЛОДНЫЙ ЛИД" */
  .lead-hidden,
  .lead-hidden * {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* Оплата выездного замера */
  .order-form__row--payment {
    margin-top: 12px;
  }

  .order-form__payment {
    padding: 12px 14px;
    border-radius: 14px;
    background: linear-gradient(135deg, #062417, #04140e);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.04);
  }

  .order-form__payment-header {
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #ffb347;
    margin-bottom: 6px;
  }

  .order-form__payment-text {
    font-size: 13px;
    line-height: 1.45;
    color: #f4f4f4;
    margin-bottom: 10px;
  }

  .order-form__payment-upload-label {
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 4px;
    display: inline-block;
  }

  .order-form__required {
    color: #ff6b6b;
    margin-left: 2px;
  }

  .order-form__input--file {
    display: block;
    width: 100%;
    font-size: 13px;
    padding: 6px 0;
    color: #f4f4f4;
  }

  .order-form__payment-upload-hint {
    display: block;
    margin-top: 4px;
    font-size: 11px;
    opacity: 0.7;
  }

  .order-form__payment-error {
    display: block;
    margin-top: 4px;
    font-size: 11px;
    color: #ff6b6b;
  }

  .btn--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>

<script>
  document.addEventListener("DOMContentLoaded", () => {
    // 1) Скрываем служебный текст "ТЁПЛЫЙ/ХОЛОДНЫЙ ЛИД" в зелёной карточке
    try {
      const elements = [
        ...document.querySelectorAll(".order-form__result-ai *"),
      ];
      const target = elements.find(
        (el) =>
          el.textContent &&
          el.textContent.toLowerCase().includes("лид")
      );
      if (target) {
        const parent = target.closest("div.order-form__result-ai");
        if (parent) parent.classList.add("lead-hidden");
      }
    } catch (e) {
      console.warn("Lead hide error:", e);
    }

    // 2) Логика оплаты замера:
    // пока чек не загружен, кнопка отправки отключена
    const orderForm = document.querySelector(".order-form--calc");
    if (orderForm) {
      const paymentInput = orderForm.querySelector(
        "[data-order-payment-check]"
      );
      const paymentError = orderForm.querySelector(
        "[data-order-payment-error]"
      );
      const submitButton = orderForm.querySelector(".btn.btn--primary");

      if (paymentInput && submitButton) {
        const updateState = () => {
          const hasFile =
            paymentInput.files && paymentInput.files.length > 0;

          submitButton.disabled = !hasFile;
          submitButton.classList.toggle("btn--disabled", !hasFile);

          if (hasFile && paymentError) {
            paymentError.textContent = "";
          } else if (!hasFile && paymentError) {
            paymentError.textContent =
              "Оплатите замер и прикрепите чек, чтобы отправить заявку.";
          }
        };

        // Начальное состояние (после открытия страницы)
        updateState();

        // При выборе файла пересчитываем состояние
        paymentInput.addEventListener("change", updateState);
      }
    }
  });
</script>
<script>
  document.addEventListener("DOMContentLoaded", () => {
    // Ищем элемент по тексту "ТЁПЛЫЙ ЛИД" (работает независимо от регистра)
    const elements = [...document.querySelectorAll("*")];

    const target = elements.find(el =>
      el.textContent &&
      el.textContent.toLowerCase().includes("тёплый лид")
    );

    if (target) {
      // Скрываем весь родительский блок (зелёный контейнер)
      const parent = target.closest("div");
      if (parent) parent.classList.add("lead-hidden");
    }
  });
</script>
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
/* ----------------------------- ЛИЧНЫЙ КАБИНЕТ ----------------------------- */

function renderProfile() {
  return `
<style>
  /* ===== ОСНОВНОЕ ОФОРМЛЕНИЕ СТРАНИЦЫ ПРОФИЛЯ ===== */

  .page--profile {
    padding-bottom: 80px;
  }

  .page--profile .page__title {
    margin-bottom: 10px;
  }

  .page--profile .page__subtitle {
    font-size: 14px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.72);
    max-width: 640px;
  }

  .profile-layout {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-top: 24px;
  }

  .profile-layout__left,
  .profile-layout__right {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .profile-card {
    border-radius: 18px;
    border: 1px solid rgba(255, 153, 0, 0.45);
    background:
      radial-gradient(circle at top left, rgba(255, 153, 0, 0.15), transparent 55%),
      radial-gradient(circle at bottom right, rgba(0, 0, 0, 0.95), #000);
    padding: 18px 18px 20px;
    box-shadow:
      0 0 0 1px rgba(0, 0, 0, 0.75),
      0 22px 60px rgba(0, 0, 0, 0.9);
  }

  .profile-card--accent {
    border-color: rgba(255, 191, 73, 0.9);
    background:
      radial-gradient(circle at top left, rgba(255, 191, 73, 0.22), transparent 55%),
      radial-gradient(circle at bottom right, rgba(10, 10, 10, 0.96), #050505);
  }

  .profile-card__title {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0.04em;
    margin-bottom: 6px;
  }

  .profile-card__subtitle {
    font-size: 13px;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.78);
    margin-bottom: 14px;
  }

  .profile-card__section-title {
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #ffb347;
    margin-bottom: 8px;
  }

  .profile-card__muted {
    font-size: 12px;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.65);
  }

  .profile-microcopy {
    font-size: 11px;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.65);
    margin-top: 10px;
  }

  /* ===== ПЕРВЫЙ ЭКРАН: РЕГИСТРАЦИЯ / ВХОД ===== */

  #profile-unauth {
    margin-top: 20px;
  }

  .profile-auth__tabs {
    display: inline-flex;
    border-radius: 999px;
    border: 1px solid rgba(255, 191, 73, 0.5);
    padding: 2px;
    background: rgba(0, 0, 0, 0.7);
    margin-bottom: 14px;
  }

  .profile-auth__tab {
    border: none;
    background: transparent;
    color: rgba(255, 255, 255, 0.7);
    font-size: 13px;
    padding: 6px 14px;
    border-radius: 999px;
    cursor: pointer;
    transition: background 0.18s ease, color 0.18s ease;
  }

  .profile-auth__tab.is-active {
    background: linear-gradient(135deg, #ffb347, #ff8c2b);
    color: #201308;
  }

  .profile-auth__forms {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 2px;
  }

  .profile-auth__panel.is-hidden {
    display: none;
  }

  .profile-auth__row {
    margin-bottom: 8px;
  }

  .profile-auth__label {
    display: block;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.72);
    margin-bottom: 3px;
  }

  .profile-input {
    width: 100%;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(12, 12, 12, 0.96);
    padding: 9px 14px;
    font-size: 13px;
    color: #ffffff;
    outline: none;
    transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
  }

  .profile-input::placeholder {
    color: rgba(255, 255, 255, 0.36);
  }

  .profile-input:focus {
    border-color: rgba(255, 191, 73, 0.95);
    box-shadow: 0 0 0 1px rgba(255, 191, 73, 0.7);
    background: rgba(18, 18, 18, 1);
  }

  .profile-auth__submit {
    width: 100%;
    margin-top: 8px;
  }

  .profile-auth__hint {
    font-size: 11px;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.6);
    margin-top: 8px;
  }

  .profile-auth__error {
    font-size: 11px;
    color: #ff6b6b;
    margin-top: 6px;
    display: none;
  }

  .profile-auth__divider {
    margin: 12px 0 8px;
    border-top: 1px dashed rgba(255, 255, 255, 0.16);
  }

  /* ===== ЭКРАН ПОСЛЕ ВХОДА (ДЭШБОРД) ===== */

  #profile-authenticated {
    display: none;
    margin-top: 22px;
  }

  .profile-greeting {
    margin-bottom: 16px;
  }

  .profile-greeting__title {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .profile-greeting__subtitle {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.76);
  }

  .profile-header-actions {
    margin-top: 10px;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;
  }

  .profile-logout {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    text-decoration: underline;
    text-decoration-style: dotted;
    cursor: pointer;
  }

  /* ===== ФОРМЫ ПРОФИЛЯ ===== */

  .profile-form-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 10px 14px;
    margin-top: 8px;
  }

  .profile-form__row label {
    display: block;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.78);
    margin-bottom: 3px;
  }

  .profile-form__input,
  .profile-form__textarea,
  .profile-form__select {
    width: 100%;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    background: rgba(8, 8, 8, 0.96);
    padding: 9px 14px;
    font-size: 13px;
    color: #ffffff;
    outline: none;
    transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
  }

  .profile-form__textarea {
    border-radius: 14px;
    min-height: 72px;
    resize: vertical;
  }

  .profile-form__select {
    border-radius: 999px;
  }

  .profile-form__input::placeholder,
  .profile-form__textarea::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .profile-form__input:focus,
  .profile-form__textarea:focus,
  .profile-form__select:focus {
    border-color: rgba(255, 191, 73, 0.95);
    box-shadow: 0 0 0 1px rgba(255, 191, 73, 0.7);
    background: rgba(18, 18, 18, 1);
  }

  /* ===== МОИ ЗАКАЗЫ (КАРТОЧКИ) ===== */

  .profile-orders__intro-title {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .profile-orders__intro-subtitle {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.76);
    margin-bottom: 12px;
  }

  .orders-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .order-card {
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    background: rgba(10, 10, 10, 0.94);
    padding: 10px 12px 12px;
  }

  .order-card__top {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 4px;
  }

  .order-card__name {
    font-size: 13px;
    font-weight: 600;
  }

  .order-card__tariff {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
  }

  .order-card__status {
    font-size: 12px;
    margin-bottom: 4px;
  }

  .order-card__status-label {
    font-weight: 700;
  }

  .order-card__progress {
    margin: 4px 0 6px;
  }

  .order-card__progress-bar {
    position: relative;
    height: 4px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    overflow: hidden;
  }

  .order-card__progress-fill {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 40%;
    border-radius: inherit;
    background: linear-gradient(90deg, #ffb347, #ff8626);
  }

  .order-card__progress-fill--20 {
    width: 20%;
  }

  .order-card__progress-text {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.7);
    margin-top: 2px;
  }

  .order-card__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 4px;
  }

  .order-card__btn {
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(18, 18, 18, 0.96);
    font-size: 11px;
    padding: 4px 10px;
    cursor: pointer;
  }

  /* ===== СТАТУС ЗАКАЗА (СПИСОК ЭТАПОВ) ===== */

  .profile-status__list {
    margin-top: 8px;
    padding-left: 18px;
    font-size: 13px;
    line-height: 1.5;
  }

  .profile-status__list li + li {
    margin-top: 2px;
  }

  .profile-status__badge {
    margin-top: 8px;
    font-size: 11px;
    color: #ffb347;
    border-radius: 999px;
    border: 1px solid rgba(255, 179, 71, 0.6);
    padding: 6px 10px;
    background: rgba(255, 179, 71, 0.08);
  }

  /* ===== ПАРТНЁРСКАЯ ПРОГРАММА ===== */

  .partner-list {
    font-size: 13px;
    line-height: 1.5;
    margin-bottom: 10px;
  }

  .partner-list ul {
    padding-left: 18px;
    margin: 6px 0 10px;
  }

  .partner-list li + li {
    margin-top: 2px;
  }

  .partner-form {
    margin-top: 10px;
  }

  .partner-form__row {
    margin-bottom: 8px;
  }

  .partner-form__label {
    display: block;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 3px;
  }

  .partner-form__input,
  .partner-form__select,
  .partner-form__textarea {
    width: 100%;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(8, 8, 8, 0.96);
    padding: 9px 14px;
    font-size: 13px;
    color: #fff;
    outline: none;
    transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
  }

  .partner-form__textarea {
    border-radius: 14px;
    min-height: 70px;
    resize: vertical;
  }

  .partner-form__input::placeholder,
  .partner-form__textarea::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .partner-form__input:focus,
  .partner-form__select:focus,
  .partner-form__textarea:focus {
    border-color: rgba(255, 191, 73, 0.95);
    box-shadow: 0 0 0 1px rgba(255, 191, 73, 0.7);
    background: rgba(18, 18, 18, 1);
  }

  .partner-form__submit {
    width: 100%;
    margin-top: 6px;
  }

  .partner-form__note {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.65);
    margin-top: 8px;
  }

  /* ===== АДАПТИВНЫЙ ЛЕЙАУТ ===== */

  @media (min-width: 900px) {
    .profile-layout {
      flex-direction: row;
      align-items: flex-start;
    }

    .profile-layout__left {
      flex: 1.1;
    }

    .profile-layout__right {
      flex: 0.9;
    }
  }
</style>

<section class="page page--profile">
  <h1 class="page__title">Личный кабинет</h1>
  <p class="page__subtitle">
    Ваше пространство Madera Design для управления заказами, профилем, бонусами и партнёрской программой.
  </p>

  <!-- ЭКРАН 1: ЛЁГКАЯ РЕГИСТРАЦИЯ / ВХОД -->
  <div id="profile-unauth">
    <div class="profile-card profile-card--accent">
      <div class="profile-card__title">Создайте личный кабинет Madera Design</div>
      <div class="profile-card__subtitle">
        Лёгкая регистрация по номеру WhatsApp. После входа вы увидите статусы заказов, промокоды и связь с менеджером.
      </div>

      <div class="profile-auth__tabs">
        <button type="button" class="profile-auth__tab is-active" data-auth-tab="register">
          Регистрация
        </button>
        <button type="button" class="profile-auth__tab" data-auth-tab="login">
          Вход
        </button>
      </div>

      <div class="profile-auth__forms">
        <!-- Форма регистрации -->
        <form class="profile-auth__panel" data-auth-panel="register" data-auth-register>
          <div class="profile-auth__row">
            <label class="profile-auth__label">Имя</label>
            <input
              type="text"
              name="reg-name"
              class="profile-input"
              placeholder="Как к вам обращаться?"
              autocomplete="name"
              required
            />
          </div>
          <div class="profile-auth__row">
            <label class="profile-auth__label">Телефон / WhatsApp (основной ключ авторизации)</label>
            <input
              type="tel"
              name="reg-phone"
              class="profile-input"
              placeholder="+992 ..."
              autocomplete="tel"
              required
            />
          </div>
          <div class="profile-auth__row">
            <label class="profile-auth__label">Пароль</label>
            <input
              type="password"
              name="reg-pass"
              class="profile-input"
              placeholder="Придумайте пароль"
              required
            />
          </div>

          <button type="submit" class="btn btn--primary profile-auth__submit">
            Создать аккаунт
          </button>

          <div class="profile-auth__hint">
            Создавая аккаунт, вы принимаете условия обработки данных и соглашение сервиса.
          </div>
        </form>

        <!-- Форма входа -->
        <form class="profile-auth__panel is-hidden" data-auth-panel="login" data-auth-login>
          <div class="profile-auth__row">
            <label class="profile-auth__label">Телефон / WhatsApp</label>
            <input
              type="tel"
              name="login-phone"
              class="profile-input"
              placeholder="+992 ..."
              autocomplete="tel"
              required
            />
          </div>
          <div class="profile-auth__row">
            <label class="profile-auth__label">Пароль</label>
            <input
              type="password"
              name="login-pass"
              class="profile-input"
              placeholder="Ваш пароль"
              required
            />
          </div>

          <button type="submit" class="btn btn--primary profile-auth__submit">
            Войти
          </button>

          <div class="profile-auth__error" data-auth-error></div>
          <div class="profile-auth__hint">
            Ещё нет аккаунта? Переключитесь на вкладку «Регистрация».
          </div>
        </form>
      </div>

      <div class="profile-auth__divider"></div>
      <div class="profile-microcopy">
        После регистрации вы сможете увидеть историю заказов, статусы по этапам, промокоды и запросы в партнёрскую программу.
      </div>
    </div>
  </div>

  <!-- ЭКРАН 2: ПОСЛЕ РЕГИСТРАЦИИ / ВХОДА -->
  <div id="profile-authenticated">
    <div class="profile-greeting">
      <div class="profile-greeting__title">
        Привет, <span data-profile-greeting-name>клиент</span>.
      </div>
      <div class="profile-greeting__subtitle">
        Добро пожаловать в ваш личный кабинет Madera Design. Здесь вы управляете заказами, стилевыми предпочтениями и партнёрской программой.
      </div>
      <div class="profile-header-actions">
        <span class="profile-logout" data-profile-logout>Выйти из аккаунта</span>
      </div>
    </div>

    <!-- ПАРТНЁРСКАЯ ПРОГРАММА (как на скрине) -->
    <div class="profile-card">
      <div class="profile-card__section-title">Партнёрская программа</div>
      <div class="profile-card__title">Зарабатывайте вместе с Madera Design</div>
      <div class="profile-card__subtitle">
        Рекомендуйте наши услуги клиентам и получайте 5% от каждого оплаченного заказа по вашему промокоду.
        Все выплаты — на ваш кошелёк Душанбе Сити DC.
      </div>

      <div class="partner-list">
        <div class="profile-card__section-title">Преимущества</div>
        <ul>
          <li>5% партнёру, клиенту по промокоду — скидка 10%.</li>
          <li>Прозрачная статистика заказов и история выплат.</li>
          <li>Уведомления о каждом заказе, оформленном по вашему промокоду.</li>
        </ul>

        <div class="profile-card__section-title">Кто может стать партнёром</div>
        <p>
          Дизайнеры, блогеры, мастера, прорабы, владельцы студий, риелторы и любой человек, который
          рекомендует наши услуги реальным клиентам.
        </p>

        <div class="profile-card__section-title">Как это работает</div>
        <ul>
          <li>Вы получаете персональный промокод.</li>
          <li>Клиент вводит код при оформлении заказа.</li>
          <li>Система автоматически закрепляет заказ за вами.</li>
          <li>После 100% оплаты вы получаете вознаграждение на DC.</li>
        </ul>
      </div>

      <div class="profile-card__section-title">Стать партнёром</div>
      <div class="profile-card__subtitle" style="margin-bottom: 10px;">
        Заполните короткую форму — менеджер активирует ваш промокод в течение 1 рабочего дня.
      </div>

      <form class="partner-form" data-form="partner">
        <div class="partner-form__row">
          <label class="partner-form__label">Имя</label>
          <input
            type="text"
            name="partner-name"
            class="partner-form__input"
            placeholder="Как к вам обращаться?"
            required
          />
        </div>

        <div class="partner-form__row">
          <label class="partner-form__label">Телефон / WhatsApp</label>
          <input
            type="tel"
            name="partner-phone"
            class="partner-form__input"
            placeholder="+992 ..."
            required
          />
        </div>

        <div class="partner-form__row">
          <label class="partner-form__label">Профессиональная деятельность</label>
          <select name="partner-role" class="partner-form__select" required>
            <option value="">Выберите вариант</option>
            <option value="designer">Дизайнер интерьеров</option>
            <option value="blogger">Блогер / автор</option>
            <option value="master">Мастер / прораб</option>
            <option value="studio">Владелец студии</option>
            <option value="realtor">Риелтор</option>
            <option value="other">Другое</option>
          </select>
        </div>

        <div class="partner-form__row">
          <label class="partner-form__label">Ссылка на профиль (Instagram и т. д.)</label>
          <input
            type="url"
            name="partner-link"
            class="partner-form__input"
            placeholder="Например, instagram.com/..."
          />
        </div>

        <div class="partner-form__row">
          <label class="partner-form__label">Кратко об аудитории</label>
          <textarea
            name="partner-audience"
            class="partner-form__textarea"
            placeholder="Опишите, с какой аудиторией вы работаете и чем вы можете быть полезны."
          ></textarea>
        </div>

        <button type="submit" class="btn btn--primary partner-form__submit">
          Отправить заявку на партнёрство
        </button>

        <div class="partner-form__note">
          После подтверждения вам будет выдан персональный промокод и инструкции по работе с программой.
        </div>
      </form>
    </div>

    <!-- ОСНОВНОЙ ЛЕЙАУТ: ПРОФИЛЬ + МОИ ЗАКАЗЫ + СТАТУС -->
    <div class="profile-layout">
      <!-- Левая колонка: профиль клиента -->
      <div class="profile-layout__left">
        <div class="profile-card profile-card--accent">
          <div class="profile-card__section-title">Профиль клиента</div>
          <div class="profile-card__title">Ваши данные</div>
          <div class="profile-card__subtitle">
            Основные данные, чтобы менеджеру и системе было проще готовить рекомендации и общаться с вами.
          </div>

          <div class="profile-form-grid">
            <div class="profile-form__row">
              <label>Имя</label>
              <input
                type="text"
                class="profile-form__input"
                data-profile-name-output
                placeholder="(подтянется из первой заявки)"
              />
            </div>

            <div class="profile-form__row">
              <label>Телефон / WhatsApp</label>
              <input
                type="tel"
                class="profile-form__input"
                data-profile-phone-output
                placeholder="(подтянется из первой заявки)"
              />
            </div>

            <div class="profile-form__row">
              <label>Предпочтительный стиль интерьера</label>
              <select class="profile-form__select">
                <option value="">Выберите стиль</option>
                <option value="modern">Современный</option>
                <option value="minimal">Минимализм</option>
                <option value="loft">Лофт</option>
                <option value="classic">Классика</option>
                <option value="mix">Смешанный</option>
              </select>
            </div>

            <div class="profile-form__row">
              <label>Город</label>
              <input
                type="text"
                class="profile-form__input"
                placeholder="Например, Душанбе"
              />
            </div>

            <div class="profile-form__row">
              <label>Адрес (подтягивается из первой заявки)</label>
              <input
                type="text"
                class="profile-form__input"
                placeholder="Улица, дом, подъезд, этаж, квартира"
              />
            </div>

            <div class="profile-form__row">
              <label>Ориентир</label>
              <input
                type="text"
                class="profile-form__input"
                placeholder="Например, рядом с торговым центром ..."
              />
            </div>

            <div class="profile-form__row">
              <label>Email (не обязательно)</label>
              <input
                type="email"
                class="profile-form__input"
                placeholder="Для отправки чертежей и спецификаций"
              />
            </div>

            <div class="profile-form__row">
              <label>Комментарий</label>
              <textarea
                class="profile-form__textarea"
                placeholder="Здесь можно указать любимые материалы, бренды фурнитуры и важные пожелания."
              ></textarea>
            </div>
          </div>

          <div class="profile-microcopy">
            После обновления данных система подбирает решения и материалы под ваш стиль и бюджет.
          </div>
        </div>
      </div>

      <!-- Правая колонка: Мои заказы + Статус заказа -->
      <div class="profile-layout__right">
        <!-- Блок «Мои заказы» -->
        <div class="profile-card">
          <div class="profile-card__section-title">Мои заказы</div>
          <div class="profile-orders__intro-title">Статусы и этапы ваших проектов</div>
          <div class="profile-orders__intro-subtitle">
            Отслеживайте этапы, статус выполнения, даты готовности и взаимодействуйте с менеджером в режиме реального времени.
          </div>

          <div class="orders-list">
            <!-- Карточка заказа 1 -->
            <div class="order-card">
              <div class="order-card__top">
                <div>
                  <div class="order-card__name">Заказ №MD-001 — кухня 4,5 м</div>
                  <div class="order-card__tariff">Тариф «Премиум»</div>
                </div>
              </div>
              <div class="order-card__status">
                Статус: <span class="order-card__status-label">В производстве</span>
              </div>
              <div class="order-card__progress">
                <div class="order-card__progress-bar">
                  <div class="order-card__progress-fill"></div>
                </div>
                <div class="order-card__progress-text">Прогресс: 40%</div>
              </div>
              <div class="order-card__actions">
                <button type="button" class="order-card__btn" data-order-details>
                  Открыть детали
                </button>
                <button type="button" class="order-card__btn" data-order-chat>
                  Чат с менеджером
                </button>
              </div>
            </div>

            <!-- Карточка заказа 2 -->
            <div class="order-card">
              <div class="order-card__top">
                <div>
                  <div class="order-card__name">Заказ №MD-002 — гардеробная 3 м</div>
                  <div class="order-card__tariff">Тариф «Стандарт»</div>
                </div>
              </div>
              <div class="order-card__status">
                Статус: <span class="order-card__status-label">Ожидает замера</span>
              </div>
              <div class="order-card__progress">
                <div class="order-card__progress-bar">
                  <div class="order-card__progress-fill order-card__progress-fill--20"></div>
                </div>
                <div class="order-card__progress-text">Прогресс: 20%</div>
              </div>
              <div class="order-card__actions">
                <button type="button" class="order-card__btn" data-order-details>
                  Открыть детали
                </button>
                <button type="button" class="order-card__btn" data-order-ready-measure>
                  Сообщить готовность к замеру
                </button>
              </div>
            </div>
          </div>

          <div class="profile-microcopy">
            В реальной версии здесь появится список всех ваших заказов с реальными датами, суммами, этапами и быстрым переходом в чат по каждому проекту.
          </div>
        </div>

        <!-- Блок «Статус заказа: подробное объяснение» -->
        <div class="profile-card">
          <div class="profile-card__section-title">Статус заказа</div>
          <div class="profile-card__title">Как отслеживать свой заказ</div>
          <div class="profile-card__subtitle">
            Статус заказа показывает текущий этап вашего проекта — от заявки до монтажа и сдачи.
          </div>

          <ul class="profile-status__list">
            <li>1. Заявка получена</li>
            <li>2. Замер</li>
            <li>3. Дизайн-проект в разработке</li>
            <li>4. Дизайн-проект согласован</li>
            <li>5. Счёт выставлен / Ожидание оплаты</li>
            <li>6. Оплачено / Запуск в производство</li>
            <li>7. В производстве</li>
            <li>8. Готово к монтажу</li>
            <li>9. В монтаже</li>
            <li>10. Завершено / Сдано</li>
          </ul>

          <div class="profile-status__badge">
            На шаге «Счёт выставлен / Ожидание оплаты» система ждёт 100% безналичной оплаты через кошелёк Душанбе Сити DC.
            После подтверждённого платежа статус автоматически меняется на «Оплачено / Запуск в производство».
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<script>
  function initMaderaProfile() {
    const unauth = document.getElementById("profile-unauth");
    const authd = document.getElementById("profile-authenticated");
    if (!unauth || !authd) return;

    const AUTH_FLAG_KEY = "madera_profile_auth";
    const NAME_KEY = "madera_profile_name";
    const PHONE_KEY = "madera_profile_phone";
    const PASS_KEY = "madera_profile_pass";

    function fillFromStorage() {
      const name = localStorage.getItem(NAME_KEY) || "";
      const phone = localStorage.getItem(PHONE_KEY) || "";

      const greetName = document.querySelector("[data-profile-greeting-name]");
      const nameOutput = document.querySelector("[data-profile-name-output]");
      const phoneOutput = document.querySelector("[data-profile-phone-output]");

      if (greetName) {
        greetName.textContent = name || "клиент";
      }
      if (nameOutput) {
        nameOutput.value = name || "";
      }
      if (phoneOutput) {
        phoneOutput.value = phone || "";
      }
    }

    function showAuthenticated() {
      unauth.style.display = "none";
      authd.style.display = "";
      fillFromStorage();
    }

    function showUnauth() {
      unauth.style.display = "";
      authd.style.display = "none";
    }

    // начальное состояние
    if (localStorage.getItem(AUTH_FLAG_KEY) === "1") {
      showAuthenticated();
    } else {
      showUnauth();
    }

    // переключатель «Регистрация / Вход»
    const tabButtons = unauth.querySelectorAll("[data-auth-tab]");
    const tabPanels = unauth.querySelectorAll("[data-auth-panel]");

    tabButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        const mode = btn.dataset.authTab;
        tabButtons.forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
        });
        tabPanels.forEach(function (panel) {
          const isCurrent = panel.dataset.authPanel === mode;
          panel.classList.toggle("is-hidden", !isCurrent);
        });
      });
    });

    // регистрация
    const regForm = unauth.querySelector("[data-auth-register]");
    if (regForm) {
      regForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const name = regForm.querySelector('input[name="reg-name"]').value.trim();
        const phone = regForm.querySelector('input[name="reg-phone"]').value.trim();
        const pass = regForm.querySelector('input[name="reg-pass"]').value.trim();

        if (!name || !phone || !pass) {
          return;
        }

        localStorage.setItem(NAME_KEY, name);
        localStorage.setItem(PHONE_KEY, phone);
        localStorage.setItem(PASS_KEY, pass);
        localStorage.setItem(AUTH_FLAG_KEY, "1");

        showAuthenticated();
      });
    }

    // вход
    const loginForm = unauth.querySelector("[data-auth-login]");
    if (loginForm) {
      loginForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const phone = loginForm.querySelector('input[name="login-phone"]').value.trim();
        const pass = loginForm.querySelector('input[name="login-pass"]').value.trim();
        const errorBox = loginForm.querySelector("[data-auth-error]");

        const savedPhone = localStorage.getItem(PHONE_KEY);
        const savedPass = localStorage.getItem(PASS_KEY);

        if (savedPhone && savedPass && phone === savedPhone && pass === savedPass) {
          localStorage.setItem(AUTH_FLAG_KEY, "1");
          if (errorBox) {
            errorBox.style.display = "none";
            errorBox.textContent = "";
          }
          showAuthenticated();
        } else {
          if (errorBox) {
            errorBox.textContent = "Проверьте номер телефона и пароль.";
            errorBox.style.display = "block";
          }
        }
      });
    }

    // выход
    const logoutBtn = document.querySelector("[data-profile-logout]");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        localStorage.removeItem(AUTH_FLAG_KEY);
        showUnauth();
      });
    }

    // заглушки для кнопок в карточках заказов
    document.querySelectorAll("[data-order-details]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        alert("В реальной версии здесь откроются детали заказа.");
      });
    });

    document.querySelectorAll("[data-order-chat]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        alert("В реальной версии здесь откроется чат с менеджером.");
      });
    });

    document.querySelectorAll("[data-order-ready-measure]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        alert("Запрос на готовность к замеру будет отправлен менеджеру.");
      });
    });

    // форма партнёрской программы
    const partnerForm = document.querySelector("[data-partner-form]");
    if (partnerForm) {
      partnerForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const name = partnerForm.querySelector('input[name="partner-name"]').value.trim();
        const phone = partnerForm.querySelector('input[name="partner-phone"]').value.trim();
        const role = partnerForm.querySelector('select[name="partner-role"]').value.trim();

        if (!name || !phone || !role) {
          alert("Пожалуйста, заполните обязательные поля: имя, телефон и деятельность.");
          return;
        }

        alert("Заявка на партнёрство отправлена. Менеджер свяжется с вами в течение 1 рабочего дня.");
        partnerForm.reset();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", initMaderaProfile);
</script>
`;
}
// ===== ЛОКАЛЬНАЯ РЕГИСТРАЦИЯ / АВТОРИЗАЦИЯ ПРОФИЛЯ (ДЕМО) =====

const MADERA_PROFILE_STORAGE_KEY = 'madera_profile_v1';

// Загрузка профиля из localStorage
function loadMaderaProfile() {
  try {
    const raw = localStorage.getItem(MADERA_PROFILE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Не удалось прочитать профиль из localStorage', e);
    return null;
  }
}

// Сохранение профиля
function saveMaderaProfile(profile) {
  try {
    localStorage.setItem(MADERA_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn('Не удалось сохранить профиль в localStorage', e);
  }
}

// Очистка профиля (выход)
function clearMaderaProfile() {
  try {
    localStorage.removeItem(MADERA_PROFILE_STORAGE_KEY);
  } catch (e) {
    console.warn('Не удалось удалить профиль из localStorage', e);
  }
}

// Основная инициализация страницы "Профиль"
function initProfilePage() {
  const profileData = loadMaderaProfile();

  const unauthBlock = document.getElementById('profile-unauth');
  const authBlock = document.getElementById('profile-authenticated');

  const authTabs = document.querySelectorAll('.profile-auth__tab');
  const authPanels = document.querySelectorAll('.profile-auth__panel');
  const errorBox = document.querySelector('.profile-auth__error');
  const greetingNameSpan = document.querySelector('[data-profile-greeting-name]');
  const logoutBtn = document.querySelector('.profile-logout');

  const regForm = document.querySelector('form[data-auth-panel="register"]');
  const loginForm = document.querySelector('form[data-auth-panel="login"]');

  const profileForm = document.querySelector('[data-profile-form="client"]');
  const partnerForm = document.querySelector('.partner-form');

  // ----- Вспомогательные функции -----

  function showError(message) {
    if (!errorBox) return;
    errorBox.textContent = message;
    errorBox.style.display = 'block';
  }

  function clearError() {
    if (!errorBox) return;
    errorBox.textContent = '';
    errorBox.style.display = 'none';
  }

  function switchAuthTab(targetTab) {
    if (!unauthBlock) return;

    // показываем блок авторизации, скрываем личный кабинет
    unauthBlock.style.display = 'block';
    if (authBlock) authBlock.style.display = 'none';

    // переключаем табы
    authTabs.forEach((tab) => {
      const tabKey = tab.dataset.authTab;
      tab.classList.toggle('is-active', tabKey === targetTab);
    });

    // переключаем панели
    authPanels.forEach((panel) => {
      const panelKey = panel.dataset.authPanel;
      panel.classList.toggle('is-hidden', panelKey !== targetTab);
    });

    clearError();
  }

  function fillProfileForm(profile) {
    if (!profileForm || !profile) return;

    const map = {
      'profile-name': 'name',
      'profile-phone': 'phone',
      'profile-style': 'style',
      'profile-city': 'city',
      'profile-address': 'address',
      'profile-landmark': 'landmark',
      'profile-email': 'email'
    };

    Object.keys(map).forEach((inputName) => {
      const fieldKey = map[inputName];
      const input = profileForm.elements[inputName];
      if (input && profile[fieldKey]) {
        input.value = profile[fieldKey];
      }
    });
  }

  function showDashboard(profile) {
    if (unauthBlock) unauthBlock.style.display = 'none';
    if (authBlock) authBlock.style.display = 'block';

    clearError();

    if (greetingNameSpan) {
      greetingNameSpan.textContent = profile && profile.name
        ? profile.name
        : 'Клиент';
    }

    fillProfileForm(profile);
  }

  // ----- Стартовое состояние -----

  if (profileData) {
    // уже есть сохранённый профиль — сразу показываем личный кабинет
    showDashboard(profileData);
  } else {
    // профиля нет — показываем регистрацию
    switchAuthTab('register');
  }

  // ----- Обработчики табов Регистрация / Вход -----

  authTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.authTab; // 'register' | 'login'
      switchAuthTab(targetTab);
    });
  });

  // ----- Регистрация -----

  if (regForm) {
    regForm.addEventListener('submit', (event) => {
      event.preventDefault();
      clearError();

      const name = regForm.elements['reg-name']?.value.trim() || '';
      const phone = regForm.elements['reg-phone']?.value.trim() || '';
      const pass = regForm.elements['reg-pass']?.value.trim() || '';

      if (!phone || !pass) {
        showError('Укажите номер телефона и пароль.');
        return;
      }

      const existing = loadMaderaProfile();
      if (existing && existing.phone === phone) {
        showError('Аккаунт с таким номером уже существует. Попробуйте войти.');
        switchAuthTab('login');
        return;
      }

      const newProfile = {
        name,
        phone,
        pass, // ВАЖНО: в реальном проекте пароль так хранить нельзя, это только демо.
        style: '',
        city: '',
        address: '',
        landmark: '',
        email: ''
      };

      saveMaderaProfile(newProfile);
      showDashboard(newProfile);
    });
  }

  // ----- Вход -----
if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    clearError();

    const phone = loginForm.elements['login-phone'].value.trim();
    const pass = loginForm.elements['login-pass'].value;

    const stored = loadMaderaProfile();

    if (!stored) {
      showError('Аккаунт ещё не создан. Пожалуйста, зарегистрируйтесь.');
      switchAuthTab('register');
      return;
    }

    if (!phone || !pass) {
      showError('Введите номер телефона и пароль.');
      return;
    }

    if (stored.phone !== phone || stored.password !== pass) {
      showError('Неверный номер телефона или пароль.');
      return;
    }

    // ВАЖНО — именно эта строка открывает личный кабинет
    showDashboard(stored);
  });
}
// ----- ЖЁСТКАЯ ИНИЦИАЛИЗАЦИЯ РЕГИСТРАЦИИ И ВХОДА -----
  (function setupStrongAuth() {
    // Ищем именно формы регистрации и входа по атрибуту data-auth-panel
    const regFormEl = document.querySelector('form[data-auth-panel="register"]');
    const loginFormEl = document.querySelector('form[data-auth-panel="login"]');

    if (!regFormEl || !loginFormEl) {
      // Если форм нет на странице — тихо выходим
      return;
    }

    // Регистрация
    regFormEl.addEventListener('submit', (event) => {
      event.preventDefault();
      clearError && clearError();

      const name  = regFormEl.elements['reg-name']?.value.trim()  || '';
      const phone = regFormEl.elements['reg-phone']?.value.trim() || '';
      const pass  = regFormEl.elements['reg-pass']?.value || '';

      if (!phone || !pass) {
        showError && showError('Введите номер телефона и пароль.');
        return;
      }

      const profile = {
        name: name || 'Клиент',
        phone,
        password: pass,
      };

      // Сохраняем профиль в локальное хранилище
      if (typeof saveMaderaProfile === 'function') {
        saveMaderaProfile(profile);
      }

      // Сразу переключаемся на вкладку "Вход"
      if (typeof switchAuthTab === 'function') {
        switchAuthTab('login');
      }

      // Подставляем номер и пароль в форму входа
      if (loginFormEl.elements['login-phone']) {
        loginFormEl.elements['login-phone'].value = phone;
      }
      if (loginFormEl.elements['login-pass']) {
        loginFormEl.elements['login-pass'].value = pass;
      }
    });

    // Вход
    loginFormEl.addEventListener('submit', (event) => {
      event.preventDefault();
      clearError && clearError();

      const phone = loginFormEl.elements['login-phone']?.value.trim() || '';
      const pass  = loginFormEl.elements['login-pass']?.value || '';

      if (!phone || !pass) {
        showError && showError('Введите номер телефона и пароль.');
        return;
      }

      let stored = null;
      if (typeof loadMaderaProfile === 'function') {
        stored = loadMaderaProfile();
      }

      if (!stored) {
        showError && showError('Аккаунт ещё не создан. Пожалуйста, зарегистрируйтесь.');
        if (typeof switchAuthTab === 'function') {
          switchAuthTab('register');
        }
        return;
      }

      if (stored.phone !== phone || stored.password !== pass) {
        showError && showError('Неверный номер телефона или пароль.');
        return;
      }

      // Успешный вход — открываем личный кабинет
      if (typeof showDashboard === 'function') {
        showDashboard(stored);
      } else {
        // Резервный вариант, если по какой-то причине showDashboard не сработает
        const unauthBlock = document.getElementById('profile-unauth');
        const authBlock   = document.getElementById('profile-authenticated');
        const greeting    = document.querySelector('[data-profile-greeting-name]');

        if (unauthBlock) unauthBlock.style.display = 'none';
        if (authBlock)   authBlock.style.display   = 'block';
        if (greeting)    greeting.textContent      = stored.name || 'Клиент';
      }
    });
  })();
  // ----- Выход -----

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearMaderaProfile();
      switchAuthTab('login');
    });
  }

  // ----- Форма "Профиль клиента" (обновление данных) -----

  if (profileForm) {
    profileForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const stored = loadMaderaProfile() || {};

      const updatedProfile = {
        ...stored,
        name: profileForm.elements['profile-name']?.value.trim() || stored.name || '',
        phone: profileForm.elements['profile-phone']?.value.trim() || stored.phone || '',
        style: profileForm.elements['profile-style']?.value.trim() || stored.style || '',
        city: profileForm.elements['profile-city']?.value.trim() || stored.city || '',
        address: profileForm.elements['profile-address']?.value.trim() || stored.address || '',
        landmark: profileForm.elements['profile-landmark']?.value.trim() || stored.landmark || '',
        email: profileForm.elements['profile-email']?.value.trim() || stored.email || '',
      };

      saveMaderaProfile(updatedProfile);
      if (greetingNameSpan) {
        greetingNameSpan.textContent = updatedProfile.name || 'Клиент';
      }

      alert('Профиль обновлён (демо-режим).');
    });
  }

  // ----- Форма партнёрской программы -----

  if (partnerForm) {
    partnerForm.addEventListener('submit', (event) => {
      event.preventDefault();

      // В демо-версии просто показываем сообщение и очищаем форму
      alert('Заявка на партнёрство отправлена (демо). Менеджер свяжется с вами по указанным контактам.');

      partnerForm.reset();
    });
  }
      }
/* ------------------------- РАЗДЕЛ «ЕЩЁ» / ИНФО ------------------------- */

function renderMore() {
  return `
    <style>
      /* Карточка раздела «Ещё» — внешний вид такой же, как был */
      .order-info__card {
        border: 1px solid rgba(255, 140, 0, 0.8);
        border-radius: 20px;
        box-shadow: 0 0 12px rgba(255, 140, 0, 0.4);
        padding: 16px 20px;
        margin-bottom: 16px;
        position: relative;
        background: #050505;
        overflow: hidden;
      }

      /* Стрелка справа, показывает открыт блок или нет */
      .order-info__card::after {
        content: "▶";
        position: absolute;
        right: 20px;
        top: 20px;
        font-size: 14px;
        color: rgba(255, 153, 51, 0.9);
        transition: transform 0.2s ease;
      }

      .order-info__card.order-info__card--open::after {
        transform: rotate(90deg);
      }

      /* Делаем заголовки кликабельными по ощущению */
      .order-info__badge,
      .order-info__title {
        cursor: pointer;
      }

      /* Чтобы текст заголовка не наезжал на стрелку */
      .order-info__title {
        padding-right: 32px;
      }

      /* Тело карточки (список, текст) по умолчанию скрыто */
      .order-info__card .order-info__list,
      .order-info__card .order-info__text {
        margin-top: 12px;
        max-height: 0;
        overflow: hidden; 
        opacity: 0;
        transition: max-height 0.25s ease, opacity 0.25s ease;
      }

      /* Открытая карточка — показываем содержимое */
      .order-info__card.order-info__card--open .order-info__list,
      .order-info__card.order-info__card--open .order-info__text {
        max-height: 2000px; /* с запасом под любой текст */
        opacity: 1;
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
<!-- Наши работы -->
<div class="order-info__card">
  <div class="order-info__badge">Наши работы</div>
  <h2 class="order-info__title">Портфолио Madera Design</h2>

  <ul class="order-info__list">
    <li><strong>Наши работы — скоро здесь.</strong></li>

    <li>
      Madera Design — современная студия корпусной мебели. Мы только
      открылись и уже реализуем первые проекты, которые будут размещаться
      в этом разделе по мере их готовности.
    </li>

    <li>
      Мы публикуем только реальные объекты, выполненные нашей командой —
      кухни, гардеробные, гостиные, ТВ-зоны и встроенные системы хранения.
      Раздел активно наполняется.
    </li>

    <li>
      Первые завершённые проекты появятся в ближайшее время. Менеджер может
      показать материалы, решения и текущие работы в производстве.
    </li>
  </ul>
</div>
<!-- Документы -->
<div class="order-info__card">
  <div class="order-info__badge">Документы</div>
  <h2 class="order-info__title">Документы Madera Design</h2>

  <ul class="order-info__list">

    <li>
      <strong>Заявка и замер:</strong><br>
      Замер считается подтверждённым только после загрузки квитанции об оплате 
      <strong>100 сомони</strong> через электронный кошелёк Душанбе Сити DC.
    </li>

    <li>
      <strong>Проектирование и расчёт:</strong><br>
      Техническое задание, предварительная смета, дизайн-проект и чертежи —
      всё предоставляется в электронном виде.
    </li>

    <li>
      <strong>Договор и оплата:</strong><br>
      Заказ запускается только после <strong>100% безналичной оплаты</strong> через
      кошелёк Душанбе Сити DC. Клиент получает договор, счёт, подтверждение оплаты
      и уведомление о начале производства.
    </li>

    <li>
      <strong>Производство и монтаж:</strong><br>
      Формируется график работ. После установки подписывается акт приёмки-передачи,
      выдается гарантийный талон на 12 месяцев.
    </li>

    <li>
      <strong>Рассрочка (если оформляется):</strong><br>
      Кредитный договор, график платежей и подтверждения ежемесячных оплат.
    </li>

    <li>
      <strong>Личный кабинет клиента:</strong><br>
      Профиль, архив заказов и все документы по проекту доступны онлайн.
    </li>

  </ul>
</div>
<!-- Партнёрам -->
<div class="order-info__card">
  <div class="order-info__badge">Партнёрам</div>
  <h2 class="order-info__title">Партнёрская программа Madera Design</h2>

  <ul class="order-info__list">

    <li>
      Партнёрская программа — это возможность получать 
      <strong>5% от каждого оплаченного заказа</strong>, оформленного по вашему
      персональному промокоду. Все выплаты производятся на ваш электронный кошелёк 
      <strong>Душанбе Сити DC</strong>.
    </li>

    <li>
      <strong>Кто может стать партнёром:</strong><br>
      дизайнеры, блогеры, мастера, прорабы, владельцы студий и любой человек, 
      который рекомендует наши услуги реальным клиентам.
    </li>

    <li>
      <strong>Условия сотрудничества:</strong><br>
      5% партнёру, клиенту — скидка <strong>10%</strong> по промокоду.  
      Прозрачная статистика заказов, история выплат, уведомления о каждом заказе.
    </li>

    <li>
      <strong>Как работает система:</strong><br>
      Клиент вводит ваш промокод при оформлении заказа — система автоматически 
      закрепляет заказ за вами. После 100% оплаты вы получаете вознаграждение на DC.
    </li>

    <li>
      <strong>Как стать партнёром:</strong><br>
      заполнить регистрационную форму, принять условия, получить промокод и 
      рекомендовать наш сервис своей аудитории.
    </li>

  </ul>
</div>
<!-- Контакты -->
<div class="order-info__card">
  <div class="order-info__badge">Контакты</div>
  <h2 class="order-info__title">Как связаться с Madera Design</h2>

  <ul class="order-info__list">

    <li>
      <strong>Телефон:</strong><br>
      <a href="tel:+992012900303">+992 012-90-03-03</a>
    </li>

    <li>
      <strong>WhatsApp:</strong><br>
      <a href="https://wa.me/992012900303" target="_blank">Написать в WhatsApp</a>
    </li>

    <li>
      <strong>Telegram:</strong><br>
      <a href="https://t.me/+992012900303" target="_blank">Написать в Telegram</a>
    </li>

    <li>
      <strong>E-mail:</strong><br>
      <a href="mailto:management.maderadesign@gmail.com">
        management.maderadesign@gmail.com
      </a>
    </li>

    <li>
      <strong>Instagram:</strong><br>
      <a href="https://instagram.com/modera_design_tjk" target="_blank">
        @modera_design_tjk
      </a>
    </li>

    <li>
      <strong>Facebook:</strong><br>
      <a href="https://www.facebook.com/share/1BiHjxikKD/" target="_blank">
        facebook.com/share/1BiHjxikKD/
      </a>
    </li>

    <li>
      Для точного расчёта мы подскажем, какие данные подготовить: размеры, фото помещения, планировку и примеры интерьеров.
    </li>

  </ul>
</div>
<!-- Дизайн -->
<div class="order-info__card">
  <div class="order-info__badge">Дизайн</div>
  <h2 class="order-info__title">Дизайн-проекты от Madera Design</h2>

  <ul class="order-info__list">

    <li>
      Мы создаём профессиональные дизайн-проекты интерьеров и мебели —
      от одной комнаты до полной квартиры или дома.
    </li>

    <li>
      В состав дизайн-проекта входят:
      планировочные решения, фотореалистичные 3D-визуализации,
      рабочие чертежи, спецификации материалов и рекомендации по стилю
      и отделке.
    </li>

    <li>
      Мы разрабатываем индивидуальный дизайн корпусной мебели:
      кухни, гардеробные, встроенные шкафы, ТВ-зоны, прихожие,
      включая визуализации и технические чертежи для производства.
    </li>

    <li>
      <strong>Стоимость:</strong>
      400 сомони за 1 м² площади (например, 70 м² ≈ 28 000 сомони).
    </li>

    <li>
      <strong>Сроки разработки:</strong>
      от 30 рабочих дней — точные сроки рассчитываются индивидуально.
    </li>

    <li>
      Чтобы мы подготовили персональное предложение, направьте:
      тип помещения, площадь, желаемый стиль интерьера и доступные материалы
      (план, фото или чертёж).
    </li>

  </ul>
</div>
<!-- Наши услуги -->
<div class="order-info__card">
  <div class="order-info__badge">Наши услуги</div>
  <h2 class="order-info__title">Что предлагает Madera Design</h2>

  <ul class="order-info__list">

    <li>
      <strong>Корпусная мебель на заказ:</strong>
      кухни, гардеробные, шкафы, ТВ-зоны, прихожие, детские и кабинеты.
      Полный цикл — замер, дизайн, производство, монтаж.
      Современные стили: минимализм, современный, сканди, лофт, hi-tech.
    </li>

    <li>
      <strong>Интерьерный дизайн:</strong>
      планировки, 3D-визуализации, подбор материалов,
      рабочие чертежи. Стоимость дизайн-проекта — 400 сомони / м².
    </li>

    <li>
      <strong>Дизайн мебели:</strong>
      визуализации, технические чертежи, подготовка документации для производства.
    </li>

    <li>
      <strong>Экстерьер частных домов:</strong>
      современные решения для фасадов, входных групп и дворов.
    </li>

    <li>
      <strong>Профессиональный замер:</strong>
      выезд специалиста — 100 сомони (сумма возвращается в стоимости заказа).
    </li>

    <li>
      <strong>Кредит / рассрочка:</strong>
      программы на 6, 12 или 18 месяцев с фиксированной переплатой —
      10%, 20% или 30%.
    </li>

  </ul>
</div>
<!-- Статус заказа -->
<div class="order-info__card">
  <div class="order-info__badge">Статус заказа</div>
  <h2 class="order-info__title">Как отслеживать свой заказ</h2>

  <ul class="order-info__list">

    <li>
      <strong>Статус заказа</strong> показывает текущий этап вашего проекта
      в системе Madera Design — от заявки и дизайна до производства, монтажа
      и сдачи работы.
    </li>

    <li>
      В личном профиле клиента вы видите список заказов, статус каждого,
      ориентировочный прогресс и планируемую дату готовности и монтажа.
    </li>

    <li>
      Основные этапы:
      «Заявка получена», «Дизайн-проект в разработке», «Дизайн-проект согласован»,
      «Счёт выставлен / Ожидание оплаты», «Оплачено / Запуск в производство»,
      «В производстве», «Готово к монтажу», «В монтаже», «Завершено / Сдано».
    </li>

    <li>
      На шаге «Счёт выставлен / Ожидание оплаты» система ждёт
      <strong>100% безналичной оплаты</strong> через электронный кошелёк Душанбе Сити DC.
      После подтверждённого платежа статус меняется на «Оплачено / Запуск в производство».
    </li>

    <li>
      Статус помогает понимать, что происходит с заказом прямо сейчас
      и нужен ли от вас какой-то шаг: согласование, оплата, выбор даты монтажа.
    </li>

  </ul>
</div>
<!-- Акции -->
<div class="order-info__card">
  <div class="order-info__badge">Акции</div>
  <h2 class="order-info__title">Специальные предложения Madera Design</h2>

  <ul class="order-info__list">

    <li>
      Раздел «Акции» — это официальный источник всех специальных предложений
      Madera Design: сезонные скидки, выгодные условия на дизайн-проекты
      и изготовление мебели.
    </li>

    <li>
      Все акции описываются прозрачно: что входит в предложение, на какой
      период оно действует и какие есть ограничения — без скрытых условий
      и «сюрпризов».
    </li>

    <li>
      Если в данный момент активных акций нет, раздел честно показывает,
      что специальных предложений сейчас нет. Новые кампании появляются здесь
      в режиме реального времени.
    </li>

    <li>
      Раздел полезен клиентам, которые хотят оформить заказ на лучших условиях,
      и партнёрам, которым важно понимать, какие предложения можно продвигать
      своей аудитории.
    </li>

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
  // ===== ПРОСТАЯ ЛОГИКА РЕГИСТРАЦИИ И ВХОДА В ЛК Madera =====

(function setupSimpleProfileAuth() {
  const STORAGE_KEY = 'madera-simple-profile';

  function getEls() {
    return {
      unauth: document.getElementById('profile-unauth'),
      auth: document.getElementById('profile-authenticated'),
      greetingName: document.querySelector('[data-profile-greeting-name]'),
      loginForm: document.querySelector('form[data-auth-panel="login"]'),
      regForm: document.querySelector('form[data-auth-panel="register"]'),
      errorBox: document.querySelector('.profile-auth__error')
    };
  }

  function showError(msg, els) {
    if (!els.errorBox) return;
    els.errorBox.textContent = msg;
    els.errorBox.style.display = 'block';
  }

  function clearError(els) {
    if (!els.errorBox) return;
    els.errorBox.textContent = '';
    els.errorBox.style.display = 'none';
  }

  // Переключение вкладок на "Вход"
  function switchToLoginTab() {
    const tabs = document.querySelectorAll('[data-auth-tab]');
    const panels = document.querySelectorAll('[data-auth-panel]');

    tabs.forEach((tab) => {
      const isLogin = tab.dataset.authTab === 'login';
      tab.classList.toggle('is-active', isLogin);
    });

    panels.forEach((panel) => {
      const isLogin = panel.dataset.authPanel === 'login';
      panel.classList.toggle('is-hidden', !isLogin);
    });
  }

  function saveProfile(profile) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.warn('Cannot save profile', e);
    }
  }

  function loadProfile() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Cannot load profile', e);
      return null;
    }
  }

  // Показ личного кабинета
  function showDashboard(profile, els) {
    if (els.unauth) els.unauth.style.display = 'none';
    if (els.auth) els.auth.style.display = 'block';

    if (els.greetingName) {
      els.greetingName.textContent = profile.name || 'Клиент';
    }
  }

  // Глобальный обработчик отправки форм профиля
  document.addEventListener('submit', function (event) {
    const form = event.target;
    const els = getEls();

    // ----- Регистрация -----
    if (form.matches('form[data-auth-panel="register"]')) {
      event.preventDefault();
      clearError(els);

      const name = form.elements['reg-name']?.value.trim();
      const phone = form.elements['reg-phone']?.value.trim();
      const pass = form.elements['reg-pass']?.value;

      if (!name || !phone || !pass) {
        showError('Заполните все поля регистрации.', els);
        return;
      }

      const profile = { name, phone, pass };
      saveProfile(profile);

      // Автозаполнение формы входа
      if (els.loginForm) {
        if (els.loginForm.elements['login-phone']) {
          els.loginForm.elements['login-phone'].value = phone;
        }
        if (els.loginForm.elements['login-pass']) {
          els.loginForm.elements['login-pass'].value = pass;
        }
      }

      // Автоматически переключаем на вкладку "Вход"
      switchToLoginTab();
      return;
    }

    // ----- Вход -----
    if (form.matches('form[data-auth-panel="login"]')) {
      event.preventDefault();
      clearError(els);

      const phone = form.elements['login-phone']?.value.trim();
      const pass = form.elements['login-pass']?.value;

      if (!phone || !pass) {
        showError('Введите номер телефона и пароль.', els);
        return;
      }

      const stored = loadProfile();

      if (!stored) {
        showError('Аккаунт ещё не создан. Сначала зарегистрируйтесь.', els);
        return;
      }

      if (stored.phone !== phone || stored.pass !== pass) {
        showError('Неверный номер телефона или пароль.', els);
        return;
      }

      // Успешный вход — показываем личный кабинет
      showDashboard(stored, els);
    }
  });

  // При загрузке, если профиль уже сохранён — сразу показываем кабинет
  document.addEventListener('DOMContentLoaded', () => {
    const els = getEls();
    const profile = loadProfile();

    if (profile && els.unauth && els.auth) {
      showDashboard(profile, els);
    }
  });
})();
})();
// Автоинициализация страницы профиля
const profileInitObserver = new MutationObserver(() => {
  const profilePage = document.querySelector('.page--profile');
  if (profilePage) {
    if (typeof initProfilePage === 'function') {
      initProfilePage();
    }
    profileInitObserver.disconnect();
  }
});

profileInitObserver.observe(document.body, {
  childList: true,
  subtree: true
});  
// === УНИВЕРСАЛЬНЫЙ ХЭНДЛЕР ДЛЯ ФОРМЫ ПАРТНЁРА ===
(function () {
  const API_URL = "https://madera-api.vercel.app/api/partner";

  function initPartnerForm() {
    const form = document.querySelector(".partner-form");
    if (!form) {
      // Формы нет на странице — просто выходим
      return;
    }

    // Чтобы не повесить обработчик два раза
    if (form.dataset.partnerHandler === "1") return;
    form.dataset.partnerHandler = "1";

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const name = form.querySelector("[name='partner-name']")?.value.trim();
      const phone = form.querySelector("[name='partner-phone']")?.value.trim();
      const profession = form.querySelector("[name='partner-role']")?.value.trim();
      const profile = form.querySelector("[name='partner-link']")?.value.trim();
      const audience = form.querySelector("[name='partner-audience']")?.value.trim();

      if (!name || !phone) {
        alert("Пожалуйста, заполните имя и телефон.");
        return;
      }

      const payload = { name, phone, profession, profile, audience };

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        let data = {};
        try {
          data = await response.json();
        } catch (e) {
          // если сервер вернул пустой ответ – не падаем
        }

        if (!response.ok || data.ok === false) {
          console.error("Ошибка сервера при отправке заявки:", data);
          alert("Произошла ошибка сервера при отправке заявки. Попробуйте позже.");
          return;
        }

        alert("Заявка на партнёрство отправлена. Менеджер свяжется с вами по указанным контактам.");
        form.reset();
      } catch (error) {
        console.error("Ошибка сети при отправке заявки:", error);
        alert("Не удалось отправить заявку. Проверьте интернет и попробуйте ещё раз.");
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPartnerForm);
  } else {
    initPartnerForm();
  }
})();
(function () {
  const API_URL = "https://madera-api.vercel.app/api/measure";

  function initMeasureForm() {
    const form = document.querySelector(".measure-form");

    if (!form) return;

    if (form.dataset.handler === "1") return;
    form.dataset.handler = "1";

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(form);

      const payload = {
        name: formData.get("name"),
        phone: formData.get("phone"),
        address: formData.get("address"),
        landmark: formData.get("landmark"),
        contactMethod: formData.get("contactMethod"),
        category: formData.get("category"),
        length: formData.get("length"),
        tariff: formData.get("tariff"),
        promo: formData.get("promo"),
        description: formData.get("description"),
      };

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Ошибка отправки");

        alert("Заявка на замер успешно отправлена!");
        form.reset();
      } catch (err) {
        alert("Не удалось отправить заявку. Проверьте интернет.");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", initMeasureForm);
})();
// === АВТО-ОБРАБОТЧИК ФОРМЫ ЗАЯВКИ НА ЗАМЕР ===
(function () {
    const API_URL = "https://madera-api.vercel.app/api/measure";

    function initMeasureForm() {
        // Форма на странице: ищем по атрибуту data-measure-form или по классу
        const form = document.querySelector("[data-measure-form]") 
                  || document.querySelector(".measure-form")         
                  || document.getElementById("measure-form");

        // Форма отсутствует → ничего не делаем
        if (!form) return;

        // Чтобы избежать двойного навешивания
        if (form.dataset.handler === "1") return;
        form.dataset.handler = "1";

        // Ищем кнопку отправки
        const submitBtn = form.querySelector("[data-measure-submit]");
        if (!submitBtn) return;

        // === ЛОГИКА ПРИ НАЖАТИИ КНОПКИ ===
        submitBtn.addEventListener("click", async (event) => {
            event.preventDefault();

            const formData = new FormData(form);

            const payload = {
                name: formData.get("name"),
                phone: formData.get("phone"),
                address: formData.get("address"),
                landmark: formData.get("landmark"),
                contactMethod: formData.get("contactMethod"),
                category: formData.get("category"),
                length: formData.get("length"),
                tariff: formData.get("tariff"),
                promo: formData.get("promo"),
                description: formData.get("description")
            };

            // Проверяем обязательные поля
            if (!payload.name || !payload.phone) {
                alert("Пожалуйста, заполните имя и телефон.");
                return;
            }

            try {
                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) throw new Error("Сервер вернул ошибку");

                alert("Заявка на замер успешно отправлена!");
                form.reset();

            } catch (err) {
                console.error("Ошибка отправки:", err);
                alert("Не удалось отправить заявку. Попробуйте позже.");
            }
        });
    }

    // Инициализация после загрузки DOM
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initMeasureForm);
    } else {
        initMeasureForm();
    }
})();
// === ОБРАБОТЧИК ЗАЯВКИ НА ЗАМЕР ===
(function () {
  const API_URL = "https://madera-api.vercel.app/api/measure";

  function initMeasureForm() {
    // Ищем форму по data-атрибуту или саму <form>
    const form =
      document.querySelector("form[data-measure-form]") ||
      document.querySelector("[data-measure-form] form") ||
      document.querySelector("[data-measure-form]");

    if (!form) return;

    // Чтобы не навесить обработчик дважды
    if (form.dataset.measureHandler === "1") return;
    form.dataset.measureHandler = "1";

    const submitBtn = form.querySelector("[data-measure-submit]");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.classList.add("is-loading");
        }

        // Собираем FormData из формы (включая файл)
        const fd = new FormData(form);

        // Список полей, которые должен видеть бэкенд
        // (если какое-то поле отсутствует на странице — ничего страшного,
        // FormData просто не отправит его)
        const expected = [
          "name",
          "phone",
          "address",
          "landmark",
          "contactMethod",
          "category",
          "length",
          "tariff",
          "promo",
          "description",
          "paymentCheck" // файл
        ];

        // Валидация обязательных полей (минимум — имя и телефон)
        const name = fd.get("name")?.toString().trim();
        const phone = fd.get("phone")?.toString().trim();
        if (!name || !phone) {
          alert("Пожалуйста, заполните имя и телефон.");
          return;
        }

        // Отправляем без ручной установки Content-Type
        const res = await fetch(API_URL, {
          method: "POST",
          body: fd
        });

        if (!res.ok) {
          const msg = await res.text().catch(() => "");
          throw new Error(`Сервер ответил ${res.status}. ${msg}`);
        }

        alert("Заявка на замер успешно отправлена!");
        form.reset();
      } catch (err) {
        console.error(err);
        alert("Не удалось отправить заявку. Проверьте подключение и попробуйте ещё раз.");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove("is-loading");
        }
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMeasureForm);
  } else {
    initMeasureForm();
  }
})();
