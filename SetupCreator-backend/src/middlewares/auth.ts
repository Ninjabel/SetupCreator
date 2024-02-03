import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";

type AuthParams = {
  requiredRole?: Role;
};

export const authMiddleware =
  (params?: AuthParams) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const payload = jwt.verify(
        token,
        process.env.AUTH_SECRET!
      ) as jwt.JwtPayload;

      if (params?.requiredRole && params.requiredRole !== payload.role) {
        return res.status(403).json({ message: "Forbidden" });
      }

      req.app.locals.userId = payload.id;
      req.app.locals.userRole = payload.role;
      next();
    } catch (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  };
