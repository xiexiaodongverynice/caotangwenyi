angular.module('starter.JianKangQuanControllers', ['ionic'])
    //圈子广场
    .controller('qzGuangChang', function(wxApi, $ionicViewSwitcher, $scope, $http, $state, $stateParams, $timeout, XywyService, Popup, Outlet, $ionicScrollDelegate, audioControl, $window, $rootScope, geoLocation, $ionicLoading) {
        XywyService.getRem(750);

        //判断手机类型
        $scope.isIos = false;
        $scope.istrue = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
        }
        var openId = sessionStorage.getItem("openId");

        //返回上一页
        $scope.goBack = function() {
            $window.history.back();
        };
        //返回首页
        //首页
        $scope.back = function() {
            var openid = sessionStorage.getItem("openId");
            $ionicViewSwitcher.nextDirection('back');
            var token = sessionStorage.getItem("token");
            $state.go("shouye", { openid: openid, token: token });
        };
        //添加关注圈子
        $scope.setuserquanzi = function(id, num) {
                var juq = {}
                juq.userid = openId;
                juq.qid = id;
                juq.sxbz = num;
                XywyService.save("/jkq/setuserquanzi", juq)
                    .then(function(data) {
                        if (num == 1) {
                            $ionicLoading.show({
                                template: '已加入！',
                            });
                        } else {
                            $ionicLoading.show({
                                template: '取消加入！',
                            });
                        }
                        $timeout(function() {
                            $ionicLoading.hide();
                            $scope.getjkqnotfollowedlist()
                        }, 2000)

                    }).catch(function(err) {
                        console.log(err)
                    })
            }
            //关注、取消关注圈子
        $scope.add_quanZi = function(id, shifoujiaru) {
                if (shifoujiaru == 0) {
                    var num = 1;
                    for (var i = 0; i < $scope.notfollowedlist.length; i++) {
                        if ($scope.notfollowedlist[i].id == id) {
                            $scope.notfollowedlist[i].shifoujiaru = "1";
                            break;
                        }
                    }
                    $scope.setuserquanzi(id, num)

                } else {
                    var num = 0;
                    for (var i = 0; i < $scope.notfollowedlist.length; i++) {
                        if ($scope.notfollowedlist[i].id == id) {
                            $scope.notfollowedlist[i].shifoujiaru = "0";
                            break;
                        }
                    }
                    $scope.setuserquanzi(id, num)

                }

            }
            //进入圈子
        $scope.chooseqz = function(id) {
            $state.go("qzXiangQing", { qzid: id });
        }
        var config = {};
        config.userid = sessionStorage.getItem("openId");
        //获取圈子列表
        $scope.getjkqnotfollowedlist = function() {
            XywyService.save("/jkq/getquanzilist", config)
                .then(function(data) {
                    $scope.notfollowedlist = data.data;
                    $timeout(function() {
                        $scope.istrue = true;
                    }, 500)

                }).catch(function(err) {
                    console.log(err)
                })
        }


        // 点击页面圈子类型加载圈子
        $scope.loadqz = function(qzFl) {
            $scope.data.qzFl = qzFl;
            if (qzFl == "全部") {
                config.mygz = null
                $scope.getjkqnotfollowedlist()
            }
            if (qzFl == "我加入的") {
                config.mygz = "gz"
                $scope.getjkqnotfollowedlist()
            }

        };

        $scope.data = { searchSuc: false, keyword: '', qzFl: "全部" };

        $scope.quanZi = [{ mc: "全部" }, { mc: "我加入的" }];

        $scope.getjkqnotfollowedlist();
    })

