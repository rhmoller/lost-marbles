import {Drawable} from "./Drawable";
import {timer} from "./timer";

export class SawBladeDrawable implements Drawable {

    constructor(public x: number, public y: number, public tileSize: number) {
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        const {tileSize} = this;
        ctx.save();
        ctx.translate(this.x, this.y);

        const r = 0.5 * tileSize;

        ctx.beginPath();
        ctx.rect(0, 0, tileSize, 1.5 * r);
        ctx.clip();

        ctx.beginPath();

        ctx.fillStyle = "#fff";
        ctx.moveTo(r, r);
        for (let i = 0; i <= 30; i++) {
            const a = i * 2.0 * Math.PI / 30 + timer.time * 0.004;
            const r2 =  r * ((i % 2) === 0 ? 0.9 : 0.7);
            const cx = r + Math.cos(a) * r2;
            const cy = r + Math.sin(a) * r2;
            ctx.lineTo(cx, cy + 0.5 * r);
        }
        ctx.fill();

        ctx.fillStyle = "#000";
        ctx.fillRect(0, 1.5 * r - 2, tileSize, 4);

        ctx.restore();
    }
}
