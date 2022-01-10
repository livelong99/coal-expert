const express = require('express');
const cors = require('cors');
const config = require('./config');
const bodyParser = require('body-parser');
const Routes = require('./routes/routs');

const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

app.use('/', Routes.routes);



app.listen(config.port, () => console.log('App is listening on url http://localhost:' + config.port));

