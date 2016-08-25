var bodyParser	= require('body-parser');
var express 	= require('express');
var fs			= require('fs');
var path		= require('path');
var request		= require('request');
var router		= express.Router();
var mongodb		= require('mongodb');

router.use(bodyParser.urlencoded({ extended: false}))
router.use(express.static(path.join(__dirname, '..', 'public')));
router.use(function(req, res, next) { //Middleware to ensure a valid session
  if(req.session.userName == undefined){
    res.redirect('/login');
    return;
  }
  next();
});

router.get('/', function(req, res){

	pathToFile = path.join(__dirname, '..', 'public', 'images');
	
	res.render('imageDash', {
      layout: req.session.layout,
		title: 'Photo Library',
		direct: getDirectories(pathToFile),
		feed: getFiles(pathToFile),
	})
})

function getFiles(srcpath){
	return fs.readdirSync(srcpath).filter(function(file){
		return fs.statSync(path.join(srcpath, file)).isFile();
	});
} 

function getDirectories(srcpath){
	return fs.readdirSync(srcpath).filter(function(file){
		return fs.statSync(path.join(srcpath, file)).isDirectory();
	});
}


module.exports = router