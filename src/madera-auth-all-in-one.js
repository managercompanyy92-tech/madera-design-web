window.maderaRegister = async function (phone, name, password) {
  alert("ФУНКЦИЯ ВЫЗВАНА");

  console.log("DATA:", { phone, name, password });

  if (!phone || !password) {
    alert("Нет телефона или пароля");
    return;
  }

  const password_hash = btoa(password);

  const { data, error } = await supabase
    .from("app_users")
    .insert([{ phone, name, password_hash }])
    .select();

  if (error) {
    alert("SUPABASE ERROR: " + error.message);
    console.error(error);
  } else {
    alert("УСПЕШНО ДОБАВЛЕНО");
    console.log("INSERTED:", data);
  }
};
