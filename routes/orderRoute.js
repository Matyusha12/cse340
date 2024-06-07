const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/create', orderController.createOrder);
router.get('/customer/:customer_id', orderController.getOrders);
router.get('/:order_id', orderController.getOrder);
router.put('/update', orderController.updateOrder);
router.delete('/delete', orderController.deleteOrder);

module.exports = router;