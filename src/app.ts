import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import authRouter from "./routes/auth";
import ticketsRouter from "./routes/tickets";
import statsRouter from "./routes/stats";

const app = express();
app.use(express.json());

// Routes
app.use("/login", authRouter);
app.use("/tickets", ticketsRouter);
app.use("/stats", statsRouter);

// Centralized error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = parseInt(process.env.PORT ?? "3000", 10);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
