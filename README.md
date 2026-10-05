# 🕹️ Tetris 2D

> A sleek, responsive, retro-arcade Tetris web app built with React, p5.js, and a zero-dependency procedural Web Audio synthesizer.

[![React](https://img.shields.io/badge/React-17.0.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![p5.js](https://img.shields.io/badge/p5.js-1.4.0-ED225D?style=flat-square&logo=p5.js&logoColor=white)](https://p5js.org/)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio-Procedural%20SFX-orange?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

---

## ✨ Features

- **Classic Arcade Physics**: Authentic 10×20 block grid with full 7-tetromino rotation matrix (I, J, L, O, S, T, Z) and soft-drop mechanics.
- **Procedural Web Audio Engine**: Zero-asset, zero-latency retro sound effects (move, rotate, hard-drop, multi-line clear, game over) and an 8-bit procedural arcade BGM track synthesized entirely in code.
- **Persistent High Scores**: Automatically saves and updates your personal best to browser `localStorage`.
- **Responsive Mobile D-Pad**: Touch-optimized virtual directional keypad alongside desktop keyboard controls (`←`, `→`, `↑`, `↓`, `P`, `R`).
- **Dynamic Viewport Scaling**: Responsive CSS and canvas scaling ensure crisp rendering on mobile screens, tablets, and desktop displays without layout clipping.
- **Audio Toolbar & Controls**: Instant mute/unmute toggle, pause/resume, and instant new game resets.

---

## 🎮 Controls

| Action | Keyboard | Mobile D-Pad |
|---|---|---|
| **Move Left / Right** | `←` / `→` or `A` / `D` | ◀ / ▶ |
| **Rotate Piece** | `↑` or `W` | ↻ |
| **Soft Drop** | `↓` or `S` | ▼ |
| **Pause / Resume** | `P` | Pause Button |
| **Restart Game** | `R` | New Game Button |

---

## 🚀 Quickstart Guide

Get up and running locally in three quick steps:

### 1. Clone the repository
```bash
git clone https://github.com/aeskafi/tetris-react.git
cd tetris-react
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the development server
```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser and start stacking blocks!

To build for production:
```bash
npm run build
```

---

## 🛠️ Tech Stack

- **Framework**: React 17
- **Canvas Rendering Engine**: p5.js + `react-p5`
- **Audio**: Web Audio API (procedural oscillator sound synthesis & arcade soundtrack)
- **Styling**: Modern CSS3 (CSS variables, flexbox, glassmorphism UI)
- **Testing**: Jest + React Testing Library

---

## 👨‍💻 Author & Mission

Crafted by **[Arham Eskafi](https://arham.dev)** — Rapid MVP Specialist and Tech Nomad.

Follow the overland journey, engineering logs, and culinary adventures across continents on **[Walk Cook Live](https://youtube.com/@walkcooklive)**.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
