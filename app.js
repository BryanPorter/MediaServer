var assert	= require('assert');
var bodyParser	= require('body-parser');
var express 	= require('express');
var exphbs 	= require('express-handlebars');
// var MongoClient	= require('mongodb').MongoClient;

var db = require('./db')
var Users = require('./models/users')

app.engine('handlebars', exphbs({defaultLayout: 'base'}));
app.set('view engine', 'handlbars');

app.use(body

