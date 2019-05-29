// ==UserScript==
// @name            斗鱼自动发弹幕、领取观看鱼丸、清爽模式
// @namespace       http://tampermonkey.net/
// @version         0.6.3
// @icon            http://www.douyutv.com/favicon.ico
// @description     默认弹幕、循环弹幕、抽奖弹幕。清爽模式，隐藏无关元素。领取观看鱼丸（不是鱼秀宝箱）。以上功能可以设置是否自动启动。
// @author          H2P
// @require         https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js
// @match           *://*.douyu.com/0*
// @match           *://*.douyu.com/1*
// @match           *://*.douyu.com/2*
// @match           *://*.douyu.com/3*
// @match           *://*.douyu.com/4*
// @match           *://*.douyu.com/5*
// @match           *://*.douyu.com/6*
// @match           *://*.douyu.com/7*
// @match           *://*.douyu.com/8*
// @match           *://*.douyu.com/9*
// @match           *://*.douyu.com/topic/*
// @note            2019.3.18-V0.2.0 循环弹幕可以设置多条，随机发送；新增弹幕倒计时；界面美化一下？抽奖弹幕新增一种查询类型
// @note            2019.3.18-V0.3.0 界面修改；界面可隐藏；可以设置是否发送默认弹幕
// @note            2019.3.18-V0.3.1 小 BUG 修复
// @note            2019.3.19-V0.4.0 引入 JQuery 改写，还没改完；更新了弹幕抽奖元素获取（因为斗鱼改了）；增加设置抽奖弹幕次数；发送弹幕时可以修改循环弹幕
// @note            2019.3.23-V0.4.1 完善了一下代码；完善了界面；修改了字体
// @note            2019.3.23-V0.5.0 添加了斗鱼清爽模式：隐藏部分、隐藏全部、删除元素
// @note            2019.3.23-V0.5.1 修缮清爽模式；添加自动领取观看鱼丸（不是鱼秀宝箱）
// @note            2019.3.24-V0.5.2 修缮自动领取观看鱼丸；修缮隐藏全部元素的返回按钮
// @note            2019.3.24-V0.5.3 修改介绍。。。
// @note            2019.3.24-V0.5.4 修缮自动领取观看鱼丸，如果无法领取则清除循环
// @note            2019.3.24-V0.5.5 解决 jQuery $ 冲突；清爽模式处理粉丝节
// @note            2019.3.24-V0.6.0 添加“功能自动化”设置面板
// @note            2019.3.24-V0.6.1 修改介绍
// @note            2019.3.24-V0.6.2 代码重写
// @note            2019.3.24-V0.6.3 添加抄袭弹幕；完善设置信息存储
// @grant           none
// ==/UserScript==

