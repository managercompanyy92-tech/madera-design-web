// src/auth-panel.js
// ЕДИНЫЙ ФАЙЛ ДЛЯ РЕГИСТРАЦИИ/ЛОГИНА ЧЕРЕЗ ВАШ API

const MADERA_API_BASE = 'https://madera-api.onrender.com/api/auth';

// ====== ХРАНЕНИЕ JWT-ТОКЕНА В localStorage ======

const TOKEN_KEY = 'madera_jwt_token';

function saveToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    console.error('Не удалось сохранить токен', e);
  }
}

function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (e) {
    console.error('Не удалось прочитать токен', e);
    return null;
  }
}

function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    console.error('Не удалось удалить токен', e);
  }
}

// ====== УНИВЕРСАЛЬНЫЙ ЗАПРОС К API ======

async function apiRequest(path, method = 'GET', body = null) {
  const url = `${MADERA_API_BASE}${path}`;

  const headers = {
    'Accept': 'application/json'
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let fetchOptions = { method, headers };

  if (body !== null) {
    headers['Content-Type'] = 'application/json';
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, fetchOptions);

  let data = null;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  if (!response.ok || (data && data.ok === false)) {
    const msg =
      (data && (data.error || data.message)) ||
      `Ошибка HTTP ${response.status}`;
    throw new Error(msg);
  }

  return data;
}

// ====== ФУНКЦИИ ДЛЯ AUTH API ======

async function apiRegister(name, phone, password) {
  return apiRequest('/register', 'POST', { name, phone, password });
}

async function apiLogin(phone, password) {
  return apiRequest('/login', 'POST', { phone, password });
}

async function apiMe() {
  return apiRequest('/me', 'GET');
}

// ====== UI-ПАНЕЛЬ ДЛЯ ТЕСТА АВТОРИЗАЦИИ ======

function createAuthPanel() {
  // Если панель уже есть — не создаём повторно
  if (document.getElementById('madera-auth-panel')) return;

  const panel = document.createElement('div');
  panel.id = 'madera-auth-panel';

  // Простые стили прямо в JS
  panel.style.position = 'fixed';
  panel.style.bottom = '16px';
  panel.style.right = '16px';
  panel.style.width = '320px';
  panel.style.maxHeight = '80vh';
  panel.style.overflow = 'auto';
  panel.style.background = 'rgba(0,0,0,0.9)';
  panel.style.color = '#fff';
  panel.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
  panel.style.fontSize = '13px';
  panel.style.padding = '12px';
  panel.style.borderRadius = '8px';
  panel.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';
  panel.style.zIndex = '9999';

  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
      <strong style="font-size:14px;">Auth Debug Panel</strong>
      <button id="madera-auth-toggle" style="
        background:none;
        border:none;
        color:#aaa;
        cursor:pointer;
        font-size:16px;
      ">−</button>
    </div>

    <div id="madera-auth-body">
      <div style="margin-bottom:8px;">
        <div style="margin-bottom:4px;">Имя</div>
        <input id="madera-auth-name" type="text" placeholder="Test User" style="
          width:100%;
          padding:4px 6px;
          border-radius:4px;
          border:1px solid #444;
          background:#111;
          color:#fff;
        ">
      </div>

      <div style="margin-bottom:8px;">
        <div style="margin-bottom:4px;">Телефон</div>
        <input id="madera-auth-phone" type="text" placeholder="+998901112233" style="
          width:100%;
          padding:4px 6px;
          border-radius:4px;
          border:1px solid #444;
          background:#111;
          color:#fff;
        ">
      </div>

      <div style="margin-bottom:8px;">
        <div style="margin-bottom:4px;">Пароль</div>
        <input id="madera-auth-password" type="password" placeholder="12345678" style="
          width:100%;
          padding:4px 6px;
          border-radius:4px;
          border:1px solid #444;
          background:#111;
          color:#fff;
        ">
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;">
        <button id="madera-auth-register" style="
          flex:1;
          padding:6px;
          border-radius:4px;
          border:none;
          background:#2563eb;
          color:#fff;
          cursor:pointer;
        ">Регистрация</button>

        <button id="madera-auth-login" style="
          flex:1;
          padding:6px;
          border-radius:4px;
          border:none;
          background:#16a34a;
          color:#fff;
          cursor:pointer;
        ">Логин</button>
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;">
        <button id="madera-auth-me" style="
          flex:1;
          padding:6px;
          border-radius:4px;
          border:none;
          background:#4b5563;
          color:#fff;
          cursor:pointer;
        ">Профиль /me</button>

        <button id="madera-auth-logout" style="
          flex:1;
          padding:6px;
          border-radius:4px;
          border:none;
          background:#b91c1c;
          color:#fff;
          cursor:pointer;
        ">Выход</button>
      </div>

      <div style="font-size:11px;margin-bottom:4px;color:#9ca3af;">
        Статус:
      </div>
      <pre id="madera-auth-status" style="
        background:#020617;
        border-radius:4px;
        padding:6px;
        white-space:pre-wrap;
        word-break:break-word;
        max-height:180px;
        overflow:auto;
        border:1px solid #1f2937;
      "></pre>
    </div>
  `;

  document.body.appendChild(panel);

  // Ссылки на элементы
  const toggleBtn = document.getElementById('madera-auth-toggle');
  const bodyEl = document.getElementById('madera-auth-body');
  const nameInput = document.getElementById('madera-auth-name');
  const phoneInput = document.getElementById('madera-auth-phone');
  const passInput = document.getElementById('madera-auth-password');
  const registerBtn = document.getElementById('madera-auth-register');
  const loginBtn = document.getElementById('madera-auth-login');
  const meBtn = document.getElementById('madera-auth-me');
  const logoutBtn = document.getElementById('madera-auth-logout');
  const statusPre = document.getElementById('madera-auth-status');

  function setStatus(objOrText) {
    if (typeof objOrText === 'string') {
      statusPre.textContent = objOrText;
    } else {
      statusPre.textContent = JSON.stringify(objOrText, null, 2);
    }
  }

  // Сворачивание панели
  let collapsed = false;
  toggleBtn.addEventListener('click', () => {
    collapsed = !collapsed;
    if (collapsed) {
      bodyEl.style.display = 'none';
      toggleBtn.textContent = '+';
    } else {
      bodyEl.style.display = 'block';
      toggleBtn.textContent = '−';
    }
  });

  // Если токен уже есть — показать, что пользователь «как бы залогинен»
  if (getToken()) {
    setStatus('Токен найден в localStorage. Нажмите "Профиль /me", чтобы получить данные.');
  } else {
    setStatus('Токен не найден. Сначала зарегистрируйтесь или залогиньтесь.');
  }

  // Обработчики кнопок
  registerBtn.addEventListener('click', async () => {
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const password = passInput.value;

    if (!name || !phone || !password) {
      setStatus('Заполните имя, телефон и пароль для регистрации.');
      return;
    }

    setStatus('Отправляем запрос регистрации...');
    try {
      const data = await apiRegister(name, phone, password);
      setStatus(data);
    } catch (e) {
      setStatus('Ошибка регистрации: ' + e.message);
    }
  });

  loginBtn.addEventListener('click', async () => {
    const phone = phoneInput.value.trim();
    const password = passInput.value;

    if (!phone || !password) {
      setStatus('Заполните телефон и пароль для логина.');
      return;
    }

    setStatus('Отправляем запрос логина...');
    try {
      const data = await apiLogin(phone, password);
      if (data && data.token) {
        saveToken(data.token);
        setStatus({
          message: 'Логин успешен. Токен сохранён в localStorage.',
          response: data
        });
      } else {
        setStatus(data || 'Логин без токена? Проверьте API.');
      }
    } catch (e) {
      setStatus('Ошибка логина: ' + e.message);
    }
  });

  meBtn.addEventListener('click', async () => {
    if (!getToken()) {
      setStatus('Токена нет. Сначала залогиньтесь.');
      return;
    }
    setStatus('Запрашиваем /me...');
    try {
      const data = await apiMe();
      setStatus(data);
    } catch (e) {
      setStatus('Ошибка /me: ' + e.message);
    }
  });

  logoutBtn.addEventListener('click', () => {
    clearToken();
    setStatus('Токен удалён. Пользователь считается разлогиненным.');
  });

  // Делаем панель доступной из консоли для разработчика
  window.MaderaAuth = {
    apiRegister,
    apiLogin,
    apiMe,
    saveToken,
    getToken,
    clearToken
  };
  console.log('%cMaderaAuth доступен в window.MaderaAuth', 'color: #22c55e;');
}

// Создаём панель после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
  createAuthPanel();
});
