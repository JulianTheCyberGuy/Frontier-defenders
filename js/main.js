import Game from "./engine/Game.js";
import MainMenuScene from "./scenes/MainMenuScene.js";
import SoundManager from "./engine/SoundManager.js";
import DomUI from "./ui/DomUI.js";
import { DESIGN_HEIGHT, DESIGN_WIDTH } from "./config.js";

const canvas = document.getElementById("gameCanvas");
const viewport = document.getElementById("gameViewport");
const domUiRoot = document.getElementById("dom-ui-root");

canvas.width = DESIGN_WIDTH;
canvas.height = DESIGN_HEIGHT;
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

    if (viewport) {
        viewport.style.width = widthPx;
        viewport.style.height = heightPx;
    }

    canvas.style.width = widthPx;
    canvas.style.height = heightPx;
}

resizeCanvasDisplay();
window.addEventListener("resize", resizeCanvasDisplay);

const game = new Game(canvas);
const soundManager = new SoundManager();
const domUi = new DomUI(domUiRoot);

game.sceneManager.changeScene(
    new MainMenuScene(canvas, game.sceneManager, soundManager, domUi)
);

game.start();
