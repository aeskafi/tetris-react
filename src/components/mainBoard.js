import React, { useCallback, useEffect, useState, useRef } from 'react';
import Sketch from 'react-p5';
import { sound } from '../utils/sound';

const CANVAS_SIZE = [600, 540];
const COLORS = [
    '#ecb5ff',
    '#ffa0ab',
    '#8cffb4',
    '#ff8666',
    '#80c3f5',
    '#c2e77d',
    '#fdf9a1',
];

const DARK_COLOR = '#092e1d';
const LIGHT_COLOR = '#344c57';
const BG_COLOR = '#ecf4cb';
const GRID_SPACE = 30;
const GAME_EDGE_LEFT = 150;
const GAME_EDGE_RIGHT = 450;

let FALLING_PIECE;
let CURRENT_SCORE = 0;
let CURRENT_LEVEL = 1;
let LINES_CLEARED = 0;
let HIGH_SCORE = 0;
try {
    HIGH_SCORE = parseInt(localStorage.getItem('tetris_high_score') || '0', 10) || 0;
} catch (e) {}

let GRID_PIECES = [];
let LINE_FADES = [];
let GRID_WORKERS = [];

let TICKS = 0;
let UPDATE_EVERY = 15;
let UPDATE_EVERY_CURRENT = 15;
let FALLING_SPEED = GRID_SPACE * 0.5;
let P5_INSTANCE = null;

