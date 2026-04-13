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
        this.onHit = options.onHit ?? null;
    }

    update(dt) {
        if (this.dead || !this.target || this.target.dead) {
            this.dead = true;
            return;
        }

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.hypot(dx, dy);

        if (distance < this.radius + this.target.radius * 0.6) {
            const hitX = this.target.x;
            const hitY = this.target.y;
            const didDamage = this.target.takeDamage(this.damage);

            if (didDamage && this.onHit) {
                this.onHit({
                    x: hitX,
                    y: hitY,
                    damage: this.damage,
                    color: this.color
                });
            }

            this.dead = true;
            return;
        }

        this.x += (dx / distance) * this.speed * dt;
        this.y += (dy / distance) * this.speed * dt;
    }

    render(ctx) {
        if (this.dead) return;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(255,255,255,0.35)";
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}