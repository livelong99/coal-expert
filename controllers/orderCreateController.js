const firebase = require('../db');
const Razorpay = require('razorpay')
const shortid = require('shortid')
const config = require("../config")
var ID = require("nodejs-unique-numeric-id-generator")
var nodemailer = require('nodemailer');



var db = firebase.firestore();

const razorpay = new Razorpay({
    key_id: config.key_id,
    key_secret: config.key_secret
  })

  var transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "ee82c43bd451d8",
      pass: "31033f6c5f88b8"
    }
  });


const setOrder = async (req, res, next) => {

    console.log(req);
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

const verify = async (req, res) => {
    const secret = 'Iz@rt12'
  
    uid = req.body.payload.payment.entity.userId
    // var uid = req.body.UserId;

    const result = await fullfill(uid);

    console.log(result);
  
    // const crypto = require('crypto')
  
    // const shasum = crypto.createHmac('sha256',secret)
    // shasum.update(JSON.stringify(req.body))
    // const digest = shasum.digest('hex')
  
    // console.log(digest, req.headers['x-razorpay-signature'])
  
    // if(digest == req.headers['x-razorpay-signature']){
    //   console.log('request is legit')
    // }
    // else{
    // }
  
     res.json({status: 'ok'})
  }

  const fullfill = (uid) => {
    
    db.collection('Fulfill').doc(uid).set({
      message: "Payment Successfull"
    })
    .then(() => {
      return 1;
    })
  } 

  const deleteFulfill = async (req, res) => {
    var uid = req.body.UserId;
    db.collection('Fulfill').doc(uid).delete();
    console.log("Deleted fulfill : " + uid);

    res.json({status: 'ok'});
  }

  const checkOrderID = async (req, res) => {
    var orderId = ID.generate(new Date().toJSON())
    var exist = true;
    while(exist){
        var result = await db.collection('Orders').doc(orderId)
        .get().then(
        doc => {
            if(doc.exists)
                orderId = ID.generate(new Date().toJSON())
            else
                exist = false;
        }
    )
    }
    console.log("OrderId Checked : " + orderId);

    res.json({
        status: 'ok',
        orderId: orderId
    });
  }

  const AddOrderToFirebase = async (req,res) => {
      var paymentDetails = req.body.paymentDet;
      var orderDetails = req.body.orderDet;
      var orderId = req.body.orderId;
      var delivery = req.body.delivery;

      var result = await db.collection('Order').doc(orderId).set({
        orderId: orderId,
        orderDetails: orderDetails,
        deliveryData: delivery,
        paymentDetails: paymentDetails,
        state: 0
    })

    
    console.log("Order Added to Orders with OrderId : " + orderId);

    res.json({status: 'ok'});
  }

  const ConnectCartWithOrders = async (req,res) => {
    var uid = req.body.UserId;
    var orderId = req.body.orderId;
    var timeStamp = req.body.timeStamp;

    var result = await db.collection('Cart').doc(uid).collection('Orders').add({
        created: timeStamp,
        orderId: orderId
    })

    
    console.log("OrderId Added to Cart : " + orderId);

    res.json({status: 'ok'});
  } 

  const DeleteFromCart = async (req,res) => {
      var uid = req.body.UserId;
      var itemId = req.body.ItemId;

      var result = await db.collection('Cart').doc(uid).collection('Items').doc(itemId).delete();

      
    console.log("Cart Item Deleted with Item ID : " + itemId);

      res.json({status: 'ok'});
  }

  const GetOrderItem = async (req,res) => {
    var OrderId = req.body.OrderId;

    console.log(req.body);

    console.log(OrderId);

    var result = await db.collection('Order').doc(OrderId).get()
      .then((doc) => doc.data())
      .catch((err) => (console.log(err)));
    
    if(result.state === 0 || result.state===null){
      let td = new Date();
      let dt = new Date(result.deliveryData.deliveryDate);
      if(dt < td){
        result.state = 1;
        
        var rest = await db.collection('Order').doc(OrderId).set({...result, state: 1});
      }
    }
    
      console.log(result);

    res.json({data: result});
}

const ProcessChange = async (req, res) => {
  var OrderId = req.body.OrderId;
  var status = req.body.status;

  console.log(req.body);

  var result = await db.collection('Order').doc(OrderId).get()
      .then((doc) => doc.data())
      .catch((err) => (console.log(err)));

  if(status === 1){
    result.state = 3;
    result.reviewed = 1;
  }
  else if(status === 2){
    result.state = result.state + 1;
    result.reviewed = 0;
  } 

  var rest = await db.collection('Order').doc(OrderId).set(result);

  res.json({result : "Ok"});

}

  const sendOrderConfirmationMail = async (req, res) => {

    var OrderId = req.body.OrderId;

    var result = await db.collection('Order').doc(OrderId).get()
      .then((doc) => doc.data())
      .catch((err) => (console.log(err)));

    var objString = "";

    if(result.orderDetails.main.product == "Article"){
      objString = objString + "Project Name : \n" + result.orderDetails.main.productName + "\n\nProduct : \n" + result.orderDetails.main.product + "\n\n\nTopic : \n" + result.orderDetails.main.data.topic + "\n\nVoice : \n" + result.orderDetails.main.data.voice + "\n\nIndustry : \n" + result.orderDetails.main.data.industry + "\n\nReference : \n" + result.orderDetails.main.data.Reference ;
    }


    var mailOptions = {
        from: "vvvccc1999@gmail.com",
        to: 'va11251999@gmail.com',
        subject: result.orderDetails.main.productName + " - " + result.orderDetails.main.product + " - " + OrderId,
        text: objString
      };

    transport.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
    });
    
    res.json({result: "ok"});
  }

  // const checkForChange = async (res,res) => {
  //   var OrderId = req.body.OrderId;

  //   var result = await db.collection('Order').doc(OrderId).get()
  //     .then(())
  // }

  const finalOrder = async (req, res) => {
    var OrderId = req.body.OrderId;

    var result = await db.collection('Order').doc(OrderId).get()
      .then((doc) => doc.data())
      .catch((err) => (console.log(err)));

      if(result.state < 4){
        result.state = result.state + 1;
        
        
      }    
  }


  

module.exports = {
    setOrder,
    verify,
    deleteFulfill,
    checkOrderID,
    AddOrderToFirebase,
    ConnectCartWithOrders,
    DeleteFromCart,
    ProcessChange,
    sendOrderConfirmationMail,
    GetOrderItem
}