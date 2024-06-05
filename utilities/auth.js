const jwt = require('jsonwebtoken');
require('dotenv').config();

function checkAccountType(req, res, next) {
  if (req.cookies.jwt) {
    jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET, function(err, decodedToken) {
      if (err) {
        req.flash('notice', 'Please log in');
        return res.redirect('/account/login');
      }
      if (decodedToken.account_type === 'Employee' || decodedToken.account_type === 'Admin') {
        next();
      } else {
        req.flash('notice', 'You do not have permission to view this page.');
        return res.redirect('/account/login');
      }
    });
  } else {
    req.flash('notice', 'Please log in');
    return res.redirect('/account/login');
  }
}

module.exports = { checkAccountType };