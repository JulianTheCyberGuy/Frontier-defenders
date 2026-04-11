import Projectile from "./Projectile.js";

export default class Tower {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;

        this.name = options.name ?? "Tower";
        this.color = options.color ?? "#3c8d2f";
        this.range = options.range ?? 140;
        this.fireRate = options.fireRate ?? 1.0;
        this.damage = options.damage ?? 20;
        this.projectileSpeed = options.projectileSpeed ?? 280;
        this.size = options.size ?? 14;
        this.projectileRadius = options.projectileRadius ?? 4;
        this.projectileColor = options.projectileColor ?? "#f0e2a0";
        this.splashRadius = options.splashRadius ?? 0;
        this.cost = options.cost ?? 50;

        this.cooldown = 0;
    }

    update(dt, enemies, projectiles) {
        if (this.cooldown > 0) {
            this.cooldown -= dt;
        }

        const target = this.findTarget(enemies);

        if (target && this.cooldown <= 0) {
            this.attack(target, enemies, projectiles);
            this.cooldown = 1 / this.fireRate;
        }
    }

    findTarget(enemies) {
        let bestTarget = null;
        let bestProgress = -1;

        for (const enemy of enemies) {
            if (enemy.isDead || enemy.reachedGoal) continue;

            const distance = Math.hypot(enemy.x - this.x, enemy.y - this.y);
            if (distance > this.range) continue;

            if (enemy.currentPoint > bestProgress) {
                bestProgress = enemy.currentPoint;
                bestTarget = enemy;
            }
        }

        return bestTarget;
    }

    attack(target, enemies, projectiles) {
        const projectile = new Projectile({
            x: this.x,
            y: this.y,
            target,
            damage: this.damage,
            speed: this.projectileSpeed,
            radius: this.projectileRadius,
            color: this.projectileColor,
            splashRadius: this.splashRadius,
            onImpact: (proj) => {
                if (proj.splashRadius > 0) {
                    for (const enemy of enemies) {
                        if (enemy.isDead || enemy.reachedGoal) continue;

                        const distance = Math.hypot(enemy.x - proj.x, enemy.y - proj.y);
                        if (distance <= proj.splashRadius) {
                            enemy.takeDamage(proj.damage);
                        }
                    }
                } else if (proj.target && !proj.target.isDead) {
                    proj.target.takeDamage(proj.damage);
                }
            }
        });

        projectiles.push(projectile);
    }

    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(0,0,0,0.4)";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#d9c27a";
        ctx.fillRect(this.x - 3, this.y - 18, 6, 20);
    }

    renderRange(ctx) {
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}
