import { TOWER_METADATA } from "../config.js";
import Tower from "../core/Tower.js";

export default class DomUI {
    constructor(root) {
        this.root = root;
        this.mode = null;
        this.callbacks = {};
        this.stateKey = "";
        this.settingsOpen = false;
        this.handleClick = this.handleClick.bind(this);
    }

    clear() {
        if (!this.root) return;
        this.unbind();
        this.root.innerHTML = "";
        this.root.classList.remove("is-visible");
        this.root.onclick = null;
    }

    hide() {
        this.clear();
        this.mode = null;
        this.callbacks = {};
        this.stateKey = "";
    }

    showMainMenu({ onPlay, onLevelSelect, onOpenSettings, soundManager }) {
        if (!this.root) return;

        this.hide();
        this.mode = "menu";
        this.root.classList.add("is-visible");
        this.root.innerHTML = `
            <div class="dom-screen main-menu-screen">
                <section class="dom-panel hero-panel">
                    <div>
                        <p class="hero-kicker">Dark fantasy tower defense</p>
                        <h1 class="hero-title">Frontier<br>Defenders</h1>
                        <p class="hero-copy">Hold ancient roads, layer your defenses, and survive each wave with cleaner tactical control.</p>
                    </div>
                    <div>
                        <div class="hero-actions">
                            <button class="dom-button is-primary" data-action="play">Play</button>
                            <button class="dom-button" data-action="levels">Level Select</button>
                            <button class="dom-button is-ghost" data-action="settings">Settings</button>
                        </div>
                        <div class="hero-pills">
                            <span class="dom-pill is-accent">HTML menu UI</span>
                            <span class="dom-pill">Sharper text</span>
                            <span class="dom-pill">Responsive layout</span>
                        </div>
                    </div>
                </section>
                <div class="side-stack">
                    <section class="dom-panel info-card">
                        <h2>Why this feels cleaner</h2>
                        <ul class="info-list">
                            <li>Text now renders in HTML instead of canvas, so it stays crisp.</li>
                            <li>Buttons, spacing, and panel sizing scale better on different screens.</li>
                            <li>The battlefield can stay the focus while menus carry the heavier UI work.</li>
                        </ul>
                    </section>
                    <section class="dom-panel info-card">
                        <h3>Current build</h3>
                        <ul class="info-list">
                            <li>Five tower classes with upgrades and combat roles.</li>
                            <li>Three battlefields with custom paths and wave sets.</li>
                            <li>Custom engine flow with canvas gameplay intact.</li>
                        </ul>
                    </section>
                </div>
            </div>
        `;

        this.attachRootClick((event) => {
            const action = event.target.closest("[data-action]")?.dataset.action;
            if (!action) return;
            if (action === "play") onPlay();
            if (action === "levels") onLevelSelect();
            if (action === "settings") onOpenSettings();
        });

        if (this.settingsOpen) {
            this.renderSettingsModal({ soundManager, onClose: () => this.closeSettings(() => this.showMainMenu({ onPlay, onLevelSelect, onOpenSettings, soundManager })) });
        }
    }

    showLevelSelect({ levels, onBack, onPlayLevel, onOpenSettings, soundManager }) {
        if (!this.root) return;

        this.hide();
        this.mode = "level-select";
        const cards = levels.map((level) => {
            const meta = level.locked
                ? `<span class="dom-pill">Locked</span>`
                : `<span class="dom-pill is-accent">Ready</span>`;

            return `
                <article class="dom-panel level-card ${level.locked ? "is-locked" : ""}">
                    <div class="level-card-top">
                        <div class="level-badge" style="color:${level.accent}; background:${level.accent};"></div>
                        <div>
                            <h3>${level.label}</h3>
                            <p>${level.subtitle}</p>
                        </div>
                        <div class="level-meta">
                            <span class="dom-pill">Level ${level.id + 1}</span>
                            ${meta}
                        </div>
                        <p>${level.terrain}</p>
                        <p>${level.waves}</p>
                    </div>
                    <div class="level-card-actions">
                        <button class="dom-button ${level.locked ? "" : "is-primary"}" data-level-id="${level.id}" ${level.locked ? "disabled" : ""}>${level.locked ? "Locked" : "Deploy Here"}</button>
                    </div>
                </article>
            `;
        }).join("");

        this.root.classList.add("is-visible");
        this.root.innerHTML = `
            <div class="dom-screen level-select-screen">
                <section class="dom-panel screen-header">
                    <div>
                        <h2>Choose Your Front</h2>
                        <p class="screen-subtitle">Pick a battlefield, review its pressure, and deploy without fighting blurry canvas text.</p>
                    </div>
                    <div class="screen-actions">
                        <button class="dom-button" data-action="back">Main Menu</button>
                        <button class="dom-button is-ghost" data-action="settings">Settings</button>
                    </div>
                </section>
                <section class="level-grid">${cards}</section>
            </div>
        `;

        this.attachRootClick((event) => {
            const action = event.target.closest("[data-action]")?.dataset.action;
            if (action === "back") onBack();
            if (action === "settings") onOpenSettings();

            const levelButton = event.target.closest("[data-level-id]");
            if (levelButton && !levelButton.disabled) {
                onPlayLevel(Number(levelButton.dataset.levelId));
            }
        });

        if (this.settingsOpen) {
            this.renderSettingsModal({ soundManager, onClose: () => this.closeSettings(() => this.showLevelSelect({ levels, onBack, onPlayLevel, onOpenSettings, soundManager })) });
        }
    }

