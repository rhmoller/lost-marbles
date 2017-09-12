import {initRenderingContext} from "./gfx";
import {timer} from "./timer";
import {Vec2} from "./math/vec2";
const [canvas, ctx] = initRenderingContext();
import * as jsfxr from "jsfxr";
import {Point} from "./math/point";

const slideSndCfg = [
    3, 0.2, 0.05, 0.15, 0.2, 0.3, 0, 0.2, -0.35, 0, 0, 0, 0, 0, 0, 0, 0.15, 0, 0.15, 0, 0, 0.1, 0, 0.2
];
const bumpSndCfg = [
    2, 0.05, 0.1, 0.35, 0.15, 0.2, 0, -0.35, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.7, 0, 0, 0.25, 0, 0.6
];
const pickupSndCfg = [
    2, 0, 0.06330123033, 0.4, 0.25, 0.25407342, 0, 0.3624815730, 0, 0, 0, 0, 0, 0, 0, 0.513327, 0, 0, 1, 0, 0, 0, 0, 0.6
];

const slideSndUrl = jsfxr(slideSndCfg);
const slidePlayer = new Audio();
slidePlayer.src = slideSndUrl;

const bumpSndUrl = jsfxr(bumpSndCfg);
const bumpPlayer = new Audio();
bumpPlayer.src = bumpSndUrl;

const pickupSndUrl = jsfxr(pickupSndCfg);
const pickupPlayer = new Audio();
pickupPlayer.src = pickupSndUrl;

enum TweenType {
    LINEAR,
    BUMP
}

interface Tween {
    type: TweenType;
    item: Point;
    from: Point;
    to: Point;
    t: number;
}

const tweens: Tween[] = [];
let tweening = false;

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    energy: number;
}

const particles: Particle[] = [];

class TileMap {
    private tiles: number[];

    constructor(public width: number, public height: number) {
        this.tiles = new Array(width * height);
        for (let i = 0; i < width * height; i++) {
            this.tiles[i] = 0;
        }
    }

    public set(x: number, y: number, tile: number) {
        this.tiles[x + y * this.width] = tile;
    }

    public get(x: number, y: number): number {
        return this.tiles[x + y * this.width];
    }
}

const tileMap = new TileMap(17, 9);
for (let x = 0; x < 17; x++) {
    tileMap.set(x, 0, 1);
    tileMap.set(x, 8, x === 3 ? 0 : 1);
}
for (let y = 0; y < 9; y++) {
    tileMap.set(0, y, 1);
    tileMap.set(16, y, y === 2 ? 0 : 1);
}
tileMap.set(5, 2, 1);
tileMap.set(5, 3, 1);
tileMap.set(4, 3, 1);

tileMap.set(13, 1, 1);
tileMap.set(13, 2, 1);
tileMap.set(13, 3, 1);
tileMap.set(13, 4, 1);
tileMap.set(13, 5, 1);

const tileSize = 35;

enum Move {
    NONE, LEFT, UP, RIGHT, DOWN
}

interface Pawn {
    x: number;
    y: number;
    facing: number;
}

let nextMove: Move = Move.NONE;

const player = { x: tileSize * 5, y: tileSize * 5, facing: 0 };
const enemies: Pawn[] = [];
const marbles: Point[] = [];

for (let i = 0; i < 5; i++) {
    enemies.push({
        x: (1 + (Math.random() * 15) | 0) * tileSize,
        y: (1 + (Math.random() * 7) | 0) * tileSize,
        facing: 0
    });
}

marbles.push({ x: 11 * tileSize, y: 4 * tileSize});
marbles.push({ x: 12 * tileSize, y: 6 * tileSize});
marbles.push({ x: 4 * tileSize, y: 2 * tileSize});

const levers: Pawn[] = [];
levers.push({ x: 3 * tileSize, y: 3 * tileSize, facing: -1 });
levers.push({ x: 10 * tileSize, y: 2 * tileSize, facing: 1 });
levers.push({ x: 13 * tileSize, y: 7 * tileSize, facing: -1 });

function collides(a: Point, b: Point) {
    return Vec2.dist(a, b) < tileSize;
}

function canMove(pawn: Point, dx: number, dy: number) {
    const tx = ((pawn.x + dx) / tileSize) | 0;
    const ty = ((pawn.y + dy) / tileSize) | 0;
    return tileMap.get(tx, ty) === 0;
}

