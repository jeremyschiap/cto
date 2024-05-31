const express = require('express');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();
const JWT_SECRET = 'your_jwt_secret';

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const secret = speakeasy.generateSecret();

    db.run(`INSERT INTO users (email, password, totpSecret) VALUES (?, ?, ?)`,
      [email, hashedPassword, secret.base32],
      async (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        const otpauthUrl = secret.otpauth_url;

        qrcode.toDataURL(otpauthUrl, (err, imageUrl) => {
          if (err) {
            return res.status(500).json({ error: 'Impossible de générer le QR code' });
          }

          res.status(201).json({ message: 'Utilisateur déjà enregistré', qrCodeUrl: imageUrl });
        });
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Connexion
router.post('/login', (req, res) => {
  const { email, password, token } = req.body;

  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token
    });

    if (!verified) {
      return res.status(401).json({ message: 'Invalid 2FA token' });
    }

    const jwtToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token: jwtToken });
  });
});

module.exports = router;
