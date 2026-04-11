export default class Projectile {
    constructor(x, y, target, damage, speed) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.damage = damage;
        this.speed = speed;

        this.radius = 4;
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
            this.target.takeDamage(this.damage);
            this.isExpired = true;
            return;
        }

        this.x += (dx / distance) * this.speed * dt;
        this.y += (dy / distance) * this.speed * dt;
    }

    render(ctx) {
        if (this.isExpired) return;

        ctx.fillStyle = "#f4e4a6";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#7a5f1a";
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}