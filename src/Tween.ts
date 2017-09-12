import {Point} from "./math/point";

export enum TweenType {
    LINEAR,
    BUMP
}

export interface Tween {
    type: TweenType;
    item: Point;
    from: Point;
    to: Point;
    t: number;
}

export function updateTweens(tweens: Tween[]) {
    tweens.forEach((tween) => {
        tween.t += 0.1;
        const t = tween.type === TweenType.LINEAR ? tween.t : (tween.t < 0.5) ? tween.t : 1 - tween.t;
        if (tween.t >= 1) {
            switch (tween.type) {
                case TweenType.LINEAR:
                    tween.item.x = tween.to.x;
                    tween.item.y = tween.to.y;
                    break;
                case TweenType.BUMP:
                    tween.item.x = tween.from.x;
                    tween.item.y = tween.from.y;
                    break;
            }
            const idx = tweens.indexOf(tween);
            tweens.splice(idx, 1);
        } else {
            tween.item.x = tween.from.x + (tween.to.x - tween.from.x) * t;
            tween.item.y = tween.from.y + (tween.to.y - tween.from.y) * t;
        }
    });
}
