const orderModel = require('../models/orderModel');
const utilities = require('../utilities/'); // Убедитесь, что это правильно подключено

async function createOrder(req, res, next) {
    try {
        const { customer_id, order_total } = req.body;
        const newOrder = await orderModel.createOrder(customer_id, order_total);
        res.status(201).json(newOrder);
    } catch (error) {
        next(error);
    }
}

async function getOrders(req, res, next) {
    try {
        const { customer_id } = req.params;
        const orders = await orderModel.getOrdersByCustomerId(customer_id);
        const nav = await utilities.getNav(); // Добавьте получение навигации
        res.render('orders', { title: 'Orders', nav, orders });
    } catch (error) {
        next(error);
    }
}

async function getOrder(req, res, next) {
    try {
        const { order_id } = req.params;
        const order = await orderModel.getOrderById(order_id);
        res.json(order);
    } catch (error) {
        next(error);
    }
}

async function updateOrder(req, res, next) {
    try {
        const { order_id, order_total } = req.body;
        const updatedOrder = await orderModel.updateOrder(order_id, order_total);
        res.json(updatedOrder);
    } catch (error) {
        next(error);
    }
}

async function deleteOrder(req, res, next) {
    try {
        const { order_id } = req.body;
        const deleteCount = await orderModel.deleteOrder(order_id);
        res.json({ deleteCount });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createOrder,
    getOrders,
    getOrder,
    updateOrder,
    deleteOrder
};