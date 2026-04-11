
import Enemy from "../core/Enemy.js";
import Tower from "../core/Tower.js";
import Projectile from "../core/Projectile.js";
import level1 from "../levels/level1.js";

export default class GameScene {
    constructor(canvas){
        this.canvas=canvas;
        this.path=level1.path;

        this.enemies=[];
        this.towers=[];
        this.projectiles=[];

        this.gold=150;
        this.selected="mage";

        canvas.addEventListener("click",(e)=>{
            const r=canvas.getBoundingClientRect();
            const x=e.clientX-r.left;
            const y=e.clientY-r.top;
            this.towers.push(new Tower(x,y,this.selected));
        });

        this.spawn=0;
    }

    update(dt){
        this.spawn-=dt;
        if(this.spawn<=0){
            this.enemies.push(new Enemy(this.path));
            this.spawn=1.2;
        }

        for(const e of this.enemies) e.update(dt);
        for(const t of this.towers) t.update(dt,this.enemies,this.projectiles);
        for(const p of this.projectiles) p.update(dt);

        this.enemies=this.enemies.filter(e=>!e.dead);
        this.projectiles=this.projectiles.filter(p=>!p.dead);
    }

    render(ctx){
        ctx.strokeStyle="yellow";
        ctx.beginPath();
        ctx.moveTo(this.path[0].x,this.path[0].y);
        for(let i=1;i<this.path.length;i++){
            ctx.lineTo(this.path[i].x,this.path[i].y);
        }
        ctx.stroke();

        for(const t of this.towers) t.render(ctx);
        for(const p of this.projectiles) p.render(ctx);
        for(const e of this.enemies) e.render(ctx);

        ctx.fillStyle="white";
        ctx.fillText("Mage tower active (purple). Meteor every 3 shots.",10,20);
    }}
