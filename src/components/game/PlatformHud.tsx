import lightningPowerUrl from '../../assets/lightning-power.jpg';
import type { PlatformGameState } from '../../lib/platformTypes';

type PlatformHudProps = {
  state: PlatformGameState;
  onRestart: () => void;
  onMenu: () => void;
  tutorialMode: boolean;
};

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const leftover = seconds % 60;
  return `${minutes}:${leftover.toString().padStart(2, '0')}`;
}

export function PlatformHud({ state, onRestart, onMenu, tutorialMode }: PlatformHudProps) {
  const timer = state.bossTimeLeft > 0 ? formatTime(state.bossTimeLeft) : `${state.floorTimeLeft}s`;
  const loaded = state.reloadTimer > 0 ? 'reload' : `${state.revolverLoaded}/6`;
  const bullets = state.hasGun ? (state.unlimitedGun ? `Unlimited (${loaded})` : `${state.shots} (${loaded})`) : 'None';
  const maxHealth = state.player.maxHp;
  const healthWidth = Math.min(100, (state.player.hp / maxHealth) * 100);

  return (
    <aside className="platform-hud" aria-label="Game status">
      <div className="hud-bars">
        <div className="meter-row">
          <span>Health</span>
          <strong>{Math.round(state.player.hp)}/{maxHealth}</strong>
        </div>
        <div className="health-shell" aria-label="Health">
          <div className="health-fill" style={{ width: `${healthWidth}%` }} />
        </div>
        <div className="meter-row">
          <span>Stamina</span>
          <strong>{Math.round(state.player.stamina)}%</strong>
        </div>
        <div className="stamina-shell" aria-label="Stamina">
          <div className="stamina-fill" style={{ width: `${state.player.stamina}%` }} />
        </div>
      </div>

      <div className="hud-items">
        <strong>Floor {state.floor}/100</strong>
        <div className="resource-row">
          <span className="power-label">
            <img src={lightningPowerUrl} alt="" />
            Power
          </span>
          <strong>{state.batteries}/{state.batteriesNeeded}</strong>
        </div>
        <div className="resource-row">
          <span>Medkit</span>
          <strong>{state.medkits}</strong>
        </div>
        <div className="resource-row">
          <span>Light</span>
          <strong>{state.flashlights}</strong>
        </div>
        <div className="resource-row">
          <span>Bullets</span>
          <strong>{bullets}</strong>
        </div>
        <div className="resource-row">
          <span>Timer</span>
          <strong>{timer}</strong>
        </div>
      </div>

      <p className={`game-message ${state.status}`}>{tutorialMode ? `Tutorial: ${state.message}` : state.message}</p>

      <div className="hud-menu">
        <button type="button" onClick={onRestart}>Restart</button>
        <button type="button" onClick={onMenu}>Menu</button>
      </div>
    </aside>
  );
}
