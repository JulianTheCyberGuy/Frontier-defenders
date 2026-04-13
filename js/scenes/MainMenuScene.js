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
            accent: "rgba(215, 176, 109, 0.14)",
            accentTwo: "rgba(141, 167, 255, 0.1)"
        });

        this.ui.drawPanel(ctx, frame.x, frame.y, frame.width, frame.height, {
            radius: 30,
            fill: "rgba(8, 7, 12, 0.76)",
            border: "rgba(255, 232, 196, 0.1)",
            glow: "rgba(215, 176, 109, 0.08)"
        });

        this.ui.drawPanel(ctx, hero.x, hero.y, hero.width, hero.height, {
            radius: 28,
            fill: "rgba(18, 14, 22, 0.91)",
            border: "rgba(255, 232, 196, 0.12)",
            glow: "rgba(126, 215, 178, 0.06)"
        });

        ctx.save();
        ctx.fillStyle = "rgba(215, 176, 109, 0.14)";
        ctx.beginPath();
        ctx.arc(hero.x + hero.width - 96, hero.y + 94, 70, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(141, 167, 255, 0.12)";
        ctx.beginPath();
        ctx.arc(hero.x + 92, hero.y + hero.height - 98, 90, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(126, 215, 178, 0.08)";
        ctx.beginPath();
        ctx.arc(hero.x + hero.width * 0.56, hero.y + hero.height * 0.66, 120, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.textAlign = "left";
        ctx.fillStyle = "#f8f4eb";
        ctx.font = "700 14px Inter";
        ctx.fillText("DARK FANTASY TOWER DEFENSE", hero.x + 30, hero.y + 48);
        ctx.font = "700 58px Cinzel";
        ctx.fillText("Frontier", hero.x + 30, hero.y + 118);
        ctx.fillText("Defenders", hero.x + 30, hero.y + 172);
        ctx.fillStyle = "rgba(232, 222, 205, 0.8)";
        ctx.font = "500 18px Inter";
        ctx.fillText("Hold ancient roads, layer your defenses,", hero.x + 30, hero.y + 214);
        ctx.fillText("and survive each wave with cleaner tactical control.", hero.x + 30, hero.y + 240);
        ctx.restore();

        this.ui.drawButton(ctx, buttons.start, "Play", {
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
        this.ui.drawButton(ctx, buttons.settings, "Settings", {
            hovered: this.hoveredId === "settings",
            radius: 18,
            font: "700 16px Inter"
        });

        ctx.save();
        ctx.font = "600 13px Inter";
        this.ui.drawPill(ctx, featurePills[0].x, featurePills[0].y, "Responsive fit", {
            minWidth: featurePills[0].width,
            height: featurePills[0].height,
            active: true
        });
        this.ui.drawPill(ctx, featurePills[1].x, featurePills[1].y, "Dark fantasy palette", {
            minWidth: featurePills[1].width,
            height: featurePills[1].height
        });
        this.ui.drawPill(ctx, featurePills[2].x, featurePills[2].y, "Cleaner menu flow", {
            minWidth: featurePills[2].width,
            height: featurePills[2].height
        });
        ctx.restore();

        this.ui.drawPanel(ctx, statusPanel.x, statusPanel.y, statusPanel.width, statusPanel.height, {
            radius: 24,
            fill: "rgba(16, 12, 20, 0.92)",
            border: "rgba(255,232,196,0.12)",
            glow: "rgba(215, 176, 109, 0.07)"
        });

        ctx.save();
        ctx.fillStyle = "#f8f4eb";
        ctx.font = "700 15px Inter";
        ctx.fillText("Presentation Pass", statusPanel.x + 20, statusPanel.y + 34);
        ctx.fillStyle = "rgba(232, 222, 205, 0.78)";
        ctx.font = "500 14px Inter";
        ctx.fillText("Main menu now has Play, Level Select, and Settings.", statusPanel.x + 20, statusPanel.y + 72);
        ctx.fillText("The palette and framing now push toward dark fantasy.", statusPanel.x + 20, statusPanel.y + 102);
        ctx.fillText("Responsive scaling remains centered and intentional on any screen.", statusPanel.x + 20, statusPanel.y + 132);
        ctx.restore();

        this.ui.drawPanel(ctx, featurePanel.x, featurePanel.y, featurePanel.width, featurePanel.height, {
            radius: 24,
            fill: "rgba(14, 11, 18, 0.9)",
            border: "rgba(255,232,196,0.1)",
            glow: "rgba(141, 167, 255, 0.08)"
        });

        ctx.save();
        ctx.fillStyle = "#f8f4eb";
        ctx.font = "700 15px Inter";
        ctx.fillText("What Feels Better Now", featurePanel.x + 20, featurePanel.y + 34);
        ctx.fillStyle = "rgba(232, 222, 205, 0.76)";
        ctx.font = "500 14px Inter";
        ctx.fillText("Clearer hierarchy between title, actions, and supporting info", featurePanel.x + 20, featurePanel.y + 72);
        ctx.fillText("Rounded panels and warmer accents replace the older flat look", featurePanel.x + 20, featurePanel.y + 102);
        ctx.fillText("Menu navigation now reads more like a finished game shell", featurePanel.x + 20, featurePanel.y + 132);
        ctx.restore();

        this.ui.drawPanel(ctx, infoPanel.x, infoPanel.y, infoPanel.width, infoPanel.height, {
            radius: 24,
            fill: "rgba(12, 10, 16, 0.9)",
            border: "rgba(255,232,196,0.1)",
            glow: "rgba(126, 215, 178, 0.07)"
        });

        ctx.save();
        ctx.fillStyle = "#f8f4eb";
        ctx.font = "700 15px Inter";
        ctx.fillText("Battle Readiness", infoPanel.x + 20, infoPanel.y + 34);
        ctx.fillStyle = "rgba(232, 222, 205, 0.76)";
        ctx.font = "500 14px Inter";
        ctx.fillText("Choose a battlefield, place towers in valid zones, and stop the push.", infoPanel.x + 20, infoPanel.y + 74);
        ctx.fillText("Use Settings to control volume before a run starts.", infoPanel.x + 20, infoPanel.y + 104);
        ctx.fillText("Next passes can now focus on feedback, clarity, and progression.", infoPanel.x + 20, infoPanel.y + 134);
        ctx.restore();
    }
}
