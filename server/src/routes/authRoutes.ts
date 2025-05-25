import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { authenticateToken } from '../middlewares/auth'; // най-горе, ако още не е добавено
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const router = express.Router();

router.post('/google', async (req: Request, res: Response) => {
  const { idToken } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
        res.status(400).json({ message: 'Invalid Google token' });
        return;
    }

    const { email, given_name, family_name } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        firstName: given_name,
        lastName: family_name,
        provider: 'google'
      });
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    res.json({ token });

  } catch (err) {
    res.status(401).json({ message: 'Google authentication failed' });
  }
});

router.post('/register', async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, birthDate, address, workAddress } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
        {
            res.status(400).json({ message: 'Email already in use.' });
            return;
        }
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      passwordHash,
      firstName,
      lastName,
      birthDate,
      address,
      workAddress,
      provider: 'local'
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) {
        res.status(400).json({ message: 'Invalid credentials.' });
        return
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        res.status(400).json({ message: 'Invalid credentials.' });
        return;
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

router.get('/profile', authenticateToken, async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  try {
    const user = await User.findById(userId).select('-passwordHash');
    if (!user)
        {
            res.status(404).json({ message: 'User not found.' });
            return;
            } 

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

export default router;
