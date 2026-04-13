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

        const logicalWidth = this.canvas.logicalWidth ?? this.canvas.width;
        const logicalHeight = this.canvas.logicalHeight ?? this.canvas.height;
        const renderScale = this.canvas.renderScale ?? 1;

        this.sceneManager.update(dt);

        this.ctx.setTransform(renderScale, 0, 0, renderScale, 0, 0);
        this.ctx.clearRect(0, 0, logicalWidth, logicalHeight);
        this.sceneManager.render(this.ctx);

        requestAnimationFrame(this.loop.bind(this));
    }
}
