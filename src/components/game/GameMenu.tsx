import { doubleJumpCost, infinityGauntletCost } from '../../lib/progress';

type GameMenuProps = {
  view: 'menu' | 'credits' | 'help' | 'shop';
  onView: (view: 'menu' | 'credits' | 'help' | 'shop') => void;
  onPlay: () => void;
  coins: number;
  doubleJumpUnlocked: boolean;
  infinityGauntletUnlocked: boolean;
  onBuyDoubleJump: () => void;
  onBuyInfinityGauntlet: () => void;
};

export function GameMenu({
  view,
  onView,
  onPlay,
  coins,
  doubleJumpUnlocked,
  infinityGauntletUnlocked,
  onBuyDoubleJump,
  onBuyInfinityGauntlet,
}: GameMenuProps) {
  return (
    <main className="menu-screen">
      <section className="menu-panel">
        <p className="eyebrow">Last Lift</p>
        <h1>Last Lift</h1>
        {view === 'menu' && (
          <div className="menu-actions">
            <button type="button" onClick={onPlay}>Play</button>
            <button type="button" onClick={() => onView('shop')}>Shop</button>
            <button type="button" onClick={() => onView('help')}>How to Play</button>
            <button type="button" onClick={() => onView('credits')}>Credits</button>
          </div>
        )}
        {view === 'shop' && (
          <div className="menu-copy">
            <p>Coins: {coins}</p>
            <div className="shop-item">
              <div>
                <strong>Double Jump</strong>
                <p>Jump again in the air with Space or I.</p>
              </div>
              <button type="button" disabled={doubleJumpUnlocked || coins < doubleJumpCost} onClick={onBuyDoubleJump}>
                {doubleJumpUnlocked ? 'Owned' : `${doubleJumpCost} coins`}
              </button>
            </div>
            <div className="shop-item">
              <div>
                <strong>Infinity Gauntlet</strong>
                <p>A forbidden trophy from the roof boss.</p>
              </div>
              <button type="button" disabled={infinityGauntletUnlocked || coins < infinityGauntletCost} onClick={onBuyInfinityGauntlet}>
                {infinityGauntletUnlocked ? 'Owned' : `${infinityGauntletCost} coins`}
              </button>
            </div>
            <button type="button" onClick={() => onView('menu')}>Back</button>
          </div>
        )}
        {view === 'help' && (
          <div className="menu-copy">
            <p>Climb 100 abandoned hotel floors. Some floors have lava, floods, blackouts, swarms, collapses, or supplies.</p>
            <p>A/D move, Shift runs, Space jumps, J hits, I double jumps when owned, E enters/searches rooms.</p>
            <button type="button" onClick={() => onView('menu')}>Back</button>
          </div>
        )}
        {view === 'credits' && (
          <div className="menu-copy">
            <p>Created by the Last Lift team.</p>
            <p>Design, code, and chaos: you + Codex.</p>
            <button type="button" onClick={() => onView('menu')}>Back</button>
          </div>
        )}
      </section>
    </main>
  );
}
