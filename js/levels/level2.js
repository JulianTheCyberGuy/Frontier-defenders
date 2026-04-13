export default {
    name: "Ruined Keep",
    path: [
        { x: 70, y: 480 },
        { x: 70, y: 340 },
        { x: 250, y: 340 },
        { x: 250, y: 170 },
        { x: 520, y: 170 },
        { x: 520, y: 410 },
        { x: 760, y: 410 },
        { x: 760, y: 120 },
        { x: 910, y: 120 }
    ],
    buildTiles: [
        { x: 150, y: 430 }, { x: 150, y: 260 }, { x: 340, y: 250 }, { x: 430, y: 250 },
        { x: 610, y: 250 }, { x: 680, y: 330 }, { x: 850, y: 300 }, { x: 680, y: 170 },
        { x: 860, y: 180 }
    ],
    terrain: {
        background: "#363d36",
        pathOuter: "#5f5648",
        pathInner: "#b4a289",
        buildTile: "rgba(186, 214, 186, 0.09)",
        buildTileBorder: "rgba(244, 247, 244, 0.18)"
    },
    waves: [
        ["grunt", "scout", "shield", "tank", "splitter"],
        ["tank", "grunt", "swarm", "swarm", "shield", "splitter"],
        ["tank", "shield", "splitter", "grunt", "swarm", "splitter", "tank"]
    ]
};
