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
            { id: 0, label: "Forest Road", subtitle: "Balanced route with open sight lines", terrain: "Steady pacing", waves: "Good learning map", accent: "#6ee7b7" },
            { id: 1, label: "Ruined Keep", subtitle: "Compressed turns and denser pressure", terrain: "Mid-lane bends", waves: "Punishes weak coverage", accent: "#93c5fd" },
            { id: 2, label: "Lava Dungeon Gate", subtitle: "Harsh route with punishing late lanes", terrain: "Tight checkpoints", waves: "High damage race", accent: "#fca5a5" }
        ];

        this.hoveredId = null;
        this.handleClick = this.handleClick.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
    }

    onEnter() {
        this.refreshLayout();
        this.soundManager.startMenuMusic();
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

    update() {}

    render(ctx) {
        this.refreshLayout();
        const { frame, header, cards, backButton } = this.layout;

        this.ui.drawBackdrop(ctx, {
            top: "#120d17",
            bottom: "#050409",
            accent: "rgba(141, 167, 255, 0.12)",
            accentTwo: "rgba(215, 176, 109, 0.08)"
        });

        this.ui.drawPanel(ctx, frame.x, frame.y, frame.width, frame.height, {
            radius: 28,
            fill: "rgba(8, 7, 12, 0.78)",
            border: "rgba(255,232,196,0.08)",
            glow: "rgba(141, 167, 255, 0.08)"
        });

        this.ui.drawButton(ctx, backButton, "Main Menu", {
            hovered: this.hoveredId === "back",
            radius: 14,
            font: "700 13px Inter"
        });

        ctx.save();
        ctx.textAlign = "center";
        ctx.fillStyle = "#f8f4eb";
        ctx.font = "700 28px Cinzel";
        ctx.fillText("Select Your Battlefield", header.x + header.width / 2, header.y + 30);
        ctx.fillStyle = "rgba(232, 222, 205, 0.72)";
        ctx.font = "500 13px Inter";
        ctx.fillText("Each route changes spacing, tower value, and wave pressure.", header.x + header.width / 2, header.y + 54);
        ctx.restore();

        this.levelButtons.forEach((button, index) => {
            const card = cards[index];
            const hovered = this.hoveredId === `level-${button.id}`;

            this.ui.drawPanel(ctx, card.x, card.y, card.width, card.height, {
                radius: 22,
                fill: hovered ? "rgba(18, 14, 22, 0.96)" : "rgba(14, 11, 18, 0.9)",
                border: hovered ? "rgba(255, 232, 196, 0.22)" : "rgba(255, 255, 255, 0.08)",
                glow: hovered ? "rgba(215, 176, 109, 0.12)" : "rgba(0,0,0,0)"
            });

            ctx.save();
            ctx.fillStyle = `${button.accent}24`;
            ctx.beginPath();
            ctx.arc(card.x + card.width - 40, card.y + 36, 34, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = button.accent;
            ctx.beginPath();
            ctx.arc(card.x + 28, card.y + 34, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            ctx.save();
            ctx.fillStyle = "#f8f4eb";
            ctx.font = "700 18px Cinzel";
            ctx.fillText(button.label, card.x + 20, card.y + 50);
            ctx.fillStyle = "rgba(232, 222, 205, 0.76)";
            ctx.font = "500 12px Inter";
            ctx.fillText(button.subtitle, card.x + 20, card.y + 76);
            ctx.fillStyle = "rgba(194, 206, 223, 0.68)";
            ctx.fillText(button.terrain, card.x + 20, card.y + 118);
            ctx.fillText(button.waves, card.x + 20, card.y + 138);
            ctx.restore();

            ctx.save();
            ctx.font = "600 11px Inter";
            this.ui.drawPill(ctx, card.x + 20, card.y + 164, `Level ${index + 1}`, {
                minWidth: 72,
                height: 26,
                active: hovered
            });
            this.ui.drawPill(ctx, card.x + 100, card.y + 164, index === 0 ? "Recommended" : "Advanced", {
                minWidth: 96,
                height: 26
            });
            ctx.restore();

            this.ui.drawButton(ctx, {
                x: card.x + 18,
                y: card.y + card.height - 52,
                width: card.width - 36,
                height: 38
            }, "Deploy", {
                hovered,
                active: hovered,
                radius: 14,
                font: "700 13px Inter"
            });
        });
    }
}
