import Projectile from "./Projectile.js";

const TOWER_CONFIG = {
    archer: {
        name: "Archer",
        color: "#7fb3ff",
        cost: 50,
        range: 155,
        damage: 18,
        rate: 1.1,
        projectileColor: "#f0d070",
        choices: [
            {
                id: "focus",
                label: "Focus Shot",
                apply: (tower) => {
                    tower.damage += 10;
                    tower.range += 10;
                }
            },
            {
                id: "swift",
                label: "Swift Hands",
                apply: (tower) => {
                    tower.rate += 0.45;
                    tower.range += 5;
                }
            },
            {
                id: "sniper",
                label: "Sniper Bow",
                apply: (tower) => {
                    tower.damage += 16;
                    tower.range += 24;
                }
            },
            {
                id: "volley",
                label: "Volley Training",
                apply: (tower) => {
                    tower.rate += 0.7;
                    tower.damage += 4;
                }
            }
        ]
    },
    bomb: {
        name: "Bombardier",
        color: "#ff9a62",
        cost: 70,
        range: 125,
        damage: 28,
        rate: 0.62,
        splash: 42,
        projectileColor: "#ffb86b",
        choices: [
            {
                id: "powder",
                label: "Powder Mix",
                apply: (tower) => {
                    tower.damage += 14;
                    tower.splash += 8;
                }
            },
            {
                id: "satchel",
                label: "Quick Satchel",
                apply: (tower) => {
                    tower.rate += 0.25;
                    tower.range += 12;
                }
            },
            {
                id: "blast",
                label: "Blast Core",
                apply: (tower) => {
                    tower.damage += 18;
                    tower.splash += 12;
                }
            },
            {
                id: "ember",
                label: "Ember Charge",
                apply: (tower) => {
                    tower.rate += 0.25;
                    tower.burnOnHit = true;
                }
            }
        ]
    },
    berserker: {
        name: "Berserker",
        color: "#d96cff",
        cost: 65,
        range: 64,
        damage: 24,
        rate: 1.35,
        choices: [
            {
                id: "axe",
                label: "Heavy Axe",
                apply: (tower) => {
                    tower.damage += 14;
                    tower.range += 4;
                }
            },
            {
                id: "frenzy",
                label: "Frenzy",
                apply: (tower) => {
                    tower.rate += 0.45;
                    tower.damage += 4;
                }
            },
            {
                id: "cleaver",
                label: "Cleaver",
                apply: (tower) => {
                    tower.damage += 18;
                    tower.cleaveCount = 2;
                }
            },
            {
                id: "warcry",
                label: "Warcry",
                apply: (tower) => {
                    tower.rate += 0.5;
                    tower.range += 8;
                }
            }
        ]
    },
    rogue: {
        name: "Rogue",
        color: "#7ef0c2",
        cost: 60,
        range: 86,
        damage: 16,
        rate: 2,
        choices: [
            {
                id: "daggers",
                label: "Twin Daggers",
                apply: (tower) => {
                    tower.rate += 0.55;
                    tower.damage += 3;
                }
            },
            {
                id: "venom",
                label: "Venom",
                apply: (tower) => {
                    tower.damage += 8;
                    tower.poisonOnHit = true;
                }
            },
            {
                id: "assassin",
                label: "Assassin",
                apply: (tower) => {
                    tower.damage += 12;
                    tower.critChance = 0.25;
                }
            },
            {
                id: "shadow",
                label: "Shadowstep",
                apply: (tower) => {
                    tower.rate += 0.75;
                    tower.range += 10;
                }
            }
        ]
    },
    mage: {
        name: "Mage",
        color: "#8fe3ff",
        cost: 80,
        range: 135,
        damage: 22,
        rate: 0.82,
        splash: 28,
        projectileColor: "#98f5ff",
        choices: [
            {
                id: "ember",
                label: "Ember Tome",
                apply: (tower) => {
                    tower.damage += 8;
                    tower.burnOnHit = true;
                }
            },
            {
                id: "frost",
                label: "Frost Rune",
                apply: (tower) => {
                    tower.rate += 0.2;
                    tower.slowStrength = 0.58;
                }
            },
            {
                id: "meteor",
                label: "Meteor Study",
                apply: (tower) => {
                    tower.damage += 16;
                    tower.splash += 14;
                }
            },
            {
                id: "surge",
                label: "Arc Surge",
                apply: (tower) => {
                    tower.rate += 0.35;
                    tower.range += 18;
                }
            }
        ]
    }
};

const UPGRADE_MULTIPLIERS = [1.2, 1.65];

export default class Tower {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.cool = 0;
        this.level = 1;
        this.branchHistory = [];
        this.investedGold = 0;
        this.buildTileIndex = null;

