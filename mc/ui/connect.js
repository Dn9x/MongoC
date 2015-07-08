global.$ = jQuery;
global.Mc = {
	pages:{
		total: 0,
		index: 1
	},
	editor: null
};
var async = require('async');
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

			global.Mc.dbName = dbName;
			global.Mc.collname = collname;

			async.series({
				one: function(cb) {
					DB.getDocuments(global.Mc.connect, dbName, collname, 0, 15, function(err, docs){
						showDocuments(err, docs);

						cb(null, 'ok');
					}, null);
				},
				two: function(cb) {
					DB.getDocumentsCount(global.Mc.connect, dbName, collname, function(err, n){
						showDocumentPage(err, n);
						
						cb(null, 'ok');
					}, null);
				}
			},
			function(err, results) {

			});
		});
	});
}

//显示文档
function showDocuments(err, docs){
	var thead = "<tr class='active'><th>#</th>";
	var tbody = "";
	var tfoot = "<tr>";

	//1.1 循环处理头部
	var tempHeads = [];

	//1.2 获取所有有效字段
	for (var i = 0; i < docs.length; i++) {
		var doc = docs[i];

		for(var k in doc){
			//如果这个字段不存在就添加
			if(tempHeads.indexOf(k) == -1){
				tempHeads.push(k);
			}
		}
	}

	//2.1 组建数据
	var tempBodys = [];

	//2.2 开始组建数据
	for (var i = 0; i < docs.length; i++) {
		var doc = docs[i];

		//存储数据
		var tempData = [];
		for(var z=0;z<tempHeads.length;z++){
			tempData.push(undefined);
		}

		for(var k in doc){
			for(var j=0; j<tempHeads.length;j++){
				if(k == tempHeads[j]){
					tempData[j] = doc[k];
					break;
				}
			}
		}

		tempBodys.push(tempData);
	}

	//3.1 拼接头部
	for(var j=0; j<tempHeads.length;j++){
		thead += "<th>"+ tempHeads[j] +"</th>";
	}
	thead += "</tr>";


	//3.2 拼接数据
	for (var i = 0; i < tempBodys.length; i++) {
		var doc = tempBodys[i];

		var _tempId;
		for(var j=0; j<doc.length;j++){	
			if(DB.isObjectId(doc[j])){
				_tempId = doc[j];
				break;
			}
		}

		_tempId = _tempId!=undefined?_tempId:doc[0];
		var _tempFiled = tempHeads[0];

		tbody += "<tr>" + 
				 "<td nowrap='nowrap'>" + 
				 "<button title='delete' class='right-row-body-document-action' data-name='"+_tempFiled+"' data-id='"+_tempId+"' onClick='deleteDocument(this)'>D</button>" + 
                 "<button title='edit' class='right-row-body-document-action' data-name='"+_tempFiled+"' data-id='"+_tempId+"' onClick='editDocument(this)'>E</button>" + 
				 "</td>";

		for(var j=0; j<doc.length;j++){
			if(_.isArray(doc[j])){
				tbody += "<td class='td-array'>Array ["+doc[j].length+"]</td>";
			}else if(_.isObject(doc[j]) && !_.isArray(doc[j]) && !_.isDate(doc[j]) && j!=0){
				tbody += "<td>Object</td>";
			}else if(_.isDate(doc[j])){
            	tbody += "<td nowrap='nowrap' class='td-date'>"+moment(doc[j]).format('MM-DD-YYYY HH:mm:ss')+"</td>"; 
			}else if(_.isUndefined(doc[j])){
				tbody += "<td>&nbsp;</td>";
			}else{
            	tbody += "<td nowrap='nowrap' class='td-string'>"+doc[j].toString()+"</td>";
			}
		}
        tbody  += "</tr>";
	}

	tfoot += '<td colspan="'+(tempHeads.length+1)+'" align="left">Loding more..</td></tr>';

	$("#right-row-body-thead").html(thead);
	$("#right-row-body-tbody").html(tbody);
	$("#right-row-body-tfoot").html(tfoot);
}

