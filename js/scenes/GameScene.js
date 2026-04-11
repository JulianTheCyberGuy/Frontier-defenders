
import Enemy from "../core/Enemy.js";
import Tower from "../core/Tower.js";
import Projectile from "../core/Projectile.js";
import level1 from "../levels/level1.js";

export default class GameScene {
    constructor(canvas){
        this.canvas=canvas;
        this.path = level1.path;

        this.enemies=[];
        this.towers=[];
        this.projectiles=[];

        this.spawnTimer=0;
        this.wave=1;
        this.toSpawn=10;

        this.gold=100;
        this.lives=10;

        canvas.addEventListener("click",(e)=>{
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if(this.gold>=50){
                this.towers.push(new Tower(x,y));
                this.gold -= 50;
            }
        });
    }

    update(dt){
        this.spawnTimer -= dt;
        if(this.spawnTimer<=0 && this.toSpawn>0){
            this.enemies.push(new Enemy(this.path));
            this.toSpawn--;
            this.spawnTimer=1;
        }

        for(const e of this.enemies) e.update(dt);
        for(const t of this.towers) t.update(dt,this.enemies,this.projectiles);
        for(const p of this.projectiles) p.update(dt);

        this.enemies = this.enemies.filter(e=>{
            if(e.dead){ this.gold+=10; return false; }
            return true;
        });

        this.projectiles = this.projectiles.filter(p=>!p.dead);
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
        ctx.fillText("Gold: "+this.gold,10,20);
    }}
