import Enemy from "../core/Enemy.js";
import Tower from "../core/Tower.js";
import level1 from "../levels/level1.js";
import level2 from "../levels/level2.js";
import level3 from "../levels/level3.js";
import MainMenuScene from "./MainMenuScene.js";
import LevelSelectScene from "./LevelSelectScene.js";

export default class GameScene {
    constructor(canvas, sceneManager, soundManager) {
        this.canvas = canvas;
        this.sceneManager = sceneManager;
        this.soundManager = soundManager;

        this.levels = [
            { id: 0, name: level1.name, data: level1 },
            { id: 1, name: level2.name, data: level2 },
            { id: 2, name: level3.name, data: level3 }
        ];

        this.enemyTypes = {
            scout: { name: "Scout", hp: 50, speed: 96, reward: 7, radius: 8, color: "#ff7b72" },
            grunt: { name: "Grunt", hp: 125, speed: 56, reward: 13, radius: 10, color: "#d29922" },
            tank: { name: "Tank", hp: 260, speed: 34, reward: 24, radius: 13, color: "#8b949e" }
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
            { x: 700, y: 92, width: 220, height: 34, id: "left" },
            { x: 700, y: 134, width: 220, height: 34, id: "right" }
        ];
        this.sellButton = { x: 700, y: 214, width: 220, height: 36 };

        this.overlayButtons = {
            restart: { x: 320, y: 290, width: 140, height: 48 },
            levels: { x: 480, y: 290, width: 160, height: 48 },
            menu: { x: 380, y: 350, width: 200, height: 48 }
        };
        this.volumeButton = { x: 842, y: 6, width: 108, height: 28 };

        this.selectedType = "archer";
        this.selectedTower = null;
        this.hoveredId = null;
        this.currentLevelIndex = 0;
        this.pendingWaveBonus = 0;

        this.damageNumbers = [];
        this.impactEffects = [];
        this.occupiedBuildTiles = new Set();

        this.handleClick = this.handleClick.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
    }

    onEnter() {
        this.canvas.addEventListener("click", this.handleClick);
        this.canvas.addEventListener("mousemove", this.handleMouseMove);
        this.canvas.style.cursor = "default";
        this.soundManager.startGameplayMusic();
    }

    onExit() {
        this.canvas.removeEventListener("click", this.handleClick);
        this.canvas.removeEventListener("mousemove", this.handleMouseMove);
        this.canvas.style.cursor = "default";
    }

    loadLevel(index) {
        this.currentLevelIndex = index;
        this.currentLevel = this.levels[index];
        this.path = this.currentLevel.data.path;
        this.buildTiles = this.currentLevel.data.buildTiles;
        this.terrain = this.currentLevel.data.terrain;

        this.enemies = [];
        this.towers = [];
        this.projectiles = [];
        this.damageNumbers = [];
        this.impactEffects = [];
        this.occupiedBuildTiles = new Set();

        this.gold = 260;
        this.lives = 20;
        this.selectedTower = null;

        this.waveIndex = 0;
        this.waveTimer = 0;
        this.spawnTimer = 0;
        this.spawnGap = 0.9;
        this.pendingWave = [];
        this.gameOver = false;
        this.victory = false;
        this.endSoundPlayed = false;

        this.startWave();
    }

    startWave() {
        if (this.waveIndex >= this.currentLevel.data.waves.length) {
            this.victory = true;
            if (!this.endSoundPlayed) {
                this.soundManager.playVictory();
                this.endSoundPlayed = true;
            }
            return;
        }

        this.pendingWave = [...this.currentLevel.data.waves[this.waveIndex]];
        this.pendingWaveBonus = 15 + this.waveIndex * 6;
        this.spawnTimer = 0;
        this.soundManager.playWaveStart();
    }

    spawnEnemy(role) {
        this.enemies.push(new Enemy(this.path, this.enemyTypes[role]));
        if (String(role).toLowerCase().includes("boss")) {
            this.soundManager.playBossSpawn();
        }
    }

    spawnDamageNumber(x, y, value, color = "#ffffff") {
        this.damageNumbers.push({ x, y, value, color, life: 0.6, maxLife: 0.6, vy: -28 });
    }

