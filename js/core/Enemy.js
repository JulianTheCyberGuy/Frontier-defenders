export default class Enemy {
    constructor(path, stats = {}) {
        this.path = path;
        this.i = 0;

        this.x = path[0].x;
        this.y = path[0].y;

        this.role = stats.role ?? "grunt";
        this.name = stats.name ?? "Enemy";
        this.maxHp = stats.hp ?? 100;
        this.hp = this.maxHp;
        this.speed = stats.speed ?? 50;
        this.baseSpeed = this.speed;

        this.reward = stats.reward ?? 10;
        this.radius = stats.radius ?? 10;
        this.color = stats.color ?? "red";

        this.isBoss = stats.isBoss ?? false;
        this.immuneSlow = stats.immuneSlow ?? false;
        this.spawnMinionRole = stats.spawnMinionRole ?? null;
        this.spawnMinionCount = stats.spawnMinionCount ?? 0;
        this.spawnMinionInterval = stats.spawnMinionInterval ?? 0;
        this.minionTimer = this.spawnMinionInterval;
        this.enrageThreshold = stats.enrageThreshold ?? 0.5;
        this.enraged = false;

        this.dead = false;
        this.escaped = false;

        this.effects = [];
        this.flashTimer = 0;
    }

    applyEffect(effect) {
        if (effect.type === "slow" && this.immuneSlow) {
            return false;
        }

        const existing = this.effects.find(active => active.type === effect.type);

        if (existing) {
            existing.time = Math.max(existing.time, effect.time ?? 0);

            if (effect.type === "slow") {
                existing.value = Math.min(existing.value ?? 1, effect.value ?? 1);
            }

            if (effect.type === "burn") {
                existing.damage = Math.max(existing.damage ?? 0, effect.damage ?? 0);
                existing.interval = effect.interval ?? existing.interval ?? 0.5;
                existing.tick = Math.min(existing.tick ?? existing.interval, effect.tick ?? effect.interval ?? existing.interval);
                existing.source = effect.source ?? existing.source;
            }

            return true;
        }

        this.effects.push({ ...effect });
        return true;
    }

    updateEffects(dt, scene) {
        this.speed = this.baseSpeed;

        for (const effect of this.effects) {
            effect.time -= dt;

            if (effect.type === "slow" && !this.immuneSlow) {
                this.speed *= effect.value;
            }

            if (effect.type === "burn") {
                effect.tick -= dt;
                if (effect.tick <= 0) {
                    const didDamage = this.takeDamage(effect.damage);
                    if (didDamage) {
                        const color = effect.source === "poison" ? "#c084fc" : "#ff9f43";
                        scene?.spawnDamageNumber(this.x - 8, this.y - 18, effect.damage, color);
                        scene?.spawnImpact(this.x, this.y, color, 10);
                    }
                    effect.tick = effect.interval;
                }
            }
        }

        this.effects = this.effects.filter(effect => effect.time > 0);
    }

    updateBossBehavior(dt, scene) {
        if (!this.isBoss || this.dead || this.escaped) {
            return;
        }

        if (!this.enraged && this.hp <= this.maxHp * this.enrageThreshold) {
            this.enraged = true;
            this.baseSpeed += 10;
            this.speed = this.baseSpeed;
            scene?.spawnImpact(this.x, this.y, "#f43f5e", 30);
            scene?.spawnDamageNumber(this.x - 24, this.y - 24, "RAGE", "#fda4af");
        }

        if (!this.spawnMinionRole || this.spawnMinionCount <= 0 || this.spawnMinionInterval <= 0) {
            return;
        }

        this.minionTimer -= dt;
        if (this.minionTimer > 0) {
            return;
        }

        this.minionTimer = this.spawnMinionInterval;

        for (let i = 0; i < this.spawnMinionCount; i++) {
            scene?.spawnEnemy(this.spawnMinionRole);
        }

        scene?.spawnImpact(this.x, this.y, "#f87171", 22);
        scene?.spawnDamageNumber(this.x - 18, this.y - 20, "SUMMON", "#fecaca");
    }

    update(dt, scene) {
        if (this.dead || this.escaped) return;

        this.updateEffects(dt, scene);
        this.updateBossBehavior(dt, scene);

        if (this.flashTimer > 0) this.flashTimer -= dt;

        if (this.i >= this.path.length - 1) {
            this.escaped = true;
            return;
        }

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

    takeDamage(amount) {
        if (this.dead) return false;

        this.hp -= amount;
        this.flashTimer = 0.1;

        if (this.hp <= 0) {
            this.hp = 0;
            this.dead = true;
        }

        return true;
    }

    hasEffect(type) {
        return this.effects.some(effect => effect.type === type);
    }

    render(ctx) {
        if (this.dead) return;

        const slowed = !this.immuneSlow && this.hasEffect("slow");
        const burning = this.hasEffect("burn");

        ctx.save();

        if (slowed) {
            ctx.fillStyle = "rgba(96, 165, 250, 0.22)";
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 4, 0, Math.PI * 2);
            ctx.fill();
        }

        if (burning) {
            ctx.strokeStyle = "rgba(251, 146, 60, 0.95)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 5.5, 0, Math.PI * 2);
            ctx.stroke();
        }

        if (this.isBoss) {
            ctx.fillStyle = "rgba(239, 68, 68, 0.16)";
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 8, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = this.flashTimer > 0 ? "white" : this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.lineWidth = this.isBoss ? 3 : 2;
        ctx.strokeStyle = this.isBoss ? "#fee2e2" : slowed ? "#93c5fd" : "rgba(0,0,0,0.35)";
        ctx.stroke();

        if (this.isBoss) {
            this.drawBossCrown(ctx);
        }

        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.font = this.isBoss ? "bold 10px Arial" : "bold 9px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.name[0], this.x, this.y + 0.5);

        this.drawHealthBar(ctx);
        this.drawStatusIcons(ctx, slowed, burning);

        ctx.restore();
    }

    drawBossCrown(ctx) {
        const crownY = this.y - this.radius - 6;

        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.moveTo(this.x - 10, crownY + 4);
        ctx.lineTo(this.x - 6, crownY - 6);
        ctx.lineTo(this.x, crownY + 1);
        ctx.lineTo(this.x + 6, crownY - 6);
        ctx.lineTo(this.x + 10, crownY + 4);
        ctx.closePath();
        ctx.fill();
    }

    drawHealthBar(ctx) {
        const width = this.isBoss ? Math.max(44, this.radius * 2.8) : Math.max(18, this.radius * 2.2);
        const height = this.isBoss ? 6 : 4;
        const x = this.x - width / 2;
        const y = this.y - this.radius - (this.isBoss ? 16 : 10);
        const ratio = this.maxHp > 0 ? this.hp / this.maxHp : 0;

        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(x, y, width, height);

        ctx.fillStyle = ratio > 0.5 ? "#22c55e" : ratio > 0.25 ? "#f59e0b" : "#ef4444";
        ctx.fillRect(x, y, width * ratio, height);
    }

    drawStatusIcons(ctx, slowed, burning) {
        const iconY = this.y - this.radius - (this.isBoss ? 26 : 18);
        let iconX = this.x;

        const icons = [];
        if (this.immuneSlow) icons.push({ label: "I", fill: "#38bdf8" });
        else if (slowed) icons.push({ label: "S", fill: "#60a5fa" });
        if (burning) icons.push({ label: "B", fill: "#fb923c" });

        if (icons.length === 2) {
            iconX -= 8;
        }

        for (const icon of icons) {
            ctx.fillStyle = icon.fill;
            ctx.beginPath();
            ctx.arc(iconX, iconY, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "white";
            ctx.font = "bold 8px Arial";
            ctx.fillText(icon.label, iconX, iconY + 0.5);

            iconX += 16;
        }
    }
}
