
import Projectile from "./Projectile.js";

export default class Tower {
constructor(x,y,type){
this.x=x; this.y=y; this.type=type; this.cool=0;

const stats={
archer:{range:150,rate:1,damage:20,color:"green"},
bomb:{range:130,rate:0.6,damage:25,color:"orange"},
berserker:{range:50,rate:1.2,damage:25,color:"darkred"},
rogue:{range:40,rate:2.5,damage:10,color:"purple"},
mage:{range:160,rate:0.8,damage:30,color:"blue"}
};

Object.assign(this,stats[type]);
this.charge=0;
}

update(dt,enemies,projectiles){
this.cool-=dt;
let target=null;

for(const e of enemies){
if(e.dead) continue;
if(Math.hypot(e.x-this.x,e.y-this.y)<this.range){
target=e; break;
}
}

if(target && this.cool<=0){

if(this.type==="berserker"||this.type==="rogue"){
for(const e of enemies){
if(!e.dead && Math.hypot(e.x-this.x,e.y-this.y)<this.range){
e.takeDamage(this.damage);
}
}
}
else if(this.type==="bomb"){
for(const e of enemies){
if(!e.dead && Math.hypot(e.x-target.x,e.y-target.y)<60){
e.takeDamage(this.damage);
}
}
}
else if(this.type==="mage"){
this.charge++;
if(this.charge>=3){
for(const e of enemies){
if(!e.dead && Math.hypot(e.x-this.x,e.y-this.y)<this.range){
e.takeDamage(40);
}
}
this.charge=0;
}else{
projectiles.push(new Projectile(this.x,this.y,target,this.damage));
}
}
else{
projectiles.push(new Projectile(this.x,this.y,target,this.damage));
}

this.cool=1/this.rate;
}
}

render(ctx){
ctx.fillStyle=this.color;
ctx.beginPath();ctx.arc(this.x,this.y,12,0,Math.PI*2);ctx.fill();
}
}
