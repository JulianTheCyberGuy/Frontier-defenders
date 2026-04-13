import Projectile from "./Projectile.js";

export default class Tower {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;

        this.cool = 0;
        this.range = 140;
        this.damage = 20;
        this.rate = 1;
    }

    update(dt, enemies, projectiles) {
        this.cool -= dt;

        let target = enemies.find(e => !e.dead && Math.hypot(e.x - this.x, e.y - this.y) < this.range);
        if (!target || this.cool > 0) return;

        if (this.type === "mage") {
            projectiles.push(new Projectile(this.x, this.y, target, this.damage, {
                onHit: (enemy) => {
                    enemy.applyEffect({ type: "burn", time: 3, damage: 2, interval: 0.5, tick: 0.5 });
                }
            }));
        } else if (this.type === "archer") {
            projectiles.push(new Projectile(this.x, this.y, target, this.damage, {
                onHit: (enemy) => {
                    enemy.applyEffect({ type: "slow", time: 2, value: 0.7 });
                }
            }));
        } else {
            projectiles.push(new Projectile(this.x, this.y, target, this.damage));
        }

        this.cool = 1 / this.rate;
    }

    render(ctx) {
        ctx.fillStyle = "blue";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
        ctx.fill();
    }

    contains(x, y) {
        return Math.hypot(x - this.x, y - this.y) < 12;
    }
}
