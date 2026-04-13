import LevelSelectScene from "./LevelSelectScene.js";
import UIRenderer from "../ui/UIRenderer.js";

export default class MainMenuScene {
    constructor(canvas, sceneManager, soundManager) {
        this.canvas = canvas;
        this.sceneManager = sceneManager;
        this.soundManager = soundManager;
        this.ui = new UIRenderer(canvas);
        this.hoveredId = null;
        this.layout = this.ui.getMainMenuLayout();
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
        this.layout = this.ui.getMainMenuLayout();
    }

    getButtonAt(x, y) {
        for (const [id, button] of Object.entries(this.layout.buttons)) {
            if (x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height) {
                return id;
            }
        }
        return null;
    }

    openLevelSelect() {
        this.sceneManager.changeScene(new LevelSelectScene(this.canvas, this.sceneManager, this.soundManager));
    }

    handleClick(event) {
        this.refreshLayout();
        const { x, y } = this.ui.getPointerPosition(event);
        const action = this.getButtonAt(x, y);

        if (!action) return;

        this.soundManager.playConfirm();
        this.openLevelSelect();
    }

    handleMouseMove(event) {
        this.refreshLayout();
        const { x, y } = this.ui.getPointerPosition(event);
        this.hoveredId = this.getButtonAt(x, y);
        this.canvas.style.cursor = this.hoveredId ? "pointer" : "default";
    }

    update(dt = 0) {
        this.time += dt;
        this.introFade = Math.max(0, this.introFade - dt * 1.4);
    }

    render(ctx) {
        this.refreshLayout();
        const { frame, hero, featurePanel, infoPanel, buttons, featurePills } = this.layout;

        this.ui.drawBackdrop(ctx, {
            top: "#08111e",
            bottom: "#05080f",
            accent: "rgba(74, 222, 128, 0.12)"
        });

        this.ui.drawPanel(ctx, frame.x, frame.y, frame.width, frame.height, {
            radius: 30,
            fill: "rgba(7, 12, 22, 0.78)",
            border: "rgba(255, 255, 255, 0.1)",
            glow: "rgba(56, 189, 248, 0.1)"
        });

        this.ui.drawPanel(ctx, hero.x, hero.y, hero.width, hero.height, {
            radius: 28,
            fill: "rgba(9, 16, 29, 0.9)",
            border: "rgba(198, 223, 255, 0.12)",
            glow: "rgba(74, 222, 128, 0.08)"
        });

        ctx.save();
        const floatA = Math.sin(this.time * 1.15) * 8;
        const floatB = Math.cos(this.time * 0.9) * 10;
        ctx.fillStyle = "rgba(126, 240, 194, 0.14)";
        ctx.beginPath();
        ctx.arc(hero.x + hero.width - 92, hero.y + 86 + floatA, 64, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(127, 179, 255, 0.12)";
        ctx.beginPath();
        ctx.arc(hero.x + 88, hero.y + hero.height - 92 + floatB, 84, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.textAlign = "left";
        ctx.fillStyle = "#f8fbff";
        ctx.font = "700 14px Inter";
        ctx.fillText("TACTICAL FANTASY DEFENSE", hero.x + 28, hero.y + 48);
        ctx.font = "700 56px Cinzel";
        ctx.fillText("Frontier", hero.x + 28, hero.y + 112);
        ctx.fillText("Defenders", hero.x + 28, hero.y + 166);
        ctx.fillStyle = "rgba(228, 236, 248, 0.78)";
        ctx.font = "500 18px Inter";
        ctx.fillText("Hold the line with sharp tower builds,", hero.x + 28, hero.y + 208);
        ctx.fillText("clean placement choices, and disciplined upgrades.", hero.x + 28, hero.y + 234);
        ctx.restore();

        this.ui.drawButton(ctx, buttons.start, "Start Campaign", {
            hovered: this.hoveredId === "start",
            active: true,
            radius: 18,
            font: "700 16px Inter"
        });
        this.ui.drawButton(ctx, buttons.levels, "Level Select", {
            hovered: this.hoveredId === "levels",
            radius: 18,
            font: "700 16px Inter"
        });

        ctx.save();
        ctx.font = "600 13px Inter";
        this.ui.drawPill(ctx, featurePills[0].x, featurePills[0].y, "Responsive canvas scaling", {
            minWidth: featurePills[0].width,
            height: featurePills[0].height,
            active: true
        });
        this.ui.drawPill(ctx, featurePills[1].x, featurePills[1].y, "Refreshed HUD layout", {
            minWidth: featurePills[1].width,
            height: featurePills[1].height
        });
        this.ui.drawPill(ctx, featurePills[2].x, featurePills[2].y, "Cleaner menu presentation", {
            minWidth: featurePills[2].width,
            height: featurePills[2].height
        });
        ctx.restore();

        this.ui.drawPanel(ctx, featurePanel.x, featurePanel.y, featurePanel.width, featurePanel.height, {
            radius: 24,
            fill: "rgba(10, 17, 29, 0.9)",
            border: "rgba(255,255,255,0.1)",
            glow: "rgba(127, 179, 255, 0.08)"
        });

        ctx.save();
        ctx.fillStyle = "#f8fbff";
        ctx.font = "700 15px Inter";
        ctx.fillText("Current Build Highlights", featurePanel.x + 20, featurePanel.y + 34);
        ctx.fillStyle = "rgba(228, 236, 248, 0.76)";
        ctx.font = "500 14px Inter";
        ctx.fillText("5 tower classes with branching upgrades", featurePanel.x + 20, featurePanel.y + 74);
        ctx.fillText("Status effects, splash hits, and combat feedback", featurePanel.x + 20, featurePanel.y + 104);
        ctx.fillText("Three handcrafted battlefields and custom wave sets", featurePanel.x + 20, featurePanel.y + 134);
        ctx.fillText("Modernized scene flow with cleaner UI spacing", featurePanel.x + 20, featurePanel.y + 164);
        ctx.restore();

        this.ui.drawPanel(ctx, infoPanel.x, infoPanel.y, infoPanel.width, infoPanel.height, {
            radius: 24,
            fill: "rgba(9, 15, 26, 0.9)",
            border: "rgba(255,255,255,0.1)",
            glow: "rgba(126, 240, 194, 0.08)"
        });

        ctx.save();
        ctx.fillStyle = "#f8fbff";
        ctx.font = "700 15px Inter";
        ctx.fillText("Command Brief", infoPanel.x + 20, infoPanel.y + 34);
        ctx.fillStyle = "rgba(228, 236, 248, 0.76)";
        ctx.font = "500 14px Inter";
        ctx.fillText("Choose a battlefield, build inside marked circles,", infoPanel.x + 20, infoPanel.y + 74);
        ctx.fillText("and keep enemies from reaching the end of the road.", infoPanel.x + 20, infoPanel.y + 98);
        ctx.fillText("Gold funds new towers and upgrades. Lost lives end the run.", infoPanel.x + 20, infoPanel.y + 134);
        ctx.fillText("Hover towers and enemies in battle for quick stat readouts.", infoPanel.x + 20, infoPanel.y + 158);
        ctx.restore();

        if (this.introFade > 0) {
            ctx.save();
            ctx.globalAlpha = this.introFade;
            ctx.fillStyle = '#04070d';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.restore();
        }
    }
}
