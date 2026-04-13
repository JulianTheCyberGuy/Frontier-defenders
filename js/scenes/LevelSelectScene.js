import GameScene from "./GameScene.js";
import MainMenuScene from "./MainMenuScene.js";
import UIRenderer from "../ui/UIRenderer.js";

export default class LevelSelectScene {
    constructor(canvas, sceneManager, soundManager) {
        this.canvas = canvas;
        this.sceneManager = sceneManager;
        this.soundManager = soundManager;
        this.ui = new UIRenderer(canvas);
        this.layout = this.ui.getLevelSelectLayout(3);

        this.levelButtons = [
            {
                id: 0,
                label: "Forest Road",
                subtitle: "Balanced route with open sight lines",
                terrain: "Steady pacing",
                waves: "Good for learning timings",
                accent: "#6ee7b7"
            },
            {
                id: 1,
                label: "Ruined Keep",
                subtitle: "Compressed turns and denser pressure",
                terrain: "Mid-lane bends",
                waves: "Punishes weak coverage",
                accent: "#93c5fd"
            },
            {
                id: 2,
                label: "Lava Dungeon Gate",
                subtitle: "Harsh route with punishing late lanes",
                terrain: "Tight checkpoints",
                waves: "High damage race",
                accent: "#fca5a5"
            }
        ];

        this.hoveredId = null;
        this.time = 0;
        this.introFade = 1;
        this.handleClick = this.handleClick.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
    }

    onEnter() {
        this.refreshLayout();
        this.canvas.addEventListener("click", this.handleClick);
        this.canvas.addEventListener("mousemove", this.handleMouseMove);
    }

    onExit() {
        this.canvas.removeEventListener("click", this.handleClick);
        this.canvas.removeEventListener("mousemove", this.handleMouseMove);
        this.canvas.style.cursor = "default";
    }

    refreshLayout() {
        this.layout = this.ui.getLevelSelectLayout(this.levelButtons.length);
    }

    getHoveredButton(x, y) {
        const { backButton, cards } = this.layout;

        if (x >= backButton.x && x <= backButton.x + backButton.width && y >= backButton.y && y <= backButton.y + backButton.height) {
            return "back";
        }

        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            if (x >= card.x && x <= card.x + card.width && y >= card.y && y <= card.y + card.height) {
                return `level-${this.levelButtons[i].id}`;
            }
        }

        return null;
    }

    handleClick(event) {
        this.refreshLayout();
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
        this.refreshLayout();
        const { x, y } = this.ui.getPointerPosition(event);
        this.hoveredId = this.getHoveredButton(x, y);
        this.canvas.style.cursor = this.hoveredId ? "pointer" : "default";
    }

    update(dt = 0) {
        this.time += dt;
        this.introFade = Math.max(0, this.introFade - dt * 1.5);
    }

    render(ctx) {
        this.refreshLayout();
        const { frame, header, cards, backButton } = this.layout;

        this.ui.drawBackdrop(ctx, {
            top: "#0b1425",
            bottom: "#05080f",
            accent: "rgba(127, 179, 255, 0.16)"
        });

        this.ui.drawPanel(ctx, frame.x, frame.y, frame.width, frame.height, {
            radius: 30,
            fill: "rgba(7, 12, 22, 0.8)",
            border: "rgba(255,255,255,0.1)",
            glow: "rgba(96, 165, 250, 0.1)"
        });

        this.ui.drawButton(ctx, backButton, "Main Menu", {
            hovered: this.hoveredId === "back",
            radius: 16,
            font: "600 14px Inter"
        });

        ctx.save();
        ctx.textAlign = "center";
        ctx.fillStyle = "#f8fbff";
        ctx.font = "700 38px Cinzel";
        ctx.fillText("Choose Your Front", header.x + header.width / 2, header.y + 34);
        ctx.fillStyle = "rgba(228, 236, 248, 0.74)";
        ctx.font = "500 16px Inter";
        ctx.fillText("Each battlefield shifts your spacing, tower value, and wave pressure.", header.x + header.width / 2, header.y + 62);
        ctx.restore();

        this.levelButtons.forEach((button, index) => {
            const card = cards[index];
            const hovered = this.hoveredId === `level-${button.id}`;

            this.ui.drawPanel(ctx, card.x, card.y, card.width, card.height, {
                radius: 26,
                fill: hovered ? "rgba(13, 22, 37, 0.96)" : "rgba(10, 17, 29, 0.9)",
                border: hovered ? "rgba(191, 219, 254, 0.32)" : "rgba(255, 255, 255, 0.1)",
                glow: hovered ? "rgba(96, 165, 250, 0.22)" : "rgba(0,0,0,0)"
            });

            ctx.save();
            const floatY = Math.sin(this.time * 1.1 + index * 0.85) * 7;
            ctx.fillStyle = `${button.accent}26`;
            ctx.beginPath();
            ctx.arc(card.x + card.width - 48, card.y + 42 + floatY, 44, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = button.accent;
            ctx.beginPath();
            ctx.arc(card.x + 36, card.y + 40, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            ctx.save();
            ctx.fillStyle = "#f8fbff";
            ctx.font = "700 23px Cinzel";
            ctx.fillText(button.label, card.x + 26, card.y + 60);
            ctx.fillStyle = "rgba(228, 236, 248, 0.78)";
            ctx.font = "500 14px Inter";
            ctx.fillText(button.subtitle, card.x + 26, card.y + 92);
            ctx.fillStyle = "rgba(194, 206, 223, 0.72)";
            ctx.fillText(button.terrain, card.x + 26, card.y + 148);
            ctx.fillText(button.waves, card.x + 26, card.y + 174);
            ctx.restore();

            ctx.save();
            ctx.font = "600 12px Inter";
            this.ui.drawPill(ctx, card.x + 26, card.y + 208, `Level ${index + 1}`, {
                minWidth: 82,
                height: 30,
                active: hovered
            });
            this.ui.drawPill(ctx, card.x + 118, card.y + 208, index === 0 ? "Recommended start" : "Advanced route", {
                minWidth: 134,
                height: 30
            });
            ctx.restore();

            this.ui.drawButton(ctx, {
                x: card.x + 22,
                y: card.y + card.height - 60,
                width: card.width - 44,
                height: 42
            }, "Deploy Here", {
                hovered,
                active: hovered,
                radius: 16,
                font: "700 14px Inter"
            });
        });

        if (this.introFade > 0) {
            ctx.save();
            ctx.globalAlpha = this.introFade;
            ctx.fillStyle = "#04070d";
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.restore();
        }
    }
}

