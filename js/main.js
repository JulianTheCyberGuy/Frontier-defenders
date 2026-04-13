import Game from "./engine/Game.js";
import MainMenuScene from "./scenes/MainMenuScene.js";
import SoundManager from "./engine/SoundManager.js";
import { DESIGN_HEIGHT, DESIGN_WIDTH } from "./config.js";

const canvas = document.getElementById("gameCanvas");
canvas.logicalWidth = DESIGN_WIDTH;
canvas.logicalHeight = DESIGN_HEIGHT;
canvas.style.touchAction = "none";

function applyCanvasResolution() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.renderScale = dpr;
    canvas.width = Math.round(DESIGN_WIDTH * dpr);
    canvas.height = Math.round(DESIGN_HEIGHT * dpr);
}

function resizeCanvasDisplay() {
    const shellPadding = window.innerWidth <= 900 ? 24 : 36;
    const viewportWidth = Math.max(window.innerWidth - shellPadding, 320);
    const viewportHeight = Math.max(window.innerHeight - shellPadding, 240);
    const aspectRatio = DESIGN_WIDTH / DESIGN_HEIGHT;

    let displayWidth = viewportWidth;
    let displayHeight = displayWidth / aspectRatio;

    if (displayHeight > viewportHeight) {
        displayHeight = viewportHeight;
        displayWidth = displayHeight * aspectRatio;
    }

    canvas.style.width = `${Math.floor(displayWidth)}px`;
    canvas.style.height = `${Math.floor(displayHeight)}px`;
    applyCanvasResolution();
}

resizeCanvasDisplay();
window.addEventListener("resize", resizeCanvasDisplay);

const game = new Game(canvas);
const soundManager = new SoundManager();

game.sceneManager.changeScene(
    new MainMenuScene(canvas, game.sceneManager, soundManager)
);

game.start();
