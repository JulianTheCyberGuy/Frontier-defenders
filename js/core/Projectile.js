
export default class Projectile {
    constructor(x,y,target,damage,speed){
        this.x=x; this.y=y;
        this.target=target;
        this.damage=damage;
        this.speed=speed;
        this.dead=false;
    }

    update(dt){
        if(this.dead || !this.target || this.target.dead){ this.dead=true; return; }

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const d = Math.hypot(dx,dy);

        if(d<8){
            this.target.takeDamage(this.damage);
            this.dead=true;
            return;
        }

        this.x += dx/d * this.speed * dt;
        this.y += dy/d * this.speed * dt;
    }

    render(ctx){
        if(this.dead) return;
        ctx.fillStyle="yellow";
        ctx.beginPath();
        ctx.arc(this.x,this.y,4,0,Math.PI*2);
        ctx.fill();
    }
}
