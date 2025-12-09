const express = require("express");
const dbUtils = require("../utils/dbUtils");
const router = express.Router();

router.get("/:userID", async (req, res) => {
  try {
    const view = req.query.view || "runs"; // "runs" | "followers" | "following"

    const loggedUserID = req.session.loggedUser?.userID || null;

    // Fetch profile with all nested data
    const user = await dbUtils.getFullUserProfileByID(req.params.userID, loggedUserID);

    res.render("profile.ejs", {
      user,
      runs: user.runs,
      followers: user.followers,
      following: user.following,
      loggedUser: req.session.loggedUser,
      isOwner: loggedUserID === user.userID,
      isFollowing: user.isFollowing,
      view
    });

  } catch (err) {
    console.error(err);
    res.status(404).send("User not found");
  }
});

module.exports = router;
