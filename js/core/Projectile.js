export default class Projectile {
    constructor(x, y, target, damage, options = {}) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.damage = damage;
        this.dead = false;

        this.speed = options.speed ?? 300;
        this.radius = options.radius ?? 4;
        this.color = options.color ?? "yellow";
        this.onHit = options.onHit;
        this.pierceCount = options.pierceCount ?? 0;
        this.hitEnemies = new Set();
        this.chainColor = options.chainColor ?? this.color;
        this.labelColor = options.labelColor ?? "#ffffff";
    }

    update(dt, scene) {
        if (!this.target || this.target.dead || this.target.escaped) {
            this.dead = true;
            return;
        }

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < this.radius + this.target.radius * 0.5) {
            this.hitEnemies.add(this.target);

            if (this.damage > 0) {
                const didDamage = this.target.takeDamage(this.damage);
                if (didDamage) {
                    scene?.spawnDamageNumber(this.target.x - 8, this.target.y - 16, this.damage, this.labelColor);
                }
            }

            scene?.spawnImpact(this.target.x, this.target.y, this.color, 12);

            if (this.onHit) {
                this.onHit(this.target, scene, this);
            }

            if (this.pierceCount > 0) {
                const nextTarget = scene?.getPierceContinuationTarget(this.target, this.hitEnemies);
                if (nextTarget) {
                    this.target = nextTarget;
                    this.pierceCount -= 1;
                    return;
                }
            }

            this.dead = true;
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
