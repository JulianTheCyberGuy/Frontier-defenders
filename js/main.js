import Game from "./engine/Game.js";
import MainMenuScene from "./scenes/MainMenuScene.js";
import SoundManager from "./engine/SoundManager.js";
import { DESIGN_HEIGHT, DESIGN_WIDTH } from "./config.js";

const canvas = document.getElementById("gameCanvas");
const viewport = document.getElementById("gameViewport");

canvas.logicalWidth = DESIGN_WIDTH;
canvas.logicalHeight = DESIGN_HEIGHT;
canvas.renderScale = Math.min(window.devicePixelRatio || 1, 2);
canvas.width = Math.round(DESIGN_WIDTH * canvas.renderScale);
canvas.height = Math.round(DESIGN_HEIGHT * canvas.renderScale);
canvas.style.touchAction = "none";

function resizeCanvasDisplay() {
    const viewportWidth = Math.max(window.innerWidth - 32, 320);
    const viewportHeight = Math.max(window.innerHeight - 32, 240);
    const aspectRatio = DESIGN_WIDTH / DESIGN_HEIGHT;

    let displayWidth = viewportWidth;
    let displayHeight = displayWidth / aspectRatio;

    if (displayHeight > viewportHeight) {
        displayHeight = viewportHeight;
        displayWidth = displayHeight * aspectRatio;
    }

    const widthPx = `${Math.floor(displayWidth)}px`;
    const heightPx = `${Math.floor(displayHeight)}px`;
    viewport.style.width = widthPx;
    viewport.style.height = heightPx;
    canvas.style.width = widthPx;
    canvas.style.height = heightPx;

    const nextScale = Math.min(window.devicePixelRatio || 1, 2);
    if (nextScale !== canvas.renderScale) {
        canvas.renderScale = nextScale;
        canvas.width = Math.round(DESIGN_WIDTH * canvas.renderScale);
        canvas.height = Math.round(DESIGN_HEIGHT * canvas.renderScale);
    }
}

resizeCanvasDisplay();
window.addEventListener("resize", resizeCanvasDisplay);

const game = new Game(canvas);
const soundManager = new SoundManager();

game.sceneManager.changeScene(
    new MainMenuScene(canvas, game.sceneManager, soundManager)
);

game.start();
