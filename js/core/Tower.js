import Projectile from "./Projectile.js";

const TOWER_DATA = {
    archer: {
        name: "Archer",
        color: "#4caf50",
        base: { damage: 18, range: 170, rate: 1.15 },
        upgrades: {
            left: { id: "left", label: "Multi-Shot", damage: 24, range: 185, rate: 1.25, abilities: { multishot: 3 } },
            right: { id: "right", label: "Piercing Arrows", damage: 28, range: 190, rate: 1.05, abilities: { pierce: 2, slowArrow: true } }
        },
        costs: [70, 115]
    },
    bomb: {
        name: "Bombardier",
        color: "#b5651d",
        base: { damage: 34, range: 135, rate: 0.65, splash: 52 },
        upgrades: {
            left: { id: "left", label: "Stun Shell", damage: 42, range: 145, rate: 0.7, splash: 60, abilities: { stunBlast: true } },
            right: { id: "right", label: "Fire Zone", damage: 38, range: 150, rate: 0.72, splash: 55, abilities: { fireZone: true } }
        },
        costs: [80, 125]
    },
    berserker: {
        name: "Berserker",
        color: "#8e44ad",
        base: { damage: 28, range: 72, rate: 1.25 },
        upgrades: {
            left: { id: "left", label: "Cleave", damage: 36, range: 78, rate: 1.35, abilities: { cleave: true } },
            right: { id: "right", label: "Rage", damage: 32, range: 76, rate: 1.55, abilities: { rage: true } }
        },
        costs: [75, 120]
    },
    rogue: {
        name: "Rogue",
        color: "#34495e",
        base: { damage: 16, range: 84, rate: 2.2 },
        upgrades: {
            left: { id: "left", label: "Critical Edge", damage: 22, range: 88, rate: 2.35, abilities: { crit: 0.3 } },
            right: { id: "right", label: "Backstab", damage: 24, range: 90, rate: 2.1, abilities: { backstab: true } }
        },
        costs: [65, 105]
    },
    mage: {
        name: "Mage",
        color: "#3498db",
        base: { damage: 22, range: 155, rate: 0.95 },
        upgrades: {
            left: { id: "left", label: "Chain Lightning", damage: 28, range: 165, rate: 1.0, abilities: { chain: 2 } },
            right: { id: "right", label: "Freeze Bolt", damage: 24, range: 170, rate: 1.05, abilities: { freeze: true } }
        },
        costs: [85, 130]
    }
};

