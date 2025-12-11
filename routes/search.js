const express = require('express');
const dbUtils = require('../utils/dbUtils');
const router = express.Router();
const messages = require('../constants/messages');
const sortUtils = require('../utils/sortUtils');
// Search route (optional param q for query, and type for type of search: users, goals)
router.get('/', async (req, res) => {
  const searchQuery = req.sanitize(req.query.q || '');
  const type = req.query.type || 'users'; // users, goals
  const searchResults = await sortUtils.getSearchResults(searchQuery, type);
  res.render('searchResults.ejs', {
    searchResults,
    usersEmptyMessage:
      type === 'users'
        ? messages.SEARCH.NO_USERS_FOUND
        : messages.SEARCH.NO_GOALS_FOUND,
  });
});

module.exports = router;
