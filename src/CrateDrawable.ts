import {Drawable} from "./Drawable";

export class CrateDrawable implements Drawable {

    constructor(public x: number, public y: number, public tileSize: number) {
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = "#000";
        ctx.fillRect(0.125 * this.tileSize, 0.125 * this.tileSize, this.tileSize * 0.75, this.tileSize * 0.75);
        ctx.restore();
    }
}
