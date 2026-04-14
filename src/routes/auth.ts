import { Router, Request, Response } from "express";
import { UserService } from "../services/userService";
import { authService } from "../services/authService";

const router = Router();
const userService = new UserService();

router.post("/", async (req: Request, res: Response) => {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password) {
    res.status(400).json({ error: "username and password are required" });
    return;
  }

  const user = await userService.login(username, password);
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = authService.signToken({ userId: user.userId, username });
  res.json({ token });
});

export default router;
