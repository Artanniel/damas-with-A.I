class GeminiAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    }

    async generateMoveResponse(gameState, lastMove) {
        return this.generateResponse(
            `You are playing a game of checkers. The current game state is: ${JSON.stringify(gameState)}. 
             The last move was: ${JSON.stringify(lastMove)}. 
             Generate a playful, taunting response as an AI player, keeping it light and fun.`
        );
    }

    async generateChatResponse(playerMessage) {
        return this.generateResponse(
            `You are an AI playing checkers. The player just said: "${playerMessage}". 
             Respond in a playful, witty, and slightly taunting way, keeping it fun and engaging. 
             Make references to being an AI and playing checkers in your response.`
        );
    }

    async generateResponse(prompt) {
        try {
            const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Gemini API error:', errorData);
                throw new Error(`Gemini API returned ${response.status}: ${errorData.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();
            
            if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
                throw new Error('Invalid response format from Gemini API');
            }

            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            return chat.getRandomTaunt(); // Fallback to predefined taunts
        }
    }
}