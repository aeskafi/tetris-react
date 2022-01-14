import React, {useCallback, useEffect, useState} from 'react'
import Sketch from "react-p5";

const CANVAS_SIZE = [600, 540]
const COLORS = ['#ecb5ff',
    '#ffa0ab',
    '#8cffb4',
    '#ff8666',
    '#80c3f5',
    '#c2e77d',
    '#fdf9a1',]

const DARK_COLOR = "#092e1d" //"#071820"
const LIGHT_COLOR = "#344c57"
const BG_COLOR = "#ecf4cb"
const GRID_SPACE = 30
const GAME_EDGE_LEFT = 150
const GAME_EDGE_RIGHT = 450

var FALLING_PEACE;
var CURRENT_SCORE = 0
var CURRENT_LEVEL = 1
var LINES_CLEARED = 0
var GRID_PIECES = [];
var LINE_FADES = [];
var GRID_WORKERS = [];

var TICKS = 0;
var UPDATE_EVERY = 15;
var UPDATE_EVERY_CURRENT = 15;
var FALLING_SPEED = GRID_SPACE * 0.5;

const MainBoard = () => {
    const [pauseGame, setPauseGame] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    const keyPressed = useCallback((event) => {
        !pauseGame && FALLING_PEACE.input(event.keyCode);
    }, []);

    useEffect(() => {
        document.addEventListener("keydown", keyPressed, false);

        return () => {
            document.removeEventListener("keydown", keyPressed, false);
        };
    }, []);

    const drawRight = (p5) => {

        // Right side information box drawing
        p5.background(BG_COLOR);
        p5.fill(25);
        p5.noStroke();
        p5.rect(GAME_EDGE_RIGHT, 0, 150, CANVAS_SIZE[0])

        p5.fill(BG_COLOR)
        //Score rectangle
        p5.rect(450, 50, 150, 70);
        //Next piece rectangle
        p5.rect(460, 300, 130, 130, 5, 5);
        //Level rectangle
        p5.rect(460, 130, 130, 60, 5, 5);
        //Lines rectangle
        p5.rect(460, 200, 130, 60, 5, 5);

        p5.fill(LIGHT_COLOR);
        //Score lines
        p5.rect(450, 55, 150, 20);
        p5.rect(450, 80, 150, 4);
        p5.rect(450, 110, 150, 4);

        p5.fill(BG_COLOR);
        //Score banner
        p5.rect(460, 30, 130, 35, 5, 5);

        p5.strokeWeight(3);
        p5.noFill();
        p5.stroke(LIGHT_COLOR);
        //Score banner inner rectangle
        p5.rect(465, 35, 120, 25, 5, 5);

        //Next piece inner rectangle
        p5.stroke(LIGHT_COLOR);
        p5.rect(465, 305, 120, 120, 5, 5);
        //Level inner rectangle
        p5.rect(465, 135, 120, 50, 5, 5);
        //Lines inner rectangle
        p5.rect(465, 205, 120, 50, 5, 5);

        //Draw the info labels
        p5.fill(25);
        p5.noStroke();
        p5.textSize(24);
        p5.textAlign('center');
        p5.text("Score", 525, 55);
        p5.text("Level", 525, 158);
        p5.text("Lines", 525, 228);
        //Draw the actual info
        p5.textSize(24);
        p5.textAlign('right');

        //The score
        p5.text(CURRENT_SCORE, 560, 105);
        p5.text(CURRENT_LEVEL, 560, 180);
        p5.text(LINES_CLEARED, 560, 250);

        p5.stroke(DARK_COLOR);
        p5.line(GAME_EDGE_RIGHT, 0, GAME_EDGE_RIGHT, CANVAS_SIZE[0]);

    }

    const drawLeft = (p5) => {
        // Left side information box drawing
        p5.fill(25);
        p5.noStroke();
        p5.rect(0, 0, GAME_EDGE_LEFT, CANVAS_SIZE[0])

        //Explain the controls
        p5.textAlign('center');
        p5.fill(255);
        p5.noStroke();
        p5.textSize(14);
        p5.text("Controls:\n↑\n← ↓ →\n", 75, 175);
        p5.text("Left and Right:\nmove side to side", 75, 250);
        p5.text("Up:\nrotate", 75, 300);
        p5.text("Down:\nfall faster", 75, 350);
    }

    const drawGameOver = (p5) => {
        //Game over text
        p5.fill(DARK_COLOR);
        p5.textSize(64);
        p5.textAlign('center');
        p5.text("Game\nOver!", 300, 270);
    }

    const setup = (p5, canvasParentRef) => {
        p5.createCanvas(CANVAS_SIZE[0], CANVAS_SIZE[1]).parent(canvasParentRef)
        FALLING_PEACE = new playPiece(p5)
        FALLING_PEACE.resetPiece(p5)
        p5.textFont('Trebuchet MS')
    };

    const draw = (p5) => {
        drawRight(p5)
        drawLeft(p5)

        gameOver && drawGameOver(p5)
        FALLING_PEACE.show()

        if (!pauseGame) {
            TICKS++;
            if (TICKS >= UPDATE_EVERY) {
                TICKS = 0;
                FALLING_PEACE.fall(FALLING_SPEED);
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
                    //shiftGridDown(this.pos.y, gridSpace);
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

            // Generate next piece
            this.nextPiece = function (p5) {
                this.nextPieceType = pseudoRandom(this.pieceType);
                this.nextPieces = [];

                var points = orientPoints(this.nextPieceType, 0);
                var xx = 525, yy = 365;

                if (this.nextPieceType !== 0 && this.nextPieceType !== 3) {
                    xx += (GRID_SPACE * 0.5);
                }

                this.nextPieces.push(new square(p5, xx + points[0][0] * GRID_SPACE, yy + points[0][1] * GRID_SPACE, this.nextPieceType));
                this.nextPieces.push(new square(p5, xx + points[1][0] * GRID_SPACE, yy + points[1][1] * GRID_SPACE, this.nextPieceType));
                this.nextPieces.push(new square(p5, xx + points[2][0] * GRID_SPACE, yy + points[2][1] * GRID_SPACE, this.nextPieceType));
                this.nextPieces.push(new square(p5, xx + points[3][0] * GRID_SPACE, yy + points[3][1] * GRID_SPACE, this.nextPieceType));
            };

            // Piece is fall down
            this.fall = function (amount) {
                if (!this.futureCollision(0, amount, this.rotation)) {
                    this.addPos(0, amount);
                    this.fallen = true;
                } else {
                    //WE HIT SOMETHING D:
                    if (!this.fallen) {
                        //Game over aka pause forever
                        setPauseGame(true);
                        setGameOver(true);
                    } else {
                        this.commitShape();
                    }
                }
            };

            // Reset all pieces
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
                var points = orientPoints(this.pieceType, this.rotation);
                this.orientation = points;
                this.pieces = [];
                this.pieces.push(new square(p5, this.pos.x + points[0][0] * GRID_SPACE, this.pos.y + points[0][1] * GRID_SPACE, this.pieceType));
                this.pieces.push(new square(p5, this.pos.x + points[1][0] * GRID_SPACE, this.pos.y + points[1][1] * GRID_SPACE, this.pieceType));
                this.pieces.push(new square(p5, this.pos.x + points[2][0] * GRID_SPACE, this.pos.y + points[2][1] * GRID_SPACE, this.pieceType));
                this.pieces.push(new square(p5, this.pos.x + points[3][0] * GRID_SPACE, this.pos.y + points[3][1] * GRID_SPACE, this.pieceType));
            };

            //Whenever the piece gets rotated, this gets the new positions of the squares
            this.updatePoints = function () {
                if (this.pieces) {
                    var points = orientPoints(this.pieceType, this.rotation);
                    this.orientation = points;
                    for (var i = 0; i < 4; i++) {
                        this.pieces[i].pos.x = this.pos.x + points[i][0] * GRID_SPACE;
                        this.pieces[i].pos.y = this.pos.y + points[i][1] * GRID_SPACE;
                    }
                }
            }

            //Adds to the position of the piece and it's square objects
            this.addPos = function (x, y) {
                this.pos.x += x;
                this.pos.y += y;

                if (this.pieces) {
                    for (var i = 0; i < 4; i++) {
                        this.pieces[i].pos.x += x;
                        this.pieces[i].pos.y += y;
                    }
                }
            };

            //Checks for collisions after adding the x and y to the current positions and also applying the given rotation
            this.futureCollision = function (x, y, rotation) {
                var xx, yy, points = 0;
                if (rotation !== this.rotation) {
                    //Gets a new point orientation to check against
                    points = orientPoints(this.pieceType, rotation);
                }

                for (var i = 0; i < this.pieces.length; i++) {
                    if (points) {
                        xx = this.pos.x + points[i][0] * GRID_SPACE;
                        yy = this.pos.y + points[i][1] * GRID_SPACE;
                    } else {
                        xx = this.pieces[i].pos.x + x;
                        yy = this.pieces[i].pos.y + y;
                    }

                    //Check against walls and bottom
                    if (xx < GAME_EDGE_LEFT || xx + GRID_SPACE > GAME_EDGE_RIGHT || yy + GRID_SPACE > CANVAS_SIZE[1]) {
                        return true;
                    }

                    //Check against all pieces in the main GRID_PIECES array (stationary pieces)
                    for (var j = 0; j < GRID_PIECES.length; j++) {
                        if (xx === GRID_PIECES[j].pos.x) {
                            if (yy >= GRID_PIECES[j].pos.y && yy < GRID_PIECES[j].pos.y + GRID_SPACE) {
                                return true;
                            }
                            if (yy + GRID_SPACE > GRID_PIECES[j].pos.y && yy + GRID_SPACE <= GRID_PIECES[j].pos.y + GRID_SPACE) {
                                return true;
                            }
                        }
                    }
                }
            };

            //Handles input ;)
            this.input = function (code) {
                UPDATE_EVERY = UPDATE_EVERY_CURRENT;
                var rotation = this.rotation + 1;
                switch (code) {
                    case 32: // SpaceBar
                        if (rotation > 3) {
                            rotation = 0;
                        }
                        if (!this.futureCollision(GRID_SPACE, 0, rotation)) {
                            this.rotate();
                        }
                        break;
                    case 37: // LeftArrow
                        if (!this.futureCollision(-GRID_SPACE, 0, this.rotation))
                            this.addPos(-GRID_SPACE, 0)
                        break;
                    case 38: // UpArrow or SpaceBar
                        if (rotation > 3) {
                            rotation = 0;
                        }
                        if (!this.futureCollision(GRID_SPACE, 0, rotation)) {
                            this.rotate();
                        }
                        break;
                    case 39: // RightArrow
                        if (!this.futureCollision(GRID_SPACE, 0, this.rotation)) {
                            this.addPos(GRID_SPACE, 0)
                        }
                        break;
                    case 40: // DownArrow
                        UPDATE_EVERY = 2;
                        break;

                    default:
                        break;
                }
            }
            //Rotates the piece by one
            this.rotate = function () {
                this.rotation += 1;
                if (this.rotation > 3) {
                    this.rotation = 0;
                }
                this.updatePoints();
            }

            //Displays the piece's square objects
            this.show = function () {
                for (var i = 0; i < this.pieces.length; i++) {
                    this.pieces[i].show();
                }
                for (var j = 0; j < this.nextPieces.length; j++) {
                    this.nextPieces[j].show();
                }
            };

            //Add the pieces to the GRID_PIECES
            this.commitShape = function () {
                for (var i = 0; i < this.pieces.length; i++) {
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

    //Basically random with a bias against the same piece twice
    function pseudoRandom(previous) {
        var roll = Math.floor(Math.random() * 8);
        if (roll === previous || roll === 7) {
            roll = Math.floor(Math.random() * 7);
        }
        return roll;
    }

    //Checks until it can no longer find any horizontal staights
    function analyzeGrid(p5) {
        var score = 0;
        while (checkLines(p5)) {
            score += 100;
            LINES_CLEARED += 1;
            if (LINES_CLEARED % 10 === 0) {
                CURRENT_LEVEL += 1;
                //Increase speed here
                if (UPDATE_EVERY_CURRENT > 4) {
                    UPDATE_EVERY_CURRENT -= 1;
                }
            }
        }
        if (score > 100) {
            score *= 2;
        }
        CURRENT_SCORE += score;
    }

    function checkLines(p5) {
        var count = 0;
        var runningY = -1;
        var runningIndex = -1;

        GRID_PIECES.sort(function (a, b) {
            return a.pos.y - b.pos.y;
        });

        for (var i = 0; i < GRID_PIECES.length; i++) {
            if (GRID_PIECES[i].pos.y === runningY) {
                count++;
                if (count === 10) {
                    //YEEHAW
                    GRID_PIECES.splice(runningIndex, 10);

                    LINE_FADES.push(new lineBar(p5, runningY));
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
            this.amountActual = 0;
            this.amountTotal = amount;
            this.yVal = y;

            this.work = function () {
                if (this.amountActual < this.amountTotal) {
                    for (var j = 0; j < GRID_PIECES.length; j++) {
                        if (GRID_PIECES[j].pos.y < y) {
                            GRID_PIECES[j].pos.y += 5;
                        }
                    }
                    this.amountActual += 5;
                } else {
                    GRID_WORKERS.shift();
                }
            };
        }
    }

    //Sorts out the block positions for a given type and rotation
    function orientPoints(pieceType, rotation) {
        var OP = [
            [ // Piece Type 0
                [
                    [-2, 0],
                    [-1, 0],
                    [0, 0],
                    [1, 0]
                ],
                [
                    [0, -1],
                    [0, 0],
                    [0, 1],
                    [0, 2]
                ],
                [
                    [-2, 1],
                    [-1, 1],
                    [0, 1],
                    [1, 1]
                ],
                [
                    [-1, -1],
                    [-1, 0],
                    [-1, 1],
                    [-1, 2]
                ]
            ],
            [ // Piece Type 1
                [
                    [-2, -1],
                    [-2, 0],
                    [-1, 0],
                    [0, 0]
                ],
                [
                    [-1, -1],
                    [-1, 0],
                    [-1, 1],
                    [0, -1]
                ],
                [
                    [-2, 0],
                    [-1, 0],
                    [0, 0],
                    [0, 1]
                ],
                [
                    [-1, -1],
                    [-1, 0],
                    [-1, 1],
                    [-2, 1]
                ]
            ],
            [ // Piece Type 2
                [
                    [-2, 0],
                    [-1, 0],
                    [0, 0],
                    [0, -1]
                ],
                [
                    [-1, -1],
                    [-1, 0],
                    [-1, 1],
                    [0, 1]
                ],
                [
                    [-2, 0],
                    [-2, 1],
                    [-1, 0],
                    [0, 0]
                ],
                [
                    [-2, -1],
                    [-1, -1],
                    [-1, 0],
                    [-1, 1]
                ]
            ],
            [ // Piece Type 3
                [
                    [-1, -1],
                    [0, -1],
                    [-1, 0],
                    [0, 0]
                ]
            ],
            [ // Piece Type 4
                [
                    [-1, -1],
                    [-2, 0],
                    [-1, 0],
                    [0, -1]
                ],
                [
                    [-1, -1],
                    [-1, 0],
                    [0, 0],
                    [0, 1]
                ],
                [
                    [-1, 0],
                    [-2, 1],
                    [-1, 1],
                    [0, 0]
                ],
                [
                    [-2, -1],
                    [-2, 0],
                    [-1, 0],
                    [-1, 1]
                ]
            ],
            [ // Piece Type 5
                [
                    [-2, 0],
                    [-1, 0],
                    [-1, -1],
                    [0, 0]
                ],
                [
                    [-1, -1],
                    [-1, 0],
                    [-1, 1],
                    [0, 0]
                ],
                [
                    [-2, 0],
                    [-1, 0],
                    [0, 0],
                    [-1, 1]
                ],
                [
                    [-2, 0],
                    [-1, -1],
                    [-1, 0],
                    [-1, 1]
                ]
            ],
            [ // Piece Type 6
                [
                    [-2, -1],
                    [-1, -1],
                    [-1, 0],
                    [0, 0]
                ],
                [
                    [-1, 0],
                    [-1, 1],
                    [0, 0],
                    [0, -1]
                ],
                [
                    [-2, 0],
                    [-1, 0],
                    [-1, 1],
                    [0, 1]
                ],
                [
                    [-2, 0],
                    [-2, 1],
                    [-1, 0],
                    [-1, -1]
                ]

            ],
        ];
        return OP[pieceType][(pieceType === 3 && rotation > 0) ? 0 : rotation];
    }

    return (
        <Sketch setup={setup} draw={draw} />
    )
}

export default MainBoard;