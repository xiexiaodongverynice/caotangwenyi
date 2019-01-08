angular.module('starter.pingGuControllers', ['ionic'])
    //体质评估
    .controller('tzpgC', function (wxApi, $ionicViewSwitcher, $scope, $http, jqueryService, $state, $stateParams, XywyService, Popup, $window, $ionicLoading, JsUtil, $timeout) {
        // 基准宽度,取的是iphone6
        XywyService.getRem(750);

        window.onresize = function () {
            XywyService.getRem(750)
        };

        var userId = sessionStorage.getItem('openId');
        $scope.questions = []; //页面数据
        var limit = 10; //分页每页10条
        $scope.pageNum = 0; //页码，默认第1页

        $scope.isIos = false;
        $scope.inputFocus = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
            $scope.localyyzt = "打开";
        }
        if ($stateParams.mainId) {
            $scope.mainId = $stateParams.mainId;
        } else {
            $scope.mainId = "";
        }

        $scope.syrq;
        var lqTempCode, tempBean;
        if ($stateParams.type == 'tzpg') {
            $scope.titlename = "体质评估风险评估";
            $scope.syrqPre = '';
            $scope.isshow = true;
            lqTempCode = "LNRTZ";
            //测试数据
            //lqTempCode = "T1";
            tempBean = "ctsy.lnrLqSubmitDataServiceImpl";
            $scope.modelname = "中医体质评估";
            $scope.modeltitle = "体质评估";
            $scope.modelinfo = "“亿万苍生，九种体质，人各有质，体病相关；体质平和，健康之源，体质偏颇，百病之因。” 通过体质评估可以告诉您是属于哪种体质，并给出健康指导建议。";
        } else if ($stateParams.type == 'ncz') {
            $scope.titlename = "脑卒中风险评估";
            $scope.syrqPre = '本表单只适用于54至85岁的人群,';
            $scope.isshow = false;
            lqTempCode = "QXXNCZ";
            tempBean = "ctsy.nczLqSubmitDataServiceImpl";
            $scope.modelname = "脑卒中风险评估";
            $scope.modeltitle = "风险评估";
            $scope.modelinfo = "本模型应用“改良弗明汉卒中风险评估工具（Framinghamstrokeprofile，FSP）”预测卒中的风险，该工具是目前国外应用最广泛的卒中风险评估工具，也是欧美卒中预防指南推荐应用的卒中风险评估手段。";
        } else if ($stateParams.type == 'tnb') {
            $scope.titlename = "糖尿病风险评估";
            $scope.syrqPre = '本表单只适用于20至74岁的人群,';
            $scope.isshow = false;
            lqTempCode = "TNB";
            tempBean = "ctsy.tnbLqSubmitDataServiceImpl";
            $scope.modelname = "糖尿病风险评估";
            $scope.modeltitle = "风险评估";
            $scope.modelinfo = "本模型应用“中国糖尿病风险评分表”预测糖尿病风险。";
        } else if ($stateParams.type == 'yjk') {
            $scope.titlename = "亚健康风险评估";
            $scope.syrqPre = '';
            $scope.isshow = false;
            lqTempCode = "YJK";
            tempBean = "ctsy.yjkLqSubmitDataServiceImpl";
            $scope.modelname = "亚健康评估";
            $scope.modeltitle = "风险评估";
            $scope.modelinfo = "本模型应用亚健康状态评价问卷“SHSQ-25”评测身体健康状况。";
        } else if ($stateParams.type == 'xlzz') {
            $scope.titlename = "心理健康风险评估";
            $scope.syrqPre = '';
            $scope.isshow = false;
            lqTempCode = "XLZZ";
            tempBean = "ctsy.xlzzLqSubmitDataServiceImpl";
            $scope.modelname = "心理健康评估";
            $scope.modeltitle = "风险评估";
            $scope.modelinfo = "本模型应用“症状自评量表 “SCL-90”评估心理健康状况，该表是世界上最著名的心理健康测试量表之一。评定的时间范围是“现在”或者是“最近一个星期”的实际感觉。";
        }

        $scope.answers = []; //答题列表
        $scope.subData = {
            "lqTemp": {
                "userId": userId,
                "myself": "",
                "yhId": "",
                "des": "",
                "tempCode": lqTempCode,
                "tempBean": tempBean,
                "questions": []
            }
        };

        /**
         * 查询家庭成员
         */
        var cy = null;
        $scope.cyList = [];
        function querychengyuan() {
            // $ionicLoading.show()
            jqueryService.ajax('/queryGuanXiNiCheng', {
                openid: sessionStorage.getItem('openId')
            }, false).then(function (response) {
                $scope.cyList = response;
                $scope.subData.lqTemp.myself = 1;
                if ($scope.cyList.length > 0) {
                    cy = $scope.cyList[0];
                    if (JsUtil.isNotEmpty($scope.cyList[0].id)) {
                        $scope.subData.lqTemp.yhId = $scope.cyList[0].id;
                    }
                    if (JsUtil.isNotEmpty($scope.cyList[0].xingming)) {
                        $scope.subData.lqTemp.des = $scope.cyList[0].xingming;
                    }
                    if (JsUtil.isNotEmpty($scope.cyList[0].value)) {
                        form.cy.value = $scope.cyList[0].value;
                    }
                    if (JsUtil.isNotEmpty($scope.cyList[0].id)) {
                        $scope.cyId = $scope.cyList[0].id;
                    }

                    // var shenGao = document.getElementsByClassName('shenGao');
                    // var age = document.getElementsByClassName('age');
                    // var tiZhong = document.getElementsByClassName('tiZhong');
                    // var sex = document.getElementsByClassName('sex');

                    // if (shenGao.length > 0 && $scope.cyList[0].SHENGAO) {
                    //     shenGao[0].value = $scope.cyList[0].SHENGAO
                    // }
                    // if (age.length > 0 && $scope.cyList[0].age) {
                    //     age[0].value = $scope.cyList[0].age
                    // }
                    // if (tiZhong.length > 0 && $scope.cyList[0].tizhong) {
                    //     tiZhong[0].value = $scope.cyList[0].tizhong;
                    // }
                    // if (sex.length > 0 && $scope.cyList[0].sex) {
                    //     var sexName = sex[0].name;
                    //     sexName = sexName.replace("radio", "");
                    //     $scope.answers[sexName] = $scope.cyList[0].sex;
                    // }

                }
                // $timeout(function(){
                //     $ionicLoading.hide();
                // },2000)
                //form.cy.setAttribute('data-id',$scope.cyList[0].id);
                //form.cy.setAttribute('data-value',$scope.cyList[0].value);
            }, Popup.alert);
        }

        $scope.indexPre = 1; //自定义表单字段前字段数
        $scope.showNc = false; //是否显示昵称字段
        var curidlist = [];
        $scope.clickCYlist = function () {
            var sanguoSelect = new IosSelect(1, [$scope.cyList], {
                title: '选择成员',
                itemHeight: 35,
                oneLevelId: $scope.cyId,
                callback: function (selectOneObj) {
                    //手动调用监听
                    $scope.$apply(function () {
                        form.cy.value = selectOneObj.value;
                        $scope.cyId = selectOneObj.id;
                        $scope.subData.lqTemp.yhId = selectOneObj.id;
                        if (JsUtil.isNotEmpty(selectOneObj.guanxi) && selectOneObj.guanxi === "自己") {
                            $scope.subData.lqTemp.myself = 1;
                        } else {
                            $scope.subData.lqTemp.myself = 0;
                        }
                        // var shenGao = document.getElementsByClassName('shenGao');
                        // var age = document.getElementsByClassName('age');
                        // var tiZhong = document.getElementsByClassName('tiZhong');
                        // var sex = document.getElementsByClassName('sex');

                        if (JsUtil.isNotEmpty(selectOneObj.value) && selectOneObj.value === "其他") {
                            $scope.answers = []; //答题列表
                            $scope.indexPre = 2;
                            $scope.syrq = $scope.syrqPre + '共' + ($scope.itemTotal + $scope.indexPre) + '道题。';
                            $scope.subData.lqTemp.des = "";
                            $scope.subData.lqTemp.yhId = "";
                            $scope.showNc = true;
                            // if (shenGao.length > 0) {
                            //     shenGao[0].value = "";
                            // }

                            // if (age.length > 0) {
                            //     age[0].value = "";
                            // }

                            // if (tiZhong.length > 0) {
                            //     tiZhong[0].value = "";
                            // }
                            // if (sex.length > 0) {
                            //     var sexName = sex[0].name;
                            //     sexName = sexName.replace("radio", "");
                            //     $scope.answers[sexName] = "";
                            // }

                            //loadInitLqFormData("", "");
                        } else {
                            cy = selectOneObj;
                            $scope.indexPre = 1;
                            $scope.subData.lqTemp.des = selectOneObj.xingming;
                            $scope.showNc = false;

                            loadInitLqFormData("", $scope.cyId);

                            // if (shenGao.length > 0 && selectOneObj.SHENGAO) {
                            //     shenGao[0].value = selectOneObj.SHENGAO
                            // }
                            // if (age.length > 0 && selectOneObj.age) {
                            //     age[0].value = selectOneObj.age
                            // }
                            // if (tiZhong.length > 0 && selectOneObj.tizhong) {
                            //     tiZhong[0].value = selectOneObj.tizhong;
                            // }
                            // if (sex.length > 0 && selectOneObj.sex) {
                            //     var sexName = sex[0].name;
                            //     sexName = sexName.replace("radio", "");
                            //     $scope.answers[sexName] = selectOneObj.sex;
                            // }
                        }

                    });

                }
            });
        };





        // 点击返回
        $scope.back = function () {
            var openid = sessionStorage.getItem("openId");
            $ionicViewSwitcher.nextDirection('back');
            var token = sessionStorage.getItem("token");
            if (sessionStorage.getItem('hosorgCode')) {
                var yxzsurl = sessionStorage.getItem('yxzsurl');
                var hosorgCode = sessionStorage.getItem('hosorgCode');
                $state.go("yiyuanshouye", {
                    hosorgCode: hosorgCode,
                    openid: openid,
                    token: token,
                    yxzsurl: yxzsurl
                });
            } else {
                $state.go("shouye", {
                    openid: openid,
                    token: token
                });
            }

        };

        /**
         * 查询自定义表单数据
         * @param {*} mainId 评估记录id
         * @param {*} userId 用户id
         */
        function loadInitLqFormData(mainId, yhId) {
            $timeout(function () {
                $scope.$apply(function () {
                    XywyService.query('/loadInitLqFormData', {
                        params: {
                            lqTempCode: lqTempCode,
                            mainId: mainId,
                            yhid: yhId
                        }
                    }).then(function (response) {
                        // $ionicLoading.show()
                        $scope.questionsData = response.data.lqTemp;
                        $scope.itemTotal = $scope.questionsData.questions.length;
                        $scope.pageCount = $scope.itemTotal / limit;

                        for (var j = 0; j < $scope.questionsData.questions.length; j++) {
                            if ($scope.questionsData.questions[j].queType == "hide") {
                                $scope.questionsData.questions.splice(j, 1);
                                $scope.itemTotal--;
                            }
                        }

                        // 先在页面显示10条

                        $scope.answers = []; //答题列表
                        $scope.questions = []; //页面数据
                        $scope.pageNum = 0; //页码，默认第1页

                        for (var i = 0; i < limit; i++) {
                            var xiaoBiao = $scope.pageNum * limit + i;
                            if ($scope.questionsData.questions[xiaoBiao]) {
                                $scope.questions.push($scope.questionsData.questions[xiaoBiao])
                            }
                        }

                        $scope.syrq = $scope.syrqPre + '共' + ($scope.itemTotal + $scope.indexPre) + '道题。';
                        // if (mainId) {
                        //$scope.subData.lqTemp.des = response.data.lqTemp.des;
                        //$scope.subData.lqTemp.myself = response.data.lqTemp.myself;

                        for (var i = 0; i < $scope.questionsData.questions.length; i++) {
                            var item = $scope.questionsData.questions[i];
                            if (item.queType == "radio") {
                                if (item.resultAnswer) {
                                    $scope.answers[i] = item.resultAnswer.ansValue;

                                } else {
                                    if (cy) {
                                        if (item.queName == "性别") {
                                            $scope.answers[i] = cy.sex
                                        }
                                    }
                                }
                            } else if (item.queType == "text") {
                                if (item.answers && item.answers[0]['ansValue'])
                                    $scope.answers[i] = item.answers[0]['ansValue'];

                            } else if (item.queType == "step") {
                                // 有历史记录优先用历史
                                if (item.answers && item.answers[0]['ansValue']) {
                                    $scope.answers[i] = item.answers[0]['ansValue'];
                                } else {
                                    if (cy) {
                                        if (item.queName == "身高") {
                                            $scope.answers[i] = cy.shengao
                                        }
                                        if (item.queName == "体重") {
                                            $scope.answers[i] = cy.tizhong
                                        }
                                        // if (item.queName == "年龄") {
                                        //     $scope.answers[i] = cy.age
                                        // }
                                    } else {

                                    }

                                }

                            }

                        }
                        // }
                        // $timeout(function(){
                        //     $ionicLoading.hide();
                        // },2000)
                    }, Popup.alert);
                })
            }, 500)

        };



        //  返回按钮
        $scope.goBack = function () {
            $window.history.back();
        }

        // 提交表单方法
        $scope.submit = function () {
            $ionicLoading.show({
                content: 'Loading',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
            if (JsUtil.isEmpty($scope.subData.lqTemp.myself)) {
                //判断“为自己评估”题有没有答题 
                $ionicLoading.hide();
                Popup.alert('没有完成答题！');
                return false;
            }
            // 织组提交数据
            for (var i = 0; i < $scope.questionsData.questions.length; i++) {
                var val;
                var formType = $scope.questionsData.questions[i].queType;
                if (formType === "text" || formType === "step") {
                    val = form['text' + i].value;
                } else {
                    val = form['radio' + i].value;
                }
                if (JsUtil.isEmpty(val)) {
                    $ionicLoading.hide();
                    Popup.alert('没有完成答题！');
                    return false;
                }
                $scope.answers[i] = val;
                var val = [];
                var valObj = {
                    "ansValue": $scope.answers[i]
                }
                val.push(valObj);
                var obj = {
                    queCode: $scope.questionsData.questions[i].queCode,
                    answers: val
                };
                $scope.subData.lqTemp.questions.push(obj);
            }


            //判断是否为脑卒中评估
            if ($stateParams.type == 'ncz') {
                var questions = $scope.subData.lqTemp.questions;
                for (var i = 0; i < questions.length; i++) {
                    if (questions[i].queCode == "SEX") {
                        localStorage.setItem('nczsex', questions[i].answers[0].ansValue);
                        break;
                    }
                }
            }
            XywyService.save("/submitLqFormData", $scope.subData).then(
                function (result) {
                    $ionicLoading.hide();
                    if (result.data.state) {
                        if ($stateParams.type == 'tzpg') {
                            //体质评估
                            var dataOjb = {
                                datas: result.data.lqTemp.lqResult.DATAS,
                                date: ''
                            };
                            var pgResult = JSON.stringify(dataOjb);
                        } else {
                            var dataOjb = {
                                datas: result.data.lqTemp.lqResult,
                                date: ''
                            };
                            var pgResult = JSON.stringify(dataOjb);

                        }
                        localStorage.setItem('pgResult', pgResult);
                        $state.go('tzpgDetail', {
                            'type': $stateParams.type
                        });
                    } else {
                        $state.go('tzpgJieGuo', {
                            'type': $stateParams.type
                        });
                    }
                }, Popup.alert)
        };


        // 体质介绍
        $scope.tzpgJieShao = function () {
            $state.go('tzpgJieShao');
        };

        $scope.dingwei = function (index) {
            var _id = document.getElementById("li-" + (index + 2));
            if (_id) {
                var pos = _id.offsetTop;
                $("#tzpg").animate({
                    scrollTop: pos
                }, 500);
            }
        };
        /**
         * 选择器（身高，体重，年龄选择）
         */
        //用于存放当前选择的值对应的id（即选中Datalist的id）
        var curidlist = [];
        $scope.clicklist = function (index, item) {
            var quename = item.queName;
            //最大值
            var max = parseInt(item.stepMaxNum);
            //最小值
            var min = parseInt(item.stepMinNum);
            //步进
            var stepradixnum = parseInt(item.stepRadixNum);
            var Datalist = [];
            var n = 0;
            for (var i = min; i < max + 1;) {
                var agenumobj;
                if (quename == "腰围") {
                    //计算尺寸
                    var chicun = (i * 3) / 100;
                    var array = chicun.toString().split(".");
                    var chi = array[0] + "尺";
                    var cun = "";
                    if (array[1] && array[1] != 0) {
                        cun = array[1] + "寸"
                    }
                    agenumobj = {
                        'id': i,
                        'value': i + "(" + chi + cun + ")"
                    };
                } else {
                    agenumobj = {
                        'id': i,
                        'value': i
                    };
                }

                Datalist[n] = agenumobj;
                n++;
                i += stepradixnum;
            }
            var curId;
            if (curidlist[index]) {
                curId = curidlist[index];
            } else if (item.resultAnswer) {
                curId = item.resultAnswer.ansValue;
            }

            var sanguoSelect = new IosSelect(1, [Datalist], {
                title: '选择' + quename,
                itemHeight: 35,
                oneLevelId: curId,
                callback: function (selectOneObj) {
                    //手动调用监听
                    $scope.$apply(function () {
                        $scope.answers[index] = selectOneObj.id;
                    });
                    curidlist[index] = selectOneObj.id;

                }
            });
        };



        $scope.task_hasMoreItem = true;
        //上拉加载更多数据
        $scope.loadMicMore = function () {
            $scope.pageNum += 1;

            if ($scope.pageNum <= $scope.pageCount) {
                //隐藏无数据提示
                $scope.task_hasMoreItem = true;
                for (var i = 0; i < limit; i++) {
                    var xiaBiao = $scope.pageNum * limit + i;
                    if ($scope.questionsData.questions[xiaBiao]) {
                        $scope.questions.push($scope.questionsData.questions[xiaBiao]);
                    }
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            } else {
                //显现提示
                $scope.task_hasMoreItem = false;
                // $scope.reusltNullTip = "已加载全部";

                //隐藏上拉加载
                $scope.isShow = true;
                //禁止上拉滑动
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        };
        //初始化方法
        $scope.init = function () {
            loadInitLqFormData($stateParams.mainId, userId);
            querychengyuan();
        }
        $scope.$on('$ionicView.enter', function () {
            // console.log("页面加载完成")
            $ionicLoading.show();
            $timeout(function () {
                $scope.init()
                $ionicLoading.hide();
            }, 2000)
        })

    })

    .controller('tzpgjieshaoC', function (wxApi, $scope, $http, $state, $stateParams, $timeout, XywyService, Popup, Outlet, $ionicScrollDelegate, audioControl, $window, $rootScope, geoLocation) {

        var c = 750; // 基准宽度,取的是iphone6
        var b = document.getElementsByTagName('html')[0];
        var f = b.getBoundingClientRect().width / c;
        b.style.fontSize = f + 'rem';
        //判断手机类型
        $scope.isIos = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
        }
        //  返回按钮
        $scope.goBack = function () {
            $window.history.back();
        }

    })

    .controller('tzpgjieguoC', function (wxApi, $ionicViewSwitcher, $scope, $http, $state, $stateParams, $timeout, XywyService, Popup, Outlet, $ionicScrollDelegate, audioControl, $window, $rootScope, geoLocation) {
        XywyService.getRem(750);
        $scope.modelname;
        $scope.type = $stateParams.type;
        if ($scope.type == 'tzpg') {
            $scope.modelname = "中医体质评估";
        } else if ($scope.type == 'ncz') {
            $scope.modelname = "脑卒中风险评估";
        } else if ($scope.type == 'tnb') {
            $scope.modelname = "糖尿病风险评估";
        } else if ($scope.type == 'yjk') {
            $scope.modelname = "亚健康风险评估";
        } else if ($scope.type == 'xlzz') {
            $scope.modelname = "心理健康风险评估";
        }


        //判断手机类型
        $scope.isIos = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
        }
        //  返回按钮
        $scope.goBack = function () {
            $window.history.back();
        }
        // 评估首页
        $scope.goPgsy = function () {
            if ($scope.type == 'tzpg') {
                $state.go('pingGuMain', {
                    'type': $stateParams.type
                });
                sessionStorage.setItem("isfromshouye", false);
            } else
                $state.go('yjkmain', {
                    'type': $stateParams.type
                });
        };

        // 浮动菜单操作
        $scope.isMenuShow = false;
        // 隐藏菜单
        var hideMenu = function () {
            $("#m-body").fadeOut();
            $scope.isMenuShow = false;
        }
        // 显示菜单
        var showMenu = function () {
            $("#m-body").fadeIn();
            $scope.isMenuShow = true;
        }
        // 点击蓝色圆按钮显示写贴子、查看贴子菜单
        $scope.menuSwitch = function (event) {
            if ($scope.isMenuShow) {
                hideMenu();
            } else {
                showMenu()
            }
            event.preventDefault();
        };
        // 其他地方点击隐藏菜单
        $scope.hideMenuClick = function (event) {
            if ($scope.isMenuShow) {
                hideMenu();
            }
            event.preventDefault();
        };



        //点击重新评估
        $scope.restartPingGu = function () {
            $state.go('pingGu', {
                type: $scope.type
            });
        }
    })
    .controller('tzpgDetail', function (wxApi, $ionicViewSwitcher, $scope, $http, $state, $stateParams, $timeout, XywyService, Popup, Outlet, $ionicScrollDelegate, audioControl, $window, $rootScope, geoLocation, GoZzJbYp) {
        XywyService.getRem(750);
        $scope.choseItems = [];
        $scope.type = $stateParams.type;
        var jbmc = null; //查询疾病描述关键字
        if ($scope.type == 'tzpg') {
            $scope.modelname = "中医体质评估";
        } else if ($scope.type == 'ncz') {
            $scope.modelname = "脑卒中风险评估";
            jbmc = "脑血管意外";
        } else if ($scope.type == 'tnb') {
            $scope.modelname = "糖尿病风险评估";
            jbmc = "糖尿病";
        } else if ($scope.type == 'yjk') {
            $scope.modelname = "亚健康指数评估";
        } else if ($scope.type == 'xlzz') {
            $scope.modelname = "心理健康指数评估";
        }
        $scope.nczsex = localStorage.getItem("nczsex");


        //判断手机类型
        $scope.isIos = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
        }

        // 浮动菜单操作
        $scope.isMenuShow = false;
        // 隐藏菜单
        var hideMenu = function () {
            $("#m-body").fadeOut();
            $scope.isMenuShow = false;
        }
        // 显示菜单
        var showMenu = function () {
            $("#m-body").fadeIn();
            $scope.isMenuShow = true;
        }
        // 点击蓝色圆按钮显示写贴子、查看贴子菜单
        $scope.menuSwitch = function (event) {
            if ($scope.isMenuShow) {
                hideMenu();
            } else {
                showMenu()
            }
            event.preventDefault();
        };
        // 其他地方点击隐藏菜单
        $scope.hideMenuClick = function (event) {
            if ($scope.isMenuShow) {
                hideMenu();
            }
            event.preventDefault();
        };

        //返回上一页
        $scope.goBack = function () {
            localStorage.setItem('isXywy', false);
            sessionStorage.setItem("isfromshouye", false);
            if ($scope.type == 'tzpg') {
                $state.go('pingGuMain', {
                    'type': $stateParams.type
                });
            } else
                $state.go('yjkmain', {
                    'type': $stateParams.type
                });
        };

        var result = angular.fromJson(localStorage.getItem('pgResult'));
        // 组织营养膳食条件
        if ($scope.type == 'tzpg') {
            for (var i = 0; i < result.datas.length; i++) {
                var tz = result.datas[i];
                var item = {
                    //体质评估去掉字典，直接根据名称查询
                    title: tz.P_NAME,
                    code: tz.P_NAME
                }
                $scope.choseItems.push(item);
            }
        }
        $scope.pgResult = result.datas;

        $scope.pgDate = result.date;


        $scope.jbDes
        if (jbmc != null) {
            XywyService.query('/android/getJbzs', {
                params: {
                    jbmc: jbmc
                }
            }).then(function (response) {
                $scope.jbDes = response.data.DATA;
            }, Popup.alert);
        }

        // 跳转营养膳食
        $scope.goShanShi = function () {
            localStorage.setItem("tjData", angular.toJson($scope.choseItems));
            $state.go('ssys', { type: "ss" });
        };


        //重新评估
        $scope.cxpg = function () {
            $state.go('pingGu', {
                type: $scope.type,
                mainId: $scope.pgResult.mainId
            });
        }

        //首页
        $scope.back = function () {
            var openid = sessionStorage.getItem("openId");
            $ionicViewSwitcher.nextDirection('back');
            var token = sessionStorage.getItem("token");
            if (sessionStorage.getItem('hosorgCode')) {
                var yxzsurl = sessionStorage.getItem('yxzsurl');
                var hosorgCode = sessionStorage.getItem('hosorgCode');
                $state.go("yiyuanshouye", {
                    hosorgCode: hosorgCode,
                    openid: openid,
                    token: token,
                    yxzsurl: yxzsurl
                });
            } else {
                $state.go("shouye", {
                    openid: openid,
                    token: token
                });
            }

        };

        function tzpgSS(parent) {
            var groundPa = parent.parentElement.querySelectorAll("div");
            $('#pgjg').animate({
                height: "100%"
            }, 0);
            for (var i = 0; i < groundPa.length; i++) {
                var par_borther = groundPa[i];
                if (parent == par_borther) {
                    continue;
                }
                var par_ul = par_borther.querySelector('ul');
                var par_p = par_borther.querySelector('p');
                var par_span = par_borther.querySelector('span');
                if (par_ul) {
                    par_ul.className = "hide";
                    if (par_p != "hide") {
                        par_p.className = "hide";

                    }
                    if (par_span != "icon ion-ios-arrow-down activated") {
                        par_span.className = "icon ion-ios-arrow-down activated";
                    }
                }
            }
            var ul = parent.querySelector('ul');
            var p = parent.querySelector('p');
            var span = parent.querySelector('span');
            if (ul) {
                $('#pgjg').height("auto");
                if (ul.className == "hide") {
                    ul.className = "";
                    p.className = "tz-desc";
                    span.className = "icon ion-ios-arrow-up activated";

                } else {
                    ul.className = "hide";
                    p.className = "hide";
                    span.className = "icon ion-ios-arrow-down activated";
                }
            }


        }
        //体质评估伸给缩
        $scope.isshowall = function (index) {
            var parent = document.getElementById('tz' + index)
            tzpgSS(parent);
        };
        $scope.spanShowall = function (event) {
            var parent = event.target.parentElement.parentElement;
            tzpgSS(parent);
        };


        // 展开健康指导
        function shenSuo(tr, index) {
            var span = tr.querySelector('span');
            var table = tr.parentElement;
            var des = table.querySelector("#des" + index);
            var trBrothers = table.querySelectorAll(".title");
            for (var i = 0; i < trBrothers.length; i++) {
                trBrother = trBrothers[i];
                if (trBrother == tr) {
                    continue;
                }
                var ionDowns = trBrother.querySelector(".ion-ios-arrow-up");
                if (ionDowns) {
                    ionDowns.className = "icon ion-ios-arrow-down activated";
                    var trDes = trBrother.nextElementSibling;
                    if (trDes) {
                        var id = trDes.id;
                        if (id) {
                            if (trDes.className != "hide") {
                                trDes.className = "hide";
                            }
                        }
                    }
                }

            }
            if (des) {
                if (des.className == "hide") {
                    des.className = "";
                    span.className = "icon ion-ios-arrow-up activated";
                } else {
                    des.className = "hide";
                    span.className = "icon ion-ios-arrow-down activated";
                }
            }
        }

        // 点击图标展开健康指导
        $scope.spanClick = function (event, index) {
            var span = event.target;
            var tr = span.parentElement.parentElement;
            shenSuo(tr, index);
        };
        // 点击单元格展开健康指导
        $scope.trClick = function (event, index) {
            var tr = event.target.parentElement;
            shenSuo(tr, index);
        };

        /**
         * 脑卒中参考表格颜色变化ng-style
         */
        $scope.nczcolor = function (deifen, fenzhi) {
            if (deifen == fenzhi && fenzhi != "") {
                return {
                    "background-color": "#FFA015",
                    "color": "white"
                };
            } else {
                return;
            }

        };
        /**
         * 脑卒中参考值（男）
         */
        $scope.nczckznan = [{
            fenzhi1: "1",
            value1: "3%",
            fenzhi2: "11",
            value2: "11%",
            fenzhi3: "21",
            value3: "42%"
        }, {
            fenzhi1: "2",
            value1: "3%",
            fenzhi2: "12",
            value2: "13%",
            fenzhi3: "22",
            value3: "47%"
        }, {
            fenzhi1: "3",
            value1: "4%",
            fenzhi2: "13",
            value2: "15%",
            fenzhi3: "23",
            value3: "52%"
        }, {
            fenzhi1: "4",
            value1: "4%",
            fenzhi2: "14",
            value2: "17%",
            fenzhi3: "24",
            value3: "57%"
        }, {
            fenzhi1: "5",
            value1: "5%",
            fenzhi2: "15",
            value2: "20%",
            fenzhi3: "25",
            value3: "63%"
        }, {
            fenzhi1: "6",
            value1: "5%",
            fenzhi2: "16",
            value2: "22%",
            fenzhi3: "26",
            value3: "68%"
        }, {
            fenzhi1: "7",
            value1: "6%",
            fenzhi2: "17",
            value2: "26%",
            fenzhi3: "27",
            value3: "74%"
        }, {
            fenzhi1: "8",
            value1: "7%",
            fenzhi2: "18",
            value2: "29%",
            fenzhi3: "28",
            value3: "79%"
        }, {
            fenzhi1: "9",
            value1: "8%",
            fenzhi2: "19",
            value2: "33%",
            fenzhi3: "29",
            value3: "84%"
        }, {
            fenzhi1: "10",
            value1: "10%",
            fenzhi2: "20",
            value2: "37%",
            fenzhi3: "30",
            value3: "88%"
        }];
        /**
         * 脑卒中参考值（女）
         */
        $scope.nczckznv = [{
            fenzhi1: "1",
            value1: "1%",
            fenzhi2: "11",
            value2: "8%",
            fenzhi3: "21",
            value3: "43%"
        }, {
            fenzhi1: "2",
            value1: "1%",
            fenzhi2: "12",
            value2: "9%",
            fenzhi3: "22",
            value3: "50%"
        }, {
            fenzhi1: "3",
            value1: "2%",
            fenzhi2: "13",
            value2: "11%",
            fenzhi3: "23",
            value3: "57%"
        }, {
            fenzhi1: "4",
            value1: "2%",
            fenzhi2: "14",
            value2: "13%",
            fenzhi3: "24",
            value3: "64%"
        }, {
            fenzhi1: "5",
            value1: "2%",
            fenzhi2: "15",
            value2: "16%",
            fenzhi3: "25",
            value3: "71%"
        }, {
            fenzhi1: "6",
            value1: "3%",
            fenzhi2: "16",
            value2: "19%",
            fenzhi3: "26",
            value3: "78%"
        }, {
            fenzhi1: "7",
            value1: "4%",
            fenzhi2: "17",
            value2: "23%",
            fenzhi3: "27",
            value3: "84%"
        }, {
            fenzhi1: "8",
            value1: "4%",
            fenzhi2: "18",
            value2: "37%",
            fenzhi3: "",
            value3: ""
        }, {
            fenzhi1: "9",
            value1: "5%",
            fenzhi2: "19",
            value2: "32%",
            fenzhi3: "",
            value3: ""
        }, {
            fenzhi1: "10",
            value1: "6%",
            fenzhi2: "20",
            value2: "37%",
            fenzhi3: "",
            value3: ""
        }];
        /**
         * 症状指南详情中药品查询
         */
        $scope.yaopinlist = function (name, leixing) {
            GoZzJbYp.yaopinlist(name, leixing);
        }
    })

    .controller('FxpgC', function (wxApi, $scope, $http, $state, $stateParams, XywyService, Popup, $window, $ionicViewSwitcher) {

        var c = 750; // 基准宽度,取的是iphone6
        var b = document.getElementsByTagName('html')[0];
        var f = b.getBoundingClientRect().width / c;
        b.style.fontSize = f + 'rem';

        $scope.isFromShouye = sessionStorage.getItem("isfromshouye");

        $scope.back = function () {
            var openid = sessionStorage.getItem("openId");
            $ionicViewSwitcher.nextDirection('back');
            var token = sessionStorage.getItem("token");
            if (sessionStorage.getItem('hosorgCode')) {
                var yxzsurl = sessionStorage.getItem('yxzsurl');
                var hosorgCode = sessionStorage.getItem('hosorgCode');
                $state.go("yiyuanshouye", {
                    hosorgCode: hosorgCode,
                    openid: openid,
                    token: token,
                    yxzsurl: yxzsurl
                });
            } else {
                $state.go("shouye", {
                    openid: openid,
                    token: token
                });
            }
        }

        //IOS隐藏最上方标题栏
        $scope.isIos = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
        }
        var tijianbaogaoData = "分析异常体检指标，指导健康生活方式"
        $scope.tijianbaogao = tijianbaogaoData;


        var naocuzhongData = "分析脑卒中风险因素，指导健康生活方式"
        $scope.jbncz = naocuzhongData;

        var tangniaobingData = "分析糖尿病风险因素，指导健康生活方式"
        $scope.jbtnb = tangniaobingData;

        var yajiankangData = "分析亚健康风险因素，指导健康生活方式"
        $scope.jbyjk = yajiankangData;
        //心理健康评估
        $scope.jbxljk = "分析心理健康风险因素，指导健康生活方式";

        $scope.naocuzhong = function () {
            // 用于判断交互页面是否从首页进入（用于交互对话框的位置定位的判断） 
            sessionStorage.setItem("isfromshouye", true);
            XywyService.query('/loadLqHisList', {
                params: {
                    myself: "1",
                    userId: sessionStorage.getItem('openId'),
                    tempCode: 'QXXNCZ'
                }
            }).then(function (response) {
                var dataSize = response.data.groupList.length;
                if (dataSize > 0) {
                    //获取性别
                    var questions = response.data.groupList[0].mainList[0].subList;
                    for (var i = 0; i < questions.length; i++) {
                        if (questions[i].quesCode == "SEX") {
                            localStorage.setItem('nczsex', questions[i].ansValue);
                            break;
                        }
                    }
                    localStorage.setItem('isXywy', true);
                    $state.go('yjkmain', {
                        'type': "ncz"
                    });
                } else {
                    $state.go('pingGu', {
                        type: "ncz"
                    });
                }
            }, Popup.alert);
        }
        $scope.tangniaobing = function () {
            // 用于判断交互页面是否从首页进入（用于交互对话框的位置定位的判断） 
            sessionStorage.setItem("isfromshouye", true);
            XywyService.query('/loadLqHisList', {
                params: {
                    myself: "1",
                    userId: sessionStorage.getItem('openId'),
                    tempCode: 'TNB'
                }
            }).then(function (response) {
                var dataSize = response.data.groupList.length;
                if (dataSize > 0) {
                    localStorage.setItem('isXywy', true);
                    //$state.go('pingGuMain', { type: "tnb" });
                    $state.go('yjkmain', {
                        'type': "tnb"
                    });
                } else {
                    $state.go('pingGu', {
                        type: "tnb"
                    });
                }
            }, Popup.alert);
        }

        $scope.yajiankang = function () {
            // 用于判断交互页面是否从首页进入（用于交互对话框的位置定位的判断） 
            sessionStorage.setItem("isfromshouye", true);
            XywyService.query('/loadLqHisList', {
                params: {
                    myself: "1",
                    userId: sessionStorage.getItem('openId'),
                    tempCode: 'YJK'
                }
            }).then(function (response) {
                var dataSize = response.data.groupList.length;
                if (dataSize > 0) {
                    localStorage.setItem('isXywy', true);
                    //$state.go('pingGuMain', { type: "yjk" });
                    $state.go('yjkmain', {
                        'type': "yjk"
                    });
                } else {
                    $state.go('pingGu', {
                        type: "yjk"
                    });
                }
            }, Popup.alert);
        }
        //心里健康
        $scope.xinlijiankang = function () {
            // 用于判断交互页面是否从首页进入（用于交互对话框的位置定位的判断） 
            sessionStorage.setItem("isfromshouye", true);
            XywyService.query('/loadLqHisList', {
                params: {
                    myself: "1",
                    userId: sessionStorage.getItem('openId'),
                    tempCode: 'XLZZ'
                }
            }).then(function (response) {
                var dataSize = response.data.groupList.length;
                if (dataSize > 0) {
                    localStorage.setItem('isXywy', true);
                    //$state.go('pingGuMain', { type: "xlzz" });
                    $state.go('yjkmain', {
                        'type': "xlzz"
                    });
                } else {
                    $state.go('pingGu', {
                        type: "xlzz"
                    });
                }
            }, Popup.alert);
        }

    })

    .controller('tzpgHistory', function (wxApi, $ionicViewSwitcher, $scope, $http, $state, $stateParams, $timeout, XywyService, Popup, Outlet, $ionicScrollDelegate, audioControl, $window, $rootScope, geoLocation) {
        //评估历史
        var c = 750; // 基准宽度,取的是iphone6
        var b = document.getElementsByTagName('html')[0];
        var f = b.getBoundingClientRect().width / c;
        b.style.fontSize = f + 'rem';

        //判断手机类型
        $scope.isIos = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
        }

        //返回上一页
        $scope.goBack = function () {
            $window.history.back();
        };
        $scope.back = function () {
            var openid = sessionStorage.getItem("openId");
            $ionicViewSwitcher.nextDirection('back');
            var token = sessionStorage.getItem("token");
            if (sessionStorage.getItem('hosorgCode')) {
                var yxzsurl = sessionStorage.getItem('yxzsurl');
                var hosorgCode = sessionStorage.getItem('hosorgCode');
                $state.go("yiyuanshouye", {
                    hosorgCode: hosorgCode,
                    openid: openid,
                    token: token,
                    yxzsurl: yxzsurl
                });
            } else {
                $state.go("shouye", {
                    openid: openid,
                    token: token
                });
            }
        };
        $scope.type = $stateParams.type;
        //跳转到详情页面
        $scope.pgjg_detail = function (datas, createTime, anslist) {
            var dataOjb = {
                datas: datas,
                date: createTime
            };
            //获取性别
            if ($stateParams.type == "ncz") {
                for (var i = 0; i < anslist.length; i++) {
                    if (anslist[i].quesCode == "SEX") {
                        localStorage.setItem('nczsex', anslist[i].ansValue);
                        break;
                    }
                }
            }

            localStorage.setItem('pgResult', angular.toJson(dataOjb));
            $state.go('tzpgDetail', {
                'type': $stateParams.type
            });
        }
        $scope.type = $stateParams.type;
        var lqTempCode = "";
        if ($scope.type == "tzpg") {
            lqTempCode = "LNRTZ";
            $scope.modelname = "中医体质评估";
        } else if ($scope.type == "ncz") {
            lqTempCode = "QXXNCZ";
            $scope.modelname = "脑卒中风险评估";

        } else if ($scope.type == "tnb") {
            lqTempCode = "TNB";
            $scope.modelname = "糖尿病风险评估";
        } else if ($scope.type == "yjk") {
            lqTempCode = "YJK";
            $scope.modelname = "亚健康风险评估";
        } else if ($scope.type == "xlzz") {
            lqTempCode = "XLZZ";
            $scope.modelname = "心理健康风险评估";
        }
        XywyService.query('/loadLqHisList', {
            params: {
                userId: sessionStorage.getItem('openId'),
                tempCode: lqTempCode
            }
        }).then(function (response) {
            var dataSize = response.data.groupList.length;
            if (dataSize > 0) {
                $scope.pgList = response.data.groupList
                for (var i = 0; i < $scope.pgList.length; i++) {
                    for (var j = 0; j < $scope.pgList[i].mainList.length; j++) {
                        var result = JSON.parse($scope.pgList[i].mainList[j].result);
                        $scope.pgList[i].mainList[j].result = result;
                    }
                }
            } else {
                $scope.nullTip = "暂无评估数据。";
            }
        }, Popup.alert);
        var qd = function (mainId) {
            XywyService.query('/deleteLqFormData', {
                params: {
                    mainId: mainId
                }
            }).then(function (response) {
                //document.getElementById(mainId).className='hide';
                $window.location.reload();
            }, Popup.alert);
        };
        //删除
        $scope.pgDelete = function (mainId) {
            Popup.confirm(['提示', '您确定要删除该条记录吗？'], function () {
                XywyService.query('/deleteLqFormData', {
                    params: {
                        mainId: mainId
                    }
                }).then(function (response) {
                    document.getElementById(mainId).className = 'hide';
                }, Popup.alert);
            }, function () { });
        }

    })
    .controller('pingGuMainC', function (wxApi, $ionicViewSwitcher, $scope, $http, $state, $stateParams, XywyService, Popup, $window, GoZzJbYp, $ionicLoading, $timeout) {
        XywyService.getRem(750);
        $scope.choseItems = []; //膳食条件
        window.onresize = function () {
            XywyService.getRem(750)
        };

        $scope.isFromShouye = sessionStorage.getItem("isfromshouye");
        $scope.type = $stateParams.type;
        var isXywy = localStorage.getItem('isXywy');
        $scope.isShowFxpgBtn = false;
        if ($scope.type != 'tzpg' && isXywy == 'false') {
            $scope.isShowFxpgBtn = true;
        }

        $scope.isIos = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
            $scope.localyyzt = "打开";
        }

        $scope.goBack = function () {
            if ($scope.type == "tzpg") {
                $state.go('zyysMain');
            } else {
                $state.go('fengxianpinggu');
            }
        };
        // 点击跳转风险评估
        $scope.goFxpg = function () {
            sessionStorage.setItem("isfromshouye", false);
            $state.go('fengxianpinggu');
        };
        // 跟据
        var lqTempCode = ""; //后台提交表单编码
        if ($scope.type == "tzpg") {
            lqTempCode = "LNRTZ";
            $scope.modelname = "中医体质评估"; //页面标题

        } else if ($scope.type == "ncz") {
            lqTempCode = "QXXNCZ";
            $scope.modelname = "脑卒中风险评估";
        } else if ($scope.type == "tnb") {
            lqTempCode = "TNB";
            $scope.modelname = "糖尿病风险评估";
        } else if ($scope.type == "yjk") {
            lqTempCode = "YJK";
            $scope.modelname = "亚健康风险评估";
        } else if ($scope.type == "xlzz") {
            lqTempCode = "XLZZ";
            $scope.modelname = "心理健康风险评估";
        }

        // 查询历史数据
        function getlishidata() {
            XywyService.query('/loadLqHisList', {
                params: {
                    myself: "1",
                    userId: sessionStorage.getItem('openId'),
                    tempCode: lqTempCode
                }
            }).then(function (response) {
                // $ionicLoading.show()
                var dataSize = response.data.groupList.length;
                if (dataSize > 0) {
                    var pgList = response.data.groupList;
                    $scope.pgResult = pgList[0].mainList[0];
                    $scope.datas = angular.fromJson($scope.pgResult.result);

                    if ($scope.type = 'tzpg') { //组织营养膳食条件
                        var resultList = angular.fromJson($scope.pgResult.result);
                        for (var i = 0; i < resultList.DATAS.length; i++) {
                            var tz = resultList.DATAS[i];
                            var item = {
                                //体质评估去掉字典，直接根据名称查询
                                title: tz.P_NAME,
                                code: tz.P_NAME
                            }
                            $scope.choseItems.push(item);
                        }
                    }

                } else {
                    // $state.go('pingGu', { type: $scope.type });
                    $scope.nullTip = "暂无评估数据。";
                }
                // $timeout(function(){
                //     $ionicLoading.hide();
                // },1000)
            }, Popup.alert);

        }


        // 跳转营养膳食
        $scope.goShanShi = function () {
            localStorage.setItem("tjData", angular.toJson($scope.choseItems));
            $state.go('ssys', { type: "ss" });
        };


        $scope.back = function () {
            var openid = sessionStorage.getItem("openId");
            $ionicViewSwitcher.nextDirection('back');
            var token = sessionStorage.getItem("token");
            if (sessionStorage.getItem('hosorgCode')) {
                var yxzsurl = sessionStorage.getItem('yxzsurl');
                var hosorgCode = sessionStorage.getItem('hosorgCode');
                $state.go("yiyuanshouye", {
                    hosorgCode: hosorgCode,
                    openid: openid,
                    token: token,
                    yxzsurl: yxzsurl
                });
            } else {
                $state.go("shouye", {
                    openid: openid,
                    token: token
                });
            }
        };


        //重新评估
        $scope.cxpg = function () {
            var mainId = "";
            if ($scope.pgResult) {
                mainId = $scope.pgResult.id
            }
            $state.go('pingGu', {
                type: $scope.type,
                mainId: mainId
            });
        }
        //跳转评估历史
        $scope.go_pgHistory = function () {
            $state.go('tzpgHistory', {
                type: $scope.type
            });
        };
        // 体质评估伸缩
        function tzpgSS(parent) {
            var groundPa = parent.parentElement.querySelectorAll("div");
            $('#pgjg').animate({
                height: "100%"
            }, 0);
            for (var i = 0; i < groundPa.length; i++) {
                var par_borther = groundPa[i];
                if (parent == par_borther) {
                    continue;
                }
                var par_ul = par_borther.querySelector('ul');
                var par_p = par_borther.querySelector('p');
                var par_span = par_borther.querySelector('span');
                if (par_ul) {
                    par_ul.className = "hide";
                    if (par_p != "hide") {
                        par_p.className = "hide";
                    }
                    if (par_span != "icon ion-ios-arrow-down activated") {
                        par_span.className = "icon ion-ios-arrow-down activated";
                    }

                }
            }

            var ul = parent.querySelector('ul');
            var p = parent.querySelector('p');
            var span = parent.querySelector('span');
            if (ul) {
                $('#pgjg').height("auto");
                if (ul.className == "hide") {
                    ul.className = "";
                    p.className = "tz-desc";
                    span.className = "icon ion-ios-arrow-up activated";
                } else {
                    ul.className = "hide";
                    p.className = "hide";
                    span.className = "icon ion-ios-arrow-down activated";
                }
            }


        }
        // 体质评估伸缩
        $scope.isshowall = function (index) {
            var parent = document.getElementById('tz' + index);
            if (parent) {
                tzpgSS(parent);
            }
        };
        // $scope.spanShowall = function(event) {
        //     var parent = event.target.parentElement.parentElement;
        //     tzpgSS(parent);
        //     return false;
        // };
        /**
         * 症状指南详情中药品查询
         */
        $scope.yaopinlist = function (name, leixing) {
            GoZzJbYp.yaopinlist(name, leixing);
        };
        $scope.init = function () {
            // $ionicLoading.show();
            getlishidata()
            // $ionicLoading.hide();
        }
        $scope.$on('$ionicView.enter', function () {
            // console.log("页面加载完成")
            $ionicLoading.show();
            $timeout(function () {
                $scope.init()
                $ionicLoading.hide();
            }, 2000)
        })
    })


    .controller('yjkMainC', function (wxApi, $ionicViewSwitcher, $scope, $http, $state, $stateParams, XywyService, Popup, $window,GoZzJbYp) {
        XywyService.getRem(750);
        window.onresize = function () {
            XywyService.getRem(750)
        };
        $scope.type = $stateParams.type; //表单类形
        var isXywy = localStorage.getItem('isXywy');
        $scope.isShowFxpgBtn = false;
        if ($scope.type != 'tzpg' && isXywy == 'false') {
            $scope.isShowFxpgBtn = true;
        }

        $scope.isIos = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
            $scope.localyyzt = "打开";
        }
        // 浮动菜单操作
        $scope.isMenuShow = false;
        // 隐藏菜单
        var hideMenu = function () {
            $("#m-body").fadeOut();
            $scope.isMenuShow = false;
        }
        // 显示菜单
        var showMenu = function () {
            $("#m-body").fadeIn();
            $scope.isMenuShow = true;
        }
        // 点击蓝色圆按钮显示写贴子、查看贴子菜单
        $scope.menuSwitch = function (event) {
            if ($scope.isMenuShow) {
                hideMenu();
            } else {
                showMenu()
            }
            event.preventDefault();
        };
        // 其他地方点击隐藏菜单
        $scope.hideMenuClick = function (event) {
            if ($scope.isMenuShow) {
                hideMenu();
            }
            event.preventDefault();
        };


        var jbmc = null; //查询疾病描述关键字

        $scope.goBack = function () {
            if ($scope.type == "tzpg") {
                $scope.back();
            } else {
                $state.go('fengxianpinggu');
            }
        };
        $scope.goFxpg = function () {
            $state.go('fengxianpinggu');
            sessionStorage.setItem("isfromshouye", false);
        };

        var lqTempCode = "";
        if ($scope.type == "tzpg") {
            lqTempCode = "LNRTZ";
            $scope.modelname = "中医体质评估";

        } else if ($scope.type == "ncz") {
            lqTempCode = "QXXNCZ";
            $scope.modelname = "脑卒中风险评估";
            jbmc = "脑血管意外";

        } else if ($scope.type == "tnb") {
            lqTempCode = "TNB";
            $scope.modelname = "糖尿病风险评估";
            jbmc = "糖尿病";
        } else if ($scope.type == "yjk") {
            lqTempCode = "YJK";
            $scope.modelname = "亚健康风险评估";
        } else if ($scope.type == "xlzz") {
            lqTempCode = "XLZZ";
            $scope.modelname = "心理健康风险评估";
        }


        $scope.isFromShouye = sessionStorage.getItem("isfromshouye");

        // 查询历史数据
        XywyService.query('/loadLqHisList', {
            params: {
                myself: "1",
                userId: sessionStorage.getItem('openId'),
                tempCode: lqTempCode
            }
        }).then(function (response) {
            var dataSize = response.data.groupList.length;
            if (dataSize > 0) {
                //脑卒中获取性别
                if ($scope.type == "ncz") {
                    //获取性别
                    var questions = response.data.groupList[0].mainList[0].subList;
                    for (var i = 0; i < questions.length; i++) {
                        if (questions[i].quesCode == "SEX") {
                            localStorage.setItem('nczsex', questions[i].ansValue);
                            $scope.nczsex = questions[i].ansValue;
                            break;
                        }
                    }
                }
                var pgList = response.data.groupList;
                $scope.pgResult = pgList[0].mainList[0];
                $scope.datas = angular.fromJson($scope.pgResult.result);
                //console.log($scope.datas);

                // for(var i=0;i< $scope.datas.length;i++){
                // 	//$scope.datas.
                // }
            } else {
                // $state.go('pingGu', { type: $scope.type });
                $scope.nullTip = "暂无评估数据。";
            }

        }, Popup.alert);


        // 查询疾病描述
        $scope.jbDes
        if (jbmc != null&&$scope.type!="tnb"&&$scope.type!="ncz") {
            XywyService.query('/android/getJbzs', {
                params: {
                    jbmc: jbmc
                }
            }).then(function (response) {
                $scope.jbDes = response.data.DATA;
            }, Popup.alert);
        }


        // 返回
        $scope.back = function () {
            var openid = sessionStorage.getItem("openId");
            $ionicViewSwitcher.nextDirection('back');
            var token = sessionStorage.getItem("token");
            if (sessionStorage.getItem('hosorgCode')) {
                var yxzsurl = sessionStorage.getItem('yxzsurl');
                var hosorgCode = sessionStorage.getItem('hosorgCode');
                $state.go("yiyuanshouye", {
                    hosorgCode: hosorgCode,
                    openid: openid,
                    token: token,
                    yxzsurl: yxzsurl
                });
            } else {
                $state.go("shouye", {
                    openid: openid,
                    token: token
                });
            }
        };


        //重新评估
        $scope.cxpg = function () {
            var mainId = "";
            if ($scope.pgResult) {
                mainId = $scope.pgResult.id
            }
            $state.go('pingGu', {
                type: $scope.type,
                mainId: mainId
            });
        }
        //跳转评估历史
        $scope.go_pgHistory = function () {
            $state.go('tzpgHistory', {
                type: $scope.type
            });
        };

        //列表伸缩
        // function shenSuo(parent) {
        //     var groundPa = parent.parentElement.querySelectorAll("div");
        //     for (var i = 0; i < groundPa.length; i++) {
        //         var par_borther = groundPa[i];
        //         if (parent == par_borther) {
        //             continue;
        //         }
        //         var par_ul = par_borther.querySelector('ul');
        //         var par_p = par_borther.querySelector('p');
        //         var par_span = par_borther.querySelector('span');
        //         if (par_ul) {
        //             par_ul.className = "hide";
        //             if (par_p) {
        //                 par_p.className = "hide";
        //             }
        //             if (par_span) {
        //                 par_span.className = "icon ion-ios-arrow-down activated";
        //             }

        //         }
        //     }

        //     var ul = parent.querySelector('ul');
        //     var p = parent.querySelector('p');
        //     var span = parent.querySelector('span');
        //     if (ul) {
        //         if (ul.className == "hide") {
        //             ul.className = "";
        //             p.className = "tz-desc";
        //             span.className = "icon ion-ios-arrow-up activated";
        //         }
        //         else {
        //             ul.className = "hide";
        //             p.className = "hide";
        //             span.className = "icon ion-ios-arrow-down activated";
        //         }
        //     }
        //     if (parent) {
        //         var pos = parent.offsetTop;
        //         $("#tzpg").animate({ scrollTop: pos }, 100);
        //     }
        // }

        // $scope.isshowall = function (event) {
        //     var parent = event.target.parentElement;
        //     shenSuo(parent);

        // };

        // $scope.innerClick = function (event) {
        //     var parent = event.target.parentElement.parentElement;
        //     shenSuo(parent);
        // };

        // 展开健康指导
        function shenSuo(tr, index) {
            var span = tr.querySelector('span');
            var table = tr.parentElement;
            var des = table.querySelector("#des" + index);
            var trBrothers = table.querySelectorAll(".title");
            for (var i = 0; i < trBrothers.length; i++) {
                trBrother = trBrothers[i];
                if (trBrother == tr) {
                    continue;
                }
                var ionDowns = trBrother.querySelector(".ion-ios-arrow-up");
                if (ionDowns) {
                    ionDowns.className = "icon ion-ios-arrow-down activated";
                    var trDes = trBrother.nextElementSibling;
                    if (trDes) {
                        var id = trDes.id;
                        if (id) {
                            if (trDes.className != "hide") {
                                trDes.className = "hide";
                            }
                        }
                    }
                }

            }
            if (des) {
                if (des.className == "hide") {
                    des.className = "";
                    span.className = "icon ion-ios-arrow-up activated";
                } else {
                    des.className = "hide";
                    span.className = "icon ion-ios-arrow-down activated";
                }
            }
        }

        // 点击图标展开健康指导
        $scope.spanClick = function (event, index) {
            var span = event.target;
            var tr = span.parentElement.parentElement;
            shenSuo(tr, index);
        };
        // 点击单元格展开健康指导
        $scope.trClick = function (event, index) {
            var tr = event.target.parentElement;
            shenSuo(tr, index);
        };




        $scope.nczcolor = function (deifen, fenzhi) {
            if (deifen == fenzhi && fenzhi != "") {
                return {
                    "background-color": "#FFA015",
                    "color": "white"
                };
            } else {
                return;
            }

        };

        /**
         * 脑卒中参考值（男）
         */
        $scope.nczckznan = [{
            fenzhi1: "1",
            value1: "3%",
            fenzhi2: "11",
            value2: "11%",
            fenzhi3: "21",
            value3: "42%"
        }, {
            fenzhi1: "2",
            value1: "3%",
            fenzhi2: "12",
            value2: "13%",
            fenzhi3: "22",
            value3: "47%"
        }, {
            fenzhi1: "3",
            value1: "4%",
            fenzhi2: "13",
            value2: "15%",
            fenzhi3: "23",
            value3: "52%"
        }, {
            fenzhi1: "4",
            value1: "4%",
            fenzhi2: "14",
            value2: "17%",
            fenzhi3: "24",
            value3: "57%"
        }, {
            fenzhi1: "5",
            value1: "5%",
            fenzhi2: "15",
            value2: "20%",
            fenzhi3: "25",
            value3: "63%"
        }, {
            fenzhi1: "6",
            value1: "5%",
            fenzhi2: "16",
            value2: "22%",
            fenzhi3: "26",
            value3: "68%"
        }, {
            fenzhi1: "7",
            value1: "6%",
            fenzhi2: "17",
            value2: "26%",
            fenzhi3: "27",
            value3: "74%"
        }, {
            fenzhi1: "8",
            value1: "7%",
            fenzhi2: "18",
            value2: "29%",
            fenzhi3: "28",
            value3: "79%"
        }, {
            fenzhi1: "9",
            value1: "8%",
            fenzhi2: "19",
            value2: "33%",
            fenzhi3: "29",
            value3: "84%"
        }, {
            fenzhi1: "10",
            value1: "10%",
            fenzhi2: "20",
            value2: "37%",
            fenzhi3: "30",
            value3: "88%"
        }];
        /**
         * 脑卒中参考值（女）
         */
        $scope.nczckznv = [{
            fenzhi1: "1",
            value1: "1%",
            fenzhi2: "11",
            value2: "8%",
            fenzhi3: "21",
            value3: "43%"
        }, {
            fenzhi1: "2",
            value1: "1%",
            fenzhi2: "12",
            value2: "9%",
            fenzhi3: "22",
            value3: "50%"
        }, {
            fenzhi1: "3",
            value1: "2%",
            fenzhi2: "13",
            value2: "11%",
            fenzhi3: "23",
            value3: "57%"
        }, {
            fenzhi1: "4",
            value1: "2%",
            fenzhi2: "14",
            value2: "13%",
            fenzhi3: "24",
            value3: "64%"
        }, {
            fenzhi1: "5",
            value1: "2%",
            fenzhi2: "15",
            value2: "16%",
            fenzhi3: "25",
            value3: "71%"
        }, {
            fenzhi1: "6",
            value1: "3%",
            fenzhi2: "16",
            value2: "19%",
            fenzhi3: "26",
            value3: "78%"
        }, {
            fenzhi1: "7",
            value1: "4%",
            fenzhi2: "17",
            value2: "23%",
            fenzhi3: "27",
            value3: "84%"
        }, {
            fenzhi1: "8",
            value1: "4%",
            fenzhi2: "18",
            value2: "37%",
            fenzhi3: "",
            value3: ""
        }, {
            fenzhi1: "9",
            value1: "5%",
            fenzhi2: "19",
            value2: "32%",
            fenzhi3: "",
            value3: ""
        }, {
            fenzhi1: "10",
            value1: "6%",
            fenzhi2: "20",
            value2: "37%",
            fenzhi3: "",
            value3: ""
        }];

        $scope.goDetail=function (name) {
            GoZzJbYp.yaopinlist(name, "疾病");
        };
    })
    //常见症状详情
    .controller('tzpgOneDetail', ['$stateParams', 'Popup', 'XywyService', '$scope', '$window', '$state', 'GoZzJbYp', function ($stateParams, Popup, XywyService, $scope, $window, $state, GoZzJbYp) {
        $scope.isIos = false;
        $scope.inputFocus = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
            $scope.localyyzt = "打开";
        }

        var self = this;
        var para = {};
        para.tiZhiMingCheng = $stateParams.name;
        XywyService.save('/getZhongYiTiZhiDetail', para).then(function (data) {
            var data = data.data.data;
            if (data) {
                self.haveResult = true;

                self.items = [];
                var push = Array.prototype.push.bind(self.items);
                self.title = data.P_NAME;
                self.viewTitle = data.P_NAME;

                push({
                    title: '描述',
                    content: data.DESCR || '暂无',
                    show: true
                });
                push({
                    title: '总体特征',
                    content: data.FEATURE || '暂无',
                    show: true
                });

                push({
                    title: '形体特征',
                    content: data.XTTZ,
                    show: true
                });
                push({
                    title: '常见表现',
                    content: data.CJBX || '暂无',
                    show: true
                });
                push({
                    title: '心理特征',
                    content: data.XLTZ || '暂无',
                    show: true
                });
                push({
                    title: '发病倾向',
                    content: data.FBQX || '暂无',
                    show: true
                });
                push({
                    title: '对外界环境适应能力',
                    content: data.DYJHJSYNL || '暂无',
                    show: true
                });
                push({
                    title: '养生法则',
                    content: data.YSFZ || '暂无',
                    show: true
                });
                push({
                    title: '饮食调摄',
                    content: data.YSTS || '暂无',
                    show: true
                });
                push({
                    title: '精神调摄',
                    content: data.JSTS || '暂无',
                    show: true
                });
                push({
                    title: '起居调摄',
                    content: data.QJTS || '暂无',
                    show: true
                });
                push({
                    title: '运动锻炼',
                    content: data.YDDL || '暂无',
                    show: true
                });
                push({
                    title: '针灸推拿保健',
                    content: data.ZJTABJ || '暂无',
                    show: true
                });
                push({
                    title: '药物保健',
                    content: data.YWBJ || '暂无',
                    show: true
                });
            } else {
                self.haveResult = false;
            }


            push = null;
        }, Popup.alert);
        self.backshouye = function () {
            var openid = sessionStorage.getItem("openId");
            var token = sessionStorage.getItem("token");
            if (sessionStorage.getItem('hosorgCode')) {
                var yxzsurl = sessionStorage.getItem('yxzsurl');
                var hosorgCode = sessionStorage.getItem('hosorgCode');
                $state.go("yiyuanshouye", {
                    hosorgCode: hosorgCode,
                    openid: openid,
                    token: token,
                    yxzsurl: yxzsurl
                });
            } else {
                $state.go("shouye", {
                    openid: openid,
                    token: token
                });
            }

        }

        /**
         * 症状指南详情中药品查询
         */
        $scope.yaopinlist = function (name, leixing) {
            GoZzJbYp.yaopinlist(name, leixing);
        }

        $scope.audioCtrlShow = 1;
        $scope.switchAudioBar = function (e) {
            if ($scope.audioCtrlShow == 1) {
                $scope.audioCtrlShow = 0;
            } else {
                $scope.audioCtrlShow = 1;
            }
        };
        $scope.$on('closeAudioBar', function () {
            $scope.switchAudioBar();
        });
    }])