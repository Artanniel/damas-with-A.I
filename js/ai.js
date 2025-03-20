class AI {
    constructor() {
        this.BOARD_SIZE = 8;
    }

    evaluateBoard(board) {
        let score = 0;
        board.forEach((row, i) => {
            row.forEach(piece => {
                if (piece.includes('B')) {
                    score += 10;
                    if (piece.includes('K')) score += 5;
                    score += i; // Bonus for advancing pieces
                } else if (piece.includes('R')) {
                    score -= 10;
                    if (piece.includes('K')) score -= 5;
                    score -= (7 - i); // Bonus for advancing pieces
                }
            });
        });
        return score;
    }

    getValidMoves(board, pos) {
        const piece = board[pos.row][pos.col];
        if (!piece || !piece.includes('B')) return [];

        const moves = [];
        const isKing = piece.includes('K');
        const directions = isKing ? [-1, 1] : [1];

        // Regular moves
        directions.forEach(dRow => {
            [-1, 1].forEach(dCol => {
                const newRow = pos.row + dRow;
                const newCol = pos.col + dCol;
                if (this.isValidPosition(newRow, newCol) && board[newRow][newCol] === '') {
                    moves.push(new Position(newRow, newCol));
                }
            });
        });

        // Multiple jumps for kings
        if (isKing) {
            this.findMultipleJumps(board, pos, moves, new Set());
        } else {
            // Single jumps for regular pieces
            directions.forEach(dRow => {
                [-1, 1].forEach(dCol => {
                    const midRow = pos.row + dRow;
                    const midCol = pos.col + dCol;
                    const endRow = midRow + dRow;
                    const endCol = midCol + dCol;

                    if (this.isValidPosition(endRow, endCol) &&
                        board[endRow][endCol] === '' &&
                        board[midRow][midCol] !== '' &&
                        board[midRow][midCol].includes('R')) {
                        moves.push(new Position(endRow, endCol));
                    }
                });
            });
        }

        return moves;
    }

    findMultipleJumps(board, pos, moves, visited) {
        const key = `${pos.row},${pos.col}`;
        if (visited.has(key)) return;
        visited.add(key);

        [-1, 1].forEach(dRow => {
            [-1, 1].forEach(dCol => {
                const midRow = pos.row + dRow;
                const midCol = pos.col + dCol;
                const endRow = midRow + dRow;
                const endCol = midCol + dCol;

                if (this.isValidPosition(endRow, endCol) &&
                    board[endRow][endCol] === '' &&
                    board[midRow][midCol] !== '' &&
                    board[midRow][midCol].includes('R')) {
                    
                    moves.push(new Position(endRow, endCol));
                    
                    // Create a new board state for recursive check
                    const newBoard = board.map(row => [...row]);
                    newBoard[endRow][endCol] = newBoard[pos.row][pos.col];
                    newBoard[pos.row][pos.col] = '';
                    newBoard[midRow][midCol] = '';
                    
                    // Recursively find more jumps
                    this.findMultipleJumps(newBoard, new Position(endRow, endCol), moves, visited);
                }
            });
        });
    }

    minimax(board, depth, alpha, beta, isMaximizing) {
        if (depth === 0) {
            return { score: this.evaluateBoard(board) };
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            let bestMove = undefined;

            for (let row = 0; row < this.BOARD_SIZE; row++) {
                for (let col = 0; col < this.BOARD_SIZE; col++) {
                    if (board[row][col].includes('B')) {
                        const moves = this.getValidMoves(board, new Position(row, col));
                        
                        for (const move of moves) {
                            const newBoard = board.map(r => [...r]);
                            newBoard[move.row][move.col] = newBoard[row][col];
                            newBoard[row][col] = '';
                            
                            if (Math.abs(move.row - row) === 2) {
                                const midRow = (row + move.row) / 2;
                                const midCol = (col + move.col) / 2;
                                newBoard[midRow][midCol] = '';
                            }

                            const { score } = this.minimax(newBoard, depth - 1, alpha, beta, false);
                            
                            if (score > bestScore) {
                                bestScore = score;
                                bestMove = { from: new Position(row, col), to: move };
                            }
                            alpha = Math.max(alpha, bestScore);
                            if (beta <= alpha) break;
                        }
                    }
                }
            }
            return { score: bestScore, move: bestMove };
        } else {
            let bestScore = Infinity;
            let bestMove = undefined;

            for (let row = 0; row < this.BOARD_SIZE; row++) {
                for (let col = 0; col < this.BOARD_SIZE; col++) {
                    if (board[row][col].includes('R')) {
                        const moves = this.getValidMoves(board, new Position(row, col));
                        
                        for (const move of moves) {
                            const newBoard = board.map(r => [...r]);
                            newBoard[move.row][move.col] = newBoard[row][col];
                            newBoard[row][col] = '';
                            
                            if (Math.abs(move.row - row) === 2) {
                                const midRow = (row + move.row) / 2;
                                const midCol = (col + move.col) / 2;
                                newBoard[midRow][midCol] = '';
                            }

                            const { score } = this.minimax(newBoard, depth - 1, alpha, beta, true);
                            
                            if (score < bestScore) {
                                bestScore = score;
                                bestMove = { from: new Position(row, col), to: move };
                            }
                            beta = Math.min(beta, bestScore);
                            if (beta <= alpha) break;
                        }
                    }
                }
            }
            return { score: bestScore, move: bestMove };
        }
    }

    makeMove(board) {
        const { move } = this.minimax(board, 3, -Infinity, Infinity, true);
        return move;
    }

    isValidPosition(row, col) {
        return row >= 0 && row < this.BOARD_SIZE && col >= 0 && col < this.BOARD_SIZE;
    }
}