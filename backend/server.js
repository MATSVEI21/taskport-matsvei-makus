const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const session = require('express-session');
const requireAuth = require('./middleware/requireAuth');

const app = express();
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', requireAuth, require('./routes/users'));
app.use('/api/boards', requireAuth, require('./routes/boards'));
app.use('/api', requireAuth, require('./routes/tasks'));

// strona glowna przenosi na liste tablic (bez logowania - dalej na logowanie)
app.get('/', (req, res) => res.redirect('/boards.html'));
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Błąd serwera' });
});
app.listen(3000, () => console.log('Serwer: http://localhost:3000'));
