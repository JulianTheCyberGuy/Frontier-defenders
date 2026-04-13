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
                accent: "#7ed7b2"
            },
            {
                id: 1,
                label: "Ruined Keep",
                subtitle: "Compressed turns and denser pressure",
                terrain: "Mid-lane bends",
                waves: "Punishes weak coverage",
                accent: "#8da7ff"
            },
            {
                id: 2,
                label: "Lava Dungeon Gate",
                subtitle: "Harsh route with punishing late lanes",
                terrain: "Tight checkpoints",
                waves: "High damage race",
                accent: "#d97878"
            }
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

        for (const level of this.levelButtons) {
            if (hovered === `level-${level.id}`) {
                this.soundManager.playConfirm();
                const gameScene = new GameScene(this.canvas, this.sceneManager, this.soundManager);
                gameScene.loadLevel(level.id);
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
            top: "#110d16",
            bottom: "#050409",
            accent: "rgba(215, 176, 109, 0.12)",
            accentTwo: "rgba(141, 167, 255, 0.08)"
        });

        this.ui.drawPanel(ctx, frame.x, frame.y, frame.width, frame.height, {
            radius: 30,
            fill: "rgba(9, 7, 12, 0.8)",
            border: "rgba(255, 232, 196, 0.1)",
            glow: "rgba(215, 176, 109, 0.08)"
        });

        this.ui.drawPanel(ctx, header.x, header.y, header.width, header.height, {
            radius: 24,
            fill: "rgba(17, 13, 21, 0.92)",
            border: "rgba(255,232,196,0.12)",
            glow: "rgba(141, 167, 255, 0.06)"
        });

        this.ui.drawButton(ctx, backButton, "Main Menu", {
            hovered: this.hoveredId === "back",
            radius: 14,
            font: "700 15px Inter"
        });

        ctx.save();
        ctx.fillStyle = "#f8f4eb";
        ctx.font = "700 34px Cinzel";
        ctx.fillText("Select Your Battlefield", header.x + 24, header.y + 42);
        ctx.fillStyle = "rgba(232, 222, 205, 0.76)";
        ctx.font = "500 15px Inter";
        ctx.fillText("Three handcrafted maps with different pressure patterns and pacing.", header.x + 24, header.y + 72);
        ctx.restore();

        cards.forEach((card, index) => {
            const level = this.levelButtons[index];
            const hovered = this.hoveredId === `level-${level.id}`;

            this.ui.drawPanel(ctx, card.x, card.y, card.width, card.height, {
                radius: 24,
                fill: hovered ? "rgba(27, 21, 34, 0.96)" : "rgba(16, 12, 20, 0.92)",
                border: hovered ? "rgba(255, 232, 196, 0.26)" : "rgba(255,232,196,0.12)",
                glow: hovered ? "rgba(215, 176, 109, 0.14)" : "rgba(0,0,0,0)"
            });

            ctx.save();
            ctx.fillStyle = level.accent;
            ctx.beginPath();
            ctx.arc(card.x + card.width - 42, card.y + 42, 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            ctx.save();
            ctx.fillStyle = "#f8f4eb";
            ctx.font = "700 24px Cinzel";
            ctx.fillText(level.label, card.x + 20, card.y + 44);
            ctx.fillStyle = "rgba(232, 222, 205, 0.78)";
            ctx.font = "500 14px Inter";
            ctx.fillText(level.subtitle, card.x + 20, card.y + 74);

            ctx.fillStyle = "rgba(215, 176, 109, 0.9)";
            ctx.font = "700 12px Inter";
            ctx.fillText("MAP NOTES", card.x + 20, card.y + 116);
            ctx.fillStyle = "rgba(232, 222, 205, 0.74)";
            ctx.font = "500 14px Inter";
            ctx.fillText(level.terrain, card.x + 20, card.y + 144);
            ctx.fillText(level.waves, card.x + 20, card.y + 170);

            this.ui.drawButton(ctx, {
                x: card.x + 20,
                y: card.y + card.height - 72,
                width: card.width - 40,
                height: 46
            }, "Deploy", {
                hovered,
                active: hovered,
                radius: 16,
                font: "700 15px Inter"
            });
            ctx.restore();
        });
    }
}
