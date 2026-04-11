
import Projectile from "./Projectile.js";

export default class Tower {
constructor(x,y){
this.x=x; this.y=y;
this.level=1;

this.range=140;
this.rate=1;
this.damage=20;

this.cool=0;
}

upgrade(){
if(this.level===1){
this.level=2;
this.damage += 10;
this.rate += 0.5;
}
else if(this.level===2){
this.level=3;
this.damage += 15;
this.range += 20;
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
projectiles.push(new Projectile(this.x,this.y,target,this.damage));
this.cool=1/this.rate;
}
}

render(ctx){
ctx.fillStyle = ["green","blue","gold"][this.level-1];
ctx.beginPath();
ctx.arc(this.x,this.y,12,0,Math.PI*2);
ctx.fill();
}

contains(x,y){
return Math.hypot(x-this.x,y-this.y)<14;
}
}
