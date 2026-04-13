import Game from "./engine/Game.js";
import SceneManager from "./engine/SceneManager.js";
import MainMenuScene from "./scenes/MainMenuScene.js";

const canvas = document.getElementById("gameCanvas");
canvas.width = 960;
canvas.height = 540;

const game = new Game(canvas);
const sceneManager = game.sceneManager;

sceneManager.changeScene(new MainMenuScene(canvas, sceneManager));

game.start();