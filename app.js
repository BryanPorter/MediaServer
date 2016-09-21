var assert		= require('assert');
var bodyParser	= require('body-parser');
var express 	= require('express');
var exphbs 		= require('express-handlebars');
var path    	= require('path');
var session		= require('client-sessions');

var cfg			= require('./config');
var db 			= require('./db');
var adminRoutes	= require('./routes/admin');
var movieRoutes	= require('./routes/movies');
var musicRoutes = require('./routes/music');
var photoRoutes = require('./routes/photos');
var indexRoutes	= require('./routes/index');
var Users		= require('./models/users');

var app 		= express()

app.use( session ({
   cookieName: 'session',
   secret: cfg.secret, //RWE300
   duration: 120*60*1000,
   activeDuration: 60*60*1000
})); 

app.engine('handlebars', exphbs({defaultLayout: 'base'}));
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: false}))
app.use(express.static(path.join(__dirname, 'public')));
 
app.use('/', indexRoutes);
app.use('/admin', adminRoutes);
app.use('/movies', movieRoutes);
app.use('/music', musicRoutes);
app.use('/photos', photoRoutes);


db.connect('mongodb://user:' + cfg.mongo_pw + '@ds023042.mlab.com:23042/mediaserver', function(err) {

   if(err) {
      console.log('Unable to connect to Mongo')
	  console.log(err);
      process.exit(1)
   } else {
      app.listen(3030, function() {
         console.log('Listening on port 3030...')
      })
   }
})
