import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ===== HELPERS =====
function hashPassword(password) {
  return btoa(password); // временно, НЕ для продакшена
}

function normalizePhone(phone) {
  return phone.replace(/\s+/g, "").trim();
}

// ===== REGISTER =====
window.maderaRegister = async function (phone, name, password) {
  phone = normalizePhone(phone);
  const password_hash = hashPassword(password);

  // проверка существования
  const { data: existing } = await supabase
    .from("app_users")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();

  if (existing) {
    alert("Этот номер уже зарегистрирован");
    return false;
  }

  const { error } = await supabase.from("app_users").insert({
    phone,
    name,
    password_hash,
  });

  if (error) {
    alert("Ошибка регистрации: " + error.message);
    return false;
  }

  localStorage.setItem("madera_user_phone", phone);
  return true;
};

// ===== LOGIN =====
window.maderaLogin = async function (phone, password) {
  phone = normalizePhone(phone);
  const password_hash = hashPassword(password);

  const { data, error } = await supabase
    .from("app_users")
    .select("*")
    .eq("phone", phone)
    .eq("password_hash", password_hash)
    .maybeSingle();

  if (!data || error) {
    alert("Неверный телефон или пароль");
    return false;
  }

  localStorage.setItem("madera_user_phone", phone);
  return true;
};

// ===== LOGOUT =====
window.maderaLogout = function () {
  localStorage.removeItem("madera_user_phone");
  location.reload();
};

// ===== CHECK AUTH =====
window.maderaIsAuthed = function () {
  return !!localStorage.getItem("madera_user_phone");
};
