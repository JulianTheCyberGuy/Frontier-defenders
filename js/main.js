import Game from "./engine/Game.js";
import MainMenuScene from "./scenes/MainMenuScene.js";
import SoundManager from "./engine/SoundManager.js";

const canvas = document.getElementById("gameCanvas");
canvas.width = 960;
canvas.height = 540;

const game = new Game(canvas);
const soundManager = new SoundManager();

game.sceneManager.changeScene(
    new MainMenuScene(canvas, game.sceneManager, soundManager)
);

game.start();