export default {
    name: "Lava Dungeon Gate",
    path: [
        { x: 40, y: 430 },
        { x: 200, y: 430 },
        { x: 200, y: 300 },
        { x: 370, y: 300 },
        { x: 370, y: 140 },
        { x: 610, y: 140 },
        { x: 610, y: 360 },
        { x: 820, y: 360 },
        { x: 820, y: 180 },
        { x: 920, y: 180 }
    ],
    buildTiles: [
        { x: 110, y: 340 }, { x: 290, y: 390 }, { x: 290, y: 220 }, { x: 470, y: 240 },
        { x: 530, y: 80 }, { x: 700, y: 250 }, { x: 740, y: 430 }, { x: 880, y: 280 }
    ],
    terrain: {
        background: "#2a1616",
        pathOuter: "#6d3b22",
        pathInner: "#c26a2e",
        buildTile: "rgba(210, 90, 50, 0.16)",
        buildTileBorder: "rgba(255, 200, 160, 0.18)"
    },
    boss: {
        name: "Infernal Behemoth",
        hp: 1650,
        speed: 28,
        reward: 180,
        radius: 26,
        color: "#b91c1c",
        immuneSlow: true,
        spawnMinionRole: "elite",
        spawnMinionCount: 1,
        spawnMinionInterval: 6,
        enrageThreshold: 0.55
    },
    waves: [
        ["scout", "grunt", "scout", "grunt", "tank", "scout"],
        ["grunt", "tank", "scout", "grunt", "tank", "elite", "scout"],
        ["tank", "elite", "grunt", "scout", "tank", "grunt", "elite", "boss"]
    ]
};
