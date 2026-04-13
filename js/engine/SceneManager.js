export default class SceneManager {
    constructor() {
        this.currentScene = null;
    }

    changeScene(scene) {
        if (this.currentScene?.onExit) {
            this.currentScene.onExit();
        }

        this.currentScene = scene;

        if (this.currentScene?.onEnter) {
            this.currentScene.onEnter();
        }
    }

    update(dt) {
        this.currentScene?.update(dt);
    }

    render(ctx) {
        this.currentScene?.render(ctx);
    }
}