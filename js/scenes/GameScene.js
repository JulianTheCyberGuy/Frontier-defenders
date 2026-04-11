import Enemy from "../core/Enemy.js";
import Tower from "../core/Tower.js";
import Projectile from "../core/Projectile.js";
import level1 from "../levels/level1.js";

export default class GameScene {
    constructor(canvas) {
        this.canvas = canvas;
        this.path = level1.path;

        this.enemies = [];
        this.towers = [];
        this.projectiles = [];

        this.gold = 250;
        this.selectedTower = null;
        this.selectedType = "archer";

        this.spawn = 0;
        this.buttons = ["archer", "bomb", "berserker", "rogue", "mage"];

        this.upgradeButtons = [
            { x: 700, y: 70, width: 220, height: 34, id: "left" },
            { x: 700, y: 112, width: 220, height: 34, id: "right" }
        ];

        canvas.addEventListener("click", (e) => {
            const r = canvas.getBoundingClientRect();
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

            if (this.gold >= 50) {
                const tower = new Tower(x, y, this.selectedType);
                this.towers.push(tower);
                this.gold -= 50;
                this.selectedTower = tower;
            }
        });
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
        this.spawn -= dt;

        if (this.spawn <= 0) {
            this.enemies.push(new Enemy(this.path));
            this.spawn = 1;
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

        this.enemies = this.enemies.filter(enemy => !enemy.dead);
        this.projectiles = this.projectiles.filter(projectile => !projectile.dead);
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

        this.buttons.forEach((type, i) => {
            ctx.fillStyle = this.selectedType === type ? "gold" : "gray";
            ctx.fillText(type, 120 * i + 20, 24);
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
}