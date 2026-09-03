export type Role = "Batter" | "Wicketkeeper" | "All-rounder" | "Bowler";

export interface PlayerStats {
  matches: number;
  runs: number;
  battingAvg: number;
  strikeRate: number;
  fifties: number;
  hundreds: number;
  wickets: number;
  bowlingAvg: number;
  economy: number;
  bestBowling: string;
  catches: number;
  stumpings: number;
}

export interface PlayerRatings {
  overall: number;       // 0-99
  batting: number;       // 0-99
  bowling: number;       // 0-99
  allRound: number;      // 0-99
  wicketkeeping: number; // 0-99
  fielding: number;      // 0-99
  consistency: number;   // 0-99
  t20Impact: number;     // 0-99
}

export interface Player {
  id: string;
  fullName: string;
  displayName: string;
  photo: string;
  country: string;
  countryCode: string;
  isOverseas: boolean;
  primaryRole: Role;
  secondaryRole: string;
  battingStyle: "Right-hand bat" | "Left-hand bat";
  bowlingStyle: string;
  iplTeams: string[];
  seasons: number;
  stats: PlayerStats;
  ratings: PlayerRatings;
  basePrice: number;      // In Crores (e.g. 2.0 = 2 Cr, 0.5 = 50L)
  basePriceDisplay: string;
  isMarquee: boolean;
  tier: "Marquee" | "Icon" | "Elite" | "Pro" | "Value";
}

export interface BoughtPlayer {
  player: Player;
  price: number;
  timestamp: number;
}

export interface SquadNeeds {
  needBatters: number;
  needWKs: number;
  needAllRounders: number;
  needBowlers: number;
  overseasCount: number;
  overseasSlotsRemaining: number;
  squadCount: number;
  slotsRemaining: number;
  summary: string[];
}

export interface Contestant {
  id: string;
  socketId?: string;
  name: string;
  teamName: string;
  teamColor: string;
  teamSecondaryColor: string;
  teamLogo: string;
  purse: number; // In Crores, default 120.0
  squad: BoughtPlayer[];
  isHost: boolean;
  isBot: boolean;
  isConnected: boolean;
  reconnectToken?: string;
}

export interface Bid {
  contestantId: string;
  contestantName: string;
  teamName: string;
  teamColor: string;
  amount: number;
  timestamp: number;
}

export interface AuctionConfig {
  startingPurse: number;       // Default 120 Cr
  playerCount: number;         // Default 40
  minSquadSize: number;        // Default 12
  maxSquadSize: number;        // Default 18
  maxOverseas: number;         // Default 5
  minWicketkeepers: number;    // Default 1
  timerDuration: number;       // Default 7 seconds
}

export type RoomState =
  | "LOBBY"
  | "CONFIGURATION"
  | "POOL_READY"
  | "AUCTION_RUNNING"
  | "AUCTION_PAUSED"
  | "UNSOLD_ROUND"
  | "FINALIZING"
  | "RESULTS";

export interface CurrentAuctionItem {
  player: Player;
  itemIndex: number;
  totalItems: number;
  currentBid: number;
  leadingBidder: Contestant | null;
  bidHistory: Bid[];
  timer: number;
  timerRunning: boolean;
  isUnsoldRound: boolean;
}

export interface SquadCategoryScores {
  batting: number;         // Max 20
  bowling: number;         // Max 20
  allRound: number;        // Max 15
  wicketkeeping: number;   // Max 10
  squadDepth: number;      // Max 10
  roleCoverage: number;    // Max 10
  balance: number;         // Max 5 (Indian / Overseas)
  flexibility: number;     // Max 5
  purseManagement: number; // Max 5
}

export interface SquadScoreBreakdown {
  contestantId: string;
  contestantName: string;
  teamName: string;
  teamColor: string;
  teamLogo: string;
  rank: number;
  totalScore: number;     // Max 100
  categoryScores: SquadCategoryScores;
  winnerExplanation: string;
  strengths: string[];
  weaknesses: string[];
  squadCount: number;
  totalSpent: number;
  remainingPurse: number;
  squad: BoughtPlayer[];
}

export interface RoomData {
  id: string;
  hostId: string;
  state: RoomState;
  config: AuctionConfig;
  contestants: Contestant[];
  pool: Player[];
  currentAuctionItem: CurrentAuctionItem | null;
  unsoldPool: Player[];
  soldHistory: { player: Player; buyer: Contestant; price: number }[];
  evaluationResults: SquadScoreBreakdown[] | null;
  winnerExplanation: string | null;
}

export interface BidValidationResult {
  valid: boolean;
  reason?: string;
  nextBidAmount: number;
  maxLegalBid: number;
}
