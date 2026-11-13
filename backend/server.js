const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');

const app = express();
app.use(express.json());
app.use('/api/boards', require('./routes/boards'));
app.use('/api', require('./routes/tasks'));
app.use('/api/users', require('./routes/users'));
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Błąd serwera' });
});
app.listen(3000, () => console.log('Serwer: http://localhost:3000'));