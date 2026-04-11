export default class PlacementSystem {
    constructor(levelData) {
        this.tileSize = levelData.tileSize;
        this.cols = levelData.cols;
        this.rows = levelData.rows;
        this.buildableTiles = new Set(levelData.buildableTiles.map(tile => `${tile.col},${tile.row}`));
        this.occupiedTiles = new Set();
    }

    getTileFromPixel(x, y) {
        return {
            col: Math.floor(x / this.tileSize),
            row: Math.floor(y / this.tileSize)
        };
    }

    getTileCenter(col, row) {
        return {
            x: col * this.tileSize + this.tileSize / 2,
            y: row * this.tileSize + this.tileSize / 2
        };
    }

    isInsideGrid(col, row) {
        return col >= 0 && col < this.cols && row >= 0 && row < this.rows;
    }

    isBuildable(col, row) {
        return this.buildableTiles.has(`${col},${row}`);
    }

    isOccupied(col, row) {
        return this.occupiedTiles.has(`${col},${row}`);
    }

    canPlaceAt(col, row) {
        return this.isInsideGrid(col, row) && this.isBuildable(col, row) && !this.isOccupied(col, row);
    }

    placeTower(col, row) {
        this.occupiedTiles.add(`${col},${row}`);
    }

    renderBuildTiles(ctx) {
        for (const key of this.buildableTiles) {
            const [col, row] = key.split(",").map(Number);
            const x = col * this.tileSize;
            const y = row * this.tileSize;

            ctx.fillStyle = "rgba(80, 160, 80, 0.18)";
            ctx.fillRect(x, y, this.tileSize, this.tileSize);

            ctx.strokeStyle = "rgba(255,255,255,0.05)";
            ctx.strokeRect(x, y, this.tileSize, this.tileSize);
        }
    }

    renderHoverTile(ctx, mouseX, mouseY) {
        if (mouseX == null || mouseY == null) return;

        const { col, row } = this.getTileFromPixel(mouseX, mouseY);

        if (!this.isInsideGrid(col, row)) return;

        const x = col * this.tileSize;
        const y = row * this.tileSize;
        const valid = this.canPlaceAt(col, row);

        ctx.fillStyle = valid
            ? "rgba(80, 200, 120, 0.28)"
            : "rgba(200, 60, 60, 0.25)";

        ctx.fillRect(x, y, this.tileSize, this.tileSize);

        ctx.strokeStyle = valid
            ? "rgba(160, 255, 180, 0.5)"
            : "rgba(255, 120, 120, 0.5)";

        ctx.strokeRect(x, y, this.tileSize, this.tileSize);
    }
}
