const utilities = require("../utilities");
const inventoryModel = require('../models/inventory-model');
const { validationResult } = require('express-validator');

const invCont = {};

// Build inventory by classification view
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await inventoryModel.getInventoryByClassificationId(classification_id);
  if (!data || data.length === 0) {
    return res.status(404).send('Classification not found');
  }
  const grid = await utilities.buildClassificationGrid(data);
  const nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("inventory/classification", {
    title: `${className} vehicles`,
    nav,
    grid,
  });
};

// Display inventory item detail view
invCont.displayInventoryDetail = async (req, res, next) => {
  try {
    const inventoryId = req.params.inventoryId;
    const vehicle = await inventoryModel.getInventoryById(inventoryId);
    if (!vehicle) {
      return res.status(404).send('Vehicle not found');
    }
    res.render("inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      vehicle,
    });
  } catch (error) {
    next(error);
  }
};

// Build management view
invCont.buildManagement = async function(req, res, next) {
  let nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList(); // Инициализация переменной
  res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      flashMessage: req.flash('notice'),
      classificationSelect, // Использование переменной
      errors: null
  });
}

// Build add classification view
invCont.buildAddClassification = async function(req, res, next) {
  let nav = await utilities.getNav();
  res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
      classification_name: ''
  });
}

// Add classification to the database
invCont.addClassification = async function(req, res, next) {
  let nav = await utilities.getNav();
  const { classification_name } = req.body;

  let errors = validationResult(req);
  if (!errors.isEmpty()) {
      res.render("inventory/add-classification", {
          title: "Add Classification",
          nav,
          errors: errors.array(),
          classification_name
      });
      return;
  }

  try {
      const result = await inventoryModel.addClassification(classification_name);
      if (result) {
          req.flash('notice', 'Classification added successfully.');
          res.redirect('/inv/');
      } else {
          req.flash('notice', 'Failed to add classification.');
          res.render("inventory/add-classification", {
              title: "Add Classification",
              nav,
              errors: [],
              classification_name
          });
      }
  } catch (error) {
      console.error("Error adding classification:", error);
      req.flash('notice', 'Error adding classification.');
      res.render("inventory/add-classification", {
          title: "Add Classification",
          nav,
          errors: [],
          classification_name
      });
  }
}

// Build add inventory view
invCont.buildAddInventory = async function(req, res, next) {
  let nav = await utilities.getNav();
  const classificationList = await utilities.buildClassificationList();
  res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      errors: null,
      classificationList,
      classification_id: '',
      inv_make: '',
      inv_model: '',
      inv_year: '',
      inv_description: '',
      inv_image: '',
      inv_thumbnail: '',
      inv_price: '',
      inv_miles: '',
      inv_color: ''
  });
}

// Add inventory to the database
invCont.addInventory = async function(req, res, next) {
  let nav = await utilities.getNav();
  const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body;

  let errors = validationResult(req);
  if (!errors.isEmpty()) {
      res.render("inventory/add-inventory", {
          title: "Add Inventory",
          nav,
          errors: errors.array(),
          classificationList: await utilities.buildClassificationList(classification_id),
          classification_id,
          inv_make,
          inv_model,
          inv_year,
          inv_description,
          inv_image,
          inv_thumbnail,
          inv_price,
          inv_miles,
          inv_color
      });
      return;
  }

  try {
      const result = await inventoryModel.addInventory({
          classification_id,
          inv_make,
          inv_model,
          inv_year,
          inv_description,
          inv_image,
          inv_thumbnail,
          inv_price,
          inv_miles,
          inv_color
      });
      if (result) {
          req.flash('notice', 'Inventory item added successfully.');
          res.redirect('/inv/');
      } else {
          req.flash('notice', 'Failed to add inventory item.');
          res.render("inventory/add-inventory", {
              title: "Add Inventory",
              nav,
              errors: [],
              classificationList: await utilities.buildClassificationList(classification_id),
              classification_id,
              inv_make,
              inv_model,
              inv_year,
              inv_description,
              inv_image,
              inv_thumbnail,
              inv_price,
              inv_miles,
              inv_color
          });
      }
  } catch (error) {
      console.error("Error adding inventory item:", error);
      req.flash('notice', 'Error adding inventory item.');
      res.render("inventory/add-inventory", {
          title: "Add Inventory",
          nav,
          errors: [],
          classificationList: await utilities.buildClassificationList(classification_id),
          classification_id,
          inv_make,
          inv_model,
          inv_year,
          inv_description,
          inv_image,
          inv_thumbnail,
          inv_price,
          inv_miles,
          inv_color
      });
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await inventoryModel.getInventoryByClassificationId(classification_id);
  if (invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  let nav = await utilities.getNav();
  const itemData = await inventoryModel.getInventoryById(inv_id);
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id);
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  });
};

module.exports = invCont;