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
        background: "#294a2f",
        pathOuter: "#7f6a49",
        pathInner: "#b89b6a",
        buildTile: "rgba(100, 190, 120, 0.16)",
        buildTileBorder: "rgba(210, 255, 220, 0.18)"
    },
    waves: [
        ["grunt", "grunt", "scout", "grunt", "scout"],
        ["grunt", "grunt", "tank", "scout", "grunt", "scout"],
        ["tank", "grunt", "scout", "tank", "grunt", "scout", "scout"]
    ]
};
