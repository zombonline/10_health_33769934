const express = require("express");
const router = express.Router();
const sortUtils = require("../utils/sortUtils");

//HOME
router.get("/", async (req, res) => {
  const feed = await sortUtils.getUserFeed(
    req.session.loggedUser ? req.session.loggedUser.userID : null
  );
  res.render("index.ejs", {
    feed: feed,
  });
});
//ABOUT
router.get("/about", (req, res) => {
  res.render("about.ejs");
});

module.exports = router;
