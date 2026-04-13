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
        this.towerButtonRects = this.buttons.map((type, index) => ({
            id: type,
            x: 286 + index * 104,
            y: 18,
            width: 92,
            height: 36
        }));

        this.upgradeButtons = [
            { x: 692, y: 220, width: 236, height: 40, id: "left" },
            { x: 692, y: 270, width: 236, height: 40, id: "right" }
        ];
        this.sellButton = { x: 692, y: 326, width: 236, height: 40 };
        this.overlayButtons = {
            restart: { x: 292, y: 295, width: 156, height: 48 },
            levels: { x: 466, y: 295, width: 178, height: 48 },
            menu: { x: 380, y: 355, width: 176, height: 48 }
        };

        this.sidebar = { x: 674, y: 82, width: 270, height: 434 };
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

        this.towers = this.towers.filter(item => item !== tower);
        this.spawnDamageNumber(tower.x - 14, tower.y - 18, `+${sellValue}`, "#7ef0c2");
        this.selectedTower = null;
        this.soundManager.playClick();
    }

    getTopBarTowerIndex(x, y) {
        return this.towerButtonRects.findIndex(rect => x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height);
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
        for (let i = 0; i < this.buildTiles.length; i++) {
            const tile = this.buildTiles[i];
            if (Math.hypot(tile.x - x, tile.y - y) <= 24) {
                return { tile, index: i };
            }
        }
        return null;
    }

    getTowerAt(x, y) {
        return this.towers.find(tower => tower.contains(x, y)) ?? null;
    }

    getEnemyAt(x, y) {
        return this.enemies.find(enemy => !enemy.dead && !enemy.escaped && Math.hypot(enemy.x - x, enemy.y - y) <= enemy.radius + 5) ?? null;
    }

    canPlaceTowerOnTile(index) {
        return !this.occupiedBuildTiles.has(index);
    }

    handleClick(event) {
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

        const topIndex = this.getTopBarTowerIndex(x, y);
        if (topIndex !== -1) {
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

        const topIndex = this.getTopBarTowerIndex(x, y);
        if (topIndex !== -1) {
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

            this.enemies = this.enemies.filter(enemy => !enemy.dead && !enemy.escaped);
            this.projectiles = this.projectiles.filter(projectile => !projectile.dead);

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
        this.damageNumbers = this.damageNumbers.filter(number => number.life > 0);
    }

    updateImpactEffects(dt) {
        for (const effect of this.impactEffects) {
            effect.life -= dt;
            const progress = 1 - effect.life / effect.maxLife;
            effect.radius = 4 + (effect.maxRadius - 4) * progress;
        }
        this.impactEffects = this.impactEffects.filter(effect => effect.life > 0);
    }

    render(ctx) {
        this.drawMap(ctx);
        this.drawRangeIndicators(ctx);

        for (const impact of this.impactEffects) this.drawImpactEffect(ctx, impact);
        for (const tower of this.towers) tower.render(ctx);
        for (const projectile of this.projectiles) projectile.render(ctx);
        for (const enemy of this.enemies) enemy.render(ctx);
        for (const number of this.damageNumbers) this.drawDamageNumber(ctx, number);

        this.drawHud(ctx);
        this.drawSidebar(ctx);
        this.drawHoverTooltip(ctx);

        if (this.gameOver) this.drawOverlay(ctx, "Defeat");
        if (this.victory) this.drawOverlay(ctx, "Victory");
    }

    drawMap(ctx) {
        const backgroundGradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        backgroundGradient.addColorStop(0, this.terrain.background);
        backgroundGradient.addColorStop(1, this.darkenColor(this.terrain.background, 0.22));
        ctx.fillStyle = backgroundGradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawPath(ctx, this.terrain.pathOuter, 34);
        this.drawPath(ctx, this.terrain.pathInner, 24);

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
        ctx.font = "700 15px Inter";
        ctx.fillText(`${number.value}`, number.x, number.y);
        ctx.restore();
    }

    drawHud(ctx) {
        this.ui.drawPanel(ctx, 16, 12, 928, 52, {
            radius: 20,
            fill: "rgba(7, 12, 22, 0.86)",
            border: "rgba(255,255,255,0.12)",
            glow: "rgba(15, 23, 42, 0.28)"
        });

        ctx.save();
        ctx.fillStyle = "#f8fbff";
        ctx.font = "700 15px Inter";
        ctx.fillText(`Gold ${this.gold}`, 32, 42);
        ctx.fillText(`Lives ${this.lives}`, 122, 42);
        ctx.fillText(
            `Wave ${Math.min(this.waveIndex + 1, this.currentLevel.data.waves.length)}/${this.currentLevel.data.waves.length}`,
            206,
            42
        );
        ctx.restore();

        this.towerButtonRects.forEach((rect, index) => {
            const type = this.buttons[index];
            const hovered = this.hoveredId === `tower-${type}`;
            const active = this.selectedType === type;
            this.ui.drawButton(ctx, rect, `${this.labelTower(type)} ${this.towerCosts[type]}`, {
                hovered,
                active,
                radius: 16,
                font: "700 12px Inter"
            });
        });
    }

    drawSidebar(ctx) {
        this.ui.drawPanel(ctx, this.sidebar.x, this.sidebar.y, this.sidebar.width, this.sidebar.height, {
            radius: 24,
            fill: "rgba(8, 13, 22, 0.84)",
            border: "rgba(255,255,255,0.11)",
            glow: "rgba(15, 23, 42, 0.35)"
        });

        ctx.save();
        ctx.fillStyle = "#f8fbff";
        ctx.font = "700 24px Cinzel";
        ctx.fillText(this.currentLevel.name, 692, 118);
        ctx.fillStyle = "rgba(228, 236, 248, 0.76)";
        ctx.font = "500 13px Inter";
        ctx.fillText("Build on marked circles and keep the path from breaking.", 692, 146);
        ctx.fillText(`Next wave bonus: ${this.pendingWaveBonus}`, 692, 168);
        ctx.restore();

        if (this.selectedTower) {
            this.drawSelectedTowerPanel(ctx);
        } else {
            this.drawSelectedTypePanel(ctx);
        }
    }

    drawSelectedTypePanel(ctx) {
        const preview = new Tower(0, 0, this.selectedType);
        const label = this.labelTower(this.selectedType);

        ctx.save();
        ctx.fillStyle = "#f8fbff";
        ctx.font = "700 18px Inter";
        ctx.fillText(`Selected: ${label}`, 692, 214);
        ctx.fillStyle = "rgba(228, 236, 248, 0.76)";
        ctx.font = "500 14px Inter";
        ctx.fillText(`Cost ${this.towerCosts[this.selectedType]}`, 692, 238);
        ctx.fillText(`Damage ${preview.damage}`, 692, 266);
        ctx.fillText(`Range ${Math.round(preview.range)}`, 692, 292);
        ctx.fillText(`Rate ${preview.rate.toFixed(2)}`, 692, 318);
        ctx.fillText("Choose a build tile to place this tower.", 692, 362);
        ctx.restore();
    }

    drawSelectedTowerPanel(ctx) {
        const stats = this.selectedTower.getDisplayStats();
        const cost = this.selectedTower.getUpgradeCost();
        const choices = this.selectedTower.getUpgradeChoices();

        ctx.save();
        ctx.fillStyle = "#f8fbff";
        ctx.font = "700 18px Inter";
        ctx.fillText(stats.name, 692, 214);
        ctx.fillStyle = "rgba(228, 236, 248, 0.76)";
        ctx.font = "500 14px Inter";
        ctx.fillText(`Level ${stats.level}`, 692, 238);
        ctx.fillText(`Damage ${stats.damage}`, 692, 264);
        ctx.fillText(`Range ${stats.range}`, 692, 288);
        ctx.fillText(`Rate ${stats.rate}`, 692, 312);
        ctx.fillText(`Invested ${stats.invested}`, 692, 336);
        ctx.fillText(`Sell value ${stats.sellValue}`, 692, 360);
        ctx.fillText(cost != null ? `Upgrade cost ${cost}` : "Max level reached", 692, 384);
        ctx.restore();

        for (let i = 0; i < choices.length; i++) {
            const button = this.upgradeButtons[i];
            const enabled = this.gold >= (cost ?? 9999);
            this.ui.drawButton(ctx, button, choices[i].label, {
                hovered: this.hoveredId === `upgrade-${choices[i].id}`,
                disabled: !enabled,
                radius: 14,
                font: "700 13px Inter"
            });
        }

        this.ui.drawButton(ctx, this.sellButton, `Sell Tower +${stats.sellValue}`, {
            hovered: this.hoveredId === "sell-tower",
            radius: 14,
            font: "700 13px Inter"
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
                this.labelTower(type),
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

        this.ui.drawPanel(ctx, 234, 188, 492, 252, {
            radius: 28,
            fill: "rgba(7, 12, 22, 0.94)",
            border: "rgba(255,255,255,0.12)",
            glow: "rgba(15, 23, 42, 0.35)"
        });

        ctx.save();
        ctx.textAlign = "center";
        ctx.fillStyle = "#f8fbff";
        ctx.font = "700 44px Cinzel";
        ctx.fillText(text, 480, 248);
        ctx.fillStyle = "rgba(228, 236, 248, 0.76)";
        ctx.font = "500 16px Inter";
        ctx.fillText(text === "Victory" ? "The frontier holds for now." : "The line collapsed. Reset and adjust your build.", 480, 282);
        ctx.restore();

        this.ui.drawButton(ctx, this.overlayButtons.restart, "Restart", {
            hovered: this.hoveredId === "restart",
            active: true,
            radius: 16,
            font: "700 14px Inter"
        });
        this.ui.drawButton(ctx, this.overlayButtons.levels, "Level Select", {
            hovered: this.hoveredId === "levels",
            radius: 16,
            font: "700 14px Inter"
        });
        this.ui.drawButton(ctx, this.overlayButtons.menu, "Main Menu", {
            hovered: this.hoveredId === "menu",
            radius: 16,
            font: "700 14px Inter"
        });
    }

    labelTower(type) {
        const labels = {
            archer: "Archer",
            bomb: "Bomb",
            berserker: "Berserker",
            rogue: "Rogue",
            mage: "Mage"
        };
        return labels[type] ?? type;
    }

    darkenColor(hex, amount) {
        if (!hex?.startsWith("#")) return hex;
        const value = hex.replace("#", "");
        const full = value.length === 3
            ? value.split("").map(part => part + part).join("")
            : value;
        const numeric = Number.parseInt(full, 16);
        const r = Math.max(0, Math.min(255, Math.round(((numeric >> 16) & 255) * (1 - amount))));
        const g = Math.max(0, Math.min(255, Math.round(((numeric >> 8) & 255) * (1 - amount))));
        const b = Math.max(0, Math.min(255, Math.round((numeric & 255) * (1 - amount))));
        return `rgb(${r}, ${g}, ${b})`;
    }
}
