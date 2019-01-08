angular.module('starter.ZhongYiYangShengControllers', ['ionic'])

    .controller('shanshidetailC', function (wxApi, $ionicViewSwitcher, $scope, $http, $state, $stateParams, $timeout, XywyService, Popup, Outlet, $ionicScrollDelegate, audioControl, $window, $rootScope, geoLocation, $ionicModal, $ionicLoading, GoZzJbYp) {
        XywyService.getRem(750);
        $scope.imgBaseUrl = myConfig.imgBaseUrl;
        //判断手机类型
        $scope.isIos = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
        }
        //返回上一页
        $scope.goBack = function () {
            $window.history.back();
        };
        //首页
        $scope.back = function () {
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
        };
        $scope.pid = $stateParams.pid;
        // $scope.pid = "62b06e9b-ca87-43d5-90e1-e6d245dc7b44";
        //显示筛选列表
        $scope.detailList;
        $scope.tuPianAry;
        $scope.mainImage;
        $scope.loadData = function (pid) {
            XywyService.query("/zyys/getMeiRiYiShanDetail.json", {
                params: {
                    pid: pid
                }
            })
                .then(function (response) {
                    $scope.detailList = response.data.data;
                    $scope.tuPianAry = $scope.detailList.tupianMingchengNew.split(",");
                    if ($scope.tuPianAry.length > 0) {
                        $scope.mainImage = $scope.tuPianAry[0];
                    }
                }, Popup.alert);

        }
        $scope.loadData($scope.pid);
        // $scope.tuPianAry = ["img/yjk.jpg","img/yjk2.jpg","img/yjk3.jpg","img/yjk4.jpg","img/yjk5.jpg"];
        $scope.yaopinlist = function (name, leixing) {
            GoZzJbYp.yaopinlist(name, leixing);
        };

        var myPopup, timeout_upd,interval_upd;
        $scope.detailTip = function (title, content) {
            myPopup = $ionicPopup.show({
                template: "<div class='tip'><h3>" + title + "<i class='icon iconfont icon-guanbi' ng-click='closeTip()'></i></h3>"
                    + "<p class='body'>草堂上医由新奥集团直属企业新博卓畅技术(北京)有限公司精心打造，依托公司雄厚的研发实力、多年积累的医疗大数据及行业顶尖的医疗专家团队，致力于向所有的家庭提供智能导诊、问诊、健康评估、健康教育、中医调理、家庭健康管理等服务，是您健康管理的好助手。</p>"
                    + "<div class='show-time'>{{showTime}} 秒后关闭</div></div>",
                cssClass: 'my-custom-popup',
                scope: $scope,
                buttons: []
            });

            var time = 10000;
            $scope.showTime = 10;
            interval_upd=$interval(function () {
                if (time>0) {
                    time -= 1000;
                    $scope.showTime = time / 1000;
                } else {
                    $interval.cancel(interval_upd);
                }

            }, 1000);

            timeout_upd=$timeout(function() {
                myPopup.close(); // 10秒后关闭弹窗
             }, 10000);
        };

        $scope.closeTip = function () {
            $timeout.cancel(timeout_upd);
            $interval.cancel(interval_upd);
            myPopup.close();
        };

      
        $scope.$on('$destroy', function () {
            $timeout.cancel(timeout_upd);
            $interval.cancel(interval_upd);
            myPopup.close();
        });
    })
    // 穴位养生
    .controller('xwysC', function (wxApi, $ionicViewSwitcher, $scope, $http, $state, $stateParams, $timeout, XywyService, Popup, Outlet, $ionicScrollDelegate, audioControl, $window, $rootScope, geoLocation, $ionicModal, $ionicLoading, GoZzJbYp) {
        $scope.imgBaseUrl = myConfig.imgBaseUrl;
        //判断手机类型
        $scope.isIos = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
        }
        //返回上一页
        $scope.goBack = function () {
            $window.history.back();
        };
        //首页
        $scope.back = function () {
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
        };



    })
    .controller('xueweidetailC', function (wxApi, $ionicViewSwitcher, $scope, $http, $state, $stateParams, $timeout, XywyService, Popup, $window, $ionicLoading, detailList, GoZzJbYp) {
        XywyService.getRem(750);
        $scope.imgBaseUrl = myConfig.imgBaseUrl;
        //判断手机类型
        $scope.isIos = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
        }
        //返回上一页
        $scope.goBack = function () {
            $window.history.back();
        };
        //首页
        $scope.back = function () {
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
        };
        $scope.pid = $stateParams.pid;

        //显示筛选列表
        $scope.detailList;
        // $scope.loadData = function (pid) {
        //     $ionicLoading.show({
        //         content: 'Loading',
        //         animation: 'fade-in',
        //         showBackdrop: true,
        //         maxWidth: 200,
        //         showDelay: 0
        //     });
        //     XywyService.query("/zyys/getMeiRiYiXueDetail.json", pid)
        //         .then(function (response) {
        //             $scope.detailList = response.data.data;

        //             $ionicLoading.hide();
        //             var div = document.getElementById('zyxw-xq');
        //             div.scrollTop = 10;

        //         }, Popup.alert);

        // }
        //$scope.loadData($scope.pid);
        $scope.dataList = [];
        if (detailList) {
            $scope.dataList = detailList.data;
            for (var i = 0; i < $scope.dataList.xwxxList.length; i++) {
                if ($scope.dataList.xwxxList[i].tupianMingchengNew) {
                    $scope.dataList.xwxxList[i]['tuPianAry'] = $scope.dataList.xwxxList[i].tupianMingchengNew.split(",");
                }

            }
        }
        $scope.yaopinlist = function (name, leixing) {
            GoZzJbYp.yaopinlist(name, leixing);
        };
    })
    .controller('xueweiOneDetailC', function (wxApi, $ionicViewSwitcher, $scope, $http, $state, $stateParams, $timeout, XywyService, Popup, $window, $ionicLoading) {
        $scope.isIos = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
            $scope.localyyzt = "打开";
        }
        var self = this;
        if ($stateParams.name) {
            self.viewTitle = $stateParams.name;
        } else {
            self.viewTitle = '穴位详情';
        }
        // 查询穴位信息
        $scope.name = $stateParams.name;
        var para = {};
        para.xueWeiMingCheng = $scope.name;
        XywyService.save("/zyys/getXueWeiDetail.json", para)
            .then(function (data) {
                var imgBaseUrl = myConfig.imgBaseUrl;
                data = data.data;
                self.haveResult = true;
                self.items = [];
                var push = Array.prototype.push.bind(self.items);
                self.title = data.mingCheng;
                self.fbsj = "发布时间：" + data.createDate;
                self.nrzc = "内容支持：" + data.contentSupport;
                function img(url) {
                    return "<img src='" + imgBaseUrl + url + "' style='width:100%'>"
                }
                if (data.shiYingZheng) {
                    push({ title: '适应症', content: data.shiYingZheng });
                }
                if (data.tupianMingchengNew) {
                    var imgArr = data.tupianMingchengNew.split(",").map(img);
                    data['tuPianAry'] = imgArr.join('');
                }
                push({ title: '穴位', content: data.mingCheng });

                if (data.gongxiaoZhuzhiDisplay) {
                    push({ title: '主治功效', content: data.gongxiaoZhuzhiDisplay, show: true });
                }
                if(data.quXue||data.tupianMingchengNew)
                {
                    push({ title: '取穴', content: data.quXue ? data.quXue : '' + data['tuPianAry'] });
                }
              
                push({ title: '按揉方法', content: data.anrouFangfa });

                push = null;
            }, Popup.alert);

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
        $scope.yaopinlist = function (name, leixing) {
            GoZzJbYp.yaopinlist(name, leixing);
        };
    })
    .controller('zyysC', function (wxApi, $ionicViewSwitcher, $scope, $http, $state, $stateParams, XywyService, Popup, $window, $ionicLoading, $ionicScrollDelegate) {
        $scope.imgBaseUrl = myConfig.imgBaseUrl;
        XywyService.getRem(750);
        //判断手机类型
        $scope.isIos = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
        }
        //返回上一页
        $scope.goBack = function () {
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
        //首页
        $scope.back = function () {
            var openid = sessionStorage.getItem("openId");
            $ionicViewSwitcher.nextDirection('back');
            var token = sessionStorage.getItem("token");
            $state.go("shouye", {
                openid: openid,
                token: token
            });
        };
        //高级搜索
        $scope.goGaoJiShouSuo = function () {
            var tjData = {
                showFood: $scope.showFood
            };
            localStorage.setItem("tjData", angular.toJson(tjData));
            $state.go("xuanTiaoJian");
        };

        $scope.showFood = true;
        $scope.tabList = [{
            title: "营养膳食",
            value: "0"
        }, {
            title: "保健穴位",
            value: "1"
        }];
        //每日一膳tab页
        $scope.shaixuanList = [{
            title: "中医体质",
            value: "2"
        }, {
            title: "主治功效",
            value: "1"
        }, {
            title: "适应症",
            value: "3"
        }];
        //每日一穴tab页
        $scope.shaixuanPointList = [{
            title: "主治功效",
            value: "1"
        }, {
            title: "适应症",
            value: "2"
        }];

        //
        $scope.headtabType = {
            "1": "zhongYiGongXiao",
            "2": "shiYingTiZhi",
            "3": "shiYingZheng"
        }

        $scope.xwheadtabType = {
            "1": "gongXiaoZhuZhi",
            "2": "shiYingZheng"
        }

        //每日一膳变量定义
        $scope.mrysCurrentTab = 2;
        $scope.mrysZdList = {}; //存所有分类的字典列表，给ShanShilist赋值
        $scope.mrysShowZdList; //页面上显示的字典List

        $scope.ShanShilist; //页面上显示的数据
        $scope.ShanShiFlList = {}; //存所有分类的膳食列表，给ShanShilist赋值
        $scope.mrysCurrentZd;
        $scope.CurrentZdPageNum = {
            zhongYiGongXiao: 1,
            shiYingTiZhi: 1,
            shiYingZheng: 1
        };
        $scope.CurrentListPageNum = {
            zhongYiGongXiao: 1,
            shiYingTiZhi: 1,
            shiYingZheng: 1
        };
        $scope.currentZdCode;
        $scope.pageListCount = {};
        $scope.pageZdCount = {};
        $scope.curChose = {
            1: '',
            2: '',
            3: ''
        };
        $scope.footTab = '0';

        //每日一穴变量定义
        $scope.xwCurrentTab = 1;
        $scope.xwZdList = {}; //存所有分类的字典列表，给ShanShilist赋值
        $scope.xwysShowZdList; //页面上显示的字典List

        $scope.xwShanShilist; //页面上显示的数据
        $scope.xwShanShiFlList = {}; //存所有分类的穴位列表，给ShanShilist赋值
        $scope.xwCurrentZd;
        $scope.xwCurrentZdPageNum = {
            gongXiaoZhuZhi: 1,
            shiYingZheng: 1,
        };
        $scope.xwCurrentListPageNum = {
            gongXiaoZhuZhi: 1,
            shiYingZheng: 1,
        };
        $scope.xwcurrentZdCode;
        $scope.xwpageListCount = {};
        $scope.xwpageZdCount = {};
        $scope.xwcurChose = {
            1: '',
            2: ''
        };


        $scope.switchTab = function (value) {
            $scope.task_hasSsMoreItem = true;
            $scope.doLoadMore = true;
            $scope.footTab = value;
            if (value == '0') {
                $scope.showFood = true;
            } else {
                $scope.showFood = false;
                $scope.queryTabList();
            }

        }

        //左面列表的点击事件
        $scope.queryContentList = function (code) {
            $scope.task_hasSsMoreItem = true;
            $scope.doLoadMore = true;
            $ionicScrollDelegate.$getByHandle('right').scrollTop([true]);
            if ($scope.showFood) {
                if (!code) {
                    $scope.curChose[$scope.mrysCurrentTab] = '';
                    $scope.queryTabList();
                    return;
                }
                $scope.curChose[$scope.mrysCurrentTab] = code;
                var type = $scope.headtabType[$scope.mrysCurrentTab];
                var params = {};
                params.pageNum = 1;
                params[type] = [code];
                queryLsShanShiList("equals", params);
            } else {
                if (!code) {
                    $scope.xwcurChose[$scope.xwCurrentTab] = '';
                    $scope.queryTabList();
                    return;
                }
                $scope.xwcurChose[$scope.xwCurrentTab] = code;
                var type = $scope.xwheadtabType[$scope.xwCurrentTab];
                var params = {};
                params.pageNum = 1;
                params[type] = [code];
                queryLsShanShiList("equals", params);
            }

        }
        //header列表头的点击事件
        $scope.switchTj = function (value) {
            $scope.task_hasSsMoreItem = true;
            $scope.doLoadMore = true;
            if ($scope.showFood) {
                var type = $scope.headtabType[value];
                if ($scope.mrysZdList[type]) {
                    $scope.mrysShowZdList = $scope.mrysZdList[type];
                    $scope.ShanShilist = $scope.ShanShiFlList[type];
                } else {
                    $scope.queryTabList();
                }
            } else {
                var type = $scope.xwheadtabType[value];
                if ($scope.xwZdList[type]) {
                    $scope.xwShowZdList = $scope.xwZdList[type];
                    $scope.xwShanShilist = $scope.xwShanShiFlList[type];
                } else {
                    $scope.queryTabList();
                }
            }
        }


        //首次进入页面查询列表和膳食列表
        $scope.queryTabList = function () {
            $scope.doLoadMore = true;
            if ($scope.showFood) {
                var pageNum = 1;
                var para = {
                    pageNum: pageNum,
                    typeCode: $scope.mrysCurrentTab
                }
                queryZdList("equals", para);
            } else {
                var pageNum = 1;
                var para = {
                    pageNum: pageNum,
                    typeCode: $scope.xwCurrentTab
                }
                queryZdList("equals", para);
            }

        }
        $scope.queryTabList();

        //左侧列表的下拉事件
        $scope.loadMicMore = function () {
            var obj = $("#left-lb");
            var nScrollHight = obj[0].scrollTop + obj.height() + 20;
            var nDivHight = obj[0].scrollHeight; //总高度
            if (nScrollHight >= nDivHight) {
                if ($scope.showFood) {
                    var type = $scope.headtabType[$scope.mrysCurrentTab];
                    $scope.CurrentZdPageNum[type] += 1;
                    var pageNum = $scope.CurrentZdPageNum[type];
                    var Count = $scope.pageZdCount[type];
                    if (pageNum <= Count) {
                        $scope.doLoadMore = false;
                        //隐藏无数据提示
                        $scope.task_hasMoreItem = true;
                        var para = {
                            pageNum: pageNum,
                            typeCode: $scope.mrysCurrentTab
                        }
                        /*
                        if ($scope.curChose[type]) {
                            para[type] = new Array($scope.curChose[$scope.mrysCurrentTab]);
                        }*/


                        queryZdList("push", para, function () {
                            //禁止上拉滑动
                            $scope.$broadcast('scroll.infiniteScrollComplete');
                        });
                    } else {
                        //显现提示
                        $scope.task_hasMoreItem = false;
                        $scope.reusltNullTip = "已加载全部！";

                        //隐藏上拉加载
                        $scope.isShow = true;
                        //禁止上拉滑动
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    }
                } else {
                    var type = $scope.xwheadtabType[$scope.xwCurrentTab];
                    var Count = $scope.xwpageZdCount[type];
                    $scope.xwCurrentZdPageNum[type] += 1;
                    var pageNum = $scope.xwCurrentZdPageNum[type];
                    if (pageNum <= Count) {
                        $scope.doLoadMore = false;
                        //隐藏无数据提示
                        $scope.task_hasMoreItem = true;
                        var para = {
                            pageNum: pageNum,
                            typeCode: $scope.xwCurrentTab
                        }
                        /*
                        if ($scope.curChose[type]) {
                            para[type] = new Array($scope.xwcurChose[$scope.xwCurrentTab]);
                        }*/

                        queryZdList("push", para, function () {
                            //禁止上拉滑动
                            $scope.$broadcast('scroll.infiniteScrollComplete');
                        });
                    } else {
                        //显现提示
                        $scope.task_hasMoreItem = false;
                        $scope.reusltNullTip = "已加载全部！";

                        //隐藏上拉加载
                        $scope.isShow = true;
                        //禁止上拉滑动
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    }
                }

            }
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }
        //膳食的列表下拉事件
        $scope.loadShanShiMore = function () {
            $scope.doLoadMore = false;
            var obj = $("#right-lb");
            var nScrollHight = obj[0].scrollTop + obj.height() + 20;
            var nDivHight = obj[0].scrollHeight;

            if (nScrollHight >= nDivHight) {
                if ($scope.showFood) {
                    var type = $scope.headtabType[$scope.mrysCurrentTab];
                    $scope.CurrentListPageNum[type] += 1;
                    var Count = $scope.pageListCount[type];
                    var pageNum = $scope.CurrentListPageNum[type];
                    if (pageNum <= Count) {
                        //隐藏无数据提示
                        $scope.task_hasSsMoreItem = true;
                        var para = {
                            pageNum: pageNum,
                        }
                        if ($scope.curChose[$scope.mrysCurrentTab]) {
                            para[type] = new Array($scope.curChose[$scope.mrysCurrentTab]);
                        }
                        queryLsShanShiList("push", para);
                    } else {
                        //显现提示
                        $scope.task_hasSsMoreItem = false;
                        $scope.reusltSsNullTip = "已加载全部";

                        //隐藏上拉加载
                        $scope.isSsShow = false;
                        //禁止上拉滑动
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    }
                } else {
                    var type = $scope.xwheadtabType[$scope.xwCurrentTab];
                    $scope.xwCurrentListPageNum[type] += 1;
                    var Count = $scope.xwpageListCount[type];
                    var pageNum = $scope.xwCurrentListPageNum[type];
                    if (pageNum <= Count) {
                        //隐藏无数据提示
                        $scope.task_hasSsMoreItem = true;
                        var para = {
                            pageNum: pageNum,
                        }
                        if ($scope.xwcurChose[$scope.xwCurrentTab]) {
                            para[type] = new Array($scope.xwcurChose[$scope.xwCurrentTab]);
                        }
                        queryLsShanShiList("push", para);
                    } else {
                        //显现提示
                        $scope.task_hasSsMoreItem = false;
                        $scope.reusltSsNullTip = "已加载全部";

                        //隐藏上拉加载
                        $scope.isSsShow = false;
                        //禁止上拉滑动
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    }
                }
            }

            $scope.$broadcast('scroll.infiniteScrollComplete');
        }

        //查询左侧列表
        function queryZdList(style, params) {
            if ($scope.showFood) {
                XywyService.save("/zyys/getMeiRiYiShanZidian", params)
                    .then(function (response) {
                        var ary = getZd(response.data.data);
                        //$scope.curChose[$scope.mrysCurrentTab] = getCode(response.data.data);
                        var type = $scope.headtabType[$scope.mrysCurrentTab];
                        if (style == "equals") {
                            $scope.mrysZdList[type] = ary;
                            $scope.pageZdCount[type] = response.data.pageCount;
                            $scope.CurrentZdPageNum[type] = 1;
                            $scope.mrysShowZdList = ary;
                        } else if (style == "push") {
                            $scope.mrysZdList[type] = $scope.mrysZdList[type].concat(ary);
                            $scope.mrysShowZdList = $scope.mrysShowZdList.concat(ary);
                            $scope.doLoadMore = true;
                            $scope.$broadcast('scroll.infiniteScrollComplete');
                            return;
                        }

                        //查询体质相关的膳食
                        var params = {};
                        var type = $scope.headtabType[$scope.mrysCurrentTab];
                        params.pageNum = 1;
                        if ($scope.curChose[$scope.mrysCurrentTab]) {
                            params[type] = $scope.curChose[$scope.mrysCurrentTab];
                        }
                        queryLsShanShiList("equals", params);

                    }, Popup.alert);
            } else {
                XywyService.save("/zyys/getMeiRiYiXueZidian.json", params)
                    .then(function (response) {
                        var ary = getZd(response.data.data);
                        var type = $scope.xwheadtabType[$scope.xwCurrentTab];
                        if (style == "equals") {
                            $scope.xwZdList[type] = ary;
                            $scope.xwpageZdCount[type] = response.data.pageCount;
                            $scope.xwCurrentZdPageNum[type] = 1;
                            $scope.xwShowZdList = ary;
                        } else if (style == "push") {
                            $scope.xwZdList[type] = $scope.xwZdList[type].concat(ary);
                            $scope.xwShowZdList = $scope.xwShowZdList.concat(ary);
                            $scope.doLoadMore = true;
                            $scope.$broadcast('scroll.infiniteScrollComplete');
                            return;
                        }

                        //查询体质相关的膳食
                        var params = {};
                        var type = $scope.xwheadtabType[$scope.xwCurrentTab];
                        params.pageNum = 1;
                        if ($scope.xwcurChose[$scope.xwCurrentTab]) {
                            params[type] = new Array($scope.xwcurChose[$scope.xwCurrentTab]);
                        }
                        queryLsShanShiList("equals", params);

                    }, Popup.alert);
            }
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }


        //膳食列表查询,根据style判断是push还是equals
        function queryLsShanShiList(style, params) {
            if ($scope.showFood) {
                XywyService.save("/zyys/getMeiRiYiShanList", params)
                    .then(function (response) {
                        var type = $scope.headtabType[$scope.mrysCurrentTab];
                        if (style == "equals") {
                            $scope.ShanShiFlList[type] = response.data.data;
                            $scope.pageListCount[type] = response.data.pageCount;
                            $scope.CurrentListPageNum[type] = 1;
                            $scope.ShanShilist = response.data.data;
                        } else if (style == "push") {
                            $scope.ShanShilist = $scope.ShanShilist.concat(response.data.data);
                            $scope.ShanShiFlList[type] = $scope.ShanShiFlList[type].concat(response.data.data);
                            $scope.doLoadMore = true;
                            $scope.$broadcast('scroll.infiniteScrollComplete');
                        }

                    }, Popup.alert);
            } else {
                XywyService.save("/zyys/getMeiRiYiXueList.json", params)
                    .then(function (response) {
                        var type = $scope.xwheadtabType[$scope.xwCurrentTab];
                        if (style == "equals") {
                            $scope.xwShanShiFlList[type] = response.data.data;
                            $scope.xwpageListCount[type] = response.data.pageCount;
                            $scope.xwCurrentListPageNum[type] = 1;
                            $scope.xwShanShilist = response.data.data;
                        } else if (style == "push") {
                            $scope.xwShanShilist = $scope.xwShanShilist.concat(response.data.data);
                            $scope.xwShanShiFlList[type] = $scope.xwShanShiFlList[type].concat(response.data.data);
                            $scope.doLoadMore = true;
                            $scope.$broadcast('scroll.infiniteScrollComplete');
                        }

                    }, Popup.alert);
            }
        }

        function getZd(data) {
            var array = new Array();
            for (var i = 0; i < data.length; i++) {
                var para = {};
                if (data[i].dicItemName && data[i].dicItemCode) {
                    para = {
                        title: data[i].dicItemName,
                        code: data[i].dicItemCode
                    }
                    array.push(para);
                }
            }
            return array;
        };

        function getCode(data) {
            var array = new Array();
            for (var i = 0; i < data.length; i++) {
                if (data[i].dicItemCode) {
                    array.push(data[i].dicItemCode);
                }
            }
            return array;
        }
        //跳转详情页面
        $scope.goDetail = function (pid) {
            if ($scope.showFood) {
                $state.go("shanshidetail", {
                    pid: pid
                });
            } else {
                $state.go("xueweidetail", {
                    pid: pid
                });
            }

        };
    })
    .controller('xuanTiaoJianC', function (wxApi, $ionicViewSwitcher, $scope, $http, $state, $stateParams, XywyService, Popup, $window, $ionicLoading, $ionicScrollDelegate) {
        $scope.isIos = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
        }
        //返回上一页
        $scope.goBack = function () {
            $state.go('zyys');
        };

        $scope.data = {
            keyword: ''
        };
        $scope.showFood = true;
        $scope.mrysZdList = {};
        $scope.pageZdCount = {};
        $scope.CurrentZdPageNum = {};
        $scope.choseItems = [];
        var tjData = angular.fromJson(localStorage.getItem("tjData", tjData));
        if (tjData) {
            $scope.showFood = tjData.showFood;
            if (tjData.choseItems) {
                $scope.choseItems = tjData.choseItems;
                document.getElementById('div-selected').scrollTop = document.getElementById('div-selected').scrollHeight;
            }

        }

        //字典查询
        $scope.zdParams = {
            pageNum: 1,
            typeCode: "2",
            inputText: $scope.data.keyword,
            pinYinSzm: ''
        };


        // $scope.tabList = [{
        //     title: "营养膳食",
        //     value: "0"
        // }, {
        //     title: "保健穴位",
        //     value: "1"
        // }];
        //每日一膳tab页
        $scope.shaixuanList = [];
        //每日一穴tab页
        if ($scope.showFood) {
            $scope.shaixuanList = [{
                title: "中医体质",
                value: "2"
            }, {
                title: "主治功效",
                value: "1"
            }, {
                title: "适应症",
                value: "3"
            }];
        } else {
            $scope.shaixuanList = [{
                title: "主治功效",
                value: "1"
            }, {
                title: "适应症",
                value: "2"
            }];
            $scope.zdParams.typeCode = "1";
        }
        queryZdList("equals", $scope.zdParams);
        // 重新组织后台返回的数据
        function getZd(data) {
            var array = new Array();
            for (var i = 0; i < data.length; i++) {
                var obj = {
                    dicItemName: data[i].dicItemName,
                    dicItemCode: data[i].dicItemCode,
                    checked: false
                }
                if ($scope.choseItems) {
                    for (var j = 0; j < $scope.choseItems.length; j++) {
                        if ($scope.choseItems[j].type != $scope.zdParams.typeCode) {
                            continue;
                        }
                        if ($scope.choseItems[j].item.dicItemCode == obj.dicItemCode) {
                            obj.checked = true;
                        }
                    }
                }
                array.push(obj);
            }
            return array;
        };


        //切分类点击事件 
        $scope.loadTj = function (value) {
            if (value) {
                $scope.zdParams.typeCode = value;
            }
            queryZdList("equals", $scope.zdParams);
        };

        //字母查询
        $scope.$on('zimu', function (event, zimu) {
            //清空查询条件 恢复默认值
            $scope.ishsowzimu = true;
            $scope.zdParams.pinYinSzm = zimu.zimu;
            queryZdList("equals", $scope.zdParams);
            $timeout(function () {
                $scope.ishsowzimu = false;
            }, 2000);
        });

        $scope.chooseTj = function (item) {
            var type = $scope.zdParams.typeCode;
            if (item.checked == true) {
                var chose = {
                    type: type,
                    item: item
                }
                $scope.choseItems.push(chose);
            } else {
                for (var i = 0; i < $scope.choseItems.length; i++) {
                    if ($scope.choseItems[i].type == type) {
                        if ($scope.choseItems[i].item.dicItemCode == item.dicItemCode) {
                            $scope.choseItems.splice(i, 1);
                        }
                    }
                }
            }
            document.getElementById('div-selected').scrollTop = document.getElementById('div-selected').scrollHeight;
        }

        // 删除选项
        $scope.delTj = function (item) {
            var type = $scope.zdParams.typeCode;
            var index = $scope.choseItems.indexOf(item);
            if (index > -1) {
                $scope.choseItems.splice(index, 1);
            }
            // 设置列表中数据为false
            if ((item.type == type) && $scope.mrysZdList[$scope.zdParams.typeCode]) {
                for (var i = 0; i < $scope.mrysZdList[type].length; i++) {
                    if ($scope.mrysZdList[type][i].dicItemCode == item.item.dicItemCode) {
                        $scope.mrysZdList[type][i].checked = false;
                    }
                }
            }
        }

        // 清空所有已选项
        $scope.clearTj = function (item) {
            var type = $scope.zdParams.typeCode;
            $scope.choseItems = [];
            for (var i = 0; i < $scope.mrysZdList[type].length; i++) {
                $scope.mrysZdList[type][i].checked = false;
            }
        }
        $scope.submitTj = function () {
            // $rootScope.$broadcast('tjSubmit', );
            var tjData = {
                choseItems: $scope.choseItems,
                showFood: $scope.showFood
            };
            localStorage.setItem("tjData", angular.toJson(tjData));
            $state.go('yangshengshouye');
        };

        // 上拉加载更多
        $scope.isShow = true;
        $scope.loadMicMore = function () {
            var type = $scope.zdParams.typeCode;
            $scope.CurrentZdPageNum[type] += 1;
            var pageNum = $scope.CurrentZdPageNum[type];
            var Count = $scope.pageZdCount[type];
            if (pageNum <= Count) {
                $scope.doLoadMore = false;
                //隐藏无数据提示
                $scope.task_hasMoreItem = true;
                var para = {
                    pageNum: pageNum,
                    inputText: $scope.zdParams.inputText,
                    typeCode: type
                }

                queryZdList("push", para, function () {
                    //禁止上拉滑动
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                });
            } else {
                //显现提示
                $scope.task_hasMoreItem = false;
                if (Count == 0) {
                    $scope.reusltNullTip = "暂无数据！";
                } else {
                    $scope.reusltNullTip = "已全部加载！";
                }

                //隐藏上拉加载
                $scope.isShow = false;
                //禁止上拉滑动
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }

        };
        // 查询字典公共方法
        function queryZdList(style, params) {

            var url;
            if ($scope.showFood) {
                url = "/zyys/getMeiRiYiShanZidian";
            } else {
                url = "/zyys/getMeiRiYiXueZidian";
            }

            XywyService.save(url, params)
                .then(function (response) {
                    var ary = getZd(response.data.data);
                    var type = $scope.zdParams.typeCode;
                    if (style == "equals") {
                        $scope.isShow = true;
                        $scope.mrysZdList[type] = ary;
                        $scope.pageZdCount[type] = response.data.pageCount;
                        $scope.CurrentZdPageNum[type] = 1;
                    } else if (style == "push") {
                        $scope.mrysZdList[type] = $scope.mrysZdList[type].concat(ary);
                        $scope.doLoadMore = true;
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                        return;
                    }
                }, Popup.alert);
            $scope.reusltNullTip = "";
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }

    })
    .controller('yangshengshouyeC', function (wxApi, $scope, $state, XywyService, Popup, $window, GoZzJbYp) {
        XywyService.getRem(750);
        $scope.imgBaseUrl = myConfig.imgBaseUrl;
        $scope.isIos = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
        }
        //返回上一页
        $scope.goBack = function () {
            $window.history.back();
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

        //返回上一页
        $scope.goZyys = function () {
            $state.go('zyys')
        };

        $scope.ShanShilist; //页面上膳食显示的数据
        $scope.pageListCount; //膳食总页数
        $scope.PageNum;
        $scope.xWpageCount; //穴位总页数

        //queryLsShanShiList("equals", params);
        //膳食列表查询,根据style判断是push还是equals
        function queryLsShanShiList(style, params) {
            var url;
            if ($scope.showFood) {
                url = "/zyys/getMeiRiYiShanList";
            } else {
                url = "/zyys/getMeiRiYiXueList";
            }
            XywyService.save(url, params)
                .then(function (response) {
                    if (style == "equals") {
                        $scope.pageListCount = response.data.pageCount;
                        $scope.PageNum = 1;
                        $scope.ShanShilist = response.data.data;
                    } else if (style == "push") {
                        $scope.ShanShilist = $scope.ShanShilist.concat(response.data.data);
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    }

                }, Popup.alert);
        }

        //跳转详情页面
        $scope.goDetail = function (pid) {
            if ($scope.showFood) {
                $state.go("shanshidetail", {
                    pid: pid
                });
            } else {
                $state.go("xueweidetail", {
                    pid: pid
                });
            }

        };
        //组织条件并调用查询
        function tjQuery() {
            var tjData = angular.fromJson(localStorage.getItem('tjData'));
            $scope.showFood = tjData.showFood;
            $scope.choseItems = tjData.choseItems;
            $scope.params = {
                pageNum: 1
            };
            if ($scope.showFood) {
                var shiYingTiZhi = [],
                    zhongYiGongXiao = [],
                    shiYingZheng = [];
                for (var i = 0; i < $scope.choseItems.length; i++) {
                    if ($scope.choseItems[i].type == "1") {
                        zhongYiGongXiao.push($scope.choseItems[i].item.dicItemCode)
                    } else if ($scope.choseItems[i].type == "2") {
                        shiYingTiZhi.push($scope.choseItems[i].item.dicItemCode)
                    } else if ($scope.choseItems[i].type == "3") {
                        shiYingZheng.push($scope.choseItems[i].item.dicItemCode)
                    }
                }
                if (shiYingTiZhi.length > 0) {
                    $scope.params.shiYingTiZhi = shiYingTiZhi;
                }
                if (zhongYiGongXiao.length > 0) {
                    $scope.params.zhongYiGongXiao = zhongYiGongXiao;
                }
                if (shiYingZheng.length > 0) {
                    $scope.params.shiYingZheng = shiYingZheng;
                }
            } else {
                var gongXiaoZhuZhi = [],
                    shiYingZheng = [];
                for (var i = 0; i < $scope.choseItems.length; i++) {
                    if ($scope.choseItems[i].type == "1") {
                        gongXiaoZhuZhi.push($scope.choseItems[i].item.dicItemCode)
                    } else if ($scope.choseItems[i].type == "2") {
                        shiYingZheng.push($scope.choseItems[i].item.dicItemCode)
                    }
                }
                if (gongXiaoZhuZhi.length > 0) {
                    $scope.params.gongXiaoZhuZhi = gongXiaoZhuZhi;
                }
                if (shiYingZheng.length > 0) {
                    $scope.params.shiYingZheng = shiYingZheng;
                }

            }
            queryLsShanShiList("equals", $scope.params);
            if ($scope.showFood) {
                $scope.shaixuanList = [{
                    title: "中医体质",
                    value: "2"
                }, {
                    title: "主治功效",
                    value: "1"
                }, {
                    title: "适应症",
                    value: "3"
                }];
            } else {
                $scope.shaixuanList = [{
                    title: "主治功效",
                    value: "1"
                }, {
                    title: "适应症",
                    value: "2"
                }];
            }
        }

        tjQuery();
        $scope.isShow = true;
        //列表下拉事件
        $scope.loadMore = function () {
            $scope.PageNum += 1;
            var pageNum = $scope.PageNum;
            var Count = $scope.pageListCount;
            if (pageNum <= Count) {
                //隐藏无数据提示
                $scope.task_hasMoreItem = true;
                var para = {
                    pageNum: pageNum,
                }
                $scope.params.pageNum = pageNum;
                queryLsShanShiList("push", $scope.params);
            } else {
                //显现提示
                $scope.task_hasMoreItem = false;
                $scope.reusltNullTip = "已加载全部！";
                //隐藏上拉加载
                $scope.isShow = false;
                //禁止上拉滑动
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        };

        // 重新选条件
        $scope.xuanTiaoJiao = function () {
            $state.go('xuanTiaoJian');
        };
        /**
         * 症状指南详情中药品查询
         */
        $scope.yaopinlist = function (name, leixing) {
            GoZzJbYp.yaopinlist(name, leixing);
        }
    })