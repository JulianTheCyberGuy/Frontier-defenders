import SceneManager from "./SceneManager.js";

export default class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.sceneManager = new SceneManager();
        this.lastTime = 0;
        this.running = false;
    }

    start() {
        this.running = true;
        requestAnimationFrame(this.loop.bind(this));
    }

    loop(timestamp) {
        if (!this.running) return;

        const deltaTime = Math.min((timestamp - this.lastTime) / 1000, 0.0333);
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame(this.loop.bind(this));
    }

    update(dt) {
        this.sceneManager.update(dt);
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.sceneManager.render(this.ctx);
    }
}
