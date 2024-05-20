const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to display inventory detail
router.get("/detail/:inventoryId", invController.displayInventoryDetail);

// Trigger a test error
router.get("/trigger-error", (req, res, next) => {
  try {
    throw new Error("Test Error for 500 response");
  } catch (error) {
    next(error);
  }
});

module.exports = router;

