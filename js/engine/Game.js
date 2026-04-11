
import SceneManager from "./SceneManager.js";
export default class Game {
    constructor(canvas){
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.sceneManager = new SceneManager();
        this.last = 0;
    }
    start(){ requestAnimationFrame(this.loop.bind(this)); }
    loop(t){
        const dt = (t-this.last)/1000;
        this.last = t;
        this.sceneManager.update(dt);
        this.ctx.clearRect(0,0,960,540);
        this.sceneManager.render(this.ctx);
        requestAnimationFrame(this.loop.bind(this));
    }
}
