import { LotteryApiService } from "./lotteryApiService";
import { DrawResult, EnrichedTicket, UserStats } from "../types";

export class LotteryService {
  constructor(private readonly lotteryApi: LotteryApiService = new LotteryApiService()) {}

  private countMatches(ticketNumbers: number[], winningNumbers: number[]): number {
    return ticketNumbers.length + winningNumbers.length - new Set([...ticketNumbers, ...winningNumbers]).size;
  }

  async getEnrichedTickets(userId: number): Promise<EnrichedTicket[]> {
    const tickets = await this.lotteryApi.getTickets(userId);

    // Fetch each unique draw once — multiple tickets can share the same drawId
    const uniqueDrawIds = [...new Set(tickets.map((t) => t.drawId))];
    const drawEntries = await Promise.allSettled(
      uniqueDrawIds.map(async (drawId) => {
        const result = await this.lotteryApi.getDrawResult(drawId);
        return [drawId, result] as const;
      })
    );

    const drawMap = new Map<string, DrawResult>();
    for (const entry of drawEntries) {
      if (entry.status === "fulfilled") {
        drawMap.set(entry.value[0], entry.value[1]);
      } else {
        console.error("Failed to fetch draw result:", entry.reason);
      }
    }

    const enriched: EnrichedTicket[] = [];
    for (const ticket of tickets) {
      const draw = drawMap.get(ticket.drawId);
      if (!draw) continue;

      const matchCount = this.countMatches(ticket.numbers, draw.winningNumbers);
      const prize = draw.prizes[String(matchCount)] ?? 0;

      enriched.push({
        ticketId: ticket.ticketId,
        drawId: ticket.drawId,
        purchasedAt: ticket.purchasedAt,
        numbers: ticket.numbers,
        winningNumbers: draw.winningNumbers,
        matchCount,
        prize,
        won: prize > 0,
      });
    }

    return enriched;
  }

  async getStats(userId: number): Promise<UserStats> {
    const [ticketsResult, winningsResult] = await Promise.allSettled([
      this.getEnrichedTickets(userId),
      this.lotteryApi.getWinnings(userId),
    ]);

    if (ticketsResult.status === "rejected") {
      throw ticketsResult.reason;
    }

    const tickets = ticketsResult.value;
    const externalWinningsAvailable = winningsResult.status === "fulfilled";
    const externalWinnings = externalWinningsAvailable ? winningsResult.value : null;

    if (!externalWinningsAvailable) {
      console.warn("Could not fetch external winnings:", winningsResult.reason);
    }

    const wonTickets = tickets.filter((t) => t.won);
    const totalWinnings = wonTickets.reduce((sum, t) => sum + t.prize, 0);
    const winRate = tickets.length > 0
      ? `${Math.round((wonTickets.length / tickets.length) * 100)}%`
      : "0%";

    return {
      totalTickets: tickets.length,
      totalWinnings,
      winRate,
      externalWinnings,
      externalWinningsAvailable,
    };
  }
}

export const lotteryService = new LotteryService();
