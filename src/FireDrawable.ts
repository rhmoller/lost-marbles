import {Drawable} from "./Drawable";

export class FireDrawable implements Drawable {

    constructor(public x: number, public y: number, public tileSize: number, public r: number = 0) {
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        const {tileSize} = this;
        ctx.save();
        ctx.translate(this.x + 2 * Math.random() - 1, this.y + 2 * Math.random() - 1);

        const r4 = tileSize * 0.25;
        ctx.fillStyle = "#fff";

        ctx.beginPath();
        ctx.arc(2 * r4, 2 * r4, this.r * 2 * r4, 0, 2 * Math.PI);
        ctx.fill();

        ctx.restore();
    }
}
