import Projectile from "./Projectile.js";

export default class Tower {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.range = 140;
        this.fireRate = 1.0;
        this.damage = 20;
        this.projectileSpeed = 280;

        this.cooldown = 0;
        this.size = 14;
        this.type = "Archer";
        this.color = "#3c8d2f";
    }

    update(dt, enemies, projectiles) {
        if (this.cooldown > 0) {
            this.cooldown -= dt;
        }

        const target = this.findTarget(enemies);

        if (target && this.cooldown <= 0) {
            this.attack(target, projectiles);
            this.cooldown = 1 / this.fireRate;
        }
    }

    findTarget(enemies) {
        let bestTarget = null;
        let bestProgress = -1;

        for (const enemy of enemies) {
            if (enemy.isDead || enemy.reachedGoal) continue;

            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const distance = Math.hypot(dx, dy);

            if (distance <= this.range) {
                if (enemy.currentPoint > bestProgress) {
                    bestProgress = enemy.currentPoint;
                    bestTarget = enemy;
                }
            }
        }

        return bestTarget;
    }

    attack(target, projectiles) {
        projectiles.push(
            new Projectile(
                this.x,
                this.y,
                target,
                this.damage,
                this.projectileSpeed
            )
        );
    }

    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#1d4f17";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#d9c27a";
        ctx.fillRect(this.x - 3, this.y - 18, 6, 20);
    }

    renderRange(ctx) {
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.18)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}