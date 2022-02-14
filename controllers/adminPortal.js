const firebase = require('../db');


var db = firebase.firestore();

const GetShipData = async (req, res) => {

    let arr = [];

    db.collection('Ships')
    .get()
    .then((querySnapshot) => {
        let cartP = 0;
        querySnapshot.docs.map((doc) => {
            arr.push({ id: doc.id, value: doc.data() })
        }
        );
        console.log(arr);
        res.json(arr);
    },[db]);    
    
  }

  const AddShip = async (req, res) => {

    console.log(req.body);

    var shipData = req.body.data;

    var result = await db.collection('Ships').doc(shipData.id).set(shipData);

    console.log("Ship Added to List with Ship Id : " + shipData.id);

    res.json({status: 'ok'});
    
  }

  const Remove = async (req, res) => {

    console.log(req.body);

    var shipId = req.body.id;

    var result = await db.collection('Ships').doc(shipId).delete()

    console.log("Ship Deleted!");

    res.json({status: 'ok'});
    
  }

  module.exports = {
      GetShipData,
      AddShip,
      Remove
  }