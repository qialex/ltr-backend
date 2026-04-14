import { describe, test, expect } from "bun:test";
import { AuthService } from "../../src/services/authService";

const authService = new AuthService("test-secret-do-not-use-in-prod");

describe("AuthService", () => {
  test("signToken returns a valid JWT string", () => {
    const token = authService.signToken({ userId: 1, username: "alice" });
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);
  });

  test("verifyToken returns correct payload", () => {
    const token = authService.signToken({ userId: 1, username: "alice" });
    const payload = authService.verifyToken(token);
    expect(payload.userId).toBe(1);
    expect(payload.username).toBe("alice");
  });

  test("verifyToken throws for tampered token", () => {
    expect(() => authService.verifyToken("bad.token.here")).toThrow();
  });

  test("verifyToken throws for token signed with different secret", () => {
    const otherService = new AuthService("different-secret");
    const token = otherService.signToken({ userId: 1, username: "alice" });
    expect(() => authService.verifyToken(token)).toThrow();
  });
});
