import { Router, Response } from "express";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth";
import { lotteryService } from "../services/lotteryService";

const router = Router();

router.get("/", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = await lotteryService.getStats(req.user!.userId);
    res.json(stats);
  } catch (err) {
    console.error("Failed to compute stats:", err);
    res.status(502).json({ error: "Failed to fetch data from external API" });
  }
});

export default router;
