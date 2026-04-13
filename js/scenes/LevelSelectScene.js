import GameScene from "./GameScene.js";
import MainMenuScene from "./MainMenuScene.js";
import UIRenderer from "../ui/UIRenderer.js";

export default class LevelSelectScene {
    constructor(canvas, sceneManager, soundManager) {
        this.canvas = canvas;
        this.sceneManager = sceneManager;
        this.soundManager = soundManager;
        this.ui = new UIRenderer(canvas);

        this.levelButtons = [
            {
                id: 0,
                label: "Forest Road",
                subtitle: "Balanced route with clean sight lines",
                accent: "rgba(74, 222, 128, 0.18)",
                x: 120,
                y: 174,
                width: 220,
                height: 184
            },
            {
                id: 1,
                label: "Ruined Keep",
                subtitle: "Tighter turns and denser pressure",
                accent: "rgba(96, 165, 250, 0.18)",
                x: 370,
                y: 174,
                width: 220,
                height: 184
            },
            {
                id: 2,
                label: "Lava Dungeon Gate",
                subtitle: "Harsh terrain and punishing waves",
                accent: "rgba(248, 113, 113, 0.18)",
                x: 620,
                y: 174,
                width: 220,
                height: 184
            }
        ];

        this.backButton = { x: 32, y: 28, width: 118, height: 42 };
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
        this.canvas.style.cursor = "default";
    }

    getHoveredButton(x, y) {
        if (x >= this.backButton.x && x <= this.backButton.x + this.backButton.width && y >= this.backButton.y && y <= this.backButton.y + this.backButton.height) {
            return "back";
        }

        for (const button of this.levelButtons) {
            if (x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height) {
                return `level-${button.id}`;
            }
        }

        return null;
    }

    handleClick(event) {
        const { x, y } = this.ui.getPointerPosition(event);
        const hovered = this.getHoveredButton(x, y);

        if (hovered === "back") {
            this.soundManager.playClick();
            this.sceneManager.changeScene(new MainMenuScene(this.canvas, this.sceneManager, this.soundManager));
            return;
        }

        for (const button of this.levelButtons) {
            if (hovered === `level-${button.id}`) {
                this.soundManager.playConfirm();
                const gameScene = new GameScene(this.canvas, this.sceneManager, this.soundManager);
                gameScene.loadLevel(button.id);
                this.sceneManager.changeScene(gameScene);
                return;
            }
        }
    }

    handleMouseMove(event) {
        const { x, y } = this.ui.getPointerPosition(event);
        this.hoveredId = this.getHoveredButton(x, y);
        this.canvas.style.cursor = this.hoveredId ? "pointer" : "default";
    }

    update() {}

    render(ctx) {
        this.ui.drawBackdrop(ctx, {
            top: "#0d1424",
            bottom: "#060a12",
            accent: "rgba(96, 165, 250, 0.14)"
        });

        this.ui.drawButton(ctx, this.backButton, "Main Menu", {
            hovered: this.hoveredId === "back",
            radius: 14,
            font: "600 14px Inter"
        });

        ctx.save();
        ctx.textAlign = "center";
        ctx.fillStyle = "#f8fbff";
        ctx.font = "700 38px Cinzel";
        ctx.fillText("Choose Your Front", 480, 102);
        ctx.fillStyle = "rgba(228, 236, 248, 0.74)";
        ctx.font = "500 16px Inter";
        ctx.fillText("Each battlefield has its own pacing, spacing, and pressure points.", 480, 132);
        ctx.restore();

        this.levelButtons.forEach((button, index) => {
            const hovered = this.hoveredId === `level-${button.id}`;
            this.ui.drawPanel(ctx, button.x, button.y, button.width, button.height, {
                radius: 24,
                fill: hovered ? "rgba(15, 24, 39, 0.96)" : "rgba(10, 17, 29, 0.84)",
                border: hovered ? "rgba(191, 219, 254, 0.32)" : "rgba(255, 255, 255, 0.1)",
                glow: hovered ? "rgba(96, 165, 250, 0.2)" : "rgba(0,0,0,0)"
            });

            ctx.save();
            ctx.fillStyle = button.accent;
            ctx.beginPath();
            ctx.arc(button.x + button.width - 34, button.y + 32, 36, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            ctx.save();
            ctx.fillStyle = "#f8fbff";
            ctx.font = "700 24px Cinzel";
            ctx.fillText(button.label, button.x + 22, button.y + 50);
            ctx.fillStyle = "rgba(228, 236, 248, 0.78)";
            ctx.font = "500 14px Inter";
            ctx.fillText(button.subtitle, button.x + 22, button.y + 80);
            ctx.restore();

            this.ui.drawButton(ctx, {
                x: button.x + 22,
                y: button.y + 124,
                width: button.width - 44,
                height: 42
            }, `Enter Level ${index + 1}`, {
                hovered,
                active: hovered,
                radius: 14,
                font: "700 14px Inter"
            });
        });
    }
}
