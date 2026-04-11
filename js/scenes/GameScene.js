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

        canvas.addEventListener("click", (e) => {
            const r = canvas.getBoundingClientRect();
            const x = e.clientX - r.left;
            const y = e.clientY - r.top;

            // UI buttons
            if (y < 40) {
                const index = Math.floor(x / 120);
                if (this.buttons[index]) {
                    this.selectedType = this.buttons[index];
                    return;
                }
            }

            // select tower
            for (const t of this.towers) {
                if (t.contains(x, y)) {
                    this.selectedTower = t;
                    return;
                }
            }

            // place tower
            if (this.gold >= 50) {
                const t = new Tower(x, y, this.selectedType);
                this.towers.push(t);
                this.gold -= 50;
                this.selectedTower = t;
            }
        });
    }

    upgradeSelected() {
        if (!this.selectedTower) return;
        if (this.gold < 50) return;

        this.selectedTower.upgrade();
        this.gold -= 50;
    }

    update(dt) {
        this.spawn -= dt;

        if (this.spawn <= 0) {
            this.enemies.push(new Enemy(this.path));
            this.spawn = 1;
        }

        for (const e of this.enemies) e.update(dt);
        for (const t of this.towers) t.update(dt, this.enemies, this.projectiles);
        for (const p of this.projectiles) p.update(dt);

        this.enemies = this.enemies.filter(e => !e.dead);
        this.projectiles = this.projectiles.filter(p => !p.dead);
    }

    render(ctx) {
        // PATH
        ctx.strokeStyle = "yellow";
        ctx.beginPath();
        ctx.moveTo(this.path[0].x, this.path[0].y);
        for (let i = 1; i < this.path.length; i++) {
            ctx.lineTo(this.path[i].x, this.path[i].y);
        }
        ctx.stroke();

        // TOWERS
        for (const t of this.towers) t.render(ctx);
        for (const p of this.projectiles) p.render(ctx);
        for (const e of this.enemies) e.render(ctx);

        // UI BAR
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, 960, 40);

        ctx.fillStyle = "white";
        ctx.fillText("Gold: " + this.gold, 10, 20);

        // tower buttons
        this.buttons.forEach((type, i) => {
            ctx.fillStyle = this.selectedType === type ? "gold" : "gray";
            ctx.fillText(type, 120 * i + 20, 20);
        });

        // upgrade button
        if (this.selectedTower) {
            ctx.fillStyle = "white";
            ctx.fillText("Press U to Upgrade (50g)", 10, 60);
        }
    }
}