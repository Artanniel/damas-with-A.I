class Chat {
    constructor(geminiApi) {
        this.messages = [];
        this.chatMessages = document.getElementById('chatMessages');
        this.chatForm = document.getElementById('chatForm');
        this.messageInput = document.getElementById('messageInput');
        this.geminiApi = geminiApi;

        this.chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = this.messageInput.value.trim();
            if (text) {
                this.addMessage(playerName, text);
                this.messageInput.value = '';
                
                // Get AI response to player's message
                try {
                    const response = await this.geminiApi.generateChatResponse(text);
                    this.addMessage('AI', response);
                } catch (error) {
                    console.error('Error getting AI response:', error);
                    this.addMessage('AI', this.getRandomTaunt());
                }
            }
        });

        this.addMessage('AI', "Ready to play? I'll try to go easy on you... maybe! 😈");
    }

    async addAIMessage(gameState, lastMove) {
        try {
            const message = await this.geminiApi.generateMoveResponse(gameState, lastMove);
            this.addMessage('AI', message);
        } catch (error) {
            console.error('Error getting AI move response:', error);
            this.addMessage('AI', this.getRandomTaunt());
        }
    }

    addMessage(sender, text) {
        const message = {
            sender,
            text,
            timestamp: new Date()
        };
        this.messages.push(message);
        this.renderMessage(message);
        this.scrollToBottom();
    }

    renderMessage(message) {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${message.sender === 'AI' ? 'ai' : 'player'}`;
        
        messageEl.innerHTML = `
            <div class="message-content">
                <div class="message-sender">${message.sender}</div>
                <div class="message-text">${message.text}</div>
            </div>
            <div class="message-time">${message.timestamp.toLocaleTimeString()}</div>
        `;
        
        this.chatMessages.appendChild(messageEl);
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    getRandomTaunt() {
        return taunts[Math.floor(Math.random() * taunts.length)];
    }
}