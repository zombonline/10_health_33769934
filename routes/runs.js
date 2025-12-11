const express = require("express");
const router = express.Router();
const redirectLogin = require("../middleware/redirectLogin");
const dbUtils = require("../utils/dbUtils");

router.get("/add", redirectLogin, (req, res) => {
  res.render("addRun.ejs", { errorsToDisplay: "" });
});
router.get("/:id", async (req, res) => {
    const run = await dbUtils.getRunById(req.params.id);
    const user = run.user;
    res.render("runDetails.ejs", { run, user, isOwner: req.session.loggedUser?.userID == user.userID});
});
router.post("/added", redirectLogin, async (req, res) => {
    const userID = req.session.loggedUser.userID;
    const { distanceKm, durationMinutes, dateOfRun } =  req.body;
    await dbUtils.addRun(userID, distanceKm, durationMinutes, dateOfRun);
    res.redirect((process.env.BASE_PATH || '') + `/profile/${userID}`);
});
module.exports = router;