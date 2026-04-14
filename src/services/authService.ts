import jwt, { SignOptions } from "jsonwebtoken";
import { JwtPayload } from "../types";

export class AuthService {
  private readonly secret: string;
  private readonly expiresIn: SignOptions["expiresIn"];

  constructor(
    secret = process.env.JWT_SECRET,
    expiresIn = process.env.JWT_EXPIRES_IN ?? "1h"
  ) {
    if (!secret) throw new Error("JWT_SECRET env variable is required");
    this.secret = secret;
    this.expiresIn = expiresIn as SignOptions["expiresIn"];
  }

  signToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  verifyToken(token: string): JwtPayload {
    return jwt.verify(token, this.secret) as JwtPayload;
  }
}

export const authService = new AuthService();