    spawnImpact(x, y, color = "#ffffff", maxRadius = 12) {
        this.impactEffects.push({ x, y, color, life: 0.18, maxLife: 0.18, radius: 4, maxRadius });
    }

    tryUpgradeTower(pathId) {
        if (!this.selectedTower) return;

        const cost = this.selectedTower.getUpgradeCost();
        if (cost == null || this.gold < cost) return;

        const success = this.selectedTower.upgrade(pathId);
        if (success) {
            this.gold -= cost;
            this.soundManager.playUpgrade();
        }
    }

    sellSelectedTower() {
        if (!this.selectedTower) return;

        const tower = this.selectedTower;
        const sellValue = tower.getSellValue();
        this.gold += sellValue;

        if (tower.buildTileIndex != null) {
            this.occupiedBuildTiles.delete(tower.buildTileIndex);
        }

        this.towers = this.towers.filter((item) => item !== tower);
        this.spawnDamageNumber(tower.x - 14, tower.y - 18, `+${sellValue}`, "#7ef0c2");
        this.selectedTower = null;
        this.soundManager.playSell();
    }

    getTopBarTowerIndex(x, y) {
        if (y >= 40) return null;

        for (let i = 0; i < this.buttons.length; i++) {
            const startX = 120 * i + 320;
            const endX = startX + 110;
            if (x >= startX && x <= endX) return i;
        }

        return null;
    }


    isInsideVolumeButton(x, y) {
        return (
            x >= this.volumeButton.x &&
            x <= this.volumeButton.x + this.volumeButton.width &&
            y >= this.volumeButton.y &&
            y <= this.volumeButton.y + this.volumeButton.height
        );
    }

    getOverlayButtonAt(x, y) {
        if (!this.gameOver && !this.victory) return null;

        for (const [key, button] of Object.entries(this.overlayButtons)) {
            if (x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height) {
                return key;
            }
        }

        return null;
    }

    getHoveredUpgradeButton(x, y) {
        if (!this.selectedTower) return null;

        const choices = this.selectedTower.getUpgradeChoices();

        for (let i = 0; i < choices.length; i++) {
            const button = this.upgradeButtons[i];
            if (x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height) {
                return `upgrade-${choices[i].id}`;
            }
        }

        if (x >= this.sellButton.x && x <= this.sellButton.x + this.sellButton.width && y >= this.sellButton.y && y <= this.sellButton.y + this.sellButton.height) {
            return "sell-tower";
        }

        return null;
    }

    getBuildTileAt(x, y) {
        const radius = 24;

        for (let i = 0; i < this.buildTiles.length; i++) {
            const tile = this.buildTiles[i];
            if (Math.hypot(tile.x - x, tile.y - y) <= radius) {
                return { tile, index: i };
            }
        }

        return null;
    }

    canPlaceTowerOnTile(index) {
        return !this.occupiedBuildTiles.has(index);
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.isInsideVolumeButton(x, y)) {
            this.soundManager.cycleVolume();
            return;
        }

        const overlayAction = this.getOverlayButtonAt(x, y);
        if (overlayAction) {
            this.soundManager.playConfirm();

            if (overlayAction === "restart") this.loadLevel(this.currentLevelIndex);
            if (overlayAction === "levels") {
                this.sceneManager.changeScene(new LevelSelectScene(this.canvas, this.sceneManager, this.soundManager));
            }
            if (overlayAction === "menu") {
                this.sceneManager.changeScene(new MainMenuScene(this.canvas, this.sceneManager, this.soundManager));
            }
            return;
        }

        if (this.gameOver || this.victory) return;

        const topIndex = this.getTopBarTowerIndex(x, y);
        if (topIndex != null) {
            this.selectedType = this.buttons[topIndex];
            this.soundManager.playClick();
            return;
        }

