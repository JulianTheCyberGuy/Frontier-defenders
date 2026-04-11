import Enemy from "../core/Enemy.js";
import Tower from "../core/Tower.js";
import PlacementSystem from "../systems/PlacementSystem.js";
import level1 from "../levels/level1.js";

const TOWER_TYPES = {
    archer: {
        id: "archer",
        name: "Archer",
        cost: 50,
        color: "#4a9c39",
        range: 145,
        fireRate: 1.0,
        damage: 22,
        projectileSpeed: 320,
        projectileRadius: 4,
        projectileColor: "#f2dfa2",
        splashRadius: 0
    },
    bomb: {
        id: "bomb",
        name: "Bomb",
        cost: 70,
        color: "#a05a2c",
        range: 130,
        fireRate: 0.55,
        damage: 26,
        projectileSpeed: 220,
        projectileRadius: 6,
        projectileColor: "#ffb347",
        splashRadius: 52
    }
};

const ENEMY_TYPES = {
    goblin: {
        maxHealth: 55,
        speed: 58,
        reward: 10,
        radius: 10,
        color: "#a52a2a"
    },
    wolf: {
        maxHealth: 40,
        speed: 86,
        reward: 11,
        radius: 9,
        color: "#6b3f2a"
    },
    skeleton: {
        maxHealth: 95,
        speed: 46,
        reward: 16,
        radius: 11,
        color: "#d6d6d6"
    }
};

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

        this.selectedTowerType = "archer";
        this.hoveredButton = null;

        this.waveIndex = 0;
        this.currentWaveEvents = [];
        this.waveTimer = 0;
        this.waveStarted = false;
        this.waveClearDelay = 1.6;
        this.waveClearTimer = this.waveClearDelay;

        this.gameState = "playing";

        this.buttons = [
            { id: "archer", x: 560, y: 8, width: 120, height: 28 },
            { id: "bomb", x: 690, y: 8, width: 140, height: 28 }
        ];

        this.bindInput();
        this.startWave();
    }

    bindInput() {
        this.canvas.addEventListener("mousemove", (event) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = event.clientX - rect.left;
            this.mouseY = event.clientY - rect.top;
            this.hoveredButton = this.getButtonAt(this.mouseX, this.mouseY);
        });

        this.canvas.addEventListener("mouseleave", () => {
            this.mouseX = null;
            this.mouseY = null;
            this.hoveredButton = null;
        });

        this.canvas.addEventListener("click", (event) => {
            if (this.gameState !== "playing") {
                return;
            }

            const rect = this.canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            const clickedButton = this.getButtonAt(mouseX, mouseY);
            if (clickedButton) {
                this.selectedTowerType = clickedButton.id;
                return;
            }

            if (mouseY <= 42) return;

            const { col, row } = this.placementSystem.getTileFromPixel(mouseX, mouseY);
            if (!this.placementSystem.canPlaceAt(col, row)) return;

            const towerData = TOWER_TYPES[this.selectedTowerType];
            if (this.gold < towerData.cost) return;

            const center = this.placementSystem.getTileCenter(col, row);
            const tower = new Tower(center.x, center.y, towerData);

            this.towers.push(tower);
            this.placementSystem.placeTower(col, row);
            this.gold -= towerData.cost;
        });
    }

    getButtonAt(x, y) {
        for (const button of this.buttons) {
            if (
                x >= button.x &&
                x <= button.x + button.width &&
                y >= button.y &&
                y <= button.y + button.height
            ) {
                return button;
            }
        }
        return null;
    }

    startWave() {
        if (this.waveIndex >= this.level.waves.length) {
            this.gameState = "victory";
            return;
        }

        this.currentWaveEvents = this.level.waves[this.waveIndex].map(event => ({ ...event }));
        this.waveTimer = 0;
        this.waveStarted = true;
        this.waveClearTimer = this.waveClearDelay;
    }

    spawnEnemy(type) {
        const stats = ENEMY_TYPES[type];
        if (!stats) return;
        this.enemies.push(new Enemy(this.path, stats));
    }

    update(dt) {
        if (this.gameState !== "playing") {
            return;
        }

        if (this.waveStarted) {
            this.waveTimer += dt;

            while (
                this.currentWaveEvents.length > 0 &&
                this.currentWaveEvents[0].delay <= this.waveTimer
            ) {
                const event = this.currentWaveEvents.shift();
                this.spawnEnemy(event.type);
            }
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

        this.handleEnemyCleanup();
        this.handleProjectileCleanup();
        this.handleWaveProgress(dt);
        this.checkEndState();
    }

    handleEnemyCleanup() {
        const survivors = [];

        for (const enemy of this.enemies) {
            if (enemy.reachedGoal) {
                this.lives--;
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

    handleWaveProgress(dt) {
        const waveFinishedSpawning = this.currentWaveEvents.length === 0;
        const noEnemiesLeft = this.enemies.length === 0;

        if (waveFinishedSpawning && noEnemiesLeft) {
            this.waveClearTimer -= dt;

            if (this.waveClearTimer <= 0) {
                this.waveIndex++;
                this.startWave();
            }
        } else {
            this.waveClearTimer = this.waveClearDelay;
        }
    }

    checkEndState() {
        if (this.lives <= 0) {
            this.gameState = "defeat";
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

        if (this.gameState === "victory") {
            this.drawOverlay(ctx, "Victory", "Forest Road defended");
        } else if (this.gameState === "defeat") {
            this.drawOverlay(ctx, "Defeat", "The frontier has fallen");
        }
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

        ctx.strokeStyle = "#b9a77c";
        ctx.lineWidth = 24;
        ctx.stroke();
    }

    drawHUD(ctx) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.48)";
        ctx.fillRect(0, 0, this.canvas.width, 42);

        ctx.fillStyle = "#ffffff";
        ctx.font = "18px Arial";
        ctx.fillText(`Gold: ${this.gold}`, 16, 27);
        ctx.fillText(`Lives: ${this.lives}`, 140, 27);
        ctx.fillText(`Wave: ${Math.min(this.waveIndex + 1, this.level.waves.length)} / ${this.level.waves.length}`, 255, 27);

        this.drawTowerButton(ctx, this.buttons[0], TOWER_TYPES.archer);
        this.drawTowerButton(ctx, this.buttons[1], TOWER_TYPES.bomb);
    }

    drawTowerButton(ctx, button, towerData) {
        const isSelected = this.selectedTowerType === button.id;
        const isHovered = this.hoveredButton?.id === button.id;

        ctx.fillStyle = isSelected
            ? "rgba(234, 170, 0, 0.85)"
            : isHovered
                ? "rgba(255,255,255,0.18)"
                : "rgba(255,255,255,0.10)";

        ctx.fillRect(button.x, button.y, button.width, button.height);

        ctx.strokeStyle = isSelected ? "#fff2b3" : "rgba(255,255,255,0.18)";
        ctx.lineWidth = 1;
        ctx.strokeRect(button.x, button.y, button.width, button.height);

        ctx.fillStyle = "#ffffff";
        ctx.font = "14px Arial";
        ctx.fillText(`${towerData.name} (${towerData.cost})`, button.x + 10, button.y + 19);
    }

    drawOverlay(ctx, title, subtitle) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.font = "48px Arial";
        ctx.fillText(title, this.canvas.width / 2, this.canvas.height / 2 - 10);

        ctx.font = "22px Arial";
        ctx.fillText(subtitle, this.canvas.width / 2, this.canvas.height / 2 + 30);

        ctx.textAlign = "left";
    }
}
