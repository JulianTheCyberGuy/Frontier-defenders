import Enemy from "../core/Enemy.js";
import Tower from "../core/Tower.js";
import Projectile from "../core/Projectile.js";
import level1 from "../levels/level1.js";
import level2 from "../levels/level2.js";

export default class GameScene {
    constructor(canvas, sceneManager) {
        this.sceneManager = sceneManager;

        this.levels = [
            {
                id: 1,
                name: "Forest Road",
                data: level1,
                waves: [
                    ["grunt", "grunt", "scout", "grunt", "scout"],
                    ["grunt", "grunt", "tank", "scout", "grunt", "scout"],
                    ["tank", "grunt", "scout", "tank", "grunt", "scout", "scout"]
                ]
            },
            {
                id: 2,
                name: "Ruined Keep",
                data: level2,
                waves: [
                    ["grunt", "scout", "grunt", "tank", "scout"],
                    ["tank", "grunt", "scout", "scout", "tank", "grunt"],
                    ["tank", "tank", "scout", "grunt", "scout", "grunt", "tank"]
                ]
            }
        ];

        this.enemyTypes = {
            scout: {
                name: "Scout",
                hp: 55,
                speed: 90,
                reward: 8,
                radius: 8,
                color: "#ff7b72"
            },
            grunt: {
                name: "Grunt",
                hp: 120,
                speed: 52,
                reward: 12,
                radius: 10,
                color: "#d29922"
            },
            tank: {
                name: "Tank",
                hp: 240,
                speed: 34,
                reward: 20,
                radius: 13,
                color: "#8b949e"
            }
        };

        this.towerCosts = {
            archer: 50,
            bomb: 70,
            berserker: 65,
            rogue: 60,
            mage: 80
        };

        this.buttons = ["archer", "bomb", "berserker", "rogue", "mage"];
        this.upgradeButtons = [
            { x: 700, y: 70, width: 220, height: 34, id: "left" },
            { x: 700, y: 112, width: 220, height: 34, id: "right" }
        ];

        this.selectedType = "archer";
        this.selectedTower = null;

        this.bindEvents();
        this.loadLevel(0);
    }

    bindEvents() {
        this.canvas.addEventListener("click", (e) => {
            const r = this.canvas.getBoundingClientRect();
            const x = e.clientX - r.left;
            const y = e.clientY - r.top;

            if (y < 40) {
                const index = Math.floor(x / 120);
                if (this.buttons[index]) {
                    this.selectedType = this.buttons[index];
                    return;
                }
            }

            if (this.selectedTower) {
                const choices = this.selectedTower.getUpgradeChoices();

                for (let i = 0; i < choices.length; i++) {
                    const button = this.upgradeButtons[i];

                    if (
                        x >= button.x &&
                        x <= button.x + button.width &&
                        y >= button.y &&
                        y <= button.y + button.height
                    ) {
                        this.tryUpgradeTower(choices[i].id);
                        return;
                    }
                }
            }

            for (const tower of this.towers) {
                if (tower.contains(x, y)) {
                    this.selectedTower = tower;
                    return;
                }
            }

            const cost = this.towerCosts[this.selectedType];
            if (this.gold < cost) return;

            const tower = new Tower(x, y, this.selectedType);
            this.towers.push(tower);
            this.gold -= cost;
            this.selectedTower = tower;
        });

        window.addEventListener("keydown", (e) => {
            if (e.key === "1") {
                this.loadLevel(0);
            }

            if (e.key === "2") {
                this.loadLevel(1);
            }
        });
    }

    loadLevel(index) {
        this.currentLevelIndex = index;
        this.currentLevel = this.levels[index];
        this.path = this.currentLevel.data.path;

        this.enemies = [];
        this.towers = [];
        this.projectiles = [];

        this.gold = 250;
        this.lives = 20;
        this.selectedTower = null;

        this.waveIndex = 0;
        this.waveTimer = 0;
        this.spawnTimer = 0;
        this.spawnGap = 0.9;
        this.pendingWave = [];
        this.gameOver = false;
        this.victory = false;

        this.startWave();
    }

    startWave() {
        if (this.waveIndex >= this.currentLevel.waves.length) {
            this.victory = true;
            return;
        }

        this.pendingWave = [...this.currentLevel.waves[this.waveIndex]];
        this.spawnTimer = 0;
    }

    spawnEnemy(role) {
        const stats = this.enemyTypes[role];
        this.enemies.push(new Enemy(this.path, stats));
    }

    tryUpgradeTower(pathId) {
        if (!this.selectedTower) return;

        const cost = this.selectedTower.getUpgradeCost();
        if (cost == null) return;
        if (this.gold < cost) return;

        const success = this.selectedTower.upgrade(pathId);
        if (success) {
            this.gold -= cost;
        }
    }

