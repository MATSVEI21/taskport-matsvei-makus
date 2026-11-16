// Przepuszcza tylko zalogowanych uzytkownikow (sesja z userId)
module.exports = function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Musisz sie zalogowac' });
  }
  next();
};
