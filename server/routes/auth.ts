import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Helper to generate username
function generateUsername(firstName: string, lastName: string): string {
  const base = (firstName + lastName).toLowerCase().replace(/[^a-z0-9]/g, '');
  let candidate = base;
  let counter = 100;
  
  while (true) {
    const row = db.prepare('SELECT 1 FROM users WHERE username = ?').get(candidate);
    if (!row) return candidate;
    candidate = `${base}${counter++}`;
  }
}

router.post('/signup', async (req, res) => {
  const { firstName, lastName, password } = req.body;
  if (!firstName || !lastName || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  
  try {
    const username = generateUsername(firstName, lastName);
    const passwordHash = await bcrypt.hash(password, 10);
    
    const stmt = db.prepare(`
      INSERT INTO users (first_name, last_name, username, password_hash)
      VALUES (?, ?, ?, ?)
    `);
    const info = stmt.run(firstName, lastName, username, passwordHash);
    
    const token = jwt.sign({ id: info.lastInsertRowid, username }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({
      token,
      user: { id: info.lastInsertRowid, firstName, lastName, username }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        isAdmin: !!user.is_admin
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
