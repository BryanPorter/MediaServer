var assert		= require('assert');
var bodyParser	= require('body-parser');
var express 	= require('express');
var exphbs 		= require('express-handlebars');
var path    	= require('path');
var session		= require('client-sessions');

var movieRoutes	= require('./routes/movies');
var musicRoutes = require('./routes/music');
var photoRoutes = require('./routes/photos');
var db 			= require('./db')

var app 		= express()

app.use( session ({
   cookieName: 'session',
   secret: 'OBabwUaC!wcpwnfcBOibuir&fawnGa', //RWE300
   duration: 120*60*1000,
   activeDuration: 60*60*1000
})); 

app.engine('handlebars', exphbs({defaultLayout: 'base'}));
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, 'public')));

app.use('/movies', movieRoutes)
app.use('/music', musicRoutes)
app.use('/photos', photoRoutes)


app.get('/', function(req, res) {
   res.render('videoDash', {
	   layout: 'auth_base',
	   title: 'Home Page'  
   })
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
//      process.exit(1)
		app.listen(3030)
   } else {
      app.listen(3030, function() {
         console.log('Listening on port 3030...')
      })
   }
})
