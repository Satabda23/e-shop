import { NextFunction, Request, Response } from "express";
import { USER_ROLES } from "../helpers/constants/constants";

type PermissionAction = "can_view" | "can_add" | "can_edit" | "can_delete";

export const checkPermission =
  (moduleCode: string, action: PermissionAction) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;

      if (!user) {
        return res.status(401).json({
          status: false,
          message: "Authentication required",
        });
      }

      // Admins have unrestricted access to all modules and actions
      if (user.role === USER_ROLES.ADMIN) {
        return next();
      }

      // Customers can only view public resources
      if (action === "can_view" && user.role === USER_ROLES.CUSTOMER) {
        return next();
      }

      return res.status(403).json({
        status: false,
        message: "You do not have permission to perform this action.",
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Permission check failed.",
      });
    }
  };

/**
 * Checks whether the authenticated user has one of the allowed roles
 */
export const checkRole =
  (allowedRoles: number[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;

      if (!user) {
        return res.status(401).json({
          status: false,
          message: "Authentication required",
        });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          status: false,
          message: "Access denied. Insufficient permissions.",
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Authorization check failed.",
      });
    }
  };

export default {
  checkPermission,
  checkRole,
};