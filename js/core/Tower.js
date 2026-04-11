import Projectile from "./Projectile.js";

export const TOWER_TYPES = {
    ARCHER: "ARCHER",
    BOMB: "BOMB"
};

const TOWER_STATS = {
    [TOWER_TYPES.ARCHER]: {
        label: "Archer",
        cost: 50,
        range: 140,
        fireRate: 1.0,
        damage: 20,
        projectileSpeed: 280,
        size: 14,
        color: "#3c8d2f",
        accentColor: "#1d4f17",
        projectileColor: "#f4e4a6",
        projectileStrokeColor: "#7a5f1a",
        splashRadius: 0,
        explosionColor: "rgba(255, 170, 40, 0.35)"
    },
    [TOWER_TYPES.BOMB]: {
        label: "Bomb Thrower",
        cost: 80,
        range: 125,
        fireRate: 0.55,
        damage: 28,
        projectileSpeed: 190,
        size: 16,
        color: "#8c5a2b",
        accentColor: "#4f3111",
        projectileColor: "#2f2f2f",
        projectileStrokeColor: "#c98728",
        splashRadius: 42,
        explosionColor: "rgba(255, 140, 40, 0.4)"
    }
};

export function getTowerCost(type) {
    return TOWER_STATS[type]?.cost ?? 0;
}

export function getTowerLabel(type) {
    return TOWER_STATS[type]?.label ?? "Unknown";
}

export function getTowerStats(type) {
    return TOWER_STATS[type];
}

export default class Tower {
    constructor(x, y, type = TOWER_TYPES.ARCHER) {
        const stats = TOWER_STATS[type];

        this.x = x;
        this.y = y;
        this.type = type;
        this.label = stats.label;

        this.range = stats.range;
        this.fireRate = stats.fireRate;
        this.damage = stats.damage;
        this.projectileSpeed = stats.projectileSpeed;
        this.size = stats.size;
        this.color = stats.color;
        this.accentColor = stats.accentColor;
        this.projectileColor = stats.projectileColor;
        this.projectileStrokeColor = stats.projectileStrokeColor;
        this.splashRadius = stats.splashRadius;
        this.explosionColor = stats.explosionColor;

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

    attack(target, enemies, projectiles) {
        projectiles.push(
            new Projectile(this.x, this.y, target, this.damage, this.projectileSpeed, {
                color: this.projectileColor,
                strokeColor: this.projectileStrokeColor,
                splashRadius: this.splashRadius,
                explosionColor: this.explosionColor,
                enemies
            })
        );
    }

    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = this.accentColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        if (this.type === TOWER_TYPES.ARCHER) {
            ctx.fillStyle = "#d9c27a";
            ctx.fillRect(this.x - 3, this.y - 18, 6, 20);
            ctx.fillRect(this.x - 8, this.y - 8, 16, 4);
        } else if (this.type === TOWER_TYPES.BOMB) {
            ctx.fillStyle = "#d4b483";
            ctx.fillRect(this.x - 8, this.y - 6, 16, 12);
            ctx.fillStyle = "#3b2a18";
            ctx.beginPath();
            ctx.arc(this.x, this.y - 14, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    renderRange(ctx) {
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}
