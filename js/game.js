let playerName = '';
let game;
let chat;
let geminiApi;

class Game {
    constructor() {
        this.board = new Board();
        this.ai = new AI();
        this.currentPlayer = 'red';
        this.winner = null;
        this.scores = { player: 0, ai: 0 };
        this.mustCapture = false;
        this.continuousCapture = null;
    }

    makeMove(from, to) {
        if (this.winner) return;

        const piece = this.board.board[from.row][from.col];
        // Validate that the correct player is moving their piece
        if ((this.currentPlayer === 'red' && !piece.includes('R')) ||
            (this.currentPlayer === 'black' && !piece.includes('B'))) {
            return;
        }

        const newBoard = this.board.board.map(row => [...row]);
        let madeCapture = false;
        
        // Move the piece
        newBoard[to.row][to.col] = newBoard[from.row][from.col];
        newBoard[from.row][from.col] = '';

        // Check if it's a capture
        if (Math.abs(from.row - to.row) >= 2) {
            madeCapture = true;
            const capturedPieces = this.getCapturedPieces(from, to);
            capturedPieces.forEach(pos => {
                newBoard[pos.row][pos.col] = '';
            });
        }

        // Check for king promotion
        if ((piece.includes('R') && to.row === 0) ||
            (piece.includes('B') && to.row === 7)) {
            newBoard[to.row][to.col] = piece + 'K';
        }

        this.board.board = newBoard;
        
        // Check for continuous capture
        if (madeCapture) {
            const furtherCaptures = this.board.getValidCaptures(to);
            if (furtherCaptures.length > 0) {
                this.continuousCapture = to;
                this.board.selectedPiece = to;
                this.board.validMoves = furtherCaptures;
                this.board.render();
                return;
            }
        }

        this.continuousCapture = null;
        this.board.selectedPiece = null;
        this.board.validMoves = [];
        
        // Switch players only if no more captures are available
        if (!this.continuousCapture) {
            this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
        }
        
        this.board.render();
        this.checkWinner();

        // AI's turn
        if (this.currentPlayer === 'black' && !this.winner) {
            setTimeout(async () => {
                const move = this.ai.makeMove(this.board.board);
                if (move) {
                    await this.makeAIMove(move);
                }
            }, 1000);
        }
    }

    async makeAIMove(move) {
        // Make the AI move
        this.makeMove(move.from, move.to);
        
        // Generate and add AI chat message
        if (chat && !this.winner) {
            await chat.addAIMessage(this.board.board, move);
        }
    }

    getCapturedPieces(from, to) {
        const capturedPieces = [];
        const piece = this.board.board[from.row][from.col];
        const isKing = piece.includes('K');
        
        if (Math.abs(from.row - to.row) >= 2) {
            const rowStep = Math.sign(to.row - from.row);
            const colStep = Math.sign(to.col - from.col);
            let row = from.row + rowStep;
            let col = from.col + colStep;
            
            while (row !== to.row || col !== to.col) {
                if (this.board.board[row][col] !== '') {
                    capturedPieces.push(new Position(row, col));
                }
                row += rowStep;
                col += colStep;
            }
        }
        
        return capturedPieces;
    }

    checkWinner() {
        let redPieces = 0;
        let blackPieces = 0;
        let redCanMove = false;
        let blackCanMove = false;

        this.board.board.forEach((row, i) => {
            row.forEach((piece, j) => {
                if (piece.includes('R')) {
                    redPieces++;
                    if (!redCanMove) {
                        const moves = this.board.getValidMoves(new Position(i, j));
                        redCanMove = moves.length > 0;
                    }
                }
                if (piece.includes('B')) {
                    blackPieces++;
                    if (!blackCanMove) {
                        const moves = this.board.getValidMoves(new Position(i, j));
                        blackCanMove = moves.length > 0;
                    }
                }
            });
        });

        if (redPieces === 0 || !redCanMove) {
            this.winner = 'black';
            this.scores.ai++;
        }
        if (blackPieces === 0 || !blackCanMove) {
            this.winner = 'red';
            this.scores.player++;
        }

        if (this.winner) {
            document.getElementById('playerScore').textContent = this.scores.player;
            document.getElementById('aiScore').textContent = this.scores.ai;
            
            const winnerMessage = document.getElementById('winnerMessage');
            winnerMessage.querySelector('h2').textContent = 
                `${this.winner === 'red' ? playerName : 'AI'} Wins!`;
            winnerMessage.classList.remove('hidden');
        }
    }
}

function startGame(name, apiKey) {
    playerName = name;
    document.getElementById('playerSetup').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    document.getElementById('playerNameDisplay').textContent = name;
    
    geminiApi = new GeminiAPI(apiKey);
    game = new Game();
    chat = new Chat(geminiApi);
}

function resetGame() {
    game = new Game();
    document.getElementById('winnerMessage').classList.add('hidden');
}

// Initialize the game
document.getElementById('playerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('playerName').value.trim();
    const apiKey = document.getElementById('apiKey').value.trim();
    if (name && apiKey) {
        startGame(name, apiKey);
    }
});