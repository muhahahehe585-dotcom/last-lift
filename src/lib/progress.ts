import type { EndingKind } from './platformTypes';
import { isSupabaseConfigured, supabase } from './supabase';

const coinsKey = 'last-lift-coins';
const doubleJumpKey = 'last-lift-double-jump';
const infinityGauntletKey = 'last-lift-infinity-gauntlet';
const endingsKey = 'last-lift-endings';

type ProgressState = {
  coins: number;
  doubleJump: boolean;
  gauntlet: boolean;
  endings: SavedEnding[];
};

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

let progressCache: ProgressState = readLocalProgress();

function storage() {
  return typeof window === 'undefined' ? null : window.localStorage;
}

export function getCoins() {
  return progressCache.coins;
}

export function setCoins(coins: number) {
  updateProgress({ coins: Math.max(0, coins) });
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
  return progressCache.doubleJump;
}

export function buyDoubleJump() {
  if (hasDoubleJump() || getCoins() < doubleJumpCost) return false;
  updateProgress({ coins: getCoins() - doubleJumpCost, doubleJump: true });
  return true;
}

export function hasInfinityGauntlet() {
  return progressCache.gauntlet;
}

export function buyInfinityGauntlet() {
  if (hasInfinityGauntlet() || getCoins() < infinityGauntletCost) return false;
  updateProgress({ coins: getCoins() - infinityGauntletCost, gauntlet: true });
  return true;
}

export function getSavedEndings() {
  return progressCache.endings;
}

export function saveEnding(ending: EndingKind) {
  if (!ending) return getSavedEndings();
  const endings = getSavedEndings();
  if (endings.includes(ending)) return endings;
  const next = [...endings, ending];
  updateProgress({ endings: next });
  return next;
}

export async function loadProgress() {
  const local = readLocalProgress();
  if (!isSupabaseConfigured) {
    progressCache = local;
    return progressCache;
  }

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    progressCache = local;
    return progressCache;
  }

  const { data } = await supabase
    .from('game_progress')
    .select('coins,double_jump_unlocked,infinity_gauntlet_unlocked,endings')
    .eq('user_id', auth.user.id)
    .maybeSingle();

  const remote: ProgressState = data
    ? {
        coins: data.coins,
        doubleJump: data.double_jump_unlocked,
        gauntlet: data.infinity_gauntlet_unlocked,
        endings: data.endings.filter(isSavedEnding),
      }
    : { coins: 0, doubleJump: false, gauntlet: false, endings: [] };

  progressCache = mergeProgress(local, remote);
  writeLocalProgress(progressCache);
  await saveProgressToSupabase();
  return progressCache;
}

function readLocalProgress(): ProgressState {
  const saved = storage()?.getItem(endingsKey);
  return {
    coins: readLocalCoins(),
    doubleJump: storage()?.getItem(doubleJumpKey) === 'yes',
    gauntlet: storage()?.getItem(infinityGauntletKey) === 'yes',
    endings: readLocalEndings(saved),
  };
}

function readLocalCoins() {
  const saved = storage()?.getItem(coinsKey);
  return saved ? Number.parseInt(saved, 10) || 0 : 0;
}

function readLocalEndings(saved: string | null | undefined) {
  if (!saved) return [];
  try {
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSavedEnding);
  } catch {
    return [];
  }
}

function updateProgress(next: Partial<ProgressState>) {
  progressCache = { ...progressCache, ...next };
  writeLocalProgress(progressCache);
  void saveProgressToSupabase();
}

function writeLocalProgress(progress: ProgressState) {
  storage()?.setItem(coinsKey, String(progress.coins));
  storage()?.setItem(doubleJumpKey, progress.doubleJump ? 'yes' : 'no');
  storage()?.setItem(infinityGauntletKey, progress.gauntlet ? 'yes' : 'no');
  storage()?.setItem(endingsKey, JSON.stringify(progress.endings));
}

function mergeProgress(local: ProgressState, remote: ProgressState): ProgressState {
  return {
    coins: Math.max(local.coins, remote.coins),
    doubleJump: local.doubleJump || remote.doubleJump,
    gauntlet: local.gauntlet || remote.gauntlet,
    endings: Array.from(new Set([...local.endings, ...remote.endings])),
  };
}

async function saveProgressToSupabase() {
  if (!isSupabaseConfigured) return;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;

  await supabase.from('game_progress').upsert({
    user_id: data.user.id,
    coins: progressCache.coins,
    double_jump_unlocked: progressCache.doubleJump,
    infinity_gauntlet_unlocked: progressCache.gauntlet,
    endings: progressCache.endings,
    updated_at: new Date().toISOString(),
  });
}

function isSavedEnding(value: unknown): value is SavedEnding {
  return typeof value === 'string' && value in endingLabels;
}
