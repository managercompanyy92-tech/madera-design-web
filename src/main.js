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

/* ----------------------------- КАТАЛОГ МЕБЕЛИ ----------------------------- */

function renderCatalog() {
  // ПЕРВЫЙ УРОВЕНЬ: список категорий + квиз
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
              <div class="catalog-category-card__discount">
                <div class="catalog-category-card__discount-badge">
                  СКИДКИ И ПАРТНЁРЫ
                </div>
                <div class="catalog-category-card__discount-text">
                  −5% при заказе напрямую • −10% по промокоду партнёра
                </div>
              </div>
            </div>
          </div>
        </button>
      `
      )
      .join("");

    return `
      <section class="page page--catalog">
        <h1 class="page__title">Каталог мебели</h1>
        <p class="page__subtitle">
          Выберите направление, в котором планируете начинать интерьер. Дальше покажем идеи,
          а затем — ориентировочный расчёт стоимости под вашу квартиру.
        </p>

        <!-- Мини-квиз: с чего начинаем -->
        <div class="catalog-quiz">
          <div class="catalog-quiz__block">
            <div class="catalog-quiz__label">1. Что планируете в первую очередь?</div>
            <div class="catalog-quiz__options">
              <button class="catalog-quiz__option" data-quiz-type="kitchens">Кухня</button>
              <button class="catalog-quiz__option" data-quiz-type="wardrobes">Гардеробная</button>
              <button class="catalog-quiz__option" data-quiz-type="bedrooms">Спальня</button>
              <button class="catalog-quiz__option" data-quiz-type="kids">Детская</button>
              <button class="catalog-quiz__option" data-quiz-type="hallways">Прихожая</button>
              <button class="catalog-quiz__option" data-quiz-type="livingrooms">Гостиная</button>
            </div>
          </div>

          <div class="catalog-quiz__block">
            <div class="catalog-quiz__label">2. Цель проекта</div>
            <div class="catalog-quiz__options">
              <button class="catalog-quiz__option" data-quiz-goal="self">
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
            <div class="catalog-quiz__label">3. Примерный бюджет на мебель</div>
            <div class="catalog-quiz__options">
              <button class="catalog-quiz__option" data-quiz-budget="low">
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
              Даже если вы пока «просто смотрите идеи», квиз помогает подобрать более точные сценарии
              под вашу ситуацию.
            </div>
            <div class="catalog-quiz__actions">
              <button class="btn btn--ghost" data-route="order">
                Перейти к быстрому расчёту
              </button>
              <button class="btn btn--outline" data-action="open-chat">
                Спросить AI-дизайнера, с чего начать
              </button>
            </div>
          </div>
        </div>

        <!-- Маркетинговый блок про скидки и партнёров -->
        <div class="catalog-discount-info">
          <div class="catalog-discount-info__title">Скидки и партнёры</div>
          <ul class="catalog-discount-info__list">
            <li>5% скидка — если оформляете заказ напрямую через компанию.</li>
            <li>10% скидка — если укажете промокод партнёра.</li>
            <li>Партнёры получают 5% от суммы каждого приведённого заказа.</li>
          </ul>
          <div class="catalog-discount-info__note">
            Мы принимаем заказы от 3 погонных метров и выше.
          </div>
        </div>

        <div class="catalog-categories-grid">
          ${cards}
        </div>
      </section>
    `;
  }

  // ВТОРОЙ УРОВЕНЬ: идеи внутри выбранной категории
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

      <h1 class="page__title">${
        category ? category.name || category.title : "Категория"
      }</h1>
      <p class="page__subtitle">
        Здесь собраны идеи и визуализации для категории «${
          category ? category.name || category.title : ""
        }». На следующем шаге адаптируем их под вашу планировку и посчитаем стоимость.
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

/* -------------------------- ЛИЧНЫЙ КАБИНЕТ -------------------------- */

function renderProfile() {
  return `
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
          <div class="order-form" style="margin-top: 0;">
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
          <div class="order-form">
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
        <div class="order-info">
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
    <section class="page page--more">
      <h1 class="page__title">Информация о сервисе Madera Design</h1>
      <p class="page__subtitle">
        Ответы на частые вопросы: из чего делаем мебель, какие реальные сроки, как формируется цена,
        какие условия гарантии и как работает сервис после монтажа.
      </p>

      <section class="highlights">
        <article class="highlights__item">
          <h2 class="highlights__title">Материалы и фурнитура</h2>
          <p class="highlights__text">
            Корпуса — из качественного ЛДСП российских производителей. Фасады — ЛДСП или турецкий МДФ
            в зависимости от тарифа. Фурнитура — Blum или проверенные аналоги (направляющие, петли,
            механизмы плавного закрывания).
          </p>
        </article>

        <article class="highlights__item">
          <h2 class="highlights__title">Сроки и этапы</h2>
          <p class="highlights__text">
            Типовой проект: замер 1–3 дня, дизайн и утверждение — 3–7 дней,
            производство — 10–20 дней, монтаж — 1–3 дня.
            Конкретные сроки зависят от сложности проекта и загруженности производства.
          </p>
        </article>

        <article class="highlights__item">
          <h2 class="highlights__title">Цена и прозрачность</h2>
          <p class="highlights__text">
            Базовые тарифы: около 4000 сомони за погонный метр для ЛДСП фасадов (Стандарт)
            и 5000 сомони для МДФ фасадов (Премиум). Минимальный объём — 3 погонных метра.
            Все доплаты (техника, сложные формы) проговариваются заранее.
          </p>
        </article>
      </section>

      <div class="order-layout" style="margin-top: 18px;">
        <div>
          <!-- Оплата и рассрочка -->
          <div class="order-info__card">
            <div class="order-info__badge">Оплата и рассрочка</div>
            <h2 class="order-info__title">Как можно оплатить заказ</h2>
            <ul class="order-info__list">
              <li>Частичная предоплата для запуска в производство.</li>
              <li>Окончательный расчёт после монтажа и приёмки мебели.</li>
              <li>Возможность оплаты по безналичному расчёту.</li>
              <li>Возможна рассрочка и кредит через партнёрские организации (по согласованию).</li>
            </ul>
          </div>

          <!-- Гарантия и сервис -->
          <div class="order-info__card">
            <div class="order-info__badge">Гарантия и сервис</div>
            <h2 class="order-info__title">Что мы гарантируем</h2>
            <ul class="order-info__list">
              <li>Гарантия на корпус и фасады — по договору (при нормальной эксплуатации).</li>
              <li>Сервисная настройка фурнитуры в течение первого года.</li>
              <li>Возможность доукомплектовать или модифицировать мебель со временем.</li>
            </ul>
          </div>
        </div>

        <div class="order-info">
          <!-- О компании -->
          <div class="order-info__card">
            <div class="order-info__badge">О компании</div>
            <h2 class="order-info__title">Madera Design — мебель нового формата</h2>
            <ul class="order-info__list">
              <li>Фокус на современных интерьерах и функциональных решениях.</li>
              <li>Собственное производство и команда монтажников в Душанбе.</li>
              <li>Использование цифровых инструментов: AI-ассистент, калькулятор, статус заказа онлайн.</li>
            </ul>
          </div>

          <!-- Частые вопросы -->
          <div class="order-info__next">
            <div class="order-info__next-text">
              <strong>Частые вопросы (FAQ):</strong><br/><br/>
              <strong>— Можно ли заказать меньше 3 пог. метров?</strong><br/>
              Обычно нет, так как это нерентабельно. Но можно обсудить комбинированный проект (например, кухня + шкаф).<br/><br/>
              <strong>— Делаете ли вы выезд на замер?</strong><br/>
              Да, после предварительного расчёта и согласия клиента.<br/><br/>
              <strong>— Можно ли принести свой дизайн?</strong><br/>
              Да, мы можем адаптировать ваш дизайн под реальные материалы и фурнитуру Madera Design.
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
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
}

initApp();
