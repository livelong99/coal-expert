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
    },[db]);

    res.json(arr);
    
  }

  const AddShip = async (req, res) => {

    var shipData = req.body.data;

    db.collection('Ships').doc(shipData.id).set(shipData);

    res.json(arr);
    
  }

  module.exports = {
      GetShipData
  }