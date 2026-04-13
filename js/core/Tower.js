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

        this.multiShot = false;
        this.pierceShots = false;
        this.chainLightning = false;
        this.freezeShots = false;
        this.critChance = 0;
        this.critMultiplier = 1.5;
        this.backstabBonus = 0;
        this.cleaveHits = 2;
        this.rageMode = false;
        this.stunBlast = false;
        this.fireZone = false;

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
            archer: "Draw Speed",
            bomb: "Crushing Payload",
            berserker: "Wide Swings",
            rogue: "Assassin Training",
            mage: "Storm Focus"
        };

        return labels[this.type];
    }

    getLevel2RightLabel() {
        const labels = {
            archer: "Sharpsight",
            bomb: "Lingering Powder",
            berserker: "Battle Fury",
            rogue: "Shadow Step",
            mage: "Cold Study"
        };

        return labels[this.type];
    }

    getLevel3Label() {
        const labels = {
            archer: {
                left: "Multi-Shot",
                right: "Piercing Arrows"
            },
            bomb: {
                left: "Concussive Blast",
                right: "Fire Zone"
            },
            berserker: {
                left: "Cleave",
                right: "Rage Mode"
            },
            rogue: {
                left: "Critical Strikes",
                right: "Backstab"
            },
            mage: {
                left: "Chain Lightning",
                right: "Freeze"
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
                this.rate += 0.5;
                this.damage += 4;
            } else {
                this.range += 35;
                this.damage += 6;
            }
        }

        if (this.type === "bomb") {
            if (pathId === "left") {
                this.damage += 10;
                this.splashRadius += 18;
            } else {
                this.rate += 0.25;
                this.splashRadius += 10;
            }
        }

        if (this.type === "berserker") {
            if (pathId === "left") {
                this.damage += 10;
                this.range += 6;
            } else {
                this.rate += 0.2;
                this.damage += 5;
            }
        }

        if (this.type === "rogue") {
            if (pathId === "left") {
                this.rate += 0.7;
                this.damage += 4;
            } else {
                this.damage += 6;
                this.range += 8;
            }
        }

        if (this.type === "mage") {
            if (pathId === "left") {
                this.damage += 10;
                this.meteorDamage += 10;
            } else {
                this.rate += 0.3;
                this.burnDamage += 1;
            }
        }
    }

    applyFinalUpgrade() {
        if (this.type === "archer") {
            if (this.branch === "left") {
                this.multiShot = true;
                this.damage += 4;
                this.rate += 0.25;
            } else {
                this.pierceShots = true;
                this.damage += 10;
                this.range += 25;
            }
        }

        if (this.type === "bomb") {
            if (this.branch === "left") {
                this.stunBlast = true;
                this.damage += 12;
                this.splashRadius += 14;
            } else {
                this.fireZone = true;
                this.damage += 6;
                this.rate += 0.2;
            }
        }

        if (this.type === "berserker") {
            if (this.branch === "left") {
                this.cleaveHits = 4;
                this.damage += 10;
                this.range += 8;
            } else {
                this.rageMode = true;
                this.damage += 8;
            }
        }

        if (this.type === "rogue") {
            if (this.branch === "left") {
                this.critChance = 0.35;
                this.critMultiplier = 2.2;
                this.damage += 5;
            } else {
                this.backstabBonus = 18;
                this.rate += 0.4;
            }
        }

        if (this.type === "mage") {
            if (this.branch === "left") {
                this.chainLightning = true;
                this.damage += 8;
                this.meteorDamage += 12;
            } else {
                this.freezeShots = true;
                this.damage += 5;
                this.chargeThreshold = 2;
            }
        }

        this.range += 12;
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

    getCurrentRate(scene) {
        if (!this.rageMode) {
            return this.rate;
        }

        const maxLives = 20;
        const lostRatio = Math.max(0, Math.min(1, (maxLives - (scene?.lives ?? maxLives)) / maxLives));
        return this.rate * (1 + lostRatio * 1.2);
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
            this.fireArcherShot(target, enemies, projectiles, scene);
        }

        this.cool = 1 / this.getCurrentRate(scene);
    }

    performBerserkerAttack(enemies, scene) {
        const attackTargets = enemies
            .filter(enemy => !enemy.dead && !enemy.escaped && Math.hypot(enemy.x - this.x, enemy.y - this.y) <= this.range)
            .sort((a, b) => b.i - a.i)
            .slice(0, this.cleaveHits);

        for (const enemy of attackTargets) {
            const didDamage = enemy.takeDamage(this.damage);
            if (!didDamage) continue;

            scene?.spawnDamageNumber(enemy.x - 8, enemy.y - 14, this.damage, "#ffb4a2");
            scene?.spawnImpact(enemy.x, enemy.y, "#ff7b72", 16);
        }

        if (this.rageMode && attackTargets.length > 0) {
            scene?.spawnDamageNumber(this.x - 12, this.y - 24, "RAGE", "#fca5a5");
        }
    }

    performRogueAttack(target, scene) {
        let damage = this.damage;
        let color = "#ddb6ff";
        let label = damage;

        if (this.backstabBonus > 0 && !target.backstabbed) {
            damage += this.backstabBonus;
            target.backstabbed = true;
            color = "#f0abfc";
            label = `BS ${damage}`;
        } else if (this.critChance > 0 && Math.random() < this.critChance) {
            damage = Math.round(this.damage * this.critMultiplier);
            color = "#fde047";
            label = `CRIT ${damage}`;
        }

        const didDamage = target.takeDamage(damage);
        if (!didDamage) return;

        scene?.spawnDamageNumber(target.x - 10, target.y - 16, label, color);
        scene?.spawnImpact(target.x, target.y, "#c084fc", 12);
    }

    fireArcherShot(target, enemies, projectiles, scene) {
        const targets = this.multiShot
            ? [target, ...scene.getNearbyEnemies(target.x, target.y, 48, 2, new Set([target]))]
            : [target];

        for (const shotTarget of targets) {
            projectiles.push(
                new Projectile(this.x, this.y, shotTarget, this.damage, {
                    color: this.projectileColor,
                    radius: this.projectileRadius,
                    labelColor: "#dcfce7",
                    pierceCount: this.pierceShots ? 2 : 0,
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

                        if (this.stunBlast) {
                            enemy.applyEffect({ type: "stun", time: 0.7 });
                        }

                        scene?.spawnDamageNumber(enemy.x - 10, enemy.y - 16, dealt, "#ffd39f");
                    }

                    if (this.fireZone) {
                        scene?.spawnFireZone(hitEnemy.x, hitEnemy.y, {
                            radius: Math.max(34, this.splashRadius * 0.55),
                            duration: 3.5,
                            tickInterval: 0.5,
                            damage: 8,
                            color: "rgba(249, 115, 22, 0.30)"
                        });
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

                if (this.freezeShots) {
                    enemy.applyEffect({
                        type: "freeze",
                        time: 1.8,
                        value: 0.35
                    });
                } else {
                    enemy.applyEffect({
                        type: "burn",
                        time: this.burnDuration,
                        damage: this.burnDamage,
                        interval: this.burnInterval,
                        tick: this.burnInterval,
                        source: "fire"
                    });
                }

                scene?.spawnDamageNumber(enemy.x - 10, enemy.y - 16, this.meteorDamage, "#ffb86b");
            }

            scene?.spawnImpact(target.x, target.y, this.freezeShots ? "#7dd3fc" : "#f97316", this.meteorRadius * 0.36);
            this.charge = 0;
            return;
        }

        projectiles.push(
            new Projectile(this.x, this.y, target, this.damage, {
                color: this.freezeShots ? "#7dd3fc" : this.projectileColor,
                radius: this.projectileRadius,
                labelColor: this.freezeShots ? "#bae6fd" : "#dbeafe",
                onHit: enemy => {
                    if (this.chainLightning) {
                        scene?.spawnChainLightning(enemy, this.damage * 0.7, 2, 80, new Set([enemy]));
                    }

                    if (this.freezeShots) {
                        enemy.applyEffect({
                            type: "freeze",
                            time: 1.8,
                            value: 0.35
                        });
                    } else {
                        enemy.applyEffect({
                            type: "burn",
                            time: this.burnDuration,
                            damage: this.burnDamage,
                            interval: this.burnInterval,
                            tick: this.burnInterval,
                            source: "fire"
                        });
                    }
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
            rate: this.getCurrentRate({ lives: 20 }).toFixed(2),
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
