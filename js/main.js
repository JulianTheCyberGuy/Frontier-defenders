import Game from "./engine/Game.js";
import MainMenuScene from "./scenes/MainMenuScene.js";
import SoundManager from "./engine/SoundManager.js";
import { DESIGN_HEIGHT, DESIGN_WIDTH } from "./config.js";

const canvas = document.getElementById("gameCanvas");
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

    canvas.style.width = `${Math.floor(displayWidth)}px`;
    canvas.style.height = `${Math.floor(displayHeight)}px`;
}

resizeCanvasDisplay();
window.addEventListener("resize", resizeCanvasDisplay);

const game = new Game(canvas);
const soundManager = new SoundManager();

game.sceneManager.changeScene(
    new MainMenuScene(canvas, game.sceneManager, soundManager)
);

game.start();
