// Create a new router
const express = require("express");
const router = express.Router();
const sortUtils = require("../utils/sortUtils");

// Handle the main routes
router.get("/", async (req, res) => {
  const feed = await sortUtils.getUserFeed(
    req.session.loggedUser ? req.session.loggedUser.userID : null
  );
  res.render("index.ejs", {
    feed: feed,
  });
});

router.get("/about", (req, res) => {
  res.render("about.ejs");
});


// Export the router object so index.js can access it
module.exports = router;
