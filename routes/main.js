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


// Export the router object so index.js can access it
module.exports = router;
