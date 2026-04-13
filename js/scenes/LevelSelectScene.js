import GameScene from "./GameScene.js";
import MainMenuScene from "./MainMenuScene.js";
import UIRenderer from "../ui/UIRenderer.js";

export default class LevelSelectScene {
    constructor(canvas, sceneManager, soundManager, domUi) {
        this.canvas = canvas;
        this.sceneManager = sceneManager;
        this.soundManager = soundManager;
        this.domUi = domUi;
        this.ui = new UIRenderer(canvas);

        this.levelButtons = [
            {
                id: 0,
                label: "Forest Road",
                subtitle: "Balanced route with open sight lines",
                terrain: "Steady pacing and easier lane reads.",
                waves: "Best starting point for learning timing and tower coverage.",
                accent: "#6ee7b7",
                locked: false
            },
            {
                id: 1,
                label: "Ruined Keep",
                subtitle: "Compressed turns and denser pressure",
                terrain: "Mid-lane bends create tighter reaction windows.",
                waves: "Punishes weak coverage and rewards better placement.",
                accent: "#93c5fd",
                locked: false
            },
            {
                id: 2,
                label: "Lava Dungeon Gate",
                subtitle: "Harsh route with punishing late pressure",
                terrain: "Tight checkpoints and high-risk lane control.",
                waves: "Strongest difficulty spike with harsher mistakes.",
                accent: "#fca5a5",
                locked: false
            }
        ];
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
        this.domUi.showLevelSelect({
            levels: this.levelButtons,
            soundManager: this.soundManager,
            onBack: () => {
                this.soundManager.playClick();
                this.sceneManager.changeScene(new MainMenuScene(this.canvas, this.sceneManager, this.soundManager, this.domUi));
            },
            onPlayLevel: (levelId) => {
                this.soundManager.playConfirm();
                const gameScene = new GameScene(this.canvas, this.sceneManager, this.soundManager, this.domUi);
                gameScene.loadLevel(levelId);
                this.sceneManager.changeScene(gameScene);
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
            top: "#0b1425",
            bottom: "#05080f",
            accent: "rgba(137, 179, 255, 0.14)"
        });
    }
}
