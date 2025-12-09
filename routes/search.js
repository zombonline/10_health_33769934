const express = require("express");
const redirectLogin = require("../middleware/redirectLogin");
const dbUtils = require("../utils/dbUtils");
const router = express.Router();

// Search route
router.get("/", async (req, res) => {
    const query = req.query.q || "";
    const results = await dbUtils.searchUsers(query);
    res.json(results);
});


module.exports = router;