        this.range = 140;
        this.damage = 20;
        this.rate = 1;
        this.splash = 0;
        this.projectileColor = "#f0d070";
        this.burnOnHit = false;
        this.poisonOnHit = false;
        this.slowStrength = null;
        this.critChance = 0;
        this.cleaveCount = 0;

        this.applyBaseStats();
    }

    applyBaseStats() {
        const config = TOWER_CONFIG[this.type];
        this.name = config.name;
        this.color = config.color;
        this.baseCost = config.cost;
        this.range = config.range;
        this.damage = config.damage;
        this.rate = config.rate;
        this.splash = config.splash ?? 0;
        this.projectileColor = config.projectileColor ?? "#f0d070";
        this.investedGold = config.cost;

        if (this.type === "archer") this.slowStrength = 0.72;
        if (this.type === "mage") this.burnOnHit = true;
    }

    update(dt, enemies, projectiles, scene) {
        this.cool -= dt;
        if (this.cool > 0) return;

        const targets = enemies.filter((enemy) => !enemy.dead && !enemy.escaped && Math.hypot(enemy.x - this.x, enemy.y - this.y) <= this.range);
        if (targets.length === 0) return;

        const target = targets[0];

        if (this.type === "berserker" || this.type === "rogue") {
            this.performMeleeAttack(targets, scene);
        } else {
            projectiles.push(
                new Projectile(this.x, this.y, target, this.damage, {
                    color: this.projectileColor,
                    splash: this.splash,
                    scene,
                    onHit: (enemy) => this.applyOnHitEffects(enemy, scene)
                })
            );
        }

        this.cool = 1 / this.rate;
    }

    performMeleeAttack(targets, scene) {
        const strikeTargets = [targets[0], ...targets.slice(1, 1 + this.cleaveCount)];

        for (const enemy of strikeTargets) {
            let damage = this.damage;
            let color = this.type === "rogue" ? "#7ef0c2" : "#d96cff";

            if (this.type === "rogue" && this.critChance > 0 && Math.random() < this.critChance) {
                damage = Math.round(damage * 1.8);
                color = "#ffef7a";
            }

            const hit = enemy.takeDamage(damage);
            if (!hit) continue;

            if (scene) {
                scene.spawnDamageNumber(enemy.x - 10, enemy.y - 12, damage, color);
                scene.spawnImpact(enemy.x, enemy.y, color, 12);
            }

            this.applyOnHitEffects(enemy, scene);
        }
    }

    applyOnHitEffects(enemy, scene) {
        if (this.slowStrength) {
            enemy.applyEffect({ type: "slow", time: 1.8, value: this.slowStrength });
        }

        if (this.burnOnHit) {
            enemy.applyEffect({ type: "burn", time: 3, damage: 3, interval: 0.5, tick: 0.5 });
        }

        if (this.poisonOnHit) {
            enemy.applyEffect({ type: "burn", time: 2.4, damage: 2, interval: 0.4, tick: 0.4 });
        }

        if (scene && (this.burnOnHit || this.slowStrength)) {
            scene.spawnImpact(enemy.x, enemy.y, this.burnOnHit ? "#ff944d" : "#87ceeb", 14);
        }
    }

    getUpgradeCost() {
        if (this.level >= 3) return null;
        return Math.round(this.baseCost * UPGRADE_MULTIPLIERS[this.level - 1]);
    }

    getUpgradeChoices() {
        if (this.level >= 3) return [];

        const config = TOWER_CONFIG[this.type];
        const offset = (this.level - 1) * 2;
        return config.choices.slice(offset, offset + 2).map((choice) => ({ id: choice.id, label: choice.label }));
    }

    upgrade(pathId) {
        if (this.level >= 3) return false;

        const config = TOWER_CONFIG[this.type];
        const choice = config.choices.find((item) => item.id === pathId);
        if (!choice) return false;

        const validIds = this.getUpgradeChoices().map((item) => item.id);
        if (!validIds.includes(pathId)) return false;

        const cost = this.getUpgradeCost();
        choice.apply(this);
        this.investedGold += cost;
        this.branchHistory.push(pathId);
        this.level += 1;
        return true;
    }

    getSellValue() {
        return Math.max(1, Math.floor(this.investedGold * 0.7));
    }

    getDisplayStats() {
        return {
            name: this.name,
            level: this.level,
            damage: Math.round(this.damage),
            range: Math.round(this.range),
            rate: this.rate.toFixed(2),
            invested: this.investedGold,
            sellValue: this.getSellValue()
        };
    }

    render(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(255,255,255,0.8)";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    contains(x, y) {
        return Math.hypot(x - this.x, y - this.y) < 14;
    }
}
