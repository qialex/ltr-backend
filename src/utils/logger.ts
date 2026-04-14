import pino from "pino";

const isTest = process.env["NODE_ENV"] === "test";

const logger = pino({
  level: isTest ? "silent" : (process.env["LOG_LEVEL"] ?? "info"),
  transport:
    !isTest && process.env["NODE_ENV"] !== "production"
      ? { target: "pino-pretty" }
      : undefined,
});

export default logger;
