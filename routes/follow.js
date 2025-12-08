const express = require("express");
const redirectLogin = require("../middleware/redirectLogin");
const dbUtils = require("../utils/dbUtils");
const { route } = require("./auth");
const router = express.Router();

router.post("/:targetID", redirectLogin, async (req, res) => {
  const loggedUserID = req.session.loggedUser.userID;
  const followTargetID = req.params.targetID;
  await dbUtils.follow(loggedUserID, followTargetID);
  res.redirect(`/profile/${followTargetID}`);
});

router.delete("/:targetID", redirectLogin, async (req, res) => {
  const loggedUserID = req.session.loggedUser.userID;
  const followTargetID = req.params.targetID;
  await dbUtils.unfollow(loggedUserID, followTargetID);
  res.redirect(`/profile/${followTargetID}`);
});

router.get("/followers/:userID", async (req, res) => {
  const userID = req.params.userID;
  const followers = await dbUtils.getFollowers(userID);
  res.json({ followers });
});

router.get("/following/:userID", async (req, res) => {
  const userID = req.params.userID;
  const following = await dbUtils.getFollowing(userID);
  res.json({ following });
});

module.exports = router;
