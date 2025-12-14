/* ============================================================================
   MADERA AUTH — ALL IN ONE (Supabase + стабильное имя + корректный logout)
   Требует env в Vercel:
     VITE_SUPABASE_URL
     VITE_SUPABASE_ANON_KEY

   Требует таблицу в Supabase: public.app_users (ты уже создал).

   Требования к HTML (на странице "Профиль") — поставь data-атрибуты:
     - где приветствие: <span data-user-name>...</span>
     - кнопка выхода: <button data-logout>Выйти</button>

   (Опционально, если хочешь чтобы этот файл сам управлял формой вход/регистрации)
     - форма регистрации: <form data-auth-register>...</form>
       поля: <input data-auth-name>, <input data-auth-phone>, <input data-auth-pass>
     - форма входа: <form data-auth-login>...</form>
       поля: <input data-auth-phone>, <input data-auth-pass>
     - переключатели вкладок/кнопки: <button data-auth-switch="login|register">

   Если у тебя формы уже реализованы иначе — можно оставить только data-user-name и
   data-logout; тогда этот файл будет отвечать за имя+logout (главные проблемы).
============================================================================ */

import { createClient } from "@supabase/supabase-js";

/* ------------------------- CONFIG ------------------------- */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.error(
    "[MaderaAuth] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in env"
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

/* ------------------------- STORAGE KEYS ------------------------- */
const LS = {
  name: "madera_name",
  phone: "madera_phone",
  token: "madera_token", // наш внутренний session-token (не обязателен)
};

/* ------------------------- HELPERS ------------------------- */
function normalizePhone(raw) {
  if (!raw) return "";
  let s = String(raw).trim();
  // оставляем только цифры и +
  s = s.replace(/[^\d+]/g, "");

  // если без +, но начинается с 992 — добавим +
  if (!s.startsWith("+") && s.startsWith("992")) s = "+" + s;
  // если вообще без кода — не гадаем, оставим как есть
  return s;
}

function setNameUI(name) {
  const el = document.querySelector("[data-user-name]");
  if (!el) return;
  el.textContent = name && String(name).trim() ? String(name).trim() : "клиент";
}

function toast(msg, type = "info") {
  // Если у тебя есть свой UI-алерт — замени здесь.
  console[type === "error" ? "error" : "log"]("[MaderaAuth]", msg);
}

function hardClearClientState() {
  localStorage.removeItem(LS.name);
  localStorage.removeItem(LS.phone);
  localStorage.removeItem(LS.token);
  sessionStorage.clear();

  // На всякий случай чистим возможные ключи supabase в localStorage
  // (ключ может отличаться, поэтому удаляем все, где встречается "supabase")
  Object.keys(localStorage).forEach((k) => {
    if (k.toLowerCase().includes("supabase")) localStorage.removeItem(k);
  });
}

/* ------------------------- CRYPTO (hash password in browser) ------------------------- */
// SHA-256 (не лучший вариант по безопасности vs bcrypt на сервере, но лучше, чем plain)
// Для продакшена лучше вынести регистрацию/логин в серверные функции.
// Здесь делаем максимально практично для твоего текущего стека.
async function sha256(text) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/* ------------------------- DB LAYER (app_users) ------------------------- */
async function dbGetUserByPhone(phone) {
  const { data, error } = await supabase
    .from("app_users")
    .select("id, phone, name, password_hash, created_at")
    .eq("phone", phone)
    .maybeSingle();

  if (error) throw error;
  return data || null;
}

async function dbCreateUser({ phone, name, password_hash }) {
  const { data, error } = await supabase
    .from("app_users")
    .insert([{ phone, name, password_hash }])
    .select("id, phone, name, created_at")
    .single();

  if (error) throw error;
  return data;
}

/* ------------------------- SESSION (минимальная) ------------------------- */
// Вариант 1 (правильный в долгую): Supabase Auth.
// Вариант 2 (быстро): свой session-token в localStorage.
// Так как ты хочешь “в других браузерах тоже входил по логину/паролю” —
// это решается БД (app_users). А сессия конкретного устройства — localStorage.
// Поэтому после логина мы сохраняем "madera_token" и имя/телефон локально.

function makeRandomToken() {
  // простой токен
  return (
    "md_" +
    Math.random().toString(36).slice(2) +
    "_" +
    Date.now().toString(36)
  );
}

function setLoggedIn({ phone, name }) {
  localStorage.setItem(LS.phone, phone);
  localStorage.setItem(LS.name, name);
  localStorage.setItem(LS.token, makeRandomToken());
  setNameUI(name);
}

function isLoggedIn() {
  const token = localStorage.getItem(LS.token);
  const phone = localStorage.getItem(LS.phone);
  return Boolean(token && phone);
}

function getCachedUser() {
  return {
    phone: localStorage.getItem(LS.phone) || "",
    name: localStorage.getItem(LS.name) || "",
  };
}

/* ------------------------- CORE: HYDRATE NAME (fix "клиент") ------------------------- */
async function hydrateProfileName() {
  const nameEl = document.querySelector("[data-user-name]");
  if (!nameEl) return; // на этой странице нет приветствия — ничего не делаем

  // 1) мгновенно ставим то, что есть в кеше, чтобы не было "клиент" моргания
  const cached = getCachedUser();
  if (cached.name) setNameUI(cached.name);
  else setNameUI("клиент");

  // 2) если мы “залогинены”, пробуем подтянуть имя из БД (истина)
  if (!isLoggedIn()) return;

  const phone = normalizePhone(cached.phone);
  if (!phone) return;

  try {
    const dbUser = await dbGetUserByPhone(phone);
    if (dbUser?.name) {
      localStorage.setItem(LS.name, dbUser.name);
      setNameUI(dbUser.name);
    }
  } catch (e) {
    toast("Не удалось обновить имя из базы: " + (e?.message || e), "error");
  }
}

/* ------------------------- CORE: LOGOUT (fix "не выходит") ------------------------- */
function bindLogoutButton() {
  const btn = document.querySelector("[data-logout]");
  if (!btn) return;

  btn.addEventListener("click", async (e) => {
    e.preventDefault();

    // защита от многократных нажатий
    if (btn.dataset.busy === "1") return;
    btn.dataset.busy = "1";
    btn.disabled = true;

    try {
      // если ты параллельно используешь Supabase Auth где-то в проекте —
      // это гарантированно убьёт supabase-сессию
      try {
        await supabase.auth.signOut();
      } catch (_) {
        // если auth не используется — игнор
      }

      // чистим всё локально
      hardClearClientState();

      // редирект на профиль (там должен появиться экран входа)
      // если у тебя другой путь — поменяй "/profile"
      window.location.href = "/profile";
    } finally {
      // на случай, если редирект не случился мгновенно
      btn.dataset.busy = "0";
      btn.disabled = false;
    }
  });
}

/* ------------------------- OPTIONAL: REGISTER/LOGIN FORMS ------------------------- */
async function handleRegisterSubmit(e) {
  e.preventDefault();

  const name = document.querySelector("[data-auth-name]")?.value?.trim() || "";
  const phoneRaw =
    document.querySelector("[data-auth-phone]")?.value?.trim() || "";
  const pass =
    document.querySelector("[data-auth-pass]")?.value?.trim() || "";

  const phone = normalizePhone(phoneRaw);

  if (!name || !phone || !pass) {
    toast("Заполни имя, телефон и пароль.", "error");
    return;
  }

  try {
    const existing = await dbGetUserByPhone(phone);
    if (existing) {
      toast("Аккаунт уже существует. Перейди во вкладку «Вход».", "error");
      return;
    }

    const password_hash = await sha256(pass);
    const created = await dbCreateUser({ phone, name, password_hash });

    // логиним в этом браузере
    setLoggedIn({ phone: created.phone, name: created.name });

    toast("Регистрация успешна. Вы вошли в аккаунт.");
    // здесь можно скрыть форму/показать кабинет, если у тебя есть логика
  } catch (e2) {
    toast("Ошибка регистрации: " + (e2?.message || e2), "error");
  }
}

async function handleLoginSubmit(e) {
  e.preventDefault();

  const phoneRaw =
    document.querySelector("[data-auth-phone]")?.value?.trim() || "";
  const pass =
    document.querySelector("[data-auth-pass]")?.value?.trim() || "";

  const phone = normalizePhone(phoneRaw);
  if (!phone || !pass) {
    toast("Введи телефон и пароль.", "error");
    return;
  }

  try {
    const user = await dbGetUserByPhone(phone);
    if (!user) {
      toast("Аккаунт ещё не создан. Сначала зарегистрируйтесь.", "error");
      return;
    }

    const password_hash = await sha256(pass);
    if (user.password_hash !== password_hash) {
      toast("Неверный пароль.", "error");
      return;
    }

    setLoggedIn({ phone: user.phone, name: user.name });
    toast("Вход выполнен.");

    // если нужно, можешь обновить UI кабинета:
    setNameUI(user.name);
  } catch (e2) {
    toast("Ошибка входа: " + (e2?.message || e2), "error");
  }
}

function bindAuthFormsIfExist() {
  const regForm = document.querySelector("form[data-auth-register]");
  const loginForm = document.querySelector("form[data-auth-login]");

  if (regForm) regForm.addEventListener("submit", handleRegisterSubmit);
  if (loginForm) loginForm.addEventListener("submit", handleLoginSubmit);
}

/* ------------------------- INIT ------------------------- */
document.addEventListener("DOMContentLoaded", async () => {
  // 1) стабильно подтягиваем имя (исправляет "Привет, клиент")
  await hydrateProfileName();

  // 2) корректный logout (исправляет "выйти" + "после refresh заходит обратно")
  bindLogoutButton();

  // 3) если на странице есть формы регистрации/входа — подключим
  bindAuthFormsIfExist();
});
