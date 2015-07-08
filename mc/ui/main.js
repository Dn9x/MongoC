
$(function() {
	$("#connect-select").change(function(){
		var val = $(this).val();

		if(val === "addnew"){
			showPopup('popup_connections');
		}else{
			//切换链接
			var url = 'mongodb://'+val;
			$("#left-row-connect-name").html(val);
			openConnect(url);
		}
	});

	$(".edit_connect").click(function(){
		$(this).parent().prev().children().removeAttr("readonly");
	});

	$(".remove_connect").click(function(){
		$(this).parent().parent().remove();

		//保存连接信息
		saveConnections();
	});

	$(".open_connect").click(function(){
		var tempUrl = $(this).parent().prev().children().val();

		var url = 'mongodb://'+tempUrl;
		hidePopup('popup_connections');
		$("#left-row-connect-name").html(tempUrl);

		//保存连接信息
		saveConnections();

		//改变选择的显示
		changeSelectConnection(tempUrl);
		
		//打开连接
		openConnect(url);
	});

	$("#popup-connect-close").click(function(){
		hidePopup('popup_connections');
	});

	$("#popup-document-close").click(function(){
		hidePopup('popup_document');
	});

	$("#popup-document-save").click(function(){
		var value = global.Mc.editor.getText();

		console.log(value) // Will log "John Smith"
		
		updateDocument(value);
	});


	$("#btnConnect").click(function() {

		var host = $("#host").val();
		var port = $("#port").val();

		var url = 'mongodb://localhost/admin';

		MongoClient.connect(url, function(err, db) {

			if (err) {
				console.log(err);
				alert("请开启服务：" + err);
				return;
			} else {

				// //获取当前窗口
				// var win = gui.Window.get();

				// //关闭当前窗口
				// win.close();

				// //打开新窗口
				// gui.Window.open("main.html", {
    // 				toolbar: true,
				// 	position: 'center',
				// 	width: 1108,
				// 	height: 670
				// });
			}

			db.close();
		});

	});
});