//圈子详情
.controller('qzXiangQing', function(wxApi, $ionicViewSwitcher, $scope, $http, $state, $stateParams, $timeout, XywyService, Popup, Outlet, $ionicScrollDelegate, audioControl, $window, $rootScope, geoLocation, $ionicLoading) {
        var c = 750; // 基准宽度,取的是iphone6
        var b = document.getElementsByTagName('html')[0];
        var f = b.getBoundingClientRect().width / c;
        b.style.fontSize = f + 'rem';
        var vm = this;
        var paixu = null;
        $scope.qid = $stateParams.qzid
            //判断是否有数据
        // $scope.istiezianydata = [];
        $scope.isjiaru = true;
        //判断手机类型
        $scope.isIos = false;
        //默认展示浏览页面
        $scope.isliulan = true;
        $scope.isjinghua = true;
        var isMenuShow = false;
        var timer;
        // 隐藏菜单
        var hideMenu = function() {
                var floatIcon = document.getElementById('floatIcon');
                if (floatIcon) {
                    //floatIcon.className = 'icon iconfont icon-gengduo';
                    $("#m-body").fadeOut();
                }
                clearTimeout(timer);
                isMenuShow = false;
            }
            // 显示菜单
        var showMenu = function() {
                var floatIcon = document.getElementById('floatIcon');
                if (floatIcon) {
                    // floatIcon.className = 'icon iconfont icon-gengduo-copy';
                    $("#m-body").fadeIn();
                }

            }
            // 点击蓝色圆按钮显示写贴子、查看贴子菜单
        $scope.menuSwitch = function() {
            if (!isMenuShow) {
                isMenuShow = true;
                showMenu()
                    // timer=setTimeout(hideMenu, 5000);
            } else {
                hideMenu();
            }
        };
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
        }
        //写帖子
        $scope.xietiezi = function(name) {
                $state.go("writePost", { qzid: $stateParams.qzid, qzname: name });
            }
            //点击置顶信息进入帖子详情
        $scope.gotzxq = function(id) {
            $state.go("postDetail", { tzid: id });
        }

        //返回上一页
        $scope.goBack = function() {
            $window.history.back();
        };
        //获取置顶列表
        $scope.zhidinglist = [];
        //加载数据列表
        $scope.itemtizixqlist = [];
        //获取所属圈子全部帖子信息
        var param = {};
        param.userid = sessionStorage.getItem("openId");
        param.qid = $scope.qid;
        param.num = 0;
        $scope.gettiezilist = function(item) {
            param.paixu = item
            XywyService.save("/jkq/gettieziListbyqid", param)
                .then(function(data) {
                    $scope.tizixqlist = data.data
                    $scope.qzxq = $scope.tizixqlist.quanzi
                    $scope.qzname = $scope.qzxq.qzname
                    $scope.show_sx_list = false;
                    $scope.zhiding = $scope.tizixqlist.tiezilist;
                    for (var j = 0; j < $scope.zhiding.length; j++) {
                        $scope.itemtizixqlist.push($scope.zhiding[j])

                    }
                    console.log($scope.itemtizixqlist.length)
                    for (var i = 0; i < $scope.itemtizixqlist.length; i++) {
                        if ($scope.itemtizixqlist[i].zhiding == 1) {
                            $scope.zhidinglist.push($scope.itemtizixqlist[i])
                        }
                    }
                    if ($scope.itemtizixqlist.length < 20 * (index + 1)) {
                        $scope.hasmore = false
                    }
                    if (param.num == 0) {
                        $scope.istiezianydata = $scope.zhiding
                            //  console.log( $scope.istiezianydata.length,"870")
                    }
                }).catch(function(err) {
                    console.log(err)
                });

        }

        //根据圈子查询热门帖子
        $scope.topNewS = [
            { title: "健康圈到底是一个什么圈子" },
            { title: "我能在健康了解什么" }
        ];
        //tab页切换
        $scope.clickliulan = function() {
            $scope.hasmore = true
            index = 0;
            $scope.isliulan = true;
            param.jinghua = "0";
            param.num = 0;
            $scope.zhidinglist = [];
            $scope.itemtizixqlist = [];
            $scope.gettiezilist(paixu)
        }
        $scope.clickjinghua = function() {
                $scope.hasmore = true
                index = 0;
                $scope.isliulan = false;
                param.jinghua = "1";
                param.num = 0;
                $scope.zhidinglist = [];
                $scope.itemtizixqlist = [];
                $scope.gettiezilist(paixu)

            }
            //添加关注圈子
        $scope.setuserquanzi = function(id, num) {
                var juq = {}
                juq.userid = sessionStorage.getItem("openId");;
                juq.qid = id;
                juq.sxbz = num;
                XywyService.save("/jkq/setuserquanzi", juq)
                    .then(function(data) {
                        if (juq.sxbz == 1) {
                            $ionicLoading.show({
                                template: '已加入！',
                            });
                        } else {
                            $ionicLoading.show({
                                template: '取消加入！',
                            });
                        }
                        $timeout(function() {
                            $ionicLoading.hide();
                            $scope.clickliulan();
                        }, 2000)
                    }).catch(function(err) {
                        console.log(err)
                    })
            }
            //关注圈子、取消关注
        $scope.chickjiaquanzi = function() {
            if ($scope.qzxq.shifoujiaru == 0) {
                var num = 1
                $scope.setuserquanzi($scope.qzxq.id, num)
                $scope.qzxq.shifoujiaru = 1
            } else {
                var num = 0
                $scope.setuserquanzi($scope.qzxq.id, num)
                $scope.qzxq.shifoujiaru = 0
            }

        }
        $scope.show_sx_list = false;
        //筛选
        $scope.shaixuan = function() {
                event.stopPropagation();
                if ($scope.show_sx_list == false) {
                    $scope.show_sx_list = true;
                } else {
                    $scope.show_sx_list = false;
                }
            }
            //点击页面清除弹窗
        $scope.chickall = function() {
            if ($scope.show_sx_list == true) {
                $scope.show_sx_list = false;
            }
            if (isMenuShow) {
                hideMenu();
            }
        }
        $scope.sxlist = [
            { key: "发帖时间", value: "ftsj", id: "0" }, { key: "回帖时间", value: "htsj", id: "1" },
            { key: "浏览量", value: "lll", id: "2" }, { key: "评论数", value: "pls", id: "3" }
        ];
        //根绝筛选查询帖子
        $scope.currentList = 0;
        $scope.search_Post = function(value, id) {
            param.num = 0;
            var index = 0;
            $scope.itemtizixqlist = [];
            $scope.currentList = id;
            $scope.zhidinglist = [];
            $scope.gettiezilist(value);

        }
        $scope.clickliulan();
        //加载更多
        var index = 0;
        $scope.hasmore = true;
        $scope.loadMore = function() {
            $timeout(function() {
                index++
                if ($scope.isliulan) {
                    param.jinghua = "0"
                    if ($scope.itemtizixqlist.length < 20) {
                        $scope.hasmore = false
                        return
                    } else {
                        param.num = index;
                        $scope.gettiezilist(paixu)
                    }

                }
                if (!$scope.isliulan && $scope.isjinghua) {
                    param.jinghua = "1"
                    if ($scope.itemtizixqlist.length < 20) {
                        $scope.hasmore = false
                        return
                    } else {
                        param.num = index;
                        $scope.gettiezilist(paixu)
                    }

                }

                $scope.$broadcast('scroll.infiniteScrollComplete');
            }, 1500)

        };
        //  $scope.gettiezilist();

    })
    .controller('postDetailC', function(wxApi, $ionicViewSwitcher, $scope, $http, $state, $stateParams, $timeout, XywyService, Popup, Outlet, $ionicScrollDelegate, audioControl, $window, $rootScope, geoLocation, $ionicPopup, $ionicLoading) {
        XywyService.getRem(750);

        //判断手机类型
        $scope.isIos = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
        }
        //返回上一页
        $scope.goBack = function() {
            if ($stateParams.go == $stateParams.tzid) {
                javascript: history.go(-2);
            }
            else {
                javascript: history.go(-1);
            }
        };
        //是否出现加载更多按钮
        $scope.ismorehuifulist = false
        $scope.userids = sessionStorage.getItem("openId")
        $scope.isdelete = false;
        //新增列表展示
        $scope.isshowlb = false;
        $scope.isshowpl = "";
        $scope.closeall = function() {
            console.log("122")
            $scope.isshowlb = false;
            $scope.isshowpl = "";
        }
        $scope.changeslb = function(event) {
            event.stopPropagation()
            if ($scope.isshowlb == false) {
                $scope.isshowlb = true
            } else {
                $scope.isshowlb = false
            }
        }
        $scope.changespl = function(id, event) {
            event.stopPropagation()
            if ($scope.isshowpl != id) {
                $scope.isshowpl = id;
            } else {
                $scope.isshowpl = "";
            }


        }
        var filter = {};
        $scope.picturelist = [];
        //帖子详情去圈子广场
        $scope.goguangchang = function() {
                $state.go("qzXiangQing", { qzid: $scope.tzxq.qId });
            }
            //帖子详情去发评论
        $scope.goComment = function() {
                $state.go("commentFaBu", { tziid: $scope.tzxq.id, qzid: $scope.tzxq.qId, tzname: $scope.tzxq.name });
            }
            //获取帖子详情列表
        $scope.gettieziqxlist = function() {
                filter.userid = sessionStorage.getItem("openId");
                filter.tid = $stateParams.tzid
                filter.num = 0;
                XywyService.save("/jkq/gettiezi", filter)
                    .then(function(data) {
                        $scope.tzxqlist = data.data
                        $scope.tzxq = $scope.tzxqlist.tiezi
                        $scope.huifulist = $scope.tzxqlist.pinglunList
                        filter.zk = null
                        if ($scope.tzxq.userId == filter.userid) {
                            $scope.isdelete = true
                        }
                        // console.log($scope.huifulist,"09999")
                    }).catch(function(err) {
                        console.log(err)
                    });

            }
            // var index = 0;
            // //回复信息分页接口
            // $scope.gethuifualllist = function(event,pid){
            //     event.stopPropagation();
            //     index++
            //     var param = {}
            //     param.userid = sessionStorage.getItem("openId");
            //     param.plid =  pid
            //     param.hfnum = index;
            //     XywyService.save("/jkq/gethuifulist",param)
            //         .then(function(data){
            //             // $scope.morehuifulist = 
            //         }).catch(function (err) {
            //             console.log(err)
            //           });

        // }
        //评论回复
        $scope.gorelay = function(id, tid) {
                $state.go("jkqpinglunrelay", { tziid: tid, qlid: id });
            }
            //回复回复
        $scope.gohuifurelay = function(id, tid, name,hfuserId) {
                // console.log(id, "123")
                $state.go("jkqpinglunrelay", { tziid: tid, qlid: id, name: name,hfuserId:hfuserId});
            }
            //展示图片
        $scope.showimg = function(imgurllist, index) {
            for (var i = 0; i < imgurllist.length; i++) {
                $scope.picturelist.push(imgurllist[i].picture)
            }
            var list = angular.toJson($scope.picturelist);
            $state.go("jkqimgyulan", { list: list, curindex: index });
        };
        $scope.gettieziqxlist();
        //点击评论按钮的改变状态
        $scope.IsLouZhu = false;
        $scope.IsZiJi = false;

        //改变点赞状态
        $scope.changeState = function(item) {
                var param = {};
                param.userId = sessionStorage.getItem("openId");
                param.tId = item.id;
                param.shoucang = item.shoucang;
                if (item.dianzan == 1) {
                    param.dianzan = 0;
                } else {
                    param.dianzan = 1;
                }
                XywyService.save("/jkq/settieizidzsc", param)
                    .then(function(data) {
                        if (data) {
                            if (item.dianzan == 1) {
                                item.dianzan = 0;
                                $ionicLoading.show({
                                    template: '取消点赞！',
                                });
                            } else {
                                item.dianzan = 1;
                                $ionicLoading.show({
                                    template: '已点赞！',
                                });
                            }

                        }

                        $timeout(function() {
                            $scope.gettieziqxlist()
                            $ionicLoading.hide();
                        }, 2000)
                    }).catch(function(err) {
                        console.log(err)
                    });
            }
            //改变收藏状态
        $scope.changeshoucang = function(item) {
                var param = {};
                param.userId = sessionStorage.getItem("openId");
                param.tId = item.id;
                param.dianzan = item.dianzan;
                if (item.shoucang == 1) {
                    param.shoucang = 0;
                } else {
                    param.shoucang = 1;
                }
                XywyService.save("/jkq/settieizidzsc", param)
                    .then(function(data) {
                        if (data) {
                            if (item.shoucang == 1) {
                                item.shoucang = 0;
                                $ionicLoading.show({
                                    template: '取消收藏！',
                                });
                                $scope.cancelCollect(item.id)
                            } else {
                                item.shoucang = 1;
                                $ionicLoading.show({
                                    template: '已收藏！',
                                });
                                $scope.addCollect(item.id)
                            }
                        }

                        $timeout(function() {
                            $scope.gettieziqxlist()
                            $ionicLoading.hide();
                        }, 2000);
                    }).catch(function(err) {
                        console.log(err)
                    });




            }
        $scope.addCollect = function(id){
            param = {}
            param.userId = sessionStorage.getItem("openId");
            param.collectDataPid = id;
            param.collectType ="JKQ"
            XywyService.save("/member/collect/addCollect", param)
            .then(function(data) {
               
            }).catch(function(err) {
                console.log(err)
            });

        }
        $scope.cancelCollect = function(id){
            param = {}
            param.userId = sessionStorage.getItem("openId");
            param.collectDataPid = id;
            param.collectType ="JKQ"
            XywyService.save("/member/collect/cancelCollect", param)
            .then(function(data) {
               
            }).catch(function(err) {
                console.log(err)
            });

        }
            //删除提示
        $scope.delete = function(id, type) {
                if (type == 1) {
                    var myPopup = $ionicPopup.show({
                        template: '您确定要删除该条话题吗？',
                        title: '提示',
                        scope: $scope,
                        buttons: [{
                                text: '取消',
                            },
                            {
                                text: '<b>确定</b>',
                                type: 'button-positive',
                                onTap: function(e) {
                                    e.preventDefault();
                                    $scope.deletetiezi(id)
                                    myPopup.close();
                                }
                            },
                        ]
                    });
                }
                if (type == 2) {
                    var myPopup = $ionicPopup.show({
                        template: '您确定要删除该条评论吗？',
                        title: '提示',
                        scope: $scope,
                        buttons: [{
                                text: '取消',
                            },
                            {
                                text: '<b>确定</b>',
                                type: 'button-positive',
                                onTap: function(e) {
                                    e.preventDefault();
                                    $scope.deletepinglun(id)
                                    myPopup.close();
                                }
                            },
                        ]
                    });
                }
                if (type == 3) {
                    var myPopup = $ionicPopup.show({
                        template: '您确定要删除该条回复吗？',
                        title: '提示',
                        scope: $scope,
                        buttons: [{
                                text: '取消',
                            },
                            {
                                text: '<b>确定</b>',
                                type: 'button-positive',
                                onTap: function(e) {
                                    e.preventDefault();
                                    $scope.deletehuifu(id)
                                    myPopup.close();
                                }
                            },
                        ]
                    });
                }


            }
            //删除话题
        $scope.deletetiezi = function(id) {
                var filter = {};
                filter.userId = sessionStorage.getItem("openId");
                filter.tid = id
                XywyService.save("/jkq/deletetiezi", filter)
                    .then(function(data) {
                        $ionicLoading.show({
                            template: '删除成功！',
                        });
                        $timeout(function() {
                            $ionicLoading.hide();
                            javascript: history.go(-1);
                        }, 2000);
                    }).catch(function(err) {
                        console.log(err)
                    });
            }
            //删除回复
        $scope.deletehuifu = function(id) {
                var param = {};
                param.openId = sessionStorage.getItem("openId");
                param.hid = id
                XywyService.save("/jkq/deletehuifu", param)
                    .then(function(data) {
                        $ionicLoading.show({
                            template: '删除成功！',
                        });
                        $timeout(function() {
                            $ionicLoading.hide();
                            $scope.gettieziqxlist();
                        }, 2000);
                    }).catch(function(err) {
                        console.log(err)
                    });
            }
            //删除评论
        $scope.deletepinglun = function(id) {
                var params = {};
                params.openId = sessionStorage.getItem("openId");
                params.pid = id
                XywyService.save("/jkq/deletepinglun", params)
                    .then(function(data) {
                        $ionicLoading.show({
                            template: '删除成功！',
                        });
                        $timeout(function() {
                            $ionicLoading.hide();
                            $scope.gettieziqxlist();
                        }, 2000);
                    }).catch(function(err) {
                        console.log(err)
                    });
            }
            //改变评论列表
        $scope.changeListState = function(data) {
                if (data == "owner") {
                    ($scope.IsLouZhu == true) ? ($scope.IsLouZhu = false) : ($scope.IsLouZhu = true);
                    if ($scope.IsLouZhu == true) {
                        $scope.IsZiJi = false
                        filter.zk = "lz"
                        $scope.gettieziqxlist()

                    }
                }
                if (data == "myself") {
                    ($scope.IsZiJi == true) ? ($scope.IsZiJi = false) : ($scope.IsZiJi = true);
                    if ($scope.IsZiJi == true) {
                        $scope.IsLouZhu = false
                        filter.zk = "zj"
                        $scope.gettieziqxlist()
                    }
                }
                if (!$scope.IsLouZhu && !$scope.IsZiJi) {
                    filter.zk = null
                    $scope.gettieziqxlist()
                }
            }
            //评论列表点赞
        $scope.changeVisitState = function(item) {
            var param = {};
            param.userid = sessionStorage.getItem("openId");
            param.Id = item.id;
            if (item.sfdz) {
                param.dianzan = "0";
            } else {
                param.dianzan = "1";
            }
            XywyService.save("/jkq/punglundz", param)
                .then(function(data) {
                    if (data) {
                        if (item.sfdz) {
                            item.sfdz = false
                            $ionicLoading.show({
                                template: '取消点赞！',
                            });
                        } else {
                            item.sfdz = true
                            $ionicLoading.show({
                                template: '已点赞！',
                            });
                        }
                    }

                    $timeout(function() {
                        $scope.gettieziqxlist()
                        $ionicLoading.hide();
                    }, 2000);
                }).catch(function(err) {
                    console.log(err)
                });




        }
    })

