export default class Enemy {
    constructor(path, stats = {}) {
        this.path = path;
        this.currentPoint = 0;

        this.x = path[0].x;
        this.y = path[0].y;

        this.type = stats.type ?? "Goblin";
        this.speed = stats.speed ?? 55;
        this.radius = stats.radius ?? 10;
        this.color = stats.color ?? "#b22222";
        this.reward = stats.reward ?? 10;
        this.damageToLives = stats.damageToLives ?? 1;

        this.maxHealth = stats.maxHealth ?? 60;
        this.health = this.maxHealth;

        this.isDead = false;
        this.reachedGoal = false;
    }

    update(dt) {
        if (this.isDead || this.reachedGoal) return;

        if (this.currentPoint >= this.path.length - 1) {
            this.reachedGoal = true;
            return;
        }

        const target = this.path[this.currentPoint + 1];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.hypot(dx, dy);

        if (distance <= 2) {
            this.currentPoint++;
            return;
        }

        this.x += (dx / distance) * this.speed * dt;
        this.y += (dy / distance) * this.speed * dt;
    }

    takeDamage(amount) {
        if (this.isDead) return;

        this.health -= amount;

        if (this.health <= 0) {
            this.health = 0;
            this.isDead = true;
        }
    }

    render(ctx) {
        if (this.isDead) return;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        const barWidth = 22;
        const barHeight = 4;
        const healthRatio = this.health / this.maxHealth;

        ctx.fillStyle = "#000";
        ctx.fillRect(this.x - barWidth / 2, this.y - 18, barWidth, barHeight);

        ctx.fillStyle = "#32cd32";
        ctx.fillRect(this.x - barWidth / 2, this.y - 18, barWidth * healthRatio, barHeight);
    }
}
