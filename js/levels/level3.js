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
        background: "#2b1715",
        pathOuter: "#6f3d23",
        pathInner: "#d7863f",
        buildTile: "rgba(229, 118, 64, 0.10)",
        buildTileBorder: "rgba(255, 217, 186, 0.18)"
    },
    waves: [
        ["scout", "grunt", "splitter", "grunt", "tank", "swarm"],
        ["grunt", "tank", "shield", "grunt", "tank", "swarm", "splitter"],
        ["tank", "shield", "splitter", "swarm", "tank", "grunt", "splitter", "shield"]
    ]
};
