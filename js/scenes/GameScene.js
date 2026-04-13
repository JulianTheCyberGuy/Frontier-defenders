import Enemy from "../core/Enemy.js";
import Tower from "../core/Tower.js";
import level1 from "../levels/level1.js";
import level2 from "../levels/level2.js";
import level3 from "../levels/level3.js";
import MainMenuScene from "./MainMenuScene.js";
import LevelSelectScene from "./LevelSelectScene.js";
import UIRenderer from "../ui/UIRenderer.js";

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

        this.selectedType = "archer";
        this.selectedTower = null;
        this.hoveredId = null;
        this.currentLevelIndex = 0;
        this.pendingWaveBonus = 0;
        this.hoverPoint = { x: 0, y: 0 };
        this.tooltip = null;
        this.previewTileIndex = null;
        this.uiRenderer = new UIRenderer(canvas);

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
        this.tooltip = null;
        this.previewTileIndex = null;

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
    }

    spawnEnemy(role) {
        this.enemies.push(new Enemy(this.path, this.enemyTypes[role]));
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
            this.soundManager.playClick();
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
        this.soundManager.playClick();
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
        this.soundManager.playClick();
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.hoverPoint = { x, y };
        this.hoveredId = null;
        this.tooltip = null;
        this.previewTileIndex = null;

        const overlayAction = this.getOverlayButtonAt(x, y);
        if (overlayAction) {
            this.hoveredId = overlayAction;
            this.canvas.style.cursor = "pointer";
            return;
        }

        const topIndex = this.getTopBarTowerIndex(x, y);
        if (topIndex != null) {
            const type = this.buttons[topIndex];
            this.hoveredId = `tower-${type}`;
            this.tooltip = this.getTowerMenuTooltip(type, x, y);
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
                this.tooltip = this.getPlacedTowerTooltip(tower, x, y);
                this.canvas.style.cursor = "pointer";
                return;
            }
        }

        for (const enemy of this.enemies) {
            if (!enemy.dead && !enemy.escaped && Math.hypot(enemy.x - x, enemy.y - y) <= enemy.radius + 4) {
                this.hoveredId = "enemy-hover";
                this.tooltip = this.getEnemyTooltip(enemy, x, y);
                this.canvas.style.cursor = "pointer";
                return;
            }
        }

        const buildSpot = this.getBuildTileAt(x, y);
        if (buildSpot) {
            const canPlace = this.canPlaceTowerOnTile(buildSpot.index);
            this.previewTileIndex = buildSpot.index;
            this.hoveredId = `build-${buildSpot.index}-${canPlace ? "valid" : "invalid"}`;
            this.canvas.style.cursor = canPlace ? "pointer" : "not-allowed";
            return;
        }

        this.canvas.style.cursor = "default";
    }

    getTowerMenuTooltip(type, x, y) {
        const previewTower = new Tower(0, 0, type);
        const stats = previewTower.getDisplayStats();
        return {
            x,
            y,
            title: stats.name,
            lines: [
                `Damage: ${stats.damage}`,
                `Range: ${stats.range}`,
                `Rate: ${stats.rate}`,
                `${stats.ability}`
            ]
        };
    }

    getPlacedTowerTooltip(tower, x, y) {
        const stats = tower.getDisplayStats();
        return {
            x,
            y,
            title: stats.name,
            lines: [
                `Level: ${stats.level}`,
                `Damage: ${stats.damage}`,
                `Range: ${stats.range}`,
                `Rate: ${stats.rate}`,
                `${stats.ability}`
            ]
        };
    }

    getEnemyTooltip(enemy, x, y) {
        return {
            x,
            y,
            title: enemy.name,
            lines: [
                `HP: ${Math.ceil(enemy.hp)}/${enemy.maxHp}`,
                `Speed: ${Math.round(enemy.baseSpeed)}`,
                enemy.getTraitSummary()
            ]
        };
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

        const rangeTower = this.selectedTower ?? (this.previewTileIndex != null && this.canPlaceTowerOnTile(this.previewTileIndex) ? new Tower(this.buildTiles[this.previewTileIndex].x, this.buildTiles[this.previewTileIndex].y, this.selectedType) : null);
        if (rangeTower) this.uiRenderer.drawRangeIndicator(ctx, rangeTower.x, rangeTower.y, rangeTower.range);

        for (const impact of this.impactEffects) this.drawImpactEffect(ctx, impact);
        for (const tower of this.towers) tower.render(ctx);
        for (const projectile of this.projectiles) projectile.render(ctx);
        for (const enemy of this.enemies) enemy.render(ctx);
        for (const number of this.damageNumbers) this.drawDamageNumber(ctx, number);

        this.uiRenderer.drawTopBar(ctx, this);
        this.uiRenderer.drawSelectedTowerPanel(ctx, this);
        this.uiRenderer.drawLevelInfo(ctx, this);
        this.uiRenderer.drawTooltip(ctx, this);

        if (this.gameOver) this.uiRenderer.drawOverlay(ctx, this, "Defeat");
        if (this.victory) this.uiRenderer.drawOverlay(ctx, this, "Victory");
    }

    drawMap(ctx) {
        ctx.fillStyle = this.terrain.background;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawPath(ctx, this.terrain.pathOuter, 34);
        this.drawPath(ctx, this.terrain.pathInner, 24);

        for (let i = 0; i < this.buildTiles.length; i++) {
            const tile = this.buildTiles[i];
            const occupied = this.occupiedBuildTiles.has(i);
            const isPreview = this.previewTileIndex === i;
            const previewValid = isPreview && this.canPlaceTowerOnTile(i);
            const previewInvalid = isPreview && !this.canPlaceTowerOnTile(i);

            ctx.fillStyle = occupied
                ? "rgba(80,80,80,0.20)"
                : previewValid
                    ? "rgba(90,220,120,0.28)"
                    : previewInvalid
                        ? "rgba(255,90,90,0.25)"
                        : this.terrain.buildTile;
            ctx.strokeStyle = previewValid
                ? "rgba(170,255,190,0.8)"
                : previewInvalid
                    ? "rgba(255,140,140,0.8)"
                    : this.terrain.buildTileBorder;

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
