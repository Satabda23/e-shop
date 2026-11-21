import { Request, Response } from "express";
import User from "../../models/user.model";
import { hashPassword, comparePassword } from "../../helpers/bcyrpt";
import { generateAccessToken } from "../../helpers/jwt";

export default {
  register: async (req: Request, res: Response) => {
    try {
      const { first_name, last_name, email, phone, password } = req.body;

      if (!first_name || !last_name || !email || !phone || !password) {
        return res.status(400).send({
          status: false,
          message: "All fields are required",
        });
      }

      const existingUser = await User.findOne({
        where: {
          email,
        },
      });

      if (existingUser) {
        return res.status(409).send({
          status: false,
          message: "User already exists",
        });
      }

      const hashedPassword = await hashPassword(password);

      const user = await User.create({
        first_name,
        last_name,
        email,
        phone,
        password: hashedPassword,
      });

      const userResponse = {
        id: user.getDataValue("id"),
        first_name: user.getDataValue("first_name"),
        last_name: user.getDataValue("last_name"),
        email: user.getDataValue("email"),
        phone: user.getDataValue("phone"),
        role: user.getDataValue("role"),
      };

      return res.status(201).send({
        status: true,
        message: "User registered successfully",
        data: userResponse,
      });
    } catch (error: any) {
      console.error("Register Error:", error);

      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).send({
          status: false,
          message: "Email and password are required",
        });
      }

      const user = await User.findOne({
        where: {
          email,
        },
      });

      if (!user) {
        return res.status(404).send({
          status: false,
          message: "User not found",
        });
      }

      if (!user.getDataValue("is_active")) {
        return res.status(403).send({
          status: false,
          message: "Account is inactive",
        });
      }

      if (user.getDataValue("status") !== 1) {
        return res.status(403).send({
          status: false,
          message: "Account is suspended",
        });
      }

      const isPasswordValid = await comparePassword(
        password,
        user.getDataValue("password"),
      );

      if (!isPasswordValid) {
        return res.status(401).send({
          status: false,
          message: "Invalid credentials",
        });
      }

      const accessToken = generateAccessToken({
        id: user.getDataValue("id"),
        email: user.getDataValue("email"),
        role: user.getDataValue("role"),
      });

      // dynamic cookie options based on environment
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });


      const userResponse = {
        id: user.getDataValue("id"),
        first_name: user.getDataValue("first_name"),
        last_name: user.getDataValue("last_name"),
        email: user.getDataValue("email"),
        phone: user.getDataValue("phone"),
        role: user.getDataValue("role"),
        is_active: user.getDataValue("is_active"),
        status: user.getDataValue("status"),
      };

      return res.status(200).send({
        status: true,
        message: "Login successful",
        data: userResponse,
      });
    } catch (error: any) {
      console.error("Login Error:", error);

      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  },

  profile: async (req: Request, res: Response) => {
    try {
      const userData = (req as any).user;

      const user = await User.findByPk(userData.id);

      if (!user) {
        return res.status(404).send({
          status: false,
          message: "User not found",
        });
      }

      return res.status(200).send({
        status: true,
        message: "Profile fetched successfully",
        data: {
          id: user.getDataValue("id"),
          first_name: user.getDataValue("first_name"),
          last_name: user.getDataValue("last_name"),
          email: user.getDataValue("email"),
          phone: user.getDataValue("phone"),
          role: user.getDataValue("role"),
        },
      });
    } catch (error: any) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  },

 logout: async (req: Request, res: Response) => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).send({
      status: true,
      message: "Logout Successful",
    });
  } catch (error: any) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
},
};
