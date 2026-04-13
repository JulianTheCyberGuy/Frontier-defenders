export default class Projectile {
    constructor(x, y, target, damage, options = {}) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.damage = damage;
        this.dead = false;

        this.speed = options.speed ?? 320;
        this.color = options.color ?? "#ffd54f";
        this.radius = options.radius ?? 4;
        this.onHit = options.onHit;
        this.scene = options.scene ?? null;
        this.pierce = options.pierce ?? 0;
        this.hitEnemies = new Set();
        this.trail = [];
        this.pulse = Math.random() * Math.PI * 2;
    }

    hitTarget(target) {
        if (!target || target.dead || this.hitEnemies.has(target)) return;

        target.takeDamage(this.damage, {
            color: this.color,
            impactColor: this.color,
            maxImpactRadius: 14
        });

        if (this.scene && this.scene.soundManager && this.radius >= 6) {
            this.scene.soundManager.playExplosion();
        }

        this.hitEnemies.add(target);
        if (this.onHit) this.onHit(target, this.scene);

        if (this.pierce > 0) {
            this.pierce -= 1;
            const nextTarget = this.findNextTarget();
            if (nextTarget) {
                this.target = nextTarget;
                return;
            }
        }

        this.dead = true;
    }

    findNextTarget() {
        if (!this.scene) return null;

        let bestTarget = null;
        let bestDistance = Infinity;

        for (const enemy of this.scene.enemies) {
            if (enemy.dead || enemy.escaped || this.hitEnemies.has(enemy)) continue;
            const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
            if (dist < 170 && dist < bestDistance) {
                bestDistance = dist;
                bestTarget = enemy;
            }
        }

        return bestTarget;
    }

    update(dt) {
        if (!this.target || this.target.dead || this.target.escaped) {
            this.dead = true;
            return;
        }

        this.pulse += dt * 12;
        this.trail.push({ x: this.x, y: this.y, life: 0.16, maxLife: 0.16, radius: this.radius + 1 });
        for (const point of this.trail) {
            point.life -= dt;
        }
        this.trail = this.trail.filter((point) => point.life > 0);

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < this.target.radius + 5) {
            this.hitTarget(this.target);
            return;
        }

        this.x += (dx / dist) * this.speed * dt;
        this.y += (dy / dist) * this.speed * dt;
    }

    render(ctx) {
        ctx.save();

        for (const point of this.trail) {
            const alpha = point.life / point.maxLife;
            ctx.globalAlpha = alpha * 0.45;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(point.x, point.y, point.radius * alpha, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = 1;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + Math.sin(this.pulse) * 0.45, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.beginPath();
        ctx.arc(this.x - this.radius * 0.25, this.y - this.radius * 0.25, Math.max(1.2, this.radius * 0.42), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
