import { NextFunction, Request, Response } from "express";

const verifyRole =
  (allowedRoles: number[]) =>
  (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const user =
        (req as any).user;

      if (!user) {
        return res.status(401).send({
          status: false,
          message:
            "Authentication required",
        });
      }

      if (
        !allowedRoles.includes(
          user.role,
        )
      ) {
        return res.status(403).send({
          status: false,
          message:
            "Access denied",
        });
      }

      next();
    } catch (error) {
      return res.status(500).send({
        status: false,
        message:
          "User verification failed",
      });
    }
  };

export default {
  verifyRole,
};