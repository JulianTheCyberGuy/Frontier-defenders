import Enemy from "../core/Enemy.js";
import Tower from "../core/Tower.js";
import { TOWER_METADATA } from "../config.js";
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
        this.particles = [];
        this.occupiedBuildTiles = new Set();
        this.screenShake = { amount: 0, time: 0, duration: 0, x: 0, y: 0 };
        this.time = 0;
        this.sceneFade = 1;

        this.handleClick = this.handleClick.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
    }

    onEnter() {
        this.refreshLayout();
        this.canvas.addEventListener("click", this.handleClick);
        this.canvas.addEventListener("mousemove", this.handleMouseMove);
        this.canvas.style.cursor = "default";
    }

    onExit() {
        this.canvas.removeEventListener("click", this.handleClick);
        this.canvas.removeEventListener("mousemove", this.handleMouseMove);
        this.canvas.style.cursor = "default";
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
        this.particles = [];
        this.occupiedBuildTiles = new Set();
        this.screenShake = { amount: 0, time: 0, duration: 0, x: 0, y: 0 };
        this.time = 0;
        this.sceneFade = 1;

        this.gold = 260;
        this.lives = 20;
        this.selectedTower = null;
        this.hoveredEnemy = null;
        this.hoveredTower = null;
        this.pointer = { x: 0, y: 0 };
        this.time = 0;
        this.sceneFade = 0.9;
        this.screenShake = { amount: 0, time: 0, duration: 0, x: 0, y: 0 };

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
                this.spawnParticles(this.layout.worldRect.x + this.layout.worldRect.width * 0.5, this.layout.worldRect.y + this.layout.worldRect.height * 0.5, '#7ef0c2', 28, 30, 120, 0.65, { size: 3, sizeVariance: 3.5, glow: 16 });
                this.addScreenShake(5, 0.24);
                this.endSoundPlayed = true;
            }
            return;
        }

        this.pendingWave = [...this.currentLevel.data.waves[this.waveIndex]];
        this.pendingWaveBonus = 15 + this.waveIndex * 6;
        this.spawnTimer = 0;
        this.soundManager.playWaveStart();
        this.spawnWaveBurst();
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
        this.spawnParticles(x, y, color, Math.max(5, Math.round(maxRadius * 0.45)), 28, 72, 0.3);
    }

    spawnParticles(x, y, color = "#ffffff", count = 8, speedMin = 24, speedMax = 90, life = 0.32, options = {}) {
        for (let i = 0; i < count; i++) {
            const angle = options.direction != null
                ? options.direction + (Math.random() - 0.5) * (options.spread ?? Math.PI)
                : Math.random() * Math.PI * 2;
            const speed = speedMin + Math.random() * (speedMax - speedMin);
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color,
                life: life * (0.7 + Math.random() * 0.6),
                maxLife: life,
                size: (options.size ?? 2.4) + Math.random() * (options.sizeVariance ?? 2.2),
                drag: options.drag ?? 0.94,
                gravity: options.gravity ?? 0,
                glow: options.glow ?? 0,
                shrink: options.shrink ?? 0.94
            });
        }
    }

    spawnMuzzleFlash(x, y, color = "#ffffff", count = 8) {
        this.spawnParticles(x, y, color, count, 36, 110, 0.18, { size: 2.8, sizeVariance: 2.6, glow: 8, shrink: 0.9 });
    }

    spawnSlashBurst(x, y, color = "#ffffff") {
        this.spawnParticles(x, y, color, 10, 42, 130, 0.22, { size: 2.4, sizeVariance: 2.2, glow: 6, shrink: 0.9 });
    }

    spawnWaveBurst() {
        const start = this.path?.[0];
        if (!start) return;
        this.spawnParticles(start.x, start.y, '#f8fbff', 16, 20, 80, 0.5, { size: 2.5, sizeVariance: 2.5, glow: 10, shrink: 0.95 });
    }

    addScreenShake(amount = 2, duration = 0.08) {
        this.screenShake.amount = Math.max(this.screenShake.amount, amount);
        this.screenShake.time = Math.max(this.screenShake.time, duration);
        this.screenShake.duration = Math.max(this.screenShake.duration, duration);
    }

    tryUpgradeTower(pathId) {
        if (!this.selectedTower) return;

        const cost = this.selectedTower.getUpgradeCost();
        if (cost == null || this.gold < cost) return;

        if (this.selectedTower.upgrade(pathId)) {
            this.gold -= cost;
            this.soundManager.playUpgrade();
            this.spawnParticles(this.selectedTower.x, this.selectedTower.y, '#f1ca72', 14, 26, 92, 0.38, { size: 2.4, sizeVariance: 2.8, glow: 12 });
            this.addScreenShake(2.2, 0.08);
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
        this.spawnParticles(tower.x, tower.y, '#7ef0c2', 12, 30, 80, 0.34, { size: 2.6, sizeVariance: 2.4, glow: 8 });
        this.selectedTower = null;
        this.soundManager.playSell();
    }

    getTowerButtonIndex(x, y) {
        return this.layout.towerButtonRects.findIndex((rect) => x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height);
    }

    getOverlayButtonAt(x, y) {
        if (!this.gameOver && !this.victory) return null;

        for (const [key, button] of Object.entries(this.layout.overlayButtons)) {
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
            const button = this.layout.upgradeButtons[i];
            if (x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height) {
                return `upgrade-${choices[i].id}`;
            }
        }

        const sellButton = this.layout.sellButton;
        if (x >= sellButton.x && x <= sellButton.x + sellButton.width && y >= sellButton.y && y <= sellButton.y + sellButton.height) {
            return "sell-tower";
        }

        return null;
    }

    getBuildTileAt(x, y) {
        for (let i = 0; i < this.buildTiles.length; i++) {
            const tile = this.buildTiles[i];
            if (Math.hypot(tile.x - x, tile.y - y) <= 24) {
                return { tile, index: i };
            }
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

    handleClick(event) {
        this.refreshLayout();
        const { x, y } = this.ui.getPointerPosition(event);
        this.pointer = { x, y };

        const overlayAction = this.getOverlayButtonAt(x, y);
        if (overlayAction) {
            this.soundManager.playConfirm();
            if (overlayAction === "restart") this.loadLevel(this.currentLevelIndex);
            if (overlayAction === "levels") this.sceneManager.changeScene(new LevelSelectScene(this.canvas, this.sceneManager, this.soundManager));
            if (overlayAction === "menu") this.sceneManager.changeScene(new MainMenuScene(this.canvas, this.sceneManager, this.soundManager));
            return;
        }

        if (this.gameOver || this.victory) return;

        const towerIndex = this.getTowerButtonIndex(x, y);
        if (towerIndex !== -1) {
            this.selectedType = this.buttons[towerIndex];
            this.selectedTower = null;
            this.soundManager.playClick();
            return;
        }

        if (this.selectedTower) {
            const choices = this.selectedTower.getUpgradeChoices();
            for (let i = 0; i < choices.length; i++) {
                const button = this.layout.upgradeButtons[i];
                if (x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height) {
                    this.tryUpgradeTower(choices[i].id);
                    return;
                }
            }

            const sellButton = this.layout.sellButton;
            if (x >= sellButton.x && x <= sellButton.x + sellButton.width && y >= sellButton.y && y <= sellButton.y + sellButton.height) {
                this.sellSelectedTower();
                return;
            }
        }

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
        this.spawnMuzzleFlash(tower.x, tower.y, tower.color, 12);
        this.addScreenShake(1.5, 0.06);
        this.soundManager.playPlaceTower();
    }

    handleMouseMove(event) {
        this.refreshLayout();
        const { x, y } = this.ui.getPointerPosition(event);
        this.pointer = { x, y };
        this.hoveredId = null;
        this.hoveredEnemy = null;
        this.hoveredTower = null;

        const overlayAction = this.getOverlayButtonAt(x, y);
        if (overlayAction) {
            this.hoveredId = overlayAction;
            this.canvas.style.cursor = "pointer";
            return;
        }

        const towerIndex = this.getTowerButtonIndex(x, y);
        if (towerIndex !== -1) {
            this.hoveredId = `tower-${this.buttons[towerIndex]}`;
            this.canvas.style.cursor = "pointer";
            return;
        }

        const hoveredUpgrade = this.getHoveredUpgradeButton(x, y);
        if (hoveredUpgrade) {
            this.hoveredId = hoveredUpgrade;
            this.canvas.style.cursor = "pointer";
            return;
        }

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
        this.time += dt;
        this.sceneFade = Math.max(0, this.sceneFade - dt * 1.8);

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
                    this.spawnParticles(this.path[this.path.length - 1].x, this.path[this.path.length - 1].y, '#ff8f8f', 22, 26, 110, 0.55, { size: 3, sizeVariance: 3.2, glow: 14 });
                    this.addScreenShake(7, 0.3);
                    this.endSoundPlayed = true;
                }
            }

            if (waveCleared && !this.gameOver && !this.victory) {
                if (this.pendingWaveBonus > 0) {
                    this.gold += this.pendingWaveBonus;
                    this.spawnDamageNumber(28, 112, `+${this.pendingWaveBonus}`, "#f7dc6f");
                    this.spawnParticles(this.layout.topBar.x + 56, this.layout.topBar.y + 32, '#f7dc6f', 12, 24, 74, 0.36, { size: 2.6, sizeVariance: 2.3, glow: 12 });
                    this.pendingWaveBonus = 0;
                }

                this.waveIndex += 1;
                this.startWave();
            }
        }

        this.updateDamageNumbers(dt);
        this.updateImpactEffects(dt);
        this.updateParticles(dt);
        this.updateScreenShake(dt);
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

    updateParticles(dt) {
        for (const particle of this.particles) {
            particle.life -= dt;
            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;
            particle.vx *= particle.drag;
            particle.vy = particle.vy * particle.drag + particle.gravity;
            particle.size *= particle.shrink;
        }
        this.particles = this.particles.filter((particle) => particle.life > 0 && particle.size > 0.35);
    }

    updateScreenShake(dt) {
        if (this.screenShake.time <= 0) {
            this.screenShake.x = 0;
            this.screenShake.y = 0;
            return;
        }

        this.screenShake.time -= dt;
        const strength = this.screenShake.amount * Math.max(0, this.screenShake.time / Math.max(0.0001, this.screenShake.duration));
        this.screenShake.x = (Math.random() * 2 - 1) * strength;
        this.screenShake.y = (Math.random() * 2 - 1) * strength;

        if (this.screenShake.time <= 0) {
            this.screenShake.amount = 0;
            this.screenShake.x = 0;
            this.screenShake.y = 0;
        }
    }

    render(ctx) {
        this.refreshLayout();

        ctx.save();
        ctx.translate(this.screenShake.x, this.screenShake.y);
        this.drawMap(ctx);
        this.drawRangeIndicators(ctx);
        for (const impact of this.impactEffects) this.drawImpactEffect(ctx, impact);
        for (const particle of this.particles) this.drawParticle(ctx, particle);
        for (const tower of this.towers) tower.render(ctx);
        for (const projectile of this.projectiles) projectile.render(ctx);
        for (const enemy of this.enemies) enemy.render(ctx);
        for (const number of this.damageNumbers) this.drawDamageNumber(ctx, number);
        ctx.restore();

        this.drawHud(ctx);
        this.drawTowerDock(ctx);
        this.drawSidebar(ctx);
        this.drawHoverTooltip(ctx);

        if (this.gameOver) this.drawOverlay(ctx, "Defeat");
        if (this.victory) this.drawOverlay(ctx, "Victory");

        if (this.sceneFade > 0) {
            ctx.save();
            ctx.globalAlpha = this.sceneFade;
            ctx.fillStyle = '#04070d';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.restore();
        }
    }

    drawMap(ctx) {
        const backgroundGradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        backgroundGradient.addColorStop(0, this.terrain.background);
        backgroundGradient.addColorStop(1, this.darkenColor(this.terrain.background, 0.22));
        ctx.fillStyle = backgroundGradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawPath(ctx, this.terrain.pathOuter, 34);
        this.drawPath(ctx, this.terrain.pathInner, 24);

        const { worldRect } = this.layout;
        ctx.save();
        const vignette = ctx.createRadialGradient(
            worldRect.x + worldRect.width * 0.5,
            worldRect.y + worldRect.height * 0.5,
            worldRect.width * 0.1,
            worldRect.x + worldRect.width * 0.5,
            worldRect.y + worldRect.height * 0.5,
            worldRect.width * 0.7
        );
        vignette.addColorStop(0, "rgba(255,255,255,0)");
        vignette.addColorStop(1, "rgba(4,8,14,0.22)");
        ctx.fillStyle = vignette;
        ctx.fillRect(worldRect.x, worldRect.y, worldRect.width, worldRect.height);
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
                ? "rgba(95, 103, 126, 0.22)"
                : hovered
                    ? "rgba(94, 234, 156, 0.22)"
                    : blocked
                        ? "rgba(248, 113, 113, 0.18)"
                        : this.terrain.buildTile;
            ctx.fill();
            ctx.lineWidth = hovered || blocked ? 2.5 : 1.4;
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
        if (this.selectedTower) {
            this.ui.drawRangeRing(ctx, this.selectedTower.x, this.selectedTower.y, this.selectedTower.range, {
                fill: "rgba(96, 165, 250, 0.12)",
                stroke: "rgba(191, 219, 254, 0.55)"
            });
        }

        if (this.hoveredTower && this.hoveredTower !== this.selectedTower) {
            this.ui.drawRangeRing(ctx, this.hoveredTower.x, this.hoveredTower.y, this.hoveredTower.range, {
                fill: "rgba(167, 139, 250, 0.08)",
                stroke: "rgba(216, 180, 254, 0.42)"
            });
        }

        const hoveredBuildIndex = this.hoveredId?.startsWith("build-") ? Number(this.hoveredId.split("-")[1]) : null;
        if (hoveredBuildIndex != null && !Number.isNaN(hoveredBuildIndex)) {
            const tile = this.buildTiles[hoveredBuildIndex];
            const previewRange = new Tower(tile.x, tile.y, this.selectedType).range;
            this.ui.drawRangeRing(ctx, tile.x, tile.y, previewRange, {
                fill: "rgba(34, 197, 94, 0.1)",
                stroke: "rgba(187, 247, 208, 0.5)"
            });
        }
    }

    drawImpactEffect(ctx, effect) {
        const alpha = effect.life / effect.maxLife;
        ctx.save();
        ctx.strokeStyle = effect.color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 2 + (1 - alpha) * 2;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    drawParticle(ctx, particle) {
        const alpha = Math.max(0, particle.life / particle.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;
        if (particle.glow > 0) {
            ctx.shadowColor = particle.color;
            ctx.shadowBlur = particle.glow;
        }
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawDamageNumber(ctx, number) {
        const alpha = number.life / number.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = number.color;
        ctx.font = "700 15px Inter";
        ctx.fillText(`${number.value}`, number.x, number.y);
        ctx.restore();
    }

    drawHud(ctx) {
        const { topBar } = this.layout;
        this.ui.drawPanel(ctx, topBar.x, topBar.y, topBar.width, topBar.height, {
            radius: 24,
            fill: "rgba(7, 12, 22, 0.88)",
            border: "rgba(255,255,255,0.12)",
            glow: "rgba(15, 23, 42, 0.3)"
        });

        const stats = [
            { label: "Gold", value: `${this.gold}`, accent: "#f1ca72" },
            { label: "Lives", value: `${this.lives}`, accent: "#7ef0c2" },
            {
                label: "Wave",
                value: `${Math.min(this.waveIndex + 1, this.currentLevel.data.waves.length)}/${this.currentLevel.data.waves.length}`,
                accent: "#7fb3ff"
            }
        ];

        stats.forEach((stat, index) => {
            const x = topBar.x + 18 + index * 118;
            this.ui.drawPanel(ctx, x, topBar.y + 12, 106, 48, {
                radius: 18,
                fill: "rgba(14, 23, 38, 0.92)",
                border: "rgba(255,255,255,0.08)",
                glow: "rgba(0,0,0,0)"
            });

            ctx.save();
            ctx.fillStyle = stat.accent;
            ctx.font = "700 11px Inter";
            ctx.fillText(stat.label.toUpperCase(), x + 14, topBar.y + 28);
            ctx.fillStyle = "#f8fbff";
            ctx.font = "700 18px Inter";
            ctx.fillText(stat.value, x + 14, topBar.y + 50);
            ctx.restore();
        });

        const progressRect = { x: topBar.x + topBar.width - 258, y: topBar.y + 30, width: 214, height: 12 };
        const totalInWave = this.currentLevel.data.waves[Math.min(this.waveIndex, this.currentLevel.data.waves.length - 1)]?.length ?? 1;
        const progressed = totalInWave === 0 ? 1 : 1 - this.pendingWave.length / totalInWave;
        this.ui.drawMeter(ctx, progressRect, this.victory ? 1 : progressed, {
            start: "#7ef0c2",
            end: "#7fb3ff",
            track: "rgba(255,255,255,0.08)",
            border: "rgba(255,255,255,0.08)"
        });

        ctx.save();
        ctx.textAlign = "center";
        ctx.fillStyle = "#f8fbff";
        ctx.font = "700 18px Cinzel";
        ctx.fillText(this.currentLevel.name, topBar.x + topBar.width * 0.56, topBar.y + 30);
        ctx.fillStyle = "rgba(194, 206, 223, 0.72)";
        ctx.font = "500 12px Inter";
        ctx.fillText(`Next clear bonus ${this.pendingWaveBonus}`, topBar.x + topBar.width * 0.56, topBar.y + 50);
        ctx.fillText("Wave pressure", progressRect.x + progressRect.width / 2, topBar.y + 20);
        ctx.restore();
    }

    drawTowerDock(ctx) {
        const { towerDock, towerButtonRects } = this.layout;
        this.ui.drawPanel(ctx, towerDock.x, towerDock.y, towerDock.width, towerDock.height, {
            radius: 26,
            fill: "rgba(7, 12, 22, 0.9)",
            border: "rgba(255,255,255,0.1)",
            glow: "rgba(15, 23, 42, 0.3)"
        });

        ctx.save();
        ctx.fillStyle = "#f8fbff";
        ctx.font = "700 12px Inter";
        ctx.fillText("Tower Dock", towerDock.x + 16, towerDock.y + 18);
        ctx.fillStyle = "rgba(194, 206, 223, 0.68)";
        ctx.font = "500 11px Inter";
        ctx.fillText("Pick a blueprint, then place it on a marked build tile.", towerDock.x + 16, towerDock.y + 34);
        ctx.restore();

        towerButtonRects.forEach((rect, index) => {
            const type = this.buttons[index];
            const meta = TOWER_METADATA[type];
            const hovered = this.hoveredId === `tower-${type}`;
            const active = this.selectedType === type && !this.selectedTower;

            this.ui.drawPanel(ctx, rect.x, rect.y, rect.width, rect.height, {
                radius: 20,
                fill: active
                    ? "rgba(23, 35, 56, 0.98)"
                    : hovered
                        ? "rgba(18, 29, 47, 0.98)"
                        : "rgba(12, 20, 33, 0.95)",
                border: active
                    ? "rgba(255, 235, 177, 0.36)"
                    : hovered
                        ? "rgba(181, 215, 255, 0.26)"
                        : "rgba(255,255,255,0.08)",
                glow: hovered || active ? `${meta.accent}33` : "rgba(0,0,0,0)"
            });

            ctx.save();
            ctx.fillStyle = `${meta.accent}33`;
            ctx.beginPath();
            ctx.arc(rect.x + rect.width - 22, rect.y + 18, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = meta.accent;
            ctx.font = "700 11px Inter";
            ctx.fillText(meta.shortLabel, rect.x + 12, rect.y + 20);
            ctx.fillStyle = "#f8fbff";
            ctx.font = "700 15px Inter";
            ctx.fillText(meta.label, rect.x + 12, rect.y + 40);
            ctx.fillStyle = "rgba(194, 206, 223, 0.72)";
            ctx.font = "500 11px Inter";
            ctx.fillText(meta.role, rect.x + 12, rect.y + 58);
            ctx.fillStyle = active ? "#f1ca72" : "#f8fbff";
            ctx.font = "700 12px Inter";
            ctx.fillText(`${this.towerCosts[type]} gold`, rect.x + 12, rect.y + 78);
            ctx.restore();
        });
    }

    drawSidebar(ctx) {
        const { sidebar } = this.layout;
        this.ui.drawPanel(ctx, sidebar.x, sidebar.y, sidebar.width, sidebar.height, {
            radius: 26,
            fill: "rgba(8, 13, 22, 0.9)",
            border: "rgba(255,255,255,0.1)",
            glow: "rgba(15, 23, 42, 0.34)"
        });

        ctx.save();
        ctx.fillStyle = "#f8fbff";
        ctx.font = "700 12px Inter";
        ctx.fillText("Command Panel", sidebar.x + 16, sidebar.y + 20);
        ctx.fillStyle = "rgba(194, 206, 223, 0.68)";
        ctx.font = "500 11px Inter";
        ctx.fillText("Inspect selected towers or preview the active blueprint.", sidebar.x + 16, sidebar.y + 36);
        ctx.restore();

        if (this.selectedTower) {
            this.drawSelectedTowerPanel(ctx);
        } else {
            this.drawSelectedTypePanel(ctx);
        }
    }

    drawSelectedTypePanel(ctx) {
        const { sidebar } = this.layout;
        const preview = new Tower(0, 0, this.selectedType);
        const meta = TOWER_METADATA[this.selectedType];
        const stats = [
            { label: "Damage", value: `${Math.round(preview.damage)}` },
            { label: "Range", value: `${Math.round(preview.range)}` },
            { label: "Rate", value: preview.rate.toFixed(2) },
            { label: "Cost", value: `${this.towerCosts[this.selectedType]}` }
        ];

        ctx.save();
        ctx.fillStyle = `${meta.accent}33`;
        ctx.beginPath();
        ctx.arc(sidebar.x + sidebar.width - 44, sidebar.y + 44, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#f8fbff";
        ctx.font = "700 22px Cinzel";
        ctx.fillText(meta.label, sidebar.x + 16, sidebar.y + 62);
        ctx.fillStyle = "rgba(194, 206, 223, 0.74)";
        ctx.font = "500 13px Inter";
        ctx.fillText(meta.role, sidebar.x + 16, sidebar.y + 86);
        ctx.fillText(preview.getAbilitySummary(), sidebar.x + 16, sidebar.y + 108);
        ctx.restore();

        this.drawStatGrid(ctx, stats, sidebar.x + 14, sidebar.y + 132, sidebar.width - 28);

        ctx.save();
        ctx.fillStyle = "#f8fbff";
        ctx.font = "700 12px Inter";
        ctx.fillText("Placement", sidebar.x + 16, sidebar.y + 252);
        ctx.fillStyle = "rgba(194, 206, 223, 0.74)";
        ctx.font = "500 13px Inter";
        ctx.fillText("Move to a highlighted build tile to preview range.", sidebar.x + 16, sidebar.y + 278);
        ctx.fillText("Click once to place the tower if you have enough gold.", sidebar.x + 16, sidebar.y + 300);
        ctx.fillText("Select an existing tower to inspect upgrades and sell value.", sidebar.x + 16, sidebar.y + 334);
        ctx.restore();
    }

    drawSelectedTowerPanel(ctx) {
        const { sidebar, upgradeButtons, sellButton } = this.layout;
        const stats = this.selectedTower.getDisplayStats();
        const cost = this.selectedTower.getUpgradeCost();
        const choices = this.selectedTower.getUpgradeChoices();
        const meta = TOWER_METADATA[this.selectedTower.type];

        ctx.save();
        ctx.fillStyle = `${meta.accent}33`;
        ctx.beginPath();
        ctx.arc(sidebar.x + sidebar.width - 44, sidebar.y + 44, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#f8fbff";
        ctx.font = "700 22px Cinzel";
        ctx.fillText(stats.name, sidebar.x + 16, sidebar.y + 62);
        ctx.fillStyle = "rgba(194, 206, 223, 0.74)";
        ctx.font = "500 13px Inter";
        ctx.fillText(`Level ${stats.level} ${meta.role}`, sidebar.x + 16, sidebar.y + 86);
        ctx.fillText(stats.ability, sidebar.x + 16, sidebar.y + 108);
        ctx.restore();

        this.drawStatGrid(ctx, [
            { label: "Damage", value: `${stats.damage}` },
            { label: "Range", value: `${stats.range}` },
            { label: "Rate", value: `${stats.rate}` },
            { label: "Sell", value: `${stats.sellValue}` }
        ], sidebar.x + 14, sidebar.y + 132, sidebar.width - 28);

        ctx.save();
        ctx.fillStyle = "#f8fbff";
        ctx.font = "700 12px Inter";
        ctx.fillText("Upgrade Paths", sidebar.x + 16, sidebar.y + 252);
        ctx.fillStyle = "rgba(194, 206, 223, 0.74)";
        ctx.font = "500 12px Inter";
        ctx.fillText(cost != null ? `Upgrade cost ${cost}` : "Max level reached", sidebar.x + 16, sidebar.y + 270);
        ctx.fillText(`Invested ${stats.invested}`, sidebar.x + 148, sidebar.y + 270);
        ctx.restore();

        for (let i = 0; i < choices.length; i++) {
            const button = upgradeButtons[i];
            const enabled = this.gold >= (cost ?? 9999);
            this.ui.drawButton(ctx, button, choices[i].label, {
                hovered: this.hoveredId === `upgrade-${choices[i].id}`,
                disabled: !enabled,
                radius: 16,
                font: "700 13px Inter"
            });
        }

        this.ui.drawButton(ctx, sellButton, `Sell Tower +${stats.sellValue}`, {
            hovered: this.hoveredId === "sell-tower",
            radius: 16,
            font: "700 13px Inter"
        });
    }

    drawStatGrid(ctx, stats, startX, startY, width) {
        const gap = 10;
        const cardWidth = Math.floor((width - gap) / 2);
        const cardHeight = 52;

        stats.forEach((stat, index) => {
            const column = index % 2;
            const row = Math.floor(index / 2);
            const x = startX + column * (cardWidth + gap);
            const y = startY + row * (cardHeight + gap);

            this.ui.drawPanel(ctx, x, y, cardWidth, cardHeight, {
                radius: 18,
                fill: "rgba(12, 20, 33, 0.95)",
                border: "rgba(255,255,255,0.08)",
                glow: "rgba(0,0,0,0)"
            });

            ctx.save();
            ctx.fillStyle = "rgba(194, 206, 223, 0.66)";
            ctx.font = "700 10px Inter";
            ctx.fillText(stat.label.toUpperCase(), x + 12, y + 18);
            ctx.fillStyle = "#f8fbff";
            ctx.font = "700 18px Inter";
            ctx.fillText(stat.value, x + 12, y + 38);
            ctx.restore();
        });
    }

    drawHoverTooltip(ctx) {
        if (this.hoveredEnemy) {
            const traits = [];
            if (this.hoveredEnemy.damageReduction > 0) traits.push("Shielded");
            if (this.hoveredEnemy.hasEffect("burn")) traits.push("Burning");
            if (this.hoveredEnemy.hasEffect("slow")) traits.push("Slowed");
            if (this.hoveredEnemy.hasEffect("freeze")) traits.push("Frozen");
            if (this.hoveredEnemy.hasEffect("stun")) traits.push("Stunned");
            this.ui.drawTooltip(ctx, this.pointer.x + 14, this.pointer.y + 14, [
                this.hoveredEnemy.name,
                `HP ${Math.max(0, Math.ceil(this.hoveredEnemy.hp))}/${this.hoveredEnemy.maxHp}`,
                `Speed ${this.hoveredEnemy.baseSpeed}`,
                traits.length > 0 ? `Traits ${traits.join(", ")}` : "Traits None"
            ]);
            return;
        }

        if (this.hoveredTower) {
            const stats = this.hoveredTower.getDisplayStats();
            this.ui.drawTooltip(ctx, this.pointer.x + 14, this.pointer.y + 14, [
                stats.name,
                `Level ${stats.level}`,
                `Damage ${stats.damage}`,
                `Range ${stats.range}`,
                `Rate ${stats.rate}`
            ]);
            return;
        }

        if (this.hoveredId?.startsWith("tower-")) {
            const type = this.hoveredId.replace("tower-", "");
            const preview = new Tower(0, 0, type);
            this.ui.drawTooltip(ctx, this.pointer.x + 14, this.pointer.y + 14, [
                TOWER_METADATA[type].label,
                `Cost ${this.towerCosts[type]}`,
                `Damage ${preview.damage}`,
                `Range ${Math.round(preview.range)}`,
                `Rate ${preview.rate.toFixed(2)}`
            ]);
        }
    }

    drawOverlay(ctx, text) {
        ctx.save();
        ctx.fillStyle = "rgba(3, 8, 16, 0.76)";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.restore();

        const titlePulse = 1 + Math.sin(this.time * 4.2) * 0.03;

        const { overlay, overlayButtons } = this.layout;
        this.ui.drawPanel(ctx, overlay.x, overlay.y, overlay.width, overlay.height, {
            radius: 30,
            fill: "rgba(7, 12, 22, 0.95)",
            border: "rgba(255,255,255,0.12)",
            glow: "rgba(15, 23, 42, 0.35)"
        });

        ctx.save();
        ctx.textAlign = "center";
        ctx.fillStyle = "#f8fbff";
        ctx.font = `700 ${Math.round(42 * titlePulse)}px Cinzel`;
        ctx.fillText(text, overlay.x + overlay.width / 2, overlay.y + 72);
        ctx.fillStyle = "rgba(228, 236, 248, 0.76)";
        ctx.font = "500 16px Inter";
        ctx.fillText(
            text === "Victory" ? "The frontier holds. Push on to the next route." : "The line collapsed. Rebuild and tighten coverage.",
            overlay.x + overlay.width / 2,
            overlay.y + 108
        );
        ctx.restore();

        this.ui.drawButton(ctx, overlayButtons.restart, "Restart", {
            hovered: this.hoveredId === "restart",
            active: true,
            radius: 16,
            font: "700 14px Inter"
        });
        this.ui.drawButton(ctx, overlayButtons.levels, "Level Select", {
            hovered: this.hoveredId === "levels",
            radius: 16,
            font: "700 14px Inter"
        });
        this.ui.drawButton(ctx, overlayButtons.menu, "Main Menu", {
            hovered: this.hoveredId === "menu",
            radius: 16,
            font: "700 14px Inter"
        });
    }

    darkenColor(hex, amount) {
        if (!hex?.startsWith("#")) return hex;
        const value = hex.replace("#", "");
        const full = value.length === 3
            ? value.split("").map((part) => part + part).join("")
            : value;
        const numeric = Number.parseInt(full, 16);
        const r = Math.max(0, Math.min(255, Math.round(((numeric >> 16) & 255) * (1 - amount))));
        const g = Math.max(0, Math.min(255, Math.round(((numeric >> 8) & 255) * (1 - amount))));
        const b = Math.max(0, Math.min(255, Math.round((numeric & 255) * (1 - amount))));
        return `rgb(${r}, ${g}, ${b})`;
    }
}
