import {timer} from "./timer";
import {Point} from "./math/point";
import {Tween, TweenType, updateTweens} from "./Tween";
import {Checkers} from "./Checkers";
import {generateRoom, rooms} from "./levelGenerator";
import {GhostDrawable} from "./GhostDrawable";
import {drawParticles, Particle, updateParticles} from "./Particle";
import {Pawn} from "./Pawn";
import {
    addComponent, clearComponents, Component, createEntity, destroyEntity, getComponent,
    getComponentList
} from "./ecs/Entity";
import {Drawable} from "./Drawable";
import {LeverDrawable} from "./LeverDrawable";
import {Vec2} from "./math/vec2";
import {MarbleDrawable} from "./MarbleDrawable";
import {DoorDrawable} from "./DoorDrawable";
import * as jsfxr from "jsfxr";
import {CrateDrawable} from "./CrateDrawable";
import {EyeDrawable} from "./EyeDrawable";
import {SawBladeDrawable} from "./SawBladeDrawable";
import {SpikesDrawable} from "./SpikesDrawable";
import {BombDrawable} from "./BombDrawable";
import {MouthDrawable} from "./MouthDrawable";
import {publish, subscribe} from "./ecs/kernel";
import {FireDrawable} from "./FireDrawable";
import {TileMap} from "./TileMap";
import {ExitDrawable} from "./ExitDrawable";
import {drawTextCentered, drawTextWrapped} from "./textWriter";
import {SpeechBubbleDrawable} from "./SpeechBubbleDrawable";
import {SwitchDrawable} from "./SwitchDrawable";
import {initRenderingContext} from "./gfx";

// todo: fix crossing entities
// todo: improve handling of chained effects
// todo: ghosts should not kill ghosts
// todo: ghosts should not push boxes

// todo: spears should go up and down in sync with moves

// todo: use metrics to size speech bubble
// todo: sawline
// todo: patrol
// todo: collision for patrol and ping-pong

// todo: death animation
// todo: game over screen

// todo: load / save game
// todo: instructions
// todo: tutorial

// todo: prefabs
// todo: player should be an entity
// todo: depth ordering
// todo: speech balloon fadeout

enum GameState {
    TITLE, LEVEL
}

let gameState: GameState = GameState.LEVEL;
let currentLevel = 0;

const [canvas, ctx] = initRenderingContext();

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

enum Move {
  NONE, LEFT, UP, RIGHT, DOWN
}

let nextMove: Move = Move.NONE;

const tileSize = 35;

const player = { x: tileSize * 5, y: tileSize * 5, facing: 0 };
const particles: Particle[] = [];

const tweens: Tween[] = [];
let tweening = false;

let room = rooms[currentLevel];
let [tileMap, checkers] = initLevel(currentLevel);

const playerGhost = new GhostDrawable(0, 0, 0, 1, "#000", "#fff");

const SPATIAL = "spatial";
interface SpatialComponent extends Component {
    x: number;
    y: number;
}

let fadeTo = "next";
let fade = 0;
let deltaFade = 0;
let turn = 0;

const SPRITE = "sprite";

const BLINK = "blink";
interface BlinkComponent extends Component {
    period: number;
    cutoff: number;
    on: boolean;
}

const COLLIDER = "collider";
interface ColliderComponent extends Component {
    entity: number;
    event: string;
}

const HOVER = "hover";
interface HoverComponent extends Component {
    period: number;
}

const AI = "ai";
interface AiComponent extends Component {
    pattern: string;
}

const BOMB = "bomb";
interface BombComponent extends Component {
    ttl: number;
    entity: number;
}

const FIRE = "fire";
interface FireComponent extends Component {
    r: number;
}

const DOOR = "door";
interface DoorComponent extends Component {
    entity: number;
}

const MARBLE = "marble";
interface MarbleComponent extends Component {
    entity: number;
}

const BOX = "box";
interface BoxComponent extends Component {
    entity: number;
}

const SWITCH = "switch";
interface SwitchComponent extends Component {
    entity: number;
}

const LEVER = "lever";
interface LeverComponent extends Component {
    entity: number;
}

