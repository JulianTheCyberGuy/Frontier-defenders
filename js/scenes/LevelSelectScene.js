import GameScene from "./GameScene.js";
import MainMenuScene from "./MainMenuScene.js";

export default class LevelSelectScene {
    constructor(canvas, sceneManager, soundManager) {
        this.canvas = canvas;
        this.sceneManager = sceneManager;
        this.soundManager = soundManager;

        this.levelButtons = [
            { id: 0, label: "Forest Road", x: 340, y: 190, width: 280, height: 50 },
            { id: 1, label: "Ruined Keep", x: 340, y: 270, width: 280, height: 50 }
        ];

        this.backButton = { x: 20, y: 20, width: 120, height: 40 };
        this.hoveredId = null;

        this.handleClick = this.handleClick.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
    }

    onEnter() {
        this.canvas.addEventListener("click", this.handleClick);
        this.canvas.addEventListener("mousemove", this.handleMouseMove);
    }

    onExit() {
        this.canvas.removeEventListener("click", this.handleClick);
        this.canvas.removeEventListener("mousemove", this.handleMouseMove);
    }

    getHoveredButton(x, y) {
        if (
            x >= this.backButton.x &&
            x <= this.backButton.x + this.backButton.width &&
            y >= this.backButton.y &&
            y <= this.backButton.y + this.backButton.height
        ) {
            return "back";
        }

        for (const button of this.levelButtons) {
            if (
                x >= button.x &&
                x <= button.x + button.width &&
                y >= button.y &&
                y <= button.y + button.height
            ) {
                return `level-${button.id}`;
            }
        }

        return null;
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const hovered = this.getHoveredButton(x, y);

        if (hovered === "back") {
            this.soundManager.playClick();
            this.sceneManager.changeScene(
                new MainMenuScene(this.canvas, this.sceneManager, this.soundManager)
            );
            return;
        }

        for (const btn of this.levelButtons) {
            if (hovered === `level-${btn.id}`) {
                this.soundManager.playConfirm();
                const gameScene = new GameScene(this.canvas, this.sceneManager, this.soundManager);
                gameScene.loadLevel(btn.id);
                this.sceneManager.changeScene(gameScene);
                return;
            }
        }
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.hoveredId = this.getHoveredButton(x, y);
        this.canvas.style.cursor = this.hoveredId ? "pointer" : "default";
    }

    update() {}

    render(ctx) {
        ctx.fillStyle = "#111";
        ctx.fillRect(0, 0, 960, 540);

        ctx.fillStyle = "white";
        ctx.font = "36px Arial";
        ctx.fillText("Select Level", 360, 120);

        const backHovered = this.hoveredId === "back";
        ctx.fillStyle = backHovered ? "#666" : "#444";
        ctx.fillRect(this.backButton.x, this.backButton.y, this.backButton.width, this.backButton.height);

        ctx.strokeStyle = "white";
        ctx.strokeRect(this.backButton.x, this.backButton.y, this.backButton.width, this.backButton.height);

        ctx.fillStyle = "white";
        ctx.font = "18px Arial";
        ctx.fillText("Main Menu", this.backButton.x + 18, this.backButton.y + 26);

        for (const btn of this.levelButtons) {
            const hovered = this.hoveredId === `level-${btn.id}`;

            ctx.fillStyle = hovered ? "#3f8a5f" : "#2c6e49";
            ctx.fillRect(btn.x, btn.y, btn.width, btn.height);

            ctx.strokeStyle = hovered ? "#d9f5e5" : "white";
            ctx.strokeRect(btn.x, btn.y, btn.width, btn.height);

            ctx.fillStyle = "white";
            ctx.font = "18px Arial";
            ctx.fillText(btn.label, btn.x + 20, btn.y + 30);
        }
    }
}