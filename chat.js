// chat.js — фронтенд-логика виджета "AI-ассистент Madera"

document.addEventListener('DOMContentLoaded', () => {
  console.log('[Madera AI] Frontend script loaded');

  // === 1. Находим элементы чата ===
  // ПРОВЕРЬТЕ, что эти селекторы совпадают с вашей версткой.
  // Если у вас другие id/class — замените тут.

  const chatWidget =
    document.querySelector('[data-madera-chat]') ||
    document.querySelector('#madera-chat') ||
    document.querySelector('.ai-assistant');

  const messagesContainer =
    document.querySelector('[data-madera-chat-messages]') ||
    document.querySelector('#madera-chat-messages') ||
    (chatWidget && chatWidget.querySelector('.chat__messages'));

  const form =
    document.querySelector('[data-madera-chat-form]') ||
    document.querySelector('#madera-chat-form') ||
    (chatWidget && chatWidget.querySelector('form'));

  const input =
    document.querySelector('[data-madera-chat-input]') ||
    document.querySelector('#madera-chat-input') ||
    (chatWidget && chatWidget.querySelector('input, textarea'));

  const submitButton =
    document.querySelector('[data-madera-chat-send]') ||
    document.querySelector('#madera-chat-send') ||
    (chatWidget && chatWidget.querySelector('button[type="submit"], .chat__send'));

  // Если ключевых элементов нет — выходим, чтобы не ломать страницу
  if (!messagesContainer || !form || !input) {
    console.warn('[Madera AI] Chat elements not found. Check selectors in chat.js');
    return;
  }

  // === 2. История диалога ===
  const chatHistory = [];

  // === 3. Утилиты ===
  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function addMessage(text, sender = 'user') {
    const messageEl = document.createElement('div');
    messageEl.classList.add('madera-chat-message', `madera-chat-message--${sender}`);
    messageEl.textContent = text;
    messagesContainer.appendChild(messageEl);
    scrollToBottom();
  }

  // === 4. Стартовое сообщение (диагностическое) ===
  if (!messagesContainer.dataset.initialized) {
    addMessage(
      'Здравствуйте! Я новый AI-ассистент Madera. ' +
        'Если вы видите ЭТО сообщение, значит подключен актуальный файл chat.js, ' +
        'и мы сейчас попробуем связаться с сервером.',
      'assistant'
    );
    messagesContainer.dataset.initialized = 'true';
  }

  // === 5. Отправка запроса на /api/chat ===
  async function sendToServer(userText) {
    chatHistory.push({ role: 'user', content: userText });

    try {
      if (submitButton) submitButton.disabled = true;
      input.disabled = true;

      console.log('[Madera AI] Sending request to /api/chat');

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
          'Извините, сервер ответил с ошибкой. Попробуйте ещё раз чуть позже.',
          'assistant'
        );
        return;
      }

      const data = await response.json();
      const reply =
        (data && data.reply) ||
        'Извините, не удалось получить ответ от AI. Попробуйте ещё раз.';

      chatHistory.push({ role: 'assistant', content: reply });
      addMessage(reply, 'assistant');
    } catch (err) {
      console.error('[Madera AI] Network or parsing error:', err);
      addMessage(
        'Похоже, есть проблема с соединением или сервером. Попробуйте ещё раз позже.',
        'assistant'
      );
    } finally {
      if (submitButton) submitButton.disabled = false;
      input.disabled = false;
      input.focus();
    }
  }

  // === 6. Обработчик формы ===
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const userText = (input.value || '').trim();
    if (!userText) return;

    addMessage(userText, 'user');
    input.value = '';

    sendToServer(userText);
  });
});
