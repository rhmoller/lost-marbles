import {Drawable} from "./Drawable";

export class GhostDrawable implements Drawable {
    public x: number;
    public y: number;
    public z: number;
    public facing: number;
    private baseColor: string;
    private eyeColor: string;

    constructor(x: number, y: number, z: number, facing: number, baseColor: string, eyeColor: string) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.facing = facing;
        this.baseColor = baseColor;
        this.eyeColor = eyeColor;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x + 8, this.y + 4 - this.z);
        ctx.scale(0.6, 0.6);
        ctx.fillStyle = this.baseColor;
        ctx.fillRect(0, 15, 30, 25);
        ctx.beginPath();
        ctx.arc(15, 15, 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = this.eyeColor;
        ctx.beginPath();
        ctx.arc(10 + this.facing * 5, 15, 4, 0, Math.PI * 2);
        ctx.arc(20 + this.facing * 5, 15, 4, 0, Math.PI * 2);
        // ctx.arc(16, 15, 5, 0, Math.PI * 2);
        // ctx.arc(25, 15, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.strokeStyle = this.baseColor;
        ctx.lineWidth = 3;
        ctx.moveTo(5, 25);
        ctx.lineTo(-5, 15);
        ctx.lineTo(-5, 10);
        ctx.moveTo(-5, 15);
        ctx.lineTo(-10, 15);
        ctx.moveTo(-5, 15);
        ctx.lineTo(-10, 10);

        ctx.moveTo(25, 25);
        ctx.lineTo(35, 15);
        ctx.lineTo(35, 10);
        ctx.moveTo(35, 15);
        ctx.lineTo(40, 15);
        ctx.moveTo(35, 15);
        ctx.lineTo(40, 10);
        ctx.stroke();
        ctx.restore();
    }
}
