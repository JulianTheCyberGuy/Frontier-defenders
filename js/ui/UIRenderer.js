import { UI_THEME } from "../config.js";

export default class UIRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.theme = UI_THEME;
    }

    getPointerPosition(event) {
        const bounds = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / bounds.width;
        const scaleY = this.canvas.height / bounds.height;

        return {
            x: (event.clientX - bounds.left) * scaleX,
            y: (event.clientY - bounds.top) * scaleY
        };
    }

    getMainMenuLayout() {
        const { width, height } = this.canvas;
        const frame = {
            x: 28,
            y: 26,
            width: width - 56,
            height: height - 52
        };
        const hero = {
            x: frame.x + 26,
            y: frame.y + 28,
            width: Math.floor(frame.width * 0.56),
            height: frame.height - 56
        };
        const sideX = hero.x + hero.width + 22;
        const sideWidth = frame.x + frame.width - sideX - 24;
        const statusPanel = {
            x: sideX,
            y: hero.y,
            width: sideWidth,
            height: 182
        };
        const featurePanel = {
            x: sideX,
            y: statusPanel.y + statusPanel.height + 18,
            width: sideWidth,
            height: 154
        };
        const infoPanel = {
            x: sideX,
            y: featurePanel.y + featurePanel.height + 18,
            width: sideWidth,
            height: hero.height - statusPanel.height - featurePanel.height - 36
        };

        return {
            frame,
            hero,
            statusPanel,
            featurePanel,
            infoPanel,
            buttons: {
                start: { x: hero.x, y: hero.y + 250, width: 190, height: 56 },
                levels: { x: hero.x + 206, y: hero.y + 250, width: 176, height: 56 },
                settings: { x: hero.x + 398, y: hero.y + 250, width: 160, height: 56 }
            },
            featurePills: [
                { x: hero.x, y: hero.y + 324, width: 152, height: 34 },
                { x: hero.x + 164, y: hero.y + 324, width: 158, height: 34 },
                { x: hero.x + 334, y: hero.y + 324, width: 176, height: 34 }
            ]
        };
    }

    getLevelSelectLayout(cardCount) {
        const { width, height } = this.canvas;
        const frame = {
            x: 34,
            y: 28,
            width: width - 68,
            height: height - 56
        };
        const header = {
            x: frame.x + 22,
            y: frame.y + 22,
            width: frame.width - 44,
            height: 92
        };
        const contentY = header.y + header.height + 18;
        const gap = 16;
        const cardWidth = Math.floor((frame.width - 44 - gap * (cardCount - 1)) / cardCount);
        const cardHeight = frame.height - (contentY - frame.y) - 26;
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

    getSettingsLayout() {
        const { width, height } = this.canvas;
        const frame = {
            x: 140,
            y: 52,
            width: width - 280,
            height: height - 104
        };
        const header = {
            x: frame.x + 24,
            y: frame.y + 22,
            width: frame.width - 48,
            height: 96
        };
        const cards = {
            audio: { x: frame.x + 24, y: header.y + header.height + 18, width: frame.width - 48, height: 116 },
            display: { x: frame.x + 24, y: header.y + header.height + 150, width: frame.width - 48, height: 108 },
            style: { x: frame.x + 24, y: header.y + header.height + 274, width: frame.width - 48, height: 94 }
        };

        return {
            frame,
            header,
            cards,
            buttons: {
                volume: { x: cards.audio.x + cards.audio.width - 176, y: cards.audio.y + 34, width: 146, height: 46 },
                back: { x: frame.x + frame.width - 152, y: frame.y + frame.height - 68, width: 128, height: 46 }
            }
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
        const top = palette.top ?? "#16111c";
        const bottom = palette.bottom ?? "#07060b";
        const accent = palette.accent ?? "rgba(215, 176, 109, 0.13)";
        const accentTwo = palette.accentTwo ?? "rgba(141, 167, 255, 0.1)";

        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, top);
        gradient.addColorStop(0.52, "#140f18");
        gradient.addColorStop(1, bottom);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.arc(width * 0.16, height * 0.16, 190, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = accentTwo;
        ctx.beginPath();
        ctx.arc(width * 0.82, height * 0.24, 140, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(126, 215, 178, 0.08)";
        ctx.beginPath();
        ctx.arc(width * 0.84, height * 0.84, 220, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = "rgba(255, 244, 225, 0.03)";
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
        const glow = options.glow ?? "rgba(215, 176, 109, 0.1)";

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
        const danger = Boolean(options.danger);
        const radius = options.radius ?? 16;
        const fill = disabled
            ? "rgba(88, 76, 76, 0.38)"
            : danger
                ? hovered
                    ? "rgba(143, 67, 80, 0.96)"
                    : "rgba(108, 46, 58, 0.92)"
                : active
                    ? "rgba(215, 176, 109, 0.94)"
                    : hovered
                        ? "rgba(78, 63, 113, 0.98)"
                        : "rgba(28, 22, 37, 0.92)";
        const border = disabled
            ? "rgba(255, 255, 255, 0.08)"
            : danger
                ? "rgba(233, 168, 177, 0.65)"
                : active
                    ? "rgba(255, 236, 190, 0.92)"
                    : hovered
                        ? "rgba(189, 171, 245, 0.78)"
                        : "rgba(255, 232, 196, 0.14)";

        this.drawPanel(ctx, rect.x, rect.y, rect.width, rect.height, {
            radius,
            fill,
            border,
            glow: hovered || active || danger ? "rgba(215, 176, 109, 0.18)" : "rgba(0, 0, 0, 0)"
        });

        ctx.save();
        ctx.fillStyle = disabled ? "rgba(235, 239, 245, 0.55)" : active ? "#1d1402" : "#f8f4eb";
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
        gradient.addColorStop(0, options.start ?? "#7ed7b2");
        gradient.addColorStop(1, options.end ?? "#d7b06d");
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
            fill: "rgba(10, 8, 14, 0.95)",
            border: "rgba(255, 232, 196, 0.15)",
            glow: "rgba(15, 23, 42, 0.55)"
        });

        ctx.fillStyle = "#f8f1e5";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        lines.forEach((line, index) => {
            ctx.fillText(line, tooltipX + 12, tooltipY + 10 + index * 18);
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
