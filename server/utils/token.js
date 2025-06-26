// utils/token.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';

export const generateTokens = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });

  return { accessToken, refreshToken };
};
