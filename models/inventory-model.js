const pool = require("../database");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  try {
    const result = await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
    return result.rows;
  } catch (error) {
    console.error("Error fetching classifications", error);
    throw error;
  }
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const result = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    );
    return result.rows;
  } catch (error) {
    console.error("getInventoryByClassificationId error " + error);
    throw error;
  }
}

/* ***************************
 *  Get inventory item by id
 * ************************** */
async function getInventoryById(inventoryId) {
  try {
    const result = await pool.query('SELECT * FROM inventory WHERE inv_id = $1', [inventoryId]);
    return result.rows[0];
  } catch (error) {
    console.error("getInventoryById error " + error);
    throw error;
  }
}

/* ***************************
 *  Add new inventory item
 * ************************** */
async function addInventory(inventory) {
  const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = inventory;
  try {
    const result = await pool.query(
      `INSERT INTO public.inventory (classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color]
    );
    return result.rowCount > 0;
  } catch (error) {
    console.error('addInventory error ' + error);
    throw error;
  }
}

/* ***************************
 *  Add new classification
 * ************************** */
async function addClassification(classification_name) {
  try {
    const result = await pool.query(
      `INSERT INTO public.classification (classification_name)
       VALUES ($1)`,
      [classification_name]
    );
    return result.rowCount > 0;
  } catch (error) {
    console.error('addClassification error ' + error);
    throw error;
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *";
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
    ]);
    return data.rows[0];
  } catch (error) {
    console.error("model error: " + error);
    throw error;
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryById,
  addInventory,
  addClassification,
  updateInventory
};
