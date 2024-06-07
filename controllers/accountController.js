const utilities = require("../utilities");
const accountModel = require('../models/account-model');
const inventoryModel = require('../models/inventory-model'); // Добавьте это, если у вас есть inventory-model для работы с данными инвентаря
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { validationResult } = require('express-validator');

const accountController = {};

/* ****************************************
 *  Deliver login view
 * *************************************** */
accountController.buildLogin = async function(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: [],
    account_email: '',
  });
};

/* ****************************************
 *  Deliver registration view
 * *************************************** */
accountController.buildRegister = async function(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: [],
    account_firstname: '',
    account_lastname: '',
    account_email: '',
  });
};

/* ****************************************
 *  Process Registration
 * *************************************** */
accountController.registerAccount = async function(req, res, next) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.');
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      errors: [],
      account_firstname,
      account_lastname,
      account_email,
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
        `Congratulations, you're registered ${account_firstname}. Please log in.`
      );
      return res.status(201).render("account/login", {
        title: "Login",
        nav,
        errors: [],
        account_email: '', 
      });
    } else {
      req.flash("notice", "Sorry, the registration failed.");
      return res.status(501).render("account/register", {
        title: "Register",
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
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      errors: [],
      account_firstname,
      account_lastname,
      account_email,
    });
  }
};

/* ****************************************
 *  Process login request
 * ************************************ */
accountController.accountLogin = async function(req, res) {
  console.log("Login process started");
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  console.log("Received email:", account_email);
  
  // Проверка на наличие ошибок валидации
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Validation errors:", errors.array());
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: errors.array(),
      account_email,
    });
  }

  // Проверка, что поля не пустые
  if (!account_email || !account_password) {
    console.log("Email or password is missing");
    req.flash("notice", "Email and password are required.");
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: [{ msg: "Email and password are required." }],
      account_email,
    });
  }

  const accountData = await accountModel.getAccountByEmail(account_email);
  console.log("Account data retrieved:", accountData);
  if (!accountData || !accountData.account_password) {
    req.flash("notice", "Please check your credentials and try again.");
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: [{ msg: "Please check your credentials and try again." }],
      account_email,
    });
  }

  try {
    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password);
    if (passwordMatch) {
      console.log("Password matched");
      delete accountData.account_password;
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      console.log("Token generated");
      res.cookie("jwt", accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 3600 * 1000 });
      return res.redirect("/account/");
    } else {
      console.log("Password did not match");
      req.flash("notice", "Please check your credentials and try again.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: [{ msg: "Please check your credentials and try again." }],
        account_email,
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    req.flash("notice", "Sorry, there was an error processing your login.");
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: [{ msg: "Sorry, there was an error processing your login." }],
      account_email,
    });
  }
};

/* ****************************************
 *  Deliver account management view
 * *************************************** */
accountController.buildManagement = async function(req, res, next) {
  let nav = await utilities.getNav();
  let classificationList = await inventoryModel.getClassifications(); // Получите список классификаций
  res.render("inventory/management", {
    title: "Account Management",
    nav,
    errors: [],
    classificationList, // Передайте его в шаблон
    account_firstname: res.locals.accountData.account_firstname,
    account_lastname: res.locals.accountData.account_lastname,
    account_email: res.locals.accountData.account_email
  });
};

/* ****************************************
 *  Deliver account management view (duplicate)
 * *************************************** */
accountController.buildAccountManagement = async function(req, res, next) {
  const nav = await utilities.getNav();
  let classificationList = await inventoryModel.getClassifications(); // Получите список классификаций
  res.render('inventory/management', {
    title: 'Account Management',
    nav,
    classificationList, // Передайте его в шаблон
    accountData: res.locals.accountData
  });
};

/* ****************************************
 *  Deliver update account view
 * *************************************** */
accountController.buildAccountUpdateView = async function(req, res, next) {
  const accountId = req.params.accountId;
  const accountData = await accountModel.getAccountById(accountId);
  const nav = await utilities.getNav();
  res.render('account/update-account', {
    title: 'Update Account Information',
    nav,
    errors: [],
    accountData
  });
};

/* ****************************************
 *  Process account update
 * *************************************** */
accountController.updateAccount = async function(req, res, next) {
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

/* ****************************************
 *  Process password change
 * *************************************** */
accountController.changePassword = async function(req, res, next) {
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

/* ****************************************
 *  Logout
 * *************************************** */
accountController.logout = async function(req, res, next) {
  res.clearCookie('jwt');
  res.redirect('/');
};

module.exports = accountController;