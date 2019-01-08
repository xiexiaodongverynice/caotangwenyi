angular.module('starter.jiaTingJKDAControllers', ['ionic'])
    //档案编辑页
    .controller('dangAnEditC', function ($scope, $state, $stateParams, XywyService, Popup, $window, JsUtil, TimeXuanZe, Upload, UserInfoService, $http,$ionicLoading, $timeout) {
        $scope.isIos = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
            sessionStorage.setItem('isIos', $scope.isIos);
        }
        var id = $stateParams.id; //地址栏参数idx
        //提交数据
        $scope.subData = {
            userid: sessionStorage.getItem("openId")
        };
        // 家庭关系数据
        var guanXiDataList = [];


        // 手机号是否正确
        var mobileIsVali = true;

        // 表单验证
        $scope.valiForm = function () {
            var formFlag = false;
            if (id) {
                if ($scope.self == "1" && $scope.subData.xingMing && $scope.subData.shouJiHao && mobileIsVali) {
                    formFlag = true;
                }
                if ($scope.self == "0" && $scope.subData.xingMing) {
                    formFlag = true;
                }

            } else {
                var niCheng = dangAn.niCheng.value;
                var birthday = dangAn.birthday.value;
                var height = dangAn.height.value;
                if ($scope.self == "1") {
                    var xingBie = dangAn.xingBie.value;
                    var address = dangAn.address.value;
                    var mobile = dangAn.mobile.value;
                    if (niCheng && xingBie && birthday && height && address && mobile && mobileIsVali) {
                        formFlag = true;
                    }
                }
                 else {
                    var guanXi = dangAn.guanXi.value;
                    if (niCheng && guanXi && birthday && height) {
                        formFlag = true;
                    }
                }
            }
            $("#submit").attr('disabled', !formFlag); //提交按钮是否禁用（表单验证失败-禁用，反之启用）
        };
        // ios手机输入时让input滚动到视野
        $scope.mobileClick = function (event) {
            if ( $scope.isIos) {
                var target = event.target;
                setTimeout(function () {
                    target.scrollIntoView(false);
                }, 20);
            }

        };
        // 检测手机号
        $scope.checkMobile = function () {
            var mobile = dangAn.mobile.value;
            if (JsUtil.verifyMobile(mobile)) {
                mobileIsVali = true;
                $scope.valiForm();
            } else {
                mobileIsVali = false;
                $("#submit").attr('disabled', true);
            }

        }
        // 手机号不正确提示
        $scope.mobileDoTip = function () {
            if (!mobileIsVali) {
                Popup.alert("手机号不正确！");
            }
        }


        // 页面标题
        $scope.self = $stateParams.self; //地址栏参数id 
        if ($scope.self === "1") {
            $scope.title = "完善个人信息";
        } else {
            $scope.title = "添加家人";
        }
        $scope.imgurl = "img/hz.png"; //用户默认头像
        if ($scope.self == "1") {
            var txNc = UserInfoService.getTxNc();
            $scope.imgurl = txNc.tx;
            $scope.subData.xingMing = txNc.nc;
        }
        //获取原数据
        $scope.getqueryGeRenxq = function(){
            $timeout(function () {  
                $scope.$apply(function () {  
                    if (id) {
                        localStorage.setItem('cyid', id);
                        var para = {
                            id: id
                        }
                        // 如果id不会空、查询数据
                        XywyService.query("/queryGeRenxq", {
                                params: para
                            })
                            .then(function (response) {
                                // $ionicLoading.show();
                                $scope.subData = response.data;
                                if ($scope.subData.chuShengRiQi) {
                                    var dateArr = $scope.subData.chuShengRiQi.split("/");
                                    var birthdayInput = document.getElementById('birthday');
                                    birthdayInput.setAttribute('data-year', dateArr[0]);
                                    birthdayInput.setAttribute('data-month', dateArr[1]);
                                    birthdayInput.setAttribute('data-date', dateArr[2]);
            
                                }
                                $scope.valiForm();
                            //    $timeout(function(){
                            //         $ionicLoading.hide();
                            //     },2000)  
                            }, Popup.alert);
                    }

                });  
             
            }, 500);
        }
          
        
         //    查询字典（里面包含病史、关系）
        $scope.getqueryzidian = function(){
                XywyService.query("/queryzidian")
                .then(function (data) {
                    // $ionicLoading.show();
                    $scope.zidian = data.data;
                    if (id && $scope.subData.jiaZuShi) {
                        var jzsStr = $scope.subData.jiaZuShi;
                        if ($scope.zidian.jzslist) {
                            for (var i = 0; i < $scope.zidian.jzslist.length; i++) {
                                if (jzsStr.indexOf($scope.zidian.jzslist[i].CODE) != -1) {
                                    $scope.zidian.jzslist[i].chose = true;
                                }
                            }
                        }
                    }
                    if (id && $scope.subData.geRenBingShi) {
                        var jzsStr = $scope.subData.geRenBingShi;
                        if ($scope.zidian.jzslist) {
                            for (var i = 0; i < $scope.zidian.grbslist.length; i++) {
                                if (jzsStr.indexOf($scope.zidian.grbslist[i].CODE) != -1) {
                                    $scope.zidian.grbslist[i].chose = true;
                                }
                            }
                        }
                    }
                    if (id && $scope.subData.yaoWuGms) {
                        var jzsStr = $scope.subData.yaoWuGms;
                        if ($scope.zidian.jzslist) {
                            for (var i = 0; i < $scope.zidian.yaowulist.length; i++) {
                                if (jzsStr.indexOf($scope.zidian.yaowulist[i].CODE) != -1) {
                                    $scope.zidian.yaowulist[i].chose = true;
                                }
                            }
                        }
                    }
                    if ($scope.subData.shiWuGms) {
                        var jzsStr = $scope.subData.shiWuGms;
                        if ($scope.zidian.jzslist) {
                            for (var i = 0; i < $scope.zidian.shiwulist.length; i++) {
                                if (jzsStr.indexOf($scope.zidian.shiwulist[i].CODE) != -1) {
                                    $scope.zidian.shiwulist[i].chose = true;
                                }
                            }
                        }
                    }
                    //设置病史项目选择情况
                    if ($scope.subData.huanJingGms) {
                        var jzsStr = $scope.subData.huanJingGms;
                        if ($scope.zidian.jzslist) {
                            for (var i = 0; i < $scope.zidian.huanjinglist.length; i++) {
                                if (jzsStr.indexOf($scope.zidian.huanjinglist[i].CODE) != -1) {
                                    $scope.zidian.huanjinglist[i].chose = true;
                                }
                            }
                        }
                    }
                    // 组织iosSelect关系数据
                    if ($scope.zidian.jtgxlist.length > 0) {
                        for (var i = 0; i < $scope.zidian.jtgxlist.length; i++) {
                            var item = $scope.zidian.jtgxlist[i];
                            var gxObj = {
                                'id': item.CODE,
                                'value': item.CODE_NAME
                            };
                            guanXiDataList.push(gxObj);
                        }
                        // 关系选择
                        var guanXiDom = $('#guanXi');
                        guanXiDom.bind('click', function () {
                            var guanXiData = guanXiDom.attr("data-gx");
                            var iosSelect = new IosSelect(1, [guanXiDataList], {
                                title: '关系选择',
                                itemHeight: 35,
                                relation: [1, 1],
                                oneLevelId: guanXiData,
                                callback: function (selectOneObj) {
                                    guanXiDom.attr("data-gx", selectOneObj.id);
                                    $scope.subData.guanXi = selectOneObj.id;
                                    guanXiDom.val(selectOneObj.value);
                                    $scope.valiForm();
                                }
                            });
                        });
                    }
                    //  $timeout(function(){
                    //     $ionicLoading.hide();
                    // },2000)
                }, Popup.alert);

        }



       
        //  返回按钮
        $scope.goBack = function () {
            $window.history.back();
        };

        // 点击头像触发input=type
        $scope.tackImgClick = function () {
            document.getElementById("cameraInput").click();
        };

        //上传头像
        $scope.upload = function (files) { //上传头像
            if (!files) {
                return false;
            }
            if (files.length > 10) {
                files = files.slice(0, 10);
            }
            var data = {};
            data.staffCode = sessionStorage.getItem("openId");
            data.files = files;

            Upload.upload({
                url: myConfig.serverUrl + '/baocunimg',
                data: data
            }).success(function (response) {
                if (response && response.length > 0) {
                    $scope.subData.imgUrl = response[0].backpath;

                }
            }).error(function (file) {
                //上传失败
                //console.log(file);
                Popup.alert('上传失败！');
            });
        };

        //日期控件加载
        $scope.datePiker = function (id) {
            TimeXuanZe.datePiker(id);
        };


        // 表单操作
        var niCheng = $('#niCheng');
        niCheng.bind('blur', function () {
            $scope.valiForm();
        });

        // 身高选择
        var heightDom = $('#height');
        var heightDataList = [];
        for (var i = 60; i < 250 + 1; i++) {
            var agenumobj = {
                'id': i,
                'value': i
            };
            heightDataList.push(agenumobj);
        }
        // heightDom.bind('click', );
        $scope.heightClick = function () {
            var heightData = $scope.subData.shenGao;
            if (!heightData) {
                heightData = 170;
            }
            var iosSelect = new IosSelect(1, [heightDataList], {
                title: '身高选择(cm)',
                itemHeight: 35,
                relation: [1, 1],
                oneLevelId: heightData,
                callback: function (selectOneObj) {
                    $scope.subData.shenGao = selectOneObj.value;
                    heightDom.val(selectOneObj.value);
                    $scope.valiForm();
                }
            });
           
        }

        //   同步 查询省、市、区/县数据
        var iosProvinces, iosCitys, iosCountys;
        // jqueryService.ajax("/queryjtjkcity", null, false)
        //     .then(function (response) {
        //         var data = JSON.parse(response);
        //         console.log(response)
        //         iosProvinces = data.sheng;
        //         iosCitys = data.shi;
        //         iosCountys = data.qu;
        //     }, Popup.alert);
        $scope.getcitydata = function(){
            $http.get('js/city.json').then(
                function (response) {
                    // $scope.show()
                    var data = response.data
                    iosProvinces = data.sheng;
                    iosCitys = data.shi;
                    iosCountys = data.qu;
                    // $timeout(function(){
                    //     $ionicLoading.hide();
                    // },2000)
                }, Popup.alert
            );
        }
           

        // 地址三级选择（省、市、区/县）
        $scope.addressClick = function (event) {
            var selectContactDom = $('#address');
            var showContactDom = $('#address');
            var contactProvinceCodeDom = $('#contact_province_code');
            var contactCityCodeDom = $('#contact_city_code');
            var sccode = showContactDom.attr('data-city-code');
            var scname = showContactDom.attr('data-city-name');
            var oneLevelId = showContactDom.attr('data-province-code');
            var twoLevelId = showContactDom.attr('data-city-code');
            var threeLevelId = showContactDom.attr('data-district-code');
            var iosSelect = new IosSelect(3, [iosProvinces, iosCitys, iosCountys], {
                title: '地区选择',
                itemHeight: 35,
                relation: [1, 1],
                oneLevelId: oneLevelId,
                twoLevelId: twoLevelId,
                threeLevelId: threeLevelId,
                callback: function (selectOneObj, selectTwoObj, selectThreeObj) {
                    contactProvinceCodeDom.val(selectOneObj.id);
                    contactProvinceCodeDom.attr('data-province-name', selectOneObj.value);
                    contactCityCodeDom.val(selectTwoObj.id);
                    contactCityCodeDom.attr('data-city-name', selectTwoObj.value);
                    showContactDom.attr('data-province-code', selectOneObj.id);
                    showContactDom.attr('data-city-code', selectTwoObj.id);
                    showContactDom.attr('data-district-code', selectThreeObj.id);
                    showContactDom.val(selectOneObj.value + ' ' + selectTwoObj.value + ' ' + selectThreeObj.value);
                    $scope.subData.sheng = selectOneObj.id;
                    $scope.subData.shi = selectTwoObj.id;
                    $scope.subData.qu = selectThreeObj.id;
                }
            });
        }



        // 病史项目点击
        $scope.selectOption = function (type, index, item) {
            var ncInput = document.getElementById("niCheng");
            if (ncInput) {
                ncInput.blur();
            }
            var mbInput = document.getElementById("mobile");
            if (mbInput) {
                mbInput.blur();
            }
            var list = null;
            switch (type) {
                case "jzs":
                    list = $scope.zidian.jzslist;
                    break;
                case "grs":
                    list = $scope.zidian.grbslist;
                    break;
                case "ywgms":
                    list = $scope.zidian.yaowulist;
                    break;
                case "swgms":
                    list = $scope.zidian.shiwulist;
                    break;
                case "hjgms":
                    list = $scope.zidian.huanjinglist;
                    break;

            }

            if (list[index].chose)
                list[index].chose = false;
            else
                list[index].chose = true;
        };
        if (!$scope.subData.xingBie) {
            $scope.subData.xingBie = 1;
        }

        //更新儿童疫苗时间
        $scope.chengschildtime = function (id, time) {
            var filter = {};
            filter.cyid = id
            filter.birthday = time
            XywyService.save("/etym/updateemjzjllist", filter)
                .then(function (data) {}).catch(function (err) {
                    console.log(err)
                })
        }

        // 表单提交方法
        dangAn.onsubmit = function () {
            var flag = dangAn.checkValidity();
            if (flag) {
                // 病史数据组织
                var jiaZuShi = []; //已选个家族史代码存放数组
                for (var i = 0; i < $scope.zidian.jzslist.length; i++) {
                    if ($scope.zidian.jzslist[i].chose == true) {
                        jiaZuShi.push($scope.zidian.jzslist[i].CODE);
                    }
                }
                var geRenBingShi = []; //已选个人病史代码存放数组
                for (var i = 0; i < $scope.zidian.grbslist.length; i++) {
                    if ($scope.zidian.grbslist[i].chose == true) {
                        geRenBingShi.push($scope.zidian.grbslist[i].CODE);
                    }
                }
                var yaoWuGms = []; //已选药物过敏史代码存放数组
                for (var i = 0; i < $scope.zidian.yaowulist.length; i++) {
                    if ($scope.zidian.yaowulist[i].chose == true) {
                        yaoWuGms.push($scope.zidian.yaowulist[i].CODE);
                    }
                }
                var shiWuGms = []; //已选食物过敏史代码存放数组
                for (var i = 0; i < $scope.zidian.shiwulist.length; i++) {
                    if ($scope.zidian.shiwulist[i].chose == true) {
                        shiWuGms.push($scope.zidian.shiwulist[i].CODE);
                    }
                }
                var huanJingGms = []; //已选环境过敏史代码存放数组
                for (var i = 0; i < $scope.zidian.huanjinglist.length; i++) {
                    if ($scope.zidian.huanjinglist[i].chose == true) {
                        huanJingGms.push($scope.zidian.huanjinglist[i].CODE);
                    }
                }
                // 病史数据转成以,分隔的字符串
                $scope.subData.jiaZuShi = jiaZuShi.join(',');
                $scope.subData.geRenBingShi = geRenBingShi.join(',');
                $scope.subData.yaoWuGms = yaoWuGms.join(',');
                $scope.subData.shiWuGms = shiWuGms.join(',');
                $scope.subData.huanJingGms = huanJingGms.join(',');
                $scope.subData.chuShengRiQi = dangAn.birthday.value;
                //console.log($scope.subData);
                // 提交数据到后台
                var submitUrl;
                if (id) {
                    // 如果有id,提交修改
                    submitUrl = "/updateGeRenXx"

                } else {
                    // 如果没有id,提交插入
                    submitUrl = "/insertGeRenXinXi"
                }
                XywyService.save(submitUrl, $scope.subData)
                    .then(function (data) {
                        $scope.chengschildtime($stateParams.id, $scope.subData.chuShengRiQi)
                        Popup.alert("提交成功！");
                        //手动清除交互缓存
                        if (sessionStorage.getItem("wantTo")) {
                            var wantTo = JSON.parse($window.sessionStorage.getItem("wantTo"));
                            sessionStorage.removeItem("txNc");
                            sessionStorage.removeItem("userInfo");
                            $state.go(wantTo.name, wantTo.para);

                        } else {
                            $state.go("dangAnList");
                            localStorage.setItem('cyid', data.data);
                        }

                    });
            } else {
                return flag;
            }
        };
        //初始化方法
        $scope.init = function(){
            $scope.getcitydata();
            $scope.getqueryzidian();
            $scope.getqueryGeRenxq();
         
          
           
        }
        $scope.$on('$ionicView.enter', function() {
            $ionicLoading.show();
            $timeout(function(){
                $scope.init()
                $ionicLoading.hide();
            },2000)
            
        })
        // $scope.$watch('$viewContentLoaded', function() {  
        //     $scope.init()
        // });  
    })
    //档案列表页
    .controller('dangAnListC', function ($scope, $state, XywyService, Popup, $window, $ionicLoading, JsUtil, $timeout, UserInfoService) {
        $scope.isIos = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
            sessionStorage.setItem('isIos', $scope.isIos);
        }
        $scope.isyimiao = false
        //返回上一页
        $scope.goBack = function () {
            $window.history.back();
        };
        $scope.isjcjyshow = false
        $scope.isshow = false;
        var showIndex = 0;
        //判断是否上传报告超过限制
        $scope.isoverthelimit = false
        $scope.overthelimit = function () {
            var param = {}
            param.openId = sessionStorage.getItem("openId");
            XywyService.save("/tjbgjd/validateProbationNumber", param)
                .then(function (data) {
                    $scope.isoverthelimit = data.data.isAvaliable
                }).catch(function (err) {
                    console.log(err)
                })
        }
        //获取体检报告解读列表页，判断是否上传解读报告
        $scope.getmedicallist = function (id) {
            var fiter = {}
            fiter.type = "1";
            fiter.familyMemberId = id
            XywyService.save("/tjbgjd/getUserTjbgjdStatus", fiter)
                .then(function (data) {
                    $scope.medicallist = data.data.data;
                    $scope.isshow = data.data.uploadFlag;
                }).catch(function (err) {
                    // console.log(err)
                })
        }

        //获取检验检查报告解读列表页，判断是否上传解读报告
        $scope.getjianchajianyanlist = function (id) {
            var fiter = {}
            fiter.type = "2";
            fiter.familyMemberId = id
            XywyService.save("/tjbgjd/getUserTjbgjdStatus", fiter)
                .then(function (data) {
                    $scope.jianchajianyanlist = data.data.data;
                    $scope.isjcjyshow = data.data.uploadFlag;
                }).catch(function (err) {
                    // console.log(err)
                })
        }
        //判断儿童疫苗是否开启
        $scope.getyimiaodata = function (id, time) {
            var fiter = {}
            fiter.cyid = id;
            fiter.birthday = time
            XywyService.save("/etym/pdkq", fiter)
                .then(function (data) {
                    $scope.isyimiao = data.data
                    // console.log($scope.isyimiao, "111")
                    if ($scope.isyimiao) {
                        $scope.gettime(id)
                    }
                }).catch(function (err) {
                    // console.log(err)
                })
        }
        //储存儿童数据
        $scope.getdata = function (id, time) {
            var fiter = {}
            fiter.cyid = id;
            fiter.birthday = time
            XywyService.save("/etym/setbirthdate", fiter)
                .then(function (data) {
                    $state.go('ChildhoodVaccines', {
                        cyid: id,
                        birthday: time
                    });
                }).catch(function (err) {
                    // console.log(err)
                })
        }
        //获取儿童下次疫苗时间
        $scope.gettime = function (id) {
            var fiter = {}
            fiter.cyid = id;
            fiter.all = "0"
            XywyService.save("/etym/getymjzjllist", fiter)
                .then(function (data) {
                    $scope.vaccinesdata = data.data;
                    for (var i = 0; i < $scope.vaccinesdata.length; i++) {
                        $scope.jztime = $scope.vaccinesdata[0].JZSJ
                        var rq = $scope.jztime;
                        var date = rq.split('/');
                        var y = date[0];
                        var m = date[1];
                        if (m.substr(0, 1) == '0') {
                            m = m.substr(1);
                        }
                        var d = date[2];
                        if (d.substr(0, 1) == '0') {
                            d = d.substr(1);
                        }
                        $scope.jztime = y + "年" + m + "月" + d + "日";
                    }
                }).catch(function (err) {
                    // console.log(err)
                })
        }

        //跳转编辑自己
        $scope.gotoEdit = function (event, id, gc) {
            sessionStorage.removeItem("wantTo");
            if (gc == "自己") {
                $state.go("dangAnEdit", {
                    self: "1",
                    id: id
                });
            } else {
                $state.go("dangAnEdit", {
                    self: "0",
                    id: id
                });
            }
            event.stopPropagation(); //阻止事件冒泡
        }
        //跳转功能检测详情页
        $scope.gotoDetail = function (str, id, dom, value) {
            // $scope.overthelimit();
            localStorage.setItem('cyid', id);
            if (dom == 'li' && value == null) {
                return;
            }
            
            if(value){
            	if(str == "zhenliaojilu"){
                	$state.go('zlJiLuList', {
                        id: id
                    });
                }
            }
            
            if (str == "xueya") {
                $state.go('xueya', {
                    id: id
                });
            }
            if (str == "xueTang") {
                $state.go('xueTang', {
                    id: id
                });
            }
            //体重
            if (str == "tiZhong") {
                $state.go('tizhong', {
                    id: id
                });
            }
            if (str == "tiJianBGJD") {
                if ($scope.isshow) {
                    if (dom == 'li') {
                        $state.go('medicallist', {
                            type: '1',
                            id: id
                        });
                    }
                } else {
                    if (dom == 'btn') {

                        if ($scope.isoverthelimit) {
                            $state.go('tiJianBaoGao', {
                                type: '1',
                                id: id
                            })
                        } else {
                            $ionicLoading.show({
                                template: '您的试用次数已用完!',
                            });
                            $timeout(function () {
                                $ionicLoading.hide(); //由于某种原因3秒后关闭弹出
                            }, 2000);
                            return
                        }

                    }
                }
            }
            if (str == 'jianchajianyanBG') {
                if ($scope.isjcjyshow) {
                    if (dom == 'li') {
                        $state.go('medicallist', {
                            type: '2',
                            id: id
                        });
                    }
                } else {
                    if (dom == 'btn') {
                        if ($scope.isoverthelimit) {
                            $state.go('tiJianBaoGao', {
                                type: '2',
                                id: id
                            });
                        } else {
                            $ionicLoading.show({
                                template: '您的试用次数已用完!',
                            });
                            $timeout(function () {
                                $ionicLoading.hide(); //由于某种原因3秒后关闭弹出
                            }, 2000);
                            return
                        }

                    }
                }
            }
            if (str == 'ertongyimiao') {
                if ($scope.isyimiao) {
                    $state.go('ChildhoodVaccines', {
                        cyid: id,
                        birthday: dom
                    });
                } else {
                    return;
                }

            }
            if (str == 'yunQi') {
                if (value == null || JsUtil.isEmpty(value.chanjiantime)) {
                    $state.go('yuChanQiCZ', {
                        userId: id,
                        pid: null
                    });
                } else {
                    $state.go('yuQiHH', {
                        userId: id
                    });
                }
            }

        }

        $scope.goTJBG = function () {
            //体检报告解读
            if ($scope.isshow) {
                $state.go('medicallist');
            } else {
                $state.go('tiJianBaoGao')
            }

        };
        //开启功能
        $scope.openItem = function (str2, id) {
            if (str2 == "xueya") {
                $state.go('xueya', {
                    id: id
                });
            }
            if (str2 == "xueTang") {
                $state.go('xueTang', {
                    id: id
                });
            }
            //体重
            if (str2 == "tiZhong") {
                $state.go('tizhong', {
                    id: id
                });
            }
            if (str2 == "tiJianBGJD") {
                if ($scope.medicallist.length > 0) {
                    $state.go('medicallist');
                } else {
                    $state.go('tiJianBaoGao')
                }
            }

        }
        //伸缩按钮事件        
        $scope.isshowAll = function (index, id, time) {
            if ($scope.ssflag[index] == "show") {
                $scope.ssflag[index] = "hide";
            } else {
                //置所有伸缩位hide
                for (var i = 0; i < $scope.ssflag.length; i++) {
                    $scope.ssflag[i] = "hide";
                }
                //改变点击索引所具有的标志位
                $scope.ssflag[index] = "show";
                // $scope.getmedicallist(id);
                $scope.getjianchajianyanlist(id);
                $scope.getyimiaodata(id, time)
            }
        };
        //添加新成员
        $scope.addMemberDA = function () {
            sessionStorage.removeItem("wantTo");
            $state.go("dangAnEdit", {
                self: "0"
            });
        }

        //用户微信头像
        var txNc = UserInfoService.getTxNc();
        $scope.weiXinTX = txNc.tx;


        // 查询档案列表
        var param = {};
        param.openid = sessionStorage.getItem("openId");
        XywyService.query('/queryDangAn', {
                params: param
            })
            .then(function (res) {
                $scope.memberMsg = res.data;
                //设置初始伸缩标志位
                $scope.ssflag = [];
                var cyid = localStorage.getItem('cyid'); //家庭成员id
                for (var j = 0; j < res.data.length; j++) {
                    //  有已经点击的成员，设置为展开，没有已经点击的成员，第一个设置为展开
                    if ((JsUtil.isNotEmpty(cyid) && cyid === $scope.memberMsg[j].id) || (JsUtil.isEmpty(cyid) && j == 0)) {
                        $scope.ssflag[j] = "show";
                        showIndex = j;
                        // $scope.getmedicallist($scope.memberMsg[j].id);
                        $scope.getjianchajianyanlist($scope.memberMsg[j].id);
                        $scope.getyimiaodata($scope.memberMsg[j].id, $scope.memberMsg[j].chuShengRiQi)
                    } else {
                        $scope.ssflag[j] = "hide";
                    }
                    if (JsUtil.isEmpty(res.data[j].imgUrl)) {
                        $scope.memberMsg[j].imgUrl = null;
                    }
                    // 格式血压日期
                    if (res.data[j].xueya) {
                        if (JsUtil.isNotEmpty(res.data[j].xueya.RIQI)) {
                            var rq = res.data[j].xueya.RIQI.substring(5);
                            rq = rq.substring(0, rq.length - 5);
                            var xueyaDate = rq.replace('/', '月');
                            xueyaDate = xueyaDate.replace(' ', '日');
                            res.data[j].xueya.rq = xueyaDate;
                        }

                        // 体重血压样式
                        if (JsUtil.isNotEmpty(res.data[j].xueya.JIEGUO)) {
                            if (res.data[j].xueya.JIEGUO === '低血压') {
                                res.data[j].xueya.style = "fc-pd";
                            }
                            if (res.data[j].xueya.JIEGUO === '一级高血压' || res.data[j].xueya.JIEGUO === '二级高血压' || res.data[j].xueya.JIEGUO === '三级高血压' || res.data[j].xueya.JIEGUO === '高') {
                                res.data[j].xueya.style = "fc-pg";
                            }
                            if (res.data[j].xueya.JIEGUO === '正常') {
                                res.data[j].xueya.style = "fc-zc";
                            }
                            if (res.data[j].xueya.JIEGUO === '未知') {
                                res.data[j].xueya.style = "fc-ud";
                            }
                        }


                    }
                    // 格式血糖日期
                    if (res.data[j].xuetang) {
                        if (JsUtil.isNotEmpty(res.data[j].xuetang.RIQI)) {
                            var rq = res.data[j].xuetang.RIQI.substring(5);
                            rq = rq.substring(0, rq.length - 5);
                            var xueTangDate = rq.replace('/', '月');
                            xueTangDate = xueTangDate.replace(' ', '日');
                            res.data[j].xuetang.rq = xueTangDate;
                        }

                        // 体重血糖样式
                        if (JsUtil.isNotEmpty(res.data[j].xuetang.JIEGUO)) {
                            if (res.data[j].xuetang.JIEGUO === '偏低') {
                                res.data[j].xuetang.style = "fc-pd";
                            }
                            if (res.data[j].xuetang.JIEGUO === '偏高') {
                                res.data[j].xuetang.style = "fc-pg";
                            }
                            if (res.data[j].xuetang.JIEGUO === '正常') {
                                res.data[j].xuetang.style = "fc-zc";
                            }
                            if (res.data[j].xuetang.JIEGUO === '未知') {
                                res.data[j].xuetang.style = "fc-ud";
                            }
                        }

                    }
                    // 格式体重日期
                    if (res.data[j].tizhong) {
                        if (JsUtil.isNotEmpty(res.data[j].tizhong.RIQI)) {
                            var rq = res.data[j].tizhong.RIQI.substring(5);
                            rq = rq.substring(0, rq.length - 5);
                            var tiZhongDate = rq.replace('/', '月');
                            tiZhongDate = tiZhongDate.replace(' ', '日');
                            res.data[j].tizhong.rq = tiZhongDate;
                        }
                        // 体重颜色样式
                        if (JsUtil.isNotEmpty(res.data[j].tizhong.JIEGUO)) {
                            if (res.data[j].tizhong.JIEGUO === '偏瘦') {
                                res.data[j].tizhong.style = "fc-pd";
                            }
                            if (res.data[j].tizhong.JIEGUO === '超重' || res.data[j].tizhong.JIEGUO === '肥胖') {
                                res.data[j].tizhong.style = "fc-pg";
                            }
                            if (res.data[j].tizhong.JIEGUO === '正常') {
                                res.data[j].tizhong.style = "fc-zc";
                            }
                            if (res.data[j].tizhong.JIEGUO === '未知') {
                                res.data[j].tizhong.style = "fc-ud";
                            }
                        }

                    }

                    if (res.data[j].yunqihehu) {
                        // 格式孕期日期
                        if (JsUtil.isNotEmpty(res.data[j].yunqihehu.chanjiantime)) {
                            var rq = res.data[j].yunqihehu.chanjiantime;
                            var date = rq.split('/');
                            // var y = date[0];
                            var m = date[1];
                            if (m.substr(0, 1) == '0') {
                                m = m.substr(1);
                            }
                            var d = date[2];
                            if (d.substr(0, 1) == '0') {
                                d = d.substr(1);
                            }
                            res.data[j].yunqihehu.chanjiantime = m + "月" + d + "日";
                        }
                    }

                }


            }, Popup.alert);


        // 循环完毕页面定位(滚动)到展开项
        $scope.$on('repeatFinishCallback', function () {
            if (showIndex > 3) {
                var id = "cy" + showIndex;
                var dom = document.getElementById(id);
                var top = dom.offsetTop;
                $('#dalist').animate({
                    scrollTop: top - 50
                });
            }
        });

        $scope.goXueTang = function () {
            $state.go("xueTang");
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
 
        $scope.overthelimit()

    })
    //血压
    .controller('xueYaC', function (wxApi, $ionicViewSwitcher, $scope, $http, $state, $stateParams, XywyService, Popup, $window, $ionicLoading) {
        $scope.isIos = false;
        $scope.inputFocus = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
            sessionStorage.setItem('isIos', $scope.isIos);
        }
        //返回上一页
        $scope.goBack = function () {
            $window.history.back();
        };

        //返回首页
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

        $scope.yonghuid = $stateParams.id;
        var param = {};
        param.id = $stateParams.id;
        //获得最新血压查询
        $scope.jieguo = "未知";
        $scope.jieguoshow = "未知";
        $scope.xueya = "--";
        $scope.xinlv = "--";
        XywyService.query('/queryxueyanew', {
                params: param
            })
            .then(function (res) {
                // console.log(res);
                if (res.data) {
                    $scope.xueya = res.data.GAOYA + "/" + res.data.DIYA;
                    $scope.xinlv = res.data.XINLV;
                    $scope.jieguo = res.data.JIEGUO;
                    if ($scope.jieguo == "低血压") {
                        $scope.jieguoshow = "低";
                    } else if ($scope.jieguo == "正常") {
                        $scope.jieguoshow = "正常";
                    } else if ($scope.jieguo == "一级高血压") {
                        $scope.jieguoshow = "一级";
                    } else if ($scope.jieguo == "二级高血压") {
                        $scope.jieguoshow = "二级";
                    } else if ($scope.jieguo == "三级高血压") {
                        $scope.jieguoshow = "三级";
                    } else {
                        $scope.jieguo = "未知";
                        $scope.jieguoshow = "未知";
                        $scope.xueya = "--";
                        $scope.xinlv = "--";
                    }

                    $scope.riqi = res.data.RIQI;
                    if (res.data.xinlvjg == "高") {
                        $scope.xinlvjg = "您的心率高于正常值范围。";
                    } else if (res.data.xinlvjg == "低") {
                        $scope.xinlvjg = "您的心率低于正常值范围。";
                    } else {
                        $scope.xinlvjg = "您的心率正常。";
                    }

                }

            }, Popup.alert);

        $scope.gowriteXueYa = function () {
            $state.go('celiangxueya', {
                id: $stateParams.id
            });
        }
        //血压历史记录
        $scope.goList = function () {
            $state.go('xueYaList', {
                id: $stateParams.id
            });
        }
        //默认展示血压
        $scope.showechars = "血压";
        //折线图展示选项卡
        $scope.showzhexiantu = function (name) {
            $scope.showechars = name;
        }
        //查看正常值范围
        $scope.gozzc = function () {
            $state.go('zhengChangZhi', {
                type: "xy"
            });
        }
    })
    /**
     * 手动添加血压
     */
    .controller('celiangxueyaC', function (wxApi, $ionicViewSwitcher, $scope, $http, $state, $stateParams, XywyService, Popup, $window, $ionicLoading, TimeXuanZe) {
        $scope.isIos = false;
        $scope.inputFocus = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
            sessionStorage.setItem('isIos', $scope.isIos);
        }
        //返回上一页
        $scope.goBack = function () {
            $window.history.back();
        };
        //提交数据
        $scope.subData = {
            id: $stateParams.id
        };
        //当前时间
        var now = new Date();
        var years = now.getFullYear();
        var month = now.getMonth() + 1;
        var day = now.getDate();
        var hours = now.getHours() >= 10 ? now.getHours() : "0" + now.getHours();
        var minutes = now.getMinutes() >= 10 ? now.getMinutes() : "0" + now.getMinutes();
        //设置默认日期
        xueyasave.celiangriqi.value = years + "/" + month + "/" + day;
        //设置默认时间
        xueyasave.celiangshijian.value = hours + ":" + minutes;
        //时间选择器
        $scope.datePiker = function (id) {
            //时间选择器（返回年月日，添加到当前的id的dom元素的value值中）
            TimeXuanZe.datePiker(id);
        }
        $scope.timeFocus = function (event) {
            var ele = document.getElementById("celiangshijian");
            ele.removeAttribute('placeholder');
        };
        $scope.timeBlur = function () {
            var ele = document.getElementById("celiangshijian");
            $scope.subData.celiangshijian = ele.value;
            if (ele.value == '') {
                ele.setAttribute('placeholder', '请输入测量时间');
            }
            $scope.valiForm();
        };
        // 表单验证
        $scope.valiForm = function () {

            var formFlag = false;
            var gaoya = xueyasave.gaoya.value;
            var diya = xueyasave.diya.value;
            var xinlv = xueyasave.xinlv.value;
            var celiangriqi = xueyasave.celiangriqi.value;
            var celiangshijian = xueyasave.celiangshijian.value;
            var re = /^[1-9]+[0-9]*]*$/; //判断字符串是否为数字（正整数）
            if (re.test(gaoya) && re.test(diya) && re.test(xinlv) && celiangriqi && celiangshijian) {
                formFlag = true;
            }
            $("#submit").attr('disabled', !formFlag); //提交按钮是否禁用（表单验证失败-禁用，反之启用）
        };
        // 表单提交方法
        $scope.onsubmit = function () {
            var flag = xueyasave.checkValidity();
            if (flag) {
                if (parseFloat($scope.subData.gaoya) < parseFloat($scope.subData.diya)) {
                    $ionicLoading.hide();
                    Popup.alert('您的血压输入有误，请重新输入！');
                    return;
                }
                // 数据组织
                var datavalue = {
                    yongHuId: $scope.subData.id,
                    gaoYa: $scope.subData.gaoya,
                    diYa: $scope.subData.diya,
                    xinLv: $scope.subData.xinlv,
                    riQi: xueyasave.celiangriqi.value + " " + xueyasave.celiangshijian.value
                };

                XywyService.save("/saveXueYa", datavalue)
                    .then(function (data) {
                        //console.log(data);
                        Popup.alert("提交成功！");
                        $state.go("xueya", {
                            id: $stateParams.id
                        });
                    });
            } else {
                return flag;
            }
        };
    })
    //血糖主页
    .controller('xueTangC', function (wxApi, $ionicViewSwitcher, $scope, $http, $state, $stateParams, XywyService, Popup, $window, $ionicLoading, $rootScope) {
        $scope.isIos = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
            sessionStorage.setItem('isIos', $scope.isIos);
        }
        //返回上一页
        $scope.goBack = function () {
            $window.history.back();
        };

        //返回首页
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
        // 跳转范围页面
        $scope.goFanWei = function () {
            $state.go("zhengChangZhi", {
                type: 'xt'
            });
        };
        $scope.userId = $stateParams.id;
        var para = {
            id: $stateParams.id
        };
        //点击进入血糖列表页
        $scope.goList = function () {
            var code = null;
            if ($scope.selectIndex != null) {
                code = $scope.xueTangTime[$scope.selectIndex].CODE;
            }

            $state.go("xueTangList", {
                id: $stateParams.id,
                code: code
            })
        };

        //点击进入血糖添加页
        $scope.goXtEdit = function () {
            $state.go("xueTangEdit", para)
        };


        //查询最新血糖记录queryxuetangnew
        XywyService.query("/queryxuetangnew", {
                params: para
            })
            .then(function (response) {
                $scope.xuetangnew = response.data;
                if ($scope.xuetangnew) {
                    if ($scope.xuetangnew.JIEGUO) {
                        if ($scope.xuetangnew.JIEGUO == "正常") {
                            $scope.circleClass = "bg-zc";
                            $scope.iconCls = "fc-zc";

                        } else if ($scope.xuetangnew.JIEGUO == "偏高" || $scope.xuetangnew.JIEGUO == "高") {
                            $scope.circleClass = "bg-pg";
                            $scope.iconCls = "fc-pg";
                        } else if ($scope.xuetangnew.JIEGUO == "偏低" || $scope.xuetangnew.JIEGUO == "低") {
                            $scope.circleClass = "bg-pd";
                            $scope.iconCls = "fc-pd";
                        }
                    } else {
                        $scope.xuetangnew = {
                            JIEGUO: '未知',
                            XUETANG: "--"
                        };
                        $scope.circleClass = "bg-ud";
                        $scope.iconCls = "fc-ud";
                    }


                } else {
                    $scope.xuetangnew = {
                        JIEGUO: '未知',
                        XUETANG: "--"
                    };
                    $scope.circleClass = "bg-ud";
                    $scope.iconCls = "fc-ud";

                }

            }, Popup.alert);

        //查询血糖测量时间段字典 queryXueTangTime 
        XywyService.query("/queryXueTangTime")
            .then(function (response) {
                $scope.xueTangTime = response.data;
            }, Popup.alert);


        // 时间段选项点击事件
        $scope.selectIndex = null;
        $scope.selectOption = function (index, item) {
            if (index == null) {
                $scope.selectIndex = null;
                $rootScope.$broadcast('xueTangTime', null);
            } else {
                if ($scope.selectIndex == null || $scope.selectIndex != index) {
                    $scope.selectIndex = index;
                    for (var i = 0; i < $scope.xueTangTime.length; i++) {
                        $scope.xueTangTime[i].chose = false;
                    }
                    $scope.xueTangTime[index].chose = true;
                }
                $rootScope.$broadcast('xueTangTime', item.CODE);
            }

        };
    })
    //血糖列表
    .controller('xueTangListC', function ($scope, JsUtil, $stateParams, XywyService, Popup, $window, TimeXuanZe) {

        var param = {}; //查询列表参数
        param.id = $stateParams.id;
        param.code = $stateParams.code;

        $scope.isIos = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
            sessionStorage.setItem('isIos', $scope.isIos);
        }
        //返回上一页
        $scope.goBack = function () {
            $window.history.back();
        };


        var now = new Date();
        var preMonth = new Date(now);
        preMonth.setDate(now.getDate() - 30);
        var years = now.getFullYear();
        var month = now.getMonth() + 1;
        var day = now.getDate();
        var pYears = preMonth.getFullYear();
        var pMonth = preMonth.getMonth() + 1;
        var pDay = preMonth.getDate();

        document.getElementById('startDate').value = pYears + "/" + pMonth + "/" + pDay;
        document.getElementById('endDate').value = years + "/" + month + "/" + day;
        param.starttime = document.getElementById('startDate').value;
        param.endtime = document.getElementById('endDate').value;
        //查询血糖测量时间段字典 queryXueTangTime 
        XywyService.query("/queryXueTangTime")
            .then(function (response) {
                $scope.xueTangTime = response.data;
                if (JsUtil.isNotEmpty(param.code)) {
                    for (var i = 0; i < $scope.xueTangTime.length; i++) {
                        if ($scope.xueTangTime[i].CODE === param.code) {
                            $scope.xueTangTime[i].chose = true;
                            $scope.selectIndex = i;
                        }
                    }
                }
            }, Popup.alert);

        // 选择时间段
        $scope.selectIndex = null;
        $scope.selectOption = function (index, ev) {
            if (index == null) {
                $scope.selectIndex = null;
                param.code = null;
            } else {
                if ($scope.selectIndex == null || $scope.selectIndex != index) {
                    $scope.selectIndex = index;
                    for (var i = 0; i < $scope.xueTangTime.length; i++) {
                        $scope.xueTangTime[i].chose = false;
                    }
                    $scope.xueTangTime[index].chose = true;
                }
                param.code = $scope.xueTangTime[$scope.selectIndex].CODE;
            }

            $scope.isShowPx = false;
            ev.stopPropagation();

        };
        // 页面点击隐藏时间段下拉列表
        $scope.docClick = function (ev) {
            $scope.isShowPx = false;
            ev.stopPropagation();
        };

        //下拉菜单点击
        $scope.changeButton = function (ev) {
            if ($scope.isShowPx == true) {
                $scope.isShowPx = false;
            } else {
                $scope.isShowPx = true;
            }
            ev.stopPropagation();
        };

        //日期控件加载
        $scope.datePiker = function (id) {
            TimeXuanZe.datePiker(id);

        };

        var isloadMore = false; //是否是刷新加载


        //查询按钮点击事件
        $scope.doSearch = function () {
            var starttime = document.getElementById('startDate').value;
            var endtime = document.getElementById('endDate').value;

            param.starttime = starttime;
            param.endtime = endtime;
            num = 0;
            param.num = 0;
            isloadMore = false;
            queryXeTang();
            //            ev.stopPropagation();
        };
        var num = 0;
        // 查询血糖列表
        function queryXeTang() {
            param.num = num;
            XywyService.query('/queryxuetanglist', {
                    params: param
                })
                .then(function (res) {
                    if (res.data) {
                        if (isloadMore) {
                            $scope.xueTanglist.concat(res.data.list);
                        } else {
                            $scope.xueTanglist = res.data.list;
                        }
                        num = res.data.num;
                        //是否显示所有记录（用于加载更多的判断）
                        $scope.ishowall = res.data.isshowall;
                    }
                    //禁止上拉滑动（加载更多防止多次加载）因为异步加载你数据还没有请求完成 就执行$scope.$broadcast('scroll.infiniteScrollComplete')，这样的话他会又触发请求
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }, Popup.alert);
        };
        // 列表上拉加载更多
        $scope.loadMicMore = function () {
            if ($scope.ishowall) {
                $scope.reusltNullTip = "已加载全部！";
                $scope.$broadcast('scroll.infiniteScrollComplete');
            } else {
                isloadMore = true;
                queryXeTang();
            }
        };
        //删除记录
        $scope.deljilu = function (index, item) {
            Popup.delConfirm(function () {
                //参数
                var para = {
                    id: item.id,
                    delfenlei: "血糖"
                }
                XywyService.save('/dellishijilu', para)
                    .then(function () {
                        $scope.xueTanglist.splice(index, 1);
                    }, Popup.alert);
            }, function () {});
            //            ev.stopPropagation();
        };
        queryXeTang();
    })
    //血糖
    .controller('xueTangEditC', function ($scope, $state, $stateParams, XywyService, Popup, $window, TimeXuanZe) {
        $scope.isIos = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
            sessionStorage.setItem('isIos', $scope.isIos);
        }
        //返回上一页
        $scope.goBack = function () {
            $window.history.back();
        };


        $scope.subData = {
            yongHuId: $stateParams.id
        };

        // 表单验证
        $scope.valiForm = function () {
            var formFlag = false;
            var xueTang = xueTangForm.xueTang.value;
            var ceLiangShiDuan = xueTangForm.ceLiangShiDuan.value;
            var celiangriqi = xueTangForm.celiangriqi.value;
            var celiangshijian = xueTangForm.celiangshijian.value;
            var re = /^[0-9]+.?[0-9]*$/; //判断字符串是否为数字
            if (re.test(xueTang) && ceLiangShiDuan && celiangriqi && celiangshijian) {
                formFlag = true;
            }
            $("#submit").attr('disabled', !formFlag); //提交按钮是否禁用（表单验证失败-禁用，反之启用）
        };
        $scope.datePiker = function (id) {
            TimeXuanZe.datePiker(id);
        };
        var shiJianDList = [];

        //查询血糖测量时间段字典 queryXueTangTime 
        XywyService.query("/queryXueTangTime")
            .then(function (response) {
                $scope.xueTangTime = response.data;
                if ($scope.xueTangTime) {
                    for (var i = 0; i < $scope.xueTangTime.length; i++) {
                        var item = {
                            id: $scope.xueTangTime[i].CODE,
                            value: $scope.xueTangTime[i].CODE_NAME
                        }
                        shiJianDList.push(item)
                    }
                }
            }, Popup.alert);

        //当前时间
        var now = new Date();
        var years = now.getFullYear();
        var month = now.getMonth() + 1;
        var day = now.getDate();
        var hours = now.getHours() >= 10 ? now.getHours() : "0" + now.getHours();
        var minutes = now.getMinutes() >= 10 ? now.getMinutes() : "0" + now.getMinutes();
        //设置默认日期
        xueTangForm.celiangriqi.value = years + "/" + month + "/" + day;
        //$scope.subData.celiangriqi = years + "/" + month + "/" + day;
        //设置默认时间
        xueTangForm.celiangshijian.value = hours + ":" + minutes;

        // 时间段点击调用Iosselect
        $scope.sjdClick = function () {
            var sjdDom = $("#ceLiangShiDuan");
            var guanXiData = sjdDom.attr("data-gx");
            var iosSelect = new IosSelect(1, [shiJianDList], {
                title: '时间段选择',
                itemHeight: 35,
                relation: [1, 1],
                oneLevelId: guanXiData,
                callback: function (selectOneObj) {
                    sjdDom.attr("data-gx", selectOneObj.id);
                    $scope.subData.ceLiangShiDuan = selectOneObj.id;
                    sjdDom.val(selectOneObj.value);
                    $scope.valiForm()
                }
            });
        };
        // 提交表单
        $scope.submitForm = function () {
            var flag = xueTangForm.checkValidity();
            if (flag) {
                $scope.subData.riQi = xueTangForm.celiangriqi.value + " " + xueTangForm.celiangshijian.value;
                // 提交数据到后台
                XywyService.save("/saveXueTang", $scope.subData)
                    .then(function (data) {
                        //console.log(data);
                        Popup.alert("提交成功！");
                        $state.go("xueTang", {
                            id: $stateParams.id
                        });
                    });
            } else {
                return flag;
            }
        };

    })
    //体重
    .controller('tiZhongC', function (wxApi, $ionicViewSwitcher, $scope, $http, $state, $stateParams, XywyService, Popup, $window, $ionicLoading, JsUtil) {
        $scope.isIos = false;
        $scope.inputFocus = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
            sessionStorage.setItem('isIos', $scope.isIos);
        }
        //返回上一页
        $scope.goBack = function () {
            $window.history.back();
        };
        //返回首页
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

        // 跳转范围页面
        $scope.goFanWei = function () {
            $state.go("zhengChangZhi", {
                type: 'tz'
            });
        };
        $scope.goList = function () {
            $state.go('tiZhongList', {
                id: $stateParams.id
            });
        }
        $scope.userId = $stateParams.id;

        //未获得数据时体重显示值“--”
        var para = {
            id: $stateParams.id
        };

        XywyService.query("/querytizhongnew", {
                params: para
            })
            .then(function (res) {
                if (res.data && res.data.iskaiqi) {
                    $scope.tizhongnew = res.data;
                    if (JsUtil.isEmpty(res.data.JIEGUO)) {
                        $scope.tizhongnew = {
                            JIEGUO: '未知',
                            TIZHONG: "--"
                        };
                        $scope.circleClass = "bg-ud";
                        $scope.iconCls = "fc-ud";
                    } else {
                        if ($scope.tizhongnew.JIEGUO == "正常") {
                            $scope.circleClass = "bg-zc";
                            $scope.iconCls = "fc-zc";

                        } else if ($scope.tizhongnew.JIEGUO == "超重" || $scope.tizhongnew.JIEGUO == "肥胖") {
                            $scope.circleClass = "bg-pg";
                            $scope.iconCls = "fc-pg";
                        } else if ($scope.tizhongnew.JIEGUO == "偏瘦") {
                            $scope.circleClass = "bg-pd";
                            $scope.iconCls = "fc-pd";
                        }
                    }

                } else {
                    $scope.tizhongnew = {
                        JIEGUO: '未知',
                        TIZHONG: "--"
                    };
                    $scope.circleClass = "bg-ud";
                    $scope.iconCls = "fc-ud";
                }



            }, Popup.alert);
        //手动记录体重
        $scope.goWriteTiZhong = function () {
            $state.go('tiZhongEdit', {
                id: $stateParams.id
            });
        }

    })
    //体重记录
    .controller('tiZhongEditC', function ($scope, $state, $stateParams, XywyService, Popup, $window, TimeXuanZe) {
        $scope.isIos = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
            sessionStorage.setItem('isIos', $scope.isIos);
        }
        //返回上一页
        $scope.goBack = function () {
            $window.history.back();
        };


        $scope.subData = {
            yongHuId: $stateParams.id
        };

        //当前时间
        var now = new Date();
        var years = now.getFullYear();
        var month = now.getMonth() + 1;
        var day = now.getDate();
        var hours = now.getHours() >= 10 ? now.getHours() : "0" + now.getHours();
        var minutes = now.getMinutes() >= 10 ? now.getMinutes() : "0" + now.getMinutes();
        //设置默认日期
        tiZhongForm.celiangriqi.value = years + "/" + month + "/" + day;
        //设置默认时间
        tiZhongForm.celiangshijian.value = hours + ":" + minutes;


        // 表单验证
        $scope.valiForm = function () {
            var formFlag = false;
            var tiZhong = tiZhongForm.tiZhong.value;
            var celiangriqi = tiZhongForm.celiangriqi.value;
            var celiangshijian = tiZhongForm.celiangshijian.value;
            var re = /^[0-9]+.?[0-9]*$/; //判断字符串是否为数字
            if (re.test(tiZhong) && celiangriqi && celiangshijian) {
                formFlag = true;
            }
            $("#submit").attr('disabled', !formFlag); //提交按钮是否禁用（表单验证失败-禁用，反之启用）
        };

        $scope.datePiker = function (id) {
            TimeXuanZe.datePiker(id);
        };


        // 提交表单
        $scope.submitForm = function () {
            var flag = tiZhongForm.checkValidity();
            $scope.subData.riQi = tiZhongForm.celiangriqi.value + " " + tiZhongForm.celiangshijian.value;
            if (flag) {
                XywyService.save("/saveTiZhong", $scope.subData)
                    .then(function (data) {
                        Popup.alert("提交成功！");
                        $state.go("tizhong", {
                            id: $stateParams.id
                        });
                    });
            } else {
                return flag;
            }
        };

    })

    /**
     * 血压历史记录
     */
    .controller('xueYaListC', function (wxApi, $ionicViewSwitcher, $scope, $http, $state, $stateParams, XywyService, Popup, $window, $ionicLoading, TimeXuanZe) {
        $scope.isIos = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
            sessionStorage.setItem('isIos', $scope.isIos);
        }
        //返回上一页
        $scope.goBack = function () {
            $window.history.back();
        };
        //时间选择器
        $scope.datePiker = function (id) {
            //时间选择器（返回年月日，添加到当前的id的dom元素的value值中）
            TimeXuanZe.datePiker(id);
        }
        //获取默认时间
        var now = new Date();
        var years = now.getFullYear();
        var month = now.getMonth() + 1;
        var day = now.getDate();
        //上个月份的获取
        var preMonth = new Date(now);
        preMonth.setDate(now.getDate() - 30);
        var pYears = preMonth.getFullYear();
        var pMonth = preMonth.getMonth() + 1;
        var pDay = preMonth.getDate();
        //设置查询开始时间默认值（前一个月）
        document.getElementById('startDate').value = pYears + "/" + pMonth + "/" + pDay;
        //设置查询时间结束默认值（当前时间）
        document.getElementById('endDate').value = years + "/" + month + "/" + day;
        var num = 0;
        var param = {};
        var isloadMore = false;

        param.id = $stateParams.id;
        param.num = num;
        param.starttime = document.getElementById('startDate').value;
        param.endtime = document.getElementById('endDate').value;
        //查询
        $scope.doSearch = function () {
            var starttime = document.getElementById('startDate').value;
            var endtime = document.getElementById('endDate').value;
            param.starttime = starttime;
            param.endtime = endtime;
            num = 0;
            param.num = 0;
            isloadMore = false;
            queryxueya();
        };

        function queryxueya() {

            XywyService.query('/queryxueyalist', {
                    params: param
                })
                .then(function (res) {
                    // console.log(res);
                    if (res.data) {
                        if (isloadMore) {
                            $scope.xueyalist = $scope.xueyalist.concat(res.data.list);
                        } else {
                            $scope.xueyalist = res.data.list;
                        }

                        num = res.data.num;
                        //是否显示所有记录（用于加载更多的判断）
                        $scope.ishowall = res.data.isshowall;
                    }
                    //禁止上拉滑动（加载更多防止多次加载）因为异步加载你数据还没有请求完成 就执行$scope.$broadcast('scroll.infiniteScrollComplete')，这样的话他会又触发请求
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }, Popup.alert);
        };
        queryxueya();
        //加载更多
        $scope.loadMicMore = function () {
            param.num = num;
            if ($scope.ishowall) {
                $scope.reusltNullTip = "已加载全部！";
                $scope.$broadcast('scroll.infiniteScrollComplete');
            } else {
                isloadMore = true;
                queryxueya();
                //                $scope.$broadcast('scroll.infiniteScrollComplete');
            }

        };
        //删除记录
        $scope.deljilu = function (index, item) {
            Popup.delConfirm(function () {
                //参数
                var para = {
                    id: item.id,
                    delfenlei: "血压"
                }
                XywyService.save('/dellishijilu', para)
                    .then(function () {
                        $scope.xueyalist.splice(index, 1);
                    }, Popup.alert);
            }, function () {});

        }
    }) //体重列表
    .controller('tiZhongListC', function (wxApi, $scope, $stateParams, XywyService, JsUtil, Popup, $window, TimeXuanZe) {
        $scope.isIos = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
            sessionStorage.setItem('isIos', $scope.isIos);
        }


        var now = new Date();
        var preMonth = new Date(now);
        preMonth.setDate(now.getDate() - 30);
        var years = now.getFullYear();
        var month = now.getMonth() + 1;
        var day = now.getDate();
        var pYears = preMonth.getFullYear();
        var pMonth = preMonth.getMonth() + 1;
        var pDay = preMonth.getDate();
        // 设置默认日期
        document.getElementById('startDate').value = pYears + "/" + pMonth + "/" + pDay;
        document.getElementById('endDate').value = years + "/" + month + "/" + day;

        //返回上一页
        $scope.goBack = function () {
            $window.history.back();
        };
        //日期控件加载
        $scope.datePiker = function (id) {
            TimeXuanZe.datePiker(id);
        };

        var param = {};
        var num = 0;
        param.id = $stateParams.id;
        param.starttime = document.getElementById('startDate').value;
        param.endtime = document.getElementById('endDate').value;
        var isloadMore = false;
        //查询按钮点击事件
        $scope.doSearch = function () {
            var starttime = document.getElementById('startDate').value;
            var endtime = document.getElementById('endDate').value;
            if (!starttime && !endtime) {
                return;
            }
            param.starttime = starttime;
            param.endtime = endtime;
            num = 0;
            param.num = 0;
            isloadMore = false;
            queryTiZhong();
        };


        // 查询体重列表
        function queryTiZhong() {
            param.num = num;
            XywyService.query('/querytizhonglist', {
                    params: param
                })
                .then(function (res) {
                    if (res.data) {
                        if (isloadMore) {
                            $scope.tiZhongList.concat(res.data.list);
                        } else {
                            $scope.tiZhongList = res.data.list;
                        }

                        num = res.data.num;
                        //是否显示所有记录（用于加载更多的判断）
                        $scope.ishowall = res.data.isshowall;
                    }
                    //禁止上拉滑动（加载更多防止多次加载）因为异步加载你数据还没有请求完成 就执行$scope.$broadcast('scroll.infiniteScrollComplete')，这样的话他会又触发请求
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }, Popup.alert);
        };

        // 列表上拉加载更多
        $scope.loadMicMore = function () {
            if ($scope.ishowall) {
                $scope.reusltNullTip = "已加载全部！";
                $scope.$broadcast('scroll.infiniteScrollComplete');
            } else {
                isloadMore = true;
                queryTiZhong();
            }
        };
        //删除记录
        $scope.deljilu = function (index, item) {
            Popup.delConfirm(function () {
                //参数
                var para = {
                    id: item.id,
                    delfenlei: "体重"
                }
                XywyService.save('/dellishijilu', para)
                    .then(function (res) {
                        $scope.tiZhongList.splice(index, 1);

                    }, Popup.alert);
            }, function () {});

        };
        queryTiZhong(); //调用列表查询方法;
    })
    .controller('zhengChangZhiC', function (wxApi, $scope, $stateParams, XywyService, JsUtil, Popup, $window, TimeXuanZe) {
        $scope.isIos = sessionStorage.getItem('isIos');
        if (JsUtil.isEmpty($scope.isIos)) {
            if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
                $scope.isIos = true;
                sessionStorage.setItem('isIos', $scope.isIos);
            }
        }
        $scope.type = $stateParams.type;
        if ($scope.type === 'xy') {
            $scope.title = "血压";
        } else if ($scope.type === 'xt') {
            $scope.title = "血糖";
        } else if ($scope.type === 'tz') {
            $scope.title = "体重(BMI)";
        }
        //返回上一页
        $scope.goBack = function () {
            $window.history.back();
        };

    })
    // 预产期设置
    .controller('yuChanQiCZC', function (wxApi, $scope, $stateParams, $state, XywyService, JsUtil, Popup, $window, TimeXuanZe) {
        $scope.isIos = false;
        $scope.isIos = sessionStorage.getItem('isIos');
        //返回上一页
        $scope.goBack = function () {
            $window.history.back();
        };
        //当前时间获取
        var now = new Date();
        var years = now.getFullYear();
        var month = now.getMonth() + 1;
        var day = now.getDate();
        var nowtime = years + "/" + month + "/" + day;
        var nowDate = new Date(nowtime); //转化年月日格式的时间
        var nowmm = nowDate.getTime(); //当前时间转化毫秒数

        //提交数据
        $scope.subData = {};

        $scope.hideTip = false; //顶部tip提示是否隐藏
        $scope.tab = 0;
        var pid = $stateParams.pid;
        $scope.formValied = false;


        // 表单验证
        $scope.valiForm = function () {
            var yueJingTimeEnd = null,
                huaiYunTianShu = null,
                yueJingZhouQi = null;
            if (mcyjForm.yueJingTimeEnd) {
                //最后月经日期
                yueJingTimeEnd = mcyjForm.yueJingTimeEnd.value;
            }

            if (mcyjForm.huaiYunTianShu) {
                // 怀孕天数
                huaiYunTianShu = mcyjForm.huaiYunTianShu.value;
            }
            if (mcyjForm.yueJingZhouQi) {
                //月经周期
                yueJingZhouQi = mcyjForm.yueJingZhouQi.value;
            }
            if ($scope.tab == 0) {
                // 末次月经表单判断
                var yuejingtimeDate = new Date(yueJingTimeEnd); //末次月经时间转化时间格式
                var mociyuejingmm = yuejingtimeDate.getTime(); //转化毫秒数
                //末次月经时间不能超过当前时间
                if (JsUtil.isNotEmpty(yueJingTimeEnd) && mociyuejingmm > nowmm) {
                    $scope.formValied = false;
                    return false;
                } else if (JsUtil.isEmpty(yueJingZhouQi) || (JsUtil.isEmpty(yueJingTimeEnd) && JsUtil.isEmpty($scope.subData.yueJingTimeEnd))) {
                    $scope.formValied = false;
                    return false;
                } else {
                    $scope.formValied = true;
                    $scope.jxyqxx();
                    return true;
                }
            } else {
                // 怀孕天数表单判断
                var regPos = /^[1-9]+[0-9]*]*$/; // 判断正整数
                if (!regPos.test(huaiYunTianShu)) {
                    $scope.formValied = false;
                    return false;
                } else if (JsUtil.isEmpty(yueJingZhouQi) || (JsUtil.isEmpty(huaiYunTianShu) && JsUtil.isEmpty($scope.subData.huaiYunTianShu))) {
                    $scope.formValied = false;
                    return false;
                } else {
                    $scope.formValied = true;
                    $scope.jxyqxx();
                    return true;
                }
            }

        };

        // 切换表单
        $scope.switchForm = function (index) {
            $scope.tab = index;
            var data = {};
            if (index == 0) {
                data.yueJingTimeEnd = $scope.subData.yueJingTimeEnd;
            } else {
                data.huaiYunTianShu = $scope.subData.huaiYunTianShu
            }
            if (mcyjForm.yueJingZhouQi) {
                if (JsUtil.isNotEmpty(mcyjForm.yueJingZhouQi.value)) {
                    $scope.subData.yueJingZhouQi = mcyjForm.yueJingZhouQi.value;
                }
                data.yueJingZhouQi = $scope.subData.yueJingZhouQi;

            }

            if (!data.huaiYunTianShu && !data.yueJingTimeEnd) {
                return;
            }
            //计算孕产期
            XywyService.query("/jiSuanYunQixx", {
                    params: data
                })
                .then(function (response) {
                    $scope.yqxx = response.data;
                    //判断是否已经过了预产期
                    var shengyutian = response.data.shengYuTian.replace("天", "");
                    if (shengyutian < 0) {
                        $scope.ischusheng = true;
                    } else {
                        $scope.ischusheng = false;
                    }
                }, Popup.alert);
        };

        // 修改孕期设置
        if (JsUtil.isNotEmpty(pid)) {
            //孕期信息查询
            var para = {
                id: $stateParams.userId,
                pid: pid
            };
            XywyService.query("/queryyunqixx", {
                    params: para
                })
                .then(function (response) {
                    $scope.subData = response.data;
                    $scope.subData.yueJingTimeEnd = response.data.yueJingTimeEnd.replace(/-/g, "/");
                    // 设置末次月经时间 下拉默认数据
                    var dateArr = $scope.subData.yueJingTimeEnd.split("/");
                    var timeEndDom = document.getElementById('yueJingTimeEnd');
                    timeEndDom.setAttribute('data-year', dateArr[0]);
                    //获得月份的第一个数字（判断是否为0，为0则表示小于10月，去掉0）
                    var sszyue = dateArr[1].substring(0, 1);
                    var yue = dateArr[1];
                    //此处判断主要用于时间选择器的定位
                    if (sszyue == 0) {
                        yue = dateArr[1].substring(1, 2);
                    }
                    timeEndDom.setAttribute('data-month', yue);
                    timeEndDom.setAttribute('data-date', dateArr[2]);

                    $scope.yqxx = response.data;
                    //判断是否已经过了预产期
                    var shengyutian = response.data.shengYuTian.replace("天", "");
                    if (shengyutian < 0) {
                        $scope.ischusheng = true;
                    } else {
                        $scope.ischusheng = false;
                    }
                    $scope.formValied = true;
                }, Popup.alert);
        } else {
            //提交数据
            $scope.subData = {
                yueJingTimeEnd: nowtime,
                huaiYunTianShu: 1,
                yueJingZhouQi: 28
            };
            $scope.switchForm(0);
            $scope.formValied = true;
            //$scope.ischusheng = false;
            //$scope.jxyqxx();
        }






        //日期控件加载
        $scope.datePiker = function (id) {
            TimeXuanZe.datePiker(id);
            //            ChoseYueJingTime.datePiker(id);
        };

        // 组织月经周期下拉列表数据
        var zqDataList = [];
        for (var i = 28; i <= 45; i++) {
            var zqObj = {
                'id': i,
                'value': i
            };
            zqDataList.push(zqObj);
        }
        // 关系选择下拉
        var yueJingZhouQiDom = $('#yueJingZhouQi');
        yueJingZhouQiDom.bind('click', function () {
            var zqData = yueJingZhouQiDom.attr("data-zq");
            var iosSelect = new IosSelect(1, [zqDataList], {
                title: '月经周期(天)',
                itemHeight: 35,
                relation: [1, 1],
                oneLevelId: zqData,
                callback: function (selectOneObj) {
                    yueJingZhouQiDom.attr("data-zq", selectOneObj.id);
                    $scope.subData.yueJingZhouQi = selectOneObj.id;
                    yueJingZhouQiDom.val(selectOneObj.value);
                }
            });
        });

        // 计算孕产期
        $scope.jxyqxx = function () {
            var data = {};
            if (mcyjForm.yueJingTimeEnd) {
                $scope.subData.yueJingTimeEnd = mcyjForm.yueJingTimeEnd.value;
                data.yueJingTimeEnd = mcyjForm.yueJingTimeEnd.value;
            } else {
                //                $scope.subData.yueJingTimeEnd = null
            }
            if (mcyjForm.huaiYunTianShu) {
                $scope.subData.huaiYunTianShu = mcyjForm.huaiYunTianShu.value;
                data.huaiYunTianShu = mcyjForm.huaiYunTianShu.value;
            } else {
                //                $scope.subData.huaiYunTianShu = null;
            }
            if (mcyjForm.yueJingZhouQi) {
                $scope.subData.yueJingZhouQi = mcyjForm.yueJingZhouQi.value;
                data.yueJingZhouQi = mcyjForm.yueJingZhouQi.value;
            }
            //            if (!$scope.subData.huaiYunTianShu && !$scope.subData.yueJingTimeEnd) {
            //                return;
            //            }
            if (!data.huaiYunTianShu && !data.yueJingTimeEnd) {
                return;
            }
            //计算孕产期
            XywyService.query("/jiSuanYunQixx", {
                    params: data
                })
                .then(function (response) {
                    $scope.yqxx = response.data;
                    //判断是否已经过了预产期
                    var shengyutian = response.data.shengYuTian.replace("天", "");
                    if (shengyutian < 0) {
                        $scope.ischusheng = true;
                    } else {
                        $scope.ischusheng = false;
                    }
                }, Popup.alert);
        };

        // 保存用户填写孕期信息
        $scope.saveYunQiTime = function () {
            $scope.subData.id = $stateParams.userId;
            if (mcyjForm.yueJingTimeEnd) {
                $scope.subData.yueJingTimeEnd = mcyjForm.yueJingTimeEnd.value;
            } else {
                $scope.subData.yueJingTimeEnd = null
            }
            if (mcyjForm.huaiYunTianShu) {
                $scope.subData.huaiYunTianShu = mcyjForm.huaiYunTianShu.value;
            } else {
                $scope.subData.huaiYunTianShu = null;
            }
            if (mcyjForm.yueJingZhouQi) {
                $scope.subData.yueJingZhouQi = mcyjForm.yueJingZhouQi.value;
            }
            //计算孕产期
            XywyService.save("/saveYunQiTime", $scope.subData)
                .then(function (response) {
                    $state.go('yuQiHH', {
                        userId: $stateParams.userId
                    })
                }, Popup.alert);

        };
    })
    // 孕期呵护
    .controller('yuQiHHC', function (wxApi, $scope, $stateParams, $state, XywyService, JsUtil, Popup, $window, TimeXuanZe, $ionicViewSwitcher) {
        $scope.isIos = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
            sessionStorage.setItem('isIos', $scope.isIos);
        }

        //返回上一页
        $scope.goBack = function () {
            $window.history.back();
        };

        //返回首页
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
        //孕期信息查询
        var para = {
            id: $stateParams.userId
        };
        XywyService.query("/queryyunqixx", {
                params: para
            })
            .then(function (response) {
                $scope.yunqixx = response.data;
            }, Popup.alert);

        //查询用户需要做的的最新产检信息
        XywyService.query("/getNewChanJian", {
                params: para
            })
            .then(function (response) {
                $scope.newChanJian = response.data;

                //产检时间段
                if (!response.data.chanjianshiduan) {
                    $scope.newChanJian.chanjianshiduan = response.data.zhou;
                }

            }, Popup.alert);

        // 修改孕产期
        $scope.goEdit = function (pid) {
            $state.go('yuChanQiCZ', {
                userId: $stateParams.userId,
                pid: pid
            });
        };
        //跳转语音交互
        $scope.goYuyin = function (pid) {
            $state.go('yuyinjiaohuclick', {
                gn: 'FYJK',
                zhuci: '孕期'
            });
        };

        // 全部产检(跳转产检列表页)
        $scope.goAll = function () {
            if (JsUtil.isNotEmptyObj($scope.yunqixx) && JsUtil.isNotEmpty($scope.yunqixx.yueJingTimeEnd))
                $state.go("cjList", {
                    userId: $stateParams.userId,
                    endtime: $scope.yunqixx.yueJingTimeEnd,
                    index: $scope.newChanJian.shownum
                })
        };
    })
    // 孕期所有产检信息列表
    .controller('cjListC', function (wxApi, $scope, $stateParams, XywyService, JsUtil, Popup, $window, TimeXuanZe) {
        $scope.isIos = false;
        $scope.isIos = sessionStorage.getItem('isIos');
        //返回上一页
        $scope.goBack = function () {
            $window.history.back();
        };
        $scope.hideList = []; //列表显示情况
        var openIndex = $stateParams.index;
        if (JsUtil.isEmpty(openIndex)) {
            openIndex = 0;
        } else {
            openIndex = openIndex;
        }
        //孕期信息查询
        var para = {
            yueJingTimeEnd: $stateParams.endtime
        };
        //查询用户需要做的的最新产检信息
        XywyService.query("/queryAllChanJian", {
                params: para
            })
            .then(function (response) {
                $scope.cjList = response.data;
                for (var i = 0; i < $scope.cjList.length; i++) {
                    if (i == openIndex) {
                        $scope.hideList[i] = false;
                    } else {
                        $scope.hideList[i] = true;
                    }
                }
            }, Popup.alert);

        // 循环完毕页面定位(滚动)到展开项
        $scope.$on('repeatFinishCallback', function () {
            var id = "item" + openIndex;
            var dom = document.getElementById(id);
            var top = dom.offsetTop;
            $('#cjList').animate({
                scrollTop: top
            });
        });

        // 产检内容显示/隐藏开关
        $scope.switchC = function (index) {
            $scope.hideList[index] = !$scope.hideList[index];
        };

    })
    //儿童疫苗
    .controller('ChildhoodVaccines', function ($scope, $stateParams, XywyService, JsUtil, Popup, $window, $state) {
        $scope.isIos = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
            sessionStorage.setItem('isIos', $scope.isIos);
        }
        //返回上一页
        $scope.goBack = function () {
            $window.history.back();
        };
        //获取儿童疫苗首页疫苗数据
        $scope.getvaccinesdata = function () {
            var fiter = {}
            fiter.cyid = $stateParams.cyid
            fiter.birthday = $stateParams.birthday
            fiter.all = "0"
            XywyService.save("/etym/getymjzjllist", fiter)
                .then(function (data) {
                    $scope.vaccinesdata = data.data;
                    for (var i = 0; i < $scope.vaccinesdata.length; i++) {
                        $scope.jztime = $scope.vaccinesdata[0].JZSJ;
                    }
                }).catch(function (err) {
                    console.log(err)
                })
        }
        //获取儿童疫苗首页健康数据
        $scope.getjiankangdata = function () {
            var fiter = {}
            fiter.birthday = $stateParams.birthday
            fiter.all = "0"
            XywyService.save("/etym/getettjxmlist", fiter)
                .then(function (data) {
                    $scope.jiankangdata = data.data;

                }).catch(function (err) {
                    console.log(err)
                })
        }
        //判断儿童跳转更多
        $scope.gochildmore = function () {
            var fiter = {}
            fiter.birthday = $stateParams.birthday
            XywyService.save("/etym/getnianlingduan", fiter)
                .then(function (data) {
                    $scope.clildmore = data.data;
                    if ($scope.clildmore == 1) {
                        $state.go('yuyinjiaohuclick', {
                            gn: 'FYJK',
                            zhuci: '新生儿'
                        })
                    }
                    if ($scope.clildmore == 2) {
                        $state.go('yuyinjiaohuclick', {
                            gn: 'FYJK',
                            zhuci: '婴幼儿'
                        })
                    }
                    if ($scope.clildmore == 3) {
                        $state.go('yuyinjiaohuclick', {
                            gn: 'FYJK',
                            zhuci: '学龄前'
                        })
                    }
                }).catch(function (err) {
                    console.log(err)
                })
        }
        //点击进入全部疫苗
        $scope.goallvaccines = function () {
            $state.go('vaccineslist', {
                cyid: $stateParams.cyid,
                birthday: $stateParams.birthday
            })
        }
        //点击进入全部健康体检
        $scope.goalljktj = function () {
            $state.go('jiankangtijian', {
                birthday: $stateParams.birthday
            })
        }
        $scope.gomore = function () {
            $scope.gochildmore()
        }
        // $scope.gochildmore()
        $scope.getvaccinesdata();
        $scope.getjiankangdata();
    })
    //全部疫苗
    .controller('vaccineslist', function ($scope, $stateParams, XywyService, JsUtil, Popup, $window, $state, TimeXuanZe, $ionicLoading, $timeout) {
        $scope.isIos = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
            sessionStorage.setItem('isIos', $scope.isIos);
        }
        //返回上一页
        $scope.goBack = function () {
            $window.history.back();
        };
        //获取全部疫苗数据
        $scope.getallvaccinesdata = function () {
            var fiter = {}
            fiter.cyid = $stateParams.cyid
            fiter.birthday = $stateParams.birthday
            fiter.all = "1"
            XywyService.save("/etym/getymjzjllist", fiter)
                .then(function (data) {
                    $scope.allvaccinesdata = data.data
                }).catch(function (err) {
                    console.log(err)
                })
        }
        //更改疫苗时间  
        $scope.changetime = function (id, time) {
            var fiter = {}
            fiter.cyid = $stateParams.cyid
            fiter.jlid = id
            fiter.date = time
            XywyService.save("/etym/updatejzsj", fiter)
                .then(function (data) {
                    if (data) {
                        $ionicLoading.show({
                            template: '修改成功',
                        });
                        $timeout(function () {
                            $scope.getallvaccinesdata();
                            $ionicLoading.hide() //由于某种原因3秒后关闭弹出

                        }, 2000);
                    }
                }).catch(function (err) {
                    console.log(err)
                })
        }
        //时间控件方面的麻烦方法，后期优化进行
        var now = new Date();
        var nowYear = now.getFullYear();
        var nowMonth = now.getMonth() + 1;
        var nowDate = now.getDate();


        // 数据初始化
        function formatYear(nowYear) {
            var arr = [];
            for (var i = nowYear - 120; i <= nowYear; i++) {
                arr.push({
                    id: i + '',
                    value: i
                });
            }
            return arr;
        }

        function formatMonth() {
            var arr = [];
            for (var i = 1; i <= 12; i++) {
                arr.push({
                    id: i + '',
                    value: i
                });
            }
            return arr;
        }

        function formatDate(count) {
            var arr = [];
            for (var i = 1; i <= count; i++) {
                arr.push({
                    id: i + '',
                    value: i
                });
            }
            return arr;
        }
        // 年数据
        var yearData = function (callback) {
            callback(formatYear(nowYear))
        }
        // 月数据
        var monthData = function (year, callback) {
            callback(formatMonth());
        };
        // 日期数据
        var dateData = function (year, month, callback) {
            if (/^(1|3|5|7|8|10|12)$/.test(month)) {
                callback(formatDate(31));
            } else if (/^(4|6|9|11)$/.test(month)) {
                callback(formatDate(30));
            } else if (/^2$/.test(month)) {
                if (year % 4 === 0 && year % 100 !== 0 || year % 400 === 0) {
                    callback(formatDate(29));
                } else {
                    callback(formatDate(28));
                }
            } else {
                throw new Error('month is illegal');
            }
        };

        $scope.datePiker = function (id, type) {
            var date;
            var selectDateDom = $("#" + id);
            var showDateDom = selectDateDom;
            var dateArr = type.split("/");
            var sszyue = dateArr[1].substring(0, 1);
            var yue = dateArr[1];
            //此处判断主要用于时间选择器的定位
            if (sszyue == 0) {
                yue = dateArr[1].substring(1, 2);
            }

            if (showDateDom.attr('data-year')) {

            } else {
                showDateDom.attr('data-year', dateArr[0]);
            }
            if (showDateDom.attr('data-month')) {

            } else {
                showDateDom.attr('data-month', yue);
            }
            if (showDateDom.attr('data-date')) {

            } else {
                showDateDom.attr('data-date', dateArr[2]);
            }

            var oneLevelId = showDateDom.attr('data-year');
            var twoLevelId = showDateDom.attr('data-month');
            var threeLevelId = showDateDom.attr('data-date');
            var iosSelect = new IosSelect(3, [yearData, monthData, dateData], {
                title: '日期选择',
                itemHeight: 35,
                oneLevelId: oneLevelId,
                twoLevelId: twoLevelId,
                threeLevelId: threeLevelId,
                showLoading: true,
                callback: function (selectOneObj, selectTwoObj, selectThreeObj) {
                    showDateDom.attr('data-year', selectOneObj.id);
                    showDateDom.attr('data-month', selectTwoObj.id);
                    showDateDom.attr('data-date', selectThreeObj.id);
                    //向dom元素中添加值
                    if (type) {
                        // if (selectTwoObj.value.length == 1) {
                        //     selectTwoObj.value = 0 + selectTwoObj.value
                        // }
                        // if (selectThreeObj.value.length == 1) {
                        //     selectThreeObj.value = 0 + selectThreeObj.value
                        // }
                        selectDateDom.val(selectOneObj.value + '/' + selectTwoObj.value + '/' + selectThreeObj.value);
                        type = selectDateDom.val(selectOneObj.value + '/' + selectTwoObj.value + '/' + selectThreeObj.value)[0].value;
                        $scope.changetime(id, type)
                    } else {
                        selectDateDom.val(selectOneObj.value + '/' + selectTwoObj.value + '/' + selectThreeObj.value);
                    }
                    //返回值
                }
            });

        };
        $scope.getallvaccinesdata();
    })
    //全部体检
    .controller('jiankangtijian', function ($scope, $stateParams, XywyService, JsUtil, Popup, $window, $state, TimeXuanZe) {
        $scope.isIos = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
            sessionStorage.setItem('isIos', $scope.isIos);
        }
        //返回上一页
        $scope.goBack = function () {
            $window.history.back();
        };
        //获取全部健康体检数据
        $scope.getalltijiandata = function () {
            var fiter = {}
            fiter.birthday = $stateParams.birthday
            fiter.all = "1"
            XywyService.save("/etym/getettjxmlist", fiter)
                .then(function (data) {
                    $scope.alljiankangdata = data.data;
                    console.log($scope.alljiankangdata, "123")
                }).catch(function (err) {
                    console.log(err)
                })
        }
        $scope.getalltijiandata();
    })