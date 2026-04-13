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
            accent: "rgba(215, 176, 109, 0.13)",
            accentTwo: "rgba(126, 215, 178, 0.08)"
        });

        this.ui.drawPanel(ctx, frame.x, frame.y, frame.width, frame.height, {
            radius: 30,
            fill: "rgba(9, 7, 12, 0.82)",
            border: "rgba(255,232,196,0.1)",
            glow: "rgba(215, 176, 109, 0.08)"
        });

        this.ui.drawPanel(ctx, header.x, header.y, header.width, header.height, {
            radius: 24,
            fill: "rgba(18, 14, 22, 0.94)",
            border: "rgba(255,232,196,0.12)",
            glow: "rgba(141, 167, 255, 0.06)"
        });

        ctx.save();
        ctx.fillStyle = "#f8f4eb";
        ctx.font = "700 34px Cinzel";
        ctx.fillText("Settings", header.x + 22, header.y + 42);
        ctx.fillStyle = "rgba(232, 222, 205, 0.78)";
        ctx.font = "500 15px Inter";
        ctx.fillText("Small controls that help the game feel cleaner before a run begins.", header.x + 22, header.y + 72);
        ctx.restore();

        this.ui.drawPanel(ctx, cards.audio.x, cards.audio.y, cards.audio.width, cards.audio.height, {
            radius: 22,
            fill: "rgba(16, 12, 20, 0.92)",
            border: "rgba(255,232,196,0.11)"
        });
        ctx.save();
        ctx.fillStyle = "#f8f4eb";
        ctx.font = "700 17px Inter";
        ctx.fillText("Audio", cards.audio.x + 22, cards.audio.y + 32);
        ctx.fillStyle = "rgba(232, 222, 205, 0.76)";
        ctx.font = "500 14px Inter";
        ctx.fillText("Cycle the master volume between mute, low, medium, and high.", cards.audio.x + 22, cards.audio.y + 62);
        ctx.fillText(`Current setting: ${this.soundManager.getVolumeLabel()}`, cards.audio.x + 22, cards.audio.y + 88);
        ctx.restore();

        this.ui.drawButton(ctx, buttons.volume, this.soundManager.getVolumeLabel(), {
            hovered: this.hoveredId === "volume",
            active: true,
            radius: 16,
            font: "700 15px Inter"
        });

        this.ui.drawPanel(ctx, cards.display.x, cards.display.y, cards.display.width, cards.display.height, {
            radius: 22,
            fill: "rgba(16, 12, 20, 0.92)",
            border: "rgba(255,232,196,0.11)"
        });
        ctx.save();
        ctx.fillStyle = "#f8f4eb";
        ctx.font = "700 17px Inter";
        ctx.fillText("Display", cards.display.x + 22, cards.display.y + 32);
        ctx.fillStyle = "rgba(232, 222, 205, 0.76)";
        ctx.font = "500 14px Inter";
        ctx.fillText("The game keeps a fixed internal resolution and scales to the screen automatically.", cards.display.x + 22, cards.display.y + 62);
        ctx.fillText("Input is mapped to the scaled canvas so clicks still land accurately.", cards.display.x + 22, cards.display.y + 86);
        ctx.restore();

        this.ui.drawPanel(ctx, cards.style.x, cards.style.y, cards.style.width, cards.style.height, {
            radius: 22,
            fill: "rgba(16, 12, 20, 0.92)",
            border: "rgba(255,232,196,0.11)"
        });
        ctx.save();
        ctx.fillStyle = "#f8f4eb";
        ctx.font = "700 17px Inter";
        ctx.fillText("Visual Direction", cards.style.x + 22, cards.style.y + 32);
        ctx.fillStyle = "rgba(232, 222, 205, 0.76)";
        ctx.font = "500 14px Inter";
        ctx.fillText("This pass pushes the UI toward dark fantasy with warmer metals and deeper shadow.", cards.style.x + 22, cards.style.y + 62);
        ctx.restore();

        this.ui.drawButton(ctx, buttons.back, "Back", {
            hovered: this.hoveredId === "back",
            radius: 16,
            font: "700 15px Inter"
        });
    }
}
