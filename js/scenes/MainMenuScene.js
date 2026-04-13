import LevelSelectScene from "./LevelSelectScene.js";
import SettingsScene from "./SettingsScene.js";
import UIRenderer from "../ui/UIRenderer.js";

export default class MainMenuScene {
    constructor(canvas, sceneManager, soundManager) {
        this.canvas = canvas;
        this.sceneManager = sceneManager;
        this.soundManager = soundManager;
        this.ui = new UIRenderer(canvas);
        this.hoveredId = null;
        this.layout = this.ui.getMainMenuLayout();

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

    handleClick(event) {
        this.refreshLayout();
        const { x, y } = this.ui.getPointerPosition(event);
        const action = this.getButtonAt(x, y);

        if (!action) return;

        if (action === "start" || action === "levels") {
            this.soundManager.playConfirm();
            this.sceneManager.changeScene(new LevelSelectScene(this.canvas, this.sceneManager, this.soundManager));
            return;
        }

        if (action === "settings") {
            this.soundManager.playClick();
            this.sceneManager.changeScene(new SettingsScene(this.canvas, this.sceneManager, this.soundManager));
        }
    }

    handleMouseMove(event) {
        this.refreshLayout();
        const { x, y } = this.ui.getPointerPosition(event);
        this.hoveredId = this.getButtonAt(x, y);
        this.canvas.style.cursor = this.hoveredId ? "pointer" : "default";
    }

    update() {}

    render(ctx) {
        this.refreshLayout();
        const { frame, hero, statusPanel, featurePanel, infoPanel, buttons, featurePills } = this.layout;

        this.ui.drawBackdrop(ctx, {
            top: "#120d17",
            bottom: "#050409",
            accent: "rgba(215, 176, 109, 0.12)",
            accentTwo: "rgba(141, 167, 255, 0.08)"
        });

        this.ui.drawPanel(ctx, frame.x, frame.y, frame.width, frame.height, {
            radius: 28,
            fill: "rgba(8, 7, 12, 0.78)",
            border: "rgba(255, 232, 196, 0.08)",
            glow: "rgba(215, 176, 109, 0.06)"
        });

        this.ui.drawPanel(ctx, hero.x, hero.y, hero.width, hero.height, {
            radius: 24,
            fill: "rgba(18, 14, 22, 0.9)",
            border: "rgba(255, 232, 196, 0.1)",
            glow: "rgba(126, 215, 178, 0.05)"
        });

        ctx.save();
        ctx.fillStyle = "rgba(215, 176, 109, 0.1)";
        ctx.beginPath();
        ctx.arc(hero.x + hero.width - 92, hero.y + 82, 56, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(141, 167, 255, 0.08)";
        ctx.beginPath();
        ctx.arc(hero.x + 88, hero.y + hero.height - 92, 72, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(126, 215, 178, 0.06)";
        ctx.beginPath();
        ctx.arc(hero.x + hero.width * 0.54, hero.y + hero.height * 0.64, 92, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.textAlign = "left";
        ctx.fillStyle = "#f8f4eb";
        ctx.font = "700 12px Inter";
        ctx.fillText("DARK FANTASY TOWER DEFENSE", hero.x + 26, hero.y + 40);
        ctx.font = "700 48px Cinzel";
        ctx.fillText("Frontier", hero.x + 26, hero.y + 102);
        ctx.fillText("Defenders", hero.x + 26, hero.y + 148);
        ctx.fillStyle = "rgba(232, 222, 205, 0.78)";
        ctx.font = "500 14px Inter";
        ctx.fillText("Hold the line, place towers with intent, and survive the push.", hero.x + 26, hero.y + 188);
        ctx.fillText("A cleaner shell now makes the game easier to read at a glance.", hero.x + 26, hero.y + 208);
        ctx.restore();

        this.ui.drawButton(ctx, buttons.start, "Play", {
            hovered: this.hoveredId === "start",
            active: true,
            radius: 16,
            font: "700 15px Inter"
        });
        this.ui.drawButton(ctx, buttons.levels, "Level Select", {
            hovered: this.hoveredId === "levels",
            radius: 16,
            font: "700 15px Inter"
        });
        this.ui.drawButton(ctx, buttons.settings, "Settings", {
            hovered: this.hoveredId === "settings",
            radius: 16,
            font: "700 15px Inter"
        });

        ctx.save();
        ctx.font = "600 12px Inter";
        this.ui.drawPill(ctx, featurePills[0].x, featurePills[0].y, "Responsive fit", {
            minWidth: featurePills[0].width,
            height: featurePills[0].height,
            active: true
        });
        this.ui.drawPill(ctx, featurePills[1].x, featurePills[1].y, "Sharper canvas", {
            minWidth: featurePills[1].width,
            height: featurePills[1].height
        });
        this.ui.drawPill(ctx, featurePills[2].x, featurePills[2].y, "Lighter UI footprint", {
            minWidth: featurePills[2].width,
            height: featurePills[2].height
        });
        ctx.restore();

        this.ui.drawPanel(ctx, statusPanel.x, statusPanel.y, statusPanel.width, statusPanel.height, {
            radius: 22,
            fill: "rgba(16, 12, 20, 0.92)",
            border: "rgba(255,232,196,0.1)",
            glow: "rgba(215, 176, 109, 0.05)"
        });

        ctx.save();
        ctx.fillStyle = "#f8f4eb";
        ctx.font = "700 14px Inter";
        ctx.fillText("Presentation Pass", statusPanel.x + 16, statusPanel.y + 28);
        ctx.fillStyle = "rgba(232, 222, 205, 0.74)";
        ctx.font = "500 12px Inter";
        ctx.fillText("Play, Level Select, and Settings now live in one clean menu flow.", statusPanel.x + 16, statusPanel.y + 58);
        ctx.fillText("The palette pushes warmer and the shell scales more cleanly.", statusPanel.x + 16, statusPanel.y + 80);
        ctx.fillText("This revision also reduces oversized UI and improves sharpness.", statusPanel.x + 16, statusPanel.y + 102);
        ctx.restore();

        this.ui.drawPanel(ctx, featurePanel.x, featurePanel.y, featurePanel.width, featurePanel.height, {
            radius: 22,
            fill: "rgba(14, 11, 18, 0.9)",
            border: "rgba(255,232,196,0.09)",
            glow: "rgba(141, 167, 255, 0.06)"
        });

        ctx.save();
        ctx.fillStyle = "#f8f4eb";
        ctx.font = "700 14px Inter";
        ctx.fillText("What Feels Better", featurePanel.x + 16, featurePanel.y + 28);
        ctx.fillStyle = "rgba(232, 222, 205, 0.74)";
        ctx.font = "500 12px Inter";
        ctx.fillText("Buttons read faster and the screen gives more space back to the game.", featurePanel.x + 16, featurePanel.y + 58);
        ctx.fillText("Panels feel more supportive instead of dominating the scene.", featurePanel.x + 16, featurePanel.y + 80);
        ctx.fillText("Sharper rendering helps the typography look more stable.", featurePanel.x + 16, featurePanel.y + 102);
        ctx.restore();

        this.ui.drawPanel(ctx, infoPanel.x, infoPanel.y, infoPanel.width, infoPanel.height, {
            radius: 22,
            fill: "rgba(12, 10, 16, 0.9)",
            border: "rgba(255,232,196,0.09)",
            glow: "rgba(126, 215, 178, 0.06)"
        });

        ctx.save();
        ctx.fillStyle = "#f8f4eb";
        ctx.font = "700 14px Inter";
        ctx.fillText("Quick Brief", infoPanel.x + 16, infoPanel.y + 28);
        ctx.fillStyle = "rgba(232, 222, 205, 0.74)";
        ctx.font = "500 12px Inter";
        ctx.fillText("Choose a battlefield, build on marked circles, and protect the exit.", infoPanel.x + 16, infoPanel.y + 56);
        ctx.fillText("Use Settings to tune volume before a run starts.", infoPanel.x + 16, infoPanel.y + 76);
        ctx.fillText("Next milestones can now focus on feedback, clarity, and progression.", infoPanel.x + 16, infoPanel.y + 96);
        ctx.restore();
    }
}
