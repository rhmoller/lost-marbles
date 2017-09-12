import {Point} from "./point";

export class Vec2 implements Point {

    public static add(v1: Point, v2: Point): Vec2 {
        return new Vec2(v1.x + v2.x, v1.y + v2.y);
    }

    public static sub(v1: Point, v2: Point): Vec2 {
        return new Vec2(v1.x - v2.x, v1.y - v2.y);
    }

    public static dot(v1: Point, v2: Point): number {
        return v1.x * v2.x + v1.y * v2.y;
    }

    public static mul(v: Point, factor: number): Vec2 {
        return new Vec2(v.x * factor, v.y * factor);
    }

    public static dist(v1: Point, v2: Point): number {
        const dx = v2.x - v1.x;
        const dy = v2.y - v1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    constructor(public x: number = 0, public y: number = 0) {
    }

    public add(v: Point): Vec2  {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    public sub(v: Point): Vec2 {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    public mul(factor: number): Vec2 {
        this.x *= factor;
        this.y *= factor;
        return this;
    }

    public length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    public normalize(): Vec2 {
        const len = this.length();
        this.x /= len;
        this.y /= len;
        return this;
    }

}
