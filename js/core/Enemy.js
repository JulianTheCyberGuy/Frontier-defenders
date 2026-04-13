export default class Enemy {
    constructor(path, stats = {}, scene = null) {
        this.path = path;
        this.scene = scene;
        this.i = stats.startPathIndex ?? 0;

        const startPoint = path[this.i] ?? path[0] ?? { x: 0, y: 0 };
        this.x = stats.startX ?? startPoint.x;
        this.y = stats.startY ?? startPoint.y;

        this.role = stats.role ?? "grunt";
        this.name = stats.name ?? "Enemy";
        this.maxHp = stats.hp ?? 100;
        this.hp = this.maxHp;
        this.speed = stats.speed ?? 50;
        this.baseSpeed = this.speed;

        this.reward = stats.reward ?? 10;
        this.radius = stats.radius ?? 10;
        this.color = stats.color ?? "red";

        this.dead = false;
        this.escaped = false;
        this.hasProcessedOutcome = false;
        this.pendingSpawnRoles = Array.isArray(stats.splitInto) ? [...stats.splitInto] : [];
        this.damageReduction = stats.damageReduction ?? 0;
        this.slowImmune = Boolean(stats.slowImmune);
        this.stunImmune = Boolean(stats.stunImmune);
        this.childStats = stats.childStats ? { ...stats.childStats } : {};

        this.effects = [];
        this.flashTimer = 0;
        this.stunned = false;
        this.typeBadge = stats.typeBadge ?? (this.role ? this.role[0].toUpperCase() : "E");
    }

    applyEffect(effect) {
        if (!effect || this.dead) return;

        if ((effect.type === "slow" || effect.type === "freeze") && this.slowImmune) return;
        if (effect.type === "stun" && this.stunImmune) return;

        const nextEffect = { ...effect };

        if (nextEffect.type === "burn") {
            nextEffect.interval = nextEffect.interval ?? 0.5;
            nextEffect.tick = nextEffect.tick ?? nextEffect.interval;
        }

        this.effects.push(nextEffect);
    }

    updateEffects(dt) {
        this.speed = this.baseSpeed;
        this.stunned = false;

        for (const effect of this.effects) {
            effect.time -= dt;

            if (effect.type === "slow") {
                this.speed *= effect.value ?? 0.8;
            }

            if (effect.type === "freeze") {
                this.speed *= effect.value ?? 0.45;
            }

            if (effect.type === "stun") {
                this.stunned = true;
                this.speed = 0;
            }

            if (effect.type === "burn") {
                effect.tick -= dt;
                if (effect.tick <= 0) {
                    this.takeDamage(effect.damage ?? 1, {
                        ignoreReduction: true,
                        color: "#ff8c42",
                        impactColor: "#ff8c42"
                    });
                    effect.tick = effect.interval ?? 0.5;
                }
            }
        }

        this.effects = this.effects.filter(effect => effect.time > 0);
    }

    update(dt) {
        if (this.dead || this.escaped) return;

        this.updateEffects(dt);

        if (this.flashTimer > 0) this.flashTimer -= dt;

        if (this.i >= this.path.length - 1) {
            this.escaped = true;
            return;
        }

        if (this.stunned) return;

        const target = this.path[this.i + 1];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 2) {
            this.i++;
            return;
        }

        this.x += (dx / dist) * this.speed * dt;
        this.y += (dy / dist) * this.speed * dt;
    }

    takeDamage(amount, options = {}) {
        if (this.dead) return false;

        const reducedAmount = options.ignoreReduction
            ? amount
            : Math.max(1, Math.round(amount * (1 - this.damageReduction)));

        this.hp -= reducedAmount;
        this.flashTimer = 0.1;

        if (this.scene) {
            this.scene.spawnDamageNumber(this.x, this.y - this.radius - 8, reducedAmount, options.color ?? "#ffffff");
            this.scene.spawnImpact(this.x, this.y, options.impactColor ?? "#ffffff", options.maxImpactRadius ?? 12);
        }

        if (this.hp <= 0) {
            this.hp = 0;
            this.dead = true;
        }

        return true;
    }

    getSplitSpawnData() {
        if (!this.pendingSpawnRoles.length) return [];

        return this.pendingSpawnRoles.map((role, index) => ({
            role,
            x: this.x + (index % 2 === 0 ? -8 : 8),
            y: this.y + (index < 2 ? -6 : 6),
            pathIndex: this.i,
            inherited: { ...this.childStats }
        }));
    }

    hasEffect(type) {
        return this.effects.some(effect => effect.type === type);
    }

    render(ctx) {
        if (this.dead) return;

        const fill = this.flashTimer > 0 ? "white" : this.color;

        ctx.save();
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        if (this.damageReduction > 0) {
            ctx.strokeStyle = "rgba(120, 190, 255, 0.9)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 4, 0, Math.PI * 2);
            ctx.stroke();
        }

        if (this.hasEffect("burn")) {
            ctx.strokeStyle = "#ff8c42";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 2, 0, Math.PI * 2);
            ctx.stroke();
        }

        if (this.hasEffect("slow") || this.hasEffect("freeze")) {
            ctx.fillStyle = this.hasEffect("freeze") ? "rgba(180, 235, 255, 0.35)" : "rgba(110, 180, 255, 0.22)";
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 1, 0, Math.PI * 2);
            ctx.fill();
        }

        if (this.hasEffect("stun")) {
            ctx.strokeStyle = "#f4d03f";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y - this.radius - 7, 6, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
        ctx.fillRect(this.x - this.radius, this.y - this.radius - 12, this.radius * 2, 5);
        ctx.fillStyle = "#4caf50";
        ctx.fillRect(this.x - this.radius, this.y - this.radius - 12, (this.hp / this.maxHp) * this.radius * 2, 5);

        ctx.fillStyle = "white";
        ctx.font = "bold 10px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.typeBadge, this.x, this.y + 3);
        ctx.restore();
    }
}
