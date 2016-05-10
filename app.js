var assert	= require('assert');
var bodyParser	= require('body-parser');
var express 	= require('express');
var exphbs 	= require('express-handlebars');
var session	= require('express-session');


var db = require('./db')
// var Users = require('./models/users')

var app = express()

app.engine('handlebars', exphbs({defaultLayout: 'base'}));
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: false }))

app.use( session ({
   cookieName: 'session'
   , secret: 'OBabwUaC!wcpwnfcBOibuir&fawnGa' //RWE300
   , resave: false
   , saveUnititialized: true
}))

app.get('/', function(req, res) {
   res.render('index')
})

app.post('/', function(req, res) {
   var user = req.body
   Users.insert(user, function(results) {
      req.session.userId = results.ops[0]._id
      res.redirect('/update')
   })
})



db.connect('mongodb://user/BpiyptUftlYgtgr8@ds017852.mlab.com:17582/medservdb', function(err) {
   if(err) {
      console.log('Unable to connect to Mongo.')
      process.exit(1)
   } else {
      app.listen(3030, function() {
         console.log('Listening on port 3030...')
      })
   }
})
