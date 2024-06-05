const utilities = require("../utilities/");

const baseController = {};

baseController.buildHome = async function(req, res) {
  try {
    let nav = await utilities.getNav();
    res.render("index", {
      title: "Home",
      nav,
    });
  } catch (err) {
    console.error('Error building home page', err);
    res.status(500).render("errors/error", {
      title: "Server Error",
      message: "Oh no! There was a crash. Maybe try a different route?",
      nav: [],
    });
  }
};

module.exports = baseController;