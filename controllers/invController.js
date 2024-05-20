const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: `${className} vehicles`,
    nav,
    grid,
  });
};

/* ***************************
 *  Display inventory item detail view
 * ************************** */
invCont.displayInventoryDetail = async (req, res, next) => {
  try {
    const inventoryId = req.params.inventoryId;
    const vehicle = await invModel.getInventoryById(inventoryId);
    if (!vehicle) {
      res.status(404).send('Vehicle not found');
      return;
    }
  
    res.render("inventory/detail", {
      title: `${vehicle.make} ${vehicle.model}`,
      vehicle,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = invCont;
