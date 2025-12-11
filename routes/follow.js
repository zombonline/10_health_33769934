const express = require("express");
const redirectLogin = require("../middleware/redirectLogin");
const dbUtils = require("../utils/dbUtils");
const router = express.Router();

// FOLLOW
router.post("/:ID", redirectLogin, async (req, res) => {
  const userID = req.session.loggedUser.userID;
  await dbUtils.follow(userID, req.params.ID);
  res.redirect(req.get("Referrer"));
});

// UNFOLLOW
router.delete("/:ID", redirectLogin, async (req, res) => {
  const userID = req.session.loggedUser.userID;
  await dbUtils.unfollow(userID, req.params.ID);
  res.redirect(req.get("Referrer"));
});

module.exports = router;