export default class Tower {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.cool = 0;
        this.level = 1;
        this.pathChoice = null;
        this.abilities = {};
        this.syncStats();
    }

    getDefinition() {
        return TOWER_DATA[this.type];
    }

    syncStats() {
        const definition = this.getDefinition();
        const source = this.level === 1 ? definition.base : definition.upgrades[this.pathChoice] ?? definition.base;

        this.name = definition.name;
        this.damage = source.damage;
        this.range = source.range;
        this.rate = source.rate;
        this.splash = source.splash ?? 0;
        this.color = definition.color;
        this.abilities = { ...(source.abilities ?? {}) };
    }

    getUpgradeChoices() {
        if (this.level >= 2) return [];
        const definition = this.getDefinition();
        return [definition.upgrades.left, definition.upgrades.right];
    }

    getUpgradeCost() {
        const definition = this.getDefinition();
        return this.level >= 2 ? null : definition.costs[0];
    }

    upgrade(pathId) {
        if (this.level >= 2) return false;
        if (!this.getDefinition().upgrades[pathId]) return false;

        this.level = 2;
        this.pathChoice = pathId;
        this.syncStats();
        return true;
    }

    getDisplayStats() {
        return {
            name: this.name,
            level: this.level,
            damage: this.damage,
            range: this.range,
            rate: this.rate.toFixed(2)
        };
    }

    getEnemiesInRange(enemies) {
        return enemies.filter(enemy => !enemy.dead && !enemy.escaped && Math.hypot(enemy.x - this.x, enemy.y - this.y) <= this.range);
    }

    getClosestEnemy(enemies) {
        let bestEnemy = null;
        let bestDistance = Infinity;

        for (const enemy of this.getEnemiesInRange(enemies)) {
            const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
            if (dist < bestDistance) {
                bestDistance = dist;
                bestEnemy = enemy;
            }
        }

        return bestEnemy;
    }

    update(dt, enemies, projectiles, scene) {
        this.cool -= dt;
        if (this.cool > 0) return;

        const targets = this.getEnemiesInRange(enemies);
        if (targets.length === 0) return;

        if (this.type === "berserker" || this.type === "rogue") {
            this.performMeleeAttack(targets, scene);
        } else if (this.type === "bomb") {
            this.fireBomb(targets[0], scene);
        } else if (this.type === "mage") {
            this.fireMageAttack(targets[0], projectiles, scene);
        } else {
            this.fireArcherAttack(targets, projectiles, scene);
        }

        const hasteBonus = this.abilities.rage ? 0.18 : 0;
        this.cool = 1 / (this.rate + hasteBonus);
    }

    performMeleeAttack(targets, scene) {
        const primary = targets[0];
        let damage = this.damage;

        if (this.abilities.crit && Math.random() < this.abilities.crit) {
            damage = Math.round(damage * 1.85);
            scene.spawnImpact(primary.x, primary.y, "#f5e663", 18);
        }

        if (this.abilities.backstab && primary.i < primary.path.length - 1) {
            damage += 10;
        }

        primary.takeDamage(damage, { color: "#ffdddd", impactColor: "#ff8888", maxImpactRadius: 16 });

        if (this.abilities.cleave) {
            for (const enemy of targets.slice(1, 3)) {
                enemy.takeDamage(Math.round(this.damage * 0.7), {
                    color: "#ffd1f7",
                    impactColor: "#d291ff",
                    maxImpactRadius: 14
                });
            }
        }
    }

    fireArcherAttack(targets, projectiles, scene) {
        const arrows = this.abilities.multishot ? targets.slice(0, this.abilities.multishot) : [targets[0]];

        for (const target of arrows) {
            projectiles.push(new Projectile(this.x, this.y, target, this.damage, {
                scene,
                color: "#d6f36a",
                pierce: this.abilities.pierce ?? 0,
                onHit: enemy => {
                    enemy.applyEffect({ type: "slow", time: 1.6, value: 0.75 });
                }
            }));
        }
    }

    fireBomb(target, scene) {
        const affected = scene.enemies.filter(enemy => {
            if (enemy.dead || enemy.escaped) return false;
            return Math.hypot(enemy.x - target.x, enemy.y - target.y) <= this.splash;
        });

        for (const enemy of affected) {
            enemy.takeDamage(this.damage, { color: "#ffb347", impactColor: "#ff914d", maxImpactRadius: 20 });
            if (this.abilities.stunBlast) enemy.applyEffect({ type: "stun", time: 0.6 });
            if (this.abilities.fireZone) enemy.applyEffect({ type: "burn", time: 2.5, damage: 3, interval: 0.5, tick: 0.5 });
        }

        if (this.abilities.fireZone) {
            scene.spawnFireZone(target.x, target.y, 44, 3.2, 4);
        }

        scene.spawnImpact(target.x, target.y, "#ff914d", 26);
    }

    fireMageAttack(target, projectiles, scene) {
        if (this.abilities.chain) {
            const jumped = [];
            const available = scene.enemies.filter(enemy => !enemy.dead && !enemy.escaped);
            let current = target;

            for (let jump = 0; jump <= this.abilities.chain && current; jump++) {
                current.takeDamage(this.damage - jump * 4, {
                    color: "#9fe8ff",
                    impactColor: "#9fe8ff",
                    maxImpactRadius: 18
                });
                current.applyEffect(this.abilities.freeze
                    ? { type: "freeze", time: 1.4, value: 0.45 }
                    : { type: "burn", time: 2.5, damage: 2, interval: 0.5, tick: 0.5 });
                jumped.push(current);
                scene.spawnImpact(current.x, current.y, "#9fe8ff", 20);

                current = available
                    .filter(enemy => !jumped.includes(enemy))
                    .sort((a, b) => Math.hypot(a.x - jumped[jumped.length - 1].x, a.y - jumped[jumped.length - 1].y) - Math.hypot(b.x - jumped[jumped.length - 1].x, b.y - jumped[jumped.length - 1].y))[0];

                if (current && Math.hypot(current.x - jumped[jumped.length - 1].x, current.y - jumped[jumped.length - 1].y) > 150) {
                    current = null;
                }
            }
            return;
        }

        projectiles.push(new Projectile(this.x, this.y, target, this.damage, {
            scene,
            color: this.abilities.freeze ? "#9fe8ff" : "#ff8c42",
            onHit: enemy => {
                enemy.applyEffect(this.abilities.freeze
                    ? { type: "freeze", time: 1.5, value: 0.4 }
                    : { type: "burn", time: 3, damage: 2, interval: 0.5, tick: 0.5 });
            }
        }));
    }

    render(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.font = "bold 10px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.name[0], this.x, this.y + 3);
        ctx.restore();
    }

    contains(x, y) {
        return Math.hypot(x - this.x, y - this.y) < 14;
    }
}
