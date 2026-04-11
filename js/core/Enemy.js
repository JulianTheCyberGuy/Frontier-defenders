
export default class Enemy {
    constructor(path){
        this.path = path;
        this.i = 0;
        this.x = path[0].x;
        this.y = path[0].y;
        this.speed = 60;
        this.hp = 100;
        this.dead = false;
    }

    update(dt){
        if(this.dead) return;
        if(this.i >= this.path.length-1) return;

        const t = this.path[this.i+1];
        const dx = t.x - this.x;
        const dy = t.y - this.y;
        const d = Math.hypot(dx,dy);

        if(d<2){ this.i++; return; }

        this.x += dx/d * this.speed * dt;
        this.y += dy/d * this.speed * dt;
    }

    takeDamage(d){
        this.hp -= d;
        if(this.hp<=0) this.dead = true;
    }

    render(ctx){
        if(this.dead) return;
        ctx.fillStyle="red";
        ctx.beginPath();
        ctx.arc(this.x,this.y,10,0,Math.PI*2);
        ctx.fill();
    }
}
