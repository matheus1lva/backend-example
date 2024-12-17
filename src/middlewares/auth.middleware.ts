import { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { AuthService } from "../modules/auth/auth.service";

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const token = authHeader.split(" ")[1];
  const authService = Container.get(AuthService);

  try {
    const { userId } = authService.verifyToken(token);
    req.userId = userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
