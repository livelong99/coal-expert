const { google } = require('googleapis');
const keys = require("../keys2.json");

const client = new google.auth.JWT(
    keys.client_email,
    null,
    keys.private_key,
    ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/documents']
);

var sheetAuth = 0; 
client.authorize(function(err, tokens){
    if(err){
        console.log(err);
        return;
    }
    else{
        console.log('Connected!');
        // getSheets(client);       
        sheetAuth = 1; 
    }
});

async function printDocTitle(cl) {
    const docs = google.docs({version: 'v1', auth: client});

    let newDoc = await docs.documents.create({title: "NewDocCreated"});

    // let doc = await docs.documents.get({
    //   documentId: '1EOhbkEtiu3-TIYYbXDmYn-nU4v20Ha8znGENnaTT8RM',
    // });

    console.log(`The title of the document is: ${newDoc.data.title}`);

    return(newDoc.data);
  }


const getSheets = async (cl) => {

    const gsapi = google.sheets({version: 'v4', auth: cl});

    const opt = {
        spreadsheetId: '1Nl4821OKXoKFFWV9_qoB2SGt7rMp343yzrqwqYbURQY',
        range: 'Form responses 1',
    }

    let data = await gsapi.spreadsheets.values.get(opt);
    return data.data.values;
}

const GetExcelData = async (req, res) => {

    var OrderId = req.query.OrderId;

    if(sheetAuth===1){
        var sheetvalues = await getSheets(client);

        // var doc = await printDocTitle(client)
        var sheetObj = {};

        sheetvalues.map((val, index) => {
            if(index !== 0){
                sheetObj[val[8]] = {
                    "Timestamp": val[0],
                    "Number of Characters": val[1],
                    "Number of Words": val[2],
                    "Number of Sentences": val[3],
                    "Reading Time": val[4],
                    "Readability Score": val[5],
                    "Overall Text Score": val[6],
                    "docLink": val[7]
                } 
            }
        })

        console.log(OrderId);

        res.json({orderRes: sheetObj[OrderId]});
    }
  }

module.exports = {
    GetExcelData
}