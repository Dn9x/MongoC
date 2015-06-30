global.$ = jQuery;
global.Mc = {};
var DB = require('./mc/app/db');

(function() {
	openLocalhost();
})();

function showPopup(name){
	$('#lean_overlay').show();
	$('#'+name).show();
}

function hidePopup(name){
	$('#lean_overlay').hide();
	$('#'+name).hide();
}

function openLocalhost() {
	var url = 'mongodb://localhost/admin';

	openConnect(url);
}

function openConnect(url) {
	DB.getConnects(url, function(err, connect) {
		if (err) {
			showPopup('popup_connections');
			console.log("connect error message: ");
			console.log(err);
			return;
		} else {
			global.Mc.connect = connect;
			getDbs(connect);
		}
	});
}

function getDbs(connect) {
	DB.getDbs(connect, function(err, dbs) {
		var html = "";

		for (var i = 0; i < dbs.length; i++) {
			html += "<div class='left-content-cell left-db-cell' data-name='" + dbs[i].name + "'>" + dbs[i].name + "</div>";
		}

		$("#left-db-list").html(html);

		$(".left-db-cell").bind("click", function() {
			var name = $(this).data("name");
			$(".left-db-cell").removeClass("left-content-active");
			$(this).addClass("left-content-active");

			showCollections(name);
		});
	});
}

function showCollections(dbName) {
	DB.getCollections(global.Mc.connect, dbName, function(err, collections) {

		$("#left-row-db-name").html(dbName);

		var ul = "";

		for (var i = 0; i < collections.length; i++) {
			ul += "<div class='left-content-cell left-collection-cell' title='" + collections[i].s.name + "'>" + collections[i].s.name + "</div>";
		}

		$("#left-collection-list").html(ul);

		$(".left-collection-cell").bind("click", function() {
			var collname = $(this).attr("title");

			$(".left-collection-cell").removeClass("left-content-active");
			$(this).addClass("left-content-active");
		});
	});
}

