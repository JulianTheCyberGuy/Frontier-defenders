import Enemy from "../core/Enemy.js";
import Tower, { TOWER_TYPES, getTowerCost, getTowerLabel } from "../core/Tower.js";
import PlacementSystem from "../systems/PlacementSystem.js";
import level1 from "../levels/level1.js";

export default class GameScene {
    constructor(canvas) {
        this.canvas = canvas;
        this.level = level1;
        this.path = this.level.path;

        this.enemies = [];
        this.towers = [];
        this.projectiles = [];

        this.placementSystem = new PlacementSystem(this.level);

        this.mouseX = null;
        this.mouseY = null;

        this.gold = 220;
        this.lives = 20;
        this.wave = 1;
        this.gameState = "playing";

        this.selectedTowerType = TOWER_TYPES.ARCHER;
        this.towerButtons = this.createTowerButtons();

        this.currentWaveIndex = 0;
        this.currentWaveData = null;
        this.spawnQueue = [];
        this.spawnTimer = 0;
        this.waveMessage = "";
        this.waveMessageTimer = 0;
        this.waveDelayTimer = 1.2;

        this.startWave(this.currentWaveIndex);
        this.bindInput();
    }

    createTowerButtons() {
        return [
            {
                type: TOWER_TYPES.ARCHER,
                x: 650,
                y: 8,
                width: 130,
                height: 28
            },
            {
                type: TOWER_TYPES.BOMB,
                x: 790,
                y: 8,
                width: 150,
                height: 28
            }
        ];
    }

    bindInput() {
        this.canvas.addEventListener("mousemove", (event) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = event.clientX - rect.left;
            this.mouseY = event.clientY - rect.top;
        });

        this.canvas.addEventListener("mouseleave", () => {
            this.mouseX = null;
            this.mouseY = null;
        });

