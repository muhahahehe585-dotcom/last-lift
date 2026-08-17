import type { InputState } from './platformTypes';

type TutorialStep = {
  prompt: string;
  done: (input: InputState) => boolean;
};

export const tutorialSteps: TutorialStep[] = [
  { prompt: 'Press A or Left Arrow to walk left.', done: (input) => input.left },
  { prompt: 'Press D or Right Arrow to walk right.', done: (input) => input.right },
  { prompt: 'Press W, Up Arrow, or Space to jump.', done: (input) => input.jumpPressed },
  { prompt: 'Press Shift to toggle run.', done: (input) => input.runPressed },
  { prompt: 'Press J to hit.', done: (input) => input.hitPressed },
  { prompt: 'Press Q to stun bots with the flashlight.', done: (input) => input.flashlightPressed },
  { prompt: 'Press F to shoot the revolver.', done: (input) => input.shootPressed },
  { prompt: 'Press M to use a medkit.', done: (input) => input.medkitPressed },
  { prompt: 'Press E to interact with doors, rooms, and vents.', done: (input) => input.interactPressed },
  { prompt: 'Press I in the air to double jump.', done: (input) => input.doubleJumpPressed },
  { prompt: 'Press S or Down Arrow to crouch/drop.', done: (input) => input.down },
];

export function tutorialMessage(step: number) {
  const current = tutorialSteps[step];
  if (!current) return 'Tutorial complete. You know the buttons now.';
  return `Step ${step + 1}/${tutorialSteps.length}: ${current.prompt}`;
}

export function nextTutorialStep(step: number, input: InputState) {
  const current = tutorialSteps[step];
  if (!current || !current.done(input)) return step;
  return step + 1;
}
