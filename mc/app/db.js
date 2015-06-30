var MongoClient = require('mongodb').MongoClient;
var async = require('async');
var ObjectId = require('mongodb').ObjectID;

function DB(host, port) {
	this.host = host;
	this.port = port;
}

DB.getConnects = function(url, callback){
	MongoClient.connect(url, function(err, db) {
		callback(err, db);
	});
};


DB.getDbs = function(connect, callback) {
	var adminDb = connect.admin();

	adminDb.listDatabases(function(err, dbs) {
		// connect.close();
		callback(err, dbs.databases);
	});
};

DB.getCollections = function(connect, dbName, callback) {
	var testDb = connect.db(dbName);

	testDb.collections(function(err, results) {
		// connect.close();
		console.log(results);
		callback(err, results);
	});
};

DB.getDocumentsCount = function(dbName, collectionName, callback, query) {
	console.log(dbName, collectionName);
	var url = 'mongodb://localhost/'+dbName;

	MongoClient.connect(url, function(err, db) {
		var collection = db.collection(collectionName);
		
		if(query = undefined){
			query = {};
		}

		collection.count(query, function(err, n) {
			if(err){
				return callback(err, n);
			}
		    callback(null, n);
		}); 
	});
};


DB.getDocuments = function(dbName, collectionName, index, count, callback, query) {
	console.log(dbName, collectionName);
	var url = 'mongodb://localhost/'+dbName;

	MongoClient.connect(url, function(err, db) {
		var collection = db.collection(collectionName);

		if(query = undefined){
			query = {};
		}
		
		collection.find(query, null, index, count).toArray(function(err, docs) {
			if(err){
				return callback(err, null);
			}
		    callback(null, docs);
		}); 
	});
};

DB.getDocumentsById = function(dbName, collectionName, id, callback) {
	console.log(dbName, collectionName);
	var url = 'mongodb://localhost/'+dbName;

	MongoClient.connect(url, function(err, db) {
		var collection = db.collection(collectionName);

		collection.find({"_id": new ObjectId(id) }, null, 0, 1).toArray(function(err, docs) {
		    if(err){
				return callback(err, null);
			}
		    callback(null, docs);
		});
	});
};

module.exports = DB;