        this.canvas.addEventListener("click", (event) => {
            if (this.gameState !== "playing") return;

            const rect = this.canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            const clickedButton = this.getClickedTowerButton(mouseX, mouseY);
            if (clickedButton) {
                this.selectedTowerType = clickedButton.type;
                return;
            }

            if (mouseY <= 42) return;

            const { col, row } = this.placementSystem.getTileFromPixel(mouseX, mouseY);
            const cost = getTowerCost(this.selectedTowerType);

            if (!this.placementSystem.canPlaceAt(col, row)) return;
            if (this.gold < cost) return;

            const center = this.placementSystem.getTileCenter(col, row);
            const tower = new Tower(center.x, center.y, this.selectedTowerType);

            this.towers.push(tower);
            this.placementSystem.placeTower(col, row);
            this.gold -= cost;
        });
    }

    getClickedTowerButton(mouseX, mouseY) {
        return this.towerButtons.find(button => {
            return mouseX >= button.x && mouseX <= button.x + button.width && mouseY >= button.y && mouseY <= button.y + button.height;
        });
    }

    startWave(index) {
        this.currentWaveData = this.level.waves[index] ?? null;

        if (!this.currentWaveData) {
            this.gameState = "victory";
            this.waveMessage = "All waves cleared";
            this.waveMessageTimer = 999;
            return;
        }

        this.wave = index + 1;
        this.spawnQueue = [...this.currentWaveData.enemies];
        this.spawnTimer = 0.3;
        this.waveDelayTimer = 0;
        this.waveMessage = `Wave ${this.wave}`;
        this.waveMessageTimer = 2;
    }

    update(dt) {
        if (this.gameState !== "playing") {
            this.updateWaveMessage(dt);
            return;
        }

        this.updateWaveMessage(dt);
        this.handleSpawning(dt);

        for (const enemy of this.enemies) {
            enemy.update(dt);
        }

        for (const tower of this.towers) {
            tower.update(dt, this.enemies, this.projectiles);
        }

        for (const projectile of this.projectiles) {
            projectile.update(dt);
        }

        this.handleEnemyCleanup();
        this.handleProjectileCleanup();
        this.handleWaveProgression(dt);

        if (this.lives <= 0) {
            this.lives = 0;
            this.gameState = "defeat";
            this.waveMessage = "Defeat";
            this.waveMessageTimer = 999;
        }
    }

    updateWaveMessage(dt) {
        if (this.waveMessageTimer > 0) {
            this.waveMessageTimer -= dt;
        }
    }

    handleSpawning(dt) {
        if (!this.currentWaveData || this.spawnQueue.length === 0) return;

        this.spawnTimer -= dt;

        if (this.spawnTimer <= 0) {
            const enemyStats = this.spawnQueue.shift();
            this.enemies.push(new Enemy(this.path, enemyStats));
            this.spawnTimer = this.currentWaveData.spawnInterval;
        }
    }

    handleEnemyCleanup() {
        const survivors = [];

        for (const enemy of this.enemies) {
            if (enemy.reachedGoal) {
                this.lives -= enemy.damageToLives;
                continue;
            }

            if (enemy.isDead) {
                this.gold += enemy.reward;
                continue;
            }

            survivors.push(enemy);
        }

        this.enemies = survivors;
    }

    handleProjectileCleanup() {
        this.projectiles = this.projectiles.filter(projectile => !projectile.isExpired);
    }

    handleWaveProgression(dt) {
        const waveStillSpawning = this.spawnQueue.length > 0;
        const enemiesStillAlive = this.enemies.length > 0;

        if (waveStillSpawning || enemiesStillAlive) {
            this.waveDelayTimer = 1.2;
            return;
        }

        this.waveDelayTimer -= dt;

        if (this.waveDelayTimer <= 0) {
            this.currentWaveIndex += 1;
            this.startWave(this.currentWaveIndex);
        }
    }

    render(ctx) {
        this.drawMap(ctx);
        this.drawPath(ctx);
        this.placementSystem.renderBuildTiles(ctx);
        this.placementSystem.renderHoverTile(ctx, this.mouseX, this.mouseY);

        for (const tower of this.towers) {
            tower.renderRange(ctx);
        }

        for (const tower of this.towers) {
            tower.render(ctx);
        }

        for (const projectile of this.projectiles) {
            projectile.render(ctx);
        }

        for (const enemy of this.enemies) {
            enemy.render(ctx);
        }

        this.drawHUD(ctx);
        this.drawWaveBanner(ctx);
        this.drawEndState(ctx);
    }

    drawMap(ctx) {
        ctx.fillStyle = "#284a2f";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const { tileSize, cols, rows } = this.level;

        ctx.strokeStyle = "rgba(255,255,255,0.04)";
        ctx.lineWidth = 1;

        for (let col = 0; col < cols; col++) {
            for (let row = 0; row < rows; row++) {
                ctx.strokeRect(col * tileSize, row * tileSize, tileSize, tileSize);
            }
        }
    }

    drawPath(ctx) {
        ctx.strokeStyle = "#8b7d5c";
        ctx.lineWidth = 34;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctx.beginPath();
        ctx.moveTo(this.path[0].x, this.path[0].y);

        for (let i = 1; i < this.path.length; i++) {
            ctx.lineTo(this.path[i].x, this.path[i].y);
        }

        ctx.stroke();

        ctx.strokeStyle = "#b7a77b";
        ctx.lineWidth = 24;
        ctx.stroke();
    }

    drawHUD(ctx) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, this.canvas.width, 42);

        ctx.fillStyle = "#ffffff";
        ctx.font = "18px Arial";
        ctx.fillText(`Gold: ${this.gold}`, 16, 27);
        ctx.fillText(`Lives: ${this.lives}`, 140, 27);
        ctx.fillText(`Wave: ${this.wave}`, 255, 27);
        ctx.fillText(`Selected: ${getTowerLabel(this.selectedTowerType)}`, 350, 27);

        for (const button of this.towerButtons) {
            const selected = button.type === this.selectedTowerType;
            const label = getTowerLabel(button.type);
            const cost = getTowerCost(button.type);
            const affordable = this.gold >= cost;

            ctx.fillStyle = selected
                ? "rgba(50, 130, 220, 0.95)"
                : affordable
                    ? "rgba(30, 30, 30, 0.88)"
                    : "rgba(70, 30, 30, 0.88)";

            ctx.fillRect(button.x, button.y, button.width, button.height);

            ctx.strokeStyle = selected ? "#ffffff" : "rgba(255,255,255,0.18)";
            ctx.lineWidth = 1;
            ctx.strokeRect(button.x, button.y, button.width, button.height);

            ctx.fillStyle = "#ffffff";
            ctx.font = "14px Arial";
            ctx.fillText(`${label} (${cost})`, button.x + 10, button.y + 18);
        }
    }

    drawWaveBanner(ctx) {
        if (this.waveMessageTimer <= 0) return;

        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.42)";
        ctx.fillRect(360, 62, 240, 42);

        ctx.fillStyle = "#ffffff";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.waveMessage, 480, 90);
        ctx.restore();
    }

    drawEndState(ctx) {
        if (this.gameState !== "victory" && this.gameState !== "defeat") return;

        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.font = "42px Arial";
        ctx.fillText(this.gameState === "victory" ? "Victory" : "Defeat", this.canvas.width / 2, this.canvas.height / 2 - 10);

        ctx.font = "20px Arial";
        ctx.fillText("Refresh the page to play again", this.canvas.width / 2, this.canvas.height / 2 + 30);
        ctx.restore();
    }
}
