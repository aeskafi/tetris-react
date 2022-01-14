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
} from './init';
import Sketch from "react-p5";

let x = 50;
let y = 50;

const MainBoard = () => {

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
    }

    const drawLeft = (p5) => {
        // Left side information box drawing
        p5.fill(25);
        p5.noStroke();
        p5.rect(0, 0, GAME_EDGE_LEFT, CANVAS_SIZE[0])
    }

    const setup = (p5, canvasParentRef) => {
        p5.createCanvas(CANVAS_SIZE[0], CANVAS_SIZE[1]).parent(canvasParentRef)
    };

    const draw = (p5) => {
        drawRight(p5)
        drawLeft(p5)
    };


    return (
        <Sketch setup={setup} draw={draw} />
    )
}

export default MainBoard;