import {Drawable} from "./Drawable";
import {timer} from "./timer";

export class MarbleDrawable implements Drawable {

    constructor(public x: number, public y: number, public tileSize: number) {
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x + 0.5 * this.tileSize, this.y + 0.5 * this.tileSize);
        ctx.scale(0.6, 0.6);
        ctx.beginPath();
        ctx.fillStyle = "#fff";
        ctx.arc(0, 0, this.tileSize * 0.25, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0, idx = 0; i < Math.PI * 2.0; i += Math.PI * 0.25, idx++) {
            const w = i + 2 * Math.cos(timer.time * 0.0004);
            const cx = 0;
            const cy = 0;
            const r1 = this.tileSize * 0.35;
            const r2 = this.tileSize * 0.4 + 3 * Math.cos(0.01 * (timer.time + (((idx % 2) === 0) ? 1500 : 0)));
            ctx.moveTo(cx + r1 * Math.cos(w), cy + r1 * Math.sin(w));
            ctx.lineTo(cx + r2 * Math.cos(w), cy + r2 * Math.sin(w));
        }
        ctx.stroke();
        ctx.restore();
    }

}
