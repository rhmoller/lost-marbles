import {Drawable} from "./Drawable";
import {timer} from "./timer";

export class FaceDrawable implements Drawable {

    constructor(public x: number, public y: number, public tileSize: number) {
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x + 0.5 * this.tileSize, this.y);

        ctx.lineWidth = 2;
        ctx.setLineDash([ 3, 3 ]);
        ctx.strokeStyle = "rgba(255,255,255,0.3)";

        ctx.beginPath();
        ctx.arc(0, 0, this.tileSize * 2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(1 * this.tileSize, -0.5 * this.tileSize, this.tileSize * 0.3, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(-1 * this.tileSize, -0.5 * this.tileSize, this.tileSize * 0.3, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 1.5 * this.tileSize, this.tileSize * 0.3, 0, Math.PI);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
    }
}
