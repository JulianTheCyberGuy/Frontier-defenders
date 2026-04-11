import Game from "./engine/Game.js";
import GameScene from "./scenes/GameScene.js";

const canvas = document.getElementById("gameCanvas");
canvas.width = 960;
canvas.height = 540;

const game = new Game(canvas);
game.sceneManager.changeScene(new GameScene(canvas));

game.start();
