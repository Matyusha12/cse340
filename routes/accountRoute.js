const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const regValidate = require('../utilities/account-validation');

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
  regValidate.registrationRules(), // Используем правильное имя функции
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

// Trigger a test error
router.get("/trigger-error", (req, res, next) => {
  try {
    throw new Error("Test Error for 500 response");
  } catch (error) {
    next(error);
  }
});

module.exports = router;