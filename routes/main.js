// Create a new router
const express = require("express");
const dbUtils = require("../utils/dbUtils");
const router = express.Router();

// Handle the main routes
router.get("/", (req, res) => {
    res.render("index.ejs")
}); 

router.get("/about", (req, res) => {
    res.render("about.ejs")
});
router.get("/profile/:userID", async (req, res) => {
    try {
        // Load user from DB
        const user = await dbUtils.getUserById(req.params.userID);

        // Load the user's runs
        const runs = await dbUtils.getRunsByUserId(user.userID);

        // Render profile page
        res.render("profile.ejs", {
            user,
            runs,
            isOwner: req.session.loggedUser?.userID == user.userID
        });

    } catch (err) {
        console.error(err);
        res.status(404).send("User not found");
    }
});


// Export the router object so index.js can access it
module.exports = router;