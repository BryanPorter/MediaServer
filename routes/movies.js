var bodyParser	= require('body-parser');
var express 	= require('express');
var fs			= require('fs');
var http		= require('http');
var multer		= require('multer'); //Used for uploading files
var path		= require('path');
var request		= require('request');
var router		= express.Router();
var mongodb		= require('mongodb');
var url			= require('url');

var Users = require('../models/users');
var listOfMimetypes = ['video/mp4', 'video/quicktime'];

router.use(bodyParser.urlencoded({ extended: false}))
router.use(express.static(path.join(__dirname, '..', 'public')));

var storage = multer.diskStorage({
   destination: function(req, file, callback){
      callback(null, './public/videos');
   },
   filename: function(req, file, callback){
//      console.log(req.session.userName + ' submitted: ' + file.originalname);
//      console.log(file);
      var object = file;
      object.fileName = file.fieldname + '-' + Date.now();
      object.title = req.body.title;
      object.courtesy = req.session.userName;
      Users.insert(object, 'videos', function(result){
         callback(null, object.fileName);
      });
   }
});
var upload = multer({storage: storage}).single('userVideo');


router.get('/', function(req, res){
   var message = req.session.message;
   delete req.session.message;

   var userName = req.session.userName;
   if(userName == undefined){
      res.redirect('/');
   }
   else {
      req.session.lastPage = 'videos';
      pathToDir = path.join(__dirname,'../public/', req.session.lastPage);

      Users.find('videos', function(collection) {
         for(var k in collection){
            if(listOfMimetypes.indexOf(collection[k].mimetype) == -1){
               console.log(collection[k]);
			   fs.unlink('./public/videos/' + collection[k].fileName);
			   Users.remove('videos', collection[k]);
			   collection.splice(k, 1);
			   console.log('removed a document');
            }
		 }
         res.render('videoDash', {
            layout: 'auth_base',
            title: 'Movie Library',
            feed: collection,
            username: userName,
            message: message
         });
      });
   }
})

router.post('/', function(req, res){
   delete req.session.message;

   var userName = req.session.userName;
   if(userName == undefined){
      res.redirect('/');
   }
   else {
      pathToFile = path.join(__dirname, '../public/', req.session.lastPage, req.body.pathToFile);
      req.session.lastPage = path.join(req.session.lastPage, req.body.pathToFile);

      Users.find('videos', function(collection) {
         res.render('videoDash', {
            layout: 'auth_base',
            title: 'Movie Library',
            feed: collection,
            username: userName
         });
      });
   }
})

router.post('/watch', function(req, res) {
   delete req.session.message;

   var userName = req.session.userName;
   if(userName == undefined){
      res.redirect('/');
   }
   else {
      Users.findOne({'fileName': req.body.item}, 'videos', function(item) {
         if(!item){
            res.redirect('/videos/');
		    console.log('Error finding video in the database');
         } else {
            res.render('videoPlayer', {
               layout: 'auth_base',
               item: item,
               source: path.join(req.session.lastPage, item.fileName),
               username: userName
            });
		    console.log(req.session.userName + ' is watching ' + item.originalname);
         }
      })
   }
})

router.post('/upload', function(req, res){
   delete req.session.message;

   var userName = req.session.userName;
   if(userName == undefined){
      res.redirect('/');
   }
   else {
      if(req.body.title != '') {
         upload(req, res, function(err) {
            if(err) {
               req.session.message = 'Error uploading file.';
               res.redirect('/movies');
            }
            else {
               req.session.message = 'File Upload Successful';
			   res.redirect('/movies');
			}
         });
      }
      else {
         req.session.message = 'Movie title required to upload a video';
         res.redirect('/movies');
      }
   }
});

module.exports = router




