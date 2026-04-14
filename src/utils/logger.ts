import pino from "pino";

const isTest = process.env["NODE_ENV"] === "test";
const isProduction = process.env["NODE_ENV"] === "production";
const level = isTest ? "silent" : (process.env["LOG_LEVEL"] ?? "info");

const logger = pino({
  level,
  transport:
    !isTest && !isProduction
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
});

export default logger;
