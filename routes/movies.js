var bodyParser	= require('body-parser');
var express 	= require('express');
var fs			= require('fs');
var http		= require('http');
var path		= require('path');
var request		= require('request');
var router		= express.Router();
var mongodb		= require('mongodb');
var url			= require('url');

router.use(bodyParser.urlencoded({ extended: false}))
router.use(express.static(path.join(__dirname, '..', 'public')));

router.get('/', function(req, res){
	
   req.session.lastPage = 'videos';
   pathToDir = path.join(__dirname,'../public/', req.session.lastPage);

	res.render('videoDash', {
		layout: 'auth_base',
		title: 'Movie Library',
		feed: getFiles(pathToDir),
		direct: getDirectories(pathToDir)
	})
})

router.post('/', function(req, res){
 
	pathToFile = path.join(__dirname, '../public/', req.session.lastPage, req.body.pathToFile);
	req.session.lastPage = path.join(req.session.lastPage, req.body.pathToFile);

	res.render('videoDash', {
		layout: 'auth_base',
		title: 'Movie Library',
		feed: getFiles(pathToFile),
		direct: getDirectories(pathToFile)
	});
})

router.post('/watch', function(req, res) {
	res.render('videoPlayer', {
		layout: 'auth_base',
		title: req.body.title,
		source: path.join(req.session.lastPage, req.body.title)
	});
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