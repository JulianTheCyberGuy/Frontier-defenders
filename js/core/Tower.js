import Projectile from "./Projectile.js";

export default class Tower {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;

        this.level = 1;
        this.cool = 0;
        this.charge = 0;

        this.setBaseStats();
    }

    setBaseStats() {
        const stats = {
            archer: { range: 150, rate: 1, damage: 20, color: "green" },
            bomb: { range: 130, rate: 0.6, damage: 25, color: "orange" },
            berserker: { range: 50, rate: 1.2, damage: 25, color: "darkred" },
            rogue: { range: 40, rate: 2.5, damage: 10, color: "purple" },
            mage: { range: 160, rate: 0.8, damage: 30, color: "blue" }
        };

        Object.assign(this, stats[this.type]);
    }

    upgrade() {
        if (this.level === 3) return;

        this.level++;

        if (this.type === "archer") {
            this.damage += 10;
            this.rate += 0.3;
        }

        if (this.type === "bomb") {
            this.damage += 12;
            this.range += 10;
        }

        if (this.type === "berserker") {
            this.damage += 10;
            this.rate += 0.4;
        }

        if (this.type === "rogue") {
            this.damage += 5;
            this.rate += 0.8;
        }

        if (this.type === "mage") {
            this.damage += 10;
        }

        if (this.level === 3) {
            this.range += 20;
        }
    }

    update(dt, enemies, projectiles) {
        this.cool -= dt;

        let target = null;

        for (const e of enemies) {
            if (e.dead) continue;
            if (Math.hypot(e.x - this.x, e.y - this.y) < this.range) {
                target = e;
                break;
            }
        }

        if (target && this.cool <= 0) {

            // MELEE
            if (this.type === "berserker" || this.type === "rogue") {
                for (const e of enemies) {
                    if (!e.dead && Math.hypot(e.x - this.x, e.y - this.y) < this.range) {
                        e.takeDamage(this.damage);
                    }
                }
            }

            // BOMB
            else if (this.type === "bomb") {
                for (const e of enemies) {
                    if (!e.dead && Math.hypot(e.x - target.x, e.y - target.y) < 60) {
                        e.takeDamage(this.damage);
                    }
                }
            }

            // MAGE
            else if (this.type === "mage") {
                this.charge++;

                if (this.charge >= 3) {
                    for (const e of enemies) {
                        if (!e.dead && Math.hypot(e.x - this.x, e.y - this.y) < this.range) {
                            e.takeDamage(40 + this.level * 5);
                        }
                    }
                    this.charge = 0;
                } else {
                    projectiles.push(new Projectile(this.x, this.y, target, this.damage));
                }
            }

            // ARCHER
            else {
                projectiles.push(new Projectile(this.x, this.y, target, this.damage));
            }

            this.cool = 1 / this.rate;
        }
    }

    render(ctx) {
        const colors = {
            1: this.color,
            2: "cyan",
            3: "gold"
        };

        ctx.fillStyle = colors[this.level];
        ctx.beginPath();
        ctx.arc(this.x, this.y, 12, 0, Math.PI * 2);
        ctx.fill();
    }

    contains(x, y) {
        return Math.hypot(x - this.x, y - this.y) < 14;
    }
}