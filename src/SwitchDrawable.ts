import {Drawable} from "./Drawable";
import {timer} from "./timer";

export class SwitchDrawable implements Drawable {

    constructor(public x: number, public y: number, public tileSize: number) {
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = `rgba(255,255,255,${0.2 + 0.05 * Math.cos(timer.time * 0.006)})`;
        ctx.fillRect(0.125 * this.tileSize, 0.125 * this.tileSize, this.tileSize * 0.75, this.tileSize * 0.75);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.strokeRect(0.125 * this.tileSize, 0.125 * this.tileSize, this.tileSize * 0.75, this.tileSize * 0.75);
        ctx.restore();
    }
}
