import Enemy from "../core/Enemy.js";
import Tower from "../core/Tower.js";
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

        this.gold = 200;
        this.lives = 20;
        this.wave = 1;
        this.archerCost = 50;

        this.spawnTimer = 0;
        this.spawnInterval = 1.2;
        this.enemiesToSpawn = 8;

        this.bindInput();
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
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            const { col, row } = this.placementSystem.getTileFromPixel(mouseX, mouseY);

            if (!this.placementSystem.canPlaceAt(col, row)) return;
            if (this.gold < this.archerCost) return;

            const center = this.placementSystem.getTileCenter(col, row);
            const tower = new Tower(center.x, center.y);

            this.towers.push(tower);
            this.placementSystem.placeTower(col, row);
            this.gold -= this.archerCost;
        });
    }

    update(dt) {
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
    }

    handleSpawning(dt) {
        if (this.enemiesToSpawn <= 0) return;

        this.spawnTimer -= dt;

        if (this.spawnTimer <= 0) {
            this.enemies.push(new Enemy(this.path));
            this.enemiesToSpawn--;
            this.spawnTimer = this.spawnInterval;
        }
    }

    handleEnemyCleanup() {
        const survivors = [];

        for (const enemy of this.enemies) {
            if (enemy.reachedGoal) {
                this.lives--;
                continue;
            }

            if (enemy.isDead) {
                this.gold += 10;
                continue;
            }

            survivors.push(enemy);
        }

        this.enemies = survivors;
    }

    handleProjectileCleanup() {
        this.projectiles = this.projectiles.filter(projectile => !projectile.isExpired);
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
        ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        ctx.fillRect(0, 0, this.canvas.width, 42);

        ctx.fillStyle = "#ffffff";
        ctx.font = "18px Arial";
        ctx.fillText(`Gold: ${this.gold}`, 16, 27);
        ctx.fillText(`Lives: ${this.lives}`, 140, 27);
        ctx.fillText(`Wave: ${this.wave}`, 255, 27);
        ctx.fillText(`Archer Cost: ${this.archerCost}`, 360, 27);
        ctx.fillText("Click green tiles to place Archer towers", 560, 27);
    }
}