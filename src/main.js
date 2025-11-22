// src/main.js

// Находим корневой элемент приложения
const appRoot = document.getElementById('app');

// Временный стартовый экран-приветствие, позже заменим полноценным интерфейсом
appRoot.innerHTML = `
  <div class="app-start">
    <div class="app-start__overlay">
      <div class="app-start__content">
        <div class="app-start__logo">Madera Design</div>
        <div class="app-start__tagline">Партнёр в создании современного интерьера</div>
        <p class="app-start__text">
          Загружается премиальное веб-приложение Madera Design с поддержкой искусственного интеллекта…
        </p>
      </div>
    </div>
  </div>
`;
