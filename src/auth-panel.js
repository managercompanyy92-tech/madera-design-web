// 🚫 ОТКЛЮЧАЕМ AUTH ПОЛНОСТЬЮ
export function createAuthPanel() {
  return;
}
// src/auth-panel.js
// Панель регистрации/логина для backend https://madera-api.onrender.com

const API_BASE = "https://madera-api.onrender.com/api/auth";
const STORAGE_KEY_USER = "madera_auth_user";
const STORAGE_KEY_TOKEN = "madera_auth_token";

function loadUser() {
  try {
    const rawUser = localStorage.getItem(STORAGE_KEY_USER);
    const rawToken = localStorage.getItem(STORAGE_KEY_TOKEN);
    return {
      user: rawUser ? JSON.parse(rawUser) : null,
      token: rawToken || null,
    };
  } catch (e) {
    console.error("Cannot load auth from localStorage", e);
    return { user: null, token: null };
  }
}

function saveUser(user, token) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }

    if (token) {
      localStorage.setItem(STORAGE_KEY_TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
    }
  } catch (e) {
    console.error("Cannot save auth to localStorage", e);
  }
}

async function apiRequest(path, method = "GET", body = null, token = null) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    data = { ok: false, error: "Некорректный ответ сервера", raw: text };
  }

  if (!res.ok) {
    throw new Error(data.error || data.message || `HTTP ${res.status}`);
  }

  return data;
}

// ====== РЕНДЕР ПАНЕЛИ ======

