var bcrypt	 	= require('bcryptjs');
var bodyParser	= require('body-parser');
var express 	= require('express');
var http		= require('http');
var path		= require('path');
var request		= require('request');
var router		= express.Router();
var mongodb		= require('mongodb');


var Users = require('../models/users');
var cfg			= require('../config');

router.use(bodyParser.urlencoded({ extended: false}))
router.use(bodyParser.json());


router.get('/', function(req, res) {
   if(req.session.userName){
      res.redirect('/movies');
   }
   else{
      var message = req.session.message;
      delete req.session.message;

      res.render('home', {
         layout: 'auth_base',
         title: 'Home Page',
         message: message
      }); 
   }
})

router.get('/login', function(req, res){
   if(req.session.userName){
      res.redirect('/movies');
   }
   else{
      var message = req.session.message;
      delete req.session.message;

      res.render('login', {
         layout: 'auth_base',
         title: 'User Login',
         message: message
      });
   }
})

router.post('/login', function(req, res) {
   var user = req.body.userName;
	
   Users.findOne({'userName': user}, 'users', function(results) {
      if(!results){
         req.session.message = 'Invalid username';
         res.redirect('/login');
      } else {
		  console.log(results.password)
         if(bcrypt.compareSync(req.body.password, results.password)){
            if(results.activated){
               req.session.userName = results.userName;
               if(req.session.userName == cfg.admin){
                  req.session.layout = 'admin_base';  //Gives the admin access to elevated rights navbar
               }
			   else{
				   req.session.layout = 'base';
			   }
               res.redirect('/movies');
            }
            else {
               req.session.message = 'Account has not been activated. Contact the administrator for access to the site';
               res.redirect('/');
            }
         }
         else {
            req.session.message = 'Password does not match given username';
            res.redirect('/login');			 
         }
      }
   })
})

router.get('/logout', function(req, res){
	delete req.session.userName;
	res.redirect('/');
})

router.get('/newuser', function(req, res) {
   var message = req.session.message;
   delete req.session.message;

   res.render('new_user', {
      layout: 'auth_base',
      title: 'Create New Account',
	  message: message
   });
})

router.post('/newuser', function(req, res) {

   var user = req.body;
   if(user.password != user.repassword) {
      req.session.message = 'Passwords must match';
      res.redirect('/newuser');
   }
   else if(user.userName.length < 8 || user.password.length < 8) {
      req.session.message = 'Username and password must be at least 8 characters long';
      res.redirect('/newuser');	   
   }
   else {
      delete req.body.repassword;
   
      Users.findOne({'userName': user.userName}, 'users', function(document) {
         if(!document){
            user.activated = false;
			var salt = bcrypt.genSaltSync(10);
			user.password = bcrypt.hashSync(user.password, salt);
			console.log(user.password);
            Users.insert(user, 'users', function(result) {
               req.session.message = 'Account creation successful. Contact your administrator to gain access to the site';
               res.redirect('/');
            });
         } else {
            req.session.message = 'Please select a different username'
            res.redirect('/newuser');
         }
      })
   }
})

//***************************** External Endpoints *****************************//

router.post('/newacct', function(req, res) {
  var user = req.body;
  if(user.password != user.repassword) {
    res.status(400);
    res.send('Password must match');
  }
  else if(user.userName.length < 8 || user.password.length < 8) {
    res.status(400);
    res.send('Username and password must be at least 8 characters long');
  }
  else {
    delete req.body.repassword;
  
    Users.findOne({'userName': user.userName}, 'users', function(document) {
      if(!document){
        user.activated = false;
		    var salt = bcrypt.genSaltSync(10);
			  user.password = bcrypt.hashSync(user.password, salt);

        Users.insert(user, 'users', function(result) {
          res.send('Account creation successful! Contact your administrator to gain site access');
        });
      } else {
        res.status(400);
        res.send('Account creation unsuccessful, please try different credentials');
      }
    })
  }
});

router.post('/getlogin', function(req, res) {
  var user = req.body.userName;
	
  Users.findOne({'userName': user}, 'users', function(results) {
    if(!results){
      res.status(400);
      res.send('Invalid username');
    } else {
      if(bcrypt.compareSync(req.body.password, results.password)){
        if(results.activated){
          req.session.userName = results.userName;
          var response = {};
          if(req.session.userName == cfg.admin){
            response.admin = true;
            response.message = 'You have just logged in as the site admin';
          }
			    else{
				    response.admin = false;
            response.message = 'Login successful!';
			    }
          res.send(response);
        }
        else {
               res.status(400);
               res.send('Your account has not been activated. Contact the administrator for access to the site');
        }
      }
      else {
        res.status(400);
        res.send('Password does not match given username');
      }
    }
  })
})


module.exports = router;