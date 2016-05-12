var bodyParser	= require('body-parser');
var express 	= require('express');
var fs			= require('fs');
var path		= require('path');
var request		= require('request');
var router		= express.Router();
var mongodb		= require('mongodb');

router.use(bodyParser.urlencoded({ extended: false}))
router.use(express.static(path.join(__dirname, '..\public')));

router.get('/', function(req, res){

   pathToFile = path.join(__dirname, '..', 'public', 'videos');

	res.render('dashboard', {
		layout: 'auth_base',
		title: 'Movie Library',
		feed: getFiles(pathToFile),
		direct: getDirectories(pathToFile)
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