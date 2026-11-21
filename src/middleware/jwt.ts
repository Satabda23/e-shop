import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import JWT, { SignOptions } from "jsonwebtoken";

const AUTH_TOKEN =
  process.env.AUTH_TOKEN || "shopsphere_default_auth_temp_secret_5m";
const USER_ACCESS_TOKEN_SECRET =
  process.env.USER_ACCESS_TOKEN_SECRET || "shopsphere_default_access_secret_1h";
const USER_REFRESH_TOKEN_SECRET =
  process.env.USER_REFRESH_TOKEN_SECRET || "shopsphere_default_refresh_secret_7d";

export default {
  
  signAuthToken: (payload: any): Promise<string> => {
    return new Promise((resolve, reject) => {
      const options: SignOptions = { expiresIn: "5m" };
      JWT.sign(payload, AUTH_TOKEN, options, (err, token) => {
        if (err || !token) {
          return reject(createHttpError.InternalServerError());
        }
        resolve(token);
      });
    });
  },

  verifyAuthToken: (token: string): any => {
    try {
      return JWT.verify(token, AUTH_TOKEN);
    } catch (error: any) {
      console.log("[JWT] verifyAuthToken error:", error.message);
      return null;
    }
  },

  signUserAccessToken: (userId: number | string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const payload = { id: userId };
      const options: SignOptions = { expiresIn: "1h" };
      JWT.sign(payload, USER_ACCESS_TOKEN_SECRET, options, (err, token) => {
        if (err || !token) {
          return reject(createHttpError.InternalServerError());
        }
        resolve(token);
      });
    });
  },

  signUserRefreshToken: (userId: number | string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const payload = { id: userId };
      const options: SignOptions = { expiresIn: "7d" };
      JWT.sign(payload, USER_REFRESH_TOKEN_SECRET, options, (err, token) => {
        if (err || !token) {
          return reject(createHttpError.InternalServerError());
        }
        resolve(token);
      });
    });
  },

  verifyAccessToken: (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (req.headers["authorization"]) {
      const authHeader = req.headers["authorization"];
      const bearerToken = authHeader.split(" ");
      token = bearerToken[1];
    } else if (req.cookies?.access_token) {
      token = req.cookies.access_token;
    }

    if (!token) {
      return next(createHttpError.Unauthorized("Access token required"));
    }

    JWT.verify(token, USER_ACCESS_TOKEN_SECRET, (err: any, payload: any) => {
      if (err) {
        const message =
          err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
        return next(createHttpError.Unauthorized(message));
      }
      (req as any).user = payload;
      next();
    });
  },
};