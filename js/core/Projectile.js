export default class Projectile {
    constructor(x, y, target, damage, speed, options = {}) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.damage = damage;
        this.speed = speed;

        this.radius = options.radius ?? 4;
        this.color = options.color ?? "#f4e4a6";
        this.strokeColor = options.strokeColor ?? "#7a5f1a";
        this.splashRadius = options.splashRadius ?? 0;
        this.explosionColor = options.explosionColor ?? "rgba(255, 170, 40, 0.35)";
        this.enemies = options.enemies ?? [];

        this.isExpired = false;
        this.explosionTime = 0;
        this.maxExplosionTime = 0.12;
        this.hasExploded = false;
        this.explosionX = x;
        this.explosionY = y;
    }

    update(dt) {
        if (this.isExpired) return;

        if (this.hasExploded) {
            this.explosionTime -= dt;
            if (this.explosionTime <= 0) {
                this.isExpired = true;
            }
            return;
        }

        if (!this.target || this.target.isDead || this.target.reachedGoal) {
            this.isExpired = true;
            return;
        }

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.hypot(dx, dy);

        if (distance <= this.radius + this.target.radius) {
            this.onHit();
            return;
        }

        this.x += (dx / distance) * this.speed * dt;
        this.y += (dy / distance) * this.speed * dt;
    }

    onHit() {
        this.explosionX = this.target.x;
        this.explosionY = this.target.y;

        if (this.splashRadius > 0) {
            for (const enemy of this.enemies) {
                if (enemy.isDead || enemy.reachedGoal) continue;

                const dx = enemy.x - this.explosionX;
                const dy = enemy.y - this.explosionY;
                const distance = Math.hypot(dx, dy);

                if (distance <= this.splashRadius) {
                    enemy.takeDamage(this.damage);
                }
            }
        } else {
            this.target.takeDamage(this.damage);
        }

        this.hasExploded = true;
        this.explosionTime = this.maxExplosionTime;
    }

    render(ctx) {
        if (this.isExpired) return;

        if (this.hasExploded) {
            if (this.splashRadius > 0) {
                ctx.save();
                ctx.fillStyle = this.explosionColor;
                ctx.beginPath();
                ctx.arc(this.explosionX, this.explosionY, this.splashRadius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
            return;
        }

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}
