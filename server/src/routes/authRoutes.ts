import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { authenticateToken } from '../middlewares/auth'; // най-горе, ако още не е добавено
import { OAuth2Client } from 'google-auth-library';

const router = express.Router();



router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  const user = await User.findById((req as any).userId).select('-password');

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
    }
  res.json(user);
});


// 1. START AUTH FLOW
router.get('/google', (req: Request, res: Response) => {
  
  const client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: process.env.GOOGLE_REDIRECT_URI!,
});

  const authorizeUrl = client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['openid', 'email', 'profile']
  });

  res.redirect(authorizeUrl);
});

// 2. HANDLE REDIRECT
router.get('/google/callback', async (req: Request, res: Response) => {
  const client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: process.env.GOOGLE_REDIRECT_URI!,
});
  
  const code = req.query.code as string;
  if (!code) {
    res.status(400).send('Missing authorization code');
    return;
  }

  try {
    const { tokens } = await client.getToken(code);
    const idToken = tokens.id_token;
    if (!idToken) {
      res.status(400).send('No ID token returned');
      return;
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      res.status(400).send('Invalid token payload');
      return;
    }

    const { email, given_name, family_name } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        email,
        firstName: given_name,
        lastName: family_name,
        provider: 'google',
      });
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.redirect(`http://localhost:5173/profile?token=${token}`);
    return;
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).send('Authentication failed');
    return;
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