const PINGPONG = "pingpong";
interface PingPongComponent extends Component {
    steps: number;
    delta: number;
    current: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

const SPEECH = "speech";
interface SpeechComponent extends Component {
    entity: number;
    fadeAfterTurn: number;
    energy: number;
}

function collides(a: Point, b: Point) {
    return Vec2.dist(a, b) < tileSize;
}

initLevel(currentLevel);

function emitFire(x: number, y: number) {
    const free = getTileAtPixelPos({x, y}) === 0;
    if (!free) {
        return false;
    }

    const fire = createEntity();
    addComponent(fire, SPRITE, new FireDrawable(0, 0, tileSize, 1));
    addComponent(fire, COLLIDER, { event: "kill"});
    addComponent(fire, SPATIAL, { x, y });
    addComponent(fire, FIRE, { r: 1.5 });
    return true;
}

function spawnCrossFire(x: number, y: number) {
    emitFire(x, y);
    if (emitFire(x - tileSize, y)) {
        emitFire(x - tileSize * 2, y);
    }
    if (emitFire(x + tileSize, y)) {
        emitFire(x + tileSize * 2, y);
    }
    if (emitFire(x, y - tileSize)) {
        emitFire(x, y - tileSize * 2);
    }
    if (emitFire(x, y + tileSize)) {
        emitFire(x, y + tileSize * 2);
    }
}

function initLevel(level: number): [TileMap, Checkers] {
    turn = 0;
    room = rooms[level];
    tileMap = generateRoom(room.width, room.height, tileSize);
    checkers = new Checkers(room.width, room.height, tileSize, (currentLevel * 133) % 360);
    player.x = room.playerX * tileSize;
    player.y = room.playerY * tileSize;

    for (let i = 0; i < room.walls.length / 2; i++) {
        tileMap.set(room.walls[i * 2], room.walls[i * 2 + 1], 1);
    }

    clearComponents();

    if (room.items.switches) {
        room.items.switches.forEach((b: any) => {
            const crate = createEntity();
            addComponent(crate, SPRITE, new SwitchDrawable(0, 0, tileSize));
            addComponent(crate, SWITCH, {});
            addComponent(crate, SPATIAL, { x: b.x * tileSize, y: b.y * tileSize });
        });
    }

    if (room.items.boxes) {
        room.items.boxes.forEach((b: any) => {
            const crate = createEntity();
            addComponent(crate, SPRITE, new CrateDrawable(0, 0, tileSize));
            addComponent(crate, COLLIDER, { event: "slide" });
            addComponent(crate, BOX, {});
            addComponent(crate, SPATIAL, { x: b.x * tileSize, y: b.y * tileSize });
        });
    }

    if (room.items.exits) {
        room.items.exits.forEach((e: any) => {
            tileMap.set(e.x, e.y, 0);
            const exit = createEntity();
            const dir = e.x === room.width - 1 ? "right" : "down";
            addComponent(exit, SPRITE, new ExitDrawable(e.x * tileSize, e.y * tileSize, tileSize, dir));
        });
    }

    if (room.items.ghosts) {
        room.items.ghosts.forEach((ghost: any) => {
            const id = createEntity();
            const drawable = new GhostDrawable(0, 0, 0, 1, "#fff", "#000");
            addComponent(id, SPRITE, drawable);
            addComponent(id, HOVER, { period: 0.005 + Math.random() * 0.004 });
            addComponent(id, COLLIDER, { event: "kill"});
            addComponent(id, SPATIAL, {
                x: ghost.x * tileSize,
                y: ghost.y * tileSize,
                facing: ghost.facing
            });
            addComponent(id, AI, { pattern: "scatter" });
        });
    }

    if (room.items.bombs) {
        room.items.bombs.forEach((b: any) => {
            const bomb = createEntity();
            addComponent(bomb, SPRITE, new BombDrawable(0, 0, tileSize));
            addComponent(bomb, COLLIDER, { event: "slide" });
            addComponent(bomb, SPATIAL, { x: b.x * tileSize, y: b.y * tileSize });
            addComponent(bomb, BOMB, { ttl: 5, entity: bomb });
        });
    }

    if (room.items.marbles) {
        room.items.marbles.forEach((b: any) => {
            const marbleId = createEntity();
            const sprite = new MarbleDrawable(0, 0, tileSize);
            addComponent(marbleId, SPATIAL, { x: b.x * tileSize, y: b.y * tileSize });
            addComponent(marbleId, SPRITE, sprite);
            addComponent(marbleId, MARBLE, {});
            addComponent(marbleId, COLLIDER, { event: "pickup" });
        });
    }

    if (room.items.levers) {
        room.items.levers.forEach((spec: any) => {
            const leverId = createEntity();
            const sprite = new LeverDrawable(0, 0, 1, tileSize, false);
            addComponent(leverId, SPATIAL, {
                x: spec.x * tileSize,
                y: spec.y * tileSize,
                facing: -1,
                on: false,
                inverted: spec.inverted || false
            });
            addComponent(leverId, SPRITE, sprite);
            addComponent(leverId, COLLIDER, { event: "toggle"});
            addComponent(leverId, BLINK, { period: 400, cutoff: 200, on: false });
            addComponent(leverId, LEVER, { entity: leverId });
        });
    }

    if (room.items.doors) {
        room.items.doors.forEach((spec: any) => {
            const door = createEntity();
            addComponent(door, SPRITE, new DoorDrawable(0, 0, tileSize, spec.type, spec.lockType));
            addComponent(door, COLLIDER, { event: "block" });
            addComponent(door, SPATIAL, { x: spec.x * tileSize, y: spec.y * tileSize });
            addComponent(door, DOOR, { entity: door });
        });
    }

    if (room.items.spikes) {
        room.items.spikes.forEach((spec: any) => {
            const spikes = createEntity();
            addComponent(spikes, SPRITE, new SpikesDrawable(0, 0, tileSize));
            addComponent(spikes, COLLIDER, { event: "slice" });
            addComponent(spikes, SPATIAL, { x: spec.x * tileSize, y: spec.y * tileSize });
        });
    }

    if (room.items.saws) {
        room.items.saws.forEach((spec: any) => {
            const saw = createEntity();
            addComponent(saw, SPRITE, new SawBladeDrawable(0, 0, tileSize));
            addComponent(saw, COLLIDER, { event: "slice" });
            addComponent(saw, SPATIAL, { x: spec.x1 * tileSize, y: spec.y1 * tileSize });
            addComponent(saw, PINGPONG, {
                x1: spec.x1 * tileSize,
                y1: spec.y1 * tileSize,
                x2: spec.x2 * tileSize,
                y2: spec.y2 * tileSize,
                steps: Math.abs(spec.x2 - spec.x1 + spec.y2 - spec.y1),
                delta: 1,
                current: 0
            });
        });
    }

    if (room.items.eyes) {
        room.items.eyes.forEach((spec: any) => {
            const eye = createEntity();
            addComponent(eye, SPRITE, new EyeDrawable(0, 0, tileSize, player));
            addComponent(eye, COLLIDER, { event: "slide" });
            addComponent(eye, SPATIAL, { x: spec.x * tileSize, y: spec.y * tileSize });
        });
    }

    if (room.items.mouths) {
        room.items.mouths.forEach((spec: any) => {
            const mouth = createEntity();
            addComponent(mouth, SPRITE, new MouthDrawable(0, 0, tileSize));
            addComponent(mouth, COLLIDER, { event: "slide" });
            addComponent(mouth, SPATIAL, { x: spec.x * tileSize, y: spec.y * tileSize });
        });
    }

    if (room.events) {
        room.events.forEach((event) => {
            if (event.turn === 0) {
                triggerEvent(event);
            }
        });
    }

    return [tileMap, checkers];
}

subscribe("nextLevelFadeOut", (topic, message) => {
    fadeTo = "next";
    deltaFade = 0.1;
});

subscribe("restartLevel", (topic, message) => {
    fadeTo = "current";
    deltaFade = 0.1;
});

subscribe("move", (topic, message) => {
    nextMove = (message as any).move;
});

subscribe("move", (topic, message) => {
    nextMove = (message as any).move;
    getComponentList("bomb").forEach((b: BombComponent) => {
        b.ttl--;
        const p = getComponent(b.entity, SPRITE) as BombDrawable;
        if (b.ttl < 1) {
            destroyEntity(b.entity);
            spawnCrossFire(p.x, p.y);
        } else {
            p.jitter = Math.max(0, 3 - b.ttl) * 0.5;
        }
    });
});

function getNeighbourTile(pos: Point, dir: Move, step: number): Point {
    switch (dir) {
        case Move.LEFT:
            return { x: pos.x - step, y: pos.y };
        case Move.UP:
            return { x: pos.x, y: pos.y - step };
        case Move.RIGHT:
            return { x: pos.x + step, y: pos.y };
        case Move.DOWN:
            return { x: pos.x, y: pos.y + step };
        default:
            return pos;
    }
}

function tweenToNeighbour(pos: Point, dir: Move, step: number, type: TweenType) {
    type = type || TweenType.LINEAR;
    tweening = true;
    tweens.push({
        type,
        item: pos,
        from: {x: pos.x, y: pos.y},
        to: getNeighbourTile(pos, dir, step),
        t: 0
    });
}

function getTileAtPixelPos(pos: Point) {
    const tx = ((pos.x) / tileSize) | 0;
    const ty = ((pos.y) / tileSize) | 0;
    if (tx  < 0 || ty < 0 || tx >= tileMap.width || ty >= tileMap.height) {
        return -1;
    }
    return tileMap.get(tx, ty);
}

function emitDust(source: Point) {
    particles.push({
        x: source.x + tileSize * 0.5,
        y: source.y + tileSize * 0.75,
        vx: 0,
        vy: 0.5 * Math.random(),
        energy: 1,
        size: 3,
        brightness: 255
    });
    particles.push({
        x: 0.5 * tileSize * Math.random() + source.x + tileSize * 0.25,
        y: source.y + tileSize * 0.75,
        vx: 0,
        vy: 0.5 * Math.random(),
        energy: 1,
        size: 3,
        brightness: 255
    });
    particles.push({
        x: 0.5 * tileSize * Math.random() + source.x + tileSize * 0.25,
        y: source.y + tileSize * 0.75,
        vx: 0,
        vy: 0.5 * Math.random(),
        energy: 1,
        size: 3,
        brightness: 255
    });
}

function emitSmoke(source: Point) {
    particles.push({
        x: source.x + tileSize * 0.5,
        y: source.y + tileSize * 0.5,
        vx: Math.random() - 0.5,
        vy: 1.5 + 0.25 * Math.random(),
        energy: 1,
        size: 3,
        brightness: 255
    });
}

function emitBlood(source: Point) {
    particles.push({
        x: source.x + tileSize * 0.5,
        y: source.y + tileSize * 0.75,
        vx: 3.0 * Math.random() - 1.5,
        vy: 0.5 * Math.random() + 1,
        energy: 1,
        size: 3,
        brightness: 0
    });
    particles.push({
        x: 0.5 * tileSize * Math.random() + source.x + tileSize * 0.25,
        y: source.y + tileSize * 0.75,
        vx: 4.0 * Math.random() - 2,
        vy: 0.5 * Math.random() + 1,
        energy: 1,
        size: 2,
        brightness: 0
    });
    particles.push({
        x: 0.5 * tileSize * Math.random() + source.x + tileSize * 0.25,
        y: source.y + tileSize * 0.75,
        vx: 4.0 * Math.random() - 2,
        vy: 0.5 * Math.random() + 1,
        energy: 1,
        size: 1,
        brightness: 0
    });
}

function handleCollisions(entityId: number, neighbourPos: Point, dir: Move) {
    let collide = false;
    getComponentList(COLLIDER).forEach((collider: ColliderComponent, idx: number) => {
        if (idx !== entityId) {
            const spatial = getComponent(idx, SPATIAL) as SpatialComponent;
            const entityCollides = collides(neighbourPos, spatial);

            if (entityCollides) {
                // todo: emit event and separate handlers
                switch (collider.event) {
                    case "toggle":
                        collide = collide || entityCollides;
                        const drawable = getComponent(idx, SPRITE) as LeverDrawable;
                        drawable.facing = -drawable.facing;
                        const blink = getComponent(idx, BLINK) as BlinkComponent;
                        blink.on = drawable.facing === -1;
                        bumpPlayer.play();
                        break;

                    case "pickup":
                        destroyEntity(idx);
                        pickupPlayer.play();
                        speak("I feel slightly better now.");
                        break;

                    case "block":
                        const doorDrawable = getComponent(idx, SPRITE) as DoorDrawable;
                        if (!doorDrawable.open) {
                            collide = collide || entityCollides;
                        }
                        break;

                    case "slice":
                        const sawDrawable = getComponent(idx, SPRITE) as SawBladeDrawable;
                        emitBlood(getNeighbourTile(player, nextMove, tileSize * 0.5));
                        collide = collide || entityCollides;
                        break;

                    case "slide":
                        const boxDrawable = getComponent(idx, SPATIAL) as SpatialComponent;
                        const nextPos = getNeighbourTile(boxDrawable, dir, tileSize);
                        const nextFree = getTileAtPixelPos(nextPos) === 0;
                        // todo: tidy up
                        if (nextFree) {
                            const nextHit: any = getComponentList(COLLIDER).filter(
                                (value) => value !== undefined).find(
                                (nextCollider: ColliderComponent) => {
                                    const nextBounds = getComponent(nextCollider.entity, SPATIAL) as Pawn;
                                    const nextCollides = nextBounds && collides(nextPos, nextBounds);
                                    if (nextCollides && (nextCollider as ColliderComponent).event === "block") {
                                        const ndoor = getComponent(nextCollider.entity, SPRITE) as DoorDrawable;
                                        if (ndoor.open) {
                                            return false;
                                        }
                                    }
                                    return nextCollides;
                                });
                            if (nextHit === undefined) {
                                tweenToNeighbour(boxDrawable, dir, tileSize, TweenType.LINEAR);
                            } else {
                                collide = true;
                            }
                        } else {
                            collide = true;
                        }
                        break;

                    case "kill":
                        if (entityId === -1) {
                            publish("restartLevel", {});
                            nextMove = Move.NONE;
                        } else {
                            // destroyEntity(entityId);
                        }
                        destroyEntity(idx);
                        break;
                }
            }
        }
    });
    return collide;
}

function handlePlayerMove() {
    const neighbourPos = getNeighbourTile(player, nextMove, tileSize);
    const free = getTileAtPixelPos(neighbourPos) === 0;
    switch (nextMove) {
        case Move.LEFT:
            playerGhost.facing = -1;
            break;
        case Move.RIGHT:
            playerGhost.facing = 1;
            break;
    }
    if (free) {
        const collide = handleCollisions(-1, neighbourPos, nextMove);
        if (!collide) {
            emitDust(player);
            tweenToNeighbour(player, nextMove, tileSize, TweenType.LINEAR);
            slidePlayer.play();
        } else {
            tweenToNeighbour(player, nextMove, tileSize, TweenType.BUMP);
            bumpPlayer.play();
        }
    } else {
        emitDust(getNeighbourTile(player, nextMove, tileSize * 0.5));
        tweenToNeighbour(player, nextMove, tileSize, TweenType.BUMP);
        bumpPlayer.play();
    }
    nextMove = Move.NONE;
}

function handleEnemyMoves() {
    getComponentList(AI).forEach((entity, idx) => {
        const spatial = getComponent(idx, SPATIAL) as Pawn;

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

        const enemyDrawable = getComponent(idx, SPRITE) as GhostDrawable;
        switch (enemyMove) {
            case Move.LEFT:
                enemyDrawable.facing = -1;
                break;
            case Move.RIGHT:
                enemyDrawable.facing = 1;
                break;
        }

        const neighbourPos = getNeighbourTile(spatial, enemyMove, tileSize);
        const free = getTileAtPixelPos(neighbourPos) === 0;
        if (free) {
            const collide = handleCollisions(idx, neighbourPos, enemyMove);
            if (!collide) {
                emitDust(spatial);
                tweenToNeighbour(spatial, enemyMove, tileSize, TweenType.LINEAR);
                slidePlayer.play();
            } else {
                emitDust(getNeighbourTile(player, nextMove, tileSize * 0.5));
                tweenToNeighbour(spatial, enemyMove, tileSize, TweenType.BUMP);
            }
        } else {
            emitDust(getNeighbourTile(player, nextMove, tileSize * 0.5));
            tweenToNeighbour(spatial, enemyMove, tileSize, TweenType.BUMP);
        }
    });
}

function handleObjectMoves() {
    getComponentList(PINGPONG).forEach((pingpong: PingPongComponent) => {
        const entity = pingpong.entity;
        const spatial = getComponent(entity, SPATIAL) as SpatialComponent;

        pingpong.current = pingpong.current + pingpong.delta;
        if ((pingpong.current === pingpong.steps) || pingpong.current === 0) {
            pingpong.delta = -pingpong.delta;
        }

        const tx = pingpong.x1 + (pingpong.x2 - pingpong.x1) * pingpong.current / pingpong.steps;
        const ty = pingpong.y1 + (pingpong.y2 - pingpong.y1) * pingpong.current / pingpong.steps;

        tweens.push({
            type: TweenType.LINEAR,
            item: spatial,
            from: {x: spatial.x, y: spatial.y },
            to: {x: tx , y: ty },
            t: 0
        });

    });
}

function triggerEvent(event: any) {
    switch (event.event) {
        case "speak":
            const speech = createEntity();
            addComponent(speech, SPRITE, new SpeechBubbleDrawable(player.x, player.y, tileSize, event.text));
            addComponent(speech, SPEECH, {entity: speech, energy: 1, fadeAfterTurn: turn + 1});
            break;
    }
}

function handleRoomEvents() {
    if (room.events) {
        room.events.forEach((event) => {
            if (event.turn === turn) {
                triggerEvent(event);
            }
        });
    }
}

function speak(text: string) {
    const speech = createEntity();
    addComponent(speech, SPRITE, new SpeechBubbleDrawable(player.x, player.y, tileSize, text));
    addComponent(speech, SPEECH, {entity: speech, energy: 1, fadeAfterTurn: turn + 1});
}

function update() {
    if (tweening) {
        updateTweens(tweens);
        if (tweens.length === 0) {
            tweening = false;
        }
    } else {
        if (nextMove !== Move.NONE && deltaFade === 0) {
            turn++;
            handlePlayerMove();
            handleEnemyMoves();
            handleObjectMoves();
            handleRoomEvents();
        }
    }

    getComponentList(SPEECH).forEach((speech: SpeechComponent) => {
        const entity = speech.entity;
        const sprite = getComponent(entity, SPRITE);
        if (speech.fadeAfterTurn <= turn) {
            speech.energy -= 0.01;
        }
        if (speech.energy < 0.01) {
            destroyEntity(entity);
        }

        // player should be an entity !!!!
        // const playerSpatial = getComponent(player, SPRITE);
        sprite.x = playerGhost.x;
        sprite.y = playerGhost.y;
    });

    getComponentList(SPATIAL).forEach((spatial: SpatialComponent) => {
        const sprite = getComponent(spatial.entity, SPRITE) as Pawn;
        sprite.x = spatial.x;
        sprite.y = spatial.y;
    });

    getComponentList(HOVER).forEach((hover: HoverComponent, idx) => {
        const sprite = getComponent(idx, SPRITE) as GhostDrawable;
        sprite.z = Math.cos(timer.time * hover.period);
    });

    getComponentList(BLINK).forEach((blink: BlinkComponent, idx: number) => {
        (getComponent(idx, SPRITE) as any).on = blink.on && (timer.time % blink.period) > blink.cutoff;
    });

    if (Math.random() < 0.5) {
        getComponentList(BOMB).forEach((b) => {
            const bombComponent = b as BombComponent;
            const bombPos = getComponent(bombComponent.entity, SPRITE) as Point;
            if (bombPos) {
                emitSmoke({ x: bombPos.x + tileSize * 0.3, y: bombPos.y - tileSize * 0.3 });
            }
        });
    }

    updateParticles(particles);

    getComponentList(FIRE).forEach((fire: FireComponent, idx) => {
        const d = getComponent(idx, SPRITE) as FireDrawable;
        fire.r *= 0.92;
        d.r = fire.r;
        if (fire.r < 0.1) {
            destroyEntity(idx);
        }
    });

    let activatedLeverCount = 0;
    const levers = getComponentList(LEVER).filter((value) => value !== undefined);
    levers.forEach((leverComponent: LeverComponent) => {
        const blinkComponent = getComponent(leverComponent.entity, BLINK) as BlinkComponent;
        if (blinkComponent.on) {
            activatedLeverCount++;
        }
    });

    let activatedSwitchCount = 0;
    const switches = getComponentList(SWITCH).filter((value) => value !== undefined);
    switches.forEach((switchComponent: SwitchComponent) => {
        const spatial = getComponent(switchComponent.entity, SPATIAL);
        let hit = false;
        getComponentList(BOX).filter((value) => value !== undefined).forEach((box: BoxComponent) => {
            if (collides(spatial, getComponent(box.entity, SPATIAL))) {
                hit = true;
            }
        });
        if (hit) {
            activatedSwitchCount++;
        }
    });

    getComponentList(DOOR).forEach((doorComponent: DoorComponent) => {
        const door = doorComponent.entity;
        const drawable = getComponent(door, SPRITE) as DoorDrawable;
        const before = drawable.open;

        switch (drawable.lockType) {
            case "invertedLever":
                drawable.open = activatedLeverCount !== (levers.length);
                break;
            case "lever":
                drawable.open = activatedLeverCount === (levers.length);
                break;
            case "switch":
                drawable.open = activatedSwitchCount === (switches.length);
                break;
            case "marble":
                const marbleCount = getComponentList(MARBLE).filter((value) => value !== undefined).length;
                drawable.open = marbleCount === 0;
                break;
        }

        if (before !== drawable.open) {
            if (drawable.open) {
                if (drawable.type === "vertical") {
                    emitDust({x: drawable.x, y: drawable.y - tileSize * 0.7});
                    emitDust({x: drawable.x, y: drawable.y + tileSize * 0.3});
                } else {
                    emitDust({x: drawable.x - tileSize * 0.7, y: drawable.y - 0.2 * tileSize});
                    emitDust({x: drawable.x + tileSize * 0.3, y: drawable.y - 0.2 * tileSize});
                }
            } else {
                emitDust({x: drawable.x, y: drawable.y - tileSize * 0.1});
                emitDust({x: drawable.x, y: drawable.y - tileSize * 0.2});
            }
        }
    });

    const atExit = room.items.exits.find(
        (x: Point) => collides(player, { x: x.x * tileSize + 0.5 * tileSize, y: x.y * tileSize + 0.5 * tileSize})
    );

    if (atExit) {
        publish("nextLevelFadeOut", {});
    }

    let blockedExit = false;
    room.items.exits.forEach((exit: Point) => {
        getComponentList(COLLIDER).forEach((collider: ColliderComponent) => {
            const pos = getComponent(collider.entity, SPATIAL) as SpatialComponent;
            if (collides(pos, { x: exit.x * tileSize, y: exit.y * tileSize})) {
                blockedExit = true;
            }
        });
    });

    if (blockedExit) {
        speak("I'm trapped! Press R key to restart room");
    }

    fade += deltaFade;
    if (deltaFade > 0.01 && fade >= Math.PI) {
        if (fadeTo === "next") {
            currentLevel = (currentLevel + 1) % rooms.length;
        }
        initLevel(currentLevel);
        fade = Math.PI;
        deltaFade = -deltaFade;
    } else if (deltaFade < 0 && fade <= 0) {
        fade = 0;
        deltaFade = 0;
        fadeTo = "next";
        nextMove = Move.NONE
    }

    playerGhost.x = player.x;
    playerGhost.y = player.y;
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate((canvas.width - tileMap.width * tileSize) * 0.5 | 0,
        (canvas.height - tileMap.height * tileSize) * 0.5 | 0);

    checkers.draw(ctx);
    tileMap.draw(ctx);

    const sprites = getComponentList(SPRITE);
    sprites.forEach((sprite: Drawable) => sprite.draw(ctx));

    playerGhost.draw(ctx);

    drawParticles(ctx, particles);

    ctx.restore();

    ctx.fillStyle = `rgba(0,0,0,${Math.cos(fade + Math.PI) * 0.5 + 0.5}`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0,
    //     canvas.width / 2, canvas.height / 2, canvas.width / 2);
    // gradient.addColorStop(0, `rgba(0,0,0,0)`);
    // gradient.addColorStop(1, "rgba(0,0,0,.2)");
    //
    // ctx.fillStyle = gradient;
    // ctx.fillRect(0, 0, canvas.width, canvas.height);

}

function updateTitle() {
    // nothing yet...
}

const titleGhost = new GhostDrawable(0, 0, 0, 0, "#000", "#fff");
const titleGhost2 = new GhostDrawable(0, 0, 0, 0, "#fff", "#000");

function renderTitle() {
    const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 1.9);
    for (let i = 0; i < 0.99; i += 0.2) {
        const t = (i + timer.time * 0.001) % 0.99;
        const hue = (timer.time * 0.03) % 360;
        gradient.addColorStop(t, `hsl(${hue},30%,40%)`);
        gradient.addColorStop(t + 0.01, `hsl(${hue},40%,35%)`);
    }
    // ctx.fillStyle = `hsl(${250},25%,35%)`;
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 20; i++) {
        ctx.save();
        const r = ((timer.time * 0.5 + i * 100) % (canvas.width)) / 1.5;
        const a = Math.PI * 0.2 * i;
        const sc = (r / (canvas.width / 2));

        const gx = (canvas.width / 2) + Math.cos(a) * r;
        const gy = (canvas.height / 2) + Math.sin(a) * r;
        ctx.translate(gx, gy);
        ctx.scale(sc, sc);
        ctx.rotate(timer.time * 0.005 % (2 * Math.PI));
        const drawable = (i % 2 === 0) ? titleGhost : titleGhost2;
        drawable.draw(ctx);
        ctx.restore();
    }

    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 5;
    ctx.font = "58px fantasy";
    const metrics = ctx.measureText("Lost Marbles");
    ctx.strokeText("Lost Marbles", (canvas.width - metrics.width) / 2, 100);
    ctx.fillText("Lost Marbles", (canvas.width - metrics.width) / 2, 100);

    ctx.strokeStyle = "#000";
    ctx.fillStyle = "#fff";
    ctx.font = "17px cursive";
    ctx.lineWidth = 3;
    ctx.miterLimit = 5;
    const subtitle = "You have lost your marbles. " +
        "Travel into the strange mazes of your mind to collect your marbles and restore sanity!";
    drawTextWrapped(ctx, subtitle, 175, 170, canvas.width - 350, 20);

    drawTextCentered(ctx, "Press ENTER to start", 290);

    ctx.font = "12px cursive";
    drawTextCentered(ctx, "A game by Rene Hangstrup Møller", 115);
    if (!(document.fullscreenElement || document.webkitFullscreenElement || (document as any).msFullscreenElement)) {
        drawTextCentered(ctx, "Press F to enter full screen", 350);
    }
}

