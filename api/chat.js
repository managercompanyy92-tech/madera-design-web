// public/chat.js (или src/chat.js — куда у тебя подключено)
'use strict';

const API_URL = '/api/chat';

const FALLBACK_ANSWER =
  'Спасибо за вопрос! Сейчас AI-ассистент в демо-режиме. ' +
  'Менеджер свяжется с вами после отправки заявки в разделе «Заказ».';

function $(selectors) {
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) return el;
  }
  return null;
}

document.addEventListener('DOMContentLoaded', () => {
  const openBtn = $([
    '[data-ai-assistant-toggle]',
    '#ai-assistant-toggle',
    '.ai-assistant-toggle',
    '.ai-assistant-button',
    'button[aria-label="AI-ассистент"]'
  ]);

  const widget = $([
    '[data-ai-assistant]',
    '#ai-assistant',
    '.ai-assistant-widget'
  ]);

  const closeBtn = $([
    '[data-ai-assistant-close]',
    '.ai-assistant-close',
    '.ai-close'
  ]);

  const messagesContainer = $([
    '[data-ai-messages]',
    '.ai-messages',
    '#ai-messages'
  ]);

  const form = $([
    '[data-ai-form]',
    '#ai-form',
    '.ai-form'
  ]);

  const input = $([
    '[data-ai-input]',
    '#ai-input',
    '.ai-input',
    'textarea[name="ai-question"]',
    'input[name="ai-question"]'
  ]);

  const sendButton = $([
    '[data-ai-send]',
    '.ai-send-button',
    '#ai-send'
  ]);

  if (!widget || !messagesContainer || !form || !input) {
    console.warn('[Madera AI] Chat init failed: missing DOM elements');
    return;
  }

  function openWidget() {
    widget.classList.add('ai-open');
  }

  function closeWidget() {
    widget.classList.remove('ai-open');
  }

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

  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function createMessageBubble(role, text) {
    const bubble = document.createElement('div');
    bubble.classList.add('ai-message', `ai-message--${role}`);
    bubble.textContent = text;
    return bubble;
  }

  function addMessage(role, text) {
    const bubble = createMessageBubble(role, text);
    messagesContainer.appendChild(bubble);
    scrollToBottom();
    return bubble;
  }

  function addTypingIndicator() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('ai-message', 'ai-message--assistant', 'ai-typing');

    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('span');
      dot.className = 'ai-typing-dot';
      wrapper.appendChild(dot);
    }

    messagesContainer.appendChild(wrapper);
    scrollToBottom();
    return wrapper;
  }

  function removeTypingIndicator(node) {
    if (node && node.parentNode) {
      node.parentNode.removeChild(node);
    }
  }

  async function sendQuestion(question) {
    addMessage('user', question);
    const typingNode = addTypingIndicator();

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: question })
      });

      removeTypingIndicator(typingNode);

      if (!response.ok) {
        console.error(
          '[Madera AI] HTTP error from /api/chat:',
          response.status,
          response.statusText
        );
        addMessage('assistant', FALLBACK_ANSWER);
        return;
      }

      const data = await response.json();

      const answer =
        (data && (data.answer || data.message || data.text || data.reply)) ||
        FALLBACK_ANSWER;

      addMessage('assistant', answer);
    } catch (err) {
      console.error('[Madera AI] Network/JS error while calling /api/chat:', err);
      removeTypingIndicator(typingNode);
      addMessage('assistant', FALLBACK_ANSWER);
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const question = (input.value || '').trim();
    if (!question) return;

    if (sendButton) {
      sendButton.disabled = true;
      sendButton.classList.add('ai-send-disabled');
    }

    sendQuestion(question).finally(() => {
      input.value = '';
      input.focus();

      if (sendButton) {
        sendButton.disabled = false;
        sendButton.classList.remove('ai-send-disabled');
      }
    });
  });

  if (sendButton) {
    sendButton.addEventListener('click', (e) => {
      e.preventDefault();
      form.requestSubmit();
    });
  }
});