function emitDust(source: Point) {
    particles.push({
        x: source.x + tileSize * 0.5,
        y: source.y + tileSize * 0.75,
        vx: 0,
        vy: 0.5 * Math.random(),
        energy: 1
    });
    particles.push({
        x: 5 * Math.random() - 10 + source.x + tileSize * 0.5,
        y: source.y + tileSize * 0.75,
        vx: 0,
        vy: 0.5 * Math.random(),
        energy: 1
    });
    particles.push({
        x: 5 * Math.random() - 10 + source.x + tileSize * 0.5,
        y: source.y + tileSize * 0.75,
        vx: 0,
        vy: 0.5 * Math.random(),
        energy: 1
    });
}

function handlePlayerInput() {
    let bumped = false;

    switch (nextMove) {
        case Move.LEFT:
            if (canMove(player, -tileSize, 0)) {
                let collide = false;
                levers.forEach((lever) => {
                    const leverCollides = collides({x: player.x - tileSize, y: player.y}, lever);
                    collide = collide || leverCollides;
                    if (leverCollides) {
                        lever.facing = -lever.facing;
                    }
                });
                if (!collide) {
                    emitDust(player);
                    tweening = true;
                    tweens.push({
                        type: TweenType.LINEAR,
                        item: player,
                        from: {x: player.x, y: player.y},
                        to: {x: player.x - tileSize, y: player.y},
                        t: 0
                    });
                    // player.x -= tileSize;
                } else {
                    tweening = true;
                    tweens.push({
                        type: TweenType.BUMP,
                        item: player,
                        from: {x: player.x, y: player.y},
                        to: {x: player.x - tileSize, y: player.y},
                        t: 0
                    });
                }
                player.facing = -1;
            } else {
                emitDust({ x: player.x - tileSize * 0.25, y: player.y });
                bumped = true;
                tweening = true;
                tweens.push({
                    type: TweenType.BUMP,
                    item: player,
                    from: {x: player.x, y: player.y},
                    to: {x: player.x - tileSize, y: player.y},
                    t: 0
                });
            }
            break;
        case Move.UP:
            if (canMove(player, 0, -tileSize)) {
                let collide = false;
                levers.forEach((lever) => {
                    const leverCollides = collides({x: player.x, y: player.y - tileSize}, lever);
                    collide = collide || leverCollides;
                    if (leverCollides) {
                        lever.facing = -lever.facing;
                    }
                });
                if (!collide) {
                    emitDust(player);
                    tweening = true;
                    tweens.push({
                        type: TweenType.LINEAR,
                        item: player,
                        from: {x: player.x, y: player.y},
                        to: {x: player.x, y: player.y - tileSize},
                        t: 0
                    });
                } else {
                    tweening = true;
                    tweens.push({
                        type: TweenType.BUMP,
                        item: player,
                        from: {x: player.x, y: player.y},
                        to: {x: player.x, y: player.y - tileSize},
                        t: 0
                    });
                }
            } else {
                bumped = true;
                tweening = true;
                emitDust({ x: player.x, y: player.y - tileSize * 0.75});
                tweens.push({
                    type: TweenType.BUMP,
                    item: player,
                    from: {x: player.x, y: player.y},
                    to: {x: player.x, y: player.y - tileSize},
                    t: 0
                });
            }
            break;
        case Move.RIGHT:
            if (canMove(player, tileSize, 0)) {
                let collide = false;
                levers.forEach((lever) => {
                    const leverCollides = collides({x: player.x + tileSize, y: player.y}, lever);
                    collide = collide || leverCollides;
                    if (leverCollides) {
                        lever.facing = -lever.facing;
                    }
                });
                if (!collide) {
                    emitDust(player);
                    tweening = true;
                    tweens.push({
                        type: TweenType.LINEAR,
                        item: player,
                        from: { x: player.x, y: player.y },
                        to: { x: player.x + tileSize, y: player.y },
                        t: 0
                    });
                } else {
                    tweening = true;
                    tweens.push({
                        type: TweenType.BUMP,
                        item: player,
                        from: { x: player.x, y: player.y },
                        to: { x: player.x + tileSize, y: player.y },
                        t: 0
                    });
                }
                player.facing = 1;
            } else {
                bumped = true;
                tweening = true;
                emitDust({ x: player.x + tileSize * 0.75, y: player.y });
                tweens.push({
                    type: TweenType.BUMP,
                    item: player,
                    from: { x: player.x, y: player.y },
                    to: { x: player.x + tileSize, y: player.y },
                    t: 0
                });
            }
            break;
        case Move.DOWN:
            if (canMove(player, 0, tileSize)) {
                let collide = false;
                levers.forEach((lever) => {
                    const leverCollides = collides({x: player.x, y: player.y + tileSize}, lever);
                    collide = collide || leverCollides;
                    if (leverCollides) {
                        lever.facing = -lever.facing;
                    }
                });
                if (!collide) {
                    emitDust(player);
                    tweening = true;
                    tweens.push({
                        type: TweenType.LINEAR,
                        item: player,
                        from: {x: player.x, y: player.y},
                        to: {x: player.x, y: player.y + tileSize},
                        t: 0
                    });
                } else {
                    tweening = true;
                    tweens.push({
                        type: TweenType.BUMP,
                        item: player,
                        from: {x: player.x, y: player.y},
                        to: {x: player.x, y: player.y + tileSize},
                        t: 0
                    });
                }
            } else {
                bumped = true;
                tweening = true;
                emitDust({ x: player.x, y: player.y + tileSize * 0.25});
                tweens.push({
                    type: TweenType.BUMP,
                    item: player,
                    from: {x: player.x, y: player.y},
                    to: {x: player.x, y: player.y + tileSize},
                    t: 0
                });
            }
            break;
    }

    if (bumped) {
        bumpPlayer.play();
    }
    return bumped;
}

