const pool = require("../database/");

async function createOrder(customer_id, order_total) {
    const sql = `
        INSERT INTO orders (customer_id, order_total)
        VALUES ($1, $2)
        RETURNING *`;
    const params = [customer_id, order_total];
    const result = await pool.query(sql, params);
    return result.rows[0];
}

async function getOrdersByCustomerId(customer_id) {
    const sql = `SELECT * FROM orders WHERE customer_id = $1`;
    const params = [customer_id];
    const result = await pool.query(sql, params);
    return result.rows;
}

async function getOrderById(order_id) {
    const sql = `SELECT * FROM orders WHERE order_id = $1`;
    const params = [order_id];
    const result = await pool.query(sql, params);
    return result.rows[0];
}

async function updateOrder(order_id, order_total) {
    const sql = `
        UPDATE orders 
        SET order_total = $1, updated_at = CURRENT_TIMESTAMP
        WHERE order_id = $2
        RETURNING *`;
    const params = [order_total, order_id];
    const result = await pool.query(sql, params);
    return result.rows[0];
}

async function deleteOrder(order_id) {
    const sql = `DELETE FROM orders WHERE order_id = $1`;
    const params = [order_id];
    const result = await pool.query(sql, params);
    return result.rowCount;
}

module.exports = {
    createOrder,
    getOrdersByCustomerId,
    getOrderById,
    updateOrder,
    deleteOrder
};