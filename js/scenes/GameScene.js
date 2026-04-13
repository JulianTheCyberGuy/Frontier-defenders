import Enemy from "../core/Enemy.js";
import Tower from "../core/Tower.js";
import level1 from "../levels/level1.js";
import level2 from "../levels/level2.js";
import level3 from "../levels/level3.js";
import MainMenuScene from "./MainMenuScene.js";
import LevelSelectScene from "./LevelSelectScene.js";
import UIRenderer from "../ui/UIRenderer.js";
import { TOWER_METADATA } from "../config.js";

export default class GameScene {
    constructor(canvas, sceneManager, soundManager, domUi) {
        this.canvas = canvas;
        this.sceneManager = sceneManager;
        this.soundManager = soundManager;
        this.domUI = domUi;
        this.ui = new UIRenderer(canvas);

        this.levels = [
            { id: 0, name: level1.name, data: level1 },
            { id: 1, name: level2.name, data: level2 },
            { id: 2, name: level3.name, data: level3 }
        ];

        this.enemyTypes = {
            scout: { role: "scout", name: "Scout", hp: 50, speed: 96, reward: 7, radius: 8, color: "#ff7b72", typeBadge: "S" },
            grunt: { role: "grunt", name: "Grunt", hp: 125, speed: 56, reward: 13, radius: 10, color: "#d29922", typeBadge: "G" },
            tank: { role: "tank", name: "Tank", hp: 260, speed: 34, reward: 24, radius: 13, color: "#8b949e", typeBadge: "T" }
        };

        this.towerCosts = {
            archer: 50,
            bomb: 70,
            berserker: 65,
            rogue: 60,
            mage: 80
        };

        this.buttons = ["archer", "bomb", "berserker", "rogue", "mage"];
        this.layout = this.ui.getGameLayout(this.buttons.length);

        this.hoveredId = null;
        this.hoveredEnemy = null;
        this.hoveredTower = null;
        this.pointer = { x: 0, y: 0 };
        this.currentLevelIndex = 0;
        this.pendingWaveBonus = 0;
        this.selectedType = "archer";
        this.selectedTower = null;

        this.damageNumbers = [];
        this.impactEffects = [];
        this.occupiedBuildTiles = new Set();

        this.handleClick = this.handleClick.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
    }

    onEnter() {
        this.refreshLayout();
        this.canvas.addEventListener("click", this.handleClick);
        this.canvas.addEventListener("mousemove", this.handleMouseMove);
        this.canvas.style.cursor = "default";
        this.domUI.showGame({
            onSelectTowerType: (type) => {
                this.selectedType = type;
                this.selectedTower = null;
                this.soundManager.playClick();
            },
            onUpgrade: (id) => this.tryUpgradeTower(id),
            onSell: () => this.sellSelectedTower(),
            onOverlayAction: (action) => this.handleOverlayAction(action)
        });
    }

    onExit() {
        this.canvas.removeEventListener("click", this.handleClick);
        this.canvas.removeEventListener("mousemove", this.handleMouseMove);
        this.canvas.style.cursor = "default";
        this.domUI.hide();
    }