const MainBoard = () => {
    const [pauseGame, setPauseGame] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [isMuted, setIsMuted] = useState(sound.isMuted);

    const pauseGameRef = useRef(pauseGame);
    pauseGameRef.current = pauseGame;

    const gameOverRef = useRef(gameOver);
    gameOverRef.current = gameOver;

    const sendInput = useCallback((keyCode) => {
        sound.initBGM();
        if (gameOverRef.current) {
            if (keyCode === 82) {
                // 'R' key restarts game
                restartGame();
            }
            return;
        }

        if (keyCode === 80) {
            // 'P' key toggles pause
            togglePause();
            return;
        }

        if (!pauseGameRef.current && FALLING_PIECE) {
            FALLING_PIECE.input(keyCode);
        }
    }, []);

    const keyPressed = useCallback((event) => {
        sendInput(event.keyCode);
    }, [sendInput]);

    useEffect(() => {
        document.addEventListener('keydown', keyPressed, false);
        return () => {
            document.removeEventListener('keydown', keyPressed, false);
        };
    }, [keyPressed]);

    const togglePause = () => {
        sound.playClick();
        setPauseGame((prev) => !prev);
    };

    const toggleSound = () => {
        const muted = sound.toggleMute();
        setIsMuted(muted);
    };

    const restartGame = () => {
        sound.playClick();
        CURRENT_SCORE = 0;
        CURRENT_LEVEL = 1;
        LINES_CLEARED = 0;
        GRID_PIECES = [];
        LINE_FADES = [];
        GRID_WORKERS = [];
        TICKS = 0;
        UPDATE_EVERY_CURRENT = 15;
        UPDATE_EVERY = 15;
        setGameOver(false);
        setPauseGame(false);

        if (P5_INSTANCE && FALLING_PIECE) {
            FALLING_PIECE.resetPiece(P5_INSTANCE);
        }
    };

    const drawRight = (p5) => {
        // Right side information box drawing
        p5.background(BG_COLOR);
        p5.fill(25);
        p5.noStroke();
        p5.rect(GAME_EDGE_RIGHT, 0, 150, CANVAS_SIZE[0]);

        p5.fill(BG_COLOR);
        // Score rectangle
        p5.rect(450, 40, 150, 60);
        // Best score rectangle
        p5.rect(460, 110, 130, 50, 5, 5);
        // Level rectangle
        p5.rect(460, 170, 130, 50, 5, 5);
        // Lines rectangle
        p5.rect(460, 230, 130, 50, 5, 5);
        // Next piece rectangle
        p5.rect(460, 290, 130, 130, 5, 5);

        p5.fill(LIGHT_COLOR);
        // Score lines
        p5.rect(450, 45, 150, 16);
        p5.rect(450, 70, 150, 3);
        p5.rect(450, 95, 150, 3);

        p5.fill(BG_COLOR);
        // Score banner
        p5.rect(460, 20, 130, 32, 5, 5);

        p5.strokeWeight(3);
        p5.noFill();
        p5.stroke(LIGHT_COLOR);
        // Score banner inner rectangle
        p5.rect(465, 24, 120, 24, 5, 5);

        // Best score inner rectangle
        p5.stroke(LIGHT_COLOR);
        p5.rect(465, 114, 120, 42, 5, 5);
        // Level inner rectangle
        p5.rect(465, 174, 120, 42, 5, 5);
        // Lines inner rectangle
        p5.rect(465, 234, 120, 42, 5, 5);
        // Next piece inner rectangle
        p5.rect(465, 295, 120, 120, 5, 5);

        // Draw info labels
        p5.fill(25);
        p5.noStroke();
        p5.textSize(20);
        p5.textAlign('center');
        p5.text('Score', 525, 42);
        p5.text('Best', 525, 130);
        p5.text('Level', 525, 192);
        p5.text('Lines', 525, 252);

        // Draw info numbers
        p5.textSize(20);
        p5.textAlign('right');
        p5.text(CURRENT_SCORE, 560, 85);
        p5.text(HIGH_SCORE, 560, 150);
        p5.text(CURRENT_LEVEL, 560, 210);
        p5.text(LINES_CLEARED, 560, 270);

        p5.stroke(DARK_COLOR);
        p5.line(GAME_EDGE_RIGHT, 0, GAME_EDGE_RIGHT, CANVAS_SIZE[0]);
    };

    const drawLeft = (p5) => {
        // Left side controls guide
        p5.fill(25);
        p5.noStroke();
        p5.rect(0, 0, GAME_EDGE_LEFT, CANVAS_SIZE[0]);

        p5.textAlign('center');
        p5.fill(255);
        p5.noStroke();
        p5.textSize(13);
        p5.text('CONTROLS:\n\n← → : Move\n↑ / Space : Rotate\n↓ : Soft Drop\n\nP : Pause\nR : Restart', 75, 180);
    };

    const drawGameOver = (p5) => {
        p5.fill(DARK_COLOR);
        p5.textSize(54);
        p5.textAlign('center');
        p5.text('Game\nOver!', 300, 250);
        p5.textSize(20);
        p5.text('Press R to Restart', 300, 360);
    };

    const drawPaused = (p5) => {
        p5.fill(DARK_COLOR);
        p5.textSize(48);
        p5.textAlign('center');
        p5.text('PAUSED', 300, 260);
    };

    const setup = (p5, canvasParentRef) => {
        P5_INSTANCE = p5;
        p5.createCanvas(CANVAS_SIZE[0], CANVAS_SIZE[1]).parent(canvasParentRef);
        FALLING_PIECE = new playPiece(p5);
        FALLING_PIECE.resetPiece(p5);
        p5.textFont('Trebuchet MS');
    };

    const draw = (p5) => {
        drawRight(p5);
        drawLeft(p5);

        if (gameOver) {
            drawGameOver(p5);
        } else if (pauseGame) {
            drawPaused(p5);
        }

        if (FALLING_PIECE) {
            FALLING_PIECE.show();
        }

        if (!pauseGame && !gameOver) {
            TICKS++;
            if (TICKS >= UPDATE_EVERY) {
                TICKS = 0;
                if (FALLING_PIECE) {
                    FALLING_PIECE.fall(FALLING_SPEED);
                }
            }
        }

        for (let i = 0; i < GRID_PIECES.length; i++) {
            GRID_PIECES[i].show();
        }

        for (let i = 0; i < LINE_FADES.length; i++) {
            LINE_FADES[i].show();
        }

        if (GRID_WORKERS.length > 0) {
            GRID_WORKERS[0].work();
        }
    };

    class lineBar {
        constructor(p5, y, index) {
            this.pos = new p5.createVector(GAME_EDGE_LEFT, y);
            this.width = GAME_EDGE_RIGHT - GAME_EDGE_LEFT;
            this.index = index;

            this.show = function () {
                p5.fill(255);
                p5.noStroke();
                p5.rect(this.pos.x, this.pos.y, this.width, GRID_SPACE);

                if (this.width + this.pos.x > this.pos.x) {
                    this.width -= 10;
                    this.pos.x += 5;
                } else {
                    LINE_FADES.splice(this.index, 1);
                    GRID_WORKERS.push(new worker(this.pos.y, GRID_SPACE));
                }
            };
        }
    }

    class playPiece {
        constructor(p5) {
            this.pos = new p5.createVector(0, 0);
            this.rotation = 0;
            this.nextPieceType = Math.floor(Math.random() * 7);
            this.nextPieces = [];
            this.pieceType = 0;
            this.pieces = [];
            this.orientation = [];
            this.fallen = false;

            this.nextPiece = function (p5) {
                this.nextPieceType = pseudoRandom(this.pieceType);
                this.nextPieces = [];

                const points = orientPoints(this.nextPieceType, 0);
                let xx = 525;
                const yy = 355;

                if (this.nextPieceType !== 0 && this.nextPieceType !== 3) {
                    xx += GRID_SPACE * 0.5;
                }

                for (let i = 0; i < 4; i++) {
                    this.nextPieces.push(
                        new square(
                            p5,
                            xx + points[i][0] * GRID_SPACE,
                            yy + points[i][1] * GRID_SPACE,
                            this.nextPieceType
                        )
                    );
                }
            };

            this.fall = function (amount) {
                if (!this.futureCollision(0, amount, this.rotation)) {
                    this.addPos(0, amount);
                    this.fallen = true;
                } else {
                    if (!this.fallen) {
                        setPauseGame(true);
                        setGameOver(true);
                        sound.playGameOver();
                    } else {
                        sound.playDrop();
                        this.commitShape();
                    }
                }
            };

            this.resetPiece = function (p5) {
                this.rotation = 0;
                this.fallen = false;
                this.pos.x = 330;
                this.pos.y = -60;

                this.pieceType = this.nextPieceType;
                this.nextPiece(p5);
                this.newPoints(p5);
            };

            this.newPoints = function (p5) {
                const points = orientPoints(this.pieceType, this.rotation);
                this.orientation = points;
                this.pieces = [];
                for (let i = 0; i < 4; i++) {
                    this.pieces.push(
                        new square(
                            p5,
                            this.pos.x + points[i][0] * GRID_SPACE,
                            this.pos.y + points[i][1] * GRID_SPACE,
                            this.pieceType
                        )
                    );
                }
            };

            this.updatePoints = function () {
                if (this.pieces) {
                    const points = orientPoints(this.pieceType, this.rotation);
                    this.orientation = points;
                    for (let i = 0; i < 4; i++) {
                        this.pieces[i].pos.x = this.pos.x + points[i][0] * GRID_SPACE;
                        this.pieces[i].pos.y = this.pos.y + points[i][1] * GRID_SPACE;
                    }
                }
            };

            this.addPos = function (x, y) {
                this.pos.x += x;
                this.pos.y += y;

                if (this.pieces) {
                    for (let i = 0; i < 4; i++) {
                        this.pieces[i].pos.x += x;
                        this.pieces[i].pos.y += y;
                    }
                }
            };

            this.futureCollision = function (x, y, rotation) {
                let points = 0;
                if (rotation !== this.rotation) {
                    points = orientPoints(this.pieceType, rotation);
                }

                for (let i = 0; i < this.pieces.length; i++) {
                    const xx = points
                        ? this.pos.x + points[i][0] * GRID_SPACE
                        : this.pieces[i].pos.x + x;
                    const yy = points
                        ? this.pos.y + points[i][1] * GRID_SPACE
                        : this.pieces[i].pos.y + y;

                    if (
                        xx < GAME_EDGE_LEFT ||
                        xx + GRID_SPACE > GAME_EDGE_RIGHT ||
                        yy + GRID_SPACE > CANVAS_SIZE[1]
                    ) {
                        return true;
                    }

                    for (let j = 0; j < GRID_PIECES.length; j++) {
                        if (xx === GRID_PIECES[j].pos.x) {
                            if (
                                yy >= GRID_PIECES[j].pos.y &&
                                yy < GRID_PIECES[j].pos.y + GRID_SPACE
                            ) {
                                return true;
                            }
                            if (
                                yy + GRID_SPACE > GRID_PIECES[j].pos.y &&
                                yy + GRID_SPACE <= GRID_PIECES[j].pos.y + GRID_SPACE
                            ) {
                                return true;
                            }
                        }
                    }
                }
                return false;
            };

            this.input = function (code) {
                UPDATE_EVERY = UPDATE_EVERY_CURRENT;
                let rotation = this.rotation + 1;
                switch (code) {
                    case 32: // SpaceBar: Rotate or Hard Drop
                    case 38: // UpArrow
                    case 87: // 'W'
                        if (rotation > 3) rotation = 0;
                        if (!this.futureCollision(GRID_SPACE, 0, rotation)) {
                            this.rotate();
                            sound.playRotate();
                        }
                        break;
                    case 37: // LeftArrow
                    case 65: // 'A'
                        if (!this.futureCollision(-GRID_SPACE, 0, this.rotation)) {
                            this.addPos(-GRID_SPACE, 0);
                            sound.playMove();
                        }
                        break;
                    case 39: // RightArrow
                    case 68: // 'D'
                        if (!this.futureCollision(GRID_SPACE, 0, this.rotation)) {
                            this.addPos(GRID_SPACE, 0);
                            sound.playMove();
                        }
                        break;
                    case 40: // DownArrow
                    case 83: // 'S'
                        UPDATE_EVERY = 2;
                        sound.playMove();
                        break;
                    default:
                        break;
                }
            };

            this.rotate = function () {
                this.rotation += 1;
                if (this.rotation > 3) this.rotation = 0;
                this.updatePoints();
            };

            this.show = function () {
                for (let i = 0; i < this.pieces.length; i++) {
                    this.pieces[i].show();
                }
                for (let j = 0; j < this.nextPieces.length; j++) {
                    this.nextPieces[j].show();
                }
            };

            this.commitShape = function () {
                for (let i = 0; i < this.pieces.length; i++) {
                    GRID_PIECES.push(this.pieces[i]);
                }
                this.resetPiece(p5);
                analyzeGrid(p5);
            };
        }
    }

    class square {
        constructor(p5, x, y, type) {
            this.pos = new p5.createVector(x, y);
            this.type = type;

            this.show = function () {
                p5.strokeWeight(2);
                p5.fill(COLORS[this.type]);
                p5.stroke(25);
                p5.rect(this.pos.x, this.pos.y, GRID_SPACE - 1, GRID_SPACE - 1);

                p5.noStroke();
                p5.fill(255);
                p5.rect(this.pos.x + 6, this.pos.y + 6, 18, 2);
                p5.rect(this.pos.x + 6, this.pos.y + 6, 2, 16);
                p5.fill(25);
                p5.rect(this.pos.x + 6, this.pos.y + 20, 18, 2);
                p5.rect(this.pos.x + 22, this.pos.y + 6, 2, 16);
            };
        }
    }

    function pseudoRandom(previous) {
        let roll = Math.floor(Math.random() * 8);
        if (roll === previous || roll === 7) {
            roll = Math.floor(Math.random() * 7);
        }
        return roll;
    }

    function analyzeGrid(p5) {
        let linesCount = 0;
        let score = 0;
        while (checkLines(p5)) {
            linesCount += 1;
            score += 100;
            LINES_CLEARED += 1;
            if (LINES_CLEARED % 10 === 0) {
                CURRENT_LEVEL += 1;
                if (UPDATE_EVERY_CURRENT > 4) {
                    UPDATE_EVERY_CURRENT -= 1;
                }
            }
        }
        if (score > 100) {
            score *= 2;
        }
        CURRENT_SCORE += score;

        if (linesCount > 0) {
            sound.playLineClear(linesCount);
        }

        if (CURRENT_SCORE > HIGH_SCORE) {
            HIGH_SCORE = CURRENT_SCORE;
            try {
                localStorage.setItem('tetris_high_score', HIGH_SCORE.toString());
            } catch (e) {}
        }
    }

    function checkLines(p5) {
        let count = 0;
        let runningY = -1;
        let runningIndex = -1;

        GRID_PIECES.sort((a, b) => (a.pos.y !== b.pos.y ? a.pos.y - b.pos.y : a.pos.x - b.pos.x));

        for (let i = 0; i < GRID_PIECES.length; i++) {
            if (GRID_PIECES[i].pos.y === runningY) {
                count++;
                if (count === 10) {
                    GRID_PIECES.splice(runningIndex, 10);
                    LINE_FADES.push(new lineBar(p5, runningY, LINE_FADES.length));
                    return true;
                }
            } else {
                runningY = GRID_PIECES[i].pos.y;
                count = 1;
                runningIndex = i;
            }
        }
        return false;
    }

    class worker {
        constructor(y, amount) {
            this.amountY = amount;
            this.targetY = y;

            this.work = function () {
                for (let i = 0; i < GRID_PIECES.length; i++) {
                    if (GRID_PIECES[i].pos.y < this.targetY) {
                        GRID_PIECES[i].pos.y += 5;
                    }
                }
                this.amountY -= 5;
                if (this.amountY <= 0) {
                    GRID_WORKERS.shift();
                }
            };
        }
    }

    function orientPoints(pieceType, rotation) {
        const OP = [
            [ // Piece Type 0 (I)
                [[-2, 0], [-1, 0], [0, 0], [1, 0]],
                [[0, -1], [0, 0], [0, 1], [0, 2]],
                [[-2, 0], [-1, 0], [0, 0], [1, 0]],
                [[0, -1], [0, 0], [0, 1], [0, 2]],
            ],
            [ // Piece Type 1 (J)
                [[-2, -1], [-2, 0], [-1, 0], [0, 0]],
                [[-1, -1], [-1, 0], [-1, 1], [-2, 1]],
                [[-2, 0], [-1, 0], [0, 0], [0, 1]],
                [[0, -1], [-1, -1], [-1, 0], [-1, 1]],
            ],
            [ // Piece Type 2 (L)
                [[0, -1], [-2, 0], [-1, 0], [0, 0]],
                [[-1, -1], [-1, 0], [-1, 1], [0, 1]],
                [[-2, 0], [-1, 0], [0, 0], [-2, 1]],
                [[-2, -1], [-1, -1], [-1, 0], [-1, 1]],
            ],
            [ // Piece Type 3 (O)
                [[-1, -1], [0, -1], [-1, 0], [0, 0]],
            ],
            [ // Piece Type 4 (S)
                [[-1, -1], [0, -1], [-2, 0], [-1, 0]],
                [[-1, -1], [-1, 0], [0, 0], [0, 1]],
                [[-1, -1], [0, -1], [-2, 0], [-1, 0]],
                [[-1, -1], [-1, 0], [0, 0], [0, 1]],
            ],
            [ // Piece Type 5 (T)
                [[-2, 0], [-1, 0], [-1, -1], [0, 0]],
                [[-1, -1], [-1, 0], [-1, 1], [0, 0]],
                [[-2, 0], [-1, 0], [0, 0], [-1, 1]],
                [[-2, 0], [-1, -1], [-1, 0], [-1, 1]],
            ],
            [ // Piece Type 6 (Z)
                [[-2, -1], [-1, -1], [-1, 0], [0, 0]],
                [[-1, 0], [-1, 1], [0, 0], [0, -1]],
                [[-2, -1], [-1, -1], [-1, 0], [0, 0]],
                [[-1, 0], [-1, 1], [0, 0], [0, -1]],
            ],
        ];
        return OP[pieceType][(pieceType === 3 && rotation > 0) ? 0 : rotation];
    }

    return (
        <div className="tetris-wrapper">
            {/* Header with Title and Control Toolbar */}
            <header className="tetris-header">
                <div className="brand-section">
                    <h1 className="tetris-title">TETRIS 2D</h1>
                    <p className="tetris-subtitle">Classic Retro Block Puzzle</p>
                </div>

                <div className="tetris-toolbar">
                    <button
                        className="toolbar-btn btn-primary"
                        onClick={restartGame}
                        title="Restart Game (R)"
                    >
                        <span>🔄 New Game</span>
                    </button>
                    <button
                        className="toolbar-btn"
                        onClick={togglePause}
                        title="Pause / Resume (P)"
                    >
                        <span>{pauseGame ? '▶️ Resume' : '⏸️ Pause'}</span>
                    </button>
                    <button
                        className="toolbar-btn"
                        onClick={toggleSound}
                        title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
                    >
                        <span>{isMuted ? '🔇 Muted' : '🔊 Sound'}</span>
                    </button>
                </div>
            </header>

            {/* Canvas Card */}
            <div className="canvas-card">
                <Sketch setup={setup} draw={draw} />
            </div>

            {/* Virtual Directional D-Pad for Mobile */}
            <div className="virtual-dpad">
                <div className="dpad-row">
                    <button
                        className="dpad-btn up"
                        onClick={() => sendInput(38)}
                        aria-label="Rotate Block"
                    >
                        ↻
                    </button>
                </div>
                <div className="dpad-row">
                    <button
                        className="dpad-btn left"
                        onClick={() => sendInput(37)}
                        aria-label="Move Left"
                    >
                        ◀
                    </button>
                    <button
                        className="dpad-btn down"
                        onClick={() => sendInput(40)}
                        aria-label="Soft Drop"
                    >
                        ▼
                    </button>
                    <button
                        className="dpad-btn right"
                        onClick={() => sendInput(39)}
                        aria-label="Move Right"
                    >
                        ▶
                    </button>
                </div>
            </div>

            {/* Navigation hints */}
            <footer className="tetris-footer">
                <p>
                    💡 <kbd>←</kbd> <kbd>→</kbd> Move • <kbd>↑</kbd> Rotate •{' '}
                    <kbd>↓</kbd> Soft Drop • <kbd>P</kbd> Pause • <kbd>R</kbd> Restart
                </p>
            </footer>
        </div>
    );
};

export default MainBoard;