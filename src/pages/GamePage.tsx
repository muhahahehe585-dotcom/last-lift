import { useEffect, useRef, useState } from 'react';
import { GameMenu } from '../components/game/GameMenu';
import { MobileControls } from '../components/game/MobileControls';
import { PlatformCanvas } from '../components/game/PlatformCanvas';
import { PlatformHud } from '../components/game/PlatformHud';
import type { InventoryItem } from '../components/game/actionHitboxArt';
import { createLevel, initialPlatformState } from '../lib/platformLevel';
import { triggerMeteorThrow, updatePlatformGame } from '../lib/platformPhysics';
import { tickGameTimers } from '../lib/platformTimers';
import { buyArmor, buyDoubleJump, buyInfinityGauntlet, consumeArmor, getArmor, getCoins, getSavedEndings, hasDoubleJump, hasInfinityGauntlet, loadProgress, saveEnding, setCoins } from '../lib/progress';
import { chooseTrainBullet, chooseTrainDuel, chooseTrainHealth } from '../lib/trainDuel';
import type { InputState, PlatformGameState } from '../lib/platformTypes';

const emptyInput: InputState = {
  left: false,
  right: false,
  jump: false,
  jumpPressed: false,
  doubleJumpPressed: false,
  down: false,
  slamPressed: false,
  dodgePressed: false,
  hitPressed: false,
  interactPressed: false,
  leavePressed: false,
  flashlightPressed: false,
  medkitPressed: false,
  shootPressed: false,
  runPressed: false,
  shortcutPressed: false,
  gauntletPressed: false,
  aimX: null,
  aimY: null,
};

type HoldControl = 'left' | 'right' | 'jump' | 'down';
type TapControl = 'run' | 'doubleJump' | 'slam' | 'dodge' | 'hit' | 'interact' | 'leave' | 'flashlight' | 'shoot' | 'gauntlet';

