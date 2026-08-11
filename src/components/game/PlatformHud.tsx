import type { PlatformGameState } from '../../lib/platformTypes';

type PlatformHudProps = {
  state: PlatformGameState;
  onRestart: () => void;
};

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const leftover = seconds % 60;
  return `${minutes}:${leftover.toString().padStart(2, '0')}`;
}

export function PlatformHud({ state, onRestart }: PlatformHudProps) {
  const timer = state.bossTimeLeft > 0 ? formatTime(state.bossTimeLeft) : `${state.floorTimeLeft}s`;

  return (
    <aside className="platform-hud">
      <div>
        <p className="eyebrow">Last Lift</p>
        <h1>Floor {state.floor}/100</h1>
      </div>

      <div className="health-shell" aria-label="Health">
        <div className="health-fill" style={{ width: `${state.player.hp}%` }} />
      </div>
      <div className="stamina-shell" aria-label="Stamina">
        <div className="stamina-fill" style={{ width: `${state.player.stamina}%` }} />
      </div>

      <div className="platform-stats">
        <span>Power {state.batteries}/{state.batteriesNeeded}</span>
        <span>Coins {state.coins}</span>
        <span>Double jump {state.doubleJumpUnlocked ? 'owned' : 'locked'}</span>
        <span>Stones {state.infinityStones}/6</span>
        <span>Gauntlet {state.gauntletOwned ? 'owned' : 'locked'}</span>
        <span>Flashlights {state.flashlights}</span>
        <span>Gun {state.hasGun ? (state.unlimitedGun ? 'unlimited' : `${state.shots} shots`) : 'none'}</span>
        <span>Mode {state.mode}</span>
        <span>Move {state.player.running ? 'running' : 'walking'}</span>
        <span>Stamina {Math.round(state.player.stamina)}%</span>
        <span>Enemies {state.enemies.length}</span>
        <span>Timer {timer}</span>
      </div>

      <p className={`game-message ${state.status}`}>{state.message}</p>

      <div className="controls-card">
        <p>A/D or arrows: walk</p>
        <p>Shift: toggle run</p>
        <p>W/Up/Space: jump</p>
        <p>Shop upgrade: Space or I double jumps</p>
        <p>J: hit nearby enemies</p>
        <p>Double Space in air: slam</p>
        <p>E near door: enter room</p>
        <p>Vent floors: E under ceiling hole</p>
        <p>E inside room: open drawer, O: leave</p>
        <p>Q: blind bots, F: shoot guard</p>
        <p>Boss: G uses full gauntlet</p>
        <p>Train duel: Space focus, mouse/trackpad aim, F mark</p>
      </div>

      <button type="button" onClick={onRestart}>Restart</button>
    </aside>
  );
}
