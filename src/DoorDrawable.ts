import {Drawable} from "./Drawable";
import {timer} from "./timer";

export class DoorDrawable implements Drawable {
    public open = false;

    constructor(public x: number, public y: number, public tileSize: number,
                public type = "vertical", public lockType = "lever") {
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = "#000";
        if (this.open) {
            if (this.type === "vertical") {
                ctx.fillRect(3 * 0.125 * this.tileSize, 0, this.tileSize * 0.25, this.tileSize * 0.125);
                ctx.fillRect(3 * 0.125 * this.tileSize, 7 * 0.125 * this.tileSize,
                    this.tileSize * 0.25, this.tileSize * 0.125);
            } else {
                ctx.fillRect(0, 3 * 0.125 * this.tileSize, this.tileSize * 0.125, this.tileSize * 0.25);
                ctx.fillRect(7 * 0.125 * this.tileSize, 3 * 0.125 * this.tileSize,
                    this.tileSize * 0.125, this.tileSize * 0.25);
            }
        } else {
            if (this.type === "vertical") {
                ctx.fillRect(3 * 0.125 * this.tileSize, 0, this.tileSize * 0.25, this.tileSize);
            } else {
                ctx.fillRect(0, 3 * 0.125 * this.tileSize, this.tileSize, this.tileSize * 0.25);
            }

            ctx.scale(0.5, 0.5);
            ctx.translate(0.5 * this.tileSize, 0.5 * this.tileSize);
            ctx.beginPath();
            ctx.fillStyle = `rgba(255,255,255,${0.5 + 0.1 * Math.cos(timer.time * 0.005)})`;
            ctx.arc(this.tileSize * 0.5, this.tileSize * 0.5, this.tileSize * 0.5,
                0, Math.PI * 2);
            ctx.fill();

            const p = 0.125 * this.tileSize;
            const h = 0.5 * this.tileSize;

            switch (this.lockType) {
                case "key":
                    ctx.fillStyle = "#000";
                    break;

                case "lever":
                case "invertedLever":
                    ctx.strokeStyle = "#000";
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(h + 0.0 * p, 4.5 * p);
                    ctx.lineTo(h - 1.5 * p, 1.95 * p);
                    ctx.stroke();

                    ctx.fillStyle = "#000";
                    ctx.beginPath();
                    ctx.arc(h, 5.5 * p, 2.25 * p, Math.PI, 2 * Math.PI);
                    ctx.fill();

                    ctx.beginPath();
                    ctx.arc(h - 1.5 * p, 1.95 * p, 0.7 * p, 0, Math.PI * 2);
                    ctx.fill();

                    if (this.lockType === "lever") {
                        ctx.fillStyle = "#aaa";
                        ctx.beginPath();
                        ctx.arc(h, 4.4 * p, 0.6 * p, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    break;

                case "switch":
                    ctx.strokeStyle = "#000";
                    ctx.lineWidth = 2;
                    ctx.strokeRect(2.5 * p, 2.5 * p, 3 * p, 3 * p);
                    break;

                case "marble":
                    ctx.fillStyle = "#f00";
                    ctx.beginPath();
                    ctx.lineWidth = 3;
                    ctx.arc(this.tileSize * 0.5, this.tileSize * 0.5, this.tileSize * 0.15,
                        0, Math.PI * 2);
                    ctx.stroke();

                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    for (let i = 0, idx = 0; i < Math.PI * 2.0; i += Math.PI * 0.25, idx++) {
                        const w = i + 2;
                        const cx = this.tileSize * 0.5;
                        const cy = this.tileSize * 0.5;
                        const r1 = this.tileSize * 0.25;
                        const r2 = this.tileSize * 0.35;
                        ctx.moveTo(cx + r1 * Math.cos(w), cy + r1 * Math.sin(w));
                        ctx.lineTo(cx + r2 * Math.cos(w), cy + r2 * Math.sin(w));
                    }
                    ctx.stroke();

                    break;

            }

        }

        ctx.restore();
    }
}
