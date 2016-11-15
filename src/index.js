$(document).ready(()=> {

    //检测浏览器是否支持HTML5 File API
    (()=> {
        if (window.File && window.FileList && window.FileReader && window.Blob) {
            console.info('support!');
        } else {
            alert("你的浏览器暂不支持HTML5 File接口，无法继续操作，请更换其他最新版本浏览器，推荐Chrome，Firefox");
        }
    })();

    //全局变量
    let content;
    let keysArr = [];
    let contentArr = [];
    let noGCcontentArr = [];
    let targetArr = [];
    let contentObj = {};
    let colorArr = ['#b1f1fb', '#b582af', 'aquamarine', 'plum', 'bisque', 'darkgray', 'lawngreen', 'moccasin', 'thistle', 'skyblue'];
    let colorsLength = 10;
    let lastIndex = 0;
    let fileInfos = '';
    let files;

    $('#keys-li').html(`==========暂无文件输入==========`);

    //监听上传文件变化
    $('#import-file').change(()=> {
        files = $('#import-file')[0].files;
        for (let i = 0, file; file = files[i]; i++) {
            fileInfos += `<span class="file-info"><input type="checkbox" name= "info" value=${i}><span>${file.name}(大小${Math.round(file.size / 1024)}KB)</span></span>`;
        }
        $('#file-info').html(fileInfos);
        $('input[name="info"]').first().prop('checked', true);
        processFile();
    });


    function processFile(index = 0) {
        let reader = new FileReader();//这里是核心
        reader.readAsText(files[index]);//读取文件的内容

        reader.onload = function () {
            content = this.result;//当读取完成之后会回调这个函数，然后此时文件的内容存储到了result中。
            contentArr = content.split(/[\n|\r\n]{2,}/);
            noGCcontentArr = contentArr.filter((data)=> !data.includes('GC task'));
            targetArr = $('#gc').prop('checked') ? noGCcontentArr : contentArr;
            $('#filtered-content').html('').css('backgroundColor', '');
            $('#list-key').click();
        }
    }

    //监听"排除GC线程"checkbox点击事件
    $('#gc').click(function () {
        let isChecked = $(this).prop('checked');
        if (isChecked) {
            targetArr = noGCcontentArr;
        } else {
            targetArr = contentArr;
        }
        $('#list-key').click();
    });

    //点击确定开始搜索
    $('#start-search').click(()=> {
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
        if (key.startsWith('-v') || key.endsWith('-v') || key.startsWith('-V') || key.endsWith('-V')) {
            //标记过滤关键字取反
            key = key.replace(/\-v/i, '').trim() + '&&&*** ';
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
            $('#list-key').append(`<span class="keywords"><input type="checkbox" name= "key" value=${key} checked>
                <span>${showKey}</span><button class="deleteKey" style="margin-left: 5px; background-color: lightcoral; visibility: hidden">删除</button></span>`).click();
        }

        $('#keys-input').val('');
    });

    //利用冒泡机制监听动态生成的复选框上层div的click事件
    $('#list-key').click(function (event) {
        if ($(event.target).text() === '删除' || event.target.localName === 'span') {
            return;
        }
        let keysArrChecked = [];
        $('[name="key"]:checked').each(function () {
            keysArrChecked.push(this.value);
        });
        $('#filtered-content').html('').css('backgroundColor', '');
        filter(keysArrChecked);
    });

    //过滤方法
    function filter(keysArr = []) {
        contentObj = {};
        let filteredKeysArr;
        let leftOutput = '';
        let filteredContentArr = targetArr.filter((data)=>processMatch(data, keysArr));
        for (let data of filteredContentArr) {
            let matchArr = data.match(/"(.*)".*(nid=[\w]{6})/);
            if (matchArr) {
                contentObj[matchArr[1] + '(' + matchArr[2] + ')'] = data;
            }
        }
        filteredKeysArr = Object.keys(contentObj);
        leftOutput += `<p style="color: red; font-weight: bold">过滤后的线程数为：${filteredKeysArr.length}</p>`;
        for (let data of filteredKeysArr) {
            leftOutput += `<li>${data}</li>`
        }
        if (!filteredContentArr.length) {
            leftOutput = `**********过滤后无结果*********`;
        }
        $('#keys-li').html(leftOutput);
    }

    //关键字匹配
    function processMatch(data, keysArr) {
        for (let i of keysArr) {
            let result = i.includes('&&&***') ? !data.includes(i.replace('&&&***', '')) : data.includes(i);
            if (!result) {
                return false;
            }
        }
        return true;
    }

    //监听左侧li元素点击事件  关键字鼠标悬停事件   关键字删除事件
    $(document).on('click', 'li', function () {
        lastIndex < colorsLength - 1 ? lastIndex++ : lastIndex = 0;
        let rightOutput = contentObj[$(this).text()];
        $('#filtered-content').html(rightOutput.replace(/\n/g, "<br>"));
        $(this).css('backgroundColor', colorArr[lastIndex]);
        $('#filtered-content').css('backgroundColor', colorArr[lastIndex]);
        $(this).siblings().css('backgroundColor', '#ececec');
    }).on('mouseenter mouseleave', '.keywords', function (event) {
        if (event.type === 'mouseenter') {
            $(this).children('button').css('visibility', 'visible');
        } else {
            $(this).children('button').css('visibility', 'hidden');
        }
    }).on('click', '.deleteKey', function () {
        let deleteValue = $(this).prev('span').text().replace(/\n/, '');
        if (deleteValue.startsWith('-v') || deleteValue.endsWith('-v') || deleteValue.startsWith('-V') || deleteValue.endsWith('-V')) {
            deleteValue = deleteValue.replace(/\-v/i, '').trim() + '&&&*** ';
        }
        $(this).parent('.keywords').remove();
        keysArr = keysArr.filter((data)=> deleteValue !== data);
        $('#list-key').click();
    }).on('change', 'input[name="info"]', function () {
        if (!$('input[name="info"]:checked').length) {
            $(this).prop('checked', true);
            return;
        }
        let index = $(this).val();
        $(this).parent('span').siblings().children('input').prop('checked', false);
        processFile(index);
    });


    //监听键盘回车键，默认按下就是确定搜索
    $(document).keydown((event) => {
        if (event.keyCode == 13) {
            $('#start-search').click();
        }
    });


});
