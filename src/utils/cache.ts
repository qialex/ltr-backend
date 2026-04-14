import NodeCache from "node-cache";

// TTL: 60 seconds by default, can be overridden via env
const TTL = parseInt(process.env.CACHE_TTL ?? "60", 10);

export const cache = new NodeCache({ stdTTL: TTL, checkperiod: TTL * 2 });
