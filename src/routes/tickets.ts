import { Router, Response } from "express";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth";
import { lotteryService } from "../services/lotteryService";
import logger from "../utils/logger";

const router = Router();

router.get("/", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tickets = await lotteryService.getEnrichedTickets(req.user!.userId);
    res.json(tickets);
  } catch (err) {
    logger.error({ err }, "Failed to fetch tickets");
    res.status(502).json({ error: "Failed to fetch tickets from external API" });
  }
});

export default router;
