export default class SceneManager {
    constructor() {
        this.currentScene = null;
    }

    changeScene(scene) {
        this.currentScene = scene;
    }

    update(dt) {
        this.currentScene?.update(dt);
    }

    render(ctx) {
        this.currentScene?.render(ctx);
    }
}