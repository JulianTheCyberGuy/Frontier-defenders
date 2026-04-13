export default class Enemy {
    constructor(path, stats = {}) {
        this.path = path;
        this.i = 0;

        this.x = path[0].x;
        this.y = path[0].y;

        this.name = stats.name ?? "Enemy";
        this.maxHp = stats.hp ?? 100;
        this.hp = this.maxHp;
        this.speed = stats.speed ?? 50;
        this.reward = stats.reward ?? 10;
        this.radius = stats.radius ?? 10;
        this.color = stats.color ?? "red";

        this.dead = false;
        this.escaped = false;

        this.flashTimer = 0;
    }

    update(dt) {
        if (this.dead || this.escaped) return;

        if (this.flashTimer > 0) {
            this.flashTimer -= dt;
        }

        if (this.i >= this.path.length - 1) {
            this.escaped = true;
            return;
        }

        const target = this.path[this.i + 1];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 2) {
            this.i++;
            return;
        }

        this.x += (dx / distance) * this.speed * dt;
        this.y += (dy / distance) * this.speed * dt;
    }

    takeDamage(amount) {
        if (this.dead) return false;

        this.hp -= amount;
        this.flashTimer = 0.12;

        if (this.hp <= 0) {
            this.hp = 0;
            this.dead = true;
        }

        return true;
    }

    render(ctx) {
        if (this.dead) return;

        ctx.fillStyle = this.flashTimer > 0 ? "#ffffff" : this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        const barWidth = 24;
        const barHeight = 4;
        const ratio = this.hp / this.maxHp;

        ctx.fillStyle = "#111";
        ctx.fillRect(this.x - barWidth / 2, this.y - 18, barWidth, barHeight);

        ctx.fillStyle = "#39d353";
        ctx.fillRect(this.x - barWidth / 2, this.y - 18, barWidth * ratio, barHeight);
    }
}