export function GamePage() {
  const [screen, setScreen] = useState<'menu' | 'credits' | 'help' | 'shop' | 'game'>('menu');
  const [trainTestMode, setTrainTestMode] = useState(false);
  const [tutorialMode, setTutorialMode] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<InventoryItem>(null);
  const [progress, setProgress] = useState(() => ({
    coins: getCoins(),
    doubleJump: hasDoubleJump(),
    gauntlet: hasInfinityGauntlet(),
    armor: getArmor(),
    endings: getSavedEndings(),
  }));
  const [state, setState] = useState<PlatformGameState>(initialPlatformState);
  const inputRef = useRef<InputState>({ ...emptyInput });
  const trainTestModeRef = useRef(false);
  const tutorialModeRef = useRef(false);
  const tutorialCoinsRef = useRef(0);
  const lastJumpRef = useRef(0);
  const spaceDownRef = useRef(false);
  const refreshProgress = () => setProgress({
    coins: getCoins(),
    doubleJump: hasDoubleJump(),
    gauntlet: hasInfinityGauntlet(),
    armor: getArmor(),
    endings: getSavedEndings(),
  });

  const finishTrainChoice = (choice: (current: PlatformGameState) => PlatformGameState) => {
    setState((current) => {
      const next = choice(current);
      if (trainTestModeRef.current && current.duel && (next.floor !== 11 || next.status !== 'playing')) {
        trainTestModeRef.current = false;
        setTrainTestMode(false);
        setScreen('menu');
        return createLevel(11);
      }
      return next;
    });
  };

  const setMobileHold = (control: HoldControl, pressed: boolean) => {
    inputRef.current[control] = pressed;
    if (control === 'jump' && pressed) inputRef.current.jumpPressed = true;
  };

  const tapMobileControl = (control: TapControl) => {
    if (control === 'run') inputRef.current.runPressed = true;
    if (control === 'doubleJump') inputRef.current.doubleJumpPressed = true;
    if (control === 'slam') inputRef.current.slamPressed = true;
    if (control === 'dodge') inputRef.current.dodgePressed = true;
    if (control === 'hit') inputRef.current.hitPressed = true;
    if (control === 'interact') inputRef.current.interactPressed = true;
    if (control === 'leave') inputRef.current.leavePressed = true;
    if (control === 'gauntlet') inputRef.current.gauntletPressed = true;
  };

  const returnToMenu = () => {
    inputRef.current = { ...emptyInput };
    refreshProgress();
    setTrainTestMode(false);
    setTutorialMode(false);
    setSelectedInventory(null);
    setScreen('menu');
  };

  const startArmoredRun = () => {
    const hasArmor = consumeArmor();
    refreshProgress();
    return createLevel(1, hasArmor ? 180 : 100, { armorCount: getArmor() });
  };

  const startTutorial = () => {
    refreshProgress();
    tutorialCoinsRef.current = getCoins();
    setTrainTestMode(false);
    setTutorialMode(true);
    setSelectedInventory(null);
    setState({
      ...createLevel(1),
      message: 'Tutorial started. You will revive here, but the real game will not do this.',
    });
    setScreen('game');
  };

  const continueTutorial = (current: PlatformGameState) => {
    if (!tutorialModeRef.current) return current;
    if (current.coins !== tutorialCoinsRef.current) setCoins(tutorialCoinsRef.current);
    if (current.floor > 13 || (current.floor >= 13 && current.status === 'won')) {
      setTutorialMode(false);
      setScreen('menu');
      refreshProgress();
      return {
        ...createLevel(1),
        message: 'Tutorial complete. Floors 1-13 are practiced. Normal mode is dangerous now.',
      };
    }
    if (current.status !== 'lost') return current;
    return {
      ...createLevel(current.floor),
      message: 'Revived for tutorial. In the real game, dying sends you back to the lobby.',
    };
  };

  const selectInventory = (item: InventoryItem) => {
    setSelectedInventory((current) => (current === item ? null : item));
  };

  const useSelectedInventory = (x: number, y: number) => {
    inputRef.current.aimX = x;
    inputRef.current.aimY = y;
    if (selectedInventory === 'gun') inputRef.current.shootPressed = true;
    if (selectedInventory === 'medkit') inputRef.current.medkitPressed = true;
    if (selectedInventory === 'flashlight') inputRef.current.flashlightPressed = true;
  };

  useEffect(() => {
    trainTestModeRef.current = trainTestMode;
  }, [trainTestMode]);

  useEffect(() => {
    tutorialModeRef.current = tutorialMode;
  }, [tutorialMode]);

  useEffect(() => {
    loadProgress().then(() => {
      refreshProgress();
      setState((current) => ({
        ...current,
        coins: getCoins(),
        armorCount: getArmor(),
        doubleJumpUnlocked: hasDoubleJump(),
        gauntletOwned: hasInfinityGauntlet(),
      }));
    });
  }, []);

  useEffect(() => {
    if (screen !== 'game') return;
    const setKey = (event: KeyboardEvent, pressed: boolean) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(event.key) || event.code === 'Space') {
        event.preventDefault();
      }
      const wantsMenu = event.key === '0' || event.code === 'Digit0' || event.code === 'Numpad0';
      if (pressed && wantsMenu) {
        event.preventDefault();
        returnToMenu();
        return;
      }
      if (['ArrowLeft', 'a', 'A'].includes(event.key)) inputRef.current.left = pressed;
      if (['ArrowRight', 'd', 'D'].includes(event.key)) inputRef.current.right = pressed;
      if (['ArrowUp', 'w', 'W'].includes(event.key) || event.code === 'Space') inputRef.current.jump = pressed;
      if (pressed && ['ArrowUp', 'w', 'W'].includes(event.key)) inputRef.current.jumpPressed = true;
      if (pressed && ['w', 'W'].includes(event.key)) inputRef.current.dodgePressed = true;
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
      setState((current) => {
        const next = updatePlatformGame(current, input, dt);
        const tutorialNext = continueTutorial(next);
        if (tutorialNext !== next) return tutorialNext;
        if (trainTestModeRef.current && current.duel && (next.floor !== 11 || next.status !== 'playing')) {
          trainTestModeRef.current = false;
          setTrainTestMode(false);
          setScreen('menu');
          return createLevel(11);
        }
        return next;
      });
      inputRef.current.slamPressed = false;
      inputRef.current.dodgePressed = false;
      inputRef.current.jumpPressed = false;
      inputRef.current.doubleJumpPressed = false;
      inputRef.current.hitPressed = false;
      inputRef.current.interactPressed = false;
      inputRef.current.leavePressed = false;
      inputRef.current.flashlightPressed = false;
      inputRef.current.medkitPressed = false;
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
    const timer = window.setInterval(() => setState((current) => continueTutorial(tickGameTimers(current))), 1000);
    return () => window.clearInterval(timer);
  }, [screen]);

  useEffect(() => {
    if (state.status !== 'won' || !state.ending) return;
    setProgress((current) => ({ ...current, endings: saveEnding(state.ending) }));
  }, [state.status, state.ending]);

  useEffect(() => {
    if (!trainTestMode || screen !== 'game') return;
    if (state.floor === 11 && state.status === 'playing') return;
    refreshProgress();
    setTrainTestMode(false);
    setScreen('menu');
  }, [screen, state.floor, state.status, trainTestMode]);

  if (screen !== 'game') {
    return (
      <GameMenu
        view={screen}
        onView={setScreen}
        coins={progress.coins}
        endings={progress.endings}
        doubleJumpUnlocked={progress.doubleJump}
        infinityGauntletUnlocked={progress.gauntlet}
        armorCount={progress.armor}
        onBuyDoubleJump={() => {
          buyDoubleJump();
          refreshProgress();
        }}
        onBuyInfinityGauntlet={() => {
          buyInfinityGauntlet();
          refreshProgress();
        }}
        onBuyArmor={() => {
          buyArmor();
          refreshProgress();
        }}
        onPlay={() => {
          setTrainTestMode(false);
          setTutorialMode(false);
          setState(startArmoredRun());
          setScreen('game');
        }}
        onTutorial={startTutorial}
        onTrainDuel={() => {
          refreshProgress();
          setTrainTestMode(true);
          setTutorialMode(false);
          setState(createLevel(11));
          setScreen('game');
        }}
      />
    );
  }

  return (
    <main className="platform-shell">
      <PlatformHud
        state={state}
        onRestart={() => setState(createLevel(trainTestMode ? 11 : 1))}
        onMenu={returnToMenu}
        tutorialMode={tutorialMode}
      />
      <PlatformCanvas
        state={state}
        onAim={(x, y) => {
          inputRef.current.aimX = x;
          inputRef.current.aimY = y;
        }}
        onMeteorClick={(x, y) => setState((current) => triggerMeteorThrow(current, x, y))}
        onTrainBullet={() => finishTrainChoice(chooseTrainBullet)}
        onTrainHealth={() => finishTrainChoice(chooseTrainHealth)}
        onTrainDuel={() => setState(chooseTrainDuel)}
        selectedInventory={selectedInventory}
        onUseInventory={useSelectedInventory}
      />
      <MobileControls
        flashlights={state.flashlights}
        medkits={state.medkits}
        bullets={state.unlimitedGun ? 'unlimited' : state.shots}
        hasGun={state.hasGun}
        selectedInventory={selectedInventory}
        onHold={setMobileHold}
        onTap={tapMobileControl}
        onSelectInventory={selectInventory}
        onMenu={returnToMenu}
      />
    </main>
  );
}
