import LevelSelectScene from "./LevelSelectScene.js";

export default class MainMenuScene {
    constructor(canvas, sceneManager, soundManager) {
        this.canvas = canvas;
        this.sceneManager = sceneManager;
        this.soundManager = soundManager;

        this.button = {
            x: 380,
            y: 240,
            width: 200,
            height: 60
        };
        this.volumeButton = { x: 820, y: 20, width: 120, height: 34 };

        this.hovered = false;
        this.volumeHovered = false;

        this.handleClick = this.handleClick.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
    }

    onEnter() {
        this.canvas.addEventListener("click", this.handleClick);
        this.canvas.addEventListener("mousemove", this.handleMouseMove);
        this.soundManager.startMenuMusic();
    }

    onExit() {
        this.canvas.removeEventListener("click", this.handleClick);
        this.canvas.removeEventListener("mousemove", this.handleMouseMove);
    }

    isInsideButton(x, y) {
        return (
            x >= this.button.x &&
            x <= this.button.x + this.button.width &&
            y >= this.button.y &&
            y <= this.button.y + this.button.height
        );
    }

    isInsideVolumeButton(x, y) {
        return (
            x >= this.volumeButton.x &&
            x <= this.volumeButton.x + this.volumeButton.width &&
            y >= this.volumeButton.y &&
            y <= this.volumeButton.y + this.volumeButton.height
        );
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.isInsideVolumeButton(x, y)) {
            this.soundManager.cycleVolume();
            return;
        }

        if (this.isInsideButton(x, y)) {
            this.soundManager.playConfirm();
            this.sceneManager.changeScene(
                new LevelSelectScene(this.canvas, this.sceneManager, this.soundManager)
            );
        }
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.hovered = this.isInsideButton(x, y);
        this.volumeHovered = this.isInsideVolumeButton(x, y);
        this.canvas.style.cursor = this.hovered || this.volumeHovered ? "pointer" : "default";
    }

    update() {}

    render(ctx) {
        ctx.fillStyle = "#111";
        ctx.fillRect(0, 0, 960, 540);

        ctx.fillStyle = "white";
        ctx.font = "48px Arial";
        ctx.fillText("Frontier Defenders", 220, 150);

        ctx.fillStyle = this.hovered ? "#3f8a5f" : "#2c6e49";
        ctx.fillRect(this.button.x, this.button.y, this.button.width, this.button.height);

        ctx.strokeStyle = this.hovered ? "#d9f5e5" : "white";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.button.x, this.button.y, this.button.width, this.button.height);

        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.fillText("Start Game", this.button.x + 30, this.button.y + 38);
    }
}