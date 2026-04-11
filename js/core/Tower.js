import Projectile from "./Projectile.js";

export default class Tower {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;

        this.level = 1;
        this.cool = 0;
        this.charge = 0;
        this.branch = null;
        this.maxLevel = 3;

        this.setBaseStats();
    }

    setBaseStats() {
        const stats = {
            archer: {
                range: 150,
                rate: 1.0,
                damage: 20,
                color: "green",
                name: "Archer"
            },
            bomb: {
                range: 130,
                rate: 0.6,
                damage: 25,
                color: "orange",
                name: "Bomb"
            },
            berserker: {
                range: 50,
                rate: 1.2,
                damage: 25,
                color: "darkred",
                name: "Berserker"
            },
            rogue: {
                range: 40,
                rate: 2.5,
                damage: 10,
                color: "purple",
                name: "Rogue"
            },
            mage: {
                range: 160,
                rate: 0.8,
                damage: 30,
                color: "blue",
                name: "Mage"
            }
        };

        Object.assign(this, stats[this.type]);
    }

    getUpgradeCost() {
        if (this.level >= this.maxLevel) return null;

        const costs = {
            1: 50,
            2: 80
        };

        return costs[this.level];
    }

    getUpgradeChoices() {
        if (this.level >= this.maxLevel) {
            return [];
        }

        if (this.level === 1) {
            return [
                { id: "left", label: this.getLevel2LeftLabel() },
                { id: "right", label: this.getLevel2RightLabel() }
            ];
        }

        if (this.level === 2) {
            return [
                { id: this.branch, label: this.getLevel3Label() }
            ];
        }

        return [];
    }

    getLevel2LeftLabel() {
        const labels = {
            archer: "Rapid Shots",
            bomb: "Big Blast",
            berserker: "Heavy Swings",
            rogue: "Quick Blades",
            mage: "Arcane Power"
        };

        return labels[this.type];
    }

    getLevel2RightLabel() {
        const labels = {
            archer: "Long Range",
            bomb: "Fast Throws",
            berserker: "Battle Reach",
            rogue: "Venom Edge",
            mage: "Swift Charge"
        };

        return labels[this.type];
    }

    getLevel3Label() {
        const labels = {
            archer: {
                left: "Storm Archer",
                right: "Deadeye Archer"
            },
            bomb: {
                left: "Siege Bomber",
                right: "Grenadier"
            },
            berserker: {
                left: "Executioner",
                right: "Warlord"
            },
            rogue: {
                left: "Shadow Dancer",
                right: "Venom Master"
            },
            mage: {
                left: "Meteor Sage",
                right: "Storm Mage"
            }
        };

        return labels[this.type][this.branch];
    }

    upgrade(pathId) {
        if (this.level >= this.maxLevel) {
            return false;
        }

        if (this.level === 1) {
            this.applyFirstUpgrade(pathId);
            this.branch = pathId;
            this.level = 2;
            return true;
        }

        if (this.level === 2 && pathId === this.branch) {
            this.applyFinalUpgrade();
            this.level = 3;
            return true;
        }

        return false;
    }

    applyFirstUpgrade(pathId) {
        if (this.type === "archer") {
            if (pathId === "left") {
                this.rate += 0.6;
                this.damage += 6;
            } else {
                this.range += 45;
                this.damage += 4;
            }
        }

        if (this.type === "bomb") {
            if (pathId === "left") {
                this.damage += 10;
                this.splashRadius = 80;
            } else {
                this.rate += 0.35;
                this.damage += 5;
            }
        }

        if (this.type === "berserker") {
            if (pathId === "left") {
                this.damage += 12;
                this.rate += 0.15;
            } else {
                this.range += 20;
                this.damage += 6;
            }
        }

        if (this.type === "rogue") {
            if (pathId === "left") {
                this.rate += 1.2;
                this.damage += 3;
            } else {
                this.damage += 5;
                this.poisonDamage = 4;
            }
        }

        if (this.type === "mage") {
            if (pathId === "left") {
                this.damage += 12;
            } else {
                this.rate += 0.35;
                this.chargeThreshold = 2;
            }
        }
    }

    applyFinalUpgrade() {
        if (this.type === "archer") {
            if (this.branch === "left") {
                this.rate += 0.8;
                this.damage += 8;
            } else {
                this.range += 35;
                this.damage += 10;
            }
        }

        if (this.type === "bomb") {
            if (this.branch === "left") {
                this.damage += 14;
                this.splashRadius = 100;
            } else {
                this.rate += 0.5;
                this.damage += 8;
            }
        }

        if (this.type === "berserker") {
            if (this.branch === "left") {
                this.damage += 15;
            } else {
                this.range += 15;
                this.rate += 0.35;
            }
        }

        if (this.type === "rogue") {
            if (this.branch === "left") {
                this.rate += 1.0;
                this.damage += 4;
            } else {
                this.damage += 8;
                this.poisonDamage = 8;
            }
        }

        if (this.type === "mage") {
            if (this.branch === "left") {
                this.damage += 16;
            } else {
                this.rate += 0.45;
                this.chargeThreshold = 2;
            }
        }

        this.range += 20;
    }

    update(dt, enemies, projectiles) {
        this.cool -= dt;

        let target = null;

        for (const enemy of enemies) {
            if (enemy.dead) continue;

            const distance = Math.hypot(enemy.x - this.x, enemy.y - this.y);
            if (distance < this.range) {
                target = enemy;
                break;
            }
        }

        if (!target || this.cool > 0) {
            return;
        }

        if (this.type === "berserker" || this.type === "rogue") {
            for (const enemy of enemies) {
                if (enemy.dead) continue;

                const distance = Math.hypot(enemy.x - this.x, enemy.y - this.y);
                if (distance < this.range) {
                    enemy.takeDamage(this.damage);

                    if (this.type === "rogue" && this.poisonDamage) {
                        enemy.takeDamage(this.poisonDamage);
                    }
                }
            }
        } else if (this.type === "bomb") {
            const splash = this.splashRadius ?? 60;

            for (const enemy of enemies) {
                if (enemy.dead) continue;

                const distance = Math.hypot(enemy.x - target.x, enemy.y - target.y);
                if (distance < splash) {
                    enemy.takeDamage(this.damage);
                }
            }
        } else if (this.type === "mage") {
            this.charge++;
            const threshold = this.chargeThreshold ?? 3;

            if (this.charge >= threshold) {
                for (const enemy of enemies) {
                    if (enemy.dead) continue;

                    const distance = Math.hypot(enemy.x - this.x, enemy.y - this.y);
                    if (distance < this.range) {
                        enemy.takeDamage(40 + this.level * 10);
                    }
                }

                this.charge = 0;
            } else {
                projectiles.push(new Projectile(this.x, this.y, target, this.damage));
            }
        } else {
            projectiles.push(new Projectile(this.x, this.y, target, this.damage));
        }

        this.cool = 1 / this.rate;
    }

    getDisplayStats() {
        return {
            name: this.name,
            level: this.level,
            damage: this.damage,
            range: Math.round(this.range),
            rate: this.rate.toFixed(2),
            path: this.branch ? this.getLevel3Label() : "None"
        };
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

        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    contains(x, y) {
        return Math.hypot(x - this.x, y - this.y) < 14;
    }
}