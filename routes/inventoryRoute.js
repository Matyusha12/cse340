const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const { body } = require('express-validator');

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
router.get('/', invController.buildManagement);

// Route to display inventory detail
router.get("/detail/:inventoryId", invController.displayInventoryDetail);

// Route to build add classification view and post classification
router.get('/add-classification', invController.buildAddClassification);
router.post('/add-classification', [
    body('classification_name').isAlphanumeric().withMessage('Classification name must contain only letters and numbers.')
], invController.addClassification);

// Route to build add inventory view and post inventory
router.get('/add-inventory', invController.buildAddInventory);
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
], invController.addInventory);

module.exports = router;
