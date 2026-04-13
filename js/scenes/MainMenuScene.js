import LevelSelectScene from "./LevelSelectScene.js";

export default class MainMenuScene {
    constructor(canvas, sceneManager) {
        this.canvas = canvas;
        this.sceneManager = sceneManager;

        this.button = {
            x: 380,
            y: 240,
            width: 200,
            height: 60
        };

        canvas.addEventListener("click", this.handleClick.bind(this));
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (
            x >= this.button.x &&
            x <= this.button.x + this.button.width &&
            y >= this.button.y &&
            y <= this.button.y + this.button.height
        ) {
            this.sceneManager.changeScene(
                new LevelSelectScene(this.canvas, this.sceneManager)
            );
        }
    }

    update() {}

    render(ctx) {
        ctx.fillStyle = "#111";
        ctx.fillRect(0, 0, 960, 540);

        ctx.fillStyle = "white";
        ctx.font = "48px Arial";
        ctx.fillText("Frontier Defenders", 220, 150);

        ctx.fillStyle = "#2c6e49";
        ctx.fillRect(this.button.x, this.button.y, this.button.width, this.button.height);

        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.fillText("Start Game", this.button.x + 30, this.button.y + 38);
    }
}