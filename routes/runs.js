const express = require('express');
const router = express.Router();
const redirectLogin = require('../middleware/redirectLogin');
const dbUtils = require('../utils/dbUtils');
const goalUtils = require('../utils/goalUtils');
//ADD RUN
router.get('/add', redirectLogin, (req, res) => {
  res.render('addRun.ejs', { errorsToDisplay: '' });
});
//VIEW RUN DETAILS
router.get('/:id', async (req, res) => {
  const run = await dbUtils.getRunById(req.params.id);
  const user = run.user;
  res.render('runDetails.ejs', {
    run,
    user,
    isOwner: req.session.loggedUser?.userID == user.userID,
  });
});
//RUN ADDED
router.post('/added', redirectLogin, async (req, res) => {
  const userID = req.session.loggedUser.userID;
  const { distanceKm, durationMinutes, dateOfRun } = req.body;
  await dbUtils.addRun(userID, distanceKm, durationMinutes, dateOfRun);
  await goalUtils.checkAllUserGoals(userID);
  res.redirect((process.env.BASE_PATH || '') + `/profile/${userID}`);
});
router.post('/deleted/:id', redirectLogin, async (req, res) => {
  const runID = req.params.id;
  const userID = req.session.loggedUser.userID;
  await dbUtils.deleteRun(runID);
  await goalUtils.checkAllUserGoals(userID);
  res.redirect((process.env.BASE_PATH || '') + `/profile/${userID}`);
});
module.exports = router;
