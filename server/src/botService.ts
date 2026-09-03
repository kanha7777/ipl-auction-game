import { Contestant, CurrentAuctionItem, AuctionConfig } from "../../shared/src/types";
import { validateBid, calculateNextBid } from "../../shared/src/rules";

export interface BotDecision {
  shouldBid: boolean;
  delayMs: number;
}

export function evaluateBotBid(
  bot: Contestant,
  item: CurrentAuctionItem,
  config: AuctionConfig
): BotDecision {
  const player = item.player;
  const validation = validateBid(bot, player, item.currentBid, item.leadingBidder?.id || null, config);
  if (!validation.valid) {
    return { shouldBid: false, delayMs: 0 };
  }

  const nextBid = validation.nextBidAmount;

  // Calculate bot interest & valuation based on player rating and team needs
  const squad = bot.squad;
  const batters = squad.filter((s) => s.player.primaryRole === "Batter").length;
  const wks = squad.filter((s) => s.player.primaryRole === "Wicketkeeper").length;
  const allRounders = squad.filter((s) => s.player.primaryRole === "All-rounder").length;
  const bowlers = squad.filter((s) => s.player.primaryRole === "Bowler").length;
  const overseas = squad.filter((s) => s.player.isOverseas).length;

  let needMultiplier = 1.0;
  if (player.primaryRole === "Wicketkeeper") {
    if (wks === 0) needMultiplier += 0.4;
    else needMultiplier -= 0.3;
  } else if (player.primaryRole === "Batter") {
    if (batters < 4) needMultiplier += 0.25;
  } else if (player.primaryRole === "Bowler") {
    if (bowlers < 4) needMultiplier += 0.25;
  } else if (player.primaryRole === "All-rounder") {
    if (allRounders < 2) needMultiplier += 0.3;
  }

  if (player.isOverseas && overseas >= 4) {
    needMultiplier *= 0.6;
  }

  // Base valuation proportional to player rating and tier
  let maxWillingToPay = player.basePrice * 1.5;
  if (player.ratings.overall >= 97) {
    maxWillingToPay = Math.min(18.0, player.basePrice + 12.0 * needMultiplier);
  } else if (player.ratings.overall >= 94) {
    maxWillingToPay = Math.min(13.0, player.basePrice + 8.0 * needMultiplier);
  } else if (player.ratings.overall >= 90) {
    maxWillingToPay = Math.min(8.0, player.basePrice + 5.0 * needMultiplier);
  } else {
    maxWillingToPay = Math.min(4.0, player.basePrice + 2.0 * needMultiplier);
  }

  // Bot purse factor
  maxWillingToPay = Math.min(maxWillingToPay, validation.maxLegalBid);

  // If next bid is within willing budget, decide to bid with random timing
  if (nextBid <= maxWillingToPay) {
    // 80% probability bot will bid if within budget
    const willBid = Math.random() < 0.85;
    if (willBid) {
      // Delay between 1200ms and 3800ms
      const delayMs = Math.floor(Math.random() * 2600) + 1200;
      return { shouldBid: true, delayMs };
    }
  }

  return { shouldBid: false, delayMs: 0 };
}
