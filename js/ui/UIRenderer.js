import { UI_THEME } from "../config.js";

export default class UIRenderer {
    constructor(canvas, theme = UI_THEME) {
        this.canvas = canvas;
        this.theme = theme;
    }

    getPointerPosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) * (this.canvas.width / rect.width),
            y: (event.clientY - rect.top) * (this.canvas.height / rect.height)
        };
    }

    getMainMenuLayout() {
        const { width, height } = this.canvas;
        const frame = {
            x: 54,
            y: 46,
            width: width - 108,
            height: height - 92
        };
        const hero = {
            x: frame.x + 34,
            y: frame.y + 34,
            width: 456,
            height: frame.height - 68
        };
        const featurePanel = {
            x: hero.x + hero.width + 24,
            y: hero.y,
            width: frame.x + frame.width - (hero.x + hero.width + 24) - 34,
            height: 204
        };
        const infoPanel = {
            x: featurePanel.x,
            y: featurePanel.y + featurePanel.height + 22,
            width: featurePanel.width,
            height: hero.height - featurePanel.height - 22
        };

        return {
            frame,
            hero,
            featurePanel,
            infoPanel,
            buttons: {
                start: { x: hero.x, y: hero.y + 226, width: 208, height: 56 },
                levels: { x: hero.x + 224, y: hero.y + 226, width: 182, height: 56 }
            },
            featurePills: [
                { x: hero.x, y: hero.y + 308, width: 150, height: 34 },
                { x: hero.x + 164, y: hero.y + 308, width: 176, height: 34 },
                { x: hero.x, y: hero.y + 354, width: 196, height: 34 }
            ]
        };
    }

    getLevelSelectLayout(cardCount) {
        const { width, height } = this.canvas;
        const frame = {
            x: 38,
            y: 32,
            width: width - 76,
            height: height - 64
        };
        const header = {
            x: frame.x + 22,
            y: frame.y + 22,
            width: frame.width - 44,
            height: 82
        };
        const contentY = header.y + header.height + 22;
        const gap = 18;
        const cardWidth = Math.floor((frame.width - 44 - gap * (cardCount - 1)) / cardCount);
        const cardHeight = frame.height - (contentY - frame.y) - 28;
        const cards = Array.from({ length: cardCount }, (_, index) => ({
            x: frame.x + 22 + index * (cardWidth + gap),
            y: contentY,
            width: cardWidth,
            height: cardHeight
        }));

        return {
            frame,
            header,
            cards,
            backButton: { x: frame.x + 22, y: frame.y + 20, width: 120, height: 44 }
        };
    }

    getGameLayout(towerCount) {
        const { width, height } = this.canvas;
        const padding = 18;
        const gap = 16;
        const topBar = { x: padding, y: padding, width: width - padding * 2, height: 72 };
        const sidebar = {
            x: width - padding - 286,
            y: topBar.y + topBar.height + gap,
            width: 286,
            height: height - (topBar.y + topBar.height + gap) - padding
        };
        const towerDock = {
            x: padding,
            y: height - padding - 98,
            width: sidebar.x - padding - gap,
            height: 98
        };
        const worldRect = {
            x: padding,
            y: topBar.y + topBar.height + gap,
            width: towerDock.width,
            height: towerDock.y - (topBar.y + topBar.height + gap) - gap
        };
        const towerGap = 10;
        const towerButtonWidth = Math.floor((towerDock.width - 28 - towerGap * (towerCount - 1)) / towerCount);
        const towerButtonRects = Array.from({ length: towerCount }, (_, index) => ({
            x: towerDock.x + 14 + index * (towerButtonWidth + towerGap),
            y: towerDock.y + 13,
            width: towerButtonWidth,
            height: towerDock.height - 26
        }));

        const actionWidth = sidebar.width - 28;
        const upgradeButtons = [
            { x: sidebar.x + 14, y: sidebar.y + sidebar.height - 138, width: actionWidth, height: 44, id: "left" },
            { x: sidebar.x + 14, y: sidebar.y + sidebar.height - 86, width: actionWidth, height: 44, id: "right" }
        ];
        const sellButton = {
            x: sidebar.x + 14,
            y: sidebar.y + sidebar.height - 34,
            width: actionWidth,
            height: 44
        };
        const overlay = {
            x: width / 2 - 232,
            y: height / 2 - 126,
            width: 464,
            height: 252
        };
        const overlayButtons = {
            restart: { x: overlay.x + 36, y: overlay.y + 156, width: 118, height: 46 },
            levels: { x: overlay.x + 172, y: overlay.y + 156, width: 126, height: 46 },
            menu: { x: overlay.x + 316, y: overlay.y + 156, width: 112, height: 46 }
        };

        return {
            padding,
            topBar,
            worldRect,
            towerDock,
            sidebar,
            towerButtonRects,
            upgradeButtons,
            sellButton,
            overlay,
            overlayButtons
        };
    }

    drawBackdrop(ctx, palette = {}) {
        const { width, height } = this.canvas;
        const top = palette.top ?? "#101828";
        const bottom = palette.bottom ?? "#060b14";
        const accent = palette.accent ?? "rgba(96, 165, 250, 0.18)";

        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, top);
        gradient.addColorStop(1, bottom);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.arc(width * 0.16, height * 0.14, 180, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(width * 0.86, height * 0.84, 230, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.035)";
        ctx.lineWidth = 1;
        for (let x = 0; x <= width; x += 32) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y <= height; y += 32) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        ctx.restore();
    }

    drawPanel(ctx, x, y, width, height, options = {}) {
        const radius = options.radius ?? 20;
        const fill = options.fill ?? this.theme.colors.panel;
        const border = options.border ?? this.theme.colors.border;
        const glow = options.glow ?? "rgba(96, 165, 250, 0.12)";

        ctx.save();
        ctx.shadowColor = glow;
        ctx.shadowBlur = 24;
        this.roundRect(ctx, x, y, width, height, radius);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = border;
        ctx.lineWidth = 1.25;
        ctx.stroke();
        ctx.restore();
    }

    drawButton(ctx, rect, label, options = {}) {
        const hovered = Boolean(options.hovered);
        const active = Boolean(options.active);
        const disabled = Boolean(options.disabled);
        const radius = options.radius ?? 16;
        const fill = disabled
            ? "rgba(88, 96, 116, 0.42)"
            : active
                ? "rgba(224, 180, 74, 0.92)"
                : hovered
                    ? "rgba(67, 114, 212, 0.96)"
                    : "rgba(20, 30, 50, 0.9)";
        const border = disabled
            ? "rgba(255, 255, 255, 0.08)"
            : active
                ? "rgba(255, 235, 177, 0.95)"
                : hovered
                    ? "rgba(181, 215, 255, 0.95)"
                    : "rgba(255, 255, 255, 0.12)";

        this.drawPanel(ctx, rect.x, rect.y, rect.width, rect.height, {
            radius,
            fill,
            border,
            glow: hovered || active ? "rgba(96, 165, 250, 0.18)" : "rgba(0, 0, 0, 0)"
        });

        ctx.save();
        ctx.fillStyle = disabled ? "rgba(235, 239, 245, 0.55)" : active ? "#1a1300" : "#f5f8ff";
        ctx.font = options.font ?? "600 15px Inter";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, rect.x + rect.width / 2, rect.y + rect.height / 2 + (options.textOffsetY ?? 0));
        ctx.restore();
    }

    drawPill(ctx, x, y, text, options = {}) {
        const padX = options.padX ?? 12;
        const width = Math.max(options.minWidth ?? 0, ctx.measureText(text).width + padX * 2);
        const rect = { x, y, width, height: options.height ?? 30 };
        this.drawButton(ctx, rect, text, {
            hovered: options.hovered,
            active: options.active,
            disabled: options.disabled,
            radius: rect.height / 2,
            font: options.font ?? "600 13px Inter"
        });
        return rect;
    }

    drawMeter(ctx, rect, progress, options = {}) {
        const value = Math.max(0, Math.min(1, progress));
        const radius = options.radius ?? rect.height / 2;
        this.drawPanel(ctx, rect.x, rect.y, rect.width, rect.height, {
            radius,
            fill: options.track ?? "rgba(255, 255, 255, 0.08)",
            border: options.border ?? "rgba(255, 255, 255, 0.08)",
            glow: "rgba(0, 0, 0, 0)"
        });

        if (value <= 0) return;

        const fillWidth = Math.max(radius * 2, rect.width * value);
        ctx.save();
        this.roundRect(ctx, rect.x, rect.y, fillWidth, rect.height, radius);
        const gradient = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.width, rect.y);
        gradient.addColorStop(0, options.start ?? "#7ef0c2");
        gradient.addColorStop(1, options.end ?? "#7fb3ff");
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
    }

    drawTooltip(ctx, x, y, lines) {
        if (!lines || lines.length === 0) return;

        ctx.save();
        ctx.font = "500 13px Inter";
        const width = Math.max(...lines.map((line) => ctx.measureText(line).width)) + 24;
        const height = lines.length * 18 + 20;
        const tooltipX = Math.min(this.canvas.width - width - 14, Math.max(14, x));
        const tooltipY = Math.min(this.canvas.height - height - 14, Math.max(14, y));

        this.drawPanel(ctx, tooltipX, tooltipY, width, height, {
            radius: 14,
            fill: "rgba(8, 12, 20, 0.94)",
            border: "rgba(255,255,255,0.14)",
            glow: "rgba(15, 23, 42, 0.55)"
        });

        ctx.fillStyle = "#edf3ff";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        lines.forEach((line, index) => {
            ctx.fillText(line, tooltipX + 12, tooltipY + 10 + index * 18);
        });
        ctx.restore();
    }

    drawRangeRing(ctx, x, y, range, options = {}) {
        ctx.save();
        ctx.fillStyle = options.fill ?? "rgba(96, 165, 250, 0.12)";
        ctx.strokeStyle = options.stroke ?? "rgba(191, 219, 254, 0.6)";
        ctx.lineWidth = options.lineWidth ?? 2;
        ctx.beginPath();
        ctx.arc(x, y, range, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    roundRect(ctx, x, y, width, height, radius) {
        const r = Math.min(radius, width / 2, height / 2);
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + width, y, x + width, y + height, r);
        ctx.arcTo(x + width, y + height, x, y + height, r);
        ctx.arcTo(x, y + height, x, y, r);
        ctx.arcTo(x, y, x + width, y, r);
        ctx.closePath();
    }
}
