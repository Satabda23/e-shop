import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_ACCESS_SECRET ||
  "my_super_secret_key";

export const generateAccessToken = (
  payload: any,
) => {
  return jwt.sign(
    payload,
    JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );
};

export const verifyAccessToken = (
  token: string,
) => {
  return jwt.verify(
    token,
    JWT_SECRET,
  );
};