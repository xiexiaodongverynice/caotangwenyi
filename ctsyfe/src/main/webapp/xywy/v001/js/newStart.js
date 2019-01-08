angular.module('starter.newStart', [])
    /**
     * 重新开始，选择项目，选择指标，药品列表
     */
    .directive('newStart', ['$rootScope', '$state', 'Popup', '$window', '$location', 'audioControl', 'XywyService', 'Message', '$stateParams', function ($rootScope, $state, Popup, $window, $location, audioControl, XywyService, Message, $stateParams) {

        return {
            scope: {
                gn: "=",
                messageArr: "=",
                questionType: "="
            },
            restrict: 'ACE',
            template: '<div ng-if="gn==\'FYJK\'||gn==\'WBG\'||gn==\'YBCX\'||gn==\'JBSSBMCX\'||gn==\'ZWPG\'" ng-click="click(\'项目\')" style="width: 45px; height:45px;text-align:center; margin:10px 0;border-radius: 50%; color: #FFF;background-color: #00B5EE;opacity:0.9; box-shadow:0 6px 6px rgba(25,187,238,0.7)"><i class="icon iconfont icon-menu" style="display:block;  line-height:45px;font-size:22px;"></i></div>',
//                + '<div ng-if="gn!=\'FYJK\'" ng-click="click(startone)" style="width: 45px; height:45px;text-align:center; margin:10px 0;border-radius: 50%; color: #FFF;background-color: #00B5EE;opacity:0.9; box-shadow:0 6px 6px rgba(25,187,238,0.7)"><i ng-class="panduanclass()" style="display:block;  line-height:45px;font-size:22px;"></i></div>',
            // + '<div ng-show="show" ng-click="click(starthree)" style="width: 90px; height:50px;text-align:center;margin:20px 0;border-bottom-left-radius: 35px;border-top-left-radius: 35px;color: #2db4ee;margin-top: 20px;clear:both; background-color: white;opacity:0.9;border: 1px solid #ebebeb;"><i class="ion-ios-loop-strong" style="margin-top: 3px;display:block;font-size:22px;padding-left:10px;"></i><p style="padding-top: 3px;padding-left:10px;">{{starthree}}</p></div>'
            // + '<div ng-show="isjijie" ng-click="click(jijie)" style="width: 90px; height:50px;text-align:center;margin:20px 0;border-bottom-left-radius: 35px;border-top-left-radius: 35px;color: #2db4ee;margin-top: 20px;clear:both; background-color: white;opacity:0.9;border: 1px solid #ebebeb;"><i class="ion-ios-loop-strong" style="margin-top: 3px;display:block;font-size:22px;padding-left:10px;"></i><p style="padding-top: 3px;padding-left:10px;">{{jijie}}</p></div>'
            link: function ($scope, $element, $attrs) {
                //            	图标判断
                $scope.panduanclass = function () {
                    // if ($scope.gn == "WBG") {
                    //     return "icon-jcxm";
                    // } else if ($scope.gn == "WYP" || $scope.gn == "WJB" || $scope.gn == "CJZZ" || $scope.gn == "ZWPG"|| $scope.gn == "JJJK") {
                    //     return "icon-lb";
                    // } else if ($scope.gn == "FYJK") {
                    //     return "icon-lb";
                    // } else {
                    //     return "ion-ios-loop-strong";
                    // }
                    return "ion-ios-loop-strong";
                }
                //判断问报告还是妇幼健康的图标样式
                // $scope.panduanclasstwo = function () {
                //     if ($scope.gn == "WBG") {
                //         return "icon-jyxm";
                //     } else {
                //         return "icon-lb";
                //     }
                // }
                $scope.messageArr = [];

                function addDialog(message) {
                    if (angular.isString(message)) {

                    }
                    $scope.inputFocus = false;
                    audioControl.pause();
                    $scope.messageArr.push(message);
                }
                //点击事件
                $scope.click = function (value) {
                    if (value == "项目") {
                        $scope.setGn($scope.gn, 2);
                    }
                    else if ($scope.gn == "WBG") {
                        if (value == "重新解读") {
                            $scope.setGn($scope.gn);
                        }
                        else {
                            $scope.submit(value);
                        }
                    } else if ($scope.gn == "FYJK") {
                        if ($stateParams.zhuci == "孕期" || $stateParams.zhuci == "新生儿" || $stateParams.zhuci == "婴幼儿" || $stateParams.zhuci == "学龄前") {
                            //判断主词是否包含以上几个词，包含则证明从家庭健康档案模块跳转过来的，重新开始时按照主词来进行重新开始操作
                            $rootScope.$broadcast('newJtdaStart', {
                                zhuci: $stateParams.zhuci
                            });
                        } else
                            if (value == "重新开始") {
                                $scope.setGn($scope.gn);
                            } else {
                                $scope.submit(value);
                            }
                    } else if ($scope.gn == "JJJK") {
                        if (value == "重新开始") {
                            $scope.setGn($scope.gn);
                        } else {
                            $scope.submit(value);
                        }
                    } else {
                        $scope.setGn($scope.gn);
                    }
                    $('.button-ddd').attr('disabled', "true");
                }
                //向外发送消息
                $scope.submit = function (userChoose) {
                    $rootScope.$broadcast('userSubmit', {
                        input: userChoose,
                        processNo: undefined
                    });
                };
                //重新选择功能
                $scope.setGn = function (name) {
                    var param = {
                        userid: sessionStorage.getItem("openId"),
                        gnname: name,
                        fresh: 1
                    };

                    if (typeof arguments[1] != "undefined") {
                        param.fresh = 2
                    }

                    if (sessionStorage.getItem("orgid")) {
                        param = {
                            userid: sessionStorage.getItem("openId"),
                            gnname: name,
                            orgid: sessionStorage.getItem("orgid")
                        };
                    }
                    var config = {
                        params: param,
                        cache: false
                    }
                    $scope.setting = true;
                    var start = "";
                    if (!$scope.gn || $scope.gn == "") {
                        start = "/newstart";
                    } else if ($scope.gn == "XZWY") { //推荐科室中寻症问医功能重新开始接口的调用
                        start = "/newstartxzwy"
                    } else if ($scope.gn == "JBSSBMCX") { //推荐科室中寻症问医功能重新开始接口的调用
                        start = "/bianmachaxun/cxml"
                    } else if ($scope.gn == "YBCX") {
                        start = "/ybypcx/xzdq"
                    }
                    else {
                        start = "/setGn";
                    }

                    XywyService.query(start, config).then(function (response) {
                        //                    	重新选功能时(或者重新输入时)清空用户输入信息展示的内容
                        $scope.yonghuinput = "";
                        $scope.resdata = response.data;
                        $scope.questionType = response.data.type;
                        $scope.setting = false;
                        if (angular.isArray(response.data)) {
                            angular.forEach(response.data, function (e) {
                                addDialog(new Message(e));

                            });
                        } else {
                            addDialog(new Message(response.data));
                        }
                    }, Popup.alert);
                }
                //	判断是否显示用户输入信息滚动栏（当localStorage.getItem('showuserinput')不存在时默认显示）
                if ($scope.gn == "FYJK") {
                    $scope.show = true;
                    //$scope.isjijie=false;
                    // $scope.startone = "妇女";
                    // $scope.starttwo = "儿童";
                    // $scope.starthree = "重新开始"
                    $scope.startone = "重新开始"
                } else
                    if ($scope.gn == "WBG") {
                        $scope.show = true;
                        //$scope.isjijie=false;
                        // $scope.startone = "检验项目";
                        // $scope.starttwo = "检查项目";
                        // $scope.starthree = "重新解读"
                        $scope.startone = "重新解读"

                    }

                    else if ($scope.gn == "JJJK") {
                        $scope.show = false;
                        //$scope.isjijie=false;
                        $scope.startone = "重新开始";
                        //$scope.jijie="重新开始";
                    } else {
                        $scope.show = false;
                        //$scope.isjijie=false;
                        $scope.startone = "重新开始";
                    }
            }
        };
    }])
    ;
