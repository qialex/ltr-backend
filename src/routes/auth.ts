import { Router, Request, Response } from "express";
import { loginSchema } from "../schemas/auth";
import { UserService } from "../services/userService";
import { authService } from "../services/authService";
import logger from "../utils/logger";

const router = Router();
const userService = new UserService();

router.post("/", async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message });
    return;
  }

  const { username, password } = parsed.data;

  const user = await userService.login(username, password);
  if (!user) {
    logger.warn({ username }, "Failed login attempt");
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  logger.info({ username, userId: user.userId }, "Login successful");
  const token = authService.signToken({ userId: user.userId, username });
  res.json({ token });
});

export default router;
