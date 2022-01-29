const express = require('express');
const Razorpay = require('razorpay')
const {
  GetShipData,
  AddShip
} = require("../controllers/adminPortal")
const shortid = require('shortid')
const cors = require('cors')
const bodyParser = require('body-parser');
const { 
  checkUserInfo, 
  saveUsrInfo, 
  getUsrInfo 
} = require('../controllers/userOperations');
const { 
  orderSuccess, 
  setOrder, 
  getOrders
} = require('../controllers/orderProcess');


const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));

router.use(cors())

  router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
  });

  router.post('/set-ship', AddShip);

  router.get('/get-ship-data', GetShipData)

  router.get('/check-user-info', checkUserInfo)

  router.post('/save-user-info', saveUsrInfo)

  router.get('/get-user-info', getUsrInfo)

  router.get('/get-orders', getOrders)

  router.post('/order-success', orderSuccess)

  router.post('/verify-payment', orderSuccess)

  router.post('/get-orderId', setOrder)


module.exports = {
    routes : router
}