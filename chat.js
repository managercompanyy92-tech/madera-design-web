// chat.js — фронтенд-логика виджета AI-ассистента Madera

(function () {
  document.addEventListener('DOMContentLoaded', initMaderaChat);

  function initMaderaChat() {
    console.log('[Madera AI Frontend] Initializing chat...');

    const openBtn = document.querySelector('[data-madera-chat-open]');
    const widget = document.querySelector('[data-madera-chat]');
    const closeBtn = document.querySelector('[data-madera-chat-close]');
    const form = document.querySelector('[data-madera-chat-form]');
    const input = document.querySelector('[data-madera-chat-input]');
    const messages = document.querySelector('[data-madera-chat-messages]');
    const statusEl = document.querySelector('[data-madera-chat-status]');

    // Проверяем, что все элементы на месте
    if (!openBtn || !widget || !closeBtn || !form || !input || !messages) {
      console.error('[Madera AI Frontend] One or more required elements are missing in HTML.');
      return;
    }

    let isSending = false;

    // Показать чат
    openBtn.addEventListener('click', () => {
      widget.style.display = 'flex';
      openBtn.style.display = 'none';
      input.focus();
      console.log('[Madera AI Frontend] Chat opened');
    });

    // Скрыть чат
    closeBtn.addEventListener('click', () => {
      widget.style.display = 'none';
      openBtn.style.display = 'inline-block';
      console.log('[Madera AI Frontend] Chat closed');
    });

    // Обработка отправки формы
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (isSending) return;

      const text = (input.value || '').trim();
      if (!text) return;

      appendMessage(messages, text, 'user');
      input.value = '';
      setStatus(statusEl, 'AI-ассистент думает…');
      setSendingState(true);

      try {
        const reply = await sendMessageToServer(text);
        appendMessage(messages, reply, 'assistant');
        setStatus(statusEl, '');
      } catch (error) {
        console.error('[Madera AI Frontend] Error while sending message:', error);
        appendMessage(
          messages,
          'Извините, произошла ошибка при обращении к AI-ассистенту. Попробуйте ещё раз позже.',
          'assistant'
        );
        setStatus(statusEl, 'Ошибка соединения с сервером.');
      } finally {
        setSendingState(false);
        input.focus();
      }
    });

    // Отправка по Enter (без Shift)
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        form.dispatchEvent(new Event('submit'));
      }
    });

    // Первое приветствие
    appendMessage(
      messages,
      'Здравствуйте! Я AI-ассистент мебельной студии Madera. ' +
        'Задайте вопрос по стоимости, материалам или планировке кухни, шкафа или другой мебели.',
      'assistant'
    );
    setStatus(statusEl, '');
    console.log('[Madera AI Frontend] Chat initialized successfully.');

    // ---------------- Вспомогательные функции ----------------

    function setSendingState(sending) {
      isSending = sending;
      input.disabled = sending;

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = sending;
        submitBtn.style.opacity = sending ? '0.7' : '1';
      }
    }

    function setStatus(el, text) {
      if (!el) return;
      el.textContent = text || '';
    }
  }

  /**
   * Отправка сообщения на /api/chat
   * @param {string} text
   * @returns {Promise<string>} reply text
   */
  async function sendMessageToServer(text) {
    console.log('[Madera AI Frontend] Sending message to /api/chat:', text);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: text }),
    });

    let data;
    try {
      data = await res.json();
    } catch (e) {
      console.error('[Madera AI Frontend] Failed to parse JSON from /api/chat:', e);
      throw new Error('Invalid JSON from server');
    }

    if (!res.ok) {
      console.error('[Madera AI Frontend] Server returned error status:', res.status, data);
      throw new Error(data?.error || 'Server error');
    }

    if (!data || typeof data.reply !== 'string') {
      console.error('[Madera AI Frontend] No "reply" field in response:', data);
      throw new Error('Invalid response from server');
    }

    console.log('[Madera AI Frontend] Received reply:', data.reply);
    return data.reply;
  }

  /**
   * Добавляет сообщение в чат в виде красивого пузырька
   * @param {HTMLElement} container
   * @param {string} text
   * @param {'user'|'assistant'} sender
   */
  function appendMessage(container, text, sender) {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.marginBottom = '8px';
    wrapper.style.justifyContent = sender === 'user' ? 'flex-end' : 'flex-start';

    const bubble = document.createElement('div');
    bubble.textContent = text;
    bubble.style.maxWidth = '80%';
    bubble.style.padding = '8px 12px';
    bubble.style.borderRadius = '16px';
    bubble.style.fontSize = '14px';
    bubble.style.lineHeight = '1.4';
    bubble.style.whiteSpace = 'pre-wrap';
    bubble.style.wordBreak = 'break-word';
    bubble.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.3)';

    if (sender === 'user') {
      bubble.style.background = '#ff8c2b';
      bubble.style.color = '#000';
      bubble.style.borderBottomRightRadius = '4px';
    } else {
      bubble.style.background = '#333333';
      bubble.style.color = '#ffffff';
      bubble.style.borderBottomLeftRadius = '4px';
    }

    wrapper.appendChild(bubble);
    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;
  }
})();
