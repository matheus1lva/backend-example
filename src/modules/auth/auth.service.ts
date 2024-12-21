import { appConfig } from "../../config/app.config";
import { httpErrors } from "../../utils";
import jwt from "jsonwebtoken";
import { Service } from "typedi";

@Service()
export class AuthService {
  generateToken(userId: string): string {
    if (!userId?.trim()) {
      throw new httpErrors.BadRequest("Invalid user ID");
    }
    return jwt.sign({ userId }, appConfig.JWT_SECRET, {
      expiresIn: appConfig.JWT_EXPIRES_IN,
      algorithm: "HS256",
    });
  }

  verifyToken(token: string): { userId: string } {
    try {
      if (!token?.trim()) {
        throw new httpErrors.Unauthorized("Token is required");
      }

      const decoded = jwt.verify(token, appConfig.JWT_SECRET, {
        algorithms: ["HS256"],
      }) as { userId: string };

      if (!decoded?.userId) {
        throw new httpErrors.Unauthorized("Invalid token payload");
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new httpErrors.Unauthorized("Token has expired");
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new httpErrors.Unauthorized("Invalid token");
      }
      throw new httpErrors.InternalServerError("Authentication error");
    }
  }
}
