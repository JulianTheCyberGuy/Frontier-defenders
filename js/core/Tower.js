
import Projectile from "./Projectile.js";

export default class Tower {
    constructor(x,y,type){
        this.x=x; this.y=y;
        this.type=type;
        this.cool=0;

        if(type==="mage"){
            this.range=160;
            this.rate=0.8;
            this.damage=30;
            this.charge=0;
        } else {
            this.range=140;
            this.rate=1;
            this.damage=20;
        }
    }

    update(dt,enemies,projectiles){
        this.cool -= dt;

        let target=null;
        for(const e of enemies){
            if(e.dead) continue;
            if(Math.hypot(e.x-this.x,e.y-this.y)<this.range){
                target=e; break;
            }
        }

        if(target && this.cool<=0){
            if(this.type==="mage"){
                this.charge++;
                if(this.charge>=3){
                    // meteor burst
                    for(const e of enemies){
                        if(!e.dead && Math.hypot(e.x-this.x,e.y-this.y)<this.range){
                            e.takeDamage(40);
                        }
                    }
                    this.charge=0;
                } else {
                    projectiles.push(new Projectile(this.x,this.y,target,this.damage));
                }
            } else {
                projectiles.push(new Projectile(this.x,this.y,target,this.damage));
            }
            this.cool=1/this.rate;
        }
    }

    render(ctx){
        ctx.fillStyle = this.type==="mage" ? "purple" : "green";
        ctx.beginPath();
        ctx.arc(this.x,this.y,12,0,Math.PI*2);
        ctx.fill();
    }
}
