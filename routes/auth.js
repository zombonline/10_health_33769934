const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const dbUtils = require('../utils/dbUtils');
const wrap = require('../utils/wrap');
const { check, validationResult } = require('express-validator');
const messages = require('../constants/messages');
const vals = require('../constants/values');
const redirectLogin = require('../middleware/redirectLogin');

//AUTH PAGE
router.get('/', (req, res) => {
  const mode = req.query.mode || 'login'; 
  if (req.session.loggedUser) {
    return res.redirect((process.env.BASE_PATH || '') + '/');
  }
  res.render('auth.ejs', { mode, errorsToDisplay: '' });
});
//HANDLE LOGIN
router.post('/login', async (req, res) => {
  //check if user exists
  const existing = await dbUtils
    .getUserByUsername(req.body.username)
    .catch(() => null);
  if (!existing) {
    return res.render('auth.ejs', {
      mode: 'login',
      errorsToDisplay: [messages.AUTH.LOGIN.USER_NOT_FOUND],
    });
  }
  const creds = await dbUtils.getUserLoginCredentialsByUsername(
    req.body.username,
  );
  if (!creds) {
    return res.render('auth.ejs', {
      mode: 'login',
      errorsToDisplay: [messages.AUTH.LOGIN.USER_NOT_FOUND],
    });
  }
  const match = await bcrypt.compare(req.body.password, creds.hashedPassword);
  if (!match) {
    return res.render('auth.ejs', {
      mode: 'login',
      errorsToDisplay: [messages.AUTH.LOGIN.INVALID_PASSWORD],
    });
  }
  const user = await dbUtils.getUserByUsername(req.body.username);
  req.session.loggedUser = user;
  res.redirect((process.env.BASE_PATH || '') + '/');
});
//HANDLE REGISTRATION
router.post(
  '/register',
  [
    check('username')
      .isLength({ min: vals.MIN_USERNAME_LENGTH })
      .withMessage(
        messages.AUTH.REGISTRATION.USERNAME_TOO_SHORT(vals.MIN_USERNAME_LENGTH),
      ),
    check('password')
      .isLength({ min: vals.MIN_PASSWORD_LENGTH })
      .withMessage(
        messages.AUTH.REGISTRATION.PASSWORD_TOO_SHORT(vals.MIN_PASSWORD_LENGTH),
      ),
    check('email')
      .isEmail()
      .withMessage(messages.AUTH.REGISTRATION.INVALID_EMAIL),
  ],
  wrap(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      {
        return res.render('auth.ejs', {
          mode: 'register',
          errorsToDisplay: errors.array().map((e) => e.msg),
        });
      }
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await dbUtils.createUser(
      req.body.username,
      hashedPassword,
      req.body.email,
    );
    req.session.loggedUser = user;
    res.redirect((process.env.BASE_PATH || '') + '/');
  }),
);
//HANDLE LOGOUT
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send(messages.AUTH.LOGOUT.FAILED);
    }
    res.redirect((process.env.BASE_PATH || '') + '/');
  });
});

module.exports = router;
