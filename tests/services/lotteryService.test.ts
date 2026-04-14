import { describe, test, expect } from "bun:test";
import { LotteryService } from "../../src/services/lotteryService";
import type { LotteryApiService } from "../../src/services/lotteryApiService";

const mockTickets = [
  { ticketId: "t1", drawId: "d1", numbers: [1, 2, 3, 4, 5, 6], purchasedAt: "2024-01-01" },
  { ticketId: "t2", drawId: "d1", numbers: [7, 8, 9, 10, 11, 12], purchasedAt: "2024-01-02" },
  { ticketId: "t3", drawId: "d2", numbers: [1, 2, 3, 15, 16, 17], purchasedAt: "2024-01-03" },
];

const mockDraws: Record<string, { winningNumbers: number[]; prizes: Record<string, number> }> = {
  d1: { winningNumbers: [1, 2, 3, 40, 41, 42], prizes: { "3": 100 } },
  d2: { winningNumbers: [1, 2, 3, 15, 16, 17], prizes: { "6": 10000 } },
};

const mockApi = {
  getTickets: async () => mockTickets,
  getDrawResult: async (drawId: string) => mockDraws[drawId],
  getWinnings: async () => ({ amount: 500 }),
} as unknown as LotteryApiService;

const failingApi = {
  getTickets: async () => { throw new Error("API down"); },
  getDrawResult: async () => { throw new Error("API down"); },
  getWinnings: async () => { throw new Error("API down"); },
} as unknown as LotteryApiService;

describe("LotteryService", () => {
  const service = new LotteryService(mockApi);

  describe("getEnrichedTickets", () => {
    test("enriches tickets with draw results", async () => {
      const tickets = await service.getEnrichedTickets(1);
      expect(tickets).toHaveLength(3);
    });

    test("calculates match count correctly", async () => {
      const tickets = await service.getEnrichedTickets(1);
      expect(tickets[0].matchCount).toBe(3); // [1,2,3] match d1
      expect(tickets[1].matchCount).toBe(0); // [7..12] no match d1
      expect(tickets[2].matchCount).toBe(6); // exact match d2
    });

    test("marks won tickets correctly", async () => {
      const tickets = await service.getEnrichedTickets(1);
      expect(tickets[0].won).toBe(true);
      expect(tickets[1].won).toBe(false);
      expect(tickets[2].won).toBe(true);
    });

    test("deduplicates draw fetches — two tickets share d1", async () => {
      let drawFetchCount = 0;
      const countingApi = {
        getTickets: async () => mockTickets,
        getDrawResult: async (drawId: string) => {
          drawFetchCount++;
          return mockDraws[drawId];
        },
        getWinnings: async () => ({}),
      } as unknown as LotteryApiService;

      await new LotteryService(countingApi).getEnrichedTickets(1);
      expect(drawFetchCount).toBe(2); // d1 + d2, not 3
    });
  });

  describe("getStats", () => {
    test("aggregates totals correctly", async () => {
      const stats = await service.getStats(1);
      expect(stats.totalTickets).toBe(3);
      expect(stats.totalWinnings).toBe(10100); // 100 + 10000
      expect(stats.winRate).toBe("67%");
    });

    test("sets externalWinningsAvailable true when API succeeds", async () => {
      const stats = await service.getStats(1);
      expect(stats.externalWinningsAvailable).toBe(true);
      expect(stats.externalWinnings).toEqual({ amount: 500 });
    });

    test("sets externalWinningsAvailable false when winnings API fails", async () => {
      const partialFailApi = {
        ...mockApi,
        getWinnings: async () => { throw new Error("winnings down"); },
      } as unknown as LotteryApiService;
      const stats = await new LotteryService(partialFailApi).getStats(1);
      expect(stats.externalWinningsAvailable).toBe(false);
      expect(stats.externalWinnings).toBeNull();
    });

    test("throws when tickets API fails", async () => {
      expect(service.getStats.bind(new LotteryService(failingApi), 1)).toThrow();
    });
  });
});
