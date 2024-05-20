// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")


// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

router.get('/detail/:inventoryId', invController.displayInventoryDetail);
router.get('/trigger-error', (req, res) => {
    throw new Error('Test Error for 500 response');
  });

module.exports = router;

