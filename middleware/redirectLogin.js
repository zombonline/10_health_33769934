function redirectLogin(req, res, next) {
    if (!req.session.loggedUser) {
      res.redirect((process.env.BASE_PATH || '') + '/auth');
    } else { 
        next ();
    } 
}
module.exports = redirectLogin;