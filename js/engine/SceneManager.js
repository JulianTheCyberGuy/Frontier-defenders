
export default class SceneManager {
    constructor(){ this.scene=null; }
    changeScene(s){ this.scene=s; }
    update(dt){ this.scene?.update(dt); }
    render(ctx){ this.scene?.render(ctx); }
}
