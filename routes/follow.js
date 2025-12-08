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

module.exports = router;