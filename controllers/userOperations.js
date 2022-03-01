const firebase = require('../db');


var db = firebase.firestore();

const checkUserInfo = async (req, res) => {

    var uid = req.body.uid;

    await db.collection('Users').doc(uid)
      .get().then(
          doc => {
              if(doc.exists)
                res.json({result: true});
              else{
                res.json({result: false});
              }                                      
          }
      )
}

const saveUsrInfo = async (req, res) => {
    var userDet = req.body.userDet;

    await db.collection('Users').doc(userDet.id).set(userDet);

    res.json({status: "ok"});
}

const getUsrInfo = async (req, res) => {
  var uid = req.query.uid;

  var usrInfo = await db.collection('Users').doc(uid).get()
  .then(snapshot => {
    res.json({data: snapshot.data()});
  });
}

const getUsers = async (req, res) => {

  let arr = [];

    db.collection('Users')
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

module.exports = {
  checkUserInfo,
  saveUsrInfo,
  getUsrInfo,
  getUsers
}