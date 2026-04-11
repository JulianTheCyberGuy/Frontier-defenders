
import SceneManager from "./SceneManager.js";

export default class Game {
    constructor(canvas){
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.sceneManager = new SceneManager();
        this.lastTime = 0;
    }

    start(){
        requestAnimationFrame(this.loop.bind(this));
    }

    loop(time){
        const dt = (time - this.lastTime)/1000;
        this.lastTime = time;

        this.sceneManager.update(dt);
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        this.sceneManager.render(this.ctx);

        requestAnimationFrame(this.loop.bind(this));
    }
}
