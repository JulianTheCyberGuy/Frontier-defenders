export default class SceneManager {
    constructor() {
        this.currentScene = null;
    }

    changeScene(scene) {
        this.currentScene = scene;
    }

    update(dt) {
        if (this.currentScene) {
            this.currentScene.update(dt);
        }
    }

    render(ctx) {
        if (this.currentScene) {
            this.currentScene.render(ctx);
        }
    }
}
