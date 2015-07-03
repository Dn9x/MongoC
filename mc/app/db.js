var MongoClient = require('mongodb').MongoClient;
var async = require('async');
var ObjectId = require('mongodb').ObjectID;

var DB = {};

DB.collections = [];

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
	var self = this;

	testDb.collections(function(err, results) {
		// connect.close();
		// console.log(results);
		self.collections = results;
		
		callback(err, results);
	});
};

DB.getDocumentsCount = function(connect, dbName, collectionName, callback, query) {

	var collection = null;

	for(var i=0;i<this.collections.length;i++){

		if(dbName == this.collections[i].s.dbName && collectionName == this.collections[i].s.name){
			collection = this.collections[i];
			break;
		}
	}

	if(!collection){
		var testDb = connect.db(dbName);
		collection = testDb.collection(collectionName);
	}
		
	if(query = undefined){
		query = {};
	}

	collection.count(query, function(err, n) {
		if(err){
			return callback(err, n);
		}
	    callback(null, n);
	});
};

// 此方法还有问题，没法解决点命名法的bug，
// bug的具体详情是，如果数据库名称为test，并且集合的名称都是以"test."开头的，那么这样的集合将无法读取。
DB.getDocuments = function(connect, dbName, collectionName, index, count, callback, query) {
	var collection = null;

	for(var i=0;i<this.collections.length;i++){

		if(dbName == this.collections[i].s.dbName && collectionName == this.collections[i].s.name){
			collection = this.collections[i];
			break;
		}
	}

	if(!collection){
		var testDb = connect.db(dbName);
		collection = testDb.collection(collectionName);
	}
		
	if(query = undefined){
		query = {};
	}

	collection.find(query, null, index, count).toArray(function(err, docs) {
		console.log(err, docs);
		if(err){
			return callback(err, null);
		}
	    callback(null, docs);
	}); 
};

DB.getDocumentsById = function(dbName, collectionName, id, callback) {
	var testDb = connect.db(dbName);

	var collection = testDb.collection(collectionName);
		
	if(query = undefined){
		query = {};
	}

	collection.find({"_id": new ObjectId(id) }, null, 0, 1).toArray(function(err, docs) {
	    if(err){
			return callback(err, null);
		}
	    callback(null, docs);
	});
};

module.exports = DB;