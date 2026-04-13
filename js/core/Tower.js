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
                color: "#4caf50",
                projectileColor: "#d9f99d",
                projectileRadius: 4,
                name: "Archer"
            },
            bomb: {
                range: 135,
                rate: 0.65,
                damage: 28,
                color: "#d97706",
                projectileColor: "#fb923c",
                projectileRadius: 6,
                splashRadius: 64,
                name: "Bomb"
            },
            berserker: {
                range: 52,
                rate: 1.1,
                damage: 26,
                color: "#991b1b",
                name: "Berserker"
            },
            rogue: {
                range: 42,
                rate: 2.2,
                damage: 12,
                color: "#7c3aed",
                name: "Rogue"
            },
            mage: {
                range: 165,
                rate: 0.85,
                damage: 30,
                color: "#2563eb",
                projectileColor: "#93c5fd",
                projectileRadius: 5,
                burnDamage: 4,
                burnDuration: 3,
                burnInterval: 0.6,
                meteorDamage: 52,
                meteorRadius: 92,
                chargeThreshold: 3,
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
            return [{ id: this.branch, label: this.getLevel3Label() }];
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
                this.rate += 0.65;
                this.damage += 6;
            } else {
                this.range += 45;
                this.damage += 4;
            }
        }

        if (this.type === "bomb") {
            if (pathId === "left") {
                this.damage += 12;
                this.splashRadius += 20;
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
                this.range += 18;
                this.damage += 6;
            }
        }

        if (this.type === "rogue") {
            if (pathId === "left") {
                this.rate += 1.0;
                this.damage += 3;
            } else {
                this.damage += 5;
                this.poisonDamage = 5;
            }
        }

        if (this.type === "mage") {
            if (pathId === "left") {
                this.damage += 12;
                this.meteorDamage += 12;
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
                this.damage += 16;
                this.splashRadius += 20;
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
                this.rate += 0.9;
                this.damage += 4;
            } else {
                this.damage += 8;
                this.poisonDamage = 9;
            }
        }

        if (this.type === "mage") {
            if (this.branch === "left") {
                this.damage += 16;
                this.meteorDamage += 16;
            } else {
                this.rate += 0.45;
                this.chargeThreshold = 2;
                this.burnDamage += 2;
            }
        }

        this.range += 20;
    }

    findTarget(enemies) {
        let target = null;
        let bestProgress = -1;

        for (const enemy of enemies) {
            if (enemy.dead || enemy.escaped) continue;

            const distance = Math.hypot(enemy.x - this.x, enemy.y - this.y);
            if (distance > this.range) continue;

            if (enemy.i > bestProgress) {
                bestProgress = enemy.i;
                target = enemy;
            }
        }

        return target;
    }

    update(dt, enemies, projectiles, scene) {
        this.cool -= dt;

        const target = this.findTarget(enemies);
        if (!target || this.cool > 0) {
            return;
        }

        if (this.type === "berserker") {
            this.performBerserkerAttack(enemies, scene);
        } else if (this.type === "rogue") {
            this.performRogueAttack(target, scene);
        } else if (this.type === "bomb") {
            this.fireBomb(target, enemies, projectiles, scene);
        } else if (this.type === "mage") {
            this.castMageAttack(target, enemies, projectiles, scene);
        } else {
            this.fireArcherShot(target, projectiles);
        }

        this.cool = 1 / this.rate;
    }

    performBerserkerAttack(enemies, scene) {
        const cleaveTargets = enemies
            .filter(enemy => !enemy.dead && !enemy.escaped && Math.hypot(enemy.x - this.x, enemy.y - this.y) <= this.range)
            .slice(0, 2);

        for (const enemy of cleaveTargets) {
            const didDamage = enemy.takeDamage(this.damage);
            if (!didDamage) continue;

            scene?.spawnDamageNumber(enemy.x - 8, enemy.y - 14, this.damage, "#ffb4a2");
            scene?.spawnImpact(enemy.x, enemy.y, "#ff7b72", 16);
        }
    }

    performRogueAttack(target, scene) {
        const didDamage = target.takeDamage(this.damage);
        if (!didDamage) return;

        scene?.spawnDamageNumber(target.x - 8, target.y - 16, this.damage, "#ddb6ff");
        scene?.spawnImpact(target.x, target.y, "#c084fc", 12);

        if (this.poisonDamage) {
            target.applyEffect({
                type: "burn",
                time: 2.4,
                damage: this.poisonDamage,
                interval: 0.8,
                tick: 0.8,
                source: "poison"
            });
        }
    }

    fireArcherShot(target, projectiles) {
        projectiles.push(
            new Projectile(this.x, this.y, target, this.damage, {
                color: this.projectileColor,
                radius: this.projectileRadius,
                onHit: enemy => {
                    enemy.applyEffect({
                        type: "slow",
                        time: 2.2,
                        value: 0.72
                    });
                }
            })
        );
    }

    fireBomb(target, enemies, projectiles, scene) {
        projectiles.push(
            new Projectile(this.x, this.y, target, 0, {
                color: this.projectileColor,
                radius: this.projectileRadius,
                speed: 220,
                onHit: hitEnemy => {
                    scene?.spawnImpact(hitEnemy.x, hitEnemy.y, "#fb923c", this.splashRadius * 0.42);

                    for (const enemy of enemies) {
                        if (enemy.dead || enemy.escaped) continue;

                        const distance = Math.hypot(enemy.x - hitEnemy.x, enemy.y - hitEnemy.y);
                        if (distance > this.splashRadius) continue;

                        const falloff = Math.max(0.55, 1 - distance / (this.splashRadius * 1.25));
                        const dealt = Math.round(this.damage * falloff);
                        const didDamage = enemy.takeDamage(dealt);
                        if (!didDamage) continue;

                        scene?.spawnDamageNumber(enemy.x - 10, enemy.y - 16, dealt, "#ffd39f");
                    }
                }
            })
        );
    }

    castMageAttack(target, enemies, projectiles, scene) {
        this.charge += 1;

        if (this.charge >= this.chargeThreshold) {
            for (const enemy of enemies) {
                if (enemy.dead || enemy.escaped) continue;

                const distance = Math.hypot(enemy.x - target.x, enemy.y - target.y);
                if (distance > this.meteorRadius) continue;

                const didDamage = enemy.takeDamage(this.meteorDamage);
                if (!didDamage) continue;

                enemy.applyEffect({
                    type: "burn",
                    time: this.burnDuration,
                    damage: this.burnDamage,
                    interval: this.burnInterval,
                    tick: this.burnInterval,
                    source: "fire"
                });

                scene?.spawnDamageNumber(enemy.x - 10, enemy.y - 16, this.meteorDamage, "#ffb86b");
            }

            scene?.spawnImpact(target.x, target.y, "#f97316", this.meteorRadius * 0.36);
            this.charge = 0;
            return;
        }

        projectiles.push(
            new Projectile(this.x, this.y, target, this.damage, {
                color: this.projectileColor,
                radius: this.projectileRadius,
                onHit: enemy => {
                    enemy.applyEffect({
                        type: "burn",
                        time: this.burnDuration,
                        damage: this.burnDamage,
                        interval: this.burnInterval,
                        tick: this.burnInterval,
                        source: "fire"
                    });
                }
            })
        );
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
        const rimColors = {
            1: "rgba(255,255,255,0.20)",
            2: "#7dd3fc",
            3: "#facc15"
        };

        ctx.save();
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.lineWidth = 3;
        ctx.strokeStyle = rimColors[this.level];
        ctx.stroke();

        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.font = "bold 10px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.name[0], this.x, this.y + 0.5);
        ctx.restore();
    }

    contains(x, y) {
        return Math.hypot(x - this.x, y - this.y) < 14;
    }
}
