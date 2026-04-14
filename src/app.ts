import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import authRouter from "./routes/auth";
import logger from './utils/logger';
import ticketsRouter from "./routes/tickets";
import statsRouter from "./routes/stats";

const app = express();
app.use(helmet());
app.use(express.json());
app.use(pinoHttp({ logger }));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.LOGIN_RATE_LIMIT ?? "10", 10),
  message: { error: "Too many login attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
app.use("/login", loginLimiter, authRouter);
app.use("/tickets", ticketsRouter);
app.use("/stats", statsRouter);

// Centralized error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err }, "Unhandled error");
  res.status(500).json({ error: "Internal server error" });
});

const PORT = parseInt(process.env.PORT ?? "3000", 10);
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
