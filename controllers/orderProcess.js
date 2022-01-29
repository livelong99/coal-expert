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

const getOrders = async (req, res) => {
    
    const uid = req.query.uid;

    var orderIds = [];

    await db.collection('UserActivity').doc(uid).collection('Orders')
    .get()
    .then((querySnapshot) => {
        querySnapshot.docs.map((doc) => {
            orderIds.push(doc.id)
        }
        );
        console.log(orderIds);
    },[db]); 

    var orders = []

    for (let index = 0; index < orderIds.length; index++) {
        const order = await db.collection('Orders').doc(orderIds[index]).get().then((snapshot) => (snapshot.data()));
        orders.push(order)        
    }

    // orderIds.map((id) => {
    //     var order = await ;
    //     orders.push(order);
    // })

    res.json(orders)
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
        status: transactionId=='null' ? -1 : 0
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
    setOrder,
    getOrders
}