function handleEnemyMoves() {
    slidePlayer.play();

    for (const enemy of enemies) {
        let enemyMove = Move.NONE;
        const r1 = (Math.random() * 3) | 0;
        const r2 = (Math.random() * 3) | 0;
        if (r1 === 0) {
            enemyMove = Move.LEFT;
        }
        if (r1 === 1) {
            enemyMove = Move.RIGHT;
        }
        if (r1 === 2) {
            if (r2 === 0) {
                enemyMove = Move.UP;
            }
            if (r2 === 1) {
                enemyMove = Move.DOWN;
            }
        }
        switch (enemyMove) {
            case Move.LEFT:
                if (canMove(enemy, -tileSize, 0)) {
                    tweens.push({
                        type: TweenType.LINEAR,
                        item: enemy,
                        from: { x: enemy.x, y: enemy.y },
                        to: { x: enemy.x - tileSize, y: enemy.y},
                        t: 0
                    });
                    emitDust(enemy);
                    enemy.facing = -1;
                }
                break;
            case Move.UP:
                if (canMove(enemy, 0, -tileSize)) {
                    tweens.push({
                        type: TweenType.LINEAR,
                        item: enemy,
                        from: { x: enemy.x, y: enemy.y },
                        to: { x: enemy.x, y: enemy.y - tileSize},
                        t: 0
                    });
                    emitDust(enemy);
                }
                break;
            case Move.RIGHT:
                if (canMove(enemy, tileSize, 0)) {
                    tweens.push({
                        type: TweenType.LINEAR,
                        item: enemy,
                        from: { x: enemy.x, y: enemy.y },
                        to: { x: enemy.x + tileSize, y: enemy.y},
                        t: 0
                    });
                    emitDust(enemy);
                    enemy.facing = 1;
                }
                break;
            case Move.DOWN:
                if (canMove(enemy, 0, tileSize)) {
                    tweens.push({
                        type: TweenType.LINEAR,
                        item: enemy,
                        from: { x: enemy.x, y: enemy.y },
                        to: { x: enemy.x, y: enemy.y + tileSize},
                        t: 0
                    });
                    emitDust(enemy);
                }
                break;
        }
    }
}

function update() {
    if (tweening) {
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
        if (tweens.length === 0) {
            tweening = false;
        }
    } else {
        handlePlayerInput();
        if (nextMove !== Move.NONE) {
            handleEnemyMoves();
        }

        nextMove = Move.NONE;
    }

    for (const marble of marbles) {
        if (collides(player, marble)) {
            const idx = marbles.indexOf(marble);
            marbles.splice(idx, 1);
            pickupPlayer.play();
        }
    }

    for (const enemy of enemies) {
        if (collides(player, enemy)) {
            const idx = enemies.indexOf(enemy);
            enemies.splice(idx, 1);
            pickupPlayer.play();
            player.x = tileSize;
            player.y = tileSize;
            // todo: proper reset
        }
    }

    for (const particle of particles) {
        particle.energy *= 0.9;
        if (particle.energy <= 0.01) {
            const idx = particles.indexOf(particle);
            particles.splice(idx, 1);
        } else {
            particle.x += particle.vx;
            particle.y -= particle.vy;
        }
    }
}

