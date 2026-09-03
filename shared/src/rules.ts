import { AuctionConfig, Contestant, Player, BidValidationResult, SquadNeeds } from "./types";

export const MIN_BASE_PRICE_RESERVE = 0.30; // 30 Lakhs min reserve per slot

/**
 * Calculates the next minimum bid amount based on the tiered rules in PRD 4.12:
 * - Base price to 2.00 Cr: +0.10 Cr
 * - 2.00 Cr to 10.00 Cr:   +0.50 Cr
 * - 10.00 Cr to 20.00 Cr:  +1.00 Cr
 * - 20.00 Cr+:             +2.00 Cr
 */
export function calculateNextBid(currentBid: number, basePrice: number): number {
  if (currentBid <= 0) {
    return roundCurrency(basePrice);
  }

  let increment = 0.10;
  if (currentBid >= 20.0) {
    increment = 2.0;
  } else if (currentBid >= 10.0) {
    increment = 1.0;
  } else if (currentBid >= 2.0) {
    increment = 0.5;
  } else {
    increment = 0.1;
  }

  return roundCurrency(currentBid + increment);
}

export function roundCurrency(val: number): number {
  return Math.round(val * 100) / 100;
}

export function formatCrores(amount: number): string {
  const rounded = roundCurrency(amount);
  if (rounded < 1.0) {
    return `\u20B9${Math.round(rounded * 100)}L`;
  }
  return `\u20B9${rounded.toFixed(rounded % 1 === 0 ? 0 : 2)} Cr`;
}

/**
 * PRD 4.18 - Smart Purse Protection:
 * Calculates max legal bid ensuring contestant can afford minimum base price
 * for all remaining required slots to fulfill minSquadSize.
 */
export function calculateMaxLegalBid(contestant: Contestant, config: AuctionConfig): number {
  const currentCount = contestant.squad.length;
  // Slots needed after purchasing this current candidate
  const remainingNeededSlots = Math.max(0, config.minSquadSize - (currentCount + 1));
  const reserveRequired = remainingNeededSlots * MIN_BASE_PRICE_RESERVE;
  const maxBid = contestant.purse - reserveRequired;
  return roundCurrency(Math.max(0, maxBid));
}

/**
 * Full server & client bid validator according to PRD 4.12 & 4.17 & 4.18
 */
export function validateBid(
  contestant: Contestant,
  player: Player,
  currentBid: number,
  leadingBidderId: string | null,
  config: AuctionConfig
): BidValidationResult {
  const nextBidAmount = calculateNextBid(currentBid, player.basePrice);
  const maxLegalBid = calculateMaxLegalBid(contestant, config);

  if (leadingBidderId === contestant.id) {
    return {
      valid: false,
      reason: "You are already the leading bidder",
      nextBidAmount,
      maxLegalBid,
    };
  }

  if (contestant.squad.length >= config.maxSquadSize) {
    return {
      valid: false,
      reason: `Max squad size (${config.maxSquadSize} players) reached`,
      nextBidAmount,
      maxLegalBid,
    };
  }

  if (player.isOverseas) {
    const currentOverseas = contestant.squad.filter((s) => s.player.isOverseas).length;
    if (currentOverseas >= config.maxOverseas) {
      return {
        valid: false,
        reason: `Overseas quota full (${config.maxOverseas}/${config.maxOverseas} players)`,
        nextBidAmount,
        maxLegalBid,
      };
    }
  }

  if (nextBidAmount > contestant.purse) {
    return {
      valid: false,
      reason: `Insufficient purse (${formatCrores(contestant.purse)} available)`,
      nextBidAmount,
      maxLegalBid,
    };
  }

  if (nextBidAmount > maxLegalBid) {
    const slotsNeeded = Math.max(0, config.minSquadSize - (contestant.squad.length + 1));
    const reserve = roundCurrency(slotsNeeded * MIN_BASE_PRICE_RESERVE);
    return {
      valid: false,
      reason: `Smart Purse Cap: Must reserve ${formatCrores(reserve)} for ${slotsNeeded} required slots`,
      nextBidAmount,
      maxLegalBid,
    };
  }

  return {
    valid: true,
    nextBidAmount,
    maxLegalBid,
  };
}

/**
 * PRD 4.15 - Contestant Dashboard & Live Squad Needs Analysis
 */
export function calculateSquadNeeds(contestant: Contestant, config: AuctionConfig): SquadNeeds {
  const squad = contestant.squad;
  const batters = squad.filter((p) => p.player.primaryRole === "Batter").length;
  const wks = squad.filter((p) => p.player.primaryRole === "Wicketkeeper").length;
  const allRounders = squad.filter((p) => p.player.primaryRole === "All-rounder").length;
  const bowlers = squad.filter((p) => p.player.primaryRole === "Bowler").length;
  const overseas = squad.filter((p) => p.player.isOverseas).length;

  // Ideal target distribution for a balanced 12-18 player squad:
  // Min 4 Batters, 1 WK, 2 All-rounders, 4 Bowlers
  const needBatters = Math.max(0, 4 - batters);
  const needWKs = Math.max(0, config.minWicketkeepers - wks);
  const needAllRounders = Math.max(0, 2 - allRounders);
  const needBowlers = Math.max(0, 4 - bowlers);
  const slotsRemaining = Math.max(0, config.minSquadSize - squad.length);
  const overseasSlotsRemaining = Math.max(0, config.maxOverseas - overseas);

  const summary: string[] = [];
  if (needWKs > 0) summary.push(`Need ${needWKs} WK`);
  if (needBatters > 0) summary.push(`Need ${needBatters} Batter${needBatters > 1 ? "s" : ""}`);
  if (needBowlers > 0) summary.push(`Need ${needBowlers} Bowler${needBowlers > 1 ? "s" : ""}`);
  if (needAllRounders > 0) summary.push(`Need ${needAllRounders} All-rounder${needAllRounders > 1 ? "s" : ""}`);
  if (summary.length === 0 && slotsRemaining > 0) {
    summary.push(`${slotsRemaining} slots to reach min squad (${config.minSquadSize})`);
  } else if (summary.length === 0) {
    summary.push("Squad Core Complete! Filling depth.");
  }

  return {
    needBatters,
    needWKs,
    needAllRounders,
    needBowlers,
    overseasCount: overseas,
    overseasSlotsRemaining,
    squadCount: squad.length,
    slotsRemaining,
    summary,
  };
}
