var Util = require('./mc/app/util');

(function() {
	setConnections();
})();


function setConnections(){
	var lists = getConnections();

	var options = "";
	var trs = "";

	for(var i=0;i<lists.length;i++){
        options +=  "<option values='"+lists[i].url+"'>"+lists[i].url+"</option>";

        trs += "<tr>" + 
               "<td>" + 
               "<input name='connect' value='"+lists[i].url+"' readonly>" + 
               "</td>" +
               "<td align='left'>" + 
               "<button class='edit_connect' title='edit connect'>E</button>&nbsp;" +
               "<button class='remove_connect' title='remove connect'>R</button>&nbsp;" +
               "<button class='open_connect' title='open connect'>O</button>" +
               "</td>" +
               "</tr>";
	}

	options+="<option value='addnew'>+ add new connect</option>";
	trs += "<tr>" + 
           "<td>" + 
           "<input name='connect'  placeholder='host:port'>" + 
           "</td>" +
           "<td align='left'>" + 
           "<button class='open_connect' title='open connect'>O</button>" +
           "</td>" +
           "</tr>";

	$("#connect-select").html(options);
	$("#popup-connect-cell-table").html(trs);

	$("#popup-connect-cell-table").find(".edit_connect").bind("click", function() {
		$(this).parent().prev().children().removeAttr("readonly");
	});
	$("#popup-connect-cell-table").find(".remove_connect").bind("click", function() {
		$(this).parent().parent().remove();

		//保存连接信息
		saveConnections();
	});
	$("#popup-connect-cell-table").find(".open_connect").bind("click", function() {
		var tempUrl = $(this).parent().prev().children().val();

		var url = 'mongodb://'+tempUrl;
		hidePopup('popup_connections');
		$("#left-row-connect-name").html(tempUrl);

		//保存连接信息
		saveConnections();
		
		//打开连接
		openConnect(url);
	});
}

function saveConnections(){
	var trs = $("#popup-connect-cell-table").find("tr");
	
	var urls = [];

	for(var i=0;i<trs.length;i++){
		var url = $(trs[i]).children().eq(0).children().val();

		if(url != "" && url != null && url.length > 0){
			urls.push({url:url});
		}
	}

	Util.saveConnections(urls);

	//重新设置链接信息
	setConnections();
}

function getConnections(){
	return Util.getConnections();
}


