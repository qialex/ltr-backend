import { LotteryApiService } from "./lotteryApiService";
import { Ticket, EnrichedTicket, UserStats } from "../types";

export class LotteryService {
  constructor(private readonly lotteryApi: LotteryApiService = new LotteryApiService()) {}

  private countMatches(ticketNumbers: number[], winningNumbers: number[]): number {
    return ticketNumbers.filter((n) => winningNumbers.includes(n)).length;
  }

  async getEnrichedTickets(userId: number): Promise<EnrichedTicket[]> {
    const tickets = await this.lotteryApi.getTickets(userId);

    const drawResults = await Promise.allSettled(
      tickets.map((t: Ticket) => this.lotteryApi.getDrawResult(t.drawId))
    );

    const enriched: EnrichedTicket[] = [];

    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      const drawResult = drawResults[i];

      if (drawResult.status === "rejected") {
        console.error(`Failed to fetch draw ${ticket.drawId}:`, drawResult.reason);
        continue;
      }

      const draw = drawResult.value;
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
    const externalWinnings = winningsResult.status === "fulfilled" ? winningsResult.value : null;

    if (winningsResult.status === "rejected") {
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
    };
  }
}

export const lotteryService = new LotteryService();
