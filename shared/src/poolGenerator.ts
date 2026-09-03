import { ALL_TIME_PLAYERS } from "./data/players";
import { Player, Role } from "./types";

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * PRD 4.8 & 4.9: Builds a balanced auction pool with Marquee role sequence rotation:
 * Pattern: Marquee Batter -> Marquee WK -> Marquee All-Rounder -> Marquee Bowler ->
 * followed by balanced sets across roles, nationalities, and price tiers.
 */
export function generateAuctionPool(count: number = 40): Player[] {
  const targetCount = Math.min(count, ALL_TIME_PLAYERS.length);
  
  // Separate players by role and marquee status
  const marqueeBatters = shuffle(ALL_TIME_PLAYERS.filter((p) => p.isMarquee && p.primaryRole === "Batter"));
  const marqueeWKs = shuffle(ALL_TIME_PLAYERS.filter((p) => p.isMarquee && p.primaryRole === "Wicketkeeper"));
  const marqueeARs = shuffle(ALL_TIME_PLAYERS.filter((p) => p.isMarquee && p.primaryRole === "All-rounder"));
  const marqueeBowlers = shuffle(ALL_TIME_PLAYERS.filter((p) => p.isMarquee && p.primaryRole === "Bowler"));

  const otherBatters = shuffle(ALL_TIME_PLAYERS.filter((p) => !p.isMarquee && p.primaryRole === "Batter"));
  const otherWKs = shuffle(ALL_TIME_PLAYERS.filter((p) => !p.isMarquee && p.primaryRole === "Wicketkeeper"));
  const otherARs = shuffle(ALL_TIME_PLAYERS.filter((p) => !p.isMarquee && p.primaryRole === "All-rounder"));
  const otherBowlers = shuffle(ALL_TIME_PLAYERS.filter((p) => !p.isMarquee && p.primaryRole === "Bowler"));

  const pool: Player[] = [];
  const addedIds = new Set<string>();

  const addPlayer = (player?: Player) => {
    if (player && !addedIds.has(player.id) && pool.length < targetCount) {
      pool.push(player);
      addedIds.add(player.id);
    }
  };

  // 1. Marquee Opening Sets (Batter -> WK -> All-Rounder -> Bowler)
  const maxMarqueeSets = Math.max(marqueeBatters.length, marqueeWKs.length, marqueeARs.length, marqueeBowlers.length);
  for (let i = 0; i < maxMarqueeSets && pool.length < targetCount; i++) {
    addPlayer(marqueeBatters[i]);
    addPlayer(marqueeWKs[i]);
    addPlayer(marqueeARs[i]);
    addPlayer(marqueeBowlers[i]);
  }

  // 2. Main Auction Rotation (Batter -> Bowler -> All-Rounder -> WK / Batter -> Bowler)
  const remainingMax = Math.max(otherBatters.length, otherBowlers.length, otherARs.length, otherWKs.length);
  for (let i = 0; i < remainingMax && pool.length < targetCount; i++) {
    addPlayer(otherBatters[i]);
    addPlayer(otherBowlers[i]);
    addPlayer(otherARs[i]);
    if (otherWKs[i]) addPlayer(otherWKs[i]);
    if (otherBowlers[i + 1]) addPlayer(otherBowlers[i + 1]);
    if (otherBatters[i + 1]) addPlayer(otherBatters[i + 1]);
  }

  // 3. If targetCount is still not reached, fill in any remaining players
  if (pool.length < targetCount) {
    const remaining = shuffle(ALL_TIME_PLAYERS.filter((p) => !addedIds.has(p.id)));
    for (const p of remaining) {
      if (pool.length >= targetCount) break;
      addPlayer(p);
    }
  }

  return pool;
}
