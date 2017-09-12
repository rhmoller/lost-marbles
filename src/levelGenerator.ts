import {TileMap} from "./TileMap";

export interface RoomSpec {
    width: number;
    height: number;
    playerX: number;
    playerY: number;
    walls: number[];
    items: any;
    events?: any[];
}

export const rooms: RoomSpec[] = [
    // 0
    {
        width: 7, height: 5,
        playerX: 1, playerY: 1,
        walls: [
        ],
        items: {
            exits: [ {x: 6, y: 2} ]
        },
        events: [
            {
                turn: 0, event: "speak",
                text: "Move with arrow keys or WASD or ZQSD"
            },
            {
                turn: 3, event: "speak",
                text: "There is a passage over there to the right"
            }
        ]
    },
    // 1
    {
        width: 5, height: 8,
        playerX: 1, playerY: 2,
        walls: [
            1, 5, 3, 5
        ],
        items: {
            exits: [ {x: 2, y: 7} ],
            boxes: [
                { x: 2, y: 4 }
            ]
        },
        events: [
            {
                turn: 0, event: "speak",
                text: "I need to push that box out of the way"
            },
        ]
    },
    // 2
    {
        width: 8, height: 7,
        playerX: 1, playerY: 1,
        walls: [
            2, 1, 2, 2, 2, 3,
            3, 3, 5, 3, 6, 3,
            5, 5, 3, 5
        ],
        items: {
            exits: [ {x: 4, y: 6} ],
            marbles: [
                { x: 6, y: 1, facing: 0}
            ],
            levers: [
                { x: 6, y: 5 }
            ],
            doors: [
                { x: 4, y: 3, type: "horizontal" },
                { x: 4, y: 5, type: "horizontal", lockType: "marble" }
            ]
        },
        events: [
            {
                turn: 0, event: "speak",
                text: "Oooh. One of my marbles is behind that door"
            }
        ]

    },
    // 3
    {
        width: 8, height: 6,
        playerX: 1, playerY: 1,
        walls: [
            1, 3, 2, 3, 2, 4, 1, 4, 4, 3, 5, 3, 6, 3, 4, 4, 5, 4, 6, 4
        ],
        items: {
            exits: [ { x: 3, y: 5} ],
            doors: [ { x: 3, y: 3, type: "horizontal", lockType: "switch" }],
            boxes: [ { x: 4, y: 2 }],
            switches: [ { x: 5, y: 2 } ]
        },
        events: [
            {
                turn: 0, event: "speak",
                text: "You can always restart a room by pressing R"
            }
        ]
    },
    // 4
    {
        width: 7, height: 5,
        playerX: 1, playerY: 1,
        walls: [
            4, 1, 2, 1, 5, 1, 5, 3
        ],
        items: {
            exits: [ { x: 6, y: 2} ],
            boxes: [ { x: 3, y: 2} ],
            marbles: [ { x: 3, y: 1} ],
            doors: [ { x: 5, y: 2, lockType: "marble" }]
        },
        events: [
            {
                turn: 0, event: "speak",
                text: "I thought my mind would be more twisted than this"
            }
        ]
    },
    // 5
    {
        width: 8, height: 7,
        playerX: 1, playerY: 1,
        walls: [
            3, 5, 5, 5, 3, 2, 2, 2, 1, 2, 3, 3, 5, 2,
        ],
        items: {
            exits: [ {x: 4, y: 6} ],
            switches: [ { x: 3, y: 1 } ],
            boxes: [
                { x: 4, y: 3 }, { x: 5, y: 1 }
            ],
            levers: [
                { x: 6, y: 5 }
            ],
            doors: [
                { x: 3, y: 4 },
                { x: 4, y: 5, type: "horizontal", lockType: "switch" }
            ]
        },
        events: [
        ]

    },

    {
        width: 6, height: 6,
        playerX: 1, playerY: 4,
        walls: [
            3, 4
        ],
        items: {
            boxes: [
                { x: 3, y: 3 }, { x: 2, y: 2 }, { x: 3, y: 1 }
            ],
            switches: [
                { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }
            ],
            doors: [
                { x: 4, y: 4, lockType: "switch", type: "horizontal" }
            ],
            exits: [ {x: 4, y: 5} ],
        }
    },

    {
        width: 10, height: 9,
        playerX: 1, playerY: 4,
        walls: [
            1, 1, 2, 1, 1, 2, 3, 1, 1, 6, 1, 7,
            1, 3, 2, 3, 6, 2,
            1, 5, 2, 5,
            5, 2,
            6, 3, 6, 5, 5, 6, 4, 6, 6, 6,
            8, 3, 8, 5
        ],
        items: {
            boxes: [
                { x: 3, y: 4 }, { x: 5, y: 4 }, { x: 3, y: 3 }, { x: 3, y: 2 }
            ],
            switches: [
                { x: 2, y: 2 }, { x: 2, y: 7 }, { x: 5, y: 5 }, { x: 4, y: 7 }
            ],
            levers: [
                { x: 5, y: 3 }
            ],
            doors: [
                { x: 8, y: 4, lockType: "switch" },
                { x: 6, y: 4, lockType: "lever" }
            ],
            exits: [ {x: 9, y: 4} ],
        }
    },


    // 6
    {
        width: 12, height: 9,
        playerX: 1, playerY: 1,
        walls: [
            2, 1, 2, 2, 2, 3,
            3, 3, 5, 3
        ],
        items: {
            exits: [ {x: 11, y: 5} ],
            ghosts: [
                { x: 7, y: 3, facing: 0}
            ],
            boxes: [
                { x: 3, y: 6 }
            ],
            bombs: [
                { x: 3, y: 4 }
            ],
            levers: [
                { x: 10, y: 7 },
                { x: 9, y: 6 }
            ],
            doors: [
                { x: 8, y: 5 }
            ],
            marbles: [
                { x: 3, y: 1 }
            ],
            spikes: [
                { x: 1, y: 5 }
            ],
            saws: [
                { x1: 2, y1: 5, x2: 4, y2: 5 },
                { x1: 7, y1: 5, x2: 5, y2: 5 }
            ],
            eyes: [
                { x: 7, y: 2 }, { x: 9, y: 2 }
            ],
            mouths: [
                { x: 8, y: 3 }
            ]
        },
        events: [
            {
                turn: 0, event: "speak",
                text: "I always feel like somebody's watching me."
            }
        ]
    },
];

export function generateRoom(width: number, height: number, tileSize: number) {
    const tileMap = new TileMap(width, height, tileSize);
    for (let x = 0; x < width; x++) {
        tileMap.set(x, 0, 1);
        tileMap.set(x, height - 1, 1);
    }
    for (let y = 0; y < height; y++) {
        tileMap.set(0, y, 1);
        tileMap.set(width - 1, y, 1);
    }
    return tileMap;
}
