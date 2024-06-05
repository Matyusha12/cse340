const { body } = require('express-validator');
const accountModel = require('../models/account-model');

const registrationRules = () => {
  return [
    body('account_firstname').notEmpty().withMessage('Please provide a first name.'),
    body('account_lastname').notEmpty().withMessage('Please provide a last name.'),
    body('account_email')
      .isEmail().withMessage('Please provide a valid email.')
      .custom(async (account_email) => {
        const user = await accountModel.getAccountByEmail(account_email);
        if (user.rows.length) {
          throw new Error('Email is already in use.');
        }
      }),
    body('account_password')
      .isLength({ min: 12 }).withMessage('Password must be at least 12 characters long.')
      .matches(/[0-9]/).withMessage('Password must contain a number.')
      .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter.')
      .matches(/[a-z]/).withMessage('Password must contain a lowercase letter.')
      .matches(/[^a-zA-Z0-9]/).withMessage('Password must contain a special character.')
  ];
};

const loginRules = () => {
  return [
    body('account_email').isEmail().withMessage('Please provide a valid email.'),
    body('account_password').notEmpty().withMessage('Please provide a password.')
  ];
};

const checkRegData = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('account/register', {
      title: 'Registration',
      nav: utilities.getNav(),
      errors: errors.array(),
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email
    });
  }
  next();
};

const checkLoginData = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('account/login', {
      title: 'Login',
      nav: utilities.getNav(),
      errors: errors.array(),
      account_email: req.body.account_email
    });
  }
  next();
};

module.exports = {
  registrationRules,
  loginRules,
  checkRegData,
  checkLoginData
};