import {Drawable} from "./Drawable";
import {timer} from "./timer";

export class MouthDrawable implements Drawable {

    constructor(public x: number, public y: number, public tileSize: number) {
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        const {tileSize} = this;
        ctx.save();
        ctx.translate(this.x, this.y);

        const r4 = tileSize * 0.125;
        const h = 5 + 2 * Math.cos(timer.time * 0.01);

        ctx.fillStyle = "#000";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;

        ctx.translate(0, 0.4 * tileSize - h * 1.5);

        ctx.beginPath();
        ctx.moveTo(r4, r4);
        ctx.lineTo(7 * r4, r4);
        ctx.bezierCurveTo(7 * r4, h * r4, r4, h * r4, r4, r4);
        ctx.fill();
        ctx.stroke();
        ctx.clip();

        ctx.fillStyle = "#fff";
        ctx.fillRect(r4 + 4, r4, 3, 3);
        ctx.fillRect(r4 + 9, r4, 3, 3.5);
        ctx.fillRect(r4 + 14, r4, 3, 3.5);
        ctx.fillRect(r4 + 19, r4, 3, 3);

        ctx.fillRect(r4 + 9, h * r4 - 6, 3, 3.5);
        ctx.fillRect(r4 + 14, h * r4 - 6, 3, 3.5);

        ctx.restore();
    }
}
