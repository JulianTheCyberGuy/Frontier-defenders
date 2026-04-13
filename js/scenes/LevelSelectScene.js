import GameScene from "./GameScene.js";

export default class LevelSelectScene {
    constructor(canvas, sceneManager) {
        this.canvas = canvas;
        this.sceneManager = sceneManager;

        this.levelButtons = [
            { id: 0, label: "Forest Road", x: 340, y: 200 },
            { id: 1, label: "Ruined Keep", x: 340, y: 280 }
        ];

        canvas.addEventListener("click", this.handleClick.bind(this));
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        for (const btn of this.levelButtons) {
            if (
                x >= btn.x &&
                x <= btn.x + 280 &&
                y >= btn.y &&
                y <= btn.y + 50
            ) {
                const gameScene = new GameScene(this.canvas);
                gameScene.loadLevel(btn.id);
                this.sceneManager.changeScene(gameScene);
            }
        }
    }

    update() {}

    render(ctx) {
        ctx.fillStyle = "#111";
        ctx.fillRect(0, 0, 960, 540);

        ctx.fillStyle = "white";
        ctx.font = "36px Arial";
        ctx.fillText("Select Level", 360, 120);

        for (const btn of this.levelButtons) {
            ctx.fillStyle = "#2c6e49";
            ctx.fillRect(btn.x, btn.y, 280, 50);

            ctx.fillStyle = "white";
            ctx.font = "18px Arial";
            ctx.fillText(btn.label, btn.x + 20, btn.y + 30);
        }
    }
}