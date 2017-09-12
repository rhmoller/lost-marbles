import {Drawable} from "./Drawable";
import {timer} from "./timer";

export class SpikesDrawable implements Drawable {

    constructor(public x: number, public y: number, public tileSize: number) {
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        const {tileSize} = this;
        ctx.save();
        ctx.translate(this.x, this.y);

        const r4 = tileSize * 0.25;

        ctx.fillStyle = "#000";

        ctx.beginPath();
        ctx.arc(1.2 * r4, 1.2 * r4, r4 * 0.4, 0, 2 * Math.PI);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(2.8 * r4, 1.2 * r4, r4 * 0.4, 0, 2 * Math.PI);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(2.8 * r4, 2.8 * r4, r4 * 0.4, 0, 2 * Math.PI);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(1.2 * r4, 2.8 * r4, r4 * 0.4, 0, 2 * Math.PI);
        ctx.fill();

        const h = Math.cos(timer.time * 0.01) * 5 + 5;

        ctx.lineWidth = 3;
        ctx.strokeStyle = "#fff";
        ctx.beginPath();
        ctx.moveTo(1.2 * r4, 1.2 * r4);
        ctx.lineTo(1.2 * r4, 1.2 * r4 - h);

        ctx.moveTo(2.8 * r4, 1.2 * r4);
        ctx.lineTo(2.8 * r4, 1.2 * r4 - h);

        ctx.moveTo(2.8 * r4, 2.8 * r4);
        ctx.lineTo(2.8 * r4, 2.8 * r4 - h);

        ctx.moveTo(1.2 * r4, 2.8 * r4);
        ctx.lineTo(1.2 * r4, 2.8 * r4 - h);
        ctx.stroke();

        ctx.restore();
    }
}
