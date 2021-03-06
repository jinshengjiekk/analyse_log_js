$(document).ready(()=> {

    //检测浏览器是否支持HTML5 File API
    (()=> {
        if (window.File && window.FileList && window.FileReader && window.Blob) {
            console.info('support!');
        } else {
            confirm("你的浏览器暂不支持HTML5 File接口，无法继续操作，请更换其他最新版本浏览器，推荐Chrome，Firefox");
            window.close();
        }
    })();

    //========================================================================================================================

    //全局变量
    let content;
    let keysArr = [];
    let selectedKeys = [];
    let DefaultKeys = ['GC task&&&***', 'Attach Listener&&&***', 'sun.nio.ch.EPollArrayWrapper.epollWait&&&***',
        'com.mysql.jdbc.MysqlIO.readFully&&&***', 'java.lang.Thread.State: TIMED_WAITING&&&***', 'java.lang.Thread.State: WAITING&&&***'];
    let contentArr = [];
    let contentObj = {};
    let colorArr = ['#90BAE4', '#C591C3', '#84a59a', '#b9a0b9', '#b5aea5', '#8bb9b2', '#a9d084', 'moccasin', 'thistle', '#a1b16e'];
    let colorsLength = 10;
    let lastIndex = 0;
    let fileInfos = ``;
    let files = [];
    let targetFileIndex = 0;
    let isComparison = false;
    let fileIndexs = [];
    let fileIndex;

    $('.keys-li').html(`==========暂无文件输入==========`);

    //监听上传文件变化
    $('#import-file').change(()=> {
        fileInfos = ``;
        files = $('#import-file')[0].files;
        for (let i = 0, file; file = files[i]; i++) {
            fileInfos += `<span class="file-info"><input type="checkbox" name= "info" value=${i} /><span>${file.name}(${Math.round(file.size / 1024)}KB)</span></span>`;
        }
        $('#file-info').html(fileInfos);
        $('input[name="info"]').first().prop('checked', true);
        processFile();
        $('.filtered-content').first().nextAll().remove();
    });

    function processFile(index = 0, isFilter, liIndex, keyValue) {
        isFilter || fileIndexs.push(index);
        let reader = new FileReader();//这里是核心
        reader.readAsText(files[index]);//读取文件的内容

        reader.onload = function () {
            content = this.result;//当读取完成之后会回调这个函数，然后此时文件的内容存储到了result中。
            contentArr = content.split(/[\n|\r\n]{2,}/);
            isFilter ? changeContent(liIndex, keyValue) : filter();
        }
    }

    //监听多文件对比模式
    $('#isComparison').click(function () {
        if (!files.length) {
            alert('请选择要分析的java堆栈文本文件！');
            $(this).prop('checked', !$(this).prop('checked'));
            return;
        }
        isComparison = !isComparison;
        $('input[name="info"]:checked').first().parent().siblings().children('input').prop('checked', false);
        targetFileIndex = $('input[name="info"]:checked').val();
        processFile(targetFileIndex);
    });

    //监听默认排除关键字的点击事件
    $('.exclude').click(function () {
        if (!files.length) {
            alert('请选择要分析的java堆栈文本文件！');
            $(this).prop('checked', !$(this).prop('checked'));
            return;
        }
        let value = this.value + '&&&***';
        if ($(this).prop('checked')) {
            DefaultKeys.push(value);
        } else {
            DefaultKeys = DefaultKeys.filter((data) => data !== value);
        }
        $('input[name="info"]:checked').each(function () {
            targetFileIndex = $(this).val();
            processFile(targetFileIndex);
        })
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
        //没有直接replace是考虑到关键字中可能包含'-v'
        if (key.startsWith('-v') || key.endsWith('-v') || key.startsWith('-V') || key.endsWith('-V')) {
            //标记过滤关键字取反
            key = key.replace(/\-v/i, '').trim() + '&&&***';
        }
        if (selectedKeys.includes(key)) {
            alert('关键字已存在！');
            return;
        } else {
            selectedKeys.push(key);
            let plusElement = $(`<span class="keywords"><input type="checkbox" name= "key" checked />
                <span>${showKey}</span><button class="deleteKey" style="margin-left: 5px; background-color: lightcoral; visibility: hidden">删除</button></span>`);
            $('#list-key').append(plusElement);
        }
        $('#keys-input').val('');

        $('input[name="info"]:checked').each(function () {
            targetFileIndex = $(this).val();
            processFile(targetFileIndex);
        })
    });

    //利用冒泡机制监听动态生成的复选框上层div的click事件
    $('#list-key').click(function (event) {
        selectedKeys = [];
        if ($(event.target).text() === '删除' || event.target.localName === 'span') {
            return;
        }
        $('[name="key"]:checked').each(function () {
            let selectedKey = $(this).next('span').text();
            if (selectedKey.startsWith('-v') || selectedKey.endsWith('-v') || selectedKey.startsWith('-V') || selectedKey.endsWith('-V')) {
                //标记过滤关键字取反
                selectedKey = selectedKey.replace(/\-v/i, '').trim() + '&&&***';
            }
            selectedKeys.push(selectedKey);
        });
        $('input[name="info"]:checked').each(function () {
            targetFileIndex = $(this).val();
            processFile(targetFileIndex);
        })
    });

    //过滤方法
    function filter() {
        // $('.filtered-content').first().nextAll().remove();
        // $('.filtered-content').html('');
        let filteredKeysArr;
        let leftOutput = '';
        fileIndex = fileIndexs.shift();
        processMatch();
        filteredKeysArr = Object.keys(contentObj);
        leftOutput += `<p style="color: red; font-weight: bold" data-value=${fileIndex}>文件<span style="color: black">${files[fileIndex].name}</span>过滤后的线程数为：${filteredKeysArr.length}</p>`;
        for (let data of filteredKeysArr) {
            leftOutput += `<li>${data}</li>`
        }
        if (!filteredKeysArr.length) {
            leftOutput = `**********过滤后无结果*********`;
            $('.filtered-content').eq(fileIndex).remove();
            // $('.filtered-content').eq(fileIndex).remove();
        }
        if ($('input[name="info"]:checked').first().val() == fileIndex) {
            $('.keys-li').first().siblings().remove();
            $('.keys-li').html(leftOutput);
        } else {
            $('.keys-li').first().clone().html(`<hr/>${leftOutput}`).appendTo('.filtered-title');
        }
        $('.keys-li').last().children('li').first().click();
        //
        // $('.keys-li').each(function () {
        //     $(this).children('li').first().click();
        // })
    }

    //关键字匹配  用 {key: value} 组合成一个对象
    function processMatch() {
        contentObj = {};
        let filteredContentArr;
        keysArr = selectedKeys.concat(DefaultKeys);
        filteredContentArr = contentArr.filter((data)=> {
            for (let i of keysArr) {
                let result = i.includes('&&&***') ? !data.includes(i.replace('&&&***', '')) : data.includes(i);
                if (!result) {
                    return false;
                }
            }
            return true;
        });
        for (let data of filteredContentArr) {
            let matchArr = data.match(/"(.*)".*(nid=[\w]{5,6})/);
            if (matchArr) {
                contentObj[matchArr[1] + '(' + matchArr[2] + ')'] = data;
            }
        }
    }

    //监听左侧li元素点击事件  关键字鼠标悬停事件   关键字删除事件 上传的文件改变
    $(document).on('click', '.keys-li li', function () {
        let index;
        let keyValue;
        index = $('ul').index($(this).parent('ul'));
        fileIndex = $(this).siblings('p').first().data('value');
        keyValue = $(this).text();
        processFile(fileIndex, true, index, keyValue);
        $(this).css('backgroundColor', colorArr[lastIndex]);
        $('.filtered-content').eq(index).css('backgroundColor', colorArr[lastIndex]);
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
            deleteValue = deleteValue.replace(/\-v/i, '').trim() + '&&&***';
        }
        $(this).parent('.keywords').remove();
        keysArr = keysArr.filter((data)=> deleteValue !== data);
        $('#list-key').click();
    }).on('change', 'input[name="info"]', function () {
        if (!$('input[name="info"]:checked').length) {
            $(this).prop('checked', true);
            return;
        } else {
            if (!isComparison) {
                $(this).parent('span').siblings().children('input').prop('checked', false);
            }
            // fileIndex = $('input[name="info"]:checked').first().val();
            $('input[name="info"]:checked').each(function () {
                targetFileIndex = $(this).val();
                processFile(targetFileIndex);
            })
        }
    });

    function changeContent(index, keyValue) {
        processMatch();
        lastIndex < colorsLength - 1 ? lastIndex++ : lastIndex = 0;
        let rightOutput = contentObj[keyValue];
        if (index === 0) {
            $('.filtered-content').first().html(rightOutput.replace(/\n/g, "<br/>"));
            if ($('.keys-li').length <= 1) {
                $('.filtered-content').first().nextAll().remove();
            }
        } else {
            if (index >= $('.filtered-content').length) {
                $('.filtered-content').first().clone().html(rightOutput.replace(/\n/g, "<br/>")).appendTo('.filtered-main');
            } else {
                $('.filtered-content').eq(index).html(rightOutput.replace(/\n/g, "<br/>"));
            }
        }
        // if (index === 0) {
        //     $('.filtered-content').html(rightOutput.replace(/\n/g, "<br/>"));
        //     $('.filtered-content').first().nextAll().remove();
        // } else {
        //     if (index >= $('.filtered-content').length) {
        //         $('.filtered-content').first().clone().html(rightOutput.replace(/\n/g, "<br/>")).appendTo('.filtered-main');
        //     }
        // }

    }

    //监听键盘回车键，默认按下就是确定搜索
    $(document).keydown((event) => {
        if (event.keyCode == 13) {
            $('#start-search').click();
        }
    });
});