function createPanelRoot() {
  return; // ❌ отключили полностью
  const root = document.createElement("div");
  root.id = "madera-auth-panel";
  root.style.position = "fixed";
  root.style.right = "16px";
  root.style.bottom = "72px";
  root.style.width = "360px";
  root.style.maxHeight = "80vh";
  root.style.background = "#111827";
  root.style.color = "#F9FAFB";
  root.style.borderRadius = "12px";
  root.style.boxShadow = "0 20px 40px rgba(0,0,0,0.6)";
  root.style.padding = "16px";
  root.style.fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  root.style.fontSize = "14px";
  root.style.zIndex = "999999";
  root.style.display = "none"; // ВАЖНО: по умолчанию спрятана

  root.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <div style="font-weight:600; font-size:14px;">Auth Debug Panel</div>
      <button type="button" data-auth-role="close"
        style="border:none; background:transparent; color:#9CA3AF; cursor:pointer; font-size:18px; line-height:1;">
        ×
      </button>
    </div>

    <div style="display:flex; gap:8px; margin-bottom:12px;">
      <button type="button" data-auth-tab="register"
        style="flex:1; padding:6px 8px; border-radius:8px; border:none; cursor:pointer;
               background:#1F2937; color:#E5E7EB; font-size:13px; font-weight:500;">
        Регистрация
      </button>
      <button type="button" data-auth-tab="login"
        style="flex:1; padding:6px 8px; border-radius:8px; border:none; cursor:pointer;
               background:#111827; color:#9CA3AF; font-size:13px;">
        Вход
      </button>
    </div>

    <div data-auth-view="register">
      <form data-auth-form="register" style="display:flex; flex-direction:column; gap:8px;">
        <input name="name" placeholder="Имя" autocomplete="name"
          style="padding:6px 8px; border-radius:8px; border:1px solid #374151; background:#111827; color:#F9FAFB;">
        <input name="phone" placeholder="+998901112233" autocomplete="tel"
          style="padding:6px 8px; border-radius:8px; border:1px solid #374151; background:#111827; color:#F9FAFB;">
        <input name="password" type="password" placeholder="Пароль"
          style="padding:6px 8px; border-radius:8px; border:1px solid #374151; background:#111827; color:#F9FAFB;">
        <button type="submit"
          style="margin-top:4px; padding:8px; border:none; border-radius:8px;
                 background:#10B981; color:#022c22; font-weight:600; cursor:pointer;">
          Зарегистрировать
        </button>
      </form>
    </div>

    <div data-auth-view="login" style="display:none;">
      <form data-auth-form="login" style="display:flex; flex-direction:column; gap:8px;">
        <input name="phone" placeholder="+998901112233" autocomplete="tel"
          style="padding:6px 8px; border-radius:8px; border:1px solid #374151; background:#111827; color:#F9FAFB;">
        <input name="password" type="password" placeholder="Пароль"
          style="padding:6px 8px; border-radius:8px; border:1px solid #374151; background:#111827; color:#F9FAFB;">
        <button type="submit"
          style="margin-top:4px; padding:8px; border:none; border-radius:8px;
                 background:#3B82F6; color:#EFF6FF; font-weight:600; cursor:pointer;">
          Войти
        </button>
      </form>
    </div>

    <div style="margin-top:10px; padding:8px; border-radius:8px; background:#030712;">
      <div style="font-size:11px; text-transform:uppercase; letter-spacing:0.05em; color:#6B7280; margin-bottom:4px;">
        Текущий пользователь
      </div>
      <pre data-auth-role="userInfo" style="white-space:pre-wrap; word-break:break-all; font-size:11px; margin:0; color:#D1D5DB;">
нет данных
      </pre>
    </div>

    <div style="margin-top:8px; display:flex; gap:8px;">
      <button type="button" data-auth-role="me"
        style="flex:1; padding:6px 8px; border-radius:8px; border:1px solid #374151;
               background:#111827; color:#E5E7EB; font-size:12px; cursor:pointer;">
        Проверить /me
      </button>
      <button type="button" data-auth-role="logout"
        style="flex:1; padding:6px 8px; border-radius:8px; border:1px solid #4B5563;
               background:#111827; color:#FCA5A5; font-size:12px; cursor:pointer;">
        Выйти
      </button>
    </div>

    <div style="margin-top:8px;">
      <div style="font-size:11px; text-transform:uppercase; letter-spacing:0.05em; color:#6B7280; margin-bottom:4px;">
        Логи
      </div>
      <pre data-auth-role="log"
        style="white-space:pre-wrap; word-break:break-all; font-size:11px; margin:0;
               max-height:120px; overflow:auto; background:#030712; padding:6px; border-radius:6px; color:#D1D5DB;">
панель загружена
      </pre>
    </div>
  `;

  document.body.appendChild(root);
  return root;
}

function createFloatingButton() {
  const btn = document.createElement("button");
  btn.id = "madera-auth-toggle-btn";
  btn.type = "button";
  btn.textContent = "Auth";
  btn.style.position = "fixed";
  btn.style.right = "16px";
  btn.style.bottom = "16px";
  btn.style.width = "44px";
  btn.style.height = "44px";
  btn.style.borderRadius = "999px";
  btn.style.border = "none";
  btn.style.background = "#111827";
  btn.style.color = "#F9FAFB";
  btn.style.boxShadow = "0 10px 25px rgba(0,0,0,0.6)";
  btn.style.cursor = "pointer";
  btn.style.fontSize = "12px";
  btn.style.fontWeight = "600";
  btn.style.zIndex = "999998";
  btn.style.opacity = "0.8";

  btn.addEventListener("mouseenter", () => {
    btn.style.opacity = "1";
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.opacity = "0.8";
  });

  document.body.appendChild(btn);
  return btn;
}

// ====== ЛОГИКА ПАНЕЛИ ======

function initAuthPanel() {
  const { user, token } = loadUser();
  const root = createPanelRoot();
  const toggleBtn = createFloatingButton();

  const views = {
    register: root.querySelector('[data-auth-view="register"]'),
    login: root.querySelector('[data-auth-view="login"]'),
  };

  const tabs = {
    register: root.querySelector('[data-auth-tab="register"]'),
    login: root.querySelector('[data-auth-tab="login"]'),
  };

  const forms = {
    register: root.querySelector('[data-auth-form="register"]'),
    login: root.querySelector('[data-auth-form="login"]'),
  };

  const elUserInfo = root.querySelector('[data-auth-role="userInfo"]');
  const elLog = root.querySelector('[data-auth-role="log"]');
  const btnClose = root.querySelector('[data-auth-role="close"]');
  const btnMe = root.querySelector('[data-auth-role="me"]');
  const btnLogout = root.querySelector('[data-auth-role="logout"]');

  let currentUser = user;
  let currentToken = token;

  function log(message) {
    const now = new Date().toISOString().substring(11, 19);
    elLog.textContent = `[${now}] ${message}\n` + (elLog.textContent || "");
  }

  function renderUser() {
    if (!currentUser && !currentToken) {
      elUserInfo.textContent = "нет данных";
      return;
    }
    elUserInfo.textContent = JSON.stringify(
      {
        user: currentUser || null,
        token: currentToken || null,
      },
      null,
      2
    );
  }

  function setActiveTab(tab) {
    if (!["register", "login"].includes(tab)) return;

    Object.keys(views).forEach((key) => {
      views[key].style.display = key === tab ? "block" : "none";
    });

    Object.keys(tabs).forEach((key) => {
      if (key === tab) {
        tabs[key].style.background = "#1F2937";
        tabs[key].style.color = "#E5E7EB";
      } else {
        tabs[key].style.background = "#111827";
        tabs[key].style.color = "#9CA3AF";
      }
    });
  }

  async function handleRegister(e) {
    e.preventDefault();
    const form = forms.register;
    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const password = form.password.value;

    if (!name || !phone || !password) {
      alert("Заполните имя, телефон и пароль");
      return;
    }

    try {
      log("Регистрация...");
      const data = await apiRequest(
        "/register",
        "POST",
        { name, phone, password },
        null
      );
      log(`Регистрация OK, userId=${data.userId || "?"}`);

      currentUser = { name, phone, userId: data.userId || null };
      currentToken = null;
      saveUser(currentUser, currentToken);
      renderUser();

      alert("Регистрация прошла успешно");
    } catch (err) {
      console.error(err);
      log("Ошибка регистрации: " + err.message);
      alert(err.message || "Ошибка регистрации");
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    const form = forms.login;
    const phone = form.phone.value.trim();
    const password = form.password.value;

    if (!phone || !password) {
      alert("Заполните телефон и пароль");
      return;
    }

    try {
      log("Логин...");
      const data = await apiRequest(
        "/login",
        "POST",
        { phone, password },
        null
      );
      log("Логин OK: получен токен");

      currentToken = data.token;
      if (!currentUser) {
        currentUser = { phone };
      }
      saveUser(currentUser, currentToken);
      renderUser();

      alert("Вход выполнен успешно");
    } catch (err) {
      console.error(err);
      log("Ошибка логина: " + err.message);
      alert(err.message || "Ошибка входа");
    }
  }

  async function handleMe() {
    if (!currentToken) {
      alert("Нет токена. Сначала войдите.");
      return;
    }

    try {
      log("Запрос /me...");
      const data = await apiRequest("/me", "GET", null, currentToken);
      log("Ответ /me: " + JSON.stringify(data));
      if (data.user) {
        currentUser = { ...(currentUser || {}), ...data.user };
        saveUser(currentUser, currentToken);
        renderUser();
      }
    } catch (err) {
      console.error(err);
      log("Ошибка /me: " + err.message);
      alert(err.message || "Ошибка /me");
    }
  }

  function handleLogout() {
    currentUser = null;
    currentToken = null;
    saveUser(null, null);
    renderUser();
    log("Логаут, данные очищены");
    alert("Вы вышли из аккаунта");
  }

  function openPanel() {
    root.style.display = "block";
  }

  function closePanel() {
    root.style.display = "none";
  }

  // События
  tabs.register.addEventListener("click", () => setActiveTab("register"));
  tabs.login.addEventListener("click", () => setActiveTab("login"));

  forms.register.addEventListener("submit", handleRegister);
  forms.login.addEventListener("submit", handleLogin);

  btnClose.addEventListener("click", closePanel);
  btnMe.addEventListener("click", handleMe);
  btnLogout.addEventListener("click", handleLogout);

  toggleBtn.addEventListener("click", () => {
    if (root.style.display === "none") {
      openPanel();
    } else {
      closePanel();
    }
  });

  // Глобальная функция для ссылки "Админ"
  window.openAuthDebugPanel = function () {
    openPanel();
  };

  renderUser();
  setActiveTab("register");
  log("Панель инициализирована");
}

// Ждём, пока загрузится DOM
document.addEventListener("DOMContentLoaded", () => {
  try {
    initAuthPanel();
  } catch (e) {
    console.error("Ошибка инициализации auth-panel", e);
  }
});
