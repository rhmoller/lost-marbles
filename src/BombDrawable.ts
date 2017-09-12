import {Drawable} from "./Drawable";

export class BombDrawable implements Drawable {

    constructor(public x: number, public y: number, public tileSize: number, public jitter: number = 0) {
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        const {tileSize} = this;
        ctx.save();
        const jitterX = this.jitter * (2 * Math.random() - 1);
        const jitterY = this.jitter * (2 * Math.random() - 1);
        ctx.translate(this.x + jitterX, this.y + jitterY);

        const r4 = tileSize * 0.25;

        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(2 * r4, 2 * r4);
        ctx.lineTo(3 * r4, 1 * r4);
        ctx.stroke();

        ctx.fillStyle = "#000";

        ctx.beginPath();
        ctx.arc(2 * r4, 2 * r4, r4, 0, 2 * Math.PI);
        ctx.fill();

        ctx.restore();
    }
}
