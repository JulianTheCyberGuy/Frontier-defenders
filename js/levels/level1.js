export default {
    name: "Forest Road",
    path: [
        { x: 40, y: 260 },
        { x: 220, y: 260 },
        { x: 220, y: 120 },
        { x: 500, y: 120 },
        { x: 500, y: 380 },
        { x: 900, y: 380 }
    ],
    buildTiles: [
        { x: 140, y: 180 }, { x: 320, y: 180 }, { x: 420, y: 180 }, { x: 600, y: 180 },
        { x: 760, y: 180 }, { x: 140, y: 340 }, { x: 320, y: 340 }, { x: 420, y: 340 },
        { x: 600, y: 340 }, { x: 760, y: 340 }, { x: 860, y: 260 }
    ],
    terrain: {
        background: "#243d27",
        pathOuter: "#766146",
        pathInner: "#c8ae7e",
        buildTile: "rgba(118, 214, 136, 0.10)",
        buildTileBorder: "rgba(225, 255, 232, 0.20)"
    },
    waves: [
        ["grunt", "grunt", "scout", "splitter", "scout"],
        ["grunt", "shield", "tank", "scout", "splitter", "swarm"],
        ["tank", "shield", "splitter", "tank", "grunt", "swarm", "swarm"]
    ]
};
