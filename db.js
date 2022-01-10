var admin = require("firebase-admin");
var serviceAccount = require("./serviceKey.json");

const firebase = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

module.exports = firebase;