//显示文档分页信息
function showDocumentPage(err, n){

	global.Mc.pages.total = n;
	global.Mc.pages.index = 1;

	showDocumentPageInfo();
}

function showDocumentPageInfo(){
	var html =  "<button class='right-row-foot-button-page'>"+ global.Mc.pages.total + " items"+"</button>"; 

	//首先判断此集合有多少条数据
	if(global.Mc.pages.total <= 15){
		$("#right-row-body-tfoot").children().children().html(html);
	}else{
		var pages = Math.ceil(global.Mc.pages.total/15);

		var tempHtml = "<button title='first' onClick='documentPageAction(1)' class='right-row-foot-button'>first</button>" + 
					   "<button title='prev' onClick='documentPageAction(2)' class='right-row-foot-button'>prev</button>" + 
					   "<button class='right-row-foot-button-page' id='right-row-foot-button-page-info'>"+ global.Mc.pages.index+ "/" + pages+"</button>" + 
					   "<button title='next' onClick='documentPageAction(3)' class='right-row-foot-button'>next</button>" + 
					   "<button title='last' onClick='documentPageAction(4)' class='right-row-foot-button'>last</button>&nbsp;&nbsp;" + html;


		$("#right-row-body-tfoot").children().children().html(tempHtml);
	}
}

//分页有bug， 问题是last点击有错误
function documentPageAction(action){
	//总共多少页
	var pages = Math.ceil(global.Mc.pages.total/15);

	var startIndex = 0;
	console.log(global.Mc.pages.index);

	switch(action){
		case 1: 
			global.Mc.pages.index = 1;
			startIndex = 0;
			break;
		case 2: 
			if(global.Mc.pages.index>2){
				global.Mc.pages.index--;
				startIndex = global.Mc.pages.index*15;
			}else if(global.Mc.pages.index==2){
				global.Mc.pages.index--;
				startIndex = 0;
			}
			break;
		case 3: 
			if(global.Mc.pages.index<pages){
				startIndex = global.Mc.pages.index*15;
				global.Mc.pages.index++;
			}else if(global.Mc.pages.index==pages){
				global.Mc.pages.index = pages;
				startIndex = (pages-1)*15;
			}
			break;
		case 4: 
			global.Mc.pages.index = pages;
			startIndex = (pages-1)*15;
			break;
	};


	console.log(global.Mc.pages.index, startIndex, global.Mc.pages.total);

	if(global.Mc.pages.index <= pages){
		async.series({
			one: function(cb) {
				DB.getDocuments(global.Mc.connect, global.Mc.dbName, global.Mc.collname, startIndex, 15, function(err, docs){
					showDocuments(err, docs);

					cb(null, 'ok');
				}, null);
			},
			two: function(cb) {

				showDocumentPageInfo();

				cb(null, 'ok');
			}
		},
		function(err, results) {

		});
	}else{
		$(".right-row-foot-button").hide();
	}

	console.log(action);
}

function deleteDocument(self){
	if(confirm("你确定要删除文档吗？？")){
		console.log(self);

		console.log("删除文档");
	}
}

function editDocument(self){
	var val = $(self).data("id");

	DB.getDocumentsById(global.Mc.connect, global.Mc.dbName, global.Mc.collname, val, function(err, docs){
		if(docs[0] != undefined && docs[0] != null){

			showPopup("popup_document");

			var container = document.getElementById('popup_document_edit');

			$(container).html("");

			var options = {
				mode: 'form',
				theme: "foundation5"
			};

			var obj = JSON.stringify(docs[0]);

			var editor = new JSONEditor(container, options, JSON.parse(obj));

			global.Mc.editor = editor;
		}
	});
}

function updateDocument(obj, callback){
	DB.updateDocumentById(global.Mc.connect, global.Mc.dbName, global.Mc.collname, JSON.parse(obj), function(err, res){
		console.log(err, res);

		hidePopup("popup_document");
	});
}







