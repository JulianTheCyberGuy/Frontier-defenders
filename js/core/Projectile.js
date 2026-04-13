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
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