    openSettings(renderCallback) {
        this.settingsOpen = true;
        renderCallback();
    }

    closeSettings(renderCallback) {
        this.settingsOpen = false;
        if (typeof renderCallback === "function") {
            renderCallback();
            return;
        }
        this.root?.querySelector(".modal-scrim")?.remove();
    }

    renderSettingsModal({ soundManager, onClose }) {
        if (!this.root) return;

        this.root.querySelector(".modal-scrim")?.remove();
        const sliderValue = Math.round((soundManager?.masterVolume ?? 0.6) * 100);
        const modal = document.createElement("div");
        modal.className = "modal-scrim";
        modal.innerHTML = `
            <div class="settings-modal">
                <h3 class="settings-title">Settings</h3>
                <p class="settings-copy">Use HTML controls for cleaner presentation while gameplay stays in canvas.</p>
                <div class="setting-block">
                    <div class="setting-row">
                        <span class="setting-label">Master volume</span>
                        <span class="setting-value" data-role="volume-value">${sliderValue}%</span>
                    </div>
                    <input class="volume-slider" type="range" min="0" max="100" step="5" value="${sliderValue}" data-role="volume-slider">
                </div>
                <div class="screen-actions">
                    <button class="dom-button" data-action="mute-toggle">${sliderValue === 0 ? "Unmute" : "Mute"}</button>
                    <button class="dom-button is-primary" data-action="close-settings">Close</button>
                </div>
            </div>
        `;

        modal.addEventListener("click", (event) => {
            if (event.target === modal) onClose();
        });

        modal.querySelector("[data-role='volume-slider']")?.addEventListener("input", (event) => {
            const value = Number(event.target.value);
            soundManager?.setMasterVolume?.(value / 100);
            modal.querySelector("[data-role='volume-value']").textContent = `${value}%`;
            modal.querySelector("[data-action='mute-toggle']").textContent = value === 0 ? "Unmute" : "Mute";
        });

        modal.querySelector("[data-action='mute-toggle']")?.addEventListener("click", () => {
            const nextValue = (soundManager?.masterVolume ?? 0) > 0 ? 0 : 0.6;
            soundManager?.setMasterVolume?.(nextValue);
            const percentage = Math.round(nextValue * 100);
            modal.querySelector("[data-role='volume-slider']").value = String(percentage);
            modal.querySelector("[data-role='volume-value']").textContent = `${percentage}%`;
            modal.querySelector("[data-action='mute-toggle']").textContent = percentage === 0 ? "Unmute" : "Mute";
        });

        modal.querySelector("[data-action='close-settings']")?.addEventListener("click", onClose);
        this.root.appendChild(modal);
    }

