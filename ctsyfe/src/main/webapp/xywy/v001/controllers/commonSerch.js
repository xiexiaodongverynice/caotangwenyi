angular.module('starter.commonserch', ['ionic'])
    /**
     * 疾病查询页，包含语音查询
     */
    .controller('commonserch', function ($scope,  $state, $stateParams, XywyService, Popup, $ionicScrollDelegate,$window,  $ionicPopup, Yuyin,JsUtil) {
        var listURl;
        //判断手机类型
        $scope.isIos = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
        }
        //返回上一页
        $scope.goBack = function () {
            $window.history.back();
        };

        $scope.historyList = [];
        $scope.hostSearchList = [];
        $scope.loadtab = true;
        //输入框绑定的ng-model
        $scope.data = {
            keyword: "",
            voiceTip: "按住说话"
        }
        $scope.biaoshi = $stateParams.gn
        $scope.id = sessionStorage.getItem("openId");

        function queryHisRecord() {
            setTimeout("$('#keyword').focus()", 100);
            var config;
            var para = {
                openId: $scope.id
            }
            config = {
                params: para,
            }
            //调用哪个接口来做查询
            var url = "";
            if ($stateParams.gn == "jb") {
                url = "/queryjibingHistoryRecord";
            }
            XywyService.query(url, config)
                .then(function (response) {
                    $scope.historyList = response.data.record;
                    $scope.hostSearchList = response.data.hotSearch;
                });
        }
        $scope.show_yp_list = function (jbmc) {
            $scope.data.keyword = jbmc;
            $scope.jibinglist();
        }
        switch ($stateParams.gn) {
            case "jb":
                listURl = "/queryjblist";
                $scope.title = "疾病指南";
                $scope.inputHold = "搜疾病名称";
                queryHisRecord();//查询历史记录
                break;
            case "ss":
                listURl = "/zyys/getMeiRiYiShanListByInput";
                $scope.title = "膳食养生";
                $scope.inputHold = "搜膳食名称、体质、主治功效、适应症";
                break;
            case "xw":
                listURl = "/zyys/getMeiRiYiXueListByInput";
                $scope.title = "穴位养生";
                $scope.inputHold = "搜穴位名称、主治功效、适应症";
                break;
            case "bzxt":
                listURl = "/queryYpByJzOrXt";
                $scope.title = "家庭用药";
                $scope.inputHold = "搜病症、系统分类";
                break;
            case "ypmc":
                listURl = "/searchMainList";
                $scope.title = "药品库";
                $scope.inputHold = "搜药品名称";
                break;
            case "mb":
                listURl = "/qxjk/getManBingList";
                $scope.title = "慢病列表";
                $scope.inputHold = "输入您想要的搜索的疾病名称";
                break;
            default:
                break;
        }
        // 格式膳食养生数据
        function ssformat(item) {
            return { "id": item.pid, "jbmc": item.shanShiMing }
        }
        // 格式膳食养生数据
        function xwformat(item) {
            return { "id": item.zuheKey, "jbmc": item.zuHeXueNames }
        }
        // 格式系统分类数据(一级)
        function yjflformat(item) {
            var isclick = "0";
            if (item.ejflList) {
                isclick = "1";
            }
            return { "jbmc": item.YJFL, "cList": item.ejflList, "ISZSK": isclick }
        }
        // 格式系统分类数据(二级)
        function ejflformat(item) {
            return { "jbmc": item, "ISZSK": "1" }
        }
        // 格式药品数据
        function bzxtformat(item) {
            return { "id": item.id, "jbmc": item.YPMC, "ISZSK": item.ISZSK }
        }

        $scope.jibinglist = function () {
            if($scope.data.keyword==''){
                // console.log("123")
                $scope.jbList = null;
            }
            if ($scope.data.keyword) {
                $scope.loadtab = false;
                $ionicScrollDelegate.$getByHandle('dashboard').scrollTop(false);
                $scope.pageNum = 1;
                var param = {
                    pageNum: $scope.pageNum,
                    zimu: $scope.zimu,
                    type: "mohu",
                    input: $scope.data.keyword.toLowerCase()
                };
                var config = {
                    params: param
                }
                
                XywyService.query(listURl, config)
                    .then(function (response) {
                        $scope.jbList = [];
                        $scope.ssorxwlist = {};
                        $scope.pageCount = response.data.Count;
                        $scope.alltype = response.data.resultType;
                        $scope.displayAllFlag = response.data.displayAllFlag
                        if ($stateParams.gn == "jb") {
                            $scope.jbList = response.data.list;
                            if ($scope.jbList.length == 0) {
                                $scope.task_hasMoreItem = false;
                                $scope.reusltNullTip = "暂无相关搜索结果！";
                            } else {
                                //是否显示加载更多（false表示显示）
                                $scope.isShow = false;
                                if ($scope.pageCount == 1) {
                                    $scope.task_hasMoreItem = false;
                                    $scope.reusltNullTip = "已加载全部！"
                                }
                            }
                        }
                        else if ($stateParams.gn == "ss") {
                            $scope.pageCount = response.data.pageCount;
                            if ($scope.alltype == "1") {
                                if (typeof response.data.data == "undefined" || response.data.data.length == 0) {
                                    $scope.task_hasMoreItem = false;
                                    $scope.reusltNullTip = "暂无相关搜索结果！";
                                } else {
                                    //是否显示加载更多（false表示显示）
                                    $scope.isShow = false;
                                    if ($scope.pageCount == 1) {
                                        $scope.task_hasMoreItem = false;
                                        $scope.reusltNullTip = "已加载全部！"
                                    }
                                    var dataList = response.data.data.map(ssformat);
                                    $scope.jbList = dataList;


                                }
                            }
                            if ($scope.alltype == "2") {
                                $scope.ssorxwlist = response.data
                            }


                        }
                        else if ($stateParams.gn == "xw") {
                            $scope.pageCount = response.data.pageCount;
                            if ($scope.alltype == "1") {
                                if (typeof response.data.data == "undefined" || response.data.data.length == 0) {
                                    $scope.task_hasMoreItem = false;
                                    $scope.reusltNullTip = "暂无相关搜索结果！";
                                } else {
                                    //是否显示加载更多（false表示显示）
                                    $scope.isShow = false;
                                    if ($scope.pageCount == 1) {
                                        $scope.task_hasMoreItem = false;
                                        $scope.reusltNullTip = "已加载全部！"
                                    }
                                    var dataList = response.data.data.map(xwformat);
                                    $scope.jbList = dataList;
                                }
                            }
                            if ($scope.alltype == "2") {
                                $scope.ssorxwlist = response.data
                            }

                        }
                        else if ($stateParams.gn == "mb") {
                            $scope.jbList = response.data;
                            if ($scope.jbList.length == 0) {
                                $scope.task_hasMoreItem = false;
                                $scope.reusltNullTip = "暂无相关搜索结果！";
                            } else {
                                //是否显示加载更多（false表示显示）
                                $scope.isShow = false;
                                if ($scope.pageCount == 1) {
                                    $scope.task_hasMoreItem = false;
                                    $scope.reusltNullTip = "已加载全部！"
                                }
                            }
                        }
                        else if ($stateParams.gn == "bzxt") {
                            if (typeof response.data.resulttype == "undefined") {
                                $scope.reusltNullTip = "暂无相关搜索结果！";
                                $scope.jbList = null;
                            } else {
                                if (response.data.resulttype == "ypList") {
                                    $scope.goTo = "cs";
                                    var dataList = response.data.ypList.map(bzxtformat);
                                } else if (response.data.resulttype == "yjflList") {
                                    $scope.goTo = "fl";
                                    $scope.flTj = {
                                        xt: response.data.chooseXT
                                    }

                                    var dataList = response.data.yjflList.map(yjflformat);
                                } else if (response.data.resulttype == "ejflList") {
                                    $scope.goTo = "yp";
                                    $scope.isFenLei = true;
                                    $scope.flTj = {
                                        xt: response.data.chooseXT,
                                        yjfl: response.data.chooseYJFL
                                    }

                                    var dataList = response.data.ejflList.map(ejflformat);
                                }


                                $scope.jbList = dataList;
                            }
                        }

                    }, Popup.alert);
            }
            //禁止上拉滑动
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }
        $scope.isShow = true;
        //上拉加载更多数据
        $scope.loadMicMore = function () {
            if (!$scope.data.keyword) {
                $scope.task_hasMoreItem = false;
                $scope.isShow = true;
                //禁止上拉滑动
                $scope.$broadcast('scroll.infiniteScrollComplete');
                return null;
            }
            $scope.pageNum += 1;
            if ($scope.pageNum <= $scope.pageCount) {
                //隐藏无数据提示
                $scope.task_hasMoreItem = true;
                var postParams = {
                    params: {
                        pageNum: $scope.pageNum,
                        zimu: $scope.zimu,
                        input: $scope.data.keyword
                    }
                };
                //调用哪个接口来做查询
                XywyService.query(listURl, postParams)
                    .then(function (response) {
                        if ($stateParams.gn == "jb") {
                            angular.forEach(response.data.list, function (child) {
                                $scope.jbList.push(child);
                            });
                        }
                        else if ($stateParams.gn == "ss") {
                            var dataList = response.data.data.map(ssformat);
                            angular.forEach(dataList, function (child) {
                                $scope.jbList.push(child);
                            });
                        }
                        else if ($stateParams.gn == "xw") {
                            var dataList = response.data.data.map(xwformat);
                            angular.forEach(dataList, function (child) {
                                $scope.jbList.push(child);
                            });
                        }
                        //禁止上拉滑动
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    });

            } else {
                //显现提示
                $scope.task_hasMoreItem = false;
                if ($scope.jbList.length == 0) {
                    $scope.reusltNullTip = "暂无相关搜索结果！";
                } else {
                    $scope.reusltNullTip = "已加载全部";
                }

                //隐藏上拉加载
                $scope.isShow = true;
                //禁止上拉滑动
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        };
        //详情
        $scope.godetail = function (id, jbmc) {
            //保存历史记录
            if ($stateParams.gn == "jb") {
                $scope.saveHistory(jbmc);
                $state.go('wenjibingdetail', { id: id, estype: "jb", viewTitle: jbmc });
            }
            else if ($stateParams.gn == "ss") {
                $state.go('shanshidetail', { pid: id, viewTitle: jbmc,displayAllContentFlag:  $scope.displayAllFlag});
            }
            else if ($stateParams.gn == "xw") {
                $state.go('xueweidetail', { pid: id, viewTitle: jbmc,displayAllContentFlag:  $scope.displayAllFlag });
            }
        };
        // 搜索input 获得焦点事件
        $scope.inputFocu = function () {
            $scope.loadtab = false;
        };
        // 搜索input 失去焦点事件
        $scope.inputBlur = function () {
            if (JsUtil.isEmpty($scope.data.keyword)) {
                $scope.loadtab = true;
            }
            // $scope.loadtab = true;
        };

        // 药品点击事件
        $scope.ypClick = function (item) {
            if ($scope.goTo == "cs") {
                if (item.ISZSK == "1") {
                    $state.go("csyplb", { "ypmc": item.jbmc });
                }
            }
            if ($scope.goTo == "yp") {
                $scope.flTj.ejfl = item.jbmc;
                $state.go("yplb", { "tj": JSON.stringify($scope.flTj), "type": "xt", "title": item.jbmc });
            }
            if ($scope.goTo == "fl") {
                if (item.cList) {
                    $scope.flTj.yjfl = item.jbmc;
                    $scope.goTo = "yp";
                    var dataList = item.cList.map(ejflformat);
                    $scope.jbList = dataList;
                }
            }
            event.stopPropagation();
        };

        $scope.deleteRecord = function () {
            var myPopup = $ionicPopup.show({
                template: '您确定要清空全部历史搜索记录吗？',
                title: '提示',
                scope: $scope,
                buttons: [
                    {
                        text: '取消',
                    },
                    {
                        text: '<b>确定</b>',
                        type: 'button-positive',
                        onTap: function (e) {
                            var config;
                            var para = {
                                openId: $scope.id
                            }
                            config = {
                                params: para,
                            }
                            //调用哪个接口来做查询
                            var url = "";
                            if ($stateParams.gn == "jb") {
                                url = "/deletejibingHistoryRecord";
                            }
                            XywyService.query(url, config)
                                .then(function () {
                                    $scope.historyList = [];
                                });
                            myPopup.close();
                        }
                    },
                ]
            });

        }
        //保存历史记录
        $scope.saveHistory = function (jbmc) {
            var config;
            var para = {
                input: jbmc,
                openId: $scope.id,
            }
            config = {
                params: para,
            }
            //调用哪个接口来做查询
            var url = "";
            if ($stateParams.gn == "jb") {
                url = "/savejibingHistoryRecord";
            }
            XywyService.query(url, config)
                .then(function (response) {
                    queryHisRecord();
                });
        }
        $scope.clean = function () {
            $scope.data.keyword = "";
            $scope.jbList = null;
            $scope.loadtab = true;
        }

        /**
         * 语音部分
         */

        function startFunc() {
            $scope.start = true;
            $scope.isshowimg = true;
            $scope.data.voiceTip = '向上滑动，取消发送';
        }

        function finishFunc() {
            $scope.data.voiceTip = '按住说话';
            $scope.start = false;
        }
        $scope.send = function ($event) {
            $scope.inputFocus = false;
            //            $scope.sendmessage();
            $scope.sendMessageXin();
        }
        //识别回调函数（解析语音的结果）
        function successFunc(text) {
            //判断是否解析完成（如果没有解析成功则不做处理）
            if (text === false || text === "只是一个模拟调试的结果") {

            } else {
                $scope.data.keyword = text;
                $scope.jibinglist();
            }
        };
        var bindFunces = Yuyin(startFunc, finishFunc, successFunc);

        $scope.startRecord = function ($event) {
            $scope.zIndex = true;
            // startAudio.play();
            $scope.isshowimg = true;
            $event.preventDefault();
            startTime = $event.timeStamp;
            startY = $event.touches[0].screenY;
            bindFunces.start();
            $scope.moveaction($event)
        };

        $scope.moveaction = function ($event) {
            $scope.isshowimg = true;
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

        $scope.finishRecord = function ($event) {
            $scope.isshowimg = false;
            if ($scope.cancel) {
                bindFunces.stop();
                $scope.zIndex = false;
            } else {
                bindFunces.finish();
                $scope.zIndex = false;
            }
            $scope.cancel = false;

        };

    })