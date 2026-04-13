import SceneManager from "./SceneManager.js";

export default class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
        this.sceneManager = new SceneManager();
        this.last = 0;

        this.ctx.imageSmoothingEnabled = true;
        this.logicalWidth = canvas.logicalWidth ?? 960;
        this.logicalHeight = canvas.logicalHeight ?? 540;
    }

    start() {
        requestAnimationFrame(this.loop.bind(this));
    }

    loop(timestamp) {
        const dt = this.last === 0 ? 0 : (timestamp - this.last) / 1000;
        this.last = timestamp;

        this.sceneManager.update(dt);

        const renderScale = this.canvas.renderScale ?? 1;
        this.ctx.setTransform(renderScale, 0, 0, renderScale, 0, 0);
        this.ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);
        this.sceneManager.render(this.ctx);

        requestAnimationFrame(this.loop.bind(this));
    }
}