    showGame(callbacks = {}) {
        if (!this.root) return;

        this.hide();
        this.mode = "game";
        this.callbacks = callbacks;
        this.root.classList.add("is-visible");
        this.root.innerHTML = `
            <div class="game-ui" data-mode="game">
                <div class="game-ui-top">
                    <div class="game-ui-card">
                        <div class="game-ui-card-label gold">Gold</div>
                        <div class="game-ui-card-value" data-slot="gold"></div>
                    </div>
                    <div class="game-ui-card">
                        <div class="game-ui-card-label lives">Lives</div>
                        <div class="game-ui-card-value" data-slot="lives"></div>
                    </div>
                    <div class="game-ui-card">
                        <div class="game-ui-card-label wave">Wave</div>
                        <div class="game-ui-card-value" data-slot="wave"></div>
                    </div>
                    <div class="game-ui-card game-ui-stage">
                        <div>
                            <div class="game-ui-stage-name" data-slot="levelName"></div>
                            <div class="game-ui-stage-sub" data-slot="bonus"></div>
                        </div>
                        <div class="game-ui-pressure">
                            <div class="game-ui-pressure-label">Wave pressure</div>
                            <div class="game-ui-pressure-track"><div class="game-ui-pressure-fill" data-slot="pressureFill"></div></div>
                        </div>
                    </div>
                </div>
                <aside class="game-ui-sidebar game-ui-panel">
                    <div class="game-ui-panel-title">Command Panel</div>
                    <div class="game-ui-panel-name" data-slot="panelName"></div>
                    <div class="game-ui-panel-role" data-slot="panelRole"></div>
                    <div class="game-ui-panel-ability" data-slot="panelAbility"></div>
                    <div class="game-ui-stats-grid">
                        <div class="game-ui-stat"><div class="game-ui-stat-label">Damage</div><div class="game-ui-stat-value" data-slot="damage"></div></div>
                        <div class="game-ui-stat"><div class="game-ui-stat-label">Range</div><div class="game-ui-stat-value" data-slot="range"></div></div>
                        <div class="game-ui-stat"><div class="game-ui-stat-label">Rate</div><div class="game-ui-stat-value" data-slot="rate"></div></div>
                        <div class="game-ui-stat"><div class="game-ui-stat-label" data-slot="costLabel">Cost</div><div class="game-ui-stat-value" data-slot="costValue"></div></div>
                    </div>
                    <div class="game-ui-invested" data-slot="invested"></div>
                    <div class="game-ui-upgrades" data-slot="upgrades"></div>
                    <div class="game-ui-panel-copy" data-slot="panelCopy"></div>
                </aside>
                <div class="game-ui-dock" data-slot="dock"></div>
                <div data-slot="modal"></div>
            </div>
        `;
        this.bind();
    }

    bind() {
        this.root?.addEventListener("click", this.handleClick);
    }

    unbind() {
        this.root?.removeEventListener("click", this.handleClick);
    }

    attachRootClick(handler) {
        if (!this.root) return;
        this.root.onclick = handler;
    }

    handleClick(event) {
        const target = event.target.closest("[data-action]");
        if (!target) return;

        const action = target.dataset.action;
        const value = target.dataset.value;

        if (action === "tower" && this.callbacks.onSelectTowerType) {
            this.callbacks.onSelectTowerType(value);
        }
        if (action === "upgrade" && this.callbacks.onUpgrade) {
            this.callbacks.onUpgrade(value);
        }
        if (action === "sell" && this.callbacks.onSell) {
            this.callbacks.onSell();
        }
        if (action === "overlay" && this.callbacks.onOverlayAction) {
            this.callbacks.onOverlayAction(value);
        }
    }

