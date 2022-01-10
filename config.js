const dotenv = require('dotenv');
const assert = require('assert');

dotenv.config();


const {
    PORT,
    HOST,
    HOST_URL,
    KEY_ID,
    KEY_SECRET,
    EMAILID,
    PASSWORD
} = process.env;

assert(PORT, 'PORT is required');
assert(HOST, 'HOST is required');

module.exports = {
    port: PORT,
    host: HOST,
    url: HOST_URL,
    key_id: KEY_ID,
    key_secret: KEY_SECRET,
    email_id: EMAILID,
    password: PASSWORD

}