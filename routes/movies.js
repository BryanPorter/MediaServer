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
var cfg = require('../config')
var listOfMimetypes = ['video/mp4', 'video/quicktime'];
var defaultImage = 'http://findicons.com/files/icons/1261/sticker_system/128/movie.png';

router.use(bodyParser.urlencoded({ extended: false}));
router.use(express.static(path.join(__dirname, '..', 'public')));
router.use(function(req, res, next) { //Middleware to ensure a valid session
  if(req.session.userName == undefined){
    res.status(400);
    return res.send('Your session is invalid');
    
  }
  next();
});

var storage = multer.diskStorage({
   destination: function(req, file, callback){
      callback(null, './public/videos');
   },
   filename: function(req, file, callback){
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

      req.session.lastPage = 'videos';
      pathToDir = path.join(__dirname,'../public/', req.session.lastPage);

      Users.find('videos', function(collection) {
         var customCollection = [];
         for(var k in collection){
            if(listOfMimetypes.indexOf(collection[k].mimetype) == -1){
			   fs.unlink('./public/videos/' + collection[k].fileName);
			   Users.remove('videos', collection[k]);
			   collection.splice(k, 1);
			   console.log('removed a document' + Date());
            }
            if(collection[k].Poster == defaultImage){
				customCollection.push(collection[k]);
				collection.splice(k, 1);
			}
		 }
         collection.sort(function(a, b) {
            var titleA = a.Title.toUpperCase();
            var titleB = b.Title.toUpperCase();
            return (titleA < titleB) ? -1 : (titleA > titleB) ? 1 : 0;
        });
         res.render('videoDash', {
            layout: req.session.layout,
            title: 'Movie Library',
            feed: collection,
            customFeed: customCollection,
            username: req.session.userName,
            message: message
         });
      });
})


router.post('/watch', function(req, res) {
   delete req.session.message;

      Users.findOne({'fileName': req.body.item}, 'videos', function(item) {
         if(!item){
		    console.log('Error finding video in the database' + Date());
            res.redirect('/movies/');
         } else {
            console.log(req.session.userName + ' is watching ' + item.Title);
            console.log(path.join(req.session.lastPage, item.fileName));
            res.render('videoPlayer', {
               layout: req.session.layout,
               item: item,
               source: path.join(req.session.lastPage, item.fileName),
               username: req.session.userName
            });
         }
      })
})

router.post('/upload', function(req, res){
   delete req.session.message;

      if(req.body.title != '') {
         upload(req, res, function(err) {
            if(err) {
               req.session.message = 'Error uploading file.';
               res.redirect('/movies');
            }
            else {
        var options = {
          url: 'http://api.themoviedb.org/3/search/movie?api_key=' + cfg.mdbKey + '&query=' + req.body.Title,
          page: 5,
          include_adult: false
        }
			   request.get(options, function(error, response, body){
				   var feed = JSON.parse(body);
				   console.log(feed);
           

				   feed.results[0].fileName = req.file.fileName;
				   
                   res.render('editMedia',{
                         layout: req.session.layout,
                         message: 'File Upload Successful',
                         type: 'movies',
                         object: feed.results[0]
                     });

			   })
			}
         });
      }
      else {
         req.session.message = 'Movie title required to upload a video';
         res.redirect('/movies');
      }
});


router.post('/editInfo', function(req, res){
  delete req.session.message;

  if(req.body.submit == 'Edit Information'){
     delete req.body.submit;
     Users.findOne(req.body, 'videos', function(item) {
        if(!item){
       console.log('Error finding video in the database' + Date());
           res.redirect('/movies/');
        }
        else {
          console.log(item);
           res.render('editMedia', {
              layout: req.session.layout,
              type: 'movies',
              object: item
           })
      }
     })
  }
  else{
     if(req.body.title != '') {
        var options = {
           url: 'http://api.themoviedb.org/3/search/movie?api_key=' + cfg.mdbKey + '&include_adult=false&query='+ req.body.title,
           headers: {
              'Accept': 'application/json',
           }
        }
        request(options, function(error, response, body){
           var feed = JSON.parse(body);
     console.log(feed);
           feed.results[0].fileName = req.body.fileName;
      
           if(feed.results[0].response == 'False'){
              feed.results[0].poster_path = 'http://findicons.com/files/icons/1261/sticker_system/128/movie.png';
           }
           res.render('editMedia',{
              layout: req.session.layout,
              type: 'movies',
              object: feed.results[0],
           });
        })
     }
     else {
     //Delete uploaded video before redirecting
        req.session.message = 'Movie title required to search for information';
//            res.redirect('/movies');
     }
  }
});

router.post('/edit', function(req, res) {
   delete req.body.submit;

   if(req.body.PosterImage == 'on'){
      req.body.poster_path = 'http://findicons.com/files/icons/1261/sticker_system/128/movie.png';
   }
   delete req.body.PosterImage;
   Users.update(req.body, 'videos', function() {
      console.log(req.session.userName + ' changed the information for ' + req.body.Title + Date());
      res.redirect('/movies');
   })
});


//***************************** External Endpoints *****************************//

router.get('/get_image/', function(req, res){
	var imageId = req.query.image_id;

  var options = {
      url: 'http://image.tmdb.org/t/p/original' + imageId + '?api_key=' + cfg.mdbKey   
   }
   request(options).pipe(res);
})

router.get('/get_image_size/', function(req, res){
  var options = {
    url: 'http://api.themoviedb.org/3/configuration?api_key=' + cfg.mdbKey
  }
  request(options, function(error, response, body){
    var config = JSON.parse(body);
    console.log(config);

    res.send(config.images.poster_sizes);
  });
})

router.get('/get_video_list/', function(req, res) {

  Users.find('videos', function(collection) {
    var customCollection = [];

    collection.sort(function(a, b) {
      var titleA = a.Title.toUpperCase();
      var titleB = b.Title.toUpperCase();
      return (titleA < titleB) ? -1 : (titleA > titleB) ? 1 : 0;
    });
    res.send(collection);
    return;
  });
})

router.post('/update', function(req, res) {
  delete req.body.video.submit;

  if(req.body.video.PosterImage == 'on'){
    req.body.video.poster_path = '';
    req.body.video.backdrop_path = '';
  }
  delete req.body.video.PosterImage;
  Users.update(req.body.video, 'videos', function() {
    console.log(req.session.userName + ' changed the information for ' + req.body.video.Title + Date());
    res.send('Video file successfully updated');

  })
})

router.get('/watch_movie', function(req, res){
  var videoId = req.query.video_id;
  fs.stat('public/videos/' + videoId, function(err, stats) {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.sendStatus(404);
      }
      res.end(err);
    }
    var range = req.headers.range;
    if (!range) {
      return res.sendStatus(416);
    }

    var positions = range.replace(/bytes=/, "").split("-");
    var start = parseInt(positions[0], 10);
    var total = stats.size;
    var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
    var chunksize = (end - start) + 1;

    res.writeHead(206, {
      "Content-Range": "bytes " + start + "-" + end + "/" + total,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4"
    });

    var stream = fs.createReadStream('public/videos/' + videoId, { start: start, end: end })
      .on("open", function() {
        stream.pipe(res);
      }).on("error", function(err) {
        res.end(err);
      });
  });
//  var rstream = fs.createReadStream('public/videos/' + videoId);
//  rstream.pipe(res);
});

router.post('/submit_video/', function(req, res) {
console.log(req.body);
  if(req.body.title != '') {
    upload(req, res, function(err) {
      if(err) {
        res.status(400);
        res.send('File upload was unsuccessful');
      }
      else {
        var options = {
          url: 'http://api.themoviedb.org/3/search/movie?api_key=' + cfg.mdbKey + '&query=' + req.body.Title,
          page: 5,
          include_adult: false
        }
        request.get(options, function(error, response, body){
          var feed = JSON.parse(body);
          console.log(feed);
				   
          res.send(feed);
        })
      }
    });
  }
  else {
     req.session.message = 'Movie title required to upload a video';
     res.redirect('/movies');
  }
});

router.get('/get_video_info/', function(req, res){
  Users.findOne({'fileName': req.query.videoId}, 'videos', function(item) {
    if(!item){
      res.status(404);
      res.send('Error finding video in the database' + Date());
    } else {
      delete item._id;
      console.log(req.session.userName + ' is watching ' + item.Title);
      res.send(item);
    }
  });
});

module.exports = router




