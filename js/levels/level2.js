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
        background: "#3f463f",
        pathOuter: "#61584b",
        pathInner: "#8d816d",
        buildTile: "rgba(145, 170, 145, 0.14)",
        buildTileBorder: "rgba(240, 240, 240, 0.16)"
    },
    boss: {
        name: "Warden of Ash",
        hp: 1350,
        speed: 26,
        reward: 150,
        radius: 24,
        color: "#991b1b",
        immuneSlow: true,
        spawnMinionRole: "grunt",
        spawnMinionCount: 2,
        spawnMinionInterval: 7,
        enrageThreshold: 0.5
    },
    waves: [
        ["grunt", "scout", "grunt", "tank", "scout"],
        ["tank", "grunt", "scout", "scout", "tank", "grunt"],
        ["tank", "tank", "elite", "grunt", "scout", "grunt", "boss"]
    ]
};
