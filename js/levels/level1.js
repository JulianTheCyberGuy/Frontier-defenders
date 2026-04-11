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
    { col: 1, row: 2 },
    { col: 2, row: 2 },
    { col: 4, row: 2 },
    { col: 6, row: 2 },
    { col: 8, row: 2 },
    { col: 10, row: 2 },
    { col: 12, row: 2 },

    { col: 1, row: 5 },
    { col: 2, row: 5 },
    { col: 4, row: 5 },
    { col: 6, row: 5 },
    { col: 8, row: 5 },
    { col: 10, row: 5 },
    { col: 12, row: 5 },

    { col: 3, row: 6 },
    { col: 5, row: 6 },
    { col: 7, row: 6 },
    { col: 9, row: 6 }
];

const waves = [
    {
        enemies: [
            { type: "Goblin", maxHealth: 55, speed: 60, color: "#ad2f45", reward: 10 },
            { type: "Goblin", maxHealth: 55, speed: 60, color: "#ad2f45", reward: 10 },
            { type: "Goblin", maxHealth: 55, speed: 60, color: "#ad2f45", reward: 10 },
            { type: "Goblin", maxHealth: 55, speed: 62, color: "#ad2f45", reward: 10 },
            { type: "Wolf", maxHealth: 45, speed: 82, color: "#6a6a6a", reward: 12, radius: 9 },
            { type: "Goblin", maxHealth: 55, speed: 62, color: "#ad2f45", reward: 10 },
            { type: "Wolf", maxHealth: 45, speed: 84, color: "#6a6a6a", reward: 12, radius: 9 },
            { type: "Goblin", maxHealth: 60, speed: 65, color: "#ad2f45", reward: 10 }
        ],
        spawnInterval: 1.1
    },
    {
        enemies: [
            { type: "Goblin", maxHealth: 65, speed: 68, color: "#ad2f45", reward: 10 },
            { type: "Wolf", maxHealth: 50, speed: 88, color: "#6a6a6a", reward: 12, radius: 9 },
            { type: "Goblin", maxHealth: 65, speed: 68, color: "#ad2f45", reward: 10 },
            { type: "Skeleton", maxHealth: 85, speed: 56, color: "#d6d6d6", reward: 15, radius: 11 },
            { type: "Wolf", maxHealth: 50, speed: 90, color: "#6a6a6a", reward: 12, radius: 9 },
            { type: "Goblin", maxHealth: 65, speed: 70, color: "#ad2f45", reward: 10 },
            { type: "Skeleton", maxHealth: 90, speed: 58, color: "#d6d6d6", reward: 15, radius: 11 },
            { type: "Wolf", maxHealth: 52, speed: 92, color: "#6a6a6a", reward: 12, radius: 9 },
            { type: "Skeleton", maxHealth: 90, speed: 58, color: "#d6d6d6", reward: 15, radius: 11 }
        ],
        spawnInterval: 0.9
    },
    {
        enemies: [
            { type: "Wolf", maxHealth: 55, speed: 95, color: "#6a6a6a", reward: 12, radius: 9 },
            { type: "Wolf", maxHealth: 55, speed: 95, color: "#6a6a6a", reward: 12, radius: 9 },
            { type: "Skeleton", maxHealth: 95, speed: 60, color: "#d6d6d6", reward: 15, radius: 11 },
            { type: "Goblin", maxHealth: 72, speed: 72, color: "#ad2f45", reward: 10 },
            { type: "Skeleton", maxHealth: 95, speed: 60, color: "#d6d6d6", reward: 15, radius: 11 },
            { type: "Wolf", maxHealth: 58, speed: 98, color: "#6a6a6a", reward: 12, radius: 9 },
            { type: "Goblin", maxHealth: 72, speed: 74, color: "#ad2f45", reward: 10 },
            { type: "Skeleton", maxHealth: 100, speed: 62, color: "#d6d6d6", reward: 16, radius: 11 },
            { type: "Skeleton", maxHealth: 140, speed: 50, color: "#f2e9c8", reward: 20, radius: 13 }
        ],
        spawnInterval: 0.8
    }
];

const level1 = {
    name: "Forest Road",
    tileSize,
    cols,
    rows,
    path,
    buildableTiles,
    waves
};

export default level1;
