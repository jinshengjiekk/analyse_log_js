/**
 * Created by JINSHENGJIE on 16/11/01 .
 */

var content;

function analysis(ele) {
	var files = ele.target.files;
	var selectedFile = files[0];
	var name = selectedFile.name;//读取选中文件的文件名
	var size = selectedFile.size;//读取选中文件的大小
	console.log("文件名:" + name + "大小：" + size);

	var reader = new FileReader();//这里是核心！！！读取操作就是由它完成的。
	reader.readAsText(selectedFile);//读取文件的内容

	reader.onload = function () {
		content = this.result;//当读取完成之后会回调这个函数，然后此时文件的内容存储到了result中。
		console.info(content);
		document.getElementById('filtered-content').innerHTML = content;
	}
}


/*

$(document).ready(function(){
	$('.file-title').css({'background-color': 'red'});

	$('#isOk').change(function () {
		$('#filtered-content').innerHTML = content;
	});
});*/
