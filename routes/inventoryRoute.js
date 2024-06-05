const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const { body } = require('express-validator');

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
router.get('/', utilities.handleErrors(invController.buildManagement));
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

// Route to display inventory detail
router.get("/detail/:inventoryId", utilities.handleErrors(invController.displayInventoryDetail));

// Route to build add classification view and post classification
router.get('/add-classification', utilities.handleErrors(invController.buildAddClassification));
router.post('/add-classification', [
    body('classification_name').isAlphanumeric().withMessage('Classification name must contain only letters and numbers.')
], utilities.handleErrors(invController.addClassification));

// Route to build add inventory view and post inventory
router.get('/add-inventory', utilities.handleErrors(invController.buildAddInventory));
router.post('/add-inventory', [
    body('classification_id').isNumeric().withMessage('Classification is required.'),
    body('inv_make').notEmpty().withMessage('Make is required.'),
    body('inv_model').notEmpty().withMessage('Model is required.'),
    body('inv_year').isNumeric().withMessage('Year is required.'),
    body('inv_description').notEmpty().withMessage('Description is required.'),
    body('inv_image').notEmpty().withMessage('Image is required.'),
    body('inv_thumbnail').notEmpty().withMessage('Thumbnail is required.'),
    body('inv_price').isNumeric().withMessage('Price is required.'),
    body('inv_miles').isNumeric().withMessage('Miles is required.'),
    body('inv_color').notEmpty().withMessage('Color is required.')
], utilities.handleErrors(invController.addInventory));

// Route to edit inventory item
router.get("/edit/:inv_id", utilities.handleErrors(invController.editInventoryView));

// Route to handle inventory update
router.post("/update", [
    body('classification_id').isNumeric().withMessage('Classification is required.'),
    body('inv_make').notEmpty().withMessage('Make is required.'),
    body('inv_model').notEmpty().withMessage('Model is required.'),
    body('inv_year').isNumeric().withMessage('Year is required.'),
    body('inv_description').notEmpty().withMessage('Description is required.'),
    body('inv_image').notEmpty().withMessage('Image is required.'),
    body('inv_thumbnail').notEmpty().withMessage('Thumbnail is required.'),
    body('inv_price').isNumeric().withMessage('Price is required.'),
    body('inv_miles').isNumeric().withMessage('Miles is required.'),
    body('inv_color').notEmpty().withMessage('Color is required.')
], utilities.handleErrors(invController.updateInventory));

module.exports = router;