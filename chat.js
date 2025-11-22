// Фронтенд для AI-ассистента Madera
// Этот файл подключается на странице, где есть разметка виджета чата.
// Он отправляет запросы на backend /api/chat и отображает ответы.

document.addEventListener('DOMContentLoaded', () => {
  const widget = document.querySelector('[data-madera-chat]');
  const openBtn = document.querySelector('[data-madera-chat-open]');
  const closeBtn = widget?.querySelector('[data-madera-chat-close]');
  const form = widget?.querySelector('[data-madera-chat-form]');
  const input = widget?.querySelector('[data-madera-chat-input]');
  const messages = widget?.querySelector('[data-madera-chat-messages]');
  const statusEl = widget?.querySelector('[data-madera-chat-status]');

  if (!widget || !openBtn || !closeBtn || !form || !input || !messages) {
    console.warn('[Madera AI] Не найдены элементы чата. Проверь разметку и data-атрибуты.');
    return;
  }

  let isSending = false;

  // --- Вспомогательные функции ---

  // Показать / скрыть чат
  function openChat() {
    widget.classList.add('chat-open');
    widget.classList.remove('chat-closed');
  }

  function closeChat() {
    widget.classList.add('chat-closed');
    widget.classList.remove('chat-open');
  }

  // Прокрутка вниз
  function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
  }

  // Установка статуса (под полем ввода)
  function setStatus(text) {
    if (!statusEl) return;
    statusEl.textContent = text || '';
  }

  // Создание DOM-элемента сообщения
  function createMessageElement(role, text) {
    const bubble = document.createElement('div');
    bubble.classList.add('madera-chat-bubble');

    if (role === 'user') {
      bubble.classList.add('madera-chat-bubble-user');
    } else {
      bubble.classList.add('madera-chat-bubble-assistant');
    }

    bubble.textContent = text;
    return bubble;
  }

  // Добавить сообщение в список
  function addMessage(role, text) {
    const el = createMessageElement(role, text);
    messages.appendChild(el);
    scrollToBottom();
  }

  // --- Работа с сервером ---

  async function sendToServer(messageText) {
    if (isSending) return;
    isSending = true;
    input.disabled = true;

    setStatus('AI-ассистент печатает…');

    try {
      console.log('[Madera AI] Отправка на /api/chat:', messageText);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: messageText })
      });

      if (!response.ok) {
        console.error('[Madera AI] Ошибка ответа сервера:', response.status);
        addMessage('assistant', 'Извините, произошла ошибка на сервере. Попробуйте позже.');
        return;
      }

      const data = await response.json();
      console.log('[Madera AI] Ответ от /api/chat:', data);

      const reply =
        (data && typeof data.reply === 'string' && data.reply.trim()) ||
        'Извините, произошла ошибка. Попробуйте позже.';

      addMessage('assistant', reply);
    } catch (error) {
      console.error('[Madera AI] Ошибка фронтенда:', error);
      addMessage(
        'assistant',
        'Извините, не удалось связаться с сервером. Проверьте соединение и попробуйте ещё раз.'
      );
    } finally {
      isSending = false;
      input.disabled = false;
      input.focus();
      setStatus('AI-ассистент онлайн');
    }
  }

  // --- Обработчики событий ---

  // Открыть чат
  openBtn.addEventListener('click', () => {
    openChat();
    input.focus();
  });

  // Закрыть чат
  closeBtn.addEventListener('click', () => {
    closeChat();
  });

  // Отправка формы
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = (input.value || '').trim();
    if (!text || isSending) return;

    // Добавляем сообщение пользователя
    addMessage('user', text);
    input.value = '';

    // Отправляем на сервер
    sendToServer(text);
  });

  // Отправка по Enter (без Shift)
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit(); // эквивалент нажатия кнопки «Отправить»
    }
  });

  // Инициализация статуса
  setStatus('AI-ассистент онлайн');
  console.log('[Madera AI] Фронтенд инициализирован');
});
