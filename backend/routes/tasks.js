const express = require('express');
const pool = require('../db');

const router = express.Router();

const STATUSY = ['todo', 'in_progress', 'done'];
const PRIORYTETY = ['low', 'medium', 'high'];
const KOLUMNY =
  'id, title, description, status, priority, deadline, boardId, assigneeId, createdAt';

// Sprawdza dane zadania. Zwraca { blad } albo { dane } z gotowymi wartosciami.
async function sprawdzZadanie(body, sprawdzTablice) {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  if (title.length < 3 || title.length > 100) {
    return { blad: 'Tytuł musi mieć od 3 do 100 znaków' };
  }
  const status = body.status === undefined ? 'todo' : body.status;
  if (!STATUSY.includes(status)) {
    return { blad: 'Status musi być jednym z: todo, in_progress, done' };
  }
  const priority = body.priority === undefined ? 'medium' : body.priority;
  if (!PRIORYTETY.includes(priority)) {
    return { blad: 'Priorytet musi być jednym z: low, medium, high' };
  }
  const deadline = body.deadline || null;
  if (deadline !== null) {
    const poprawnyFormat = typeof deadline === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(deadline);
    if (!poprawnyFormat || Number.isNaN(Date.parse(deadline))) {
      return { blad: 'Termin musi mieć format RRRR-MM-DD albo być pusty' };
    }
  }
  if (sprawdzTablice) {
    const [tablice] = await pool.query(
      'SELECT id FROM boards WHERE id = ? AND isDeleted = 0',
      [body.boardId]
    );
    if (tablice.length === 0) {
      return { blad: 'Tablica nie istnieje' };
    }
  }
  const assigneeId = body.assigneeId || null;
  if (assigneeId !== null) {
    const [osoby] = await pool.query('SELECT id FROM users WHERE id = ?', [assigneeId]);
    if (osoby.length === 0) {
      return { blad: 'Osoba nie istnieje' };
    }
  }
  return {
    dane: {
      title,
      description: body.description || null,
      status,
      priority,
      deadline,
      assigneeId
    }
  };
}

// Lista zadan tablicy (bez usunietych)
router.get('/boards/:boardId/tasks', async (req, res, next) => {
  try {
    const [tablice] = await pool.query(
      'SELECT id FROM boards WHERE id = ? AND isDeleted = 0',
      [req.params.boardId]
    );
    if (tablice.length === 0) {
      return res.status(404).json({ error: 'Nie znaleziono tablicy' });
    }
    const [zadania] = await pool.query(
      `SELECT ${KOLUMNY} FROM tasks WHERE boardId = ? AND isDeleted = 0`,
      [req.params.boardId]
    );
    res.json(zadania);
  } catch (err) {
    next(err);
  }
});

// Szczegoly zadania
router.get('/tasks/:id', async (req, res, next) => {
  try {
    const [zadania] = await pool.query(
      `SELECT ${KOLUMNY} FROM tasks WHERE id = ? AND isDeleted = 0`,
      [req.params.id]
    );
    if (zadania.length === 0) {
      return res.status(404).json({ error: 'Nie znaleziono zadania' });
    }
    res.json(zadania[0]);
  } catch (err) {
    next(err);
  }
});

// Dodawanie zadania
router.post('/tasks', async (req, res, next) => {
  try {
    const { blad, dane } = await sprawdzZadanie(req.body, true);
    if (blad) {
      return res.status(400).json({ error: blad });
    }
    const [wynik] = await pool.query(
      'INSERT INTO tasks (title, description, status, priority, deadline, boardId, assigneeId) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?)',
      [dane.title, dane.description, dane.status, dane.priority, dane.deadline,
        req.body.boardId, dane.assigneeId]
    );
    res.status(201).json({ id: wynik.insertId, ...dane, boardId: req.body.boardId });
  } catch (err) {
    next(err);
  }
});

// Zmiana zadania (tablicy nie zmieniamy)
router.put('/tasks/:id', async (req, res, next) => {
  try {
    const { blad, dane } = await sprawdzZadanie(req.body, false);
    if (blad) {
      return res.status(400).json({ error: blad });
    }
    const [wynik] = await pool.query(
      'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, ' +
        'deadline = ?, assigneeId = ? WHERE id = ? AND isDeleted = 0',
      [dane.title, dane.description, dane.status, dane.priority, dane.deadline,
        dane.assigneeId, req.params.id]
    );
    if (wynik.affectedRows === 0) {
      return res.status(404).json({ error: 'Nie znaleziono zadania' });
    }
    res.json({ id: Number(req.params.id), ...dane });
  } catch (err) {
    next(err);
  }
});

// Soft delete: rekord zostaje w bazie z isDeleted = 1
router.delete('/tasks/:id', async (req, res, next) => {
  try {
    const [wynik] = await pool.query(
      'UPDATE tasks SET isDeleted = 1, deletedAt = NOW(), deletedById = 1 ' +
        'WHERE id = ? AND isDeleted = 0',
      [req.params.id]
    );
    if (wynik.affectedRows === 0) {
      return res.status(404).json({ error: 'Nie znaleziono zadania' });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
