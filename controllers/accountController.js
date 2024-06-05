const utilities = require("../utilities");
const accountModel = require('../models/account-model');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { validationResult } = require('express-validator');

const accountController = {};

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav();
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null, 
      account_email: '', 
    });
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
    account_firstname: '',
    account_lastname: '',
    account_email: '',
  });
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res, next) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.');
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }

  try {
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword // Use the hashed password here
    );

    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you\'re registered ${account_firstname}. Please log in.`
      );
      res.status(201).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email: '', 
      });
    } else {
      req.flash("notice", "Sorry, the registration failed.");
      res.status(501).render("account/register", {
        title: "Registration",
        nav,
        errors: [], 
        account_firstname,
        account_lastname,
        account_email,
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    req.flash("notice", "Sorry, there was an error processing your registration.");
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: [], 
      account_firstname,
      account_lastname,
      account_email,
    });
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
   req.flash("notice", "Please check your credentials and try again.");
   res.status(400).render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email,
   });
  return;
  }
  try {
   if (await bcrypt.compare(account_password, accountData.account_password)) {
   delete accountData.account_password;
   const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 });
   if(process.env.NODE_ENV === 'development') {
     res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
     } else {
       res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 });
     }
   return res.redirect("/account/");
   }
  } catch (error) {
   return new Error('Access Forbidden');
  }
}

/* ****************************************
 *  Deliver account management view
 * ************************************ */
async function buildManagement(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
    account_firstname: res.locals.accountData.account_firstname,
    account_lastname: res.locals.accountData.account_lastname,
    account_email: res.locals.accountData.account_email
  });
}

accountController.buildAccountManagement = async function (req, res, next) {
  const nav = await utilities.getNav();
  res.render('account/account-management', {
    title: 'Account Management',
    nav,
    accountData: res.locals.accountData
  });
};

accountController.buildAccountUpdateView = async function (req, res, next) {
  const accountId = req.params.accountId;
  const accountData = await accountModel.getAccountById(accountId);
  const nav = await utilities.getNav();
  res.render('account/update-account', {
    title: 'Update Account Information',
    nav,
    errors: null,
    accountData
  });
};

accountController.updateAccount = async function (req, res, next) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    res.render('account/update-account', {
      title: 'Update Account Information',
      nav,
      errors: errors.array(),
      accountData: { account_id, account_firstname, account_lastname, account_email }
    });
    return;
  }

  const updateResult = await accountModel.updateAccount({
    account_id,
    account_firstname,
    account_lastname,
    account_email
  });

  if (updateResult) {
    req.flash('notice', 'Account updated successfully.');
    res.redirect('/account/management');
  } else {
    req.flash('notice', 'Account update failed.');
    res.redirect(`/account/update/${account_id}`);
  }
};

accountController.changePassword = async function (req, res, next) {
  const { account_id, account_password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    res.render('account/update-account', {
      title: 'Update Account Information',
      nav,
      errors: errors.array(),
      accountData: await accountModel.getAccountById(account_id)
    });
    return;
  }

  const hashedPassword = await bcrypt.hash(account_password, 10);
  const changePasswordResult = await accountModel.changePassword(account_id, hashedPassword);

  if (changePasswordResult) {
    req.flash('notice', 'Password changed successfully.');
    res.redirect('/account/management');
  } else {
    req.flash('notice', 'Password change failed.');
    res.redirect(`/account/update/${account_id}`);
  }
};

accountController.logout = async function (req, res, next) {
  res.clearCookie('jwt');
  res.redirect('/');
};

module.exports = accountController;