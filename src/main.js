// main.js — упрощённая и рабочая версия без импортов

// Демо-данные категорий и идей (замени своими, когда понадобится)
const catalogCategories = [
  { id: "kitchen", name: "Кухни", cover: "./images/kitchen.jpg" },
  { id: "bedroom", name: "Спальни", cover: "./images/bedroom.jpg" },
  { id: "living", name: "Гостиные", cover: "./images/living.jpg" },
];

const catalogItems = [
  {
    id: "k1",
    categoryId: "kitchen",
    title: "Современная кухня в белом цвете",
    image: "./images/kitchen-idea.jpg",
    priceFrom: 9000,
  },
  {
    id: "b1",
    categoryId: "bedroom",
    title: "Минималистичная спальня",
    image: "./images/bedroom-idea.jpg",
    priceFrom: 8000,
  },
];

// Глобальное состояние
let currentPage = "home";
let selectedCatalogCategoryId = null;

function $(selector) {
  return document.querySelector(selector);
}

function formatPrice(num) {
  return num ? num.toLocaleString("ru-RU") + " сом" : "";
}

// Навигация по хэшу
function applyHashRoute() {
  const hash = window.location.hash || "#home";
  if (hash.startsWith("#catalog-")) {
    currentPage = "catalog";
    selectedCatalogCategoryId = hash.replace("#catalog-", "");
  } else {
    currentPage = hash.replace("#", "") || "home";
    selectedCatalogCategoryId = null;
  }
}

function navigateTo(page, categoryId = null) {
  if (page === "catalog" && categoryId) {
    window.location.hash = `#catalog-${categoryId}`;
  } else {
    window.location.hash = `#${page}`;
  }
}

// Основной рендер
function renderApp() {
  const root = $("#app");
  if (!root) return;

  let html = "";

  if (currentPage === "home") {
    html = `
      <section class="page page--home">
        <h1>MADERA DESIGN</h1>
        <p>Партнёр в создании современного интерьера</p>
        <button onclick="navigateTo('catalog')">Перейти в каталог</button>
      </section>
    `;
  }

  else if (currentPage === "catalog") {
    if (!selectedCatalogCategoryId) {
      // Категории
      html = `
        <section class="page page--catalog">
          <h1>Каталог мебели</h1>
          <p>Выберите направление:</p>
          <div class="catalog-grid">
            ${catalogCategories
              .map(
                (c) => `
              <div class="catalog-card" onclick="navigateTo('catalog','${c.id}')">
                <img src="${c.cover}" alt="${c.name}" />
                <div>${c.name}</div>
              </div>`
              )
              .join("")}
          </div>
        </section>
      `;
    } else {
      // Внутри категории
      const cat = catalogCategories.find(
        (c) => c.id === selectedCatalogCategoryId
      );
      const items = catalogItems.filter(
        (i) => i.categoryId === selectedCatalogCategoryId
      );
      html = `
        <section class="page page--catalog">
          <button onclick="navigateTo('catalog')">← Все категории</button>
          <h1>${cat?.name || "Категория"}</h1>
          <p>Выберите идею, которая ближе к вашему вкусу.</p>
          <div class="catalog-items">
            ${
              items.length
                ? items
                    .map(
                      (i) => `
                <div class="catalog-item">
                  <img src="${i.image}" alt="${i.title}" />
                  <h3>${i.title}</h3>
                  ${
                    i.priceFrom
                      ? `<p>от ${formatPrice(i.priceFrom)}</p>`
                      : ""
                  }
                </div>`
                    )
                    .join("")
                : "<p>Пока нет идей в этой категории.</p>"
            }
          </div>
        </section>
      `;
    }
  }

  else if (currentPage === "order") {
    html = `
      <section class="page page--order">
        <h1>Онлайн-заявка</h1>
        <p>Расскажите нам о своём проекте, и мы свяжемся с вами.</p>
      </section>
    `;
  }

  else {
    html = `
      <section class="page">
        <h1>Раздел в разработке</h1>
        <p>Скоро здесь появится новый функционал.</p>
      </section>
    `;
  }

  root.innerHTML = html;
}

// Инициализация
function init() {
  applyHashRoute();
  renderApp();
  window.addEventListener("hashchange", () => {
    applyHashRoute();
    renderApp();
  });
}

document.addEventListener("DOMContentLoaded", init);
