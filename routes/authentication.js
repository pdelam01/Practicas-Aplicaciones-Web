var express = require('express');
const passport = require('passport');
var router = express.Router();

/* POST user signin. */
/*
router.post('/signin', function(req, res, next) {
  console.log("HE llegadooooooooooooooooooooooooo")
  passport.authenticate('local.singin', {
    successRedirect: '/',
    failureRedirect: '/',
    failureFlash: true

  })(req, res, next);
});
*/



module.exports = router;
