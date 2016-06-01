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


router.get('/', function(req, res) {
   var message = req.session.message;
   delete req.session.message;

   res.render('home', {
	   layout: 'auth_base',
	   title: 'Home Page',
       message: message
   }); 
})

router.get('/login', function(req, res){
   var message = req.session.message;
   delete req.session.message;

   res.render('login', {
      layout: 'auth_base',
      title: 'User Login',
      message: message
   });
})

router.post('/login', function(req, res) {
	var user = req.body;
	Users.findOne(user, 'users', function(results) {
      if(!results){
         req.session.message = 'Incorrect Username or password';
         res.redirect('/login');
      } else {
         if(results.activated){
            req.session.userName = results.userName;
            if(req.session.userName == cfg.admin){
               req.session.admin = true;
            }
            res.redirect('/movies');
         }
         else {
            req.session.message = 'Account has not been activated. Contact the administrator for access to the site';
			res.redirect('/');
		 }
      }
   })
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
   else if(user.userName.length < 8) {
      req.session.message = 'Username must be at least 8 characters long';
      res.redirect('/newuser');	   
   }
   else if(user.password.length < 8) {
      req.session.message = 'Password must be at least 8 characters long';
      res.redirect('/newuser');   
   }
   else {
      delete req.body.repassword;
   
      Users.findOne({'userName': user.userName}, 'users', function(document) {
         if(!document){
            user.activated = false;
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

module.exports = router;