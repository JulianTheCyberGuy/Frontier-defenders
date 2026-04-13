export default class Projectile {
    constructor(x, y, target, damage, options = {}) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.damage = damage;
        this.dead = false;

        this.speed = 300;
        this.onHit = options.onHit;
    }

    update(dt) {
        if (!this.target || this.target.dead) {
            this.dead = true;
            return;
        }

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 5) {
            this.target.takeDamage(this.damage);

            if (this.onHit) this.onHit(this.target);

            this.dead = true;
            return;
        }

        this.x += (dx / dist) * this.speed * dt;
        this.y += (dy / dist) * this.speed * dt;
    }

    render(ctx) {
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}
