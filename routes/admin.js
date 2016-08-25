//This file contains all routing information for admin pages
var bodyParser	= require('body-parser');
var express 	= require('express');
var fs			= require('fs');
var http		= require('http');
var path		= require('path');
var request		= require('request');
var router		= express.Router();
var mongodb		= require('mongodb');


var Users = require('../models/users');
var cfg			= require('../config');

router.use(bodyParser.urlencoded({ extended: false}))
router.use(express.static(path.join(__dirname, '..', 'public')));
router.use(function(req, res, next) { //Middleware to ensure a valid session
  if(req.session.userName != cfg.admin){
    req.session.message = 'You are not authorized to access admin pages';
    res.redirect('/');
    return;
  }
  next();
});

var logFile = '';


router.get('/', function(req, res) {  //Used for general site management and access to logging
  var message = req.session.message;
  delete req.session.message;
	  
  if(logFile == ''){
	  var logging = 'This is the log file';
		  //find logging in file
	}

  res.render('admin_home', {
    layout: req.session.layout,
    title: 'Site Administration',
    message: message,
    logs: logFile
  }); 
})

router.get('/users', function(req, res) { //used for the management of user accounts
  var message = req.session.message;
  delete req.session.message;

  res.render('admin_users', {
    layout: req.session.layout,
    title: 'Site Administration',
    message: message
  }); 
})

router.get('/videos', function(req, res) { //used for management of video file information
  var message = req.session.message;
  delete req.session.message;

  res.render('admin_videos', {
    layout: req.session.layout,
    title: 'Home Page',
    message: message
  }); 
})

module.exports = router;