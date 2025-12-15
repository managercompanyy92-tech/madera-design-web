// src/madera-auth-all-in-one.js
import { createClient } from "@supabase/supabase-js";

/* ================================
   SAFE ENV LOADING (ANTI-CRASH)
================================ */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("[FATAL] Supabase ENV not found", {
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
  });

  window.SUPABASE_ERROR = true;
} else {
  console.log("[OK] Supabase ENV loaded");
}

/* ================================
   CREATE CLIENT (SAFE)
================================ */
export const supabase =
  !window.SUPABASE_ERROR
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

/* ================================
   GLOBAL STATUS FOR UI
================================ */
window.maderaSupabaseReady = !!supabase;

/* ================================
   REGISTER
================================ */
window.maderaRegister = async ({ phone, name, password }) => {
  if (!supabase) {
    alert("Supabase не подключён");
    return;
  }

  const password_hash = btoa(password);

  const { error } = await supabase.from("app_users").insert([
    {
      phone,
      name,
      password_hash,
    },
  ]);

  if (error) {
    alert("Ошибка регистрации: " + error.message);
  } else {
    alert("Регистрация успешна");
  }
};

/* ================================
   LOGIN
================================ */
window.maderaLogin = async ({ phone, password }) => {
  if (!supabase) {
    alert("Supabase не подключён");
    return;
  }

  const password_hash = btoa(password);

  const { data, error } = await supabase
    .from("app_users")
    .select("*")
    .eq("phone", phone)
    .eq("password_hash", password_hash)
    .single();

  if (error || !data) {
    alert("Неверный телефон или пароль");
    return;
  }

  localStorage.setItem("madera_user", JSON.stringify(data));
  alert("Вход выполнен");
};

/* ================================
   LOGOUT
================================ */
window.maderaLogout = () => {
  localStorage.removeItem("madera_user");
  location.reload();
};

/* ================================
   AUTO CHECK
================================ */
console.log(
  "[MADERA AUTH STATUS]",
  window.maderaSupabaseReady ? "READY" : "FAILED"
);
