import bcrypt from "bcrypt";
import { User } from "../types";
import { MOCK_USERS } from "../mocks/users";

export class UserService {
  constructor(private readonly users: User[] = MOCK_USERS) {}

  findByUsername(username: string): User | undefined {
    return this.users.find((u) => u.username === username);
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  async login(username: string, password: string): Promise<User | null> {
    const user = this.findByUsername(username);
    if (!user) return null;

    const valid = await this.verifyPassword(user, password);
    return valid ? user : null;
  }
}