    refreshLayout() {
        this.layout = this.ui.getGameLayout(this.buttons.length);
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
        this.hoveredEnemy = null;
        this.hoveredTower = null;
        this.pointer = { x: 0, y: 0 };

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
        const stats = this.enemyTypes[role] ?? this.enemyTypes.grunt;
        this.enemies.push(new Enemy(this.path, stats, this));
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

        if (this.selectedTower.upgrade(pathId)) {
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

    getBuildTileAt(x, y) {
        for (let i = 0; i < this.buildTiles.length; i++) {
            const tile = this.buildTiles[i];
            if (Math.hypot(tile.x - x, tile.y - y) <= 24) return { tile, index: i };
        }
        return null;
    }

    getTowerAt(x, y) {
        return this.towers.find((tower) => tower.contains(x, y)) ?? null;
    }

    getEnemyAt(x, y) {
        return this.enemies.find((enemy) => !enemy.dead && !enemy.escaped && Math.hypot(enemy.x - x, enemy.y - y) <= enemy.radius + 5) ?? null;
    }

    canPlaceTowerOnTile(index) {
        return !this.occupiedBuildTiles.has(index);
    }

    handleOverlayAction(action) {
        this.soundManager.playConfirm();
        if (action === "restart") this.loadLevel(this.currentLevelIndex);
        if (action === "levels") this.sceneManager.changeScene(new LevelSelectScene(this.canvas, this.sceneManager, this.soundManager, this.domUI));
        if (action === "menu") this.sceneManager.changeScene(new MainMenuScene(this.canvas, this.sceneManager, this.soundManager, this.domUI));
    }

    handleClick(event) {
        this.refreshLayout();
        const { x, y } = this.ui.getPointerPosition(event);
        this.pointer = { x, y };

        if (this.gameOver || this.victory) return;

        const clickedTower = this.getTowerAt(x, y);
        if (clickedTower) {
            this.selectedTower = clickedTower;
            this.soundManager.playClick();
            return;
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

    handleMouseMove(event) {
        this.refreshLayout();
        const { x, y } = this.ui.getPointerPosition(event);
        this.pointer = { x, y };
        this.hoveredId = null;
        this.hoveredEnemy = null;
        this.hoveredTower = null;

        const hoveredTower = this.getTowerAt(x, y);
        if (hoveredTower) {
            this.hoveredTower = hoveredTower;
            this.hoveredId = "tower-select";
            this.canvas.style.cursor = "pointer";
            return;
        }

        const hoveredEnemy = this.getEnemyAt(x, y);
        if (hoveredEnemy) {
            this.hoveredEnemy = hoveredEnemy;
            this.canvas.style.cursor = "pointer";
            return;
        }

        const buildSpot = this.getBuildTileAt(x, y);
        if (buildSpot) {
            const isValid = this.canPlaceTowerOnTile(buildSpot.index);
            this.hoveredId = `${isValid ? "build" : "blocked"}-${buildSpot.index}`;
            this.canvas.style.cursor = isValid ? "pointer" : "not-allowed";
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
            if (this.hoveredEnemy?.dead || this.hoveredEnemy?.escaped) this.hoveredEnemy = null;

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
                    this.spawnDamageNumber(28, 112, `+${this.pendingWaveBonus}`, "#f7dc6f");
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
        this.refreshLayout();
        this.drawMap(ctx);
        this.drawRangeIndicators(ctx);

        for (const impact of this.impactEffects) this.drawImpactEffect(ctx, impact);
        for (const tower of this.towers) tower.render(ctx);
        for (const projectile of this.projectiles) projectile.render(ctx);
        for (const enemy of this.enemies) enemy.render(ctx);
        for (const number of this.damageNumbers) this.drawDamageNumber(ctx, number);

        this.drawHoverTooltip(ctx);
        this.updateDomUi();
    }

    updateDomUi() {
        const selectedTowerSummary = this.selectedTower
            ? (() => {
                const stats = this.selectedTower.getDisplayStats();
                const upgradeCost = this.selectedTower.getUpgradeCost();
                return {
                    name: stats.name,
                    level: stats.level,
                    role: TOWER_METADATA[this.selectedTower.type].role,
                    ability: stats.ability,
                    damage: stats.damage,
                    range: stats.range,
                    rate: stats.rate,
                    invested: stats.invested,
                    sellValue: stats.sellValue,
                    upgradeCostText: upgradeCost == null ? "Maxed" : upgradeCost,
                    upgrades: this.selectedTower.getUpgradeChoices().map((choice) => ({
                        id: choice.id,
                        label: choice.label,
                        affordable: this.gold >= (this.selectedTower.getUpgradeCost() ?? Infinity)
                    }))
                };
            })()
            : null;

        const totalPending = this.pendingWave.length + this.enemies.length;
        const totalWaveUnits = (this.currentLevel?.data?.waves?.[this.waveIndex] || []).length || totalPending || 1;
        const pressure = totalPending / totalWaveUnits;

        this.domUI.updateGame({
            gold: this.gold,
            lives: this.lives,
            waveIndex: Math.min(this.waveIndex + 1, this.currentLevel.data.waves.length),
            totalWaves: this.currentLevel.data.waves.length,
            levelName: this.currentLevel.name,
            pendingWaveBonus: this.pendingWaveBonus,
            pressure,
            selectedType: this.selectedType,
            selectedTowerSummary,
            buttons: this.buttons.map((type) => ({ type, selected: this.selectedType === type, cost: this.towerCosts[type] })),
            gameOver: this.gameOver,
            victory: this.victory
        });
    }

    drawMap(ctx) {
        const logicalWidth = this.canvas.logicalWidth ?? this.canvas.width;
        const logicalHeight = this.canvas.logicalHeight ?? this.canvas.height;
        const backgroundGradient = ctx.createLinearGradient(0, 0, 0, logicalHeight);
        backgroundGradient.addColorStop(0, this.terrain.background);
        backgroundGradient.addColorStop(1, this.darkenColor(this.terrain.background, 0.22));
        ctx.fillStyle = backgroundGradient;
        ctx.fillRect(0, 0, logicalWidth, logicalHeight);

        this.drawPath(ctx, this.terrain.pathOuter, 30);
        this.drawPath(ctx, this.terrain.pathInner, 20);

        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.06)";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(this.path[0].x, this.path[0].y);
        for (let i = 1; i < this.path.length; i++) ctx.lineTo(this.path[i].x, this.path[i].y);
        ctx.stroke();
        ctx.restore();

        for (let i = 0; i < this.buildTiles.length; i++) {
            const tile = this.buildTiles[i];
            const occupied = this.occupiedBuildTiles.has(i);
            const hovered = this.hoveredId === `build-${i}`;
            const blocked = this.hoveredId === `blocked-${i}`;

            ctx.save();
            ctx.beginPath();
            ctx.arc(tile.x, tile.y, 26, 0, Math.PI * 2);
            ctx.fillStyle = occupied
                ? "rgba(82, 89, 110, 0.16)"
                : hovered
                    ? "rgba(94, 234, 156, 0.18)"
                    : blocked
                        ? "rgba(248, 113, 113, 0.14)"
                        : this.terrain.buildTile;
            ctx.fill();
            ctx.lineWidth = hovered || blocked ? 2 : 1.1;
            ctx.strokeStyle = hovered
                ? "rgba(187, 247, 208, 0.9)"
                : blocked
                    ? "rgba(254, 202, 202, 0.82)"
                    : this.terrain.buildTileBorder;
            ctx.stroke();
            ctx.restore();
        }
    }

    drawPath(ctx, color, width) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(this.path[0].x, this.path[0].y);
        for (let i = 1; i < this.path.length; i++) ctx.lineTo(this.path[i].x, this.path[i].y);
        ctx.stroke();
        ctx.restore();
    }

    drawRangeIndicators(ctx) {
        if (!this.selectedTower) return;
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.selectedTower.x, this.selectedTower.y, this.selectedTower.range, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(220, 232, 255, 0.58)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }

    drawImpactEffect(ctx, effect) {
        ctx.save();
        ctx.globalAlpha = effect.life / effect.maxLife;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.fillStyle = effect.color;
        ctx.fill();
        ctx.restore();
    }

    drawDamageNumber(ctx, number) {
        ctx.save();
        ctx.globalAlpha = number.life / number.maxLife;
        ctx.fillStyle = number.color;
        ctx.font = "bold 14px Inter";
        ctx.fillText(String(number.value), number.x, number.y);
        ctx.restore();
    }

    drawHoverTooltip(ctx) {
        const enemy = this.hoveredEnemy;
        if (!enemy) return;

        const x = enemy.x + 14;
        const y = enemy.y - 18;
        ctx.save();
        ctx.fillStyle = "rgba(8, 13, 22, 0.92)";
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x, y, 120, 46, 12);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#f8f4eb";
        ctx.font = "bold 12px Inter";
        ctx.fillText(enemy.name, x + 10, y + 16);
        ctx.fillStyle = "rgba(232, 222, 205, 0.82)";
        ctx.font = "11px Inter";
        ctx.fillText(`HP ${Math.ceil(enemy.hp)} / ${enemy.maxHp}`, x + 10, y + 32);
        ctx.restore();
    }

    darkenColor(hex, amount) {
        const normalized = hex.replace("#", "");
        const value = Number.parseInt(normalized, 16);
        const r = Math.max(0, Math.min(255, ((value >> 16) & 255) * (1 - amount)));
        const g = Math.max(0, Math.min(255, ((value >> 8) & 255) * (1 - amount)));
        const b = Math.max(0, Math.min(255, (value & 255) * (1 - amount)));
        return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    }
}
