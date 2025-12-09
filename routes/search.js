const express = require("express");
const redirectLogin = require("../middleware/redirectLogin");
const dbUtils = require("../utils/dbUtils");
const router = express.Router();
const messages = require("../constants/messages");
// Search route
router.get("/", async (req, res) => {
    const query = req.query.q || "";
    const results = await dbUtils.searchUsers(query);
    const searchQuery = req.sanitize(query);
    res.render("searchResults.ejs", { users: results, searchQuery: searchQuery, usersEmptyMessage: messages.SEARCH.NO_USERS_FOUND });
});


module.exports = router;