        if (this.selectedTower) {
            const choices = this.selectedTower.getUpgradeChoices();
            for (let i = 0; i < choices.length; i++) {
                const button = this.upgradeButtons[i];
                if (x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height) {
                    this.tryUpgradeTower(choices[i].id);
                    return;
                }
            }

            if (x >= this.sellButton.x && x <= this.sellButton.x + this.sellButton.width && y >= this.sellButton.y && y <= this.sellButton.y + this.sellButton.height) {
                this.sellSelectedTower();
                return;
            }
        }

        for (const tower of this.towers) {
            if (tower.contains(x, y)) {
                this.selectedTower = tower;
                this.soundManager.playClick();
                return;
            }
        }

        const buildSpot = this.getBuildTileAt(x, y);
        if (!buildSpot) {
            this.selectedTower = null;
            return;
        }
        if (!this.canPlaceTowerOnTile(buildSpot.index)) return;

        const cost = this.towerCosts[this.selectedType];
        if (this.gold < cost) return;

        const tower = new Tower(buildSpot.tile.x, buildSpot.tile.y, this.selectedType);
        tower.buildTileIndex = buildSpot.index;

        this.towers.push(tower);
        this.occupiedBuildTiles.add(buildSpot.index);
        this.gold -= cost;
        this.selectedTower = tower;
        this.soundManager.playPlaceTower();
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.hoveredId = null;

        if (this.isInsideVolumeButton(x, y)) {
            this.hoveredId = "volume";
            this.canvas.style.cursor = "pointer";
            return;
        }

        const overlayAction = this.getOverlayButtonAt(x, y);
        if (overlayAction) {
            this.hoveredId = overlayAction;
            this.canvas.style.cursor = "pointer";
            return;
        }

        const topIndex = this.getTopBarTowerIndex(x, y);
        if (topIndex != null) {
            this.hoveredId = `tower-${this.buttons[topIndex]}`;
            this.canvas.style.cursor = "pointer";
            return;
        }

        const hoveredUpgrade = this.getHoveredUpgradeButton(x, y);
        if (hoveredUpgrade) {
            this.hoveredId = hoveredUpgrade;
            this.canvas.style.cursor = "pointer";
            return;
        }

        for (const tower of this.towers) {
            if (tower.contains(x, y)) {
                this.hoveredId = "tower-select";
                this.canvas.style.cursor = "pointer";
                return;
            }
        }

        const buildSpot = this.getBuildTileAt(x, y);
        if (buildSpot && this.canPlaceTowerOnTile(buildSpot.index)) {
            this.hoveredId = `build-${buildSpot.index}`;
            this.canvas.style.cursor = "pointer";
            return;
        }

