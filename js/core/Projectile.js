export default class Projectile {
    constructor(options) {
        this.x = options.x;
        this.y = options.y;
        this.target = options.target;
        this.damage = options.damage;
        this.speed = options.speed ?? 280;
        this.radius = options.radius ?? 4;
        this.color = options.color ?? "#f0e2a0";
        this.splashRadius = options.splashRadius ?? 0;
        this.onImpact = options.onImpact ?? null;

        this.isExpired = false;
    }

    update(dt) {
        if (this.isExpired) return;

        if (!this.target || this.target.isDead || this.target.reachedGoal) {
            this.isExpired = true;
            return;
        }

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.hypot(dx, dy);

        if (distance <= this.radius + this.target.radius) {
            this.hit();
            return;
        }

        this.x += (dx / distance) * this.speed * dt;
        this.y += (dy / distance) * this.speed * dt;
    }

    hit() {
        if (this.isExpired) return;

        if (typeof this.onImpact === "function") {
            this.onImpact(this);
        } else if (this.target && !this.target.isDead) {
            this.target.takeDamage(this.damage);
        }

        this.isExpired = true;
    }

    render(ctx) {
        if (this.isExpired) return;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(0,0,0,0.35)";
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}
