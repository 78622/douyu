(function() {
    'use strict';
	
    var bool_barrageReady = false;          // 自动弹幕模块是否装载完毕
    var bool_clearReady = false;            // 自动清理模块是否装载完毕
    var bool_settingReady = false;          // 斗鱼设置模块是否装载完毕

    var color_input_on = 'white';
    var color_input_off = '#DCDCDC';

    // 创建元素样式
    var h2p_DYScript_style_barrage = document.createElement('style');
    h2p_DYScript_style_barrage.type = 'text/css';
    h2p_DYScript_style_barrage.innerHTML = (function(){/*
        .h2p-div-panel {
            position        : absolute;
            bottom          : 1px;
            min-width       : 315px;
            max-width       : 315px;
            padding         : 10px;
            border          : 1px solid #DCDCDC;
            border-radius   : 2px;
            margin          : 0 0 0 -1px;
            box-shadow      : #A9A9A9 5px 0 10px 0;
            font-family     : WeibeiSC-Bold, STKaiti;
            font-size       : 16px;
            background      : #f5f5f5;
            display         : none;
            z-index         : 999;
        }
        .h2p-div-layer {
            position    : relative;
            width       : 100%;
            height      : 24px;
        }
        .h2p-div-layer-half {
            position    : absolute;
            width       : 50%;
            height      : 24px;
        }
        .h2p-checkbox-left {
            position    : absolute;
            top         : 0;
            bottom      : 0;
            left        : 0;
            margin      : auto;
        }
        .h2p-input-normal {
            position        : absolute;
            height          : 22px;
            padding         : 0px 5px;
            border          : 1px solid #708090;
            border-radius   : 5px;
            font-size       : 13px;
        }
        .h2p-textarea-loopBarrage {
            width           : 287px;
            height          : 90px;
            padding         : 3px;
            border          : 1px solid #708090;
            border-radius   : 5px;
            margin          : 0 0 0 20px;
            font-size       : 13px;
            resize          : none;
        }
        .h2p-btn-sendBarrage {
            width           : 100%;
            height          : 100%;
            padding         : 4px 0;
            border          : none;
            border-radius   : 5px;
            margin          : 0;
            font-size       : 13px;
            background      : #00ddbb;
            cursor          : pointer;
        }
        .h2p-div-sign {
            width           : 18px;
            height          : 18px;
            display         : inline-block;
            vertical-align  : middle;
        }
        .h2p-span-sign {
            font-size       : 18px;
            cursor          : pointer;
        }
        .h2p-label-checkbox-left { margin : 0 0 0 20px }
        .h2p-color-font-green { color : #228B22 }
        .h2p-color-background-on { background : white }
        .h2p-color-background-off { background : #DCDCDC }
    */}).toString().split('/*')[1].split('*/')[0];
    document.head.appendChild(h2p_DYScript_style_barrage);


    // 初始化界面  ===============================================================
    var initView_barrage = function(){


        // 整个面板 ===============================================================
        var div_sendBarrage = $('<div id="div-sendBarrage" class="h2p-div-panel"></div>');

        var str_div_speed_and_countDown = (function(){/*
            <div class="h2p-div-layer">
                <div class="h2p-div-layer-half">
                    <label style="left: 50px;">封禁时间：</label>
                    <input id="input-sendBarrage-speed" class="h2p-input-normal" style="width: 56px;" placeholder="默认 360" />
                    <label style="position: absolute; left: 160px;">天</label>
                </div>
            </div>
        */}).toString().split('/*')[1].split('*/')[0].replace(/[\n]/g, '');
        var div_speed_and_countDown = $(str_div_speed_and_countDown);

        var str_div_loopBarrage = (function(){/*
            <div class="h2p-div-layer" style="height: 98px;">
                <textarea id="input-loopBarrage-content" class="h2p-textarea-loopBarrage" placeholder="封禁规则：用#隔开（不要使用空格）"></textarea>
            </div>
        */}).toString().split('/*')[1].split('*/')[0].replace(/[\n]/g, '');
        var div_loopBarrage = $(str_div_loopBarrage);



        var div_barrageSendBtn = $('<div class="h2p-div-layer"></div>');

        var btn_sendBarrage = document.createElement('button');
        $(btn_sendBarrage).attr('id', 'btn-sendBarrage');
        $(btn_sendBarrage).attr('class', 'h2p-btn-sendBarrage');
        $(btn_sendBarrage).text('确定');

        btn_sendBarrage.onmouseover = function(){
            this.style.background = '#00d1b2';
        }
        btn_sendBarrage.onmouseout = function(){
            this.style.background = '#00ddbb';
        }
        $(div_barrageSendBtn).append(btn_sendBarrage);


        // 分隔线  ===============================================================
        let hr_style = '<hr style="margin: 3px; border: 1px solid transparent;">';


        // 添加所有元素  ===============================================================
        $(div_sendBarrage).append(div_speed_and_countDown);
        $(div_sendBarrage).append($(hr_style));
        $(div_sendBarrage).append(div_loopBarrage);
        $(div_sendBarrage).append($(hr_style));
        $(div_sendBarrage).append(div_barrageSendBtn);


        // 检查弹幕面板挂载点（斗鱼弹幕显示区域）是否加载完成
        var check_mountPoint_barragePanel = setInterval( function(){
            if( $('div.layout-Player-asideMainTop')[0] ){
                setTimeout( function(){
                    $( $('div.layout-Player-asideMainTop')[0] ).append( div_sendBarrage );
                }, 2000);
                window.clearInterval( check_mountPoint_barragePanel );
            }
        }, 1000);


        // 检查弹幕图标挂载点（斗鱼弹幕输入框）是否加载完成
        var check_mountPoint_barrageIcon = setInterval( function(){
            if( document.getElementById('div-sendBarrage') && document.getElementsByClassName('ChatToolBar')[0] ){
                let div_sign = $('<div class="h2p-div-sign" style="margin: -8px 0 0 -5px;" title="弹幕封禁"></div>');

                let btn_sign = $('<span id="button-sign" class="h2p-span-sign">✡️</span>');
                $(btn_sign).click(function(){
                    $('div#div-sendBarrage').toggle();
                    $('div#div-DYLight').hide();
                    $('div#div-setting').hide();
                });

                $(div_sign).append(btn_sign);

                $(  $('div.ChatToolBar')[0] ).append( div_sign );
                window.clearInterval( check_mountPoint_barrageIcon );
            }
        }, 1000);
    }

    // 调用初始化自动发弹幕函数
    initView_barrage();
})();