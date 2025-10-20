import { crestalAI } from '../config/crestal.js';

export class CrestalChatbox {
  constructor() {
    this.container = null;
    this.chatHistory = [];
    this.sessionId = `chat_${Date.now()}`;
  }

  render() {
    const chatbox = document.createElement("div");
    chatbox.className = "crestal-chatbox";
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
    const sendBtn = document.getElementById("chatSend");
    const input = document.getElementById("chatInput");
    const closeBtn = this.container.querySelector(".chat-close");

    sendBtn.addEventListener("click", () => this.sendMessage());
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.sendMessage();
    });
    closeBtn.addEventListener("click", () => this.container.remove());
  }

  async sendMessage() {
    const input = document.getElementById("chatInput");
    const message = input.value.trim();
    if (!message) return;

    this.addMessage("user", message);
    input.value = "";
    this.addMessage("ai", "Thinking...");

    try {
      // Use centralized Crestal AI service with session management
      const result = await crestalAI.sendMessage(
        message,
        'generalChat',
        {},
        this.sessionId
      );
      
      // Remove "Thinking..." message
      const messagesDiv = document.getElementById("chatMessages");
      messagesDiv.lastChild.remove();
      
      if (result.success) {
        this.addMessage("ai", result.response);
      } else {
        this.addMessage("error", result.response);
      }
    } catch (error) {
      console.error("Crestal error:", error);
      const messagesDiv = document.getElementById("chatMessages");
      if (messagesDiv.lastChild) messagesDiv.lastChild.remove();
      this.addMessage("error", `Error: ${error.message}`);
    }
  }

  addMessage(type, text) {
    const messagesDiv = document.getElementById("chatMessages");
    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-message ${type}`;
    msgDiv.textContent = text;
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
}

// Auto-initialize
window.addEventListener("load", () => {
  const chatbox = new CrestalChatbox();
  chatbox.render();
});
