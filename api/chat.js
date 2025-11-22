// chat.js
// Логика фронтенд-виджета "AI-ассистент Madera"
// Отправка запросов на /api/chat (сервер на Vercel) и отображение диалога

(function () {
  const API_URL = '/api/chat';

  // DOM-элементы
  const openBtn = document.querySelector('#madera-chat-open');
  const widget = document.querySelector('#madera-chat-widget');
  const closeBtn = document.querySelector('#madera-chat-close');
  const messagesContainer = document.querySelector('#madera-chat-messages');
  const input = document.querySelector('#madera-chat-input');
  const sendBtn = document.querySelector('#madera-chat-send');

  if (!widget || !messagesContainer || !input || !sendBtn) {
    console.warn(
      '[Madera Chat] Не найдены один или несколько элементов виджета. Проверь id в HTML.'
    );
    return;
  }

  // Состояние
  let isSending = false;

  // Вспомогательные функции

  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function createMessageElement(role, text) {
    const bubble = document.createElement('div');
    bubble.classList.add('madera-chat-message', `madera-chat-${role}`);

    // role: 'user' | 'assistant' | 'system'
    // Ожидается, что в CSS есть стили:
    // .madera-chat-message.madera-chat-user { ... }
    // .madera-chat-message.madera-chat-assistant { ... }

    bubble.textContent = text;
    return bubble;
  }

  function addMessage(role, text) {
    const el = createMessageElement(role, text);
    messagesContainer.appendChild(el);
    scrollToBottom();
    return el;
  }

  function setSendingState(value) {
    isSending = value;
    input.disabled = value;
    sendBtn.disabled = value;
    if (value) {
      sendBtn.classList.add('madera-chat-send-disabled');
    } else {
      sendBtn.classList.remove('madera-chat-send-disabled');
    }
  }

  // Отправка запроса на бэкенд
  async function sendToBackend(messageText, placeholderEl) {
    try {
      const controller = new AbortController();
      // таймаут 30 секунд на всякий случай
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('[Madera Chat] Backend error:', response.status, await response.text());
        throw new Error('Bad response from backend');
      }

      const data = await response.json();
      const reply =
        (data && data.reply && String(data.reply).trim()) ||
        'Не удалось получить ответ от ассистента. Попробуйте переформулировать вопрос.';

      placeholderEl.textContent = reply;
    } catch (error) {
      console.error('[Madera Chat] Request failed:', error);

      // Фолбэк при ошибке — текст про демо-режим
      placeholderEl.textContent =
        'Спасибо за вопрос! Сейчас AI-ассистент в демо-режиме. ' +
        'Менеджер свяжется с вами после отправки заявки в разделе «Заказ».';
    } finally {
      setSendingState(false);
    }
  }

  // Обработка отправки сообщения
  function handleSend() {
    if (isSending) return;

    const raw = input.value.trim();
    if (!raw) return;

    // добавляем сообщение пользователя
    addMessage('user', raw);

    // очищаем поле ввода
    input.value = '';

    // временное сообщение ассистента "печатает..."
    const placeholder = addMessage('assistant', 'Ассистент печатает ответ...');

    setSendingState(true);

    // отправляем на бэкенд
    sendToBackend(raw, placeholder);
  }

  // Открытие / закрытие виджета
  function openWidget() {
    widget.classList.add('madera-chat-visible');
  }

  function closeWidget() {
    widget.classList.remove('madera-chat-visible');
  }

  // Инициализация

  // Приветственное сообщение ассистента (один раз при загрузке)
  function initGreeting() {
    if (messagesContainer.dataset.initialized === '1') return;
    messagesContainer.dataset.initialized = '1';

    addMessage(
      'assistant',
      'Здравствуйте! Я AI-ассистент Madera. Задайте вопрос по стоимости, материалам или планировке — подскажу общие варианты.'
    );
  }

  document.addEventListener('DOMContentLoaded', () => {
    initGreeting();
  });

  // Слушатели

  if (openBtn) {
    openBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openWidget();
      input.focus();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeWidget();
    });
  }

  sendBtn.addEventListener('click', (e) => {
    e.preventDefault();
    handleSend();
  });

  input.addEventListener('keydown', (e) => {
    // Отправка по Enter, Shift+Enter — перенос строки
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });
})();
