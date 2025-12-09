const express = require("express");
const redirectLogin = require("../middleware/redirectLogin");
const dbUtils = require("../utils/dbUtils");
const router = express.Router();

// FOLLOW
router.post("/:targetID", redirectLogin, async (req, res) => {
  const loggedUserID = req.session.loggedUser.userID;
  await dbUtils.follow(loggedUserID, req.params.targetID);
  res.redirect(req.get("Referrer"));
});

// UNFOLLOW
router.delete("/:targetID", redirectLogin, async (req, res) => {
  const loggedUserID = req.session.loggedUser.userID;
  await dbUtils.unfollow(loggedUserID, req.params.targetID);
  res.redirect(req.get("Referrer"));
});

module.exports = router;
