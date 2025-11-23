// chat.js — фронтенд логика виджета Madera AI
// Поддержка: история диалога, работа с /api/chat,
// задел под голосовой ввод и озвучку ответов.

(function () {
  const openBtn = document.querySelector('[data-madera-chat-open]');
  const chatEl = document.querySelector('[data-madera-chat]');
  const closeBtn = document.querySelector('[data-madera-chat-close]');
  const form = document.querySelector('[data-madera-chat-form]');
  const input = document.querySelector('[data-madera-chat-input]');
  const messagesEl = document.querySelector('[data-madera-chat-messages]');
  const statusEl = document.querySelector('[data-madera-chat-status]');
  const voiceBtn = document.querySelector('[data-madera-chat-voice]'); // опционально

  if (!chatEl || !form || !input || !messagesEl) {
    console.warn('[Madera Chat] Required elements not found, chat disabled');
    return;
  }

  // История для передачи на бэкенд (упрощённое представление)
  const conversation = []; // { role: 'user' | 'assistant', content: '...' }

  // --- UI-утилиты ---

  function openChat() {
    chatEl.classList.add('madera-chat--open');
    if (input) input.focus();
  }

  function closeChat() {
    chatEl.classList.remove('madera-chat--open');
  }

  function setStatus(text) {
    if (!statusEl) return;
    statusEl.textContent = text || '';
  }

  function addMessageBubble(role, text) {
    if (!messagesEl || !text) return;

    const wrapper = document.createElement('div');
    wrapper.className =
      role === 'user' ? 'madera-chat__message madera-chat__message--user'
                      : 'madera-chat__message madera-chat__message--bot';

    const bubble = document.createElement('div');
    bubble.className = 'madera-chat__bubble';
    bubble.textContent = text;

    wrapper.appendChild(bubble);
    messagesEl.appendChild(wrapper);

    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // --- Голосовая озвучка ответа (если поддерживается) ---

  function speak(text) {
    if (!('speechSynthesis' in window) || !text) return;
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ru-RU';
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('[Madera Chat] speechSynthesis error:', e);
    }
  }

  // --- Голосовой ввод (если есть кнопка + поддержка браузера) ---

  if (voiceBtn) {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      voiceBtn.disabled = true;
      voiceBtn.title = 'Голосовой ввод не поддерживается в этом браузере';
    } else {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ru-RU';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      let isListening = false;

      recognition.addEventListener('result', (event) => {
        const transcript = event.results[0][0].transcript;
        input.value = transcript;
        // Можно сразу отправлять:
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      });

      recognition.addEventListener('end', () => {
        isListening = false;
        voiceBtn.classList.remove('madera-chat__voice--active');
      });

      recognition.addEventListener('error', (event) => {
        console.warn('[Madera Chat] Speech recognition error:', event.error);
        isListening = false;
        voiceBtn.classList.remove('madera-chat__voice--active');
      });

      voiceBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (isListening) {
          recognition.stop();
          return;
        }
        try {
          recognition.start();
          isListening = true;
          voiceBtn.classList.add('madera-chat__voice--active');
        } catch (err) {
          console.warn('[Madera Chat] recognition start error:', err);
        }
      });
    }
  }

  // --- Отправка сообщения на бэкенд ---

  async function sendMessageToServer(text) {
    setStatus('AI-ассистент думает…');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: text,
          history: conversation
        })
      });

      if (!response.ok) {
        console.error('[Madera Chat] Server error:', response.status);
        setStatus('Ошибка сервера. Попробуйте ещё раз.');
        addMessageBubble(
          'assistant',
          'Извините, сейчас не получается ответить. Попробуйте ещё раз или оставьте заявку через форму.'
        );
        return;
      }

      const data = await response.json();
      console.log('[Madera Chat] Server response:', data);

      const reply =
        (data && typeof data.reply === 'string' && data.reply.trim()) ||
        'Спасибо за вопрос! Менеджер свяжется с вами для уточнения деталей.';

      addMessageBubble('assistant', reply);
      conversation.push({ role: 'assistant', content: reply });

      // Озвучка ответа
      speak(reply);

      // Здесь при желании можно отобразить апсейл/сегмент (например, в скрытом debug-блоке):
      // console.log('segment:', data.segment, 'upsell:', data.upsell);

      setStatus('');
    } catch (error) {
      console.error('[Madera Chat] Request error:', error);
      setStatus('Ошибка соединения. Проверьте интернет.');
      addMessageBubble(
        'assistant',
        'Извините, сейчас не получается подключиться к серверу. Попробуйте ещё раз позже.'
      );
    }
  }

  // --- Обработчики событий ---

  if (openBtn) {
    openBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openChat();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeChat();
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    addMessageBubble('user', text);
    conversation.push({ role: 'user', content: text });

    input.value = '';
    sendMessageToServer(text);
  });

  // Можно открыть чат сразу, если нужно:
  // openChat();
})();
