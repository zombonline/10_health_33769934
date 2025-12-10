const express = require("express");
const redirectLogin = require("../middleware/redirectLogin");
const dbUtils = require("../utils/dbUtils");
const router = express.Router();

// FOLLOW
router.post("/:ID", redirectLogin, async (req, res) => {
  const ID = req.session.loggedUser.ID;
  await dbUtils.follow(ID, req.params.ID);
  res.redirect(req.get("Referrer"));
});

// UNFOLLOW
router.delete("/:ID", redirectLogin, async (req, res) => {
  const ID = req.session.loggedUser.ID;
  await dbUtils.unfollow(ID, req.params.ID);
  res.redirect(req.get("Referrer"));
});

module.exports = router;
