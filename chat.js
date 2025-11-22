// chat.js — фронтенд-логика для виджета "AI-ассистент Madera"

document.addEventListener('DOMContentLoaded', () => {
  // 1. Настройка селекторов под твою верстку
  // ОБЯЗАТЕЛЬНО: проверь соответствие ID / data-атрибутов элементам в HTML
  const chatWidget = document.querySelector('[data-madera-chat]') || document.querySelector('#madera-chat');
  const messagesContainer =
    document.querySelector('[data-madera-chat-messages]') || document.querySelector('#madera-chat-messages');
  const form = document.querySelector('[data-madera-chat-form]') || document.querySelector('#madera-chat-form');
  const input =
    document.querySelector('[data-madera-chat-input]') || document.querySelector('#madera-chat-input');
  const submitButton =
    document.querySelector('[data-madera-chat-send]') || document.querySelector('#madera-chat-send');

  // Если форма или контейнер не найдены — тихо выходим, чтобы не ломать страницу
  if (!form || !input || !messagesContainer) {
    console.warn('[Madera AI] Chat elements not found. Check selectors in chat.js');
    return;
  }

  // 2. Храним историю диалога для более умных ответов
  const chatHistory = [];

  // 3. Утилита: скролл вниз
  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // 4. Утилита: отрисовка сообщения
  function addMessage(text, sender = 'user') {
    const messageEl = document.createElement('div');
    messageEl.classList.add('madera-chat-message', `madera-chat-message--${sender}`);
    // При желании — подстрой под твои классы, либо добавь стили под эти
    messageEl.textContent = text;
    messagesContainer.appendChild(messageEl);
    scrollToBottom();
  }

  // 5. Стартовое системное уведомление (если нужно)
  if (!messagesContainer.dataset.initialized) {
    addMessage(
      'Здравствуйте! Я AI-ассистент Madera. Задайте вопрос по стоимости, материалам или планировке мебели — ' +
        'я подскажу ориентировочные варианты. Для точного расчёта всё равно понадобится менеджер и замер.',
      'assistant'
    );
    messagesContainer.dataset.initialized = 'true';
  }

  // 6. Отправка запроса на бэкенд /api/chat
  async function sendToServer(userText) {
    // Добавляем сообщение пользователя в историю
    chatHistory.push({ role: 'user', content: userText });

    try {
      if (submitButton) {
        submitButton.disabled = true;
      }
      input.disabled = true;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userText,
          history: chatHistory
        })
      });

      if (!response.ok) {
        console.error('[Madera AI] /api/chat responded with status', response.status);
        addMessage(
          'Извините, произошла ошибка при обращении к AI. Попробуйте ещё раз чуть позже.',
          'assistant'
        );
        return;
      }

      const data = await response.json();
      const reply = (data && data.reply) || 'Извините, не удалось получить ответ. Попробуйте ещё раз.';

      // Сохраняем ответ в историю
      chatHistory.push({ role: 'assistant', content: reply });

      addMessage(reply, 'assistant');
    } catch (err) {
      console.error('[Madera AI] Network or parsing error:', err);
      addMessage(
        'Похоже, возникла проблема с соединением. Проверьте интернет и попробуйте ещё раз.',
        'assistant'
      );
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
      input.disabled = false;
      input.focus();
    }
  }

  // 7. Обработчик отправки формы
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const userText = (input.value || '').trim();
    if (!userText) return;

    addMessage(userText, 'user');
    input.value = '';

    sendToServer(userText);
  });
});
