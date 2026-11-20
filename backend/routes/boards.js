const express = require('express');
const pool = require('../db');

const router = express.Router();

// Walidacja nazwy tablicy (1-80 znakow); opis opcjonalny, do 255 znakow
function sprawdzTablice(body) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (name.length < 1 || name.length > 80) {
    return { blad: 'Nazwa musi mieć od 1 do 80 znaków' };
  }
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  if (description.length > 255) {
    return { blad: 'Opis może mieć najwyżej 255 znaków' };
  }
  return { dane: { name, description: description || null } };
}

const LISTA_SQL =
  'SELECT b.id, b.name, b.description, b.ownerId, b.createdAt, ' +
  "CONCAT(u.firstName, ' ', u.lastName) AS ownerName, " +
  '(SELECT COUNT(*) FROM tasks t WHERE t.boardId = b.id AND t.isDeleted = 0) AS activeTasks ' +
  'FROM boards b JOIN users u ON u.id = b.ownerId ';

// GET /api/boards - lista tablic bez usunietych (z autorem i liczba zadan)
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(LISTA_SQL + 'WHERE b.isDeleted = 0 ORDER BY b.id');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/boards/:id - szczegoly jednej tablicy
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(LISTA_SQL + 'WHERE b.id = ? AND b.isDeleted = 0', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Nie znaleziono tablicy' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/boards - nowa tablica; wlasciciel z sesji
router.post('/', async (req, res, next) => {
  try {
    const { blad, dane } = sprawdzTablice(req.body);
    if (blad) {
      return res.status(400).json({ error: blad });
    }
    const [result] = await pool.query(
      'INSERT INTO boards (name, description, ownerId) VALUES (?, ?, ?)',
      [dane.name, dane.description, req.session.userId]
    );
    res.status(201).json({ id: result.insertId, ...dane });
  } catch (err) {
    next(err);
  }
});

// PUT /api/boards/:id - zmiana nazwy i opisu
router.put('/:id', async (req, res, next) => {
  try {
    const { blad, dane } = sprawdzTablice(req.body);
    if (blad) {
      return res.status(400).json({ error: blad });
    }
    const [result] = await pool.query(
      'UPDATE boards SET name = ?, description = ? WHERE id = ? AND isDeleted = 0',
      [dane.name, dane.description, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Nie znaleziono tablicy' });
    }
    res.json({ id: Number(req.params.id), ...dane });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/boards/:id - soft delete (kto i kiedy usunal)
router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.query(
      'UPDATE boards SET isDeleted = 1, deletedAt = NOW(), deletedById = ? WHERE id = ? AND isDeleted = 0',
      [req.session.userId, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Nie znaleziono tablicy' });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
