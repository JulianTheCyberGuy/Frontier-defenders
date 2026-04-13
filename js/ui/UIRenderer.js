export default class UIRenderer {
    constructor(canvas) {
        this.canvas = canvas;
    }

    drawRangeIndicator(ctx, x, y, range, color = 'rgba(255,255,255,0.18)') {
        ctx.save();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, range, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([7, 5]);
        ctx.beginPath();
        ctx.arc(x, y, range, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    drawTopBar(ctx, scene) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 960, 40);

        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Gold: ' + scene.gold, 10, 24);
        ctx.fillText('Lives: ' + scene.lives, 120, 24);
        ctx.fillText(
            'Wave: ' + Math.min(scene.waveIndex + 1, scene.currentLevel.data.waves.length) + '/' + scene.currentLevel.data.waves.length,
            220,
            24
        );

        scene.buttons.forEach((type, i) => {
            const x = 120 * i + 320;
            const hovered = scene.hoveredId === `tower-${type}`;
            const selected = scene.selectedType === type;

            ctx.fillStyle = selected ? 'gold' : hovered ? '#c9d1d9' : 'gray';
            ctx.fillText(`${type} (${scene.towerCosts[type]})`, x, 24);
        });
    }

    drawSelectedTowerPanel(ctx, scene) {
        if (!scene.selectedTower) return;

        const stats = scene.selectedTower.getDisplayStats();
        const cost = scene.selectedTower.getUpgradeCost();
        const choices = scene.selectedTower.getUpgradeChoices();

        ctx.fillStyle = 'rgba(0, 0, 0, 0.84)';
        ctx.fillRect(676, 48, 268, 246);

        ctx.strokeStyle = 'rgba(255,255,255,0.22)';
        ctx.lineWidth = 1;
        ctx.strokeRect(676, 48, 268, 246);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.fillText(stats.name, 692, 74);

        ctx.font = '14px Arial';
        ctx.fillStyle = '#d0d7de';
        ctx.fillText(`Level ${stats.level}`, 692, 96);
        ctx.fillText(`Damage: ${stats.damage}`, 692, 118);
        ctx.fillText(`Range: ${stats.range}`, 692, 138);
        ctx.fillText(`Rate: ${stats.rate}`, 692, 158);
        ctx.fillText(`Sell value: ${stats.sellValue}g`, 692, 178);

        if (choices.length === 0 || cost == null) {
            ctx.fillStyle = '#7ee787';
            ctx.fillText('Max level reached', 692, 206);
        } else {
            ctx.fillStyle = scene.gold >= cost ? '#f7dc6f' : '#ff7b72';
            ctx.fillText(`Next upgrade: ${cost}g`, 692, 206);
        }

        choices.forEach((choice, i) => {
            const button = scene.upgradeButtons[i];
            const hovered = scene.hoveredId === `upgrade-${choice.id}`;
            const affordable = cost != null && scene.gold >= cost;
            ctx.fillStyle = affordable ? (hovered ? '#3f7aeb' : '#2255aa') : '#4b4b4b';
            ctx.fillRect(button.x, button.y, button.width, button.height);
            ctx.strokeStyle = hovered ? '#ffffff' : 'rgba(255,255,255,0.2)';
            ctx.strokeRect(button.x, button.y, button.width, button.height);
            ctx.fillStyle = '#ffffff';
            ctx.font = '13px Arial';
            ctx.fillText(choice.label, button.x + 12, button.y + 22);
        });

        const sellHovered = scene.hoveredId === 'sell-tower';
        ctx.fillStyle = sellHovered ? '#b94a48' : '#8d3230';
        ctx.fillRect(scene.sellButton.x, scene.sellButton.y, scene.sellButton.width, scene.sellButton.height);
        ctx.strokeStyle = sellHovered ? '#ffffff' : 'rgba(255,255,255,0.2)';
        ctx.strokeRect(scene.sellButton.x, scene.sellButton.y, scene.sellButton.width, scene.sellButton.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`Sell Tower (+${stats.sellValue}g)`, scene.sellButton.x + 12, scene.sellButton.y + 23);
    }

    drawLevelInfo(ctx, scene) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.62)';
        ctx.fillRect(12, 50, 212, 38);
        ctx.fillStyle = 'white';
        ctx.font = '15px Arial';
        ctx.fillText(scene.currentLevel.name, 24, 74);
    }

    drawTooltip(ctx, scene) {
        if (!scene.tooltip) return;

        const { x, y, title, lines } = scene.tooltip;
        const width = 220;
        const height = 36 + lines.length * 18;
        const boxX = Math.min(x + 14, this.canvas.width - width - 8);
        const boxY = Math.min(y + 14, this.canvas.height - height - 8);

        ctx.fillStyle = 'rgba(0,0,0,0.88)';
        ctx.fillRect(boxX, boxY, width, height);
        ctx.strokeStyle = 'rgba(255,255,255,0.18)';
        ctx.strokeRect(boxX, boxY, width, height);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(title, boxX + 10, boxY + 20);

        ctx.fillStyle = '#d0d7de';
        ctx.font = '13px Arial';
        lines.forEach((line, index) => {
            ctx.fillText(line, boxX + 10, boxY + 40 + index * 18);
        });
    }

    drawOverlay(ctx, scene, text) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, scene.canvas.width, scene.canvas.height);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 42px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, scene.canvas.width / 2, 200);

        ctx.textAlign = 'left';
        for (const [key, button] of Object.entries(scene.overlayButtons)) {
            const hovered = scene.hoveredId === key;
            ctx.fillStyle = hovered ? '#2f81f7' : '#1f6feb';
            ctx.fillRect(button.x, button.y, button.width, button.height);
            ctx.strokeStyle = hovered ? '#ffffff' : 'rgba(255,255,255,0.2)';
            ctx.strokeRect(button.x, button.y, button.width, button.height);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px Arial';
            ctx.fillText(key.charAt(0).toUpperCase() + key.slice(1), button.x + 20, button.y + 30);
        }
    }
}
