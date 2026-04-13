export default class Enemy {
    constructor(path, stats = {}) {
        this.path = path;
        this.i = 0;

        this.x = path[0].x;
        this.y = path[0].y;

        this.maxHp = stats.hp ?? 100;
        this.hp = this.maxHp;
        this.speed = stats.speed ?? 50;
        this.baseSpeed = this.speed;

        this.reward = stats.reward ?? 10;
        this.radius = stats.radius ?? 10;
        this.color = stats.color ?? "red";

        this.dead = false;
        this.escaped = false;

        this.effects = [];
        this.flashTimer = 0;
    }

    applyEffect(effect) {
        this.effects.push(effect);
    }

    updateEffects(dt) {
        this.speed = this.baseSpeed;

        for (const e of this.effects) {
            e.time -= dt;

            if (e.type === "slow") {
                this.speed *= e.value;
            }

            if (e.type === "burn") {
                e.tick -= dt;
                if (e.tick <= 0) {
                    this.hp -= e.damage;
                    e.tick = e.interval;
                }
            }
        }

        this.effects = this.effects.filter(e => e.time > 0);
    }

    update(dt) {
        if (this.dead || this.escaped) return;

        this.updateEffects(dt);

        if (this.flashTimer > 0) this.flashTimer -= dt;

        if (this.i >= this.path.length - 1) {
            this.escaped = true;
            return;
        }

        const target = this.path[this.i + 1];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 2) {
            this.i++;
            return;
        }

        this.x += (dx / dist) * this.speed * dt;
        this.y += (dy / dist) * this.speed * dt;
    }

    takeDamage(amount) {
        if (this.dead) return false;

        this.hp -= amount;
        this.flashTimer = 0.1;

        if (this.hp <= 0) {
            this.hp = 0;
            this.dead = true;
        }

        return true;
    }

    render(ctx) {
        if (this.dead) return;

        ctx.fillStyle = this.flashTimer > 0 ? "white" : this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}
