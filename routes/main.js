const express = require('express');
const router = express.Router();
const sortUtils = require('../utils/sortUtils');
const dbutils = require('../utils/dbUtils');
//HOME
router.get('/', async (req, res) => {
  const feed = await sortUtils.getUserFeed(
    req.session.loggedUser ? req.session.loggedUser.userID : null,
  );
  let suggestedUsers = [];
  let suggestedGoals = [];
  if (req.session.loggedUser) {
    suggestedUsers = await sortUtils.getSuggestedUsers(
      req.session.loggedUser.userID,
      3,
    );
    suggestedGoals = await sortUtils.getSuggestedGoals(
      req.session.loggedUser.userID,
      3,
    );
  }
  //randomly select 5 users to suggest
  res.render('index.ejs', {
    feed: feed,
    suggestedUsers,
    suggestedGoals,
  });
});
//ABOUT
router.get('/about', (req, res) => {
  res.render('about.ejs');
});

module.exports = router;
