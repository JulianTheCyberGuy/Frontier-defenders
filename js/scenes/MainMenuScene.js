import GameScene from "./GameScene.js";
import LevelSelectScene from "./LevelSelectScene.js";
import UIRenderer from "../ui/UIRenderer.js";

export default class MainMenuScene {
    constructor(canvas, sceneManager, soundManager, domUi) {
        this.canvas = canvas;
        this.sceneManager = sceneManager;
        this.soundManager = soundManager;
        this.domUi = domUi;
        this.ui = new UIRenderer(canvas);
    }

    onEnter() {
        this.canvas.style.cursor = "default";
        this.soundManager.startMenuMusic();
        this.renderDom();
    }

    onExit() {
        this.domUi.hide();
        this.canvas.style.cursor = "default";
    }

    renderDom() {
        this.domUi.showMainMenu({
            soundManager: this.soundManager,
            onPlay: () => {
                this.soundManager.playConfirm();
                const gameScene = new GameScene(this.canvas, this.sceneManager, this.soundManager, this.domUi);
                gameScene.loadLevel(0);
                this.sceneManager.changeScene(gameScene);
            },
            onLevelSelect: () => {
                this.soundManager.playConfirm();
                this.sceneManager.changeScene(new LevelSelectScene(this.canvas, this.sceneManager, this.soundManager, this.domUi));
            },
            onOpenSettings: () => {
                this.soundManager.playClick();
                this.domUi.openSettings(() => this.renderDom());
            }
        });
    }

    update() {}

    render(ctx) {
        this.ui.drawBackdrop(ctx, {
            top: "#08111e",
            bottom: "#05080f",
            accent: "rgba(214, 176, 106, 0.12)"
        });
    }
}
