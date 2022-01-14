import React, {useEffect, useRef, useState} from 'react'
import {
    CANVAS_SIZE,
    SCALE,
    COLORS,
    DARK_COLOR,
    LIGHT_COLOR,
    BG_COLOR,
    GAME_EDGE_LEFT,
    GAME_EDGE_RIGHT,
    CURRENT_LEVEL,
    CURRENT_SCORE,
    LINES_CLEARED,
} from './init';
import Sketch from "react-p5";

const MainBoard = () => {

    const [gameOver, setGameOver] = useState(false);

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
    };

    const draw = (p5) => {
        drawRight(p5)
        drawLeft(p5)

        gameOver && drawGameOver(p5)
    };


    return (
        <Sketch setup={setup} draw={draw} />
    )
}

export default MainBoard;