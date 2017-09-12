import {Drawable} from "./Drawable";

export class LeverDrawable implements Drawable {

    constructor(public x: number, public y: number, public facing: number,
                public tileSize: number, public on: boolean) {
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x + 0.5 * this.tileSize, this.y + 0.75 * this.tileSize);
        ctx.beginPath();
        ctx.fillStyle = "#000";
        ctx.arc(0, 0, this.tileSize * 0.3, 0, Math.PI, true);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.beginPath();
        const w = (this.facing === -1) ? -Math.PI * 0.75 : -Math.PI * 0.25;
        ctx.moveTo(0.1 * this.tileSize * Math.cos(w), 0.1 * this.tileSize * Math.sin(w));
        ctx.lineTo(0.5 * this.tileSize * Math.cos(w), 0.5 * this.tileSize * Math.sin(w));
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0.55 * this.tileSize * Math.cos(w), 0.55 * this.tileSize * Math.sin(w), 3, 0, Math.PI * 2);
        ctx.fill();

        if (this.on) {
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(0, 0 - 5, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}