//帖子评论
.controller('commentFaBuC', function(wxApi, $ionicViewSwitcher, $scope, $http, $state, $stateParams, $timeout, XywyService, Popup, Outlet, $ionicScrollDelegate, audioControl, $window, $rootScope, geoLocation, Upload, $timeout, $ionicLoading, UserInfoService) {
    var c = 750; // 基准宽度,取的是iphone6
    var b = document.getElementsByTagName('html')[0];
    var f = b.getBoundingClientRect().width / c;
    b.style.fontSize = f + 'rem';
    $scope.tzname = $stateParams.tzname;
    $scope.tziid = $stateParams.tziid;
    $scope.qzid = $stateParams.qzid;
    //判断手机类型
    $scope.isIos = false;
    if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
        $scope.isIos = true;
    }

    //返回上一页
    $scope.goBack = function() {
        $window.history.back();
    };
    //文本改变
    $scope.issubmit = false
    $scope.isClick = true;
    $scope.textarCHange = function(textare) {
        if (textare.length > 0 && textare.length <= 500) {
            $scope.isClick = false;
        } else {
            $scope.isClick = true;
        }
        var textare = document.getElementById("textares");
        if (textare != "") {
            $scope.issubmit = true
        }
        if (textare == '') {
            $scope.issubmit = false
        }
    }

    //健康圈的帖子的评论的上传
    $scope.listimg = [];
    $scope.listimgname = [];
    $scope.list = [];
    $scope.pictureindex = [];
    $scope.imgshuxu = 0;
    //添加图片
    $scope.upload = function(files) {
        if (!files) {
            return false;
        }
        if (files.length > 6) {
            files = files.slice(0, 6);
        }
        var data = {};
        //                 data.file = files;
        data.staffCode = sessionStorage.getItem("openId");
        data.files = files;
        Upload.upload({
            url: myConfig.serverUrl + '/baocunimg',
            data: data
        }).success(function(response) {
            //                     console.log(response);
            if (response) {
                $scope.imgshuxu++
                    for (var i = 0; i < response.length; i++) {
                        if ($scope.list.length < 6) {
                            $scope.list.push(response[i]);
                            if ($scope.listimg.length > 0) {
                                $scope.listimg[$scope.listimg.length] = response[i].backpath;
                                $scope.listimgname[$scope.listimgname.length] = response[i].fileName;
                            } else {
                                $scope.listimg[0] = response[i].backpath;
                                $scope.listimgname[0] = response[i].fileName;
                            }
                        }
                    }
                $scope.pictureindex.push($scope.imgshuxu);
            }
        }).error(function(file) {
            //上传失败
            console.log(file);
        });
        // console.log($scope.listimg);
    };
    //是否匿名事件
    // $scope.hidename = true;
    // $scope.nimingclick = function(){
    // 	($scope.hidename == true) ? ($scope.hidename = false) : ($scope.hidename = true);
    // }
    //跳转预览图片
    $scope.showimg = function(index) {
        var yulan = {
            index: index,
            listimg: $scope.listimg,
            list: $scope.list
        }
        sessionStorage.setItem("imgyulan", JSON.stringify(yulan));
        $state.go("tpyulan");
    }
    $rootScope.$on('tpyulan', function(event, yulan) {
        $scope.listimg = yulan.listimg;
        $scope.list = yulan.list;
    });
    var openid = sessionStorage.getItem("openId");
    var filter = { openid: openid };
    var config = {
            params: filter
        }
        //获取用户昵称
        // $scope.getnicheng = function(){
        //     XywyService.query("/querynicheng", config).then(function (response) {
        //         if (response.data) {
        //             $scope.nicheng = response.data.name;
        //             $scope.touxiang = response.data.imgurl;
        //         } else {
        //             $scope.nicheng = "匿名用户";
        //             $scope.touxiang ="img/hz.png"
        //         }
        //     });
        // }
        // $scope.getnicheng();
    var txNc = UserInfoService.getTxNc();
    $scope.touxiang = txNc.tx;
    $scope.nicheng = txNc.nc;



    $scope.tijiaoclick = function() {
        var param = {};
        param.pictureList = [];
        // if($scope.hidename){
        //     param.username = "匿名用户";
        //     param.usertouxiang = "img/hz.png";
        // }else{

        // }
        param.usertouxiang = $scope.touxiang;
        param.username = $scope.nicheng;
        param.qId = $scope.qzid
        param.tId = $scope.tziid
        param.userId = sessionStorage.getItem("openId");
        var textare = document.getElementById("textares");
        for (var i = 0; i < $scope.listimg.length; i++) {
            param.pictureList.push({ picture: $scope.listimg[i], shunxu: (i + 1) })
        }

        var tucaovalue = textare.value;
        // if(tucaovalue.length>75){
        //     param.hfnr = tucaovalue.substring(0,75)+"...";

        // }else{
        //     param.hfnr = tucaovalue;
        // }
        param.hfnr = tucaovalue;
        param.hflx = "pl"
        XywyService.save('/jkq/setpinglun', param)
            .then(function(res) {
                if (res) {
                    $ionicLoading.show({
                        template: '提交成功，感谢您的评论！',
                    });
                    // 清除当前输入信息以及图片信息

                    $timeout(function() {
                        $ionicLoading.hide();
                        $scope.listimg = [];
                        $scope.pictureindex = [];
                        textare.value = "";
                        var param = {};
                        $scope.issubmit = false
                        javascript: history.go(-1);
                    }, 500);
                } else {
                    $ionicLoading.show({
                        template: '提交失败，请重试！',
                    });
                    $timeout(function() {
                        $ionicLoading.hide(); //由于某种原因3秒后关闭弹出
                    }, 2000);
                }
            });
    }

})

