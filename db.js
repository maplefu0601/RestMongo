
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/ta');


module.exports = db;

