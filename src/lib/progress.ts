import type { EndingKind } from './platformTypes';

const coinsKey = 'last-lift-coins';
const doubleJumpKey = 'last-lift-double-jump';
const infinityGauntletKey = 'last-lift-infinity-gauntlet';
const endingsKey = 'last-lift-endings';

export type SavedEnding = Exclude<EndingKind, null>;

export const endingLabels: Record<SavedEnding, string> = {
  ruler: 'Ruler',
  'half-universe': 'Half Universe',
  sunset: 'Sunset',
  superhero: 'Superhero',
  'last-stand': 'Last Stand',
  escape: 'Escape',
};

export const doubleJumpCost = 3;
export const infinityGauntletCost = 100;

function storage() {
  return typeof window === 'undefined' ? null : window.localStorage;
}

export function getCoins() {
  const saved = storage()?.getItem(coinsKey);
  return saved ? Number.parseInt(saved, 10) || 0 : 0;
}

export function setCoins(coins: number) {
  storage()?.setItem(coinsKey, String(Math.max(0, coins)));
}

export function awardFloorCoin() {
  return awardCoins(1);
}

export function awardCoins(amount: number) {
  const coins = getCoins() + amount;
  setCoins(coins);
  return coins;
}

export function hasDoubleJump() {
  return storage()?.getItem(doubleJumpKey) === 'yes';
}

export function buyDoubleJump() {
  if (hasDoubleJump() || getCoins() < doubleJumpCost) return false;
  setCoins(getCoins() - doubleJumpCost);
  storage()?.setItem(doubleJumpKey, 'yes');
  return true;
}

export function hasInfinityGauntlet() {
  return storage()?.getItem(infinityGauntletKey) === 'yes';
}

export function buyInfinityGauntlet() {
  if (hasInfinityGauntlet() || getCoins() < infinityGauntletCost) return false;
  setCoins(getCoins() - infinityGauntletCost);
  storage()?.setItem(infinityGauntletKey, 'yes');
  return true;
}

export function getSavedEndings() {
  const saved = storage()?.getItem(endingsKey);
  if (!saved) return [];

  try {
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSavedEnding);
  } catch {
    return [];
  }
}

export function saveEnding(ending: EndingKind) {
  if (!ending) return getSavedEndings();
  const endings = getSavedEndings();
  if (endings.includes(ending)) return endings;
  const next = [...endings, ending];
  storage()?.setItem(endingsKey, JSON.stringify(next));
  return next;
}

function isSavedEnding(value: unknown): value is SavedEnding {
  return typeof value === 'string' && value in endingLabels;
}
