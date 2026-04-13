import MainMenuScene from "./MainMenuScene.js";
import UIRenderer from "../ui/UIRenderer.js";

export default class SettingsScene {
    constructor(canvas, sceneManager, soundManager) {
        this.canvas = canvas;
        this.sceneManager = sceneManager;
        this.soundManager = soundManager;
        this.ui = new UIRenderer(canvas);
        this.layout = this.ui.getSettingsLayout();
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
        this.layout = this.ui.getSettingsLayout();
    }

    getButtonAt(x, y) {
        for (const [id, rect] of Object.entries(this.layout.buttons)) {
            if (x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height) {
                return id;
            }
        }
        return null;
    }

    handleClick(event) {
        this.refreshLayout();
        const { x, y } = this.ui.getPointerPosition(event);
        const action = this.getButtonAt(x, y);

        if (action === "volume") {
            this.soundManager.cycleVolume();
            return;
        }

        if (action === "back") {
            this.soundManager.playClick();
            this.sceneManager.changeScene(new MainMenuScene(this.canvas, this.sceneManager, this.soundManager));
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
        const { frame, header, cards, buttons } = this.layout;

        this.ui.drawBackdrop(ctx, {
            top: "#120d17",
            bottom: "#050409",
            accent: "rgba(215, 176, 109, 0.12)",
            accentTwo: "rgba(126, 215, 178, 0.08)"
        });

        this.ui.drawPanel(ctx, frame.x, frame.y, frame.width, frame.height, {
            radius: 26,
            fill: "rgba(9, 7, 12, 0.82)",
            border: "rgba(255,232,196,0.08)",
            glow: "rgba(215, 176, 109, 0.06)"
        });

        this.ui.drawPanel(ctx, header.x, header.y, header.width, header.height, {
            radius: 20,
            fill: "rgba(18, 14, 22, 0.94)",
            border: "rgba(255,232,196,0.1)",
            glow: "rgba(141, 167, 255, 0.05)"
        });

        ctx.save();
        ctx.fillStyle = "#f8f4eb";
        ctx.font = "700 28px Cinzel";
        ctx.fillText("Settings", header.x + 18, header.y + 30);
        ctx.fillStyle = "rgba(232, 222, 205, 0.72)";
        ctx.font = "500 13px Inter";
        ctx.fillText("Small controls that help the game feel cleaner before a run begins.", header.x + 18, header.y + 54);
        ctx.restore();

        this.ui.drawPanel(ctx, cards.audio.x, cards.audio.y, cards.audio.width, cards.audio.height, {
            radius: 18,
            fill: "rgba(16, 12, 20, 0.92)",
            border: "rgba(255,232,196,0.09)"
        });
        ctx.save();
        ctx.fillStyle = "#f8f4eb";
        ctx.font = "700 14px Inter";
        ctx.fillText("Audio", cards.audio.x + 18, cards.audio.y + 26);
        ctx.fillStyle = "rgba(232, 222, 205, 0.74)";
        ctx.font = "500 12px Inter";
        ctx.fillText("Cycle the master volume between mute, low, medium, and high.", cards.audio.x + 18, cards.audio.y + 48);
        ctx.fillText(`Current setting: ${this.soundManager.getVolumeLabel()}`, cards.audio.x + 18, cards.audio.y + 66);
        ctx.restore();

        this.ui.drawButton(ctx, buttons.volume, this.soundManager.getVolumeLabel(), {
            hovered: this.hoveredId === "volume",
            active: true,
            radius: 14,
            font: "700 13px Inter"
        });

        this.ui.drawPanel(ctx, cards.display.x, cards.display.y, cards.display.width, cards.display.height, {
            radius: 18,
            fill: "rgba(16, 12, 20, 0.92)",
            border: "rgba(255,232,196,0.09)"
        });
        ctx.save();
        ctx.fillStyle = "#f8f4eb";
        ctx.font = "700 14px Inter";
        ctx.fillText("Display", cards.display.x + 18, cards.display.y + 26);
        ctx.fillStyle = "rgba(232, 222, 205, 0.74)";
        ctx.font = "500 12px Inter";
        ctx.fillText("The canvas keeps a fixed internal size and now renders more sharply on high DPI screens.", cards.display.x + 18, cards.display.y + 48);
        ctx.fillText("Input still maps correctly to the scaled canvas.", cards.display.x + 18, cards.display.y + 66);
        ctx.restore();

        this.ui.drawPanel(ctx, cards.style.x, cards.style.y, cards.style.width, cards.style.height, {
            radius: 18,
            fill: "rgba(16, 12, 20, 0.92)",
            border: "rgba(255,232,196,0.09)"
        });
        ctx.save();
        ctx.fillStyle = "#f8f4eb";
        ctx.font = "700 14px Inter";
        ctx.fillText("Visual Direction", cards.style.x + 18, cards.style.y + 26);
        ctx.fillStyle = "rgba(232, 222, 205, 0.74)";
        ctx.font = "500 12px Inter";
        ctx.fillText("This pass keeps the dark fantasy look while giving more space back to gameplay.", cards.style.x + 18, cards.style.y + 48);
        ctx.restore();

        this.ui.drawButton(ctx, buttons.back, "Back", {
            hovered: this.hoveredId === "back",
            radius: 14,
            font: "700 13px Inter"
        });
    }
}
