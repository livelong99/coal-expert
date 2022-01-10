const express = require('express');
const Razorpay = require('razorpay')
const {
  GetShipData
} = require("../controllers/adminPortal")
const shortid = require('shortid')
const cors = require('cors')
const bodyParser = require('body-parser');


const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));

router.use(cors())

  router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
  });

  router.get('/get-ship-data', GetShipData)


module.exports = {
    routes : router
}