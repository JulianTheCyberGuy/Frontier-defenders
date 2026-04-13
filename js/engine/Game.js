import SceneManager from "./SceneManager.js";

export default class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.sceneManager = new SceneManager();
        this.last = 0;

        this.ctx.imageSmoothingEnabled = true;
    }

    start() {
        requestAnimationFrame(this.loop.bind(this));
    }

    loop(timestamp) {
        const dt = this.last === 0 ? 0 : (timestamp - this.last) / 1000;
        this.last = timestamp;

        this.sceneManager.update(dt);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.sceneManager.render(this.ctx);

        requestAnimationFrame(this.loop.bind(this));
    }
}
