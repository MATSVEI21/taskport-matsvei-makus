const express = require('express');
const pool = require('../db');

const router = express.Router();

// Lista uzytkownikow - pole passwordHash jest celowo pominiete
router.get('/', async (req, res, next) => {
  try {
    const [uzytkownicy] = await pool.query(
      'SELECT id, login, firstName, lastName, createdAt FROM users'
    );
    res.json(uzytkownicy);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
