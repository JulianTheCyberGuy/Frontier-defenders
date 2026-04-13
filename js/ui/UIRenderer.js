import { UI_THEME } from "../config.js";

export default class UIRenderer {
    constructor(canvas, theme = UI_THEME) {
        this.canvas = canvas;
        this.theme = theme;
    }

    get logicalWidth() {
        return this.canvas.logicalWidth ?? this.canvas.width;
    }

    get logicalHeight() {
        return this.canvas.logicalHeight ?? this.canvas.height;
    }

    getPointerPosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) * (this.logicalWidth / rect.width),
            y: (event.clientY - rect.top) * (this.logicalHeight / rect.height)
        };
    }

    getMainMenuLayout() {
        const width = this.logicalWidth;
        const height = this.logicalHeight;
        const frame = {
            x: 32,
            y: 28,
            width: width - 64,
            height: height - 56
        };
        const hero = {
            x: frame.x + 30,
            y: frame.y + 26,
            width: 488,
            height: frame.height - 52
        };
        const sideX = hero.x + hero.width + 20;
        const sideWidth = frame.x + frame.width - sideX - 24;
        const statusPanel = {
            x: sideX,
            y: hero.y,
            width: sideWidth,
            height: 146
        };
        const featurePanel = {
            x: sideX,
            y: statusPanel.y + statusPanel.height + 16,
            width: sideWidth,
            height: 134
        };
        const infoPanel = {
            x: sideX,
            y: featurePanel.y + featurePanel.height + 16,
            width: sideWidth,
            height: hero.height - statusPanel.height - featurePanel.height - 32
        };

        return {
            frame,
            hero,
            statusPanel,
            featurePanel,
            infoPanel,
            buttons: {
                start: { x: hero.x, y: hero.y + 238, width: 168, height: 48 },
                levels: { x: hero.x + 180, y: hero.y + 238, width: 156, height: 48 },
                settings: { x: hero.x + 348, y: hero.y + 238, width: 140, height: 48 }
            },
            featurePills: [
                { x: hero.x, y: hero.y + 312, width: 132, height: 30 },
                { x: hero.x + 144, y: hero.y + 312, width: 154, height: 30 },
                { x: hero.x + 310, y: hero.y + 312, width: 178, height: 30 }
            ]
        };
    }

    getLevelSelectLayout(cardCount) {
        const width = this.logicalWidth;
        const height = this.logicalHeight;
        const frame = {
            x: 34,
            y: 28,
            width: width - 68,
            height: height - 56
        };
        const header = {
            x: frame.x + 20,
            y: frame.y + 18,
            width: frame.width - 40,
            height: 78
        };
        const contentY = header.y + header.height + 18;
        const gap = 14;
        const cardWidth = Math.floor((frame.width - 40 - gap * (cardCount - 1)) / cardCount);
        const cardHeight = frame.height - (contentY - frame.y) - 22;
        const cards = Array.from({ length: cardCount }, (_, index) => ({
            x: frame.x + 20 + index * (cardWidth + gap),
            y: contentY,
            width: cardWidth,
            height: cardHeight
        }));

        return {
            frame,
            header,
            cards,
            backButton: { x: frame.x + 20, y: frame.y + 18, width: 112, height: 38 }
        };
    }

    getSettingsLayout() {
        const width = this.logicalWidth;
        const height = this.logicalHeight;
        const frame = {
            x: 176,
            y: 56,
            width: width - 352,
            height: height - 112
        };
        const header = {
            x: frame.x + 20,
            y: frame.y + 18,
            width: frame.width - 40,
            height: 78
        };
        const cards = {
            audio: { x: frame.x + 20, y: header.y + header.height + 16, width: frame.width - 40, height: 92 },
            display: { x: frame.x + 20, y: header.y + header.height + 122, width: frame.width - 40, height: 88 },
            style: { x: frame.x + 20, y: header.y + header.height + 224, width: frame.width - 40, height: 82 }
        };

        return {
            frame,
            header,
            cards,
            buttons: {
                volume: { x: cards.audio.x + cards.audio.width - 150, y: cards.audio.y + 24, width: 122, height: 38 },
                back: { x: frame.x + frame.width - 130, y: frame.y + frame.height - 54, width: 110, height: 38 }
            }
        };
    }

    getGameLayout(towerCount) {
        const width = this.logicalWidth;
        const height = this.logicalHeight;
        const padding = 14;
        const gap = 12;
        const topBar = { x: padding, y: padding, width: width - padding * 2, height: 58 };
        const sidebar = {
            x: width - padding - 236,
            y: topBar.y + topBar.height + gap,
            width: 236,
            height: height - (topBar.y + topBar.height + gap) - padding
        };
        const towerDock = {
            x: padding,
            y: height - padding - 82,
            width: sidebar.x - padding - gap,
            height: 82
        };
        const worldRect = {
            x: padding,
            y: topBar.y + topBar.height + gap,
            width: towerDock.width,
            height: towerDock.y - (topBar.y + topBar.height + gap) - gap
        };
        const towerGap = 8;
        const towerButtonWidth = Math.floor((towerDock.width - 20 - towerGap * (towerCount - 1)) / towerCount);
        const towerButtonRects = Array.from({ length: towerCount }, (_, index) => ({
            x: towerDock.x + 10 + index * (towerButtonWidth + towerGap),
            y: towerDock.y + 10,
            width: towerButtonWidth,
            height: towerDock.height - 20
        }));

        const actionWidth = sidebar.width - 24;
        const upgradeButtons = [
            { x: sidebar.x + 12, y: sidebar.y + sidebar.height - 122, width: actionWidth, height: 38, id: "left" },
            { x: sidebar.x + 12, y: sidebar.y + sidebar.height - 76, width: actionWidth, height: 38, id: "right" }
        ];
        const sellButton = {
            x: sidebar.x + 12,
            y: sidebar.y + sidebar.height - 30,
            width: actionWidth,
            height: 38
        };
        const overlay = {
            x: width / 2 - 216,
            y: height / 2 - 116,
            width: 432,
            height: 232
        };
        const overlayButtons = {
            restart: { x: overlay.x + 30, y: overlay.y + 150, width: 108, height: 40 },
            levels: { x: overlay.x + 154, y: overlay.y + 150, width: 116, height: 40 },
            menu: { x: overlay.x + 286, y: overlay.y + 150, width: 108, height: 40 }
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
        const width = this.logicalWidth;
        const height = this.logicalHeight;
        const top = palette.top ?? "#101828";
        const bottom = palette.bottom ?? "#060b14";
        const accent = palette.accent ?? "rgba(96, 165, 250, 0.18)";
        const accentTwo = palette.accentTwo ?? "rgba(126, 215, 178, 0.08)";

        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, top);
        gradient.addColorStop(1, bottom);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.arc(width * 0.16, height * 0.15, 120, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = accentTwo;
        ctx.beginPath();
        ctx.arc(width * 0.84, height * 0.2, 92, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.025)";
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
        const radius = options.radius ?? 18;
        const fill = options.fill ?? this.theme.colors.panel;
        const border = options.border ?? this.theme.colors.border;
        const glow = options.glow ?? "rgba(96, 165, 250, 0.12)";

        ctx.save();
        ctx.shadowColor = glow;
        ctx.shadowBlur = 18;
        this.roundRect(ctx, x, y, width, height, radius);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = border;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    }

    drawButton(ctx, rect, label, options = {}) {
        const hovered = Boolean(options.hovered);
        const active = Boolean(options.active);
        const disabled = Boolean(options.disabled);
        const radius = options.radius ?? 14;
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
                ? "rgba(255, 235, 177, 0.9)"
                : hovered
                    ? "rgba(181, 215, 255, 0.9)"
                    : "rgba(255, 255, 255, 0.1)";

        this.drawPanel(ctx, rect.x, rect.y, rect.width, rect.height, {
            radius,
            fill,
            border,
            glow: hovered || active ? "rgba(96, 165, 250, 0.14)" : "rgba(0, 0, 0, 0)"
        });

        ctx.save();
        ctx.fillStyle = disabled ? "rgba(235, 239, 245, 0.55)" : active ? "#1a1300" : "#f5f8ff";
        ctx.font = options.font ?? "600 14px Inter";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, rect.x + rect.width / 2, rect.y + rect.height / 2 + (options.textOffsetY ?? 0));
        ctx.restore();
    }

    drawPill(ctx, x, y, text, options = {}) {
        const padX = options.padX ?? 12;
        const width = Math.max(options.minWidth ?? 0, ctx.measureText(text).width + padX * 2);
        const rect = { x, y, width, height: options.height ?? 28 };
        this.drawButton(ctx, rect, text, {
            hovered: options.hovered,
            active: options.active,
            disabled: options.disabled,
            radius: rect.height / 2,
            font: options.font ?? "600 12px Inter"
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
        gradient.addColorStop(0, options.start ?? "#7ed7b2");
        gradient.addColorStop(1, options.end ?? "#d7b06d");
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
    }

    drawTooltip(ctx, x, y, lines) {
        if (!lines || lines.length === 0) return;

        ctx.save();
        ctx.font = "500 12px Inter";
        const width = Math.max(...lines.map((line) => ctx.measureText(line).width)) + 20;
        const height = lines.length * 16 + 18;
        const tooltipX = Math.min(this.logicalWidth - width - 12, Math.max(12, x));
        const tooltipY = Math.min(this.logicalHeight - height - 12, Math.max(12, y));

        this.drawPanel(ctx, tooltipX, tooltipY, width, height, {
            radius: 12,
            fill: "rgba(10, 8, 14, 0.95)",
            border: "rgba(255, 232, 196, 0.15)",
            glow: "rgba(15, 23, 42, 0.4)"
        });

        ctx.fillStyle = "#f8f1e5";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        lines.forEach((line, index) => {
            ctx.fillText(line, tooltipX + 10, tooltipY + 8 + index * 16);
        });
        ctx.restore();
    }

    drawRangeRing(ctx, x, y, range, options = {}) {
        ctx.save();
        ctx.fillStyle = options.fill ?? "rgba(141, 167, 255, 0.12)";
        ctx.strokeStyle = options.stroke ?? "rgba(215, 176, 109, 0.6)";
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
