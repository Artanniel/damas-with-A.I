class Board {
    constructor() {
        this.BOARD_SIZE = 8;
        this.board = this.initializeBoard();
        this.selectedPiece = null;
        this.validMoves = [];
        this.element = document.getElementById('board');
        this.render();
    }

    initializeBoard() {
        const board = Array(this.BOARD_SIZE).fill('').map(() => Array(this.BOARD_SIZE).fill(''));
        
        // Place black pieces
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < this.BOARD_SIZE; col++) {
                if ((row + col) % 2 === 1) {
                    board[row][col] = 'B';
                }
            }
        }
        
        // Place red pieces
        for (let row = this.BOARD_SIZE - 3; row < this.BOARD_SIZE; row++) {
            for (let col = 0; col < this.BOARD_SIZE; col++) {
                if ((row + col) % 2 === 1) {
                    board[row][col] = 'R';
                }
            }
        }
        
        return board;
    }

    render() {
        this.element.innerHTML = '';
        
        this.board.forEach((row, rowIndex) => {
            row.forEach((piece, colIndex) => {
                const square = document.createElement('div');
                square.className = `square ${(rowIndex + colIndex) % 2 === 0 ? 'light' : 'dark'}`;
                
                if (this.selectedPiece?.row === rowIndex && this.selectedPiece?.col === colIndex) {
                    square.classList.add('selected');
                }
                
                if (this.validMoves.some(move => move.row === rowIndex && move.col === colIndex)) {
                    square.classList.add('valid-move');
                }
                
                if (piece) {
                    const pieceEl = document.createElement('div');
                    pieceEl.className = `piece ${piece.includes('R') ? 'red' : 'black'}`;
                    if (piece.includes('K')) pieceEl.classList.add('king');
                    square.appendChild(pieceEl);
                }
                
                square.addEventListener('click', () => this.handleSquareClick(rowIndex, colIndex));
                this.element.appendChild(square);
            });
        });
    }

    getValidMoves(pos) {
        const piece = this.board[pos.row][pos.col];
        if (!piece) return [];

        const moves = [];
        const isKing = piece.includes('K');
        const directions = isKing ? [-1, 1] : piece.includes('R') ? [-1] : [1];

        // First check for captures as they are mandatory
        const captures = this.getValidCaptures(pos);
        if (captures.length > 0) {
            return captures;
        }

        // If no captures are available, check for regular moves
        directions.forEach(dRow => {
            [-1, 1].forEach(dCol => {
                const newRow = pos.row + dRow;
                const newCol = pos.col + dCol;
                if (this.isValidPosition(newRow, newCol) && this.board[newRow][newCol] === '') {
                    moves.push(new Position(newRow, newCol));
                }
            });
        });

        return moves;
    }

    getValidCaptures(pos) {
        const piece = this.board[pos.row][pos.col];
        if (!piece) return [];

        const captures = [];
        const isKing = piece.includes('K');
        const directions = isKing ? [-1, 1] : piece.includes('R') ? [-1] : [1];

        if (isKing) {
            // Kings can capture in any direction at any distance
            [-1, 1].forEach(dRow => {
                [-1, 1].forEach(dCol => {
                    let row = pos.row + dRow;
                    let col = pos.col + dCol;
                    let foundEnemy = false;
                    let enemyPos = null;

                    while (this.isValidPosition(row, col)) {
                        if (!foundEnemy && this.board[row][col] !== '') {
                            if ((piece.includes('R') && this.board[row][col].includes('B')) ||
                                (piece.includes('B') && this.board[row][col].includes('R'))) {
                                foundEnemy = true;
                                enemyPos = new Position(row, col);
                            } else {
                                break;
                            }
                        } else if (foundEnemy && this.board[row][col] === '') {
                            captures.push(new Position(row, col));
                        } else if (foundEnemy && this.board[row][col] !== '') {
                            break;
                        }
                        row += dRow;
                        col += dCol;
                    }
                });
            });
        } else {
            // Regular pieces can only capture adjacent pieces
            directions.forEach(dRow => {
                [-1, 1].forEach(dCol => {
                    const midRow = pos.row + dRow;
                    const midCol = pos.col + dCol;
                    const endRow = midRow + dRow;
                    const endCol = midCol + dCol;

                    if (this.isValidPosition(endRow, endCol) &&
                        this.board[endRow][endCol] === '' &&
                        this.board[midRow][midCol] !== '' &&
                        ((piece.includes('R') && this.board[midRow][midCol].includes('B')) ||
                         (piece.includes('B') && this.board[midRow][midCol].includes('R')))) {
                        captures.push(new Position(endRow, endCol));
                    }
                });
            });
        }

        return captures;
    }

    handleSquareClick(row, col) {
        if (game.winner || game.currentPlayer !== 'red') return;

        if (this.selectedPiece) {
            const isValidMove = this.validMoves.some(
                move => move.row === row && move.col === col
            );
            if (isValidMove) {
                game.makeMove(this.selectedPiece, new Position(row, col));
            } else {
                this.selectPiece(row, col);
            }
        } else {
            this.selectPiece(row, col);
        }
    }

    selectPiece(row, col) {
        const piece = this.board[row][col];
        if (piece && ((game.currentPlayer === 'red' && piece.includes('R')) ||
            (game.currentPlayer === 'black' && piece.includes('B')))) {
            this.selectedPiece = new Position(row, col);
            this.validMoves = this.getValidMoves(this.selectedPiece);
            this.render();
        }
    }

    isValidPosition(row, col) {
        return row >= 0 && row < this.BOARD_SIZE && col >= 0 && col < this.BOARD_SIZE;
    }
}