        this.canvas.style.cursor = "default";
    }

    update(dt) {
        if (!this.gameOver && !this.victory) {
            this.waveTimer += dt;
            this.spawnTimer -= dt;

            if (this.pendingWave.length > 0 && this.spawnTimer <= 0) {
                this.spawnEnemy(this.pendingWave.shift());
                this.spawnTimer = this.spawnGap;
            }

            for (const enemy of this.enemies) enemy.update(dt);
            for (const tower of this.towers) tower.update(dt, this.enemies, this.projectiles, this);
            for (const projectile of this.projectiles) projectile.update(dt);

            for (const enemy of this.enemies) {
                if (enemy.dead) this.gold += enemy.reward;
                if (enemy.escaped) this.lives -= 1;
            }

            const waveCleared = this.pendingWave.length === 0 && this.enemies.length === 0;

            this.enemies = this.enemies.filter((enemy) => !enemy.dead && !enemy.escaped);
            this.projectiles = this.projectiles.filter((projectile) => !projectile.dead);

            if (this.lives <= 0) {
                this.gameOver = true;
                if (!this.endSoundPlayed) {
                    this.soundManager.playDefeat();
                    this.endSoundPlayed = true;
                }
            }

            if (waveCleared && !this.gameOver && !this.victory) {
                if (this.pendingWaveBonus > 0) {
                    this.gold += this.pendingWaveBonus;
                    this.spawnDamageNumber(24, 112, `+${this.pendingWaveBonus}`, "#f7dc6f");
                    this.pendingWaveBonus = 0;
                }

                this.waveIndex += 1;
                this.startWave();
            }
        }

        this.updateDamageNumbers(dt);
        this.updateImpactEffects(dt);
    }

    updateDamageNumbers(dt) {
        for (const number of this.damageNumbers) {
            number.life -= dt;
            number.y += number.vy * dt;
        }
        this.damageNumbers = this.damageNumbers.filter((number) => number.life > 0);
    }

    updateImpactEffects(dt) {
        for (const effect of this.impactEffects) {
            effect.life -= dt;
            const progress = 1 - effect.life / effect.maxLife;
            effect.radius = 4 + (effect.maxRadius - 4) * progress;
        }
        this.impactEffects = this.impactEffects.filter((effect) => effect.life > 0);
    }

    render(ctx) {
        this.drawMap(ctx);

        for (const impact of this.impactEffects) this.drawImpactEffect(ctx, impact);
        for (const tower of this.towers) tower.render(ctx);
        for (const projectile of this.projectiles) projectile.render(ctx);
        for (const enemy of this.enemies) enemy.render(ctx);
        for (const number of this.damageNumbers) this.drawDamageNumber(ctx, number);

        this.drawTopBar(ctx);
        this.drawSelectedTowerPanel(ctx);
        this.drawLevelInfo(ctx);

        if (this.gameOver) this.drawOverlay(ctx, "Defeat");
        if (this.victory) this.drawOverlay(ctx, "Victory");
    }

    drawMap(ctx) {
        ctx.fillStyle = this.terrain.background;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawPath(ctx, this.terrain.pathOuter, 34);
        this.drawPath(ctx, this.terrain.pathInner, 24);

        for (let i = 0; i < this.buildTiles.length; i++) {
            const tile = this.buildTiles[i];
            const occupied = this.occupiedBuildTiles.has(i);
            const hovered = this.hoveredId === `build-${i}`;

            ctx.fillStyle = occupied ? "rgba(80,80,80,0.20)" : hovered ? "rgba(200,255,200,0.25)" : this.terrain.buildTile;
            ctx.strokeStyle = hovered ? "rgba(255,255,255,0.35)" : this.terrain.buildTileBorder;

            ctx.beginPath();
            ctx.arc(tile.x, tile.y, 24, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
    }

    drawPath(ctx, color, width) {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(this.path[0].x, this.path[0].y);
        for (let i = 1; i < this.path.length; i++) ctx.lineTo(this.path[i].x, this.path[i].y);
        ctx.stroke();
    }

    drawImpactEffect(ctx, effect) {
        const alpha = effect.life / effect.maxLife;
        ctx.save();
        ctx.strokeStyle = effect.color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    drawDamageNumber(ctx, number) {
        const alpha = number.life / number.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = number.color;
        ctx.font = "bold 16px Arial";
        ctx.fillText(`${number.value}`, number.x, number.y);
        ctx.restore();
    }

    drawTopBar(ctx) {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, 960, 40);

        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.fillText("Gold: " + this.gold, 10, 24);
        ctx.fillText("Lives: " + this.lives, 120, 24);
        ctx.fillText(
            "Wave: " + Math.min(this.waveIndex + 1, this.currentLevel.data.waves.length) + "/" + this.currentLevel.data.waves.length,
            220,
            24
        );

        this.buttons.forEach((type, i) => {
            const x = 120 * i + 320;
            const hovered = this.hoveredId === `tower-${type}`;
            const selected = this.selectedType === type;

            ctx.fillStyle = selected ? "gold" : hovered ? "#c9d1d9" : "gray";
            ctx.fillText(`${type} (${this.towerCosts[type]})`, x, 24);
        });

        this.drawVolumeButton(ctx);
    }

    drawVolumeButton(ctx) {
        const hovered = this.hoveredId === "volume";

        ctx.fillStyle = hovered ? "#2a2f3a" : "#1b1f27";
        ctx.fillRect(this.volumeButton.x, this.volumeButton.y, this.volumeButton.width, this.volumeButton.height);

        ctx.strokeStyle = hovered ? "#8fe3ff" : "#6b7280";
        ctx.lineWidth = 1;
        ctx.strokeRect(this.volumeButton.x, this.volumeButton.y, this.volumeButton.width, this.volumeButton.height);

        ctx.fillStyle = this.soundManager.masterVolume <= 0 ? "#ff9a62" : "#dbeafe";
        ctx.font = "13px Arial";
        ctx.fillText(this.soundManager.getVolumeLabel(), this.volumeButton.x + 14, this.volumeButton.y + 18);
    }

    drawSelectedTowerPanel(ctx) {
        if (!this.selectedTower) return;

        const stats = this.selectedTower.getDisplayStats();
        const cost = this.selectedTower.getUpgradeCost();
        const choices = this.selectedTower.getUpgradeChoices();

        ctx.fillStyle = "rgba(0, 0, 0, 0.82)";
        ctx.fillRect(680, 50, 260, 210);

        ctx.strokeStyle = "white";
        ctx.lineWidth = 1;
        ctx.strokeRect(680, 50, 260, 210);

        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.fillText(stats.name, 695, 72);
        ctx.fillText("Level: " + stats.level, 695, 94);
        ctx.fillText("Damage: " + stats.damage, 695, 116);
        ctx.fillText("Range: " + stats.range, 695, 138);
        ctx.fillText("Rate: " + stats.rate, 695, 160);
        ctx.fillText("Invested: " + stats.invested, 695, 182);
        ctx.fillText("Sell Value: " + stats.sellValue, 695, 204);

        if (cost != null) ctx.fillText("Upgrade Cost: " + cost, 695, 226);
        else ctx.fillText("Max Level Reached", 695, 226);

        for (let i = 0; i < choices.length; i++) {
            const button = this.upgradeButtons[i];
            const enabled = this.gold >= (cost ?? 9999);
            const hovered = this.hoveredId === `upgrade-${choices[i].id}`;

            ctx.fillStyle = enabled ? (hovered ? "#3d8a5d" : "#2c6e49") : "#555";
            ctx.fillRect(button.x, button.y, button.width, button.height);

            ctx.strokeStyle = "white";
            ctx.strokeRect(button.x, button.y, button.width, button.height);

            ctx.fillStyle = "white";
            ctx.font = "14px Arial";
            ctx.fillText(choices[i].label, button.x + 10, button.y + 22);
        }

        const sellHovered = this.hoveredId === "sell-tower";
        ctx.fillStyle = sellHovered ? "#a84b4b" : "#8a3333";
        ctx.fillRect(this.sellButton.x, this.sellButton.y, this.sellButton.width, this.sellButton.height);
        ctx.strokeStyle = "white";
        ctx.strokeRect(this.sellButton.x, this.sellButton.y, this.sellButton.width, this.sellButton.height);
        ctx.fillStyle = "white";
        ctx.font = "14px Arial";
        ctx.fillText(`Sell Tower (+${stats.sellValue})`, this.sellButton.x + 10, this.sellButton.y + 23);
    }

    drawLevelInfo(ctx) {
        ctx.fillStyle = "white";
        ctx.font = "14px Arial";
        ctx.fillText("Current Level: " + this.currentLevel.name, 10, 62);
        ctx.fillText("Build on glowing circles only", 10, 82);
        ctx.fillText("Clear waves for bonus gold", 10, 102);
    }

    drawOverlay(ctx, text) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "44px Arial";
        ctx.fillText(text, 395, 230);

        this.drawOverlayButton(ctx, this.overlayButtons.restart, "Restart", this.hoveredId === "restart");
        this.drawOverlayButton(ctx, this.overlayButtons.levels, "Level Select", this.hoveredId === "levels");
        this.drawOverlayButton(ctx, this.overlayButtons.menu, "Main Menu", this.hoveredId === "menu");
    }

    drawOverlayButton(ctx, button, label, hovered) {
        ctx.fillStyle = hovered ? "#3f8a5f" : "#2c6e49";
        ctx.fillRect(button.x, button.y, button.width, button.height);

        ctx.strokeStyle = "white";
        ctx.strokeRect(button.x, button.y, button.width, button.height);

        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText(label, button.x + 22, button.y + 30);
    }
}
