angular.module('starter.WDSCControllers', ['ionic'])

    // 我的收藏主页
    .controller('wdscMainC', function ($ionicViewSwitcher, $scope, $state, XywyService, Popup, $window, $ionicHistory) {
        //判断手机类型
        $scope.isIos = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
        }
        //返回上一页
        $scope.goBack = function () {
            $window.history.back();
        };
        var openid = sessionStorage.getItem("openId");
        //首页
        $scope.back = function () {
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

        $ionicHistory.clearCache(["wdscList"]); //清除收藏列表页缓存

        /**
         * 跳转收藏内容
         */
        $scope.wdscList = function (type) {
            $state.go('wdscList', { "type": type });
        };

        // 查询最新收藏
        $scope.scData = {};
        XywyService.save("/member/collect/getRecentCollectInfo", { userId: openid })
            .then(function (response) {
                if (response.data) {
                    $scope.scData = response.data;
                    if(!$scope.scData.jkq)
                    {
                        $scope.scData.jkq="暂无收藏内容";
                    }
                    if(!$scope.scData.jbzs)
                    {
                        $scope.scData.jbzs="暂无收藏内容";
                    }
                    if(!$scope.scData.ypzs)
                    {
                        $scope.scData.ypzs="暂无收藏内容";
                    }
                    if(!$scope.scData.ssys)
                    {
                        $scope.scData.ssys="暂无收藏内容";
                    }
                    if(!$scope.scData.xwys)
                    {
                        $scope.scData.xwys="暂无收藏内容";
                    }
                }

            }, function (reason) {
                Popup.alert(reason)
            });


    })
    // 我的收藏列表页面
    .controller('wdscListC', function ($ionicViewSwitcher, $scope, $state, $stateParams, $timeout, XywyService, Popup, $window) {
        //判断手机类型
        $scope.imgBaseUrl = myConfig.imgBaseUrl;
        XywyService.getRem(750);
        $scope.isIos = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
        }
        //返回上一页
        $scope.goBack = function () {
            $window.history.back();
        };
        //首页
        var openid = sessionStorage.getItem("openId");
        $scope.back = function () {
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

        $scope.type = $stateParams['type'];//当前查看的收藏类型

        // 收藏列表数据
        $scope.dataList = {
            jkq: [],
            ss: [],
            xw: [],
            jb: [],
            yp: []
        };
        // 查询信息
        var queryInfo = {
            jkq: { url: "/member/collect/getJkqList", pageNum: 1, pageCount: 0 },
            ss: { url: "/member/collect/getSsysList", pageNum: 1, pageCount: 0 },
            xw: { url: "/member/collect/getXwysList", pageNum: 1, pageCount: 0 },
            jb: { url: "/member/collect/getJbzsList", pageNum: 1, pageCount: 0 },
            yp: { url: "/member/collect/getYpzsList", pageNum: 1, pageCount: 0 }
        };
        // tab点击事件
        $scope.switchType = function (type) {
            $scope.type = type;
            if ($scope.dataList[$scope.type].length < 1) {
                getShouChangList();
            }
        };
        // 查询收藏列表数据方法
        var getShouChangList = function (type) {
            XywyService.save(queryInfo[$scope.type].url, { userId: openid, pageNum: queryInfo[$scope.type].pageNum })
                .then(function (response) {
                    if (response.data) {
                        if (type == "push") {
                            $scope.dataList[$scope.type] = $scope.dataList[$scope.type].concat(response.data.dataList);
                            $scope.$broadcast('scroll.infiniteScrollComplete');
                        } else {
                            $scope.dataList[$scope.type] = response.data.dataList;
                            queryInfo[$scope.type].pageCount = response.data.pageCount;
                        }

                    }

                }, function (reason) {
                    Popup.alert(reason)
                });
        };
        // 上滑加载更多
        $scope.doLoadMore = true;
        $scope.isShow = false;
        $scope.loadMore = function () {
            var type = $scope.type;
            queryInfo[$scope.type].pageNum += 1;
            var Count = queryInfo[$scope.type].pageCount;
            var pageNum = queryInfo[$scope.type].pageNum;
            if (pageNum <= Count) {
                //隐藏无数据提示
                $scope.task_hasMoreItem = true;
                $scope.doLoadMore = false;
                getShouChangList("push");
            } else {
                //显现提示
                $scope.doLoadMore = false;
                $scope.task_hasMoreItem = false;
                $scope.reusltNullTip = "已加载全部";
                //隐藏上拉加载
                $scope.isShow = false;
                //禁止上拉滑动
            }

            $scope.$broadcast('scroll.infiniteScrollComplete');
        };
        //跳转膳食详情
        $scope.goSs = function (item) {
            $state.go("shanshidetail", {
                pid: item.pid,
                viewTitle: item.shanShiMing,
                displayAllContentFlag: "true"
            });
        };
        //跳转穴位详情
        $scope.goXw = function (item) {
            $state.go("xueweidetail", {
                pid: item.zuheKey,
                viewTitle: item.zuHeXueNames,
                displayAllContentFlag: "true"
            });
        };
        // 疾病点击跳转详情页
        $scope.goJb = function (item) {
            $state.go("wenjibingdetail", {
                id: item.id,
                estype: "jb",
                viewTitle: item.jbmc
            });
        };
        // 药品点击跳转详情页
        $scope.goYp = function (item) {
            $state.go("wenyaodetail", {
                id: item.id,
                estype: "yp",
                viewTitle: item.tymc
            });
        };


        // 查询收藏列表数据
        getShouChangList();

    })