    update(dt) {
        if (this.gameOver || this.victory) {
            return;
        }

        this.waveTimer += dt;
        this.spawnTimer -= dt;

        if (this.pendingWave.length > 0 && this.spawnTimer <= 0) {
            const nextRole = this.pendingWave.shift();
            this.spawnEnemy(nextRole);
            this.spawnTimer = this.spawnGap;
        }

        for (const enemy of this.enemies) {
            enemy.update(dt);
        }

        for (const tower of this.towers) {
            tower.update(dt, this.enemies, this.projectiles);
        }

        for (const projectile of this.projectiles) {
            projectile.update(dt);
        }

        for (const enemy of this.enemies) {
            if (enemy.dead) {
                this.gold += enemy.reward;
            }

            if (enemy.escaped) {
                this.lives -= 1;
            }
        }

        this.enemies = this.enemies.filter(enemy => !enemy.dead && !enemy.escaped);
        this.projectiles = this.projectiles.filter(projectile => !projectile.dead);

        if (this.lives <= 0) {
            this.gameOver = true;
        }

        if (
            this.pendingWave.length === 0 &&
            this.enemies.length === 0 &&
            !this.gameOver &&
            !this.victory
        ) {
            this.waveIndex++;
            this.startWave();
        }
    }

    render(ctx) {
        this.drawPath(ctx);

        for (const tower of this.towers) {
            tower.render(ctx);
        }

        for (const projectile of this.projectiles) {
            projectile.render(ctx);
        }

        for (const enemy of this.enemies) {
            enemy.render(ctx);
        }

        this.drawTopBar(ctx);
        this.drawSelectedTowerPanel(ctx);
        this.drawLevelInfo(ctx);

        if (this.gameOver) {
            this.drawOverlay(ctx, "Defeat");
        }

        if (this.victory) {
            this.drawOverlay(ctx, "Victory");
        }
    }

    drawPath(ctx) {
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(this.path[0].x, this.path[0].y);

        for (let i = 1; i < this.path.length; i++) {
            ctx.lineTo(this.path[i].x, this.path[i].y);
        }

        ctx.stroke();
    }

    drawTopBar(ctx) {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, 960, 40);

        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.fillText("Gold: " + this.gold, 10, 24);
        ctx.fillText("Lives: " + this.lives, 120, 24);
        ctx.fillText("Wave: " + Math.min(this.waveIndex + 1, this.currentLevel.waves.length) + "/" + this.currentLevel.waves.length, 220, 24);

        this.buttons.forEach((type, i) => {
            const x = 120 * i + 20;
            const label = `${type} (${this.towerCosts[type]})`;

            ctx.fillStyle = this.selectedType === type ? "gold" : "gray";
            ctx.fillText(label, x, 24);
        });
    }

    drawSelectedTowerPanel(ctx) {
        if (!this.selectedTower) return;

        const stats = this.selectedTower.getDisplayStats();
        const cost = this.selectedTower.getUpgradeCost();
        const choices = this.selectedTower.getUpgradeChoices();

        ctx.fillStyle = "rgba(0, 0, 0, 0.82)";
        ctx.fillRect(680, 50, 260, 170);

        ctx.strokeStyle = "white";
        ctx.lineWidth = 1;
        ctx.strokeRect(680, 50, 260, 170);

        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.fillText(stats.name, 695, 72);
        ctx.fillText("Level: " + stats.level, 695, 94);
        ctx.fillText("Damage: " + stats.damage, 695, 116);
        ctx.fillText("Range: " + stats.range, 695, 138);
        ctx.fillText("Rate: " + stats.rate, 695, 160);

        if (cost != null) {
            ctx.fillText("Upgrade Cost: " + cost, 695, 182);
        } else {
            ctx.fillText("Max Level Reached", 695, 182);
        }

        for (let i = 0; i < choices.length; i++) {
            const button = this.upgradeButtons[i];
            const enabled = this.gold >= (cost ?? 9999);

            ctx.fillStyle = enabled ? "#2c6e49" : "#555";
            ctx.fillRect(button.x, button.y, button.width, button.height);

            ctx.strokeStyle = "white";
            ctx.strokeRect(button.x, button.y, button.width, button.height);

            ctx.fillStyle = "white";
            ctx.font = "14px Arial";
            ctx.fillText(choices[i].label, button.x + 10, button.y + 22);
        }
    }

    drawLevelInfo(ctx) {
        ctx.fillStyle = "white";
        ctx.font = "14px Arial";
        ctx.fillText("Press 1 for Forest Road", 10, 60);
        ctx.fillText("Press 2 for Ruined Keep", 10, 80);
        ctx.fillText("Current Level: " + this.currentLevel.name, 10, 100);
    }

    drawOverlay(ctx, text) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.fillText(text, 400, 260);
    }
}