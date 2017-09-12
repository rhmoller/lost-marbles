import {Drawable} from "./Drawable";
import {drawTextWrapped} from "./textWriter";

export class SpeechBubbleDrawable implements Drawable {

    constructor(public x: number, public y: number, public tileSize: number, public text: string) {
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();

        ctx.fillStyle = "#fff";
        ctx.translate(this.x + this.tileSize, this.y);
        ctx.beginPath();
        ctx.lineTo(-10, 15);
        ctx.lineTo(20, -5);
        ctx.lineTo(20, 5);
        ctx.fill();
        ctx.fillRect(15, -20, 170, 40);

        ctx.fillStyle = "#000";
        ctx.strokeStyle = "#fff";
        drawTextWrapped(ctx, this.text, 22, -2, 160, 14);

        ctx.restore();
    }
}
