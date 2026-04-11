const tileSize = 60;
const cols = 16;
const rows = 9;

const path = [
    { x: 30, y: 270 },
    { x: 210, y: 270 },
    { x: 210, y: 90 },
    { x: 510, y: 90 },
    { x: 510, y: 390 },
    { x: 930, y: 390 }
];

const buildableTiles = [
    { col: 1, row: 2 }, { col: 2, row: 2 }, { col: 4, row: 2 }, { col: 6, row: 2 },
    { col: 8, row: 2 }, { col: 10, row: 2 }, { col: 12, row: 2 },

    { col: 1, row: 5 }, { col: 2, row: 5 }, { col: 4, row: 5 }, { col: 6, row: 5 },
    { col: 8, row: 5 }, { col: 10, row: 5 }, { col: 12, row: 5 },

    { col: 3, row: 6 }, { col: 5, row: 6 }, { col: 7, row: 6 }, { col: 9, row: 6 }
];

const waves = [
    [
        { delay: 0.0, type: "goblin" },
        { delay: 0.9, type: "goblin" },
        { delay: 1.8, type: "goblin" },
        { delay: 2.7, type: "wolf" },
        { delay: 3.5, type: "goblin" },
        { delay: 4.4, type: "wolf" }
    ],
    [
        { delay: 0.0, type: "goblin" },
        { delay: 0.8, type: "wolf" },
        { delay: 1.6, type: "goblin" },
        { delay: 2.4, type: "skeleton" },
        { delay: 3.1, type: "wolf" },
        { delay: 3.8, type: "skeleton" },
        { delay: 4.6, type: "goblin" }
    ],
    [
        { delay: 0.0, type: "wolf" },
        { delay: 0.7, type: "wolf" },
        { delay: 1.4, type: "skeleton" },
        { delay: 2.1, type: "skeleton" },
        { delay: 2.8, type: "wolf" },
        { delay: 3.5, type: "skeleton" },
        { delay: 4.3, type: "skeleton" },
        { delay: 5.1, type: "wolf" }
    ]
];

export default {
    name: "Forest Road",
    tileSize,
    cols,
    rows,
    path,
    buildableTiles,
    waves
};
