import {Drawable} from "./Drawable";

export class TileMap implements Drawable {
    private tiles: number[];

    constructor(public width: number, public height: number, private tileSize: number) {
        this.tiles = new Array(width * height);
        for (let i = 0; i < width * height; i++) {
            this.tiles[i] = 0;
        }
    }

    public set(x: number, y: number, tile: number) {
        this.tiles[x + y * this.width] = tile;
    }

    public get(x: number, y: number): number {
        return this.tiles[x + y * this.width];
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "#000";
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this.get(x, y);
                if (tile === 1) {
                    ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                }
            }
        }
    }
}
