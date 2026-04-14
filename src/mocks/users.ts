import { User } from "../types";

const hashFor = (envVar: string, username: string): string => {
  const hash = process.env[envVar];
  if (!hash) console.warn(`[startup] ${envVar} is not set — login will fail for "${username}"`);
  return hash ?? "";
};

export const MOCK_USERS: User[] = [
  {
    userId: 1,
    username: "admin",
    passwordHash: hashFor("ADMIN_PASSWORD_HASH", "admin"),
  },
  {
    userId: 42,
    username: "john",
    passwordHash: hashFor("JOHN_PASSWORD_HASH", "john"),
  },
];
