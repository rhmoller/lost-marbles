import {Drawable} from "./Drawable";

export class Checkers implements Drawable {

    constructor(private width: number, private height: number, private checkerSize: number, public hue: number) {
    }

    public draw(ctx: CanvasRenderingContext2D): void {

        let c = 0;
        for (let y = 0; y < this.height * this.checkerSize; y += this.checkerSize) {
            for (let x = 0; x < this.width * this.checkerSize; x += this.checkerSize) {
                c = (x / this.checkerSize) % 2 ^ (y / this.checkerSize) % 2;
                ctx.fillStyle = (c === 0) ? `hsl(${this.hue},35%,55%)` : `hsl(${this.hue},40%,60%)`;
                ctx.fillRect(x, y, this.checkerSize, this.checkerSize);
            }
        }

        const width = this.width * this.checkerSize;
        const height = this.height * this.checkerSize;

        const gradient = ctx.createRadialGradient(width / 2, height / 2, 0,
            width / 2, height / 2, width / 2);
        gradient.addColorStop(0, `rgba(0,0,0,${0.0})`);
        gradient.addColorStop(1, "rgba(0,0,0,.5)");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width * this.checkerSize, this.height * this.checkerSize);
    }
}
