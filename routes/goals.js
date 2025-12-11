const express = require("express");
const router = express.Router();
const redirectLogin = require("../middleware/redirectLogin");
const dbUtils = require("../utils/dbUtils");
const values = require("../constants/values");

//CREATE
router.get("/create", redirectLogin, (req, res) => {
  res.render("createGoal.ejs", { errorsToDisplay: "" });
});
//CREATED
router.post("/created", redirectLogin, async (req, res) => {
    const userID = req.session.loggedUser.userID;
    const { title, description, goalType, targetDistanceKm, targetPace, startDate, endDate, visibility } = req.body;
    const goalID = await dbUtils.createGoal(userID, title, description, goalType, targetDistanceKm, targetPace, startDate, endDate, visibility);
    await dbUtils.joinGoal(userID, goalID);
    res.redirect((process.env.BASE_PATH || '') + `/goals/${userID}`);
});
//JOINED
router.post("/joined/:goalId", redirectLogin, async (req, res) => {
    const userID = req.session.loggedUser.userID;
    const goalId = req.params.goalId;
    await dbUtils.joinGoal(userID, goalId);
    res.redirect((process.env.BASE_PATH || '') + `/goals/${goalId}`);
});
//LEFT
router.post("/left/:goalId", redirectLogin, async (req, res) => {
    const userID = req.session.loggedUser.userID;
    const goalId = req.params.goalId;

    await dbUtils.leaveGoal(userID, goalId);
    res.redirect((process.env.BASE_PATH || '') + `/goals/${goalId}`);
});
//VIEW GOAL
router.get("/:goalId", async (req, res) => {
    try {
        const goalId = req.params.goalId;
        const goal = await dbUtils.getGoalById(goalId);
        if (!goal) {
            return res.status(404).send("Goal not found");
        }
        const loggedUser = req.session.loggedUser;
        const loggedUserGoalProgress = loggedUser?
            await dbUtils.getUserGoalProgress(loggedUser.userID, goalId).catch(() => null)
            : null;
        const members = await dbUtils.getUsersInGoal(goalId);
        res.render("goalDetails.ejs", {
            goal,
            loggedUserGoalProgress,
            members, 
            loggedUser: req.session.loggedUser
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading goal");
    }
});


module.exports = router;