function loop(t: number) {
    timer.update(t);
    switch (gameState) {
        case GameState.TITLE:
            updateTitle();
            renderTitle();
            break;
        case GameState.LEVEL:
            update();
            render();
            break;
    }
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

window.addEventListener("keypress", (e) => {
    if (e.keyCode >= 37 && e.keyCode <= 40) {
        e.preventDefault();
    }
});

window.addEventListener("keyup", (e) => {
    switch (e.keyCode) {
        case 37: // left
        case 65: // a
        case 81: // q
            publish("move", { move: Move.LEFT });
            e.preventDefault();
            break;
        case 38: // up
        case 87: // w
        case 90: // z
            publish("move", { move: Move.UP });
            e.preventDefault();
            break;
        case 39:
        case 68:
            publish("move", { move: Move.RIGHT });
            e.preventDefault();
            break;
        case 40:
        case 83:
            publish("move", { move: Move.DOWN });
            e.preventDefault();
            break;
        case 82:
            if (gameState === GameState.LEVEL) {
                publish("restartLevel", {});
            }
            e.preventDefault();
            break;
        case 70:
            const stage = document.getElementById("stage") as HTMLElement;
            if (stage.requestFullscreen) {
                stage.requestFullscreen();
            } else if (stage.webkitRequestFullScreen) {
                stage.webkitRequestFullScreen();
            } else if ((stage as any).msRequestFullcreen) {
                (stage as any).msRequestFullscreen();
            }
            break;
        case 13:
        case 32:
            if (gameState === GameState.TITLE) {
                gameState = GameState.LEVEL;
            } else {
                // publish("nextLevelFadeOut", {});
            }
            e.preventDefault();
            break;
    }
}, false);

document.addEventListener("fullscreenchange", (e) => {
    const scaleX = window.innerWidth / canvas.width;
    const scaleY = window.innerHeight / canvas.height;
    const scaleToFit = Math.min(scaleX, scaleY);

    // const stage = document.getElementById("stage") as HTMLElement;
    canvas.style.transformOrigin = "0 0";
    canvas.style.transform =  `scale(${scaleToFit},${scaleToFit})`;
}, false);

window.addEventListener("resize", (e) => {
    const scaleX = window.innerWidth / canvas.width;
    const scaleY = window.innerHeight / canvas.height;
    const scaleToFit = Math.min(scaleX, scaleY);

    // const stage = document.getElementById("stage") as HTMLElement;
    canvas.style.transformOrigin = "0 0";
    canvas.style.transform =  `scale(${scaleToFit},${scaleToFit})`;
}, false);