    updateGame(state) {
        if (this.mode !== "game" || !this.root) return;

        const panelState = this.buildPanelState(state);
        const key = JSON.stringify({
            gold: state.gold,
            lives: state.lives,
            wave: state.waveIndex,
            level: state.levelName,
            selectedType: state.selectedType,
            selectedTower: state.selectedTowerSummary,
            gameOver: state.gameOver,
            victory: state.victory,
            upgrades: panelState.upgrades,
            dock: state.buttons.map((button) => `${button.type}:${button.selected}`).join("|")
        });

        if (key === this.stateKey) return;
        this.stateKey = key;

        this.root.querySelector('[data-slot="gold"]').textContent = `${state.gold}`;
        this.root.querySelector('[data-slot="lives"]').textContent = `${state.lives}`;
        this.root.querySelector('[data-slot="wave"]').textContent = `${state.waveIndex}/${state.totalWaves}`;
        this.root.querySelector('[data-slot="levelName"]').textContent = state.levelName;
        this.root.querySelector('[data-slot="bonus"]').textContent = `Next clear bonus ${state.pendingWaveBonus}`;
        this.root.querySelector('[data-slot="pressureFill"]').style.width = `${Math.max(10, Math.min(100, state.pressure * 100))}%`;

        this.root.querySelector('[data-slot="panelName"]').textContent = panelState.name;
        this.root.querySelector('[data-slot="panelRole"]').textContent = panelState.role;
        this.root.querySelector('[data-slot="panelAbility"]').textContent = panelState.ability;
        this.root.querySelector('[data-slot="damage"]').textContent = `${panelState.damage}`;
        this.root.querySelector('[data-slot="range"]').textContent = `${panelState.range}`;
        this.root.querySelector('[data-slot="rate"]').textContent = `${panelState.rate}`;
        this.root.querySelector('[data-slot="costLabel"]').textContent = panelState.costLabel;
        this.root.querySelector('[data-slot="costValue"]').textContent = `${panelState.costValue}`;
        this.root.querySelector('[data-slot="invested"]').textContent = panelState.invested;
        this.root.querySelector('[data-slot="panelCopy"]').textContent = panelState.copy;

        this.root.querySelector('[data-slot="upgrades"]').innerHTML = panelState.upgrades.map((upgrade) => {
            const disabled = upgrade.disabled ? "disabled" : "";
            const extraClass = upgrade.kind === "sell" ? " sell" : "";
            return `<button class="game-ui-upgrade${extraClass}" data-action="${upgrade.action}" data-value="${upgrade.value ?? ""}" ${disabled}>${upgrade.label}</button>`;
        }).join("");

        this.root.querySelector('[data-slot="dock"]').innerHTML = state.buttons.map((button) => {
            const meta = TOWER_METADATA[button.type];
            return `
                <button class="game-ui-dock-item${button.selected ? " active" : ""}" data-action="tower" data-value="${button.type}">
                    <div class="game-ui-dock-top">
                        <div class="game-ui-dock-code" style="color:${meta.accent}">${meta.shortLabel}</div>
                        <div class="game-ui-dock-dot" style="background:${meta.accent}"></div>
                    </div>
                    <div class="game-ui-dock-name">${meta.label}</div>
                    <div class="game-ui-dock-role">${meta.role}</div>
                    <div class="game-ui-dock-cost">${button.cost} gold</div>
                </button>
            `;
        }).join("");

        this.root.querySelector('[data-slot="modal"]').innerHTML = this.buildModal(state);
    }

    buildPanelState(state) {
        if (state.selectedTowerSummary) {
            const tower = state.selectedTowerSummary;
            const upgrades = tower.upgrades.map((upgrade) => ({
                kind: "upgrade",
                action: "upgrade",
                value: upgrade.id,
                label: upgrade.label,
                disabled: !upgrade.affordable
            }));

            upgrades.push({
                kind: "sell",
                action: "sell",
                label: `Sell Tower +${tower.sellValue}`,
                disabled: false
            });

            return {
                name: tower.name,
                role: `Level ${tower.level} ${tower.role}`,
                ability: tower.ability,
                damage: tower.damage,
                range: tower.range,
                rate: tower.rate,
                costLabel: "Sell",
                costValue: tower.sellValue,
                invested: `Upgrade cost ${tower.upgradeCostText} • Invested ${tower.invested}`,
                upgrades,
                copy: "Click a highlighted build circle to place, or select another tower to compare stats."
            };
        }

        const preview = new Tower(0, 0, state.selectedType);
        const meta = TOWER_METADATA[state.selectedType];
        return {
            name: preview.name,
            role: meta.role,
            ability: preview.getAbilitySummary(),
            damage: Math.round(preview.damage),
            range: Math.round(preview.range),
            rate: preview.rate.toFixed(2),
            costLabel: "Cost",
            costValue: preview.baseCost,
            invested: "Placement preview",
            upgrades: [],
            copy: "Move to a highlighted build circle to preview range, then click once to place the active tower."
        };
    }

    buildModal(state) {
        if (!state.gameOver && !state.victory) return "";

        const title = state.victory ? "Victory" : "Defeat";
        const copy = state.victory
            ? "The route is secure. Choose your next move and keep the campaign pushing forward."
            : "The line broke this round. Restart, adjust your build, and try the route again.";

        return `
            <div class="game-ui-modal-wrap">
                <div class="game-ui-modal">
                    <div class="game-ui-modal-title">${title}</div>
                    <div class="game-ui-modal-copy">${copy}</div>
                    <div class="game-ui-modal-actions">
                        <button class="game-ui-button" data-action="overlay" data-value="restart">Restart</button>
                        <button class="game-ui-button" data-action="overlay" data-value="levels">Levels</button>
                        <button class="game-ui-button" data-action="overlay" data-value="menu">Menu</button>
                    </div>
                </div>
            </div>
        `;
    }
}
