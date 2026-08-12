import { useEffect, useRef, useState } from 'react';
import { GameMenu } from '../components/game/GameMenu';
import { PlatformCanvas } from '../components/game/PlatformCanvas';
import { PlatformHud } from '../components/game/PlatformHud';
import { createLevel, initialPlatformState } from '../lib/platformLevel';
import { triggerMeteorThrow, updatePlatformGame } from '../lib/platformPhysics';
import { tickGameTimers } from '../lib/platformTimers';
import { buyDoubleJump, buyInfinityGauntlet, getCoins, getSavedEndings, hasDoubleJump, hasInfinityGauntlet, saveEnding } from '../lib/progress';
import type { InputState, PlatformGameState } from '../lib/platformTypes';

const emptyInput: InputState = {
  left: false,
  right: false,
  jump: false,
  jumpPressed: false,
  doubleJumpPressed: false,
  down: false,
  slamPressed: false,
  hitPressed: false,
  interactPressed: false,
  leavePressed: false,
  flashlightPressed: false,
  shootPressed: false,
  runPressed: false,
  shortcutPressed: false,
  gauntletPressed: false,
  aimX: null,
  aimY: null,
};

export function GamePage() {
  const [screen, setScreen] = useState<'menu' | 'credits' | 'help' | 'shop' | 'game'>('menu');
  const [progress, setProgress] = useState(() => ({
    coins: getCoins(),
    doubleJump: hasDoubleJump(),
    gauntlet: hasInfinityGauntlet(),
    endings: getSavedEndings(),
  }));
  const [state, setState] = useState<PlatformGameState>(initialPlatformState);
  const inputRef = useRef<InputState>({ ...emptyInput });
  const lastJumpRef = useRef(0);
  const spaceDownRef = useRef(false);
  const refreshProgress = () => setProgress({
    coins: getCoins(),
    doubleJump: hasDoubleJump(),
    gauntlet: hasInfinityGauntlet(),
    endings: getSavedEndings(),
  });

  useEffect(() => {
    if (screen !== 'game') return;
    const setKey = (event: KeyboardEvent, pressed: boolean) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(event.key) || event.code === 'Space') {
        event.preventDefault();
      }
      if (['ArrowLeft', 'a', 'A'].includes(event.key)) inputRef.current.left = pressed;
      if (['ArrowRight', 'd', 'D'].includes(event.key)) inputRef.current.right = pressed;
      if (['ArrowUp', 'w', 'W'].includes(event.key) || event.code === 'Space') inputRef.current.jump = pressed;
      if (pressed && ['ArrowUp', 'w', 'W'].includes(event.key)) inputRef.current.jumpPressed = true;
      if (pressed && ['i', 'I'].includes(event.key)) inputRef.current.doubleJumpPressed = true;
      if (['ArrowDown', 's', 'S'].includes(event.key)) inputRef.current.down = pressed;
      if (event.code === 'Space' && !pressed) spaceDownRef.current = false;
      if (pressed && event.code === 'Space' && !spaceDownRef.current) {
        spaceDownRef.current = true;
        inputRef.current.jumpPressed = true;
        const now = performance.now();
        if (now - lastJumpRef.current < 650) inputRef.current.slamPressed = true;
        lastJumpRef.current = now;
      }
      if (pressed && ['j', 'J'].includes(event.key)) inputRef.current.hitPressed = true;
      if (pressed && ['e', 'E'].includes(event.key)) inputRef.current.interactPressed = true;
      if (pressed && ['o', 'O'].includes(event.key)) inputRef.current.leavePressed = true;
      if (pressed && ['q', 'Q'].includes(event.key)) inputRef.current.flashlightPressed = true;
      if (pressed && ['f', 'F'].includes(event.key)) inputRef.current.shootPressed = true;
      if (pressed && ['c', 'C'].includes(event.key)) inputRef.current.shortcutPressed = true;
      if (pressed && ['g', 'G'].includes(event.key)) inputRef.current.gauntletPressed = true;
      if (pressed && event.key === 'Shift') inputRef.current.runPressed = true;
    };
    const onKeyDown = (event: KeyboardEvent) => setKey(event, true);
    const onKeyUp = (event: KeyboardEvent) => setKey(event, false);

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [screen]);

  useEffect(() => {
    if (screen !== 'game') return;
    let frame = 0;
    let last = performance.now();

    const loop = (time: number) => {
      const dt = Math.min(0.03, (time - last) / 1000);
      last = time;
      const input = { ...inputRef.current };
      setState((current) => updatePlatformGame(current, input, dt));
      inputRef.current.slamPressed = false;
      inputRef.current.jumpPressed = false;
      inputRef.current.doubleJumpPressed = false;
      inputRef.current.hitPressed = false;
      inputRef.current.interactPressed = false;
      inputRef.current.leavePressed = false;
      inputRef.current.flashlightPressed = false;
      inputRef.current.shootPressed = false;
      inputRef.current.runPressed = false;
      inputRef.current.shortcutPressed = false;
      inputRef.current.gauntletPressed = false;
      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [screen]);

  useEffect(() => {
    if (screen !== 'game') return;
    const timer = window.setInterval(() => setState(tickGameTimers), 1000);
    return () => window.clearInterval(timer);
  }, [screen]);

  useEffect(() => {
    if (state.status !== 'won' || !state.ending) return;
    setProgress((current) => ({ ...current, endings: saveEnding(state.ending) }));
  }, [state.status, state.ending]);

  if (screen !== 'game') {
    return (
      <GameMenu
        view={screen}
        onView={setScreen}
        coins={progress.coins}
        endings={progress.endings}
        doubleJumpUnlocked={progress.doubleJump}
        infinityGauntletUnlocked={progress.gauntlet}
        onBuyDoubleJump={() => {
          buyDoubleJump();
          refreshProgress();
        }}
        onBuyInfinityGauntlet={() => {
          buyInfinityGauntlet();
          refreshProgress();
        }}
        onPlay={() => {
          refreshProgress();
          setState(createLevel(1));
          setScreen('game');
        }}
      />
    );
  }

  return (
    <main className="platform-shell">
      <PlatformHud state={state} onRestart={() => setState(createLevel(1))} />
      <PlatformCanvas
        state={state}
        onAim={(x, y) => {
          inputRef.current.aimX = x;
          inputRef.current.aimY = y;
        }}
        onMeteorClick={(x, y) => setState((current) => triggerMeteorThrow(current, x, y))}
      />
    </main>
  );
}
