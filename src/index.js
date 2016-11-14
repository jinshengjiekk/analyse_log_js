$(document).ready(function () {
    let content;
    let keysArr = [];
    let contentArr = [];
    let noGCcontentArr = [];
    let targetArr = [];
    let lastArr = [];
    let contentObj = {};
    let colorArr = ['#b1f1fb', '#cdd8d8;','aquamarine','plum','bisque','darkgray','lawngreen','moccasin','thistle','skyblue'];

    //监听上传文件变化
    $('#import-file').change(function (event) {
        let files = event.target.files;
        let selectedFile = files[0];
        let name = selectedFile.name;
        let size = Math.round(selectedFile.size / 1024);
        console.log("文件名:" + name + "大小：" + size);

        let reader = new FileReader();//这里是核心
        reader.readAsText(selectedFile);//读取文件的内容

        reader.onload = function () {
            content = this.result;//当读取完成之后会回调这个函数，然后此时文件的内容存储到了result中。
            contentArr = content.split(/[\n|\r\n]{2,}/);
            noGCcontentArr = contentArr.filter((data)=> !data.includes('GC task'));
            targetArr = contentArr;
            $('#file-info').html(`<div><span>文件名称：${name}</span>&nbsp;&nbsp;&nbsp;&nbsp;<span>文件大小:${size}KB</span></div>`);
        }
    });

    //点击确定开始搜索
    $('#start-search').click(function () {
        let showKey;
        if (!content) {
            alert('请选择要分析的java堆栈文本文件！');
            return;
        }
        let key = $('#keys-input').val().trim();
        showKey = key;
        if (!key) {
            alert('关键字不能为空！');
            return;
        }

        if (key.split(/\s+/).length > 2) {
            alert(`关键字形式为:
                        1: keyword(包含）
                        2: -v keyword 或者 keyword -v(取反，不包含)`);
            return;
        }
        //没有直接replace是考虑到关键字中可能包含'-v'
        if (key.startsWith('-v') || key.endsWith('-v')) {
            //标记过滤关键字取反
            key = key.replace('-v', '').trim() + '&&&*** ';
        } else {
            if (key.split(/\s+/).length > 1) {
                alert(`关键字形式为:
                        1: keyword(包含）
                        2: -v keyword 或者 keyword -v(取反，不包含)`);
                return;
            }
        }


        if (keysArr.includes(key)) {
            alert('关键字已存在！');
            return;
        } else {
            keysArr.push(key);
            $('#list-key').append(`<input type="checkbox" name= "key" value=${key} checked><span>${showKey}</span>`).click();
        }

        $('#keys-input').val('');
    });

    //利用冒泡机制监听动态生成的复选框上层div的click事件
    $('#list-key').click(function () {
        let keysArr = [];
        $(':checked').each(function () {
            keysArr.push(this.value);
        });
        if (keysArr.length == lastArr.length) {
            return;
        }
        lastArr = keysArr;
        filter(keysArr);
    });

    //过滤方法
    function filter(keysArr) {
        let filteredKeysArr;
        let leftOutput = '';
        let filteredContentArr = targetArr.filter((data)=>processMatch(data, keysArr));
        for (let data of filteredContentArr) {
            let matchArr = data.match(/"(.*)".*(nid=[\w]{6})/);
            if(matchArr){
                contentObj[matchArr[1] + '(' + matchArr[2] + ')'] = data;
            }
        }
        filteredKeysArr = Object.keys(contentObj);
        for(let data of filteredKeysArr){
            leftOutput += `<li>${data}</li>`
        }
        $('#keys-li').append(leftOutput);


        // let regexpArr = [];
        // let output = '';
        // let result = '';
        // for (let i of arr) {
        // 	if (i.endsWith('&&&***')) {
        // 		regexpArr.push(new RegExp('^((?!' + i.replace('&&&***', '') + ').)*$', 'gi'));
        // 	} else {
        // 		regexpArr.push(new RegExp(i, 'gi'));
        // 	}
        // }
        //
        // let filteredContentArr = contentArr.filter(function (data) {
        // 	return processMatch(data, regexpArr);
        // });
        //
        // for (let ele of filteredContentArr) {
        // 	output += '<p>' + ele + '</p><hr>';
        // }
        // $('#filtered-title').html('');
        // result = `<p>过滤后满足条件的线程数：${filteredContentArr.length}</p>` + output;
        // $('#filtered-content').html(result);

    }


    // function processMatch(data, regexpArr) {
    // 	for (let i of regexpArr) {
    // 		if (!i.test(data.replace(/[\r|\r\n]/g, ''))) {
    // 			return false;
    // 		}
    // 	}
    // 	return true;
    // }

    function processMatch(data, keysArr) {
        for (let i of keysArr) {
            let result = i.includes('&&&***') ? !data.includes(i) : data.includes(i);
            if (!result) {
                return false;
            }
        }
        return true;
    }

    $(document).on('click', 'li', function(){
        let randomIndex = Math.round(Math.random() * 10);
        let rightOutput = contentObj[$(this).text()];
        $('#filtered-content').html(rightOutput.replace(/\n/g, "<br>"));
        $(this).css('backgroundColor', colorArr[randomIndex]);
        $(this).siblings().css('backgroundColor', '#cdd8d8');
        $('#filtered-content').css('backgroundColor', colorArr[randomIndex]);
    });

    //监听键盘回车键，默认按下就是确定搜索
    $(document).keydown(function (event) {
        if (event.keyCode == 13) {
            $('#start-search').click();
        }
    });


});