//写帖子
.controller('writePostC', function(wxApi, $ionicViewSwitcher, $scope, $http, $state, $stateParams, $timeout, XywyService, Popup, Outlet, $ionicScrollDelegate, audioControl, $window, $rootScope, geoLocation, $ionicPopup, Upload, $timeout, $ionicModal, $ionicLoading,UserInfoService) {
    var c = 750; // 基准宽度,取的是iphone6
    var b = document.getElementsByTagName('html')[0];
    var f = b.getBoundingClientRect().width / c;
    b.style.fontSize = f + 'rem';
    $scope.reloadRoute = function() {
        $window.location.reload();
    };
    $scope.issubmit = false
    if ($stateParams.qzid) {
        $scope.qzname = $stateParams.qzname
        $scope.qid = $stateParams.qzid
    } else {
        $scope.qzname = "选择圈子";
        $scope.qid = ""

    }
    $ionicModal.fromTemplateUrl('templates/modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        //   console.log(modal,"9999")
        $scope.modal = modal;

    });
    $scope.$on("$destroy", function() {
        // console.log(modal,"9999")
        if ($scope.modal) {
            $scope.modal.remove();
        }
    });
    var configs = {};
    configs.userid = sessionStorage.getItem("openId");
    //获取圈子列表
    $scope.getjkqnotfollowedlist = function() {
        XywyService.save("/jkq/getquanzilist", configs)
            .then(function(data) {
                $scope.notfollowedlist = data.data;
                config.mygz = null
            }).catch(function(err) {
                console.log(err)
            })
    }

    $scope.chooseqz = function(id, name) {
            $scope.qzname = name;
            $scope.qid = id;
            $scope.modal.hide();
            if (textare != '' && $scope.qid != '') {
                $scope.issubmit = true
            }
            if (textare == '' || $scope.qid == "") {
                $scope.issubmit = false
            }
        }
        //点击页面圈子类型加载圈子
    $scope.loadqz = function(qzFl) {
        $scope.data.qzFl = qzFl;
        if (qzFl == "全部") {
            configs.mygz = null
            $scope.getjkqnotfollowedlist()
        }
        if (qzFl == "我加入的") {
            configs.mygz = "gz"
            $scope.getjkqnotfollowedlist()
        }

    };

    $scope.data = { searchSuc: false, keyword: '', qzFl: "全部" };

    $scope.quanZi = [{ mc: "全部" }, { mc: "我加入的" }];

    $scope.getjkqnotfollowedlist();
    //判断手机类型
    $scope.isIos = false;
    if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
        $scope.isIos = true;
    }
    //返回上一页
    $scope.goBack = function() {
        javascript: history.go(-1);

    };
    //文本改变
    $scope.isClick = true;
    $scope.textarCHange = function(textare) {
            $scope.neirong = textare
                // console.log( $scope.neirong,"123")
            if (textare.length > 0 && textare.length <= 500) {
                $scope.isClick = false;

            } else {
                $scope.isClick = true;
            }
            if ($scope.neirong != '' && $scope.qid != '') {
                $scope.issubmit = true
            }
            if ($scope.neirong == '' || $scope.qid == "") {
                $scope.issubmit = false
            }

        }
        //标题文本长度
    $scope.title = ""
    $scope.wordLen = "0";
    $scope.istitle = true
    $scope.neirong = ""
    $scope.titleChange = function(title) {
            $scope.wordLen = title.length;
            $scope.title = title
        }
        //健康圈的写帖子的图片的上传
    $scope.listimg = [];
    $scope.listimgname = [];
    $scope.list = [];
    //图片顺序列表
    $scope.pictureindex = [];
    var openid = sessionStorage.getItem("openId");
    var filter = { openid: openid };
    var config = {
            params: filter
        }
        //获取用户昵称
        // $scope.getnicheng = function() {
        //     XywyService.query("/querynicheng", config).then(function(response) {
        //         if (response.data) {
        //             $scope.nicheng = response.data.name;
        //             $scope.touxiang = response.data.imgurl;
        //         } else {
        //             $scope.nicheng = "匿名用户";
        //             $scope.touxiang = "img/hz.png"
        //         }
        //     });
        // }
        // $scope.getnicheng()

    var txNc = UserInfoService.getTxNc();
    $scope.touxiang = txNc.tx;
    $scope.nicheng = txNc.nc;

    //添加图片
    $scope.upload = function(files) {
        if (!files) {
            return false;
        }
        if (files.length > 6) {
            files = files.slice(0, 6);
        }
        var data = {};
        //                 data.file = files;
        data.staffCode = sessionStorage.getItem("openId");
        data.files = files;
        Upload.upload({
            url: myConfig.serverUrl + '/baocunimg',
            data: data
        }).success(function(response) {
            if (response) {
                for (var i = 0; i < response.length; i++) {
                    if ($scope.list.length < 6) {
                        $scope.list.push(response[i]);
                        if ($scope.listimg.length > 0) {
                            $scope.listimg[$scope.listimg.length] = response[i].backpath;
                            $scope.listimgname[$scope.listimgname.length] = response[i].fileName;
                        } else {
                            $scope.listimg[0] = response[i].backpath;
                            $scope.listimgname[0] = response[i].fileName;
                        }
                    }
                }
            }
        }).error(function(file) {
            //上传失败
            console.log(file);
        });

    };

    //是否匿名事件
    // $scope.hidename = true;
    // $scope.nimingclick = function(){
    // 	($scope.hidename == true) ? ($scope.hidename = false) : ($scope.hidename = true);
    // }
    //提交写帖子页面
    $scope.tijiaoclick = function() {

        var param = {};
        param.pictureList = [];
        // if($scope.hidename){
        //     param.username = "匿名用户";
        //     param.usertouxiang = "img/hz.png";
        // }else{

        // }
        if ($scope.touxiang != null) {
            param.usertouxiang = $scope.touxiang;
        } else {
            param.usertouxiang = "img/hz.png"
        }
        param.username = $scope.nicheng;
        param.qId = $scope.qid
        param.name = $scope.title
        param.userId = sessionStorage.getItem("openId");
        for (var i = 0; i < $scope.listimg.length; i++) {
            param.pictureList.push({ picture: $scope.listimg[i], shunxu: (i + 1) })
        }
        param.neirong = $scope.neirong
        if (param.qId == "") {
            $ionicLoading.show({
                template: '请选择圈子！',
            });

            $timeout(function() {
                $ionicLoading.hide(); //由于某种原因3秒后关闭弹出
            }, 2000);
            return

        }
        // if(title.value.length<5){
        //     $ionicLoading.show({
        //         template: '标题最少5个字符',
        //     });

        //     $timeout(function () {
        //         $ionicLoading.hide(); //由于某种原因3秒后关闭弹出
        //     }, 2000);
        //     return

        // }
        XywyService.save('/jkq/settiezi', param)
            .then(function(res) {
                console.log(res, "123")
                if (res.data.tid) {
                    $ionicLoading.show({
                        template: '发布成功！',
                    });
                    $timeout(function() {
                        if (!$stateParams.qzid) {
                            $scope.qzname = "选择圈子";
                            $scope.qid = '';

                        }
                        $scope.neirong = ""
                        $scope.title = ""
                        textare.value = '';
                        $scope.listimg = [];
                        $scope.pictureindex = [];
                        $scope.issubmit = false
                        var param = {};
                        $ionicLoading.hide(); //由于某种原因3秒后关闭弹出
                        $state.go("postDetail", { tzid: res.data.tid, go: res.data.tid });

                    }, 500);
                    // $scope.reloadRoute()
                } else {
                    var errdata = res.data.errordescription
                    $ionicLoading.show({
                        template: errdata,
                    });

                    $timeout(function() {
                        $ionicLoading.hide(); //由于某种原因3秒后关闭弹出
                    }, 2000);
                }
            });
    }
    $scope.showimg = function(index) {
        var yulan = {
            index: index,
            listimg: $scope.listimg,
            list: $scope.list
        }
        sessionStorage.setItem("imgyulan", JSON.stringify(yulan));
        $state.go("tpyulan");
    }
    $rootScope.$on('tpyulan', function(event, yulan) {
        $scope.listimg = yulan.listimg;
        $scope.list = yulan.list;
    });

})

/**
 * 健康圈关注、发现
 */
.controller('jkqfind', function(wxApi, $ionicViewSwitcher, $scope, $http, $state, $stateParams, $timeout, XywyService, Popup, Outlet, $ionicScrollDelegate, audioControl, $window, $rootScope, geoLocation, $ionicPopup, $ionicLoading) {
        XywyService.getRem(750);

        //判断手机类型
        $scope.isIos = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
        }
        //判断发现页面是否有数据
        // $scope.isfaxiananydata = []
            //判断关注页面是否有数据
        // $scope.isguanzhuanydata = []
            //返回上一页
        $scope.goBack = function() {
            $window.history.back();
        };
        $scope.stopanniu = function() {
            if (isMenuShow) {
                hideMenu();
            }

        }
        var isMenuShow = false;
        var timer;
        // 隐藏菜单
        var hideMenu = function() {
                var floatIcon = document.getElementById('floatIcon');
                if (floatIcon) {
                    //floatIcon.className = 'icon iconfont icon-gengduo';
                    $("#m-body").fadeOut();
                }
                clearTimeout(timer);
                isMenuShow = false;
            }
            // 显示菜单
        var showMenu = function() {
                var floatIcon = document.getElementById('floatIcon');
                if (floatIcon) {
                    // floatIcon.className = 'icon iconfont icon-gengduo-copy';
                    $("#m-body").fadeIn();
                }

            }
            // 点击蓝色圆按钮显示写贴子、查看贴子菜单
        $scope.menuSwitch = function() {
            if (!isMenuShow) {
                isMenuShow = true;
                showMenu()
                    // timer=setTimeout(hideMenu, 5000);
            } else {
                hideMenu();
            }
        };
        //判断是否加入圈子
        $scope.getguanzhulist = function() {
                var filter = {};
                filter.userid = sessionStorage.getItem("openId");
                XywyService.save("/jkq/getgzqzboo", filter)
                    .then(function(data) {
                        $scope.followedqzlist = data.data
                            // console.log($scope.followedqzlist,"111")
                    }).catch(function(err) {
                        console.log(err)
                    });


            }
            //进入圈子详情
        $scope.goquanzi = function(id) {
            $state.go("qzXiangQing", { qzid: id });
        };
        //默认显示发现页面
        $scope.isfind = true;
        //是否关注了圈子
        $scope.isguanzhu = true;
        //点击发现按钮
        $scope.clickfind = function() {
                $scope.ishuanyihuan = true;
                index = 0;
                $scope.hasmore = true;
                fiter.num = 0;
                $scope.isfind = true;
                $scope.itemfaxianjiazai = [];
                $scope.itemguanzhujiazai = [];
                $scope.getfindlist();
                if( $scope.isIos){
                    $("#shouye").css("top","140px")
                }else{
                    $("#shouye").css("top","188px")
                }
                // console.log(  $scope.itemfaxianjiazai.length,"090" )
                // console.log( $scope.hasmore,"091" )
            }
            //写帖子
        $scope.xietiezi = function() {
                $state.go("writePost");
            }
            //进入已参与话题
        $scope.goparticipate = function() {
                $state.go("jkqparticipate");
            }
            //点击进入圈子广场
        $scope.goquanziguangchang = function() {
            $state.go("qzGuangChang");
        }
        $scope.itemfaxianjiazai = [];
        $scope.itemguanzhujiazai = [];
        var openId = sessionStorage.getItem("openId");
        var fiter = {}
        fiter.userid = sessionStorage.getItem("openId");
        fiter.num = 0;
        //获取健康圈首页发现页面信息
        $scope.getfindlist = function() {
                XywyService.save("/jkq/shouye", fiter)
                    .then(function(data) {
                        $scope.jkqfindlist = data.data;
                        if (fiter.num == 0) {
                            $scope.isfaxiananydata = $scope.jkqfindlist.tzList
                        }
                        for (var i = 0; i < $scope.jkqfindlist.tzList.length; i++) {
                            $scope.itemfaxianjiazai.push($scope.jkqfindlist.tzList[i])
                        }
                        if ($scope.itemfaxianjiazai.length < 20 * (index + 1)) {
                            $scope.hasmore = false;
                        } else {
                            $scope.hasmore = true;
                        }
                       
                        $scope.qzlist = $scope.jkqfindlist.qzList.slice(0, 2)
                    }).catch(function(err) {
                        console.log(err)
                    })
            }
            //获取健康圈首页关注已关注页面信息
        $scope.getjkqfollowedlist = function() {
                XywyService.save("/jkq/guanzhu", fiter)
                    .then(function(data) {
                        $scope.followedlist = data.data;
                        for (var i = 0; i < $scope.followedlist.length; i++) {
                            $scope.itemguanzhujiazai.push($scope.followedlist[i])
                        }
                        if ($scope.followedqzlist) {
                            $scope.isfind = false;
                            $scope.isguanzhu = true;
                        } else {
                            $scope.isfind = false;
                            $scope.isguanzhu = false;
                            $scope.getjkqnotfollowedlist();
                        }
                        if ($scope.itemguanzhujiazai.length < 20 * (index + 1)) {
                            $scope.hasmore = false;
                        }
                        if (fiter.num == 0) {
                            $scope.isguanzhuanydata = $scope.followedlist
                        }
                        // console.log($scope.followedlist,"991")
                    }).catch(function(err) {
                        console.log(err)
                    })
            }
            //获取健康圈首页关注未关注页面信息
        $scope.getjkqnotfollowedlist = function() {
                XywyService.save("/jkq/getquanzilist", fiter)
                    .then(function(data) {
                        $scope.notfollowedlist = data.data;
                    }).catch(function(err) {
                        console.log(err)
                    })
            }
            //点击关注按钮
        $scope.clickguanzhu = function() {
                index = 0;
                $scope.hasmore = true;
                fiter.num = 0;
                $scope.itemfaxianjiazai = [];
                $scope.itemguanzhujiazai = [];
                $scope.getjkqfollowedlist();
                if( $scope.isIos){
                    $("#shouye").css("top","44px")
                }else{
                    $("#shouye").css("top","98px")
                }

            }
            //判断换一换是否展示
        $scope.ishuanyihuan = true;
        $state.batchindex = 2
            //换一批
        $scope.batch = function() {
                if ($state.batchindex >= $scope.jkqfindlist.qzList.length) {
                    $scope.ishuanyihuan = false;
                } else {
                    $scope.qzlist = $scope.jkqfindlist.qzList.slice($state.batchindex, $state.batchindex + 2)
                    $state.batchindex = $state.batchindex + 2
                }

            }
            //添加关注圈子
        $scope.setuserquanzi = function(id, num) {
                var juq = {}
                juq.userid = openId;
                juq.qid = id;
                juq.sxbz = num;
                XywyService.save("/jkq/setuserquanzi", juq)
                    .then(function(data) {
                        if (num == 1) {
                            $ionicLoading.show({
                                template: '已加入！',
                            });
                        } else {
                            $ionicLoading.show({
                                template: '取消加入！',
                            });
                        }
                        $timeout(function() {
                            $ionicLoading.hide();
                            $scope.getguanzhulist();
                            $scope.getjkqfollowedlist();
                        }, 2000)


                    }).catch(function(err) {
                        console.log(err)
                    })
            }
            //添加关注圈子,取消关注
        $scope.add_quanZi = function(id, shifoujiaru) {
            if (shifoujiaru == 0) {
                var num = 1;
                for (var i = 0; i < $scope.notfollowedlist.length; i++) {
                    if ($scope.notfollowedlist[i].id == id) {
                        $scope.notfollowedlist[i].shifoujiaru = "1";
                        break;
                    }
                }
                $scope.setuserquanzi(id, num)

            } else {
                var num = 0;
                for (var i = 0; i < $scope.notfollowedlist.length; i++) {
                    if ($scope.notfollowedlist[i].id == id) {
                        $scope.notfollowedlist[i].shifoujiaru = "0";
                        break;
                    }
                }
                $scope.setuserquanzi(id, num)

            }

        };
        //刷新发现列表
        $scope.findRefresh = function() {
            fiter.num = 0;
            $scope.itemfaxianjiazai = [];
            $scope.itemguanzhujiazai = [];
            index = 0;

            $scope.getfindlist();
            $scope.$broadcast('scroll.refreshComplete');
            $scope.hasmore =false;
        };
        //刷新关注列表
        $scope.guanzhuRefresh = function() {
                fiter.num = 0;
                $scope.itemfaxianjiazai = [];
                $scope.itemguanzhujiazai = [];
                index = 0;
                $scope.hasmore =false;
                $scope.getjkqfollowedlist();
                $scope.$broadcast('scroll.refreshComplete');
            }
            //刷新未关注列表
        $scope.noguanzhuRefresh = function() {
            $scope.getjkqnotfollowedlist();
            $scope.$broadcast('scroll.refreshComplete');
        }
        $scope.init = function(){
                $scope.getfindlist();
                $scope.getguanzhulist();
        }
       
        //加载更多
        $scope.hasmore = true;
        var index = 0;
        $scope.loadMore = function() {
            $timeout(function() {
                index++
                fiter.num = index;
                if ($scope.isfind) {
                    $scope.getfindlist();
                }
                if (!$scope.isfind && $scope.isguanzhu) {
                    $scope.getjkqfollowedlist();
                }

                $scope.$broadcast('scroll.infiniteScrollComplete');
            }, 1500)


        };
        $scope.init()
    })
    /**
     * 健康圈图片预览
     */
    .controller('jkqimgyulan', function(wxApi, $ionicViewSwitcher, $scope, $http, $state, $stateParams, $timeout, XywyService, Popup, Outlet, $ionicScrollDelegate, audioControl, $window, $rootScope, geoLocation) {
        XywyService.getRem(750);

        //判断手机类型
        $scope.isIos = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
        }

        //返回上一页
        $scope.goBack = function() {
            $window.history.back();
        };
        $scope.listimg = angular.fromJson($stateParams.list);
        $scope.list = angular.fromJson($stateParams.list);
        $scope.indeximg = parseInt($stateParams.curindex);

        //      向左滑动或点击上一页图标
        $scope.shangyiye = function() {
                //        	当$index为0时滑动事件不执行上一页操作
                if ($scope.indeximg == 0) {
                    return;
                }
                $scope.indeximg = $scope.indeximg - 1;
            }
            //        向右滑动或点击下一页图片执行的方法
        $scope.xiayiye = function() {
                if ($scope.indeximg == $scope.list.length - 1) {
                    return;
                }
                $scope.indeximg = $scope.indeximg + 1;
            }
            //      延迟隐藏标题  
        $scope.isshow = true;
        $timeout(function() {
            $scope.isshow = false;
        }, 3000);
        //        显示标题（删除和返回）
        $scope.showtitle = function() {
            $scope.isshow = !$scope.isshow;
        }
    })
    /**
     * 已参与话题
     */
    .controller('jkqparticipate', function(wxApi, $ionicViewSwitcher, $scope, $http, $state, $stateParams, $timeout, XywyService, Popup, Outlet, $ionicScrollDelegate, audioControl, $window, $rootScope, geoLocation) {
        XywyService.getRem(750);

        //判断手机类型
        $scope.isIos = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
        }

        //返回上一页
        $scope.goBack = function() {
            $window.history.back();
        };
        //判断是否有数据
        // $scope.isanydata = [];
        //默认显示回复页面
        $scope.isreturn = false;
        $scope.isrelease = true;
        $scope.iscollect = false;
        //点击回复按钮
        $scope.clickreturn = function() {
                index = 0;
                fiter.num = 0;
                $scope.hasmore = true;
                $scope.isreturn = true;
                $scope.isrelease = false;
                $scope.iscollect = false;
                fiter.lx = "hf"
                $scope.itemparticipatelist = [];
                $scope.getjkqparticipatelist()
            }
            //点击发布按钮
        $scope.clickrelease = function() {
                index = 0;
                fiter.num = 0;
                $scope.hasmore = true;
                $scope.isreturn = false;
                $scope.isrelease = true;
                $scope.iscollect = false;
                fiter.lx = "fb"
                $scope.itemparticipatelist = [];
                $scope.getjkqparticipatelist()

            }
            //点击评论按钮
        $scope.clickcollect = function() {
                index = 0;
                fiter.num = 0;
                $scope.hasmore = true;
                $scope.isreturn = false;
                $scope.isrelease = false;
                $scope.iscollect = true;
                fiter.lx = "pl"
                $scope.itemparticipatelist = [];
                $scope.getjkqparticipatelist()

            }
        //点击进入健康圈
        $scope.gojkq = function() {
            $state.go("jiankangquan");
        }
            //数据加载更多数组
        $scope.itemparticipatelist = [];
        var fiter = {}
        fiter.userid = sessionStorage.getItem("openId");
        fiter.num = 0;
        //获取已参与话题列表
        $scope.getjkqparticipatelist = function() {
            XywyService.save("/jkq/mytiezilist", fiter)
                .then(function(data) {
                    $scope.participatelist = data.data;
                    if(data.data.tzlist!=null){
                        $scope.participatetizilist = $scope.participatelist.tzlist
                        for (var i = 0; i < $scope.participatetizilist.length; i++) {
                            $scope.itemparticipatelist.push($scope.participatetizilist[i])
                        }
                    }else{
                        $scope.participatetizilist = [];
                    }
                   
                    if ($scope.itemparticipatelist.length < 20 * (index + 1)) {
                        $scope.hasmore = false;
                    }
                    if (fiter.num == 0 && fiter.lx == "fb") {
                        $scope.isanydata = $scope.participatetizilist
                    }
                    if (fiter.num == 0 && fiter.lx == "pl") {
                        $scope.isscanydata = $scope.participatetizilist
                    }
                    if (fiter.num == 0 && fiter.lx == "hf") {
                        $scope.ishfanydata = $scope.participatetizilist
                    }
                    $scope.participatecountlist = $scope.participatelist.count
                        // console.log($scope.participatelist,"990")
                }).catch(function(err) {
                    console.log(err)
                })
        }
        $scope.clickrelease();
        //刷新
        $scope.huifuRefresh = function() {
            fiter.lx = "hf"
            fiter.num = 0;
            index = 0
            $scope.hasmore = true;
            $scope.itemparticipatelist = [];
            $scope.getjkqparticipatelist()
            $scope.$broadcast('scroll.refreshComplete');
        };
        $scope.fabuRefresh = function() {
            fiter.lx = "fb"
            fiter.num = 0;
            index = 0
            $scope.hasmore = true;
            $scope.itemparticipatelist = [];
            $scope.getjkqparticipatelist()
            $scope.$broadcast('scroll.refreshComplete');
        }
        $scope.shoucangRefresh = function() {
                fiter.lx = "pl"
                fiter.num = 0;
                index = 0
                $scope.hasmore = true;
                $scope.itemparticipatelist = [];
                $scope.getjkqparticipatelist()
                $scope.$broadcast('scroll.refreshComplete');
            }
            //加载更多
        var index = 0;
        $scope.hasmore = true;
        $scope.loadMore = function() {
            $timeout(function() {
                index++
                fiter.num = index;
                if ($scope.isreturn) {
                    fiter.lx = "hf"
                    if ($scope.ishfanydata.length < 20) {
                        $scope.hasmore = false
                        return
                    }
                    $scope.getjkqparticipatelist()
                }
                if ($scope.isrelease) {
                    fiter.lx = "fb"
                    if ($scope.isanydata.length < 20) {
                        $scope.hasmore = false
                        return
                    }
                    $scope.getjkqparticipatelist()
                }
                if ($scope.iscollect) {
                    fiter.lx = "pl"
                    if ($scope.isscanydata.length < 20) {
                        $scope.hasmore = false
                        return
                    }
                    $scope.getjkqparticipatelist()
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }, 1500)

        };

    })
    //评论回复
    .controller('jkqpinglunrelay', function(wxApi, $ionicViewSwitcher, $scope, $http, $state, $stateParams, $timeout, XywyService, Popup, Outlet, $ionicScrollDelegate, audioControl, $window, $rootScope, geoLocation, Upload, $timeout, $ionicLoading,UserInfoService) {
        var c = 750; // 基准宽度,取的是iphone6
        var b = document.getElementsByTagName('html')[0];
        var f = b.getBoundingClientRect().width / c;
        b.style.fontSize = f + 'rem';
        $scope.qlid = $stateParams.qlid;
        $scope.tziid = $stateParams.tziid;
        console.log($scope.qlid, "123")
            //判断手机类型
        $scope.isIos = false;
        $scope.issubmit = false
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
        }

        //返回上一页
        $scope.goBack = function() {
            $window.history.back();
        };
        $scope.isClick = true;
        $scope.textarCHange = function(textare) {
                if (textare.length > 0 && textare.length <= 500) {
                    $scope.isClick = false;
                } else {
                    $scope.isClick = true;
                }
                var textare = document.getElementById("textares");
                if (textare != "") {
                    $scope.issubmit = true
                }
                if (textare == '') {
                    $scope.issubmit = false
                }
            }
            //是否匿名事件
            // $scope.hidename = true;
            // $scope.nimingclick = function(){
            // 	($scope.hidename == true) ? ($scope.hidename = false) : ($scope.hidename = true);
            // }
        var openid = sessionStorage.getItem("openId");
        var filter = { openid: openid };
        var config = {
                params: filter
            }
            //获取用户昵称
            // $scope.getnicheng = function() {
            //     XywyService.query("/querynicheng", config).then(function(response) {
            //         if (response.data) {
            //             $scope.nicheng = response.data.name;
            //             $scope.touxiang = response.data.imgurl;
            //         } else {
            //             $scope.nicheng = "匿名用户";
            //             $scope.touxiang = "img/hz.png"
            //         }
            //     });
            // }
            // $scope.getnicheng()

        var txNc = UserInfoService.getTxNc();
        $scope.touxiang = txNc.tx;
        $scope.nicheng = txNc.nc;

        $scope.tijiaoclick = function() {
            var param = {};
            // if($scope.hidename){
            //     param.username = "匿名用户";
            //     param.usertouxiang = "img/hz.png";
            // }else{
            // }
            param.usertouxiang = $scope.touxiang
            param.username = $scope.nicheng;
            param.qId = $scope.qlid
            param.tId = $scope.tziid
            if ($stateParams.name) {
                param.hfusername = $stateParams.name
                param.hfuserId =  $stateParams.hfuserId
            }
            param.userId = sessionStorage.getItem("openId");
            var textare = document.getElementById("textares");
            var tucaovalue = textare.value;
            // if(tucaovalue.length>75){
            //     param.hfnr = tucaovalue.substring(0,75)+"...";

            // }else{
            //     param.hfnr = tucaovalue;
            // }
            param.hfnr = tucaovalue;
            param.hflx = "hf"
            XywyService.save('/jkq/setpinglun', param)
                .then(function(res) {
                    if (res) {
                        $ionicLoading.show({
                            template: '提交成功，谢谢您的回复！',
                        });
                        // 清除当前输入信息以及图片信息

                        $timeout(function() {
                            $ionicLoading.hide() //由于某种原因3秒后关闭弹出
                            textare.value = "";
                            $scope.issubmit = false
                            javascript: history.go(-1);
                        }, 500);
                    } else {
                        $ionicLoading.show({
                            template: '提交失败',
                        });

                        $timeout(function() {
                            $ionicLoading.hide() //由于某种原因3秒后关闭弹出
                        }, 2000);
                    }
                });
        }

    })