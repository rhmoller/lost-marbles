import {Drawable} from "./Drawable";
import {Pawn} from "./Pawn";
import {Vec2} from "./math/vec2";
import {timer} from "./timer";

export class EyeDrawable implements Drawable {

    constructor(public x: number, public y: number, public tileSize: number, public player: Pawn) {
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        const {tileSize} = this;
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(0.5 * tileSize, 0.5 * tileSize, 0.4 * tileSize, 0, Math.PI * 2);
        ctx.fill();

        const dir = new Vec2(this.player.x - this.x, this.player.y - this.y);
        dir.normalize();
        dir.mul(0.2 * tileSize);

        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(0.5 * tileSize + dir.x, 0.5 * tileSize + dir.y, 0.1 * tileSize, 0, Math.PI * 2);
        ctx.fill();

        const x = 0.5 * tileSize - 0.4 * tileSize;
        const y = 0.5 * tileSize - 0.4 * tileSize;
        const r = 0.4 * tileSize;

        const lid = Math.max(0, -0.9 + Math.cos(timer.time * 0.002)) * 20;

        ctx.beginPath();
        ctx.moveTo(x, y + r);
        ctx.bezierCurveTo(
            x, y - 0.4 * r,
            x + 2 * r, y - 0.4 * r,
            x + 2 * r, y + r);
        ctx.bezierCurveTo(
            x + 2 * r, y + lid * r,
            x, y + lid * r,
            x, y + r);

        ctx.bezierCurveTo(
            x, y + 2.4 * r,
            x + 2 * r, y + 2.4 * r,
            x + 2 * r, y + r);
        ctx.bezierCurveTo(
            x + 2 * r, y + (2 - lid) * r,
            x, y + (2 - lid) * r,
            x, y + r);

        ctx.fill();
        ctx.restore();
    }
}
