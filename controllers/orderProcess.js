const shortid = require('shortid');
const firebase = require('../db');
const Razorpay = require('razorpay')
const config = require("../config")


var db = firebase.firestore();

const razorpay = new Razorpay({
    key_id: config.key_id,
    key_secret: config.key_secret
})


const setOrder = async (req, res, next) => {

    const amount = Math.floor(req.body.amount);
    const currency = 'INR'
    const options = {
        amount: (amount*100).toString(),
        currency: currency,
        receipt: shortid.generate()
    }

    try {
        const response = await razorpay.orders.create(options)
        console.log(response)
        res.json({
            id: response.id,
            currency: response.currency,
            amount: response.amount
        })
    } catch (error) {
        console.log(error)
        res.status(400).send(error.message);
    }
}



const orderSuccess = async (req, res) => {
    
    var userId = req.body.userId;
    var shipId = req.body.shipId;
    var amount = req.body.amount;
    var quantity = req.body.quantity;
    var orderId = req.body.orderId;    
    var transactionId = req.body.transactionId;


    var shipData = await db.collection('Ships').doc(shipId).get()
    .then(snapshot => snapshot.data());

    shipData.quantity = parseInt(shipData.quantity) - parseInt(quantity);

    var IncOrder = {
        UserId: userId,
        shipData: {...shipData, quantity: quantity},
        quantity: quantity,
        amount: amount,
        orderId: orderId,
        transactionId: transactionId,
        status: 0
    }

    await db.collection('Ships').doc(shipId).set(shipData);

    await db.collection('Orders').doc(orderId).set(IncOrder);

    await db.collection('UserActivity').doc(userId).collection('Orders').doc(orderId).set({
        orderId : orderId,
    });

    res.json({status: "ok"});
    
}

module.exports = {
    orderSuccess,
    setOrder
}