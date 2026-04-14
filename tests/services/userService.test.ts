import { describe, test, expect, beforeAll } from "bun:test";
import bcrypt from "bcrypt";
import { UserService } from "../../src/services/userService";
import type { User } from "../../src/types";

let userService: UserService;

beforeAll(async () => {
  const hash = await bcrypt.hash("password123", 10);
  const users: User[] = [{ userId: 1, username: "alice", passwordHash: hash }];
  userService = new UserService(users);
});

describe("UserService", () => {
  test("findByUsername returns user for known username", () => {
    const user = userService.findByUsername("alice");
    expect(user).toBeDefined();
    expect(user?.userId).toBe(1);
  });

  test("findByUsername returns undefined for unknown username", () => {
    expect(userService.findByUsername("nobody")).toBeUndefined();
  });

  test("login returns user for correct credentials", async () => {
    const user = await userService.login("alice", "password123");
    expect(user).not.toBeNull();
    expect(user?.username).toBe("alice");
  });

  test("login returns null for wrong password", async () => {
    expect(await userService.login("alice", "wrong")).toBeNull();
  });

  test("login returns null for unknown user", async () => {
    expect(await userService.login("nobody", "password123")).toBeNull();
  });
});
