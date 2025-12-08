// Create a new router
const express = require("express");
const dbUtils = require("../utils/dbUtils");
const router = express.Router();

// Handle the main routes
router.get("/", async (req, res) => {
  res.render("index.ejs", {
    recentRuns: req.session.loggedUser
      ? await dbUtils.getRunsByUserId(
          req.session.loggedUser.userID,
          5,
          "recent"
        )
      : [],
    followingRuns: req.session.loggedUser
      ? await dbUtils.getRunsByFollowing(req.session.loggedUser.userID, 5)
      : [],
  });
});

router.get("/about", (req, res) => {
  res.render("about.ejs");
});
router.get("/profile/:userID", async (req, res) => {
  try {
    // Load user from DB
    const user = await dbUtils.getUserById(req.params.userID);

    // Load the user's runs
    const runs = await dbUtils.getRunsByUserId(user.userID);

    const followers = await dbUtils.getFollowers(user.userID);
    const following = await dbUtils.getFollowing(user.userID);

    // Render profile page
    res.render("profile.ejs", {
      user,
      runs,
      isOwner: req.session.loggedUser?.userID == user.userID,
      followers,
      following,
      isFollowing: req.session.loggedUser
        ? await dbUtils.isFollowing(req.session.loggedUser.userID, user.userID)
        : false,
    });
  } catch (err) {
    console.error(err);
    res.status(404).send("User not found");
  }
});

// Export the router object so index.js can access it
module.exports = router;
