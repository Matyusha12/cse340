const { body, validationResult } = require('express-validator');
const accountModel = require('../models/account-model'); // Убедитесь, что этот путь правильный
const utilities = require('../utilities/');

const validate = {};

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registrationRules = () => {
  return [
    body('account_firstname').notEmpty().withMessage('Please provide a first name.'),
    body('account_lastname').notEmpty().withMessage('Please provide a last name.'),
    body('account_email')
      .isEmail()
      .withMessage('Please provide a valid email.')
      .custom(async (account_email) => {
        const account = await accountModel.getAccountByEmail(account_email);
        if (account.rowCount) {
          return Promise.reject('Email exists. Please log in or use different email.');
        }
      }),
    body('account_password')
      .isLength({ min: 12 })
      .withMessage('Password must be at least 12 characters long.')
      .matches('[0-9]')
      .withMessage('Password must contain a number.')
      .matches('[A-Z]')
      .withMessage('Password must contain an uppercase letter.')
      .matches('[^a-zA-Z0-9]')
      .withMessage('Password must contain a special character.')
  ];
};

/* ******************************
 * Check Data and Return Errors
 * ****************************** */
validate.checkRegData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render('account/register', {
      errors: errors.array(),
      title: 'Registration',
      nav,
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email,
    });
    return;
  }
  next();
};

/*  **********************************
 *  Login Data Validation Rules
 * ********************************* */
validate.loginRules = () => {
  return [
    body('account_email')
      .isEmail()
      .withMessage('Please provide a valid email.'),
    body('account_password')
      .notEmpty()
      .withMessage('Please provide a password.')
  ];
};

/* ******************************
 * Check Login Data and Return Errors
 * ****************************** */
validate.checkLoginData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render('account/login', {
      errors: errors.array(),
      title: 'Login',
      nav,
      account_email: req.body.account_email,
    });
    return;
  }
  next();
};

module.exports = validate;