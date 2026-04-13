export default class UIRenderer {
    constructor(canvas) {
        this.canvas = canvas;
    }

    getPointerPosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) * (this.canvas.width / rect.width),
            y: (event.clientY - rect.top) * (this.canvas.height / rect.height)
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
        ctx.arc(width * 0.18, height * 0.12, 170, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(width * 0.82, height * 0.82, 220, 0, Math.PI * 2);
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
        const fill = options.fill ?? "rgba(9, 15, 26, 0.8)";
        const border = options.border ?? "rgba(255, 255, 255, 0.12)";
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
            ? "rgba(88, 96, 116, 0.5)"
            : active
                ? "rgba(224, 180, 74, 0.92)"
                : hovered
                    ? "rgba(72, 121, 255, 0.94)"
                    : "rgba(27, 40, 66, 0.9)";
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

    drawTooltip(ctx, x, y, lines) {
        if (!lines || lines.length === 0) return;

        ctx.save();
        ctx.font = "500 13px Inter";
        const width = Math.max(...lines.map(line => ctx.measureText(line).width)) + 24;
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
