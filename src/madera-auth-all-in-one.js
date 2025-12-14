import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// === РЕГИСТРАЦИЯ ===
window.maderaRegister = async function (phone, name, password) {
  const password_hash = btoa(password); // временно, позже заменим на bcrypt

  const { error } = await supabase
    .from("app_users")
    .insert([{ phone, name, password_hash }]);

  if (error) {
    alert("Ошибка регистрации: " + error.message);
    return false;
  }

  alert("Аккаунт создан");
  return true;
};

// === ВХОД ===
window.maderaLogin = async function (phone, password) {
  const password_hash = btoa(password);

  const { data, error } = await supabase
    .from("app_users")
    .select("*")
    .eq("phone", phone)
    .eq("password_hash", password_hash)
    .single();

  if (error || !data) {
    alert("Аккаунт не найден");
    return false;
  }

  localStorage.setItem("madera_user", JSON.stringify(data));
  return true;
};

// === ВЫХОД ===
window.maderaLogout = function () {
  localStorage.removeItem("madera_user");
  location.reload();
};
