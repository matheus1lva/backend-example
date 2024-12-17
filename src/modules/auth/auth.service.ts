import { appConfig } from "@/config/app.config";
import jwt from "jsonwebtoken";
import { Service } from "typedi";

@Service()
export class AuthService {
  generateToken(userId: string): string {
    return jwt.sign({ userId }, appConfig.JWT_SECRET, {
      expiresIn: appConfig.JWT_EXPIRES_IN,
    });
  }

  verifyToken(token: string): { userId: string } {
    try {
      const decoded = jwt.verify(token, appConfig.JWT_SECRET) as {
        userId: string;
      };
      return decoded;
    } catch (error) {
      throw new Error("Invalid token");
    }
  }
}
