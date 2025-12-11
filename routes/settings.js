const express = require("express");
const router = express.Router();
const redirectLogin = require("../middleware/redirectLogin");
const dbUtils = require("../utils/dbUtils");
const { check, validationResult } = require("express-validator");
const messages = require("../constants/messages");
const values = require("../constants/values");
const bcrypt = require("bcrypt");
const profilePics = require("../utils/profilePics");

router.get("/", redirectLogin, (req, res) => {
  res.render("settings.ejs", { errorsToDisplay: [], successMessagesToDisplay: [] });
});

router.post("/username", redirectLogin, check("newUsername").isLength({ min: values.MIN_USERNAME_LENGTH }).withMessage(messages.AUTH.REGISTRATION.USERNAME_TOO_SHORT(values.MIN_USERNAME_LENGTH)), async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.render("settings.ejs", { errorsToDisplay: errors.array().map(e => e.msg), successMessagesToDisplay: [] });   
    }
    const newUsername = req.body.newUsername;
    const existing = await dbUtils.getUserByUsername(newUsername).catch(() => null);
    if (existing) {
        return res.render("settings.ejs", {
        errorsToDisplay: [messages.AUTH.REGISTRATION.USER_EXISTS],
        successMessagesToDisplay: []
        });
    }
    const userID = req.session.loggedUser.userID;
    await dbUtils.updateUserSetting("username", newUsername, userID);
    req.session.loggedUser.username = newUsername;
    res.render("settings.ejs", { errorsToDisplay: [], successMessagesToDisplay: [messages.AUTH.UPDATE.USERNAME_UPDATED_SUCCESSFULLY] });
});


router.post("/password", redirectLogin, check("newPassword").isLength({ min: values.MIN_PASSWORD_LENGTH }).withMessage(messages.AUTH.REGISTRATION.PASSWORD_TOO_SHORT(values.MIN_PASSWORD_LENGTH)), async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.render("settings.ejs", { errorsToDisplay: errors.array().map(e => e.msg), successMessagesToDisplay: [] });   
    }
    //compare inputted current password with stored hashed password
    const currentPassword = req.body.currentPassword;
    const userID = req.session.loggedUser.userID;
    const creds = await dbUtils.getUserLoginCredentialsByUsername(req.session.loggedUser.username);
    const match = await bcrypt.compare(currentPassword, creds.hashedPassword);
    if (!match) {   
        return res.render("settings.ejs", { errorsToDisplay: [messages.AUTH.LOGIN.INVALID_PASSWORD], successMessagesToDisplay: [] });
    }
    const newPassword = req.body.newPassword;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await dbUtils.updateUserSetting("hashed_password", hashedPassword, userID);
    res.render("settings.ejs", { errorsToDisplay: [], successMessagesToDisplay: [messages.AUTH.UPDATE.PASSWORD_UPDATED_SUCCESSFULLY] });
});


router.post("/email", redirectLogin, check("newEmail").isEmail().withMessage(messages.AUTH.REGISTRATION.INVALID_EMAIL), async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.render("settings.ejs", { errorsToDisplay: errors.array().map(e => e.msg), successMessagesToDisplay: [] });   
    }   
    const newEmail = req.body.newEmail;
    const userID = req.session.loggedUser.userID;
    await dbUtils.updateUserSetting("email", newEmail, userID);
    res.render("settings.ejs", { errorsToDisplay: [], successMessagesToDisplay: [messages.AUTH.UPDATE.EMAIL_UPDATED_SUCCESSFULLY] });
});


router.post("/fullname", redirectLogin, async (req, res) => {
    const newFirstName = req.body.newFirstName || null;
    const newLastName = req.body.newLastName || null;   
    const userID = req.session.loggedUser.userID;
    await dbUtils.updateUserSetting("first_name", newFirstName, userID);
    await dbUtils.updateUserSetting("last_name", newLastName, userID);
    req.session.loggedUser.firstName = newFirstName;
    req.session.loggedUser.lastName = newLastName;
    res.render("settings.ejs", { errorsToDisplay: [], successMessagesToDisplay: [messages.AUTH.UPDATE.NAME_UPDATED_SUCCESSFULLY] });
});

router.post("/profile-picture",
    redirectLogin,
    (req, res, next) => {
        profilePics.uploadProfilePic(req, res, async (err) => {
            if (err) {
                console.error("Upload error:", err);
                return res.status(400).send("Something went wrong uploading the file.");
            }

            if (!req.file) {
                return res.status(400).send("No file uploaded.");
            }

            try {
                const userID = req.session.loggedUser.userID;
                const oldUrl = req.session.loggedUser.profileImageUrl;

                const newUrl = profilePics.getProfileImageUrlFromFile(req.file);

                await dbUtils.updateUserSetting("profile_image_url", newUrl, userID);
                req.session.loggedUser.profileImageUrl = newUrl;

                profilePics.deleteProfileImageByUrl(oldUrl);

                res.redirect((process.env.BASE_PATH || "") + "/auth/settings");
            } catch (e) {
                console.error(e);
                next(e);
            }
        });
    }
);


module.exports = router;