(function() {
    'use strict';

    var $h2p_j = jQuery.noConflict();
    var h2p_DYScript_settingUpdate_version = '0.6.3';

    var interval_autoSendBarrage = undefined;       // 自动发弹幕
    var interval_countDownOfBarrage = undefined;    // 弹幕倒计时

    var bool_barrageReady = false;          // 自动弹幕模块是否装载完毕
    var bool_clearReady = false;            // 自动清理模块是否装载完毕
    var bool_settingReady = false;          // 斗鱼设置模块是否装载完毕

    var interval = 0;                   // 弹幕发送间隔时间
    var interval_default = 5;           // 弹幕发送默认间隔时间
    var luckDrawCountDown = 0;          // 弹幕抽奖活动倒计时
    var barrageCountDown = 0;           // 弹幕倒计时
    var barrageLuckDraw = '';           // 抽奖弹幕内容
    var count_luckDraw = 0;             // 抽奖弹幕实际发送次数
    var count_luckDrawTotal = 0;        // 抽奖弹幕总共发送次数
    var count_luckDrawDefault = 5;      // 抽奖弹幕默认发送次数

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
        var div_sendBarrage = $h2p_j('<div id="div-sendBarrage" class="h2p-div-panel"></div>');


        // 发送弹幕的速度 and 倒计时  ===============================================================
        var str_div_speed_and_countDown = (function(){/*
            <div class="h2p-div-layer">
                <div class="h2p-div-layer-half">
                    <label style="left: 50px;">封禁时间：</label>
                    <input id="input-sendBarrage-speed" class="h2p-input-normal" style="width: 56px;" placeholder="默认 360" />
                    <label style="position: absolute; left: 160px;">天</label>
                </div>
            </div>
        */}).toString().split('/*')[1].split('*/')[0].replace(/[\n]/g, '');
        var div_speed_and_countDown = $h2p_j(str_div_speed_and_countDown);

        // 是否发送循环弹幕  ===============================================================
        var str_div_loopBarrage = (function(){/*
            <div class="h2p-div-layer" style="height: 98px;">
                <textarea id="input-loopBarrage-content" class="h2p-textarea-loopBarrage" placeholder="封禁规则：用#隔开（不要使用空格）"></textarea>
            </div>
        */}).toString().split('/*')[1].split('*/')[0].replace(/[\n]/g, '');
        var div_loopBarrage = $h2p_j(str_div_loopBarrage);



        // 弹幕发送按钮  ===============================================================
        var div_barrageSendBtn = $h2p_j('<div class="h2p-div-layer"></div>');

        var btn_sendBarrage = document.createElement('button');
        $h2p_j(btn_sendBarrage).attr('id', 'btn-sendBarrage');
        $h2p_j(btn_sendBarrage).attr('class', 'h2p-btn-sendBarrage');
        $h2p_j(btn_sendBarrage).text('确定');

        btn_sendBarrage.onmouseover = function(){
            this.style.background = '#00d1b2';
        }
        btn_sendBarrage.onmouseout = function(){
            this.style.background = '#00ddbb';
        }
        $h2p_j(div_barrageSendBtn).append(btn_sendBarrage);


        // 分隔线  ===============================================================
        let hr_style = '<hr style="margin: 3px; border: 1px solid transparent;">';


        // 添加所有元素  ===============================================================
        $h2p_j(div_sendBarrage).append(div_speed_and_countDown);
        $h2p_j(div_sendBarrage).append($h2p_j(hr_style));
        $h2p_j(div_sendBarrage).append(div_loopBarrage);
        $h2p_j(div_sendBarrage).append($h2p_j(hr_style));
        $h2p_j(div_sendBarrage).append(div_barrageSendBtn);


        // 检查弹幕面板挂载点（斗鱼弹幕显示区域）是否加载完成
        var check_mountPoint_barragePanel = setInterval( function(){
            if( $h2p_j('div.layout-Player-asideMainTop')[0] ){
                setTimeout( function(){
                    $h2p_j( $h2p_j('div.layout-Player-asideMainTop')[0] ).append( div_sendBarrage );
                }, 3000);
                window.clearInterval( check_mountPoint_barragePanel );
            }
        }, 1000);


        // 检查弹幕图标挂载点（斗鱼弹幕输入框）是否加载完成
        var check_mountPoint_barrageIcon = setInterval( function(){
            if( document.getElementById('div-sendBarrage') && document.getElementsByClassName('ChatToolBar')[0] ){
                let div_sign = $h2p_j('<div class="h2p-div-sign" style="margin: -8px 0 0 -5px;" title="弹幕封禁"></div>');

                let btn_sign = $h2p_j('<span id="button-sign" class="h2p-span-sign">📢</span>');
                $h2p_j(btn_sign).click(function(){
                    $h2p_j('div#div-sendBarrage').toggle();
                    $h2p_j('div#div-DYLight').hide();
                    $h2p_j('div#div-setting').hide();
                });

                $h2p_j(div_sign).append(btn_sign);

                $h2p_j( $h2p_j('div.ChatToolBar')[0] ).append( div_sign );
                window.clearInterval( check_mountPoint_barrageIcon );
            }
        }, 1000);
    }

    // 调用初始化自动发弹幕函数
    initView_barrage();
})();