import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh-token', (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const accessToken = jwt.sign({
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    }, ACCESS_SECRET, { expiresIn: '15m' });

    res.json({ accessToken });
  } catch (err) {
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
});
router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
});


export default router;
