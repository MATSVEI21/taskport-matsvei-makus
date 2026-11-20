const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');

const router = express.Router();

const LOGIN_RE = /^[A-Za-z0-9._-]{3,30}$/;

// POST /api/auth/register - haslo zapisujemy tylko jako hash bcrypt
router.post('/register', async (req, res, next) => {
  try {
    const login = typeof req.body.login === 'string' ? req.body.login.trim() : '';
    const firstName = typeof req.body.firstName === 'string' ? req.body.firstName.trim() : '';
    const lastName = typeof req.body.lastName === 'string' ? req.body.lastName.trim() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    if (!LOGIN_RE.test(login)) {
      return res.status(400).json({
        error: 'Login: 3–30 znaków, litery, cyfry, kropka, myślnik lub podkreślnik'
      });
    }
    if (firstName.length < 1 || firstName.length > 50) {
      return res.status(400).json({ error: 'Podaj imię (do 50 znaków)' });
    }
    if (lastName.length < 1 || lastName.length > 50) {
      return res.status(400).json({ error: 'Podaj nazwisko (do 50 znaków)' });
    }
    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({ error: 'Hasło musi mieć od 8 do 72 znaków' });
    }
    const [exists] = await pool.query('SELECT id FROM users WHERE login = ?', [login]);
    if (exists.length > 0) {
      return res.status(409).json({ error: 'Ten login jest już zajęty' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (login, passwordHash, firstName, lastName) VALUES (?, ?, ?, ?)',
      [login, passwordHash, firstName, lastName]
    );
    req.session.userId = result.insertId;
    res.status(201).json({ id: result.insertId, login, firstName, lastName });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login - porownujemy haslo z hashem z bazy
router.post('/login', async (req, res, next) => {
  try {
    const { login, password } = req.body;
    if (!login || !password) {
      return res.status(400).json({ error: 'Podaj login i hasło' });
    }
    const [rows] = await pool.query(
      'SELECT id, login, passwordHash, firstName, lastName FROM users WHERE login = ?',
      [String(login).trim()]
    );
    const user = rows[0];
    if (!user || !(await bcrypt.compare(String(password), user.passwordHash))) {
      return res.status(401).json({ error: 'Nieprawidłowy login lub hasło' });
    }
    req.session.userId = user.id;
    res.json({ id: user.id, login: user.login, firstName: user.firstName, lastName: user.lastName });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('connect.sid');
    res.status(204).end();
  });
});

// GET /api/auth/me - kto jest zalogowany
router.get('/me', async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Musisz się zalogować' });
    }
    const [rows] = await pool.query(
      'SELECT id, login, firstName, lastName FROM users WHERE id = ?',
      [req.session.userId]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Musisz się zalogować' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
