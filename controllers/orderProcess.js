const shortid = require('shortid');
const firebase = require('../db');


var db = firebase.firestore();

const orderSuccess = async (req, res) => {
    
    var userId = req.body.userId;
    var shipId = req.body.shipId;
    var amount = req.body.bidAmt;


    var shipData = await db.collection('Ships').doc(shipId).get();

    shipData.quantity = parseInt(shipData.quantity) - parseInt(amount);

    var orderId = shortid.generate();

    var IncOrder = {
        UserId: userId,
        shipData: {...shipData, quantity: amount},
        quantity: amount,
        orderId: orderId,
        status: 0
    }

    await db.collection('Ships').doc(shipId).set(shipData);

    await db.collection('Orders').doc(orderId).set(IncOrder);

    await db.collection('UserActivity').doc(userId).collection('IncompleteOrders').doc(orderId).set({
        orderId : orderId,
        status: 0
    });

    res.json({status: "ok"});
    
}

module.exports = {
    orderSuccess
}