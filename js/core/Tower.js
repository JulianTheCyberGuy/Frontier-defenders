
import Projectile from "./Projectile.js";

export default class Tower {
    constructor(x,y){
        this.x=x; this.y=y;
        this.range=150;
        this.cool=0;
        this.rate=1;
        this.damage=25;
    }

    update(dt,enemies,projectiles){
        this.cool -= dt;

        let target=null;
        for(const e of enemies){
            if(e.dead) continue;
            const d = Math.hypot(e.x-this.x,e.y-this.y);
            if(d < this.range){ target=e; break; }
        }

        if(target && this.cool<=0){
            projectiles.push(new Projectile(this.x,this.y,target,this.damage,250));
            this.cool = 1/this.rate;
        }
    }

    render(ctx){
        ctx.fillStyle="green";
        ctx.beginPath();
        ctx.arc(this.x,this.y,12,0,Math.PI*2);
        ctx.fill();
    }
}
