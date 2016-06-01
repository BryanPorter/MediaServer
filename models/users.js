
var assert 		= require('assert')
var db 			= require('../db')
var ObjectId 	= require('mongodb').ObjectId

exports.insert = function(user, col, callback) {
	var collection = db.get().collection(col);
	collection.insert(user, function(err, result) {
		assert.equal(err, null);
		assert.equal(1, result.result.n);
		assert.equal(1, result.ops.length);
		console.log('Inserted 1 document into collection: ' + col);
		callback(result);
	})
}

exports.findOne = function(id, col, callback) {
	var collection = db.get().collection(col);
	collection.findOne(id, function(err, document) {
		callback(document);
	});
}
 
exports.update = function(user, col, callback) {
	var collection = db.get().collection(col);

	//update the user
	collection.update({'_id': ObjectId(user._id)}, user, function(err, result) {
		assert.equal(err, null);
		assert.equal(1, result.result.n);
		callback(result);
	})
}

exports.find = function(col, callback) {
	var collection = db.get().collection(col);
	var foo = collection.find().toArray( function(err, docs) {
		assert.equal(null, err);
		callback(docs);
	});
}

exports.remove = function(col, doc) {
	var collection = db.get().collection(col);
	collection.remove(doc, 1);
}




