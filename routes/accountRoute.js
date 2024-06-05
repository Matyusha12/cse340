const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const regValidate = require('../utilities/account-validation');
const { body } = require('express-validator'); // Added to fix the error

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to display inventory detail
router.get("/detail/:inventoryId", invController.displayInventoryDetail);

// Deliver Login View
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Deliver Registration View
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Process the registration data
router.post(
  "/register",
  regValidate.registrationRules(), // Using the correct function name
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Deliver account management view
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildManagement));

// Trigger a test error
router.get("/trigger-error", (req, res, next) => {
  try {
    throw new Error("Test Error for 500 response");
  } catch (error) {
    next(error);
  }
});

// Build account management view
router.get('/management', utilities.handleErrors(accountController.buildAccountManagement));

// Build account update view
router.get('/update/:accountId', utilities.handleErrors(accountController.buildAccountUpdateView));

// Process account update
router.post('/update', [
  body('account_firstname').notEmpty().withMessage('First name is required.'),
  body('account_lastname').notEmpty().withMessage('Last name is required.'),
  body('account_email').isEmail().withMessage('A valid email is required.')
], utilities.handleErrors(accountController.updateAccount));

// Process password change
router.post('/change-password', [
  body('account_password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.')
], utilities.handleErrors(accountController.changePassword));

// Logout route
router.get('/logout', accountController.logout);

module.exports = router;