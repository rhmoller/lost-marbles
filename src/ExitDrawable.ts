import {Drawable} from "./Drawable";
import {timer} from "./timer";

export class ExitDrawable implements Drawable {
    public open = false;

    constructor(public x: number, public y: number, public tileSize: number, private dir: "right" | "down") {
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        const {tileSize} = this;
        ctx.save();

        const sz = 0.25 * tileSize;

        // ctx.lineWidth = 2;
        // ctx.strokeRect(this.x + 1, this.y + 1, tileSize - 2, tileSize - 2);
        // ctx.beginPath();
        // for (let i = 0; i < 5; i++) {
        //     const bx = tileSize * i / 5;
        //     ctx.moveTo(this.x + bx + 1, this.y);
        //     ctx.lineTo(this.x + bx + 1, this.y + tileSize);
        // }
        // ctx.stroke();

        if (this.dir === "right") {
            ctx.translate(
                this.x + 0.125 * tileSize + Math.max(Math.cos(timer.time * 0.002), 0.5) * tileSize * 0.25,
                this.y + 0.375 * tileSize);

            ctx.fillStyle = `rgba(255,255,255,${0.2 + 0.1 * Math.cos(timer.time * 0.002)})`;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(sz, sz * 0.5);
            ctx.lineTo(0, sz);

            ctx.moveTo(sz, 0);
            ctx.lineTo(sz + sz, sz * 0.5);
            ctx.lineTo(sz, sz);

            ctx.fill();
        } else {
            ctx.translate(
                this.x + 0.375 * tileSize,
                this.y + 0.125 * tileSize + Math.max(Math.cos(timer.time * 0.002), 0.5) * tileSize * 0.25);

            ctx.fillStyle = `rgba(255,255,255,${0.2 + 0.1 * Math.cos(timer.time * 0.002)})`;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(sz * 0.5, sz);
            ctx.lineTo(sz, 0);

            ctx.moveTo(0, sz);
            ctx.lineTo(sz * 0.5, sz + sz);
            ctx.lineTo(sz, sz);

            ctx.fill();
        }

        ctx.restore();
    }
}