function drawPawn(baseColor: string, eyeColor: string, facing: number) {
    ctx.save();
    ctx.scale(0.6, 0.6);
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 15, 30, 25);
    ctx.beginPath();
    ctx.arc(15, 15, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.arc(10 + facing * 5, 15, 4, 0, Math.PI * 2);
    ctx.arc(20 + facing * 5, 15, 4, 0, Math.PI * 2);
    // ctx.arc(16, 15, 5, 0, Math.PI * 2);
    // ctx.arc(25, 15, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = baseColor;
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

function drawMarble() {
    ctx.save();
    ctx.scale(0.6, 0.6);
    ctx.beginPath();
    ctx.fillStyle = "#fff";
    ctx.arc(0, 0, tileSize * 0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0, idx = 0; i < Math.PI * 2.0; i += Math.PI * 0.25, idx++) {
        const w = i + 2 * Math.cos(timer.time * 0.0004);
        const cx = 0;
        const cy = 0;
        const r1 = tileSize * 0.35;
        const r2 = tileSize * 0.4 + 3 * Math.cos(0.01 * (timer.time + (((idx % 2) === 0) ? 1500 : 0)));
        ctx.moveTo(cx + r1 * Math.cos(w), cy + r1 * Math.sin(w));
        ctx.lineTo(cx + r2 * Math.cos(w), cy + r2 * Math.sin(w));
    }
    ctx.stroke();
    ctx.restore();
}

function drawLever(p: Pawn) {
    ctx.save();
    ctx.translate(p.x + 0.5 * tileSize, p.y + 0.75 * tileSize);
    ctx.beginPath();
    ctx.fillStyle = "#000";
    ctx.arc(0, 0, tileSize * 0.3, 0, Math.PI, true);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.beginPath();
    const w = (p.facing === -1) ? -Math.PI * 0.75 : -Math.PI * 0.25;
    ctx.moveTo(0.1 * tileSize * Math.cos(w), 0.1 * tileSize * Math.sin(w));
    ctx.lineTo(0.5 * tileSize * Math.cos(w), 0.5 * tileSize * Math.sin(w));
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0.55 * tileSize * Math.cos(w), 0.55 * tileSize * Math.sin(w), 3, 0, Math.PI * 2);
    ctx.fill();

    if (p.facing === 1 && (timer.time % 400 > 200)) {
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(0, 0 - 5, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

function render() {
    let c = 0;
    ctx.save();
    ctx.translate((canvas.width - tileMap.width * tileSize) * 0.5 | 0,
        (canvas.height - tileMap.height * tileSize) * 0.5 | 0);

    for (let y = 0; y < tileMap.height * tileSize; y += tileSize) {
        for (let x = 0; x < tileMap.width * tileSize; x += tileSize) {
            c = (x / tileSize) % 2 ^ (y / tileSize) % 2;
            ctx.fillStyle = (c === 0) ? "#888" : "#7d7d7d";
            ctx.fillRect(x, y, tileSize, tileSize);
        }
    }

    const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2);
    gradient.addColorStop(0, `rgba(0,0,0,${0.0})`);
    gradient.addColorStop(1, "rgba(0,0,0,.8)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(player.x + 8, player.y + 4 + Math.cos(timer.time * 0.007));
    drawPawn("#000", "#fff", player.facing);
    ctx.restore();

    let eidx = 0;
    for (const enemy of enemies) {
        eidx++;
        ctx.save();
        ctx.translate(enemy.x + 8, enemy.y + 4 + Math.cos(timer.time * 0.007 + eidx));
        drawPawn("#ccc", "#000", enemy.facing);
        ctx.restore();
    }

    for (const marble of marbles) {
        ctx.save();
        ctx.translate(marble.x + 0.5 * tileSize, marble.y + 0.5 * tileSize);
        drawMarble();
        ctx.restore();
    }

    levers.forEach((lever) => drawLever(lever));

    particles.forEach((particle) => {
        ctx.fillStyle = `rgba(255,255,255,${particle.energy})`;
        const sz = 3 - particle.energy * 3;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, sz, 0, Math.PI * 2);
        ctx.fill();
    });

    // ctx.font = "12px Comic Sans MS";
    // const text = "Oh no!!! I speak in Comic Sans!";
    // const measure = ctx.measureText(text);
    //
    // ctx.fillStyle = "rgba(255,255,255,0.25)";
    // ctx.fillRect(150 - 4, 160 - 12 - 4, measure.width + 8, 12 + 8);
    //
    // ctx.fillStyle = "#000";
    // ctx.fillText(text, 150, 160);

    // const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0,
    //     canvas.width / 2, canvas.height / 2, canvas.width / 2);
    // gradient.addColorStop(0, `rgba(0,0,0,${0.0})`);
    // ctx.fillStyle = `rgba(0,0,0,${Math.max(0, Math.cos(timer.time * 0.004))})`;
    // ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.restore();
}

function loop(t: number) {
    timer.update(t);
    update();
    render();
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

window.addEventListener("keypress", (e) => {
    switch (e.keyCode) {
        case 37:
            nextMove = Move.LEFT;
            e.preventDefault();
            break;
        case 38:
            nextMove = Move.UP;
            e.preventDefault();
            break;
        case 39:
            nextMove = Move.RIGHT;
            e.preventDefault();
            break;
        case 40:
            nextMove = Move.DOWN;
            e.preventDefault();
            break;
    }
});
