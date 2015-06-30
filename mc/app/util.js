var async = require('async');
var fs = require('fs');

function Util() {}

Util.getConnections = function(callback){
	var fileName = process.cwd() + "/mc/app/connect_config.json";

	if(require.cache[fileName] != undefined){
		delete require.cache[fileName];
	}

	var connect_config = require('./connect_config');

	return connect_config;
};

Util.saveConnections = function(urls){
	console.log(process.cwd());
	var fileName = process.cwd() + "/mc/app/connect_config.json";

	fs.writeFileSync(fileName, JSON.stringify(urls), {encoding:'utf-8'});

	if(require.cache[fileName] != undefined){
		delete require.cache[fileName];
	}
};

module.exports = Util;