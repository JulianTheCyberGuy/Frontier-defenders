import LevelSelectScene from "./LevelSelectScene.js";
import UIRenderer from "../ui/UIRenderer.js";

export default class MainMenuScene {
    constructor(canvas, sceneManager, soundManager) {
        this.canvas = canvas;
        this.sceneManager = sceneManager;
        this.soundManager = soundManager;
        this.ui = new UIRenderer(canvas);

        this.buttons = {
            start: { x: 380, y: 294, width: 200, height: 54 },
            info: { x: 380, y: 360, width: 200, height: 46 }
        };

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

    getButtonAt(x, y) {
        for (const [id, button] of Object.entries(this.buttons)) {
            if (x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height) {
                return id;
            }
        }
        return null;
    }

    handleClick(event) {
        const { x, y } = this.ui.getPointerPosition(event);
        const action = this.getButtonAt(x, y);

        if (action === "start") {
            this.soundManager.playConfirm();
            this.sceneManager.changeScene(new LevelSelectScene(this.canvas, this.sceneManager, this.soundManager));
        }
    }

    handleMouseMove(event) {
        const { x, y } = this.ui.getPointerPosition(event);
        this.hoveredId = this.getButtonAt(x, y);
        this.canvas.style.cursor = this.hoveredId === "start" ? "pointer" : "default";
    }

    update() {}

    render(ctx) {
        this.ui.drawBackdrop(ctx, {
            top: "#0f1729",
            bottom: "#070b13",
            accent: "rgba(64, 145, 108, 0.18)"
        });

        this.ui.drawPanel(ctx, 150, 78, 660, 382, {
            radius: 28,
            fill: "rgba(8, 13, 23, 0.82)",
            border: "rgba(255, 255, 255, 0.12)",
            glow: "rgba(66, 153, 225, 0.12)"
        });

        ctx.save();
        ctx.textAlign = "center";
        ctx.fillStyle = "#f8fbff";
        ctx.font = "700 18px Inter";
        ctx.fillText("TACTICAL FANTASY TOWER DEFENSE", 480, 142);
        ctx.font = "700 54px Cinzel";
        ctx.fillText("Frontier Defenders", 480, 212);
        ctx.fillStyle = "rgba(228, 236, 248, 0.78)";
        ctx.font = "500 17px Inter";
        ctx.fillText("Build your line, hold the path, and push back the siege.", 480, 252);
        ctx.restore();

        this.ui.drawButton(ctx, this.buttons.start, "Start Campaign", {
            hovered: this.hoveredId === "start",
            active: true,
            radius: 18,
            font: "700 16px Inter"
        });

        this.ui.drawButton(ctx, this.buttons.info, "3 handcrafted levels • 5 towers", {
            hovered: false,
            radius: 16,
            font: "600 14px Inter",
            disabled: true
        });

        ctx.save();
        ctx.font = "600 13px Inter";
        this.ui.drawPill(ctx, 246, 404, "Responsive screen scaling", { active: true, minWidth: 186, height: 32 });
        this.ui.drawPill(ctx, 444, 404, "Modern HUD refresh", { minWidth: 162, height: 32 });
        this.ui.drawPill(ctx, 618, 404, "Cleaner combat UI", { minWidth: 154, height: 32 });
        ctx.restore();
    }
}
