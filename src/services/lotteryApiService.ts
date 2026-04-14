import axios from "axios";
import { cache as defaultCache } from "../utils/cache";
import { Ticket, DrawResult } from "../types";

type Cache = typeof defaultCache;

const LOTTERY_CACHE_TTL = parseInt(process.env["LOTTERY_CACHE_TTL"] ?? "15", 10);

export class LotteryApiService {
  constructor(
    private readonly apiUrl: string = process.env["LOTTERY_API_URL"] ?? "",
    private readonly cache: Cache = defaultCache,
    private readonly ttl: number = LOTTERY_CACHE_TTL
  ) {
    if (!apiUrl) throw new Error("LOTTERY_API_URL env variable is required");
  }

  private async cachedGet<T>(cacheKey: string, url: string): Promise<T> {
    const cached = this.cache.get<T>(cacheKey);
    if (cached) return cached;

    const { data } = await axios.get<T>(url);
    this.cache.set(cacheKey, data, this.ttl);
    return data;
  }

  async getTickets(userId: number): Promise<Ticket[]> {
    const { tickets } = await this.cachedGet<{ tickets: Ticket[] }>(
      `tickets_${userId}`,
      `${this.apiUrl}/users/${userId}/tickets`
    );
    return tickets;
  }

  async getDrawResult(drawId: string): Promise<DrawResult> {
    return this.cachedGet<DrawResult>(
      `draw_${drawId}`,
      `${this.apiUrl}/draws/${drawId}/result`
    );
  }

  async getWinnings(userId: number): Promise<unknown> {
    return this.cachedGet<unknown>(
      `winnings_${userId}`,
      `${this.apiUrl}/users/${userId}/winnings`
    );
  }
}
