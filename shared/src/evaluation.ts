import { BoughtPlayer, Contestant, SquadCategoryScores, SquadScoreBreakdown, AuctionConfig } from "./types";
import { roundCurrency } from "./rules";

/**
 * PRD Section 5: 100-Point Squad Evaluation Model
 */
export function evaluateContestantSquad(contestant: Contestant, config: AuctionConfig): SquadScoreBreakdown {
  const squad = contestant.squad;
  const players = squad.map((s) => s.player);

  const batters = players.filter((p) => p.primaryRole === "Batter");
  const wks = players.filter((p) => p.primaryRole === "Wicketkeeper");
  const allRounders = players.filter((p) => p.primaryRole === "All-rounder");
  const bowlers = players.filter((p) => p.primaryRole === "Bowler");
  const overseas = players.filter((p) => p.isOverseas);
  const indians = players.filter((p) => !p.isOverseas);

  // 1. Batting (Max 20 pts)
  // Evaluates top 6 batting contributors (batters + batting all-rounders + WKs)
  const battingContributors = [...players].sort((a, b) => b.ratings.batting - a.ratings.batting);
  const top6Batters = battingContributors.slice(0, 6);
  const avgBattingRating = top6Batters.length > 0
    ? top6Batters.reduce((acc, p) => acc + p.ratings.batting, 0) / top6Batters.length
    : 0;
  // Scaled: 95+ avg -> ~19-20, 90+ -> ~17-18, penalty if less than 5 batters/ARs
  let battingScore = (avgBattingRating / 100) * 19;
  if (batters.length + wks.length + allRounders.length < 5) {
    battingScore *= 0.6; // Heavy penalty for lack of top order
  }
  battingScore = Math.min(20, Math.max(0, roundCurrency(battingScore)));

  // 2. Bowling (Max 20 pts)
  // Evaluates frontline 5 bowling options (bowlers + bowling all-rounders)
  const bowlingContributors = [...players].sort((a, b) => b.ratings.bowling - a.ratings.bowling);
  const top5Bowlers = bowlingContributors.slice(0, 5);
  const avgBowlingRating = top5Bowlers.length > 0
    ? top5Bowlers.reduce((acc, p) => acc + p.ratings.bowling, 0) / top5Bowlers.length
    : 0;
  let bowlingScore = (avgBowlingRating / 100) * 19;
  if (bowlers.length + allRounders.length < 4) {
    bowlingScore *= 0.6; // Heavy penalty for lack of genuine 20 overs
  }
  bowlingScore = Math.min(20, Math.max(0, roundCurrency(bowlingScore)));

  // 3. All-rounders (Max 15 pts)
  // Evaluates quality & count of genuine all-rounders providing team balance
  let allRoundScore = 0;
  if (allRounders.length >= 1) {
    const topARs = [...allRounders].sort((a, b) => b.ratings.allRound - a.ratings.allRound).slice(0, 3);
    const avgARRating = topARs.reduce((acc, p) => acc + p.ratings.allRound, 0) / topARs.length;
    allRoundScore = (avgARRating / 100) * 12 + Math.min(3, allRounders.length * 1.5);
  }
  allRoundScore = Math.min(15, Math.max(0, roundCurrency(allRoundScore)));

  // 4. Wicketkeeping (Max 10 pts)
  // Primary keeper quality + backup keeper presence
  let wicketkeepingScore = 0;
  if (wks.length > 0) {
    const primaryWK = [...wks].sort((a, b) => b.ratings.wicketkeeping - a.ratings.wicketkeeping)[0];
    wicketkeepingScore = (primaryWK.ratings.wicketkeeping / 100) * 8.5;
    if (wks.length >= 2) {
      wicketkeepingScore += 1.5; // Backup WK bonus
    }
  }
  wicketkeepingScore = Math.min(10, Math.max(0, roundCurrency(wicketkeepingScore)));

  // 5. Squad Depth (Max 10 pts)
  // Evaluates bench quality across positions (slots above minimum 11 playing slots)
  let depthScore = 0;
  if (squad.length >= 11) {
    const benchCount = squad.length - 11;
    const depthRatio = Math.min(1.0, benchCount / (config.minSquadSize - 11 || 1));
    const benchAvg = squad.slice(11).reduce((acc, s) => acc + s.player.ratings.overall, 0) / (benchCount || 1);
    depthScore = (benchAvg / 100) * 7 * depthRatio + Math.min(3, benchCount * 0.75);
  }
  depthScore = Math.min(10, Math.max(0, roundCurrency(depthScore)));

  // 6. Role Coverage (Max 10 pts)
  // Checks coverage for: Openers, Middle Order, Finishers, Pace, Spin, Death Bowler
  let coveragePoints = 0;
  const hasOpener = players.some((p) => p.secondaryRole.toLowerCase().includes("opener") || p.secondaryRole.toLowerCase().includes("top order"));
  const hasMiddle = players.some((p) => p.secondaryRole.toLowerCase().includes("middle") || p.secondaryRole.toLowerCase().includes("anchor") || p.secondaryRole.toLowerCase().includes("360"));
  const hasFinisher = players.some((p) => p.secondaryRole.toLowerCase().includes("finisher") || p.secondaryRole.toLowerCase().includes("power") || p.ratings.t20Impact >= 95);
  const hasPacer = players.some((p) => p.bowlingStyle.toLowerCase().includes("fast") || p.bowlingStyle.toLowerCase().includes("medium"));
  const hasSpinner = players.some((p) => p.bowlingStyle.toLowerCase().includes("break") || p.bowlingStyle.toLowerCase().includes("spin") || p.bowlingStyle.toLowerCase().includes("orthodox"));
  const hasDeathBowler = players.some((p) => p.secondaryRole.toLowerCase().includes("death") || p.secondaryRole.toLowerCase().includes("yorker") || (p.primaryRole === "Bowler" && p.ratings.t20Impact >= 96));

  if (hasOpener) coveragePoints += 1.8;
  if (hasMiddle) coveragePoints += 1.8;
  if (hasFinisher) coveragePoints += 1.8;
  if (hasPacer) coveragePoints += 1.8;
  if (hasSpinner) coveragePoints += 1.8;
  if (hasDeathBowler) coveragePoints += 1.0;
  const roleCoverageScore = Math.min(10, Math.max(0, roundCurrency(coveragePoints)));

  // 7. Indian / Overseas Balance (Max 5 pts)
  // PRD: Strong Indian core + up to 5 overseas star impact
  let balanceScore = 0;
  if (overseas.length >= 2 && overseas.length <= config.maxOverseas && indians.length >= 6) {
    const overseasAvg = overseas.reduce((acc, p) => acc + p.ratings.overall, 0) / overseas.length;
    const indianAvg = indians.reduce((acc, p) => acc + p.ratings.overall, 0) / indians.length;
    balanceScore = ((overseasAvg + indianAvg) / 200) * 5;
  } else if (overseas.length > config.maxOverseas) {
    balanceScore = 1.0; // Penalty for violating overseas limit
  } else {
    balanceScore = 3.0;
  }
  balanceScore = Math.min(5, Math.max(0, roundCurrency(balanceScore)));

  // 8. Squad Flexibility (Max 5 pts)
  // LHB / RHB batting mix + bowling variations
  const lhBatters = players.filter((p) => p.battingStyle.includes("Left")).length;
  const rhBatters = players.filter((p) => p.battingStyle.includes("Right")).length;
  const hasLHBRHBMix = lhBatters >= 2 && rhBatters >= 2;
  const paceCount = players.filter((p) => p.bowlingStyle.includes("fast") || p.bowlingStyle.includes("medium")).length;
  const spinCount = players.filter((p) => p.bowlingStyle.includes("spin") || p.bowlingStyle.includes("orthodox") || p.bowlingStyle.includes("break")).length;
  let flexScore = 2.0;
  if (hasLHBRHBMix) flexScore += 1.5;
  if (paceCount >= 2 && spinCount >= 2) flexScore += 1.5;
  const flexibilityScore = Math.min(5, Math.max(0, roundCurrency(flexScore)));

  // 9. Value / Purse Management (Max 5 pts)
  // Budget efficiency: ROI per Cr spent, reasonable reserve remaining without hoarding
  const totalSpent = squad.reduce((acc, s) => acc + s.price, 0);
  const remainingPurse = contestant.purse;
  let purseScore = 3.0;
  if (totalSpent > 0 && squad.length >= config.minSquadSize) {
    // Reward spending enough while leaving a comfortable cushion (0-15 Cr)
    if (remainingPurse >= 0.5 && remainingPurse <= 15.0) {
      purseScore = 4.8;
    } else if (remainingPurse > 15.0) {
      purseScore = 3.5; // Hoarded too much money
    } else {
      purseScore = 4.0;
    }
  } else if (squad.length < config.minSquadSize) {
    purseScore = 1.0; // Incomplete squad penalty
  }
  const purseManagementScore = Math.min(5, Math.max(0, roundCurrency(purseScore)));

  const categoryScores: SquadCategoryScores = {
    batting: battingScore,
    bowling: bowlingScore,
    allRound: allRoundScore,
    wicketkeeping: wicketkeepingScore,
    squadDepth: depthScore,
    roleCoverage: roleCoverageScore,
    balance: balanceScore,
    flexibility: flexibilityScore,
    purseManagement: purseManagementScore,
  };

  const totalScore = roundCurrency(
    battingScore +
    bowlingScore +
    allRoundScore +
    wicketkeepingScore +
    depthScore +
    roleCoverageScore +
    balanceScore +
    flexibilityScore +
    purseManagementScore
  );

  // Generate Insights (Strengths & Weaknesses)
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (battingScore >= 17) strengths.push("Heavy artillery batting lineup with top-tier runscorers");
  if (bowlingScore >= 17) strengths.push("Lethal bowling attack with exceptional economy & wicket-taking teeth");
  if (allRoundScore >= 12) strengths.push("Matchwinning all-round depth offering tremendous tactical balance");
  if (wicketkeepingScore >= 8.5) strengths.push("World-class wicketkeeping and clutch batting pedigree");
  if (roleCoverageScore >= 9) strengths.push("Flawless role coverage from powerplay to death overs");
  if (flexibilityScore >= 4.5) strengths.push("Ideal Left-Right batting and Pace-Spin bowling variety");

  if (battingScore < 14) weaknesses.push("Vulnerable top-order or lack of batting firepower");
  if (bowlingScore < 14) weaknesses.push("Thin bowling arsenal that may leak runs in crunch situations");
  if (wicketkeepingScore < 7) weaknesses.push("Lacks a frontline wicketkeeper-batter");
  if (allRoundScore < 7) weaknesses.push("Short on genuine all-round options to bridge batting & bowling");
  if (squad.length < config.minSquadSize) weaknesses.push(`Failed to reach minimum squad size of ${config.minSquadSize}`);

  if (strengths.length === 0) strengths.push("Balanced roster with solid fundamental coverage");

  return {
    contestantId: contestant.id,
    contestantName: contestant.name,
    teamName: contestant.teamName,
    teamColor: contestant.teamColor,
    teamLogo: contestant.teamLogo,
    rank: 1, // Computed upon sorting
    totalScore,
    categoryScores,
    winnerExplanation: "", // Populated for winner
    strengths,
    weaknesses,
    squadCount: squad.length,
    totalSpent: roundCurrency(totalSpent),
    remainingPurse: roundCurrency(remainingPurse),
    squad,
  };
}

/**
 * Evaluates all contestants, calculates ranks, and generates winner explanation
 */
export function evaluateAllSquads(contestants: Contestant[], config: AuctionConfig): SquadScoreBreakdown[] {
  const results = contestants.map((c) => evaluateContestantSquad(c, config));

  // Sort descending by totalScore, tiebreak on squad balance
  results.sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    return b.categoryScores.roleCoverage - a.categoryScores.roleCoverage;
  });

  results.forEach((r, idx) => {
    r.rank = idx + 1;
  });

  if (results.length > 0) {
    const winner = results[0];
    const topTraits: string[] = [];
    if (winner.categoryScores.batting >= 17) topTraits.push("explosive top-order batting");
    if (winner.categoryScores.bowling >= 17) topTraits.push("deadly bowling arsenal");
    if (winner.categoryScores.allRound >= 12) topTraits.push("versatile 3D all-rounders");
    if (winner.categoryScores.wicketkeeping >= 8.5) topTraits.push("elite wicketkeeper leadership");
    if (winner.categoryScores.roleCoverage >= 9) topTraits.push("comprehensive role coverage");
    if (winner.categoryScores.balance >= 4.5) topTraits.push("strong Indian core with impactful overseas stars");
    if (winner.categoryScores.purseManagement >= 4.5) topTraits.push("efficient purse utilization");

    const traitSummary = topTraits.length > 0 ? topTraits.join(", ") : "exceptional all-round squad balance";
    winner.winnerExplanation = `Crown Champion! ${winner.teamName} built the most complete and formidable squad with ${traitSummary}.`;
  }

  return results;
}
