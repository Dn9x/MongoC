(function() {
	showEditor();
})();

function showEditor() {
	var value = "";
	
	var editor = CodeMirror(document.getElementById("search_text"), {
		value: value,
		lineNumbers: true,
		mode: "javascript",
		keyMap: "sublime",
		autoCloseBrackets: true,
		matchBrackets: true,
		showCursorWhenSelecting: true,
		theme: "monokai",
		height: "36px"
	});

	$("#search_text").find(".CodeMirror").css("height", "36px");
}