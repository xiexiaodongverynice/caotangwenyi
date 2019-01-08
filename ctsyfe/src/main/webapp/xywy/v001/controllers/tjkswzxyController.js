angular.module('starter.tjkswzxyController', ['ionic'])
    //找医生
    .controller('tjkswzxy', function(wxApi, $scope, $state, $stateParams, $interval, $timeout, XywyService, Popup, Outlet, Message, $ionicScrollDelegate, audioControl, Yuyin, $window,$rootScope,geoLocation,$ionicHistory) {
        
    	$scope.isIos = false;
    	$scope.inputFocus = false;
    	if(!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)){
    		$scope.isIos = true;
            sessionStorage.setItem('isIos',$scope.isIos);
    	}
    	//默认打开语音播放
//    	$scope.localyyzt = "打开";
//    	localStorage.setItem("yyzhuangtai", "打开");
    	
    	$scope.labelpadding=function(curgn){
            return ;
    		// if(curgn=="WZZ"){
    		// 	return ;
    		// }else{
    		// 	return{"padding-left":"40px"};
    		// }
    	};
//    	用户输入信息记录
    	$scope.yonghuinput="";
    	//       根据功能判断年龄性别是否显示的显示
    	$scope.showagesex=function(gn){
    		var p="";
    		// if(gn=="WZZ" || gn=="ZNDZ"){

    		// }else{
    		// 	p="hidden";
    		// }
    		return {"visibility":p};
    	}
    	 /**
         *当交互页面打开时调用，判断容器的大小是否需要改变
         *如：不需要语音部分时的容器调整
         */
    	$scope.ionscrollngstyle=function(hideVoice , inputMethod){
    		if($stateParams.gn=="WSS"||$stateParams.gn=="WYP"||$stateParams.gn=="WJB"||$stateParams.gn=="ZWPG"||$stateParams.gn=="CJZZ"){
    			$scope.resize();
    			return ;
    		}
    		var bottom="";
    		if(!hideVoice && inputMethod==="voice"){
    			bottom="205px";
    		}else{
    			bottom="49px";
    		}
    		return {"bottom":bottom}
    	}
    	//  语音状态（用于判断页面显示图标）
        $scope.localyyzt = localStorage.getItem("yyzhuangtai");
        if (localStorage.getItem("yyzhuangtai") === "禁止") { //禁止语音播放
            $scope.yuyinopen = "打开语音";
        } else { //允许语音播放
            $scope.yuyinopen = "关闭语音";
        }

        //隐藏年龄列表
        $scope.isHidePopup = function () {
            $scope.isShow_jj_yp_list = false;
            $scope.isShow_bl_yp_list = false;
            $scope.isShow_bl_yp_btn = true;
        };

        //  判断语音播放状态（语音播放按钮点击事件）
        $scope.yuyinzt = function() {
            //      当前状态是禁止播放
            if (localStorage.getItem("yyzhuangtai") === "禁止") {
                //          改变当前状态
                localStorage.setItem("yyzhuangtai", "打开");
                $scope.yuyinopen = "关闭语音";
            } else {
                localStorage.setItem("yyzhuangtai", "禁止");
                $scope.yuyinopen = "打开语音";
                audioControl.pause();
            }
            $scope.localyyzt = localStorage.getItem("yyzhuangtai");
        };

        //  标题
        $scope.curgn = $stateParams.gn;
        $scope.data = { textValue: "", voiceTip: "按住说话" };
            $scope.title = "问症寻医";
             $scope.inputMethod='voice';
             $scope.data.hideVoice=false;

        //  获取微信用户的openid
        var userid = sessionStorage.getItem("openId");
        //  返回按钮
        $scope.goBack = function() {
            var historyPage = $stateParams.history;
            if(historyPage == 'zndz'){
//            	返回时清除缓存
//            	$ionicHistory.clearCache().then(function () {
//            		javascript:history.go(-1);
//                })
                javascript:history.go(-1);
            }else{
            var token=sessionStorage.getItem("token");
    		$state.go("shouye",{openid:userid,token:token});
        }
        }
        $scope.messageArr = [];
        // addDialog(testData.audio);
        //  当前交互问题的存放
        $scope.resdata = {};
        //  是否走疑似疾病流程（0是，1不走疾病流程）
        $scope.iszsk = 1;
//        判断多选是否是点击了确认
        var tjbdqd="";
        //  （点击按钮或连接文字，获得患者选中内容，并发送到显示页面）（可能需要患者回答内容的类型type）
        $scope.$on('userSubmit', function(event, userChoose) {
            userChoose.style = '1';
            if (userChoose === false || userChoose.input === false) {
                //TODO 用户多选时取消
                console.log('用户取消了')
                //              取消重新输入主词
                $scope.setGn($stateParams.gn);
                //                取消时将重新走症状知识库部分
                $scope.iszsk = 1;
            } else if (userChoose.input === "继续") {
                //              是否走疑似疾病流程（0是，1不走疾病流程进入知识库流程）
                $scope.iszsk = 0;
                interaction(userChoose, userid);
            } else {
                //              是否走疑似疾病流程（0是，1不走疾病流程进入知识库流程）
                $scope.iszsk = 0; //??待定
                //              判断当前问题类型是否是多选类型（是则不在页面显示用户选择了哪些内容）
                if ($scope.resdata[0].type === "multiple") {
                    //                  不显示用户发送消息内容
                } else {
                    addDialog({ type: 'text', message: userChoose.input, user: true });
                }
                interaction(userChoose, userid);
                //              }

            }
        });



        function addDialog(message) {
            if (angular.isString(message)) {

            }
            $scope.inputFocus = false;
            audioControl.pause();
            $scope.messageArr.push(message);
            //console.log($scope.messageArr);
        }

        document.oncontextmenu = function (e) {
            e.preventDefault();
        };

        //语音部分代码
        $scope.listSize=myConfig.listSize;
        var smallScroll = $ionicScrollDelegate.$getByHandle('small');
        var scrollContainer;
        $timeout(function() {
            scrollContainer = smallScroll.getScrollView().__container;
        });
        var realHeight = $window.innerHeight;
        $scope.randomId = Math.random().toString(16).slice(2);

        /**
        *当滚动容器大小应该变化时调用
        *如：切换语音输入、语音输入按钮显示隐藏
        */
        $scope.resize = function() {
            if ($scope.data.hideVoice) {
                var clientHeight = scrollContainer.clientHeight;
                smallScroll.resize().then(function() {
                    var bottomPos = smallScroll.getScrollPosition().top + scrollContainer.clientHeight;
                    if (bottomPos < scrollContainer.scrollHeight) {
                        smallScroll.scrollBy(0, -155, true);
                    }
                    // else if(scrollContainer.scrollHeight -bottomPos < 155){
                    //         console.log(scrollContainer.scrollHeight-bottomPos);
                    //     smallScroll.scrollBy(0, scrollContainer.scrollHeight-bottomPos, true);
                    // }
                });
            } else {
                smallScroll.scrollBy(0, 155, true);
            }
        }

        $scope.switchInput = function() {
            realHeight = $window.innerHeight;
            if ($scope.inputMethod === 'keyboard') {
                $scope.inputFocus = false;
                $scope.inputMethod = 'voice';
                $scope.resize();
            } else {
                $scope.inputFocus = true;
                $scope.inputMethod = 'keyboard';
            }
        };
//		是否显示语音提示图标
        $scope.isshowimg=false;
        var startY = 0,
            startAudio = new Audio("./mp3/luyinkaishi.mp3"),
            finishAudio = new Audio("./mp3/luyinjieshu.mp3"),
            startTime;
        $scope.start = false;

        function startFunc() {
            $scope.start = true;
            $scope.isshowimg=true;
            $scope.data.voiceTip = '向上滑动，取消发送';
        }

        function finishFunc() {
            $scope.data.voiceTip = '按住说话';
            $scope.start = false;
        }
        $scope.send = function($event) {
            $scope.inputFocus = false;
            $scope.sendmessage();
        }
        //识别回调函数
        function successFunc(text) {
            if (text === false || text === "只是一个模拟调试的结果") {
                addDialog({ type: 'text', message: "没有听清", radioMsg: "没有听清" });
                $scope.zIndex = false;
            } else {
                $scope.sendmessage(text);
            }
        };
        var bindFunces = Yuyin(startFunc, finishFunc, successFunc);

        $scope.startRecord = function($event) {
            $scope.zIndex = true;
            $scope.isshowimg = true;
            // startAudio.play();
            $event.preventDefault();
            startTime = $event.timeStamp;
            startY = $event.touches[0].screenY;
            bindFunces.start();
            $scope.moveaction($event)
        };

        $scope.moveaction = function($event) {
        	$scope.isshowimg=true;
            if ($scope.start) {
                if ($event.touches[0].screenY - startY < -50) {
                    $scope.data.voiceTip = '松开手指，取消发送';
                    $scope.cancel = true;
                } else {
                    $scope.cancel = false;
                    $scope.data.voiceTip = '向上滑动，取消发送';
                };
                $scope.zIndex = false;
            }
        };

        $scope.finishRecord = function($event) {
        	$scope.isshowimg=false;
            if ($scope.cancel) { /* || ($event.timeStamp && $event.timeStamp - startTime < 100)*/
                bindFunces.stop();
                $scope.zIndex = false;
            } else {
                // finishAudio.play();
                bindFunces.finish();
                $scope.zIndex = false;
            }
            $scope.cancel = false;
            $timeout(function() {
                smallScroll.resize();
            });
        };
        
        //ios手机input键盘弹出问题
        var bodyScroll = $ionicScrollDelegate.$getByHandle('intBody');
        var realHeight = $window.innerHeight;
        $scope.inputFocu = function(){
            $timeout(function () {
                bodyScroll.scrollBy(0, realHeight - $window.innerHeight, true);
            },800)
        };
        $scope.inputBlur = function(){
            $timeout(function () {
                var inputIntId = document.getElementById("inputIntId");
                inputIntId.blur();
                //realHeight = $window.innerHeight;
            },800)
        };

        $scope.$on('fankui', function(event, bool) {
            $scope.fankui(bool);
        });
        $scope.fankui = function(bool) {
            var index = 0,
                length = $scope.messageArr.length;
            for (var i = length - 1; i >= 0; i--) {
                if ($scope.messageArr[i].newSearchFlag) {
                    index = i - 1;
                    break;
                }
            }
            var data = angular.toJson($scope.messageArr.slice(index));
            if (bool) {
            	var param = {
            			fknr: '正确',
            			jhnr: data
                	};
                XywyService.save('/fankuiyijian', param)
                    .then(function(res) {
                        if (res.data) Popup.alert(res.data+"！");
                    });
            } else {
                Popup.fankui({ data: data });
            }
        };

        //语音部分代码



        //  发送信息
        $scope.sendmessage = function(value, resloid, length) {
            if (!value) {
                value = $scope.data.textValue;
            }
            if (!!resloid) {
                addDialog({ type: 'text', radioMsg: resloid, message: value, user: true });
            } else if (!!value) {
                addDialog({ type: 'text', message: value, user: true });
            } else {
                return;
            }

            //      清空输入框中的内容
            $scope.data.textValue = "";
//            if ($scope.resdata.type === "multiple"&& value.indexOf("以上都不存在")<0) {
//                var tishi = { type: "text", message: "请点击确认按钮确定选择内容，或者输入以上都不存在排除上述所有内容，或者选择取消按钮重新输入症状。" };
//                addDialog(new Message(tishi));
//            } else {
//                interaction({ input: value }, userid);
//            }
            if ($scope.resdata.type === "multiple") {
            	tjbdqd="非确认";
            }
             interaction({ input: value,style:'2' }, userid);

             $('.button-ddd').attr('disabled', "true");//历史会话设置为不可用

        }
        //  用户输入内容后的操作（后台执行操作判断交互过程）交互处理
        function interaction(params, userid) {
//        	开发模式和非开发模式显示疾病个数(开发模式显示5个)
        	var keshiLimit =myConfig.keshiLimit;
        	if($stateParams.gn=="WZZ"&&localStorage.getItem("showpingfen")=="true"){
        		keshiLimit=5;
            }
            //state: params.style 判断input是输入的还是列表获取的'1'是列表获取 '2'是输入的
            var param = { userid: userid, input: params.input,style: params.style,processNo: params.processNo, hosOrgCode: myConfig.hosOrgCode, keshiLimit: keshiLimit, iszsk: $scope.iszsk ,tjbdqd:tjbdqd};
            var config = {
                params: param
            }

            XywyService.query("/interactiontjksxzwy", config).then(function(response) {
                $scope.resdata = response.data;
                $scope.questiontype=response.data[0].type;
//                判断用户输入内容记录是否存在
                if(response.data.userjl){
//                  设置页面展示用户输入内容
                    userinputjl(response.data.sex,response.data.age,response.data.userjl);
                }
                if (response.data[0].type != "ysjbresult") {
                	for(var i=0;i<response.data.length;i++){
                		addDialog(new Message(response.data[i]));
                	}
                } else {
                	for(var i=0;i<response.data.length;i++){
                		if(i==0){
                			addDialog({ type: response.data[i].type, radioMsg: response.data[i].radioMsg, list: response.data[i].list, resData: response.data[i].tjkslist,laiyuan: response.data[i].laiyuan });
                		}else{
                			addDialog(new Message(response.data[i]));
                		}
                	}
                    
                }
                //                判断是否是问症状结果,如果是则改变iszsk的值
                if ($stateParams.gn == "WZZ") {
                    if (response.data.type == "result" || response.data.type == "zskresult" || response.data.type == "text") {
                        $scope.iszsk = 1;
                    }
                }
                if (response.data.sex) {
                    $scope.itemsex = response.data.sex.substring(0,1)+"性";
                } else {
                    $scope.itemsex = "未选择";
                }
                if (response.data.age) {
                    $scope.itemage = response.data.age;
                } else {
                    $scope.itemage = "未选择";
                }
                $scope.zIndex = false;
                yesclick();
            }, Popup.alert);
//            清空判断是否点击确认的内容
            tjbdqd="";
        }
        /***
         * 当前用户输入信息记录显示
         */
        function userinputjl(sex,age,yonghujilu){
//			交互信息的性别
            var jhsex=""
            if(sex){
            	jhsex=sex+"-->";
            	}
            var jhage="";
            if(age){
            	jhage=age+"岁-->";
            	}
//            替换文本中的逗号
//            yonghujilu=yonghujilu.replace(/[，|,]/g,"-->");
//          判断是哪个功能模块（用于判断是否展示年龄、性别）  
            if($stateParams.gn == "WZZ"||$stateParams.gn == "ZNDZ"){
//              用户输入信息值展示
            	 $scope.yonghuinput="您当前输入的信息："+jhsex+jhage+yonghujilu;
            }else{
//              用户输入信息值展示
            	$scope.yonghuinput="您当前输入的信息："+yonghujilu;
            }
        }
        //  取消输入其它主词
        $scope.cancelToSrzc = function() {
            var param = { userid: userid };
            var config = {
                params: param
            }

            XywyService.query("/cancelToSrzc", config).then(function(response) {
                addDialog({ type: response.data.type, message: response.data.message, list: response.data.daan });
            }, Popup.alert);
        }
        //  取消选择其它功能
        $scope.cancelToXgn = function() {
            var param = { userid: userid };
            var config = {
                params: param
            }

            XywyService.query("/cancelToXgn", config).then(function(response) {
                addDialog({ type: response.data.type, message: response.data.message, list: response.data.daan });
            }, Popup.alert);
        }
        //  在页面下方直接选择功能
        $scope.restart = function(msg){
            if($stateParams.gn==='WBG'){
                $scope.sendmessage(msg);
            }else{
                 $scope.setGn();
            }
        }
        $scope.setGn = function(name) {
            if (!name) {
                name = $stateParams.gn;
            }
            var param = { userid: userid, gnname: name };
            var config = {
                params: param,
                cache: false
            }
            $scope.setting = true;
            XywyService.query("/newstartxzwy", config).then(function(response) {
//            	重新选功能时(或者重新输入时)清空用户输入信息展示的内容
            	$scope.yonghuinput="";
                $scope.resdata = response.data;
                $scope.questiontype=response.data.type;
                $scope.setting = false;
                if (angular.isArray(response.data)) {
                    angular.forEach(response.data, function(e) {
                        addDialog(new Message(e));
                    });
                } else {
                    addDialog(new Message(response.data));
                }
            }, Popup.alert);
        }
        /**进入页面判断是哪个功能，判断语音播放状态*/
        //  判断$stateParams是否存在功能和主词信息
//        if ($stateParams.gn) {
            $scope.setGn($stateParams.gn);
//        } else {
//            $scope.cancelToXgn();
//        }

        /** 年龄性别选择*/
        //        保存性别年龄
        var savesexage = function(sex, age, gn) {
            var param = { userid: userid, sex: sex, age: age, gn: gn };
            var config = {
                params: param
            }
            //          修改userinfo中的性别人群
            XywyService.query("/saveuserinfoxx", config).then(function(response) {}, Popup.alert);
        }

        //      确定按钮点击事件
        function yesclick() {
            //          用于页面展示年龄性别
            var showage = "年龄";
            var showsex = "性别";
            //          用于保存年龄性别用的数据
            var saveage = "";
            var savesex = "";
            if ($scope.itemsex != "未选择") {
                savesex = $scope.itemsex;
                showsex = $scope.itemsex;
            }
            if ($scope.itemage != "未选择") {
                saveage = $scope.itemage;
                showage = $scope.itemage + "岁";
            }
            $scope.sexagevalue = showsex + "," + showage;
            localStorage.setItem("sex", $scope.itemsex);
            localStorage.setItem("age", $scope.itemage);
        }

        $scope.sexagevalue = "性别,年龄";
        $scope.itemage = localStorage.getItem("age");
        $scope.itemsex = localStorage.getItem("sex");
        if (!$scope.itemage || $scope.itemage == "null") {
            $scope.itemage = "未选择";
        }
        if (!$scope.itemsex || $scope.itemsex == "null") {
            $scope.itemsex = "未选择";
        }
        //       初始化页面时判断年龄性别
        yesclick();
        if ($scope.itemsex == undefined && $scope.itemage == undefined) {
            $scope.sexagevalue = "性别,年龄";
            $scope.itemsex = "未选择";
            $scope.itemage = "未选择";
        }
        //        滑动样式的年龄性别选择框
        //        年龄性别取值范围
        var suData = [{ 'id': '0', 'value': '未选择' }, { 'id': '1', 'value': '男性' }, { 'id': '2', 'value': '女性' }];
        var weiData = [{ 'id': '0', 'value': '未选择' }];
        for (var i = 1; i < 101; i++) {
            var agenumobj = { 'id': i, 'value': i };
            weiData[i] = agenumobj;
        }

        var showGeneralDom = document.querySelector('#showGeneral');
        var suIdDom = document.querySelector('#suId');
        var weiIdDom = document.querySelector('#weiId');
        //      showGeneralDom = document.getElementById('showGeneral');
        //        var suIdDom = document.getElementById('suId');
        //        var weiIdDom = document.getElementById('weiId');
        $scope.click = function() {
            //          展示年龄性别选择框时，展示当前选中的年龄性别
            if ($scope.itemsex == "未选择") {
                showGeneralDom.dataset.su_id = 0;
            } else if ($scope.itemsex == "男性") {
                showGeneralDom.dataset.su_id = 1;
            } else if ($scope.itemsex == "女性") {
                showGeneralDom.dataset.su_id = 2;
            }
            if ($scope.itemage == "未选择") {
                showGeneralDom.dataset.wei_id = 0;
            } else {
                showGeneralDom.dataset.wei_id = $scope.itemage;
            }

            var suId = showGeneralDom.dataset['su_id'];
            var suValue = showGeneralDom.dataset['su_value'];
            var weiId = showGeneralDom.dataset['wei_id'];
            var weiValue = showGeneralDom.dataset['wei_value'];
            var sanguoSelect = new IosSelect(2, [suData, weiData], {
                title: '选择性别年龄',
                itemHeight: 35,
                oneLevelId: suId,
                twoLevelId: weiId,
                callback: function(selectOneObj, selectTwoObj) {
                    suIdDom.value = selectOneObj.id;
                    weiIdDom.value = selectTwoObj.id;
                    //                    showGeneralDom.innerHTML = '蜀国将领是：' + selectOneObj.value + ' 魏国将领是：' + selectTwoObj.value;

                    showGeneralDom.dataset['su_id'] = selectOneObj.id;
                    showGeneralDom.dataset['su_value'] = selectOneObj.value;
                    showGeneralDom.dataset['wei_id'] = selectTwoObj.id;
                    showGeneralDom.dataset['wei_value'] = selectTwoObj.value;
                    $scope.itemsex = selectOneObj.value;
                    $scope.itemage = selectTwoObj.value;
                    //                  执行确定按钮操作
                    yesclick();
                    var age = "";
                    var sex = "";
                    if ($scope.itemsex != "未选择") {
                        sex = $scope.itemsex;
                    }
                    if ($scope.itemage != "未选择") {
                        age = $scope.itemage;
                    }
                    savesexage(sex, age, $stateParams.gn);
                }
            });
        };
        
        geoLocation.getCity().then(function(city) {
            $scope.yiyuan = city.mc;
            sessionStorage.setItem("citydm",city.csdm);
        },function(reason){
            $scope.yiyuan = angular.isString(reason)? reason:'';
        });
        $rootScope.$on('userCityUpdate', function(event, city) {
            $scope.yiyuan = city.mc;
            sessionStorage.setItem("citydm",city.csdm);
        });
        
        $scope.gocity = function() {
            $state.go('xuanchengshi');
        } 
        //问药品禁忌药品年龄段选择
        $scope.jjYpNl = [{'key':'孕妇','value':'1'},{'key':'儿童','value':'2'},{'key':'老人','value':'3'}];
        $scope.isShow_bl_yp_btn = true;

        $scope.show_jj_yp_nld = function(){
            if($scope.isShow_jj_yp_list){
                $scope.isShow_jj_yp_list = false;
                $scope.isShow_bl_yp_btn = true;
            }else{
                $scope.isShow_jj_yp_list = true;
                $scope.isShow_bl_yp_btn = false;
            }
            $scope.isShow_bl_yp_list = false;
        }
        //不良反应药的列表     
        $scope.show_bl_yp_nld = function(){    
            if($scope.isShow_bl_yp_list){
                $scope.isShow_bl_yp_list = false;
            }else{
                $scope.isShow_bl_yp_list = true;
            }
        }
        
        //年龄段列表跳转
        $scope.go_jj_yp_List = function(nld,type){
            $state.go('wenyaojjYpList', { jj_yp_nld:nld,jj_yp_type:type,jj_yp_keyWord:""});
            $scope.isShow_jj_yp_list = false;
            $scope.isShow_bl_yp_list = false;
            $scope.isShow_bl_yp_btn = true;
        }
//    	交互页面底端样式bottom的距离判断
    	$scope.stylebottom=function(){
//    		自我评估，常见症状判断距底端距离
    		if($scope.curgn=="ZWPG"||$scope.curgn=="CJZZ"){
    			return {"bottom":"0px"};
    		}
//    		问症状问报告时判断距底端距离
    		if($scope.isbottom0){
    			return {"bottom":"0px"};
    		}
    		if(!$scope.data.hideVoice && $scope.inputMethod==='voice'){
    			return {"bottom":"134px"};
    		}else{
    			return {"bottom":"44px"};
    		}
    	}
//    	（WZZ、WBG）是否显示输入框
    	$scope.isshowinput=function(){
//     		if($scope.curgn=="WZZ"){
// //    			判断$scope.questiontype是否存在，存在则判断剩余的两个
//     			if(!$scope.questiontype||$scope.questiontype=="text"||$scope.questiontype=="ysjbresult"){
//     				$scope.isbottom0=false;
//     				return;
//     			}else{
// //    				判断距离底部的距离（当输入框隐藏时距底部为0px，bottomheight为true）
//     				$scope.isbottom0=true;
//     				return{"display":"none"};
//     			}		
//     		}
//     		if($scope.curgn=="WBG"){
//     			if(!$scope.questiontype||$scope.questiontype=="text"||$scope.questiontype=="duodetail"){
//     				$scope.isbottom0=false;
//     				return;
//     			}else{
// //    				判断距离底部的距离（当输入框隐藏时距底部为0px，bottomheight为true）
//     				$scope.isbottom0=true;
//     				return{"display":"none"};
//     			}		
//     		}
    		if(!$scope.questiontype||$scope.questiontype=="text"||$scope.questiontype=="duodetail"||$scope.questiontype=="ysjbresult"||$scope.questiontype=="listdetail"||$scope.questiontype=="tjksresult"){
 				$scope.isbottom0=false;
 				return;
 			}else{
//    				判断距离底部的距离（当输入框隐藏时距底部为0px，bottomheight为true）
 				$scope.isbottom0=true;
 				return{"display":"none"};
 			}
    	}
    
    })