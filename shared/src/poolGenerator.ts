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

const FIRST_NAMES = [
  "Rohan", "Aditya", "Sameer", "Varun", "Karan", "Nikhil", "Akash", "Siddharth",
  "Liam", "Oliver", "James", "Ben", "Marcus", "Harry", "Jake", "Cameron",
  "Kagiso", "Faf", "Rassie", "Heinrich", "Marco", "Lungi", "Tabraiz", "Anrich",
  "Kane", "Finn", "Glenn", "Daryl", "Devon", "Rachin", "Matt", "Lockie",
  "Nicholas", "Shimron", "Akeal", "Alzarri", "Rovman", "Romario", "Odean", "Kyle",
  "Pathum", "Charith", "Kusal", "Dasun", "Wanindu", "Maheesh", "Matheesha", "Nuwan"
];

const LAST_NAMES = [
  "Sharma", "Verma", "Patel", "Reddy", "Iyer", "Gill", "Singh", "Yadav",
  "Smith", "Root", "Archer", "Woakes", "Brook", "Wood", "Curran", "Bairstow",
  "Rabada", "Nortje", "Jansen", "Bavuma", "Markram", "Miller", "Klaasen", "Maharaj",
  "Conway", "Ravindra", "Ferguson", "Southee", "Santner", "Phillips", "Allen", "Boult",
  "Pooran", "Hetmyer", "Hosein", "Joseph", "Powell", "Shepherd", "Holder", "Russell",
  "Nissanka", "Asalanka", "Mendis", "Shanaka", "Hasaranga", "Theekshana", "Pathirana", "Thushara"
];

const OVERSEAS_COUNTRIES: Array<{ country: string; countryCode: string }> = [
  { country: "Australia", countryCode: "AU" },
  { country: "England", countryCode: "GB" },
  { country: "South Africa", countryCode: "ZA" },
  { country: "New Zealand", countryCode: "NZ" },
  { country: "West Indies", countryCode: "WI" },
  { country: "Sri Lanka", countryCode: "LK" },
  { country: "Afghanistan", countryCode: "AF" },
];

const IPL_TEAMS_LIST = ["CSK", "MI", "RCB", "KKR", "RR", "SRH", "DC", "GT", "LSG", "PBKS"];

/**
 * Procedurally generates a unique dynamic player if the requested pool exceeds curated legends.
 */
function generateProceduralPlayer(index: number, role: Role): Player {
  const isOverseas = Math.random() < 0.35; // ~35% overseas
  const countryObj = isOverseas
    ? OVERSEAS_COUNTRIES[Math.floor(Math.random() * OVERSEAS_COUNTRIES.length)]
    : { country: "India", countryCode: "IN" };

  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const fullName = `${first} ${last}`;
  const id = `dyn_${index}_${first.toLowerCase()}_${last.toLowerCase()}`;

  const ratingBase = Math.floor(Math.random() * 15) + 80; // 80 - 95
  const basePrices = [0.5, 1.0, 1.5, 2.0];
  const basePrice = ratingBase >= 93 ? 2.0 : ratingBase >= 88 ? 1.5 : ratingBase >= 84 ? 1.0 : 0.5;

  const matches = Math.floor(Math.random() * 70) + 15;
  const team1 = IPL_TEAMS_LIST[Math.floor(Math.random() * IPL_TEAMS_LIST.length)];
  const team2 = IPL_TEAMS_LIST[Math.floor(Math.random() * IPL_TEAMS_LIST.length)];

  let secondaryRole = "Dynamic Match-Winner";
  let battingRating = 50;
  let bowlingRating = 50;
  let allRoundRating = 50;
  let wkRating = 10;

  if (role === "Batter") {
    secondaryRole = isOverseas ? "Explosive Overseas Top-Order Striker" : "High-Impact Indian Top-Order Anchor";
    battingRating = ratingBase;
    bowlingRating = Math.floor(Math.random() * 30) + 20;
    allRoundRating = Math.floor((battingRating + bowlingRating) / 2);
  } else if (role === "Bowler") {
    secondaryRole = isOverseas ? "145kph Express Overseas Pacer" : "Deceptive Indian Strike Bowler";
    bowlingRating = ratingBase;
    battingRating = Math.floor(Math.random() * 30) + 20;
    allRoundRating = Math.floor((battingRating + bowlingRating) / 2);
  } else if (role === "All-rounder") {
    secondaryRole = "Impact 3D Pace/Spin All-Round Weapon";
    battingRating = ratingBase - Math.floor(Math.random() * 6);
    bowlingRating = ratingBase - Math.floor(Math.random() * 6);
    allRoundRating = ratingBase;
  } else if (role === "Wicketkeeper") {
    secondaryRole = "Aggressive Keeper-Batter & Finisher";
    battingRating = ratingBase;
    wkRating = ratingBase + 2;
    bowlingRating = 10;
    allRoundRating = 30;
  }

  return {
    id,
    fullName,
    displayName: `${fullName}`,
    photo: `https://api.dicebear.com/7.x/bottts/svg?seed=${id}`,
    country: countryObj.country,
    countryCode: countryObj.countryCode,
    isOverseas,
    primaryRole: role,
    secondaryRole,
    battingStyle: Math.random() < 0.3 ? "Left-hand bat" : "Right-hand bat",
    bowlingStyle: role === "Bowler" || role === "All-rounder"
      ? (Math.random() < 0.5 ? "Right-arm fast-medium" : "Right-arm legbreak")
      : "Right-arm offbreak",
    iplTeams: Array.from(new Set([team1, team2])),
    seasons: Math.floor(matches / 14) + 1,
    stats: {
      matches,
      runs: role === "Batter" || role === "Wicketkeeper" ? matches * 28 : matches * 12,
      battingAvg: role === "Batter" || role === "Wicketkeeper" ? 31.5 : 18.2,
      strikeRate: 138.5,
      fifties: role === "Batter" ? Math.floor(matches / 6) : 2,
      hundreds: role === "Batter" && ratingBase >= 92 ? 1 : 0,
      wickets: role === "Bowler" || role === "All-rounder" ? Math.floor(matches * 1.1) : 0,
      bowlingAvg: 25.4,
      economy: 7.85,
      bestBowling: role === "Bowler" ? "4/20" : "2/18",
      catches: Math.floor(matches * 0.4),
      stumpings: role === "Wicketkeeper" ? Math.floor(matches * 0.15) : 0,
    },
    ratings: {
      overall: ratingBase,
      batting: battingRating,
      bowling: bowlingRating,
      allRound: allRoundRating,
      wicketkeeping: wkRating,
      fielding: 88,
      consistency: ratingBase - 2,
      t20Impact: ratingBase + 1,
    },
    basePrice,
    basePriceDisplay: `₹${basePrice.toFixed(2)} Cr`,
    isMarquee: ratingBase >= 94,
    tier: ratingBase >= 94 ? "Marquee" : ratingBase >= 90 ? "Icon" : ratingBase >= 85 ? "Elite" : "Pro",
  };
}

/**
 * Builds an auction pool supporting any size (from 10 to 500+ players)
 * with Marquee role sequence rotation:
 * Pattern: Marquee Batter -> Marquee WK -> Marquee All-Rounder -> Marquee Bowler ->
 * followed by balanced sets across roles, nationalities, and price tiers.
 */
export function generateAuctionPool(count: number = 40): Player[] {
  const targetCount = Math.max(10, count);

  // Separate curated players by role and marquee status
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

  // 3. Fill in any remaining curated players from database
  if (pool.length < targetCount) {
    const remaining = shuffle(ALL_TIME_PLAYERS.filter((p) => !addedIds.has(p.id)));
    for (const p of remaining) {
      if (pool.length >= targetCount) break;
      addPlayer(p);
    }
  }

  // 4. If user requested a massive pool (e.g. 200, 300, 400, 500+), generate balanced dynamic stars
  const rolesRotation: Role[] = ["Batter", "Bowler", "All-rounder", "Wicketkeeper", "Bowler", "Batter"];
  let dynIndex = 1;
  while (pool.length < targetCount) {
    const role = rolesRotation[(dynIndex - 1) % rolesRotation.length];
    const newPlayer = generateProceduralPlayer(dynIndex, role);
    addPlayer(newPlayer);
    dynIndex++;
  }

  return pool;
}
