export class CrestalChatbox {
  constructor() {
    this.container = null;
    this.chatHistory = [];
  }

  render() {
    const chatbox = document.createElement('div');
    chatbox.className = 'crestal-chatbox';
    chatbox.innerHTML = `
      <div class="chat-header">
        <h3>🤖 Crestal AI Test</h3>
        <button class="chat-close">×</button>
      </div>
      <div class="chat-messages" id="chatMessages"></div>
      <div class="chat-input">
        <input type="text" id="chatInput" placeholder="Ask about your portfolio..." />
        <button id="chatSend">Send</button>
      </div>
    `;

    document.body.appendChild(chatbox);
    this.container = chatbox;
    this.bindEvents();
  }

  bindEvents() {
    const sendBtn = document.getElementById('chatSend');
    const input = document.getElementById('chatInput');
    const closeBtn = this.container.querySelector('.chat-close');

    sendBtn.addEventListener('click', () => this.sendMessage());
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
    closeBtn.addEventListener('click', () => this.container.remove());
  }

  async sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;

    this.addMessage('user', message);
    input.value = '';

    try {
      const response = await fetch('http://localhost:3001/api/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: message })
      });

      const data = await response.json();
      this.addMessage('ai', data.analysis || data.error || 'No response');
    } catch (error) {
      this.addMessage('error', `Error: ${error.message}`);
    }
  }

  addMessage(type, text) {
    const messagesDiv = document.getElementById('chatMessages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${type}`;
    msgDiv.textContent = text;
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
}

// Auto-initialize
window.addEventListener('load', () => {
  const chatbox = new CrestalChatbox();
  chatbox.render();
});
