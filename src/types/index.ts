export interface Ticket {
  ticketId: string;
  drawId: string;
  numbers: number[];
  purchasedAt: string;
}

export interface DrawResult {
  winningNumbers: number[];
  prizes: Record<string, number>;
}

export interface EnrichedTicket {
  ticketId: string;
  drawId: string;
  purchasedAt: string;
  numbers: number[];
  winningNumbers: number[];
  matchCount: number;
  prize: number;
  won: boolean;
}

export interface User {
  userId: number;
  username: string;
  passwordHash: string;
}

export interface UserStats {
  totalTickets: number;
  totalWinnings: number;
  winRate: string;
  externalWinnings: unknown;
  externalWinningsAvailable: boolean;
}

export interface JwtPayload {
  userId: number;
  username: string;
}

