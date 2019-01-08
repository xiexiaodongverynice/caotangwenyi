angular.module('starter.services', [])
    .service('projectConfig', ['$window', function ($window) {
        var config = $window.myConfig;
        var returnCitySN = $window.returnCitySN;
        this.yiyuanEdition = !!(config.dingdianyiyuan);
    }])
    .factory('userService', ['$q', 'wxApi', 'XywyService', '$window', 'Popup', '$rootScope', function ($q, wxApi, XywyService, $window, Popup, $rootScope) {
        //TODO 用户信息
        var userInfo;
        var userOpenId = $window.sessionStorage.getItem('openId');

        //获取用户信息
        function getUserInfo() {
            return $q(function (resolve, reject) {
                if (userInfo) {
                    resolve(userInfo);
                } else {
                    updateInfo().then(resolve, reject);
                }
            });
        }

        //更新用户信息
        function updateInfo(user) {
            if (user) {
                userInfo = user;
                return user;
            }
            return $q(function (resolve, reject) {
                XywyService.query('/getUserInfo', {
                    params: {
                        userid: userOpenId
                    }
                }).then(function (user) {
                    userInfo = user;
                    //$rootScope.$broadcast('userinfoUpdate',user);
                    return user;
                }, function (reason) {
                    return $q.reject('获取用户信息失败！');
                }).then(resolve, reject);
            });
        }

        //params [moren] boolean 制定查询定点医院还是默认医院
        function getUserHos(moren) {
            return getUserInfo().then(function (user) {
                var yybm = moren === true ? user.moRenYiYuan : user.dingDianYiYuan;
                if (yybm) {
                    return XywyService.query('/hospitales', {
                        params: {
                            yybm: yybm
                        }
                    });
                } else {
                    return $q.reject('未设置定点医院');
                }
            }, Popup.alert);
        }

        return {
            getUserInfo: getUserInfo,
            updateInfo: updateInfo,
            getUserHos: getUserHos
        };
    }])
    .factory('wxApi', ['$q', '$http', '$window', '$log', 'projectConfig', function ($q, $http, $window, $log, projectConfig) {
        var isWeiXin = (/MicroMessenger/i).test($window.navigator.userAgent.toLowerCase());
        var isOk = false;
        var weixinConfigUrl;
        var wx = $window.wx;
        var jsApiList;
        if (projectConfig.yiyuanEdition) {
            weixinConfigUrl = myConfig.serverUrl + "/getConfig?callback=JSON_CALLBACK";
        } else {
            weixinConfigUrl = myConfig.yxzsurl + '/services/wx/mpf/getWxJsapiSignatureGet.json';
        }
        jsApiList = ['startRecord', 'stopRecord', 'playVoice', 'translateVoice', 'getLocation'];

        /**
         * 微信初始化方法 通过wxApi接口会自动调用
         * @param url 后台参数接口
         * @param apiList 请求参数列表
         * @returns {Promise}
         */
        function weixinConfig(url, apiList) {
            var deferred = $q.defer();
            if (!isWeiXin) {
                deferred.reject('未在微信中运行');
            } else {
                $http.jsonp(url).then(
                    function (response) {
                        var result = response.data;
                        if (result) {
                            wx.config({
                                debug: false,
                                appId: result.appId,
                                timestamp: result.timestamp,
                                nonceStr: result.nonceStr,
                                signature: result.signature,
                                jsApiList: jsApiList
                            });
                        }
                    },
                    function () {
                        deferred.reject('网络错误！');
                    });
                wx.ready(function (message) {
                    isOk = true;
                    deferred.resolve();
                });
                wx.error(function (error) {
                    $log.error(error);
                    deferred.reject('微信验证失败！');
                });
            }
            return deferred.promise;
        }

        /**
         * 获取经纬度promise方法
         * @param deferred
         * @param option 微信api文档中对应参数
         */
        function locationPromise(deferred, option) {
            wx.getLocation({
                type: option && option.type, // 微信默认为wgs84的gps坐标
                success: deferred.resolve,
                error: deferred.reject,
                cancel: deferred.reject
            });
        }

        /**
         * 录音promise生成方法
         * @param deferred
         * @param option 微信api文档中对应参数
         */
        function recordPromise(deferred) {
            wx.startRecord({
                success: function () {
                    deferred.resolve();
                },
                cancel: function () {
                    deferred.reject('请给录音功能授权！');
                },
                fail: function () {
                    deferred.reject('开始录音失败！');
                }
            });
        }

        /**
         * promise工程，通过构建promise生成方法使用
         * @param apiPromise promise生成方法
         * @param option 参数
         * @returns {promise} promise对象
         */
        function apiFactory(apiPromise, option) {
            return function () {
                var deferred = $q.defer();
                if (isWeiXin) {
                    if (isOk) {
                        apiPromise(deferred, option);
                    } else {
                        weixinConfig(weixinConfigUrl, jsApiList).then(function () {
                            apiPromise(deferred, option);
                        });
                    }
                } else {
                    deferred.reject('未在微信运行');
                }
                return deferred.promise;
            };
        }

        /**
         * 确保微信初始化promise
         * @returns {Promise}
         */
        function weiXinPromise() {
            var deferred = $q.defer();
            if (isWeiXin) {
                if (isOk) {
                    deferred.resolve(wx);
                } else {
                    weixinConfig(weixinConfigUrl, jsApiList).then(function () {
                        deferred.resolve(wx);
                    }, function (reason) {
                        deferred.reject(reason);
                    });
                }
            } else {
                deferred.reject('未在微信运行');
            }
            return deferred.promise;
        }

        function getOpenID(appid) {
            var oauth2url = 'https://open.weixin.qq.com/connect/oauth2/authorize?';
            var config = {
                appid: appid,
                redirect_uri: myConfig.serverUrl + '/shouYe',
                params: 'response_type=code&scope=snsapi_base&state=1#wechat_redirect'
            };
        }

        /**
         * 初始化，并提前调用录音授权
         * @returns {Promise<any>}
         */
        function init() {
            return weiXinPromise().then(function (wx) {
                //                wx.startRecord({
                //                    success: function () {
                //                        localStorage.allowRecord = 'true';
                //                        // 仅仅为了授权，所以立刻停掉
                //                        wx.stopRecord();
                //                        $q.resolve();
                //                    },
                //                    cancel: function () {
                //                        $q.reject('用户拒绝授权录音');
                //                    }
                //                });
            });
        }

        return {
            init: init,
            wxPromise: weiXinPromise,
            getLocation: apiFactory(locationPromise),
            startRecord: function (callbacks) {
                apiFactory(recordPromise)().then(callbacks.success, callbacks.cancel || callbacks.fail);
            },
            config: function () {
                return weixinConfig(weixinConfigUrl, jsApiList);
            }
        };
    }])
    /**
     * 自动在请求中加入用户id和token，统一管理
     */
    .factory('UserOperationLogging', ['$q', '$window', function ($q, $window) {
        return {
            request: function (config) {
                if (/ebmxywy\/mvc/.test(config.url) || /jkww\/mvc/.test(config.url) || /ctsy\/mvc/.test(config.url) || /ctsyfe\/mvc/.test(config.url) || /ctsy_zzj\/mvc/.test(config.url)) {
                    var timestamp = new Date().getTime();
                    var secret = $window.myConfig.signatureSecret;
                    //console.log(config.url);
                    if ("GET" == config.method || "JSONP" == config.method) {
                        var params = config.params || (config.params = {});
                        params.userid = $window.sessionStorage.getItem('openId');
                        params.hhid = $window.sessionStorage.getItem('hhid');
                        params.ip = returnCitySN.cip;
                        params.timestamp = timestamp;
                        params.clientCode = $window.myConfig.wxappid;
                        //console.log(params);

                        //排序所有请求参数并拼接
                        var array = Object.keys(params);
                        array.sort();
                        // 拼接有序的参数名-值串  
                        var paramArray = new Array();
                        for (var index in array) {
                            var key = array[index];
                            var setFlag = (params[key] == undefined || params[key] == null);
                            if (!setFlag && key !== "signature") (
                                paramArray.push(key + params[key])
                            )
                        }
                        var sortedParamsJson = paramArray.join("");

                        //console.log("参数原文：",sortedParamsJson);
                        var hash = CryptoJS.HmacSHA256(sortedParamsJson, secret);
                        var signature = CryptoJS.enc.Base64.stringify(hash);
                        //console.log("签名：", signature);
                        //参数中额外添加签名
                        params.signature = signature;
                    } else if ("POST" == config.method) {
                        //上传附件请求,不做处理
                        if (config.headers["Content-Type"] == undefined) {
                            return config;
                        } else {
                            var params = config.data || (config.data = {});
                            params.ip = returnCitySN.cip;
                            params.timestamp = timestamp;
                            params.clientCode = $window.myConfig.wxappid;

                            var postParams = {};
                            postParams.json = angular.toJson(params);
                            //console.log("参数原文：",postParams.json);
                            var hash = CryptoJS.HmacSHA256(postParams.json, secret);
                            var signature = CryptoJS.enc.Base64.stringify(hash);
                            //console.log("签名：" + signature);
                            postParams.signature = signature;

                            config.data = postParams;
                        }
                    } else {
                        alert(config.method);
                    }
                }
                return config;
            },
            //通过后台定义Response类 同意检查数据有效性
            response: function (response) {
                if (response.data && response.data.hhid !== undefined && response.data.hhid !== '') {
                    if (response.data.hhid != sessionStorage.getItem("hhid")) {
                        sessionStorage.setItem("sessionHhid", sessionStorage.getItem("hhid"));
                    }
                    $window.sessionStorage.setItem('hhid', response.data.hhid);
                }
                if (response.data && response.data[0] && response.data[0].hhid !== undefined && response.data[0].hhid !== '') {
                    if (response.data.hhid != sessionStorage.getItem("hhid")) {
                        sessionStorage.setItem("sessionHhid", sessionStorage.getItem("hhid"));
                    }
                    $window.sessionStorage.setItem('hhid', response.data[0].hhid);
                }
                if (response.data && response.data.ok !== undefined) {
                    var data = response.data;
                    if (data.ok === false) {
                        return $q.reject(data.message);
                    }
                    return data.content;
                }
                return response;
            }
        };
    }])
    /**
     * 延迟500毫秒显示loading动画
     */
    .factory('loadingInjector', ['$injector', '$q', function ($injector, $q) {
        return {
            request: function (config) {
                if (config.url && config.url.toString().indexOf('http://') === 0) {
                    $injector.get('$ionicLoading').show({
                        content: 'Loading',
                        animation: 'fade-in',
                        showBackdrop: true,
                        maxWidth: 200,
                        showDelay: 500
                    });
                }
                config.headers = config.headers || {};


                return config;
            },
            response: function (response) {
                // //console.log(response);
                if (response.config.url.indexOf('http://') === 0) {
                    $injector.get('$ionicLoading').hide();
                }
                return response;
            },
            responseError: function (rejection) {
                if (rejection.config && rejection.config.url && rejection.config.url.indexOf('http://') === 0) {
                    $injector.get('$ionicLoading').hide();
                }
                return $q.reject(rejection);
            }
        };
    }])
    /**
     * 注入loading动画
     */
    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push('UserOperationLogging', 'loadingInjector');
    }])
    /**
     * 统一后台请求地址，可在此检查用户信息是否完全
     * query：get请求，save：post请求，update: put请求
     */
    .factory('XywyService', ['$http', '$window', '$q', function ($http, $window, $q) {
        return {
            query: function (url, config) {
                if (config) {
                    config.timeout = 30000;
                } else {
                    config = {
                        "timeout": 30000
                    };
                }
                if (!$window.sessionStorage.getItem('openId')) {
                    return $q.reject('未获取到用户信息');
                }
                return $http.get(myConfig.serverUrl + url, config).error(function (status) {
                    if (status == 408) {
                        $q.reject('系统繁忙，请稍候再试!');
                    }
                });
            },
            save: function (url, data) {
                if (!$window.sessionStorage.getItem('openId')) {
                    return $q.reject('未获取到用户信息');
                }
                return $http.post(myConfig.serverUrl + url, data);
            },
            update: function (url, data) {
                if (!$window.sessionStorage.getItem('openId')) {
                    return $q.reject('未获取到用户信息');
                }
                return $http.put(myConfig.serverUrl + url, data);
            },
            getRem: function (pwidth) {
                var html = document.getElementsByTagName("html")[0];
                var oWidth = document.body.clientWidth || document.documentElement.clientWidth;
                html.style.fontSize = oWidth / pwidth + "em";
            }
        };
    }])
    .factory('jqueryService', ['$window', '$q', 'JsUtil', function ($window, $q, JsUtil) {
        return {
            /**
             * ajax 请求
             * url请求接口路径
             * data 参数
             * async 是否异步（true-是,false-否） 
             */
            ajax: function (url, data, async) {
                if (!$window.sessionStorage.getItem('openId')) {
                    return $q.reject('未获取到用户信息');
                }
                if (JsUtil.isEmpty(data)) {
                    data = {}
                }
                var timestamp = new Date().getTime();
                var secret = $window.myConfig.signatureSecret;
                //var params = {};
                var params = data;
                params.openid = $window.sessionStorage.getItem('openId');
                params.ip = returnCitySN.cip;
                params.timestamp = timestamp;
                params.clientCode = $window.myConfig.wxappid;
                //console.log(params);

                //排序所有请求参数并拼接
                var array = Object.keys(params);
                array.sort();
                // 拼接有序的参数名-值串  
                var paramArray = new Array();
                for (var index in array) {
                    var key = array[index];
                    var setFlag = (params[key] == undefined || params[key] == null);
                    if (!setFlag && key !== "signature") (
                        paramArray.push(key + params[key])
                    )
                }
                var sortedParamsJson = paramArray.join("");

                var hash = CryptoJS.HmacSHA256(sortedParamsJson, secret);
                var signature = CryptoJS.enc.Base64.stringify(hash);
                //参数中额外添加签名
                params.signature = signature;
                return $.ajax({
                    url: myConfig.serverUrl + url,
                    data: params,
                    type: "GET",
                    async: async
                });
            }
        };
    }])
    .factory('UserInfoService', ['$window', '$q', 'jqueryService', 'Popup', function ($window, $q, jqueryService, Popup) {
        return {
            /**
             * 获取用户个人信息
             */
            getInfo: function () {
                var param = {
                    openid: sessionStorage.getItem("openId")
                };
                var result = null;
                if (sessionStorage.getItem("userInfo")) {
                    result = JSON.parse(sessionStorage.getItem("userInfo"));
                } else {
                    jqueryService.ajax('/queryMineXx', param, false)
                        .then(function (res) {
                            if (res) {
                                result = res;
                                sessionStorage.setItem("userInfo", JSON.stringify(result));
                            }
                        }, Popup.alert);
                }

                return result;
            },

            /**
             * 获取头像昵称
             */
            getTxNc: function () {
                var txNc = {
                    tx: "img/hz.png",
                    nc: "匿名用户"
                }
                if (sessionStorage.getItem("txNc")) {
                    txNc = JSON.parse(sessionStorage.getItem("txNc"));
                } else {
                    var userInfo = this.getInfo();
                    if (userInfo) {
                        if (userInfo.xingMing) {
                            txNc.nc = userInfo.xingMing
                        }
                        if (userInfo.imgUrl) {
                            txNc.tx = userInfo.imgUrl
                        }
                    }
                    sessionStorage.setItem("txNc", JSON.stringify(txNc));
                }
                return txNc;
            }
        };
    }])

    /**
     * 人体选部位生成热区指令
     * 通过在html area-data="坐标数据" area-action="点击回调方法（）"
     */
    .directive('mapArea', [function () {
        return {
            template: '<area ng-repeat="area in areaData" shape="{{area.shape}}" coords="{{area.coords|mapCoords:img}}" alt="{{area.part}}" ng-click="choose(area.part)"/>',
            scope: {
                areaData: '=',
                areaAction: '&',
            },
            //transclude:'element',
            restrict: 'A',
            link: function ($scope, iElm, iAttrs, controller) {
                $scope.img = iElm[0].ownerDocument.querySelector('img[usemap="#' + iAttrs.id + '"]');
                $scope.choose = function (part) {
                    $scope.areaAction({
                        para: part
                    });
                };
            }
        };
    }])
    // 循环结束指令
    .directive('repeatFinish', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, elem, attr) {
                //当前循环至最后一个  
                if (scope.$last === true) {
                    $timeout(function () {
                        //向父控制器传递事件消息  
                        scope.$emit('repeatFinishCallback');
                    }, 100);
                }
            }
        }
    })
    /**
     * 实现热区根据图片大小等比例缩放
     */
    .filter('mapCoords', ['$window', function ($window) {
        var rate = 0;
        return function (origin, img) {
            rate = $window.Math.round(img.clientWidth / myConfig.buweiImgWidth * 100) / 100;
            return origin.split(',').map(function (num) {
                return $window.Math.round(num * rate);
            }).toString();
        };
    }])
    /**
     * 百分数格式化filter
     */
    .filter('percent', [function () {
        return function (number) {
            return number.toFixed(2) * 100 + '%';
        }
    }])
    /**
     * 意愿选择条件指令
     * <hospital-condition hospital-data="" hos-condition="" selection-change="修改回调（）"></hospital-condition>
     */
    .directive('hospitalCondition', [function () {
        return {
            scope: {
                hospitalData: '=',
                hosCondition: '=',
                selectChange: '&'
            },
            restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
            template: '<div data-tap-disabled="true" class="shaixuan">\n' +
                '  <select class="tiaojian select-clear" ng-model="hosCondition.distance" ng-change="select()">\n' +
                '      <option value="">距离筛选</option>\n' +
                '      <option ng-repeat="djmc in disArray" value="{{djmc}}">{{djmc}}</option>\n' +
                '  </select>\n' +
                '  <select class="tiaojian select-clear" ng-model="hosCondition.djmc" ng-change="select()">\n' +
                '      <option value="">医院等级</option>\n' +
                '      <option ng-repeat="djmc in djmcArray" value="{{djmc}}">{{djmc | limitTo:4}}</option>\n' +
                '  </select>\n' +
                '  <select class="tiaojian select-clear" ng-model="hosCondition.lxmc" ng-change="select()">\n' +
                '      <option value="">医院类型</option>\n' +
                '      <option ng-repeat="lxmc in lxmcArray" value="{{lxmc}}">{{lxmc | limitTo:4}}</option>\n' +
                '  </select>\n' +
                '</div>',
            link: function ($scope, $element, $attr, ngModelCtrl) {
                $scope.disArray = ['10公里内', '20公里内', '其他'];
                //等级筛选
                $scope.djmcArray = $scope.hospitalData
                    .map(function (hospital) {
                        return hospital.djmc; //{djmc:hospital.djmc,djbm:hospital.djbm};
                    })
                    .filter(function (djmc, index, arr) {
                        return (arr.indexOf(djmc, index + 1) === -1);
                    });
                $scope.lxmcArray = $scope.hospitalData
                    .map(function (hospital) {
                        return hospital.lxmc; //{djmc:hospital.djmc,djbm:hospital.djbm};
                    })
                    .filter(function (lxmc, index, arr) {
                        return (arr.indexOf(lxmc, index + 1) === -1);
                    });
                $scope.select = function () {
                    $scope.selectChange();
                };
            }
        };
    }])
    /**
     * 医院筛选filter
     */
    .filter('hosFilter', [function () {
        return function (hospital, condition) {
            var data = condition;
            return !hospital ? [] : hospital.filter(function (e) {
                return ((!data.djmc || e.djmc === data.djmc) &&
                    (!data.lxmc || e.lxmc === data.lxmc) &&
                    ((!data.distance && e.distance) || ((data.distance === '其他') && (e.distance > 20)) || parseFloat(e.distance) <= parseFloat(data.distance)));
            });
        };
    }])
    /**
     * 人体图片反转实现指令
     */
    .directive('myTouch', ['$log', '$window', function ($log, $window) {
        return {
            scope: {
                // myTouch: '&',
            },
            restrict: 'A',
            link: function ($scope, iElm, iAttrs, controller) {
                var ele = iElm[0];
                var ele1 = iElm.children()[0];
                var ele2 = iElm.children()[1];
                var startX;
                var endX;
                var deg;
                var Math = $window.Math;

                ele.parentElement.style.perspective = '1000px';

                iElm.bind('touchstart', startHandler);
                iElm.bind('touchmove', moveHandler);
                iElm.bind('touchend', endHandler);
                iElm.bind('touchcancel', endHandler);

                //中途加入touch处理
                function startHandler(e) {
                    startX = getCenter(e.touches);
                    ele1.style.transition = '';
                    ele2.style.transition = '';
                    deg = ele1.style.transform.match(/rotateY\((.+)deg/);
                    deg = deg ? +deg[1] : 0;
                }

                //控制样式
                function moveHandler(e) {
                    var offsetXRate = (getCenter(e.touches) - startX) / (ele.clientWidth / 3);
                    ele1.style.transform = 'translate(-50%,-50%) rotateY(' + (deg + 90 * offsetXRate) + 'deg)';
                    ele2.style.transform = 'translate(-50%,-50%) rotateY(' + (180 + deg + 90 * offsetXRate) + 'deg)';
                }

                //处理结果
                function endHandler(e) {
                    endX = getCenter(e.changedTouches);
                    ele1.style.transition = 'all 0.3s ease';
                    ele2.style.transition = 'all 0.3s ease';
                    finish();
                }

                /**
                 * 通过三角函数确定回弹还是发射
                 */
                function finish() {
                    deg = ele1.style.transform.match(/rotateY\((.+)deg/);
                    deg = deg ? +deg[1] : 0;
                    var sign = Math.cos(deg / 360 * 2 * Math.PI) > 0;
                    deg = sign ? Math.round(deg / 360) * 360 : Math.round(deg / 180) * 180;
                    ele1.style.transform = 'translate(-50%,-50%) rotateY(' + (deg) + 'deg)';
                    ele2.style.transform = 'translate(-50%,-50%) rotateY(' + (180 + deg) + 'deg)';
                }

                function cancel(e) {
                    finish();
                }

                /**
                 * 获取触摸中心
                 * @param touchlist touch事件的touches属性
                 * @returns {*}
                 */
                function getCenter(touchlist) {
                    if (touchlist.length === 1) {
                        return touchlist[0].clientX;
                    } else {
                        var centerX = 0;
                        angular.forEach(touchlist, function (touch) {
                            centerX += touch.clientX;
                        });
                        return centerX / touchlist.length;
                    }
                }
            }

        };
    }])
    /**
     * 自定搜索框元素指令<xwyw-search placeHolder="" search-action=""></xywy-search>
     */
    .directive('xywySearch', [function () {
        return {
            restrict: 'E',
            scope: {
                placeHolder: '@',
                searchAction: '&'
            },
            require: 'ngModel',
            template: '\n' +
                '            <div class="searchdiv">\n' +
                '                <div>\n' +
                '                    <input type="search" placeholder="{{placeHolder}}" required ng-model="keyword" value="">\n' +
                '                    <i ng-click="clean()" class="ion-close-circled"></i>\n' +
                '                    <button class="ion-android-search" ng-click="searchAction()"></button>\n' +
                '                </div>\n' +
                '            </div>',
            link: function ($scope, $ele, $attr, ngModelCtrl) {
                $scope.clean = function () {
                    $scope.keyword = '';
                };
                $scope.$watch('keyword', function () {
                    ngModelCtrl.$setViewValue($scope.keyword);
                });
                ngModelCtrl.$render = function () {
                    $scope.keyword = ngModelCtrl.$viewValue;
                };

            }

        };
    }])
    /**
     * 选城市组件<choose-city city-choose="fun()"></choose-city>
     */
    .directive('chooseCity', ['CitiesAndLevel', '$location', '$anchorScroll', 'locHistory', 'Popup',
        function (CitiesAndLevel, $location, $anchorScroll, locHistory, Popup) {
            return {
                restrict: 'E',
                scope: {
                    cityChoose: '&'
                },
                // require: 'ngModel',
                templateUrl: 'components/choosecity.html',
                link: function ($scope, $element, $attr) {

                    // ngModelCtrl.$render = function () {
                    //     $element.val(ngModelCtrl.$viewValue);
                    // };

                    // $element.on('set', function (args) {
                    //     $scope.$apply(function () {
                    //         ngModelCtrl.$setViewValue($element.val());
                    //     });
                    // });
                    CitiesAndLevel.getCities().then(
                        function (data) {
                            $scope.cityData = data;
                        }
                    ).catch(Popup.alert);
                    //删除历史纪录
                    $scope.delhistory = locHistory.removHis;
                    $scope.cityhistory = locHistory.getHis();
                    //定位跳转
                    $scope.goto = function (id) {
                        var newHash = 'anchor' + id;
                        if ($location.hash() !== newHash) {
                            var url = $location.url();
                            url = url.substr(0, url.indexOf('#'));
                            $location.url(url + '#' + newHash).replace();
                        } else {
                            $anchorScroll();
                        }
                    };

                    //对内部choose方法完成调用后执行外部方法
                    $scope.choose = function (city) {
                        locHistory.setHistory(city);
                        return $scope.cityChoose({
                            city: city
                        });
                    };
                }
            };
        }
    ])

    /**
     * 判断是否交互问题，无则直接跳过，推荐科室
     * 确保不会返回到空白页
     */
    .factory('testHref', ['$state', '$window', '$location', '$stateParams',
        function ($state, $window, $location, $stateParams) {
            return function () {
                var stateName = $state.current.name;
                var regE = new RegExp(stateName);
                if (!regE.test($window.location.href)) {
                    // $location.state($state.current)//href(stateName,{$stateParams}));
                    $window.history.pushState(null, null, $state.href(stateName, $stateParams));
                }
            };
        }
    ])
    /**
     * 历史位置记录获取service
     */
    .factory('locHistory', ['$window', function ($window) {
        var cityhistory;

        function get() {
            cityhistory = angular.fromJson(localStorage.getItem('cityhistory')) || [];
            return true;
        }

        /**
         * 历史城市是否包含新选择城市
         * @param city 新选择城市
         * @returns {number} 索引
         */
        function containCity(city) {
            for (var i = cityhistory.length - 1; i >= 0; i--) {
                if (cityhistory[i].csdm === city.csdm) {
                    return i;
                }
            }
        }

        return {
            getHis: function () {
                if (cityhistory || get()) {
                    return cityhistory;
                }
            },
            //清除历史记录
            removHis: function () {
                cityhistory.length = 0;
                localStorage.removeItem('cityhistory');
            },
            /**
             * 加入新历史纪录
             * @param city 城市对象，历史数据或后台请求数据
             * @returns city
             */
            setHistory: function (city) {
                get();
                var index = containCity(city);
                if (angular.isNumber(index)) {
                    cityhistory.splice(index, 1);
                } else if (cityhistory.length === 9) {
                    cityhistory.length = 8;
                }
                cityhistory.unshift(city);
                //limitPush(cityhistory,city,'csdm',9);
                localStorage.setItem('city', JSON.stringify(city));
                localStorage.setItem('cityhistory', JSON.stringify(cityhistory));
                return city;
            },
            //             limitPush:limitPush
        };
    }])
    /**
     * 获取城市列表数据和医生职级合并请求
     */
    .factory('CitiesAndLevel', ['XywyService', '$q', '$window', function (XywyService, $q, $window) {
        var self = this;

        function getCitiesAndLevel(deferred, key) {
            XywyService.query("/getCitiesAndLevel", {
                cache: true
            }).then(function (response) {
                self.cities = response.data.cities;
                self.level = response.data.level;
                localStorage.setItem('level', angular.toJson(response.data.level));
                localStorage.setItem('cities', angular.toJson(response.data.cities));
                deferred.resolve(self[key]);
            }, function (response) {
                console.error('城市请求错误');
                deferred.reject('获取城市列表失败！');
            });
        }

        function checkExist(name) {
            if (localStorage[name]) {
                self[name] = angular.fromJson(localStorage.cities);
                return true;
            }
        }

        function get(deferred, key) {
            if (self[key] || checkExist(key)) {
                deferred.resolve(self[key]);
            } else {
                getCitiesAndLevel(deferred, key);
            }
            return deferred.promise;
        }

        return {
            getCities: function () {
                return get($q.defer(), 'cities');
            },
            getLevel: function () {
                return get($q.defer(), 'level');
            }
        };
    }])
    /**
     * 获取位置，通过历史纪录，微信接口，HTML5原生接口，或者演示数据
     */
    .factory('geoLocation', ['XywyService', 'CitiesAndLevel', 'locHistory', '$q', 'wxApi', '$location', '$window',
        function (XywyService, CitiesAndLevel, locHistory, $q, wxApi, $location, $window) {
            /**
             * 获取当前城市
             * @param location 经纬度
             * @returns {Promise}
             */
            function currentCity(location) {
                var deferred = $q.defer();
                var config = {
                    params: {
                        location: location.longitude + ',' + location.latitude
                    },
                    cache: false
                };
                $q.all([CitiesAndLevel.getCities(), XywyService.query("/getCity", config)]).then(
                    function getOwnCity(response) {
                        var city = {
                            mc: response[1].data.city,
                            csdm: response[1].data.csdm,
                            pinyin: response[1].data.pinyin
                        };
                        //根据首字母取出城市列表
                        var cities = response[0][city.pinyin];
                        if (cities && cities.length) {
                            var matched = false;
                            for (var i = 0, len = cities.length; i < len; i++) {
                                //找到对应城市的代码
                                if (city.csdm === cities[i].csdm) {
                                    self.city = cities[i];
                                    matched = true;
                                    deferred.resolve(self.city);
                                    break;
                                }
                            }
                            if (!matched) {
                                deferred.reject('城市匹配失败！');
                            }
                        } else {
                            deferred.reject('城市列表为空！');
                        }
                    },
                    function (response) {
                        deferred.reject(response);
                    }
                );
                return deferred.promise;
            }


            var self = this;

            //保存经纬度
            function storeLocation(location) {
                self.location = {
                    latitude: location.latitude,
                    longitude: location.longitude
                };
                localStorage.setItem('location', angular.toJson(self.location));
                return self.location;
            }

            //通过浏览器api获取位置
            function browserLocation(reason) {
                return $q(function (resolve, reject) {
                    if (($window.navigator.geolocation) && ($location.protocol() === 'https' || $location.host() === 'localhost')) {
                        $window.navigator.geolocation.getCurrentPosition(
                            function (position) {
                                resolve(position.coords);
                            },
                            function (error) {
                                reject(reason || error);
                            });
                    }
                    reject(reason || '无法使用定位！');
                });
            }

            /**
             * 获取经纬度，优先使用wx接口
             */
            function getLocation() {
                return wxApi.getLocation().then(storeLocation, browserLocation).catch(function (reason) {
                    if (self.location) {
                        return self.location;
                    } else if (localStorage.getItem('location')) {
                        self.location = angular.fromJson(localStorage.getItem('location'));
                        return self.location;
                    } else if (!$window.navigator.userAgent.toLowerCase().match(/MicroMessenger/i)) {
                        //公司坐标 最后手段 测试 演示用
                        self.location = {
                            latitude: 39.552673,
                            longitude: 116.77389
                        };
                        localStorage.setItem('location', JSON.stringify(self.location));
                        return self.location;
                    } else {
                        return $q.reject(reason);
                    }
                });

            }

            return {
                /**
                 * 获取城市对象
                 * @returns {promise}
                 */
                getCity: function () {
                    var deferred = $q.defer();
                    if (self.city) {
                        deferred.resolve(self.city);
                        return deferred.promise.then(locHistory.setHistory);
                    } else if (localStorage.getItem('city')) {
                        deferred.resolve(angular.fromJson(localStorage.getItem('city')));
                        return deferred.promise;
                    } else {
                        return getLocation().then(currentCity).then(locHistory.setHistory);
                    }
                },
                /**
                 * 获取坐标
                 */
                getGeo: getLocation
            };
        }
    ])
    /**
     * 统一接受外部跳转，向外部跳转
     */
    .service('Outlet', ['$state', '$window', '$log', 'projectConfig', function ($state, $window, $log, projectConfig) {
        var openId;
        /**
         * 与医信助手协商接口
         * @param state 页面名
         * @param id 用户id
         * @param orgCode 组织机构代码
         * @constructor
         */
        this.Enter = function (state, id, orgCode) {
            openId = id;
            // projectConfig.yiyuanEdition = true;
            $window.sessionStorage.setItem('openId', id);
            //缓存医院编码
            if (orgCode !== myConfig.hosOrgCode) {
                $log.error("医院编码不一致");
            }
            $window.sessionStorage.setItem('yybm', orgCode);
            $state.go(state, {}, {
                location: 'replace'
            });
        };
        //weiindex
        //url 医信助手state url，option 数组
        this.Leave = function (url, option) {
            //默认首页
            url = url || 'weiindex';
            /*            if(projectConfig.yiyuanEdition){
                            $log.log(myConfig.yxzsurl + '/views/www/index.html#/' + url + '/' + option.join('/'));
                        }else{
                            $window.location.href = myConfig.yxzsurl + '/views/www/index.html#/' + url + '/' + option.join('/');
                        }*/
            $window.location.href = myConfig.yxzsurl + '/views/www/index.html#/' + url + '/' + option.join('/');
        };
    }])
    /**
     * 通过input：checked伪类实现折叠，在此指令后元素加inputPanel类名
     */
    .directive('checkLabel', ['$window', function ($window) {
        return {
            restrict: 'AE',
            transclude: 'true',
            scope: {
                labelChecked: '=',
                labelTitle: '@',
            },
            // replace:true,
            template: '<label for="{{randomId}}" class="mainpadding item" style="line-height:1.5">' +
                '   <span class=" inline" style="float:left" ng-bind="labelTitle"></span>' +
                '   <i ng-class="[labelChecked ? \'ion-chevron-down\' : \'ion-chevron-up\',\'flexcloumn\',\'menu-tip\']"></i>' +
                '</label>\n' +
                '<input type="checkbox" class="hide" ng-model="labelChecked" id="{{randomId}}">',
            link: function ($scope, $element) {
                //通过16进制生成随机id
                $scope.randomId = $window.Math.random().toString(16).slice(2);
                $element.append($element.next()[0]);
            }
        };
    }])

    /**
 * 对话消息类型
 */
    .service('Message', ['$window', '$state', 'XywyService', function ($window, $state, XywyService) {
        //data后台返回数据，user[Boolean] 是否用户消息
        /*
        定义不同结果不同行为
         */
        function goJYDetail(siglId) {
            $state.go('jianyanzhibiao', {
                id: siglId
            });
        }

        function goJCDetail(siglId) {
            $state.go('jianchajielun', {
                id: siglId
            });
        }

        function goYPDetail(siglId) {
            $state.go('wenyaodetail', {
                id: siglId
            });
        }
        //常见症状
        function goCJZZDetail(siglId) {
            $state.go('changjianzzdetail', {
                id: siglId
            });
        }

        function goSSDetail(siglId) {
            $state.go('wenshoushudetail', {
                id: siglId
            });
        }

        function goJBDetail(siglId) {
            $state.go('wenjibingdetail', {
                id: siglId
            });
        }

        var detailes = {
            jyjg: {
                action: goJYDetail,
                conditionText: '检验结果：'
            },
            jcjg: {
                action: goJCDetail,
                conditionText: '检查结论：'
            },
            ypjg: {
                action: goYPDetail
                // conditionText:'检查结论：'
            },
            ssjg: {
                action: goSSDetail
            },
            jbjg: {
                action: goJBDetail
            },
            cjzzjg: {
                action: goCJZZDetail
            }
        };

        function Message(data, user) {
            if (!(this instanceof Message)) {
                return new Message(data, user);
            }
            this.type = data.type;
            this.subType = data.subType;
            //通过subType定义同一类型不同行为（如检查、检验跳转到不同页面）
            if (data.subType && detailes[data.subType]) {
                this.detailAction = detailes[data.subType].action;
                this.conditionText = detailes[data.subType].conditionText;
            }
            this.message = data.message;
            //result类型 特殊控制
            if (this.type === 'result' && (!data.message || data.message === data.radioMsg)) {
                this.message = data.radioMsg;
                this.sameMsg = true;
            }
            this.list = data.list;
            this.user = user;
            this.radioMsg = data.radioMsg;
            this.fresh = data.fresh;
            this.siglId = data.siglId;
            this.processGn = data.processGn;
            this.isshowxq = data.isshowxq;
            this.resData = data.resData;
            // 查找科室是否有医院排名数据
            if (data.tjkslist && !(sessionStorage.getItem('hosorgCode'))) {
                data.tjkslist.forEach(function (value, index, array) {
                    var para = {
                        ksmc: value.xxdxkdis
                    };

                    $.ajax({
                        url: myConfig.serverUrl + '/getzjksyy',
                        data: para,
                        type: "GET",
                        async: false,
                        success: function (response) {
                            response = angular.fromJson(response);
                            if (response && response.length && response.length > 0) {
                                value['noHospital'] = false;
                            } else {
                                value['noHospital'] = true;
                            }
                        }
                    });

                });
            } else if (sessionStorage.getItem('ksSwitch') == 'success') {
                angular.forEach(data.tjkslist, function (value, index, array) {
                    value['isShowRegister'] = true;
                })
            }
            this.tjkslist = data.tjkslist;
            this.processNo = data.processNo;
            this.newSearchFlag = data.newSearchFlag;
            this.haveMore = data.haveMore;
            this.lastnum = data.lastnum;
            this.laiyuan = data.laiyuan;
            this.jhwdgz = data.jhwdgz;
            this.userjl = data.userjl;
            this.tjksmessage = data.tjksmessage;
            this.isshowhyp = data.isshowhyp;
            this.isShowDianZan = data.isShowDianZan;
            this.liucheng = data.liucheng;
        }

        return Message;
    }])
    /**
     * 消息元素指令
     * <message-dialog message-data="Message"></message-dialog>
     */
    .directive('messageDialog', ['XywyService', 'Message', '$ionicModal', '$window', '$rootScope', '$stateParams', '$state', '$timeout', 'baiduAudio', 'audioControl', 'wxApi', 'Popup', '$q', '$ionicScrollDelegate', 'GoZzJbYp', 'UserInfoService',
        function (XywyService, Message, $ionicModal, $window, $rootScope, $stateParams, $state, $timeout, baiduAudio, audioControl, wxApi, Popup, $q, $ionicScrollDelegate, GoZzJbYp, UserInfoService) {

            var chicked = false;
            var scrollHeight = 0;
            //其他文本框内容
            var inputContent = '';
            var isIos = false;
            if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
                isIos = true;
                sessionStorage.setItem('isIos', isIos);
            }
            return {
                restrict: 'AE',
                scope: {
                    messageData: '=',
                    isIos: '=',
                },
                templateUrl: myConfig.xywydevlop == true ? 'components/dialogdev.v1001.html' : 'components/dialog.v1001.html',
                link: function ($scope, $element) {

                    $scope.isIos = $scope.isIos;
                    // console.log($scope.messageData,"344")
                    // $scope.healthCare =$scope.healthCare
                    $scope.messageArr = [];
                    $scope.deabloom = true;
                    $scope.index = 0;
                    $rootScope.$on('panduan', function (e, m) {
                        $scope.deabloom = false;
                    });
                    $scope.data = {};
                    $scope.imgBaseUrl = myConfig.imgBaseUrl;
                    //select选择的排序名称
                    $scope.orderNames = ["默认排序", "热度排序"];
                    $scope.selectedOrder = $scope.orderNames[0];
                    //$scope.orderNames = {"默认排序":"","权重排序":"CJ_ZZ_SX"};
                    //$scope.selectedOrder = Object.keys($scope.orderNames);
                    //判断是否是自我苹果和常见症状
                    if ($stateParams.gn == "ZWPG") {
                        $scope.showSelect = true;
                    }
                    if ($stateParams.gn == "CJZZ") {
                        $scope.showSelect = true;
                    }
                    var scrollDelegate = $ionicScrollDelegate.$getByHandle('small');
                    setTimeout(function () {
                        var doctors = $(".ys");
                        if (doctors.length > 0) {
                            var last = doctors[doctors.length - 1];
                            var h = last.offsetTop-8;
                            scrollDelegate.scrollTo(0, h, true);
                        }

                    }, 300);
                    // var scrollDelegate = $ionicScrollDelegate.$getByHandle('small');
                    // var parent = $element.parent();
                    // $scope.scroll = function () {
                    //     $timeout(function () {
                    //         scrollDelegate.resize();
                    //     });
                    // };


                    // $timeout(function () {
                    //     var div = $element[0].querySelector('[panel]');
                    //     if (div && div.offsetHeight > $window.innerHeight * 0.75) {
                    //         // if(div.offsetHeight > 10){
                    //         $scope.data = angular.extend($scope.data, {
                    //             showAll: true,
                    //             limitHeight: true
                    //         });
                    //     }
                    //     $timeout(function () {
                    //         //获取当前对话框高度
                    //         var divheight = $element[0].children[0].clientHeight;
                    //         scrollDelegate.resize();
                    //         scrollHeight = parent[0].scrollHeight;
                    //         //                        	当前总高度-当前最新对话框高度来确定显示位置
                    //         scrollDelegate.scrollTo(0, scrollHeight - divheight, true);
                    //         //                        	判断duodetail上详细信息的横线是否需要展示
                    //         var audiocon = document.querySelectorAll('[showaudio]');
                    //         if ((audiocon.length > 0) && audiocon[audiocon.length - 1].className == "hide") {
                    //             $scope.showHr = false;
                    //         } else {
                    //             $scope.showHr = true;
                    //         }
                    //     });
                    // });


                    if ($scope.messageData.user) {
                        var txNc = UserInfoService.getTxNc();
                        if (txNc.wzrTx) {
                            $scope.imgurl = txNc.wzrTx;
                        }
                        else {
                            $scope.imgurl = txNc.tx;
                        }

                        // if (localStorage.getItem('userTx')) {
                        //     $scope.imgurl = localStorage.getItem('userTx');
                        // } else {
                        // var openid = sessionStorage.getItem("openId");
                        // var param = { openid: openid };
                        // var config = {
                        //         params: param
                        //     }
                        //     //获取用户头像
                        // $scope.imgurl = "img/hz.png"; //用户默认头像
                        // XywyService.query("/querynicheng", config).then(function(response) {
                        //     if (response.data) {
                        //         if (response.data.imgurl) {
                        //             $scope.imgurl = response.data.imgurl;
                        //         }

                        //     }
                        //     localStorage.setItem('userTx', $scope.imgurl);
                        // });

                        //}

                    }


                    // 科室是否有医院排名数据
                    if (sessionStorage.getItem('ksSwitch') == 'failed' && $scope.messageData.resData) {
                        $scope.ksList = [];
                        //是否是医院版
                        if (sessionStorage.getItem('hosorgCode')) {
                            $scope.ksList = $scope.messageData.resData;
                        } else {
                            for (var i = 0; i < $scope.messageData.resData.length; i++) {
                                var obj = {
                                    type: $scope.messageData.resData[i].type,
                                    xxdxkdis: $scope.messageData.resData[i].xxdxkdis,
                                    number: $scope.messageData.resData[i].number,
                                    noHospital: true
                                };

                                var para = {
                                    ksmc: obj.xxdxkdis
                                };

                                $.ajax({
                                    url: myConfig.serverUrl + '/getzjksyy',
                                    data: para,
                                    type: "GET",
                                    async: false,
                                    success: function (response) {
                                        response = angular.fromJson(response);
                                        if (response && response.length && response.length > 0) {
                                            obj.noHospital = false;
                                        }
                                    }
                                });

                                $scope.ksList.push(obj)
                            }
                        }

                        //console.log( $scope.ksList);
                    } else if (sessionStorage.getItem('ksSwitch') == 'success') {
                        $scope.ksList = [];
                        angular.forEach($scope.messageData.resData, function (value, index, array) {
                            value['isShowRegister'] = true;
                            $scope.ksList.push(value);
                        })
                    }

                    // 科室是否有医院排名数据
                    if ($scope.messageData.list && $scope.messageData.list.length > 0 && $scope.messageData.list[0].type == "科室") {
                        $scope.tjksList = [];
                        //是否为医院版
                        if (sessionStorage.getItem('hosorgCode')) {
                            //$scope.tjksList = $scope.messageData.list;
                            if ($scope.messageData.tjkslist) {
                                $scope.tjksList = $scope.messageData.tjkslist;
                            } else {
                                $scope.tjksList = $scope.messageData.list;
                            }
                        } else {
                            for (var i = 0; i < $scope.messageData.list.length; i++) {
                                var obj = {
                                    type: $scope.messageData.list[i].type,
                                    xxdxkdis: $scope.messageData.list[i].xxdxkdis,
                                    noHospital: true
                                };
                                if ($scope.messageData.list[i].xxdxkdis != "下一页") {
                                    var para = {
                                        ksmc: obj.xxdxkdis
                                    };

                                    $.ajax({
                                        url: myConfig.serverUrl + '/getzjksyy',
                                        data: para,
                                        type: "GET",
                                        async: false,
                                        success: function (response) {
                                            response = angular.fromJson(response);
                                            if (response && response.length && response.length > 0) {
                                                obj.noHospital = false;
                                            }
                                        }
                                    });

                                }

                                $scope.tjksList.push(obj);
                            }
                        }

                    }
                    //医保地区下拉列表
                    if ($scope.messageData.resData) {
                        var shiJianDList = $scope.messageData.resData.resData
                        $scope.healthCare = '国家'
                        $scope.index++
                        if ($scope.index != 0) {
                            $scope.healthCare = sessionStorage.getItem("healthCare")
                        }


                    }

                    $scope.sjdClick = function () {
                        var sjdDom = $(".healthCare");
                        var guanXiData = sjdDom.attr("data-gx");
                        var iosSelect = new IosSelect(1, [shiJianDList], {
                            title: '医保地区',
                            itemHeight: 35,
                            relation: [1, 1],
                            oneLevelId: guanXiData,
                            callback: function (selectOneObj) {
                                sjdDom.attr("data-gx", selectOneObj.id);
                                $scope.healthCare = selectOneObj.value
                                sjdDom.val(selectOneObj.value);
                                sessionStorage.setItem("healthCare", $scope.healthCare);
                                // $scope.healthCare = sessionStorage.getItem("healthCare")
                                // console.log( $scope.healthCare ,"123")
                                // $state.go('yaopindetails')
                                // console.log($scope.healthCare,"555")
                            }

                        });


                    };

                    //跳转药品详情
                    $scope.goyaopindetails = function (id, name) {
                        $state.go('yaopindetails', { yaopinid: id, yaopinname: name })
                    }
                    //跳转药品说明书
                    $scope.goyaopinzn = function (name) {
                        $state.go("ypznMainSearch", { ypmc: name });
                    }
                    $scope.isAudio = false;

                    //点击播放
                    $scope.clickPlay = function (voiceData) {
                        //if ($scope.messageData.user) {
                        //    wxApi.wxPromise().then(function (wx) {
                        //        wx.playVoice({localId: $scope.messageData.radioMsg});
                        //    });
                        //} else {
                        //    audioControl.pause();
                        if (typeof arguments[1] != "undefined") {
                            $scope.isAudio = audioControl.play(voiceData, "fresh");
                        }
                        else {
                            $scope.isAudio = audioControl.play(voiceData);
                        }
                        // console.log(123)
                        //}
                    };
                    if ($scope.messageData.list && $scope.messageData.list.length > 0 && $scope.messageData.type == "multiple") {
                        // var otherItem = {
                        //     xxdxkdis: '无以上症状'
                        // }
                        // $scope.messageData.list.push(otherItem);
                        $scope.listSize = $scope.messageData.list.length;
                    }
                    //自动播放
                    if ($scope.messageData.radioMsg && !$scope.messageData.user && $scope.messageData.type != "xzwzr" || ($scope.messageData.type == "xzwzr" && $scope.messageData.fresh == "1")) {
                        if (localStorage.getItem("yyzhuangtai") !== "禁止") {
                            //Popup.alert($scope.messageData.radioMsg);
                            if (isIos) {
                                //ios下自动播放
                                if (typeof WeixinJSBridge != 'undefined') {
                                    WeixinJSBridge.invoke('getNetworkType', {}, function (e) {
                                        // audioControl.play($scope.messageData.radioMsg);
                                        if (typeof $scope.messageData.fresh != "undefined")
                                            $scope.clickPlay($scope.messageData.radioMsg, "fresh");
                                        else {
                                            $scope.clickPlay($scope.messageData.radioMsg);
                                        }

                                    });
                                }

                            } else {
                                //安卓下自动播放
                                if (typeof $scope.messageData.fresh != "undefined")
                                    audioControl.play($scope.messageData.radioMsg, "fresh");
                                else {
                                    audioControl.play($scope.messageData.radioMsg);
                                }
                            }



                        }
                    }
                    // 快速问医帮助弹出框
                    $ionicModal.fromTemplateUrl('wenyi/modal.v1001.html', {
                        scope: $scope
                    }).then(function (modal) {
                        $scope.modal = modal;
                    });

                    //点击帮助
                    $scope.clickHelp = function () {
                        $scope.modal.show()
                    };
                    //浏览器版本 终端信息
                    function getBrowserInfo() {
                        var agent = navigator.userAgent.toLowerCase();
                        // console.log(agent);
                        var arr = [];
                        var system = agent.split(' ')[1].split(' ')[0].split('(')[1];
                        arr.push(system);
                        var regStr_edge = /edge\/[\d.]+/gi;
                        var regStr_ie = /trident\/[\d.]+/gi;
                        var regStr_ff = /firefox\/[\d.]+/gi;
                        var regStr_chrome = /chrome\/[\d.]+/gi;
                        var regStr_saf = /safari\/[\d.]+/gi;
                        var regStr_opera = /opr\/[\d.]+/gi;
                        //IE
                        if (agent.indexOf("trident") > 0) {
                            arr.push(agent.match(regStr_ie)[0].split('/')[0]);
                            arr.push(agent.match(regStr_ie)[0].split('/')[1]);
                            return arr;
                        }
                        //Edge
                        if (agent.indexOf('edge') > 0) {
                            arr.push(agent.match(regStr_edge)[0].split('/')[0]);
                            arr.push(agent.match(regStr_edge)[0].split('/')[1]);
                            return arr;
                        }
                        //firefox
                        if (agent.indexOf("firefox") > 0) {
                            arr.push(agent.match(regStr_ff)[0].split('/')[0]);
                            arr.push(agent.match(regStr_ff)[0].split('/')[1]);
                            return arr;
                        }
                        //Opera
                        if (agent.indexOf("opr") > 0) {
                            arr.push(agent.match(regStr_opera)[0].split('/')[0]);
                            arr.push(agent.match(regStr_opera)[0].split('/')[1]);
                            return arr;
                        }
                        //Safari
                        if (agent.indexOf("safari") > 0 && agent.indexOf("chrome") < 0) {
                            arr.push(agent.match(regStr_saf)[0].split('/')[0]);
                            arr.push(agent.match(regStr_saf)[0].split('/')[1]);
                            return arr;
                        }
                        //Chrome
                        if (agent.indexOf("chrome") > 0) {
                            arr.push(agent.match(regStr_chrome)[0].split('/')[0]);
                            arr.push(agent.match(regStr_chrome)[0].split('/')[1]);
                            return arr;
                        } else {
                            arr.push('请更换主流浏览器，例如chrome,firefox,opera,safari,IE,Edge!')
                            return arr;
                        }
                    }
                    //微信版本号
                    var wechatInfo = navigator.userAgent.match(/MicroMessenger\/([\d\.]+)/i);
                    //点击填写反馈信息
                    $scope.gofankui = function () {
                        $state.go("fankui")
                        // $scope.deabloom = false
                        // var d = $q.defer();
                        // d.resolve({deabloom: "false"});
                        // $scope.deabloom = deabloom
                    };

                    //点击点赞
                    $scope.godianzan = function () {
                        var filer = {};
                        filer.llqbb = getBrowserInfo();
                        filer.zdxx = getBrowserInfo();
                        filer.sjxt = "";
                        filer.wxbb = "";
                        if (!wechatInfo) {
                            filer.wxbb = "";
                        } else {
                            filer.wxbb = wechatInfo[1];
                        }
                        filer.ip = returnCitySN['cip'];
                        filer.hhId = $window.sessionStorage.getItem('hhid');
                        filer.userId = sessionStorage.getItem("openId");
                        filer.dianzan = 1;
                        XywyService.save('/pingjia/setpingjia', filer)
                            .then(function (res) {
                                Popup.alert('谢谢您的赞赏！');
                                $scope.deabloom = false
                            });

                    };


                    // 疾病手术弹出框
                    $ionicModal.fromTemplateUrl('jbssbmcx/modal.v1001.html', {
                        scope: $scope
                    }).then(function (modal) {
                        $scope.jbssmodal = modal;
                    });
                    // 疾病详情弹出框
                    $ionicModal.fromTemplateUrl('jbssbmcx/jbxqmodal.v1001.html', {
                        scope: $scope
                    }).then(function (modal) {
                        $scope.jbxqmodal = modal;
                    });

                    //详情点击事件
                    $scope.xqClick = function (id, type) {
                        var url
                        var vtitle
                        var fanwei
                        var fanweititle
                        switch (type) {
                            case "WYP":
                                url = "wenyaodetail";
                                vtitle = $scope.messageData.resData.title;
                                break;
                            case "WJB":
                                url = "wenjibingdetail";
                                vtitle = $scope.messageData.resData.title;
                                break;
                            case "JJJK":
                                url = "wenjibingdetail";
                                vtitle = $scope.messageData.resData.title;
                                break;
                            case "FYJK":
                                url = "fuYougdetail";
                                vtitle = $scope.messageData.resData.title;
                                break;
                        }
                        if (type == "WBG") {
                            vtitle = $scope.messageData.resData.title;
                            for (var i = 0; i < $scope.messageData.list.length; i++) {
                                //展示名称
                                var zsmc = $scope.messageData.list[i].title;
                                if (zsmc == "判定结果" || zsmc == "正常值范围") {
                                    fanwei = $scope.messageData.list[i].content;
                                    fanweititle = zsmc;
                                    break;
                                }
                            }
                            if ($scope.messageData.subType == "jyjg") {
                                url = "jianyanzhibiao";
                            }
                            else {
                                url = "jianchajielun";
                            }
                        }

                        $state.go(url, { id: id, estype: type, viewTitle: vtitle, fanwei: fanwei, fanweititle: fanweititle });
                    };

                    // 疾病详情按钮点击
                    $scope.jbxqClick = function (jbid) {
                        $state.go('wenjibingdetail', { id: jbid, estype: "jb" });
                        // XywyService.query("/getEsDetail", {
                        //     params: {
                        //         id: jbid,
                        //         estype: "jb"
                        //     },
                        //     cache: true
                        // }).then(function (data) {
                        //     $scope.jbxq = {};
                        //     var self = $scope.jbxq;
                        //     self.haveResult = true;
                        //     self.items = [];
                        //     var push = Array.prototype.push.bind(self.items);
                        //     self.title = data.jbmc;
                        //     var jkzd = data.jkzd;
                        //     if (jkzd) {
                        //         jkzd = data.jkzd.replace(/健康指导：|健康指导:|健康指导/, "");
                        //         jkzd = jkzd.trim();
                        //         jkzd = jkzd.replace(/\ +/g, "");
                        //     }
                        //     push({
                        //         title: '疾病描述',
                        //         content: data.jbms,
                        //         show: true
                        //     });
                        //     push({
                        //         title: '治疗意见',
                        //         content: data.zlyz,
                        //         show: true
                        //     });
                        //     push({
                        //         title: '健康指导',
                        //         content: jkzd,
                        //         show: true
                        //     });
                        //     push({
                        //         title: '临床表现',
                        //         content: data.lcbx,
                        //         show: true
                        //     });
                        //     push = null;
                        //     $scope.jbxqmodal.show();
                        // }, Popup.alert);
                    };


                    //向外发送消息
                    $scope.modalSubmit = function (userChoose) {
                        $scope.modalData = {};
                        $scope.jbssmodal.hide();
                        $rootScope.$broadcast('userSubmit', {
                            input: userChoose
                        });
                    };



                    // 点击类目按钮开关事件
                    $scope.switchBtn = function (event, index) {
                        var parent = event.target.parentElement.parentElement;
                        var btnP = parent.querySelector("div");
                        var ul = parent.querySelector("ul");
                        var beforPn = parent.parentElement.querySelector(".btn-pn");
                        if (beforPn) {
                            beforPn.className = "hide";
                            var beforul = beforPn.parentElement.querySelector("ul");
                            beforul.className = '';
                        }
                        if (beforPn != btnP) {
                            if (btnP) {
                                if (btnP.className == "hide") {
                                    btnP.className = "btn-pn";
                                    ul.className = 'cur';
                                } else {
                                    btnP.className = "hide";
                                    ul.className = '';
                                }
                            }
                        }

                    };

                    function copyTextToClipboard(text) {
                        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
                            // ios复制
                            var span = document.createElement("span")
                            span.style.webkitUserSelect = "text";

                            span.innerText = text;

                            document.body.appendChild(span)
                            var range = document.createRange();
                            // 选中需要复制的节点    
                            range.selectNode(span);
                            // 执行选中元素    
                            window.getSelection().addRange(range);

                            try {
                                var isSuc = document.execCommand('copy');
                                var msg = isSuc ? '成功' : '失败'
                                //console.log('复制内容 ' + msg);
                                Popup.alert('复制' + msg + "！")

                            } catch (err) {
                                //console.log('不能使用这种方法复制内容')
                                Popup.alert('复制失败！')
                            }

                            document.body.removeChild(span)

                        } else {
                            //Andrio 复制
                            var textArea = document.createElement("textarea")
                            textArea.style.position = 'fixed'
                            textArea.style.top = 0
                            textArea.style.left = 0
                            textArea.style.width = '2em'
                            textArea.style.height = '2em'
                            textArea.style.padding = 0
                            textArea.style.border = 'none'
                            textArea.style.outline = 'none'
                            textArea.style.boxShadow = 'none'
                            textArea.style.background = 'transparent'
                            textArea.value = text
                            document.body.appendChild(textArea)
                            textArea.select()

                            try {
                                var msg = document.execCommand('copy') ? '成功' : '失败'
                                //console.log('复制内容 ' + msg);
                                Popup.alert('复制' + msg + "！")
                            } catch (err) {
                                //console.log('不能使用这种方法复制内容')
                                Popup.alert('复制失败！')
                            }

                            document.body.removeChild(textArea)
                        }
                    }

                    $scope.copyLine = function (item) {
                        var t = item.mc + " ";
                        if (item.zybm) {
                            t = t + item.zybm;
                        } else {
                            t = t + item.fjbm;
                        }

                        copyTextToClipboard(t);
                    };


                    // 类目详情按钮点击
                    $scope.curJbSs = "";
                    $scope.curBm = "";
                    $scope.lmxqClick = function (event, item) {
                        // if (event.target.getAttribute("data")) {
                        //     var num = event.target.getAttribute("data").substring(2);
                        //     localStorage.setItem("jblm", num);
                        // }

                        var bm;
                        if (item.zybm) {
                            bm = item.zybm;
                        } else {
                            bm = item.fjbm;
                        }
                        $state.go('typedetail', { bm: bm, lx: item.qf, name: item.mc });
                        // $scope.curBm = bm.substring(0, bm.length - 2);
                        // if ($scope.curJbSs.zybm != bm && $scope.curJbSs.fjbm != bm) {
                        // $scope.modalData = {};
                        // $scope.curJbSs = item;
                        // var param = {
                        //     bm: bm,
                        //     lx: item.qf
                        // }
                        // var config = {
                        //     params: param
                        // }
                        // // 查询类目信息
                        // XywyService.query("/bianmachaxun/chaxunlm", config).then(function (response) {
                        //     $scope.modalData = response.data;
                        //     $scope.modalNum = num;
                        //     $scope.jbssmodal.show();
                        // }, Popup.alert);
                        // } else {
                        //     $scope.jbssmodal.show();
                        // }
                    };

                    // 离开页面隐藏弹框
                    $scope.$on("$destroy", function () {
                        if ($scope.modal) {
                            $scope.modal.remove();
                        }
                        if ($scope.jbssmodal) {
                            $scope.jbssmodal.remove();
                        }
                        if ($scope.jbxqmodal) {
                            $scope.jbxqmodal.remove();
                        }
                        sessionStorage.setItem("healthCare", "国家")
                    });

                    //点击播放2,用于症状评估带症状描述的提问
                    $scope.clickPlay2 = function () {
                        if ($scope.messageData.radioMsg) {
                            audioControl.play($scope.messageData.radioMsg);
                        } else {
                            if ($scope.messageData.user) {
                                wxApi.wxPromise().then(function (wx) {
                                    wx.playVoice({
                                        localId: $scope.messageData.radioMsg
                                    });
                                });
                            } else {
                                audioControl.play($scope.messageData.message ? $scope.messageData.message : $scope.messageData.radioMsg);
                            }
                        }
                    };

                    //触发已选择
                    $scope.clickAction = function (item) {
                        $scope.messageData.clicked = true;
                    };
                    $scope.submitAction = function (inputContent) {
                        if (typeof (inputContent) == 'undefined' || inputContent == null || inputContent == '') {
                            Popup.alert("检验数值为空或格式错误！");
                            return false;
                        } else {
                            if (!isNaN(inputContent)) {
                                $scope.clickAction();
                                $scope.submit(inputContent)
                            } else {
                                Popup.alert("检验数值格式错误！");
                                return false;
                            }
                        }
                    };
                    /**
                     * 血压、BMI特殊输入框处理（两个输入框）
                     * inputone 第一个输入框的值
                     * inputtwo 第二个输入框的值
                     * leixing 类型 是血压还是身体质量指数
                     */
                    $scope.xueyabmiAction = function (inputone, inputtwo, leixing) {
                        if (typeof (inputone) == 'undefined' || inputone == null || inputone == '' || typeof (inputtwo) == 'undefined' || inputtwo == null || inputtwo == '') {
                            Popup.alert("检验数值为空或格式错误！");
                            return false;
                        } else {
                            if (!isNaN(inputone) && !isNaN(inputtwo)) {
                                $scope.clickAction();
                                var inputContent = inputone + "/" + inputtwo + "/" + leixing;
                                $scope.submitXueyaBmi(inputContent, leixing + " " + inputone + "/" + inputtwo)
                            } else {
                                Popup.alert("检验数值格式错误！");
                                return false;
                            }
                        }
                    };
                    //监听事件控制消息是否过期
                    (function () {
                        if ($scope.messageData.newSearchFlag) {
                            //使以前消息失效
                            $rootScope.$broadcast('newSearch');
                        }
                        if ($scope.messageData.type !== 'text') {
                            var movelistener = $scope.$on('newSearch', function () {
                                $scope.clickAction();
                                movelistener();
                            });
                        }
                    })();
                    //向外发送消息
                    $scope.submit = function (userChoose,id,type) {
                        $rootScope.$broadcast('userSubmit', {
                            input: userChoose,
                            processNo: $scope.messageData.processNo,
                            jhwdgz: $scope.messageData.jhwdgz,
                            id:id,
                            type:type
                        });
                    };

                    //发送血压和体重指数的消息
                    $scope.submitXueyaBmi = function (userChoose, displaystr) {
                        $rootScope.$broadcast('userSubmit', {
                            input: userChoose,
                            displaystr: displaystr
                        });
                    };

                    $scope.fankui = function (bool) {
                        $scope.fk = true;
                        if (bool) {
                            $rootScope.$broadcast('fankui', true);
                        } else {
                            $rootScope.$broadcast('fankui', false);
                        }
                    };
                    /**
                     * 挂号功能跳转
                     * */
                    $scope.hosRegister = function ($index, item) {
                        //console.log(sessionStorage.getItem("sessionHhid"));
                        if (item.type === "科室") {
                            var hosorgcode = sessionStorage.getItem('hosorgCode');
                            XywyService.query("/yiyuanVersion/getkeshiZhuanhuanUrl", {
                                params: {
                                    yiyuanBm: hosorgcode
                                }
                            }).then(
                                function (response) {
                                    var url = response.data.guahaoUrl;
                                    window.location.href = url + "/views/www/index.html#/yisheng/" + item.depCode + "/" + sessionStorage.getItem("sessionHhid");
                                }
                            );
                        }
                    };

                    //点击指标检验中的指标项传过来复合条件
                    $scope.selectHBTiaoJian = function (flmc, xmmc, zbmc, flIndex, xmIndex, $index) {
                        var hbmc = flmc + "fgfh" + xmmc + "fgfh" + zbmc;
                        $scope.choosIndex1 = flIndex;
                        $scope.choosIndex2 = xmIndex;
                        $scope.choosIndex3 = $index;
                        $scope.submit(hbmc);
                        $timeout(function () {
                            $scope.chooseAnswer[flIndex, xmIndex, $index] = false;
                        }, 1000);
                    }
                    // 家庭健康档案
                    $scope.jtjkda = function () {
                        var openid = sessionStorage.getItem("openId");
                        $state.go('tiJianBaoGao', {
                            type: '3',
                            id: openid
                        });

                    }
                    $scope.selectOption = function ($index, item,type) {
                        console.log("123")
                        $('.button-textbs').attr('disabled', "true"); //设置无其他症状伴随按钮不可用（当用户输入其他伴随症状时设置为不可用）
                        if (item.type == "bgjd") {
                            $scope.jtjkda()
                            return
                        }
                        if (item.type === "科室") {
                            $state.go("guahao", {
                                cgks: item.xxdxkdis,
                                recordId: "1111111"
                            });
                            //                        	var citydm=sessionStorage.getItem("citydm");
                            //                        	if(citydm){
                            //                        		$state.go("tuijianyyks3",{cgks:item.xxdxkdis,diqubm:citydm})
                            //                        	}else{
                            //                        		Popup.alert("请选择城市！");
                            //                        	}
                            //                            Popup.alert("暂时无法挂号！");
                            //                      挂号
                            //                            window.location.href = myConfig.yxzsurl + "/views/www/index.html#/yisheng/" + item.yyksdm;
                            return;
                        } else if (item.type === "疾病") {
                            //                        	详情页面返回交互页面时清空wenzzxqshow内容(确保每次从交互页面进入详情页面时显示疾病介绍部分)
                            sessionStorage.setItem("wenzzxqshow", '');
                            $state.go('wenzzxq', {
                                jbmc: item.zdyresult || item.xxdxkdis
                            });
                            return;
                        } else if (item.type === "检查" || item.type === "检验") {
                            $rootScope.$broadcast('jcjytype', {
                                jcjytype: item.type
                            });
                        }
                        $scope.choosIndex = $index;
                        //编码查询列表-节
                       if(item.jname){
                        $scope.submit(item.jname,item.id,type)
                       }
                       //编码查询列表-章
                       else if(item.zbianma&&!item.jname){
                        $scope.submit((item.zbianma+'.'+item.zname),item.zbianma,type)
                        //编码查询列表-类目亚目和其他
                       }else if(!item.zbianma)(
                        $scope.submit((item.zdyresult || item.xxdxkdis ||item.zwmc),item.bm,type)
                       )
                            
                        //                        1s后改变按钮状态（变为可点击的）
                        $timeout(function () {
                            $scope.chooseAnswer[$index] = false;
                        }, 1000);
                    };
                    $scope.getMore = function () {
                        $scope.submit('下一批');
                    }


                    //排序开始
                    $scope.setOrder = function (item) {
                        $scope.setGn(item);
                    }
                    $scope.setGn = function (item) {

                        if ($stateParams.gn) {
                            var name = $stateParams.gn;
                        }
                        var order = {
                            "默认排序": "PINYIN",
                            "热度排序": "CJ_ZZ_SX"
                        };
                        var eValue = eval('order.' + item);
                        //var jsonObj = JSON.stringify(order);
                        var userid = sessionStorage.getItem("openId");
                        var param = {
                            userid: userid,
                            gnname: name,
                            order: eValue
                        };
                        var config = {
                            params: param,
                            cache: false
                        }
                        $scope.setting = true;
                        XywyService.query("/setOrder", config).then(function (response) {
                            //                        	重新选功能时(或者重新输入时)清空用户输入信息展示的内容
                            $scope.yonghuinput = "";
                            $scope.resdata = response.data;
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

                    function addDialog(message) {
                        if (angular.isString(message)) {

                        }
                        $scope.inputFocus = false;
                        audioControl.pause();
                        $scope.messageArr.push(message);
                    }
                    //排序结束

                    //                症状选择跳转症状展知识详情页面
                    $scope.zzselectOption = function ($index, item) {
                        $scope.choosIndex = $index;
                        $state.go('wenzzZskXq');
                        sessionStorage.setItem("zzzsh", JSON.stringify(item));
                    };
                    $scope.chooseAnswer = [];
                    $scope.cancelAction = function () {
                        $scope.messageData.clicked = true;
                        $scope.submit(false); //选择取消
                    };
                    //无以上症状点击
                    $scope.wzzAction = function () {
                        //$scope.wzzChooosed = true;
                        $scope.messageData.clicked = true;
                        //$scope.submit("nobszz");
                        //没有其他伴随症状操作
                        var chooosed = $scope.messageData.list.filter(function (e, index) {
                            return this[index];
                        }, $scope.chooseAnswer).map(function (e) {
                            return e.zdyresult || e.xxdxkdis;
                        });
                        chooosed.push("jieshu");
                        $scope.submit(chooosed.join(','));
                        //没有其他伴随症状操作结束
                    };
                    $scope.wzzYsdbsAction = function () {
                        $scope.wzzChooosed = true;
                        $scope.messageData.clicked = true;

                        // 清除已选项
                        for (var i = 0; i < $scope.chooseAnswer.length; i++) {
                            $scope.chooseAnswer[i] = false;
                        }
                        //没有其他伴随症状操作
                        var chooosed = $scope.messageData.list.filter(function (e, index) {
                            return this[index];
                        }, $scope.chooseAnswer).map(function (e) {
                            return e.zdyresult || e.xxdxkdis;
                        });
                        chooosed.push("jieshu");
                        $scope.submit("nobszz");
                        //没有其他伴随症状操作结束
                    };
                    //无其它症状
                    $scope.wqtzzAction = function () {
                        $scope.wzzChooosed = true;
                        $scope.messageData.clicked = true;
                        // 清除已选项
                        for (var i = 0; i < $scope.chooseAnswer.length; i++) {
                            $scope.chooseAnswer[i] = false;
                        }
                        //$scope.submit("nobszz");
                        //没有其他伴随症状操作
                        var chooosed = $scope.messageData.list.filter(function (e, index) {
                            return this[index];
                        }, $scope.chooseAnswer).map(function (e) {
                            return e.zdyresult || e.xxdxkdis;
                        });
                        chooosed.push("wqtzzjs");
                        $scope.submit(chooosed.join(','));
                        //没有其他伴随症状操作结束
                    };
                    //确认按钮
                    $scope.confirmAction = function () {
                        $scope.messageData.clicked = true;
                        var chooosed = $scope.messageData.list.filter(function (e, index) {
                            return this[index];
                        }, $scope.chooseAnswer).map(function (e) {
                            return e.zdyresult || e.xxdxkdis;
                        });
                        $scope.submit(chooosed.join(','));
                    };
                    //伴随症状没有了按钮点击事件
                    $scope.bszznothing = function () {
                        $scope.messageData.clicked = true;
                        $scope.submit("没有了");
                    }
                    //                wenzz症状知识继续按钮点击事件
                    $scope.jixu = function () {
                        $scope.messageData.clicked = true;
                        $scope.submit("继续");
                    };
                    //提交按钮样式（换一批是否显示控制）
                    $scope.isshowhyp = function (isshow) {
                        if (!isshow) {
                            return {
                                "position": "absolute",
                                "right": "0px"
                            };
                        }
                    }
                    //                    疑似疾病推荐科室
                    $scope.ysjbguahao = function (item) {
                        if (item) {
                            //                            Popup.alert("暂时无法挂号！");
                            var ksxx = JSON.stringify(item);
                            $state.go("ysjbtjks", {
                                ksxx: ksxx
                            });
                        } else {
                            Popup.alert("没有可以推荐的科室！");
                        }
                    }

                    /**
                     * 详细信息的展开收缩
                     * event为i标签dom对象
                     */
                    $scope.isshowall = function (detail, event, index) {
                        if (($scope.messageData.list.length - 1) == index) {
                            $scope.showHr = !$scope.showHr;
                        }
                        //                    	更改显示状态
                        $scope.isshow = !$scope.isshow;
                        //                    	获得i标签的父标签（即外层div）dom
                        var parent = event.target.parentElement;
                        //                    	获得需要展开/收缩文字所在的标签dom（给此标签加 showallp）
                        var p = parent.querySelector('[showallp]');
                        var showaudio = parent.querySelector('[showaudio]');
                        var eventi = parent.querySelector('[changei]');
                        //                    	判断是展开还是收缩
                        //                    	if(p){
                        //                    		if(p.className=="f ng-binding"||p.className=="ng-binding f"){
                        if (showaudio) {
                            if (showaudio.className == "hide") {
                                //                            		展开
                                //                            		p.className="showf ng-binding";
                                eventi.className = "icon ion-chevron-down activated";
                                showaudio.className = "";
                            } else {
                                showaudio.className = "hide";
                                //                            		收缩
                                //                            		p.className="f ng-binding";
                                eventi.className = "icon ion-chevron-right activated";
                            }
                            scrollDelegate.resize();
                        }

                    };

                    /**
                     * 多药品详细信息的展开收缩
                     * event为i标签dom对象
                     */
                    $scope.isshowallduoyp = function (item, event, index) {
                        //最后一个Item的下标
                        var xqnum = $scope.messageData.resData.list[$scope.messageData.resData.list.length - 1].xqlist.length - 1;
                        if (($scope.messageData.resData.list[$scope.messageData.resData.list.length - 1]).xqlist[xqnum] == item) {
                            $scope.showHr = !$scope.showHr;
                        }
                        //                    	更改显示状态
                        $scope.isshow = !$scope.isshow;
                        //                    	获得i标签的父标签（即外层div）dom
                        var parent = event.target.parentElement;
                        //                    	获得需要展开/收缩文字所在的标签dom（给此标签加 showallp）
                        var p = parent.querySelector('[showallp]');
                        var showaudio = parent.querySelector('[showaudio]');
                        var eventi = parent.querySelector('[changei]');
                        //                    	判断是展开还是收缩
                        //                    	if(p){
                        //                    		if(p.className=="f ng-binding"||p.className=="ng-binding f"){
                        if (showaudio) {
                            if (showaudio.className == "hide") {
                                //                            		展开
                                //                            		p.className="showf ng-binding";
                                eventi.className = "icon ion-chevron-down activated";
                                showaudio.className = "";
                            } else {
                                showaudio.className = "hide";
                                //                            		收缩
                                //                            		p.className="f ng-binding";
                                eventi.className = "icon ion-chevron-right activated";
                            }
                            scrollDelegate.resize();
                        }

                    };

                    /**
                     * 症状指南详情中药品查询
                     */
                    $scope.yaopinlist = function (name, leixing) {
                        GoZzJbYp.yaopinlist(name, leixing);
                        /*       //阻止冒泡事件
                               event.stopPropagation();
                               var param = { ypmc: name, leixing: leixing };
                               var config = {
                                   params: param,
                                   cache: false
                               }
                               XywyService.query("/getyaopinlist", config).then(function(response) {
                                   if (response.data.length == 0) {

                                   } else if (response.data.length == 1) {
                                       if (leixing === "药品") {
                                           $state.go('wenyaodetail', { id: response.data[0].id });
                                       } else {
                                           $state.go('wenjibingdetail', { id: response.data[0].id });
                                       }

                                   } else {
                                       //跳转到药品列表页面
                                       sessionStorage.setItem("yaopinlist", angular.toJson(response.data));
                                       $state.go('yaopinlist');
                                   }
                               });*/
                    }
                    /**
                     * 疑似疾病中疾病详情查询（单条数据直接跳转详情，多条数据展示疾病列表）
                     */
                    $scope.ysjbxq = function (jbmc) {
                        //阻止冒泡事件
                        event.stopPropagation();
                        var param = {
                            jbmc: jbmc
                        };
                        var config = {
                            params: param,
                            cache: false
                        }
                        XywyService.query("/getysjbxqlist", config).then(function (response) {
                            if (response.data.length == 0) {

                            } else if (response.data.length == 1) {
                                $state.go('wenjibingdetail', {
                                    id: response.data[0].id,
                                    estype: "jb",
                                    viewTitle: jbmc
                                });
                            } else {
                                //跳转到疾病列表页面
                                sessionStorage.setItem("yaopinlist", angular.toJson(response.data));
                                $state.go('yaopinlist');
                            }
                        });
                        event.stopPropagation();
                    }
                    //疑似疾病详情展示
                    $scope.chosejb = [true];
                    $scope.showjbxq = function (index, item) {
                        var isshow = !$scope.chosejb[index];
                        $scope.chosejb.splice(0, $scope.chosejb.length);
                        $scope.chosejb[index] = isshow;
                    }

                    /**
                     * 问诊人
                     */
                    if ($scope.messageData.type == "xzwzr") {
                        for (var i = 0; i < $scope.messageData.list.length; i++) {
                            if (typeof $scope.messageData.list[i].imgurl == 'undefined') {
                                $scope.messageData.list[i].imgurl = "img/hz.png";
                            }
                        }


                        $scope.messageData.list[0].choose = true;
                        if ($scope.messageData.list[0].id) {
                            sessionStorage.setItem("wzrId", $scope.messageData.list[0].id);
                        }
                        var txNc = UserInfoService.getTxNc();
                        if (!txNc) {
                            txNc = {
                                tx: "img/hz.png",
                                nc: "匿名用户"
                            }
                        }
                        if ($scope.messageData.list[0].imgurl) {
                            txNc.wzrTx = $scope.messageData.list[0].imgurl;
                        } else {
                            wzrTx.wzrTx = "img/hz.png"
                        }
                        sessionStorage.setItem("txNc", JSON.stringify(txNc));
                        $scope.wzrBlack = [];
                        if ($scope.messageData.list.length % 3 > 0) {
                            var bl = 3 - $scope.messageData.list.length % 3;
                            for (var i = 0; i < bl; i++) {
                                var obj = {};
                                $scope.wzrBlack.push(obj);
                            }
                        }
                    }
                    /**
                     * 问诊人翻页
                     * e：event
                     * type:(1-下一页，2-上一页)
                     */
                    $scope.wzrFanye = function (e, type) {
                        var obj, listLength = $scope.messageData.list.length;
                        if (e.target.nodeName == "I") {
                            obj = e.target.parentNode;
                        }
                        else {
                            obj = e.target;
                        }
                        if (obj.getAttribute("disabled") == "disabled") {
                            return;
                        }
                        var parent = obj.parentNode,
                            ul = parent.getElementsByTagName("ul")[0],
                            $ul = $(ul),
                            one,
                            up = parent.getElementsByClassName("up")[0],
                            np = parent.getElementsByClassName("np")[0],
                            p = parseInt(ul.getAttribute("data-p"));
                        if (type == 1) {
                            up.setAttribute("disabled", false);
                            up.classList.remove("disabled");
                            one = $ul.find("li").first().width()
                            $ul.animate({
                                scrollLeft: one * 3 * p
                            }, 300);
                            p = ++p;
                            ul.setAttribute("data-p", p);

                            if (p >= Math.ceil(listLength / 3)) {
                                obj.setAttribute("disabled", "disabled");
                                obj.classList.add("disabled");
                            }
                        }
                        if (type == 2) {
                            p = --p;
                            ul.setAttribute("data-p", p);
                            np.setAttribute("disabled", false);
                            np.classList.remove("disabled");
                            one = $ul.find("li").first().width()
                            $ul.animate({
                                scrollLeft: one * 3 * (p - 1)
                            }, 300);
                            if (p <= 1) {
                                obj.setAttribute("disabled", "disabled");
                                obj.classList.add("disabled");
                            }
                        }
                        e.stopPropagation();
                    };
                    /**
                     * 选择问诊人
                     * index
                     */
                    $scope.chooseWzr = function (e, index) {
                        if (index == 0) {
                            return;
                        }
                        var temp = $scope.messageData.list[index], txNc, ul, $ul, listLength, p, up, np;
                        // 交换元素
                        $scope.messageData.list.splice(index, 1)
                        $scope.messageData.list[0].choose = false;
                        $scope.messageData.list.unshift(temp);
                        //$scope.messageData.list[0] = temp;
                        $scope.messageData.list[0].choose = true;
                        // 滚动到最前面
                        // listLength = $scope.messageData.list.length;
                        // if (e.target.nodeName != "LI") {
                        //     ul = e.target.parentNode.parentNode;
                        // } else {
                        //     ul = e.target.parentNode;
                        // }
                        // p = ul.getAttribute("data-p");
                        // if (listLength > 3 && p > 1) {
                        //     ul.setAttribute("data-p", 1);
                        //     up = ul.previousElementSibling.previousElementSibling;
                        //     up.setAttribute("disabled", "disabled");
                        //     up.classList.add("disabled");
                        //     np = ul.nextElementSibling;
                        //     np.setAttribute("disabled", false);
                        //     np.classList.remove("disabled");
                        //     $ul = $(ul);
                        //     $ul.animate({
                        //         scrollLeft: 0
                        //     }, 300);
                        // }

                        if ($scope.messageData.list[index].id) {
                            sessionStorage.setItem("wzrId", $scope.messageData.list[0].id);

                        }
                        else {
                            sessionStorage.setItem("wzrId", null);
                        }

                        txNc = UserInfoService.getTxNc();
                        if (!txNc) {
                            txNc = {
                                tx: "img/hz.png",
                                nc: "匿名用户"
                            }
                        }
                        if ($scope.messageData.list[0].imgurl) {
                            txNc.wzrTx = $scope.messageData.list[0].imgurl;
                        }
                        else {
                            txNc.wzrTx = "img/hz.png"
                        }
                        sessionStorage.setItem("txNc", JSON.stringify(txNc));
                        e.stopPropagation();
                    };
                    //妇幼健康妇女儿童的选择默认为妇女
                    $scope.isshowfnet = "妇女";
                    $scope.fyjkclick = function (value) {
                        $scope.isshowfnet = value;
                    }


                }
            };
        }
    ])
    /**
     * 搜索引擎 知识查询 根据唯一id _id
     */
    .factory('QueryZhiShi', ['XywyService', '$q', '$stateParams', function (XywyService, $q, $stateParams) {
        return function () {
            return XywyService.query("/getBaoGao", {
                params: $stateParams,
                cache: true
            });
        };
    }])
    /**
     * 搜索引擎 知识查询 根据唯一id _id 和 搜索类别
     */
    .factory('QueryEsZhiShi', ['XywyService', '$q', '$stateParams', function (XywyService, $q, $stateParams) {
        return function () {
            return XywyService.query("/getEsDetail", {
                params: $stateParams,
                cache: true
            });
        };
    }])
    /**
     * 在根元素注册浮动按钮语音输入
     * 语音指令依赖此指令
     */
    .directive('audioRegister', ['$rootScope', 'wxApi', '$state', 'Popup', '$window', '$location', 'audioControl', function ($rootScope, wxApi, $state, Popup, $window, $location, audioControl) {

        var audioButton = angular.element('<div class="audio-button audio-button-mic ion-mic-a" style="right:30px;bottom:30px;"><div>点击结束</div></div>');
        if (localStorage.buttonPostion) {
            audioButton[0].style.cssText = ''; // localStorage.buttonPostion;
            audioButton[0].style.top = '';
            audioButton[0].style.left = '';
        }
        var startRecord = false;
        var touchMove = false;

        var states = {};

        function stopRecord(recordRes, sucCallback) {
            audioButton[0].style.cssText = localStorage.buttonPostion;
            audioButton.addClass('audio-button-mic');
            audioButton.removeClass('audio-button-recording');
            audioButton.addClass('ion-mic-a');
            audioButton.removeClass('icon-recording');
            startRecord = false;
            if (recordRes) {
                wx.translateVoice({
                    localId: recordRes.localId,
                    //                         isShowProgressTips: 1,
                    success: function (res) {
                        var stateId = getStateId($state.current);
                        var commandes = states[stateId].command;
                        var commandArr = states[stateId].arr;
                        var audioAction = states[stateId].audioAction;
                        var text = res.translateResult.replace(/[。？！、，;]$/, '');
                        // text="医生";
                        // audioButton.text(text);
                        if (text && !commandes[text]) {
                            for (var i = commandArr.length - 1; i >= 0; i--) {
                                if (text.indexOf(commandArr[i]) > -1) {
                                    text = i;
                                    break;
                                }
                            }
                        }
                        if (text && commandes[text]) {
                            commandes[text].triggerHandler('click');
                        } else if (audioAction) {
                            audioAction({
                                text: text
                            });
                        } else {
                            Popup.alert("未找到指令！");
                        }
                    },
                    fail: function () {
                        Popup.alert("没有听清！");
                    }
                });
            }
        }

        function clickfuc(event) {
            event.preventDefault();
            if (startRecord) {
                wxApi.wxPromise().then(function (wx) {
                    wx.stopRecord({
                        success: stopRecord
                    });
                });
            } else {
                wxApi.startRecord({
                    success: function () {
                        audioControl.pause();
                        localStorage.buttonPostion = audioButton[0].style.cssText;
                        audioButton[0].style.right = '0';
                        audioButton[0].style.bottom = '0';
                        audioButton.addClass('audio-button-recording');
                        audioButton.removeClass('audio-button-mic');
                        audioButton.addClass('icon-recording');
                        audioButton.removeClass('ion-mic-a');
                        startRecord = true;
                    },
                    fail: function (reason) {
                        Popup.alert(reason);
                    }
                });
                wxApi.wxPromise().then(function (wx) {
                    wx.onVoiceRecordEnd({
                        complete: stopRecord
                    });
                });
            }
        }

        audioButton[0].addEventListener('click', clickfuc);
        var startRight, startBottom;
        var prePageX, prePageY;
        // audioButton[0].addEventListener('touchstart', function(event) {
        //     event.preventDefault();
        //     var touch = event.touches[0];
        //     startRight = parseInt(this.style.right, 10) + touch.pageX;
        //     startBottom = parseInt(this.style.bottom, 10) + touch.pageY;
        // });
        // audioButton[0].addEventListener('touchmove', function(event) {
        //     var self = this;
        //     touchMove = true;
        //     requestAnimationFrame(function() {
        //         var touch = event.touches[0];
        //         var right = startRight - touch.pageX;
        //         var bottom = startBottom - touch.pageY;
        //         self.style.right = right + 'px';
        //         self.style.bottom = bottom + 'px';
        //     });
        // });

        // audioButton[0].addEventListener('touchend', function() {
        //     if (touchMove) {
        //         touchMove = false;
        //         checkPos(this);
        //     }
        // });
        // audioButton[0].addEventListener('touchcancel', function() {
        //     if (touchMove) {
        //         touchMove = false;
        //         checkPos(this);
        //     }
        // });
        $rootScope.$on('$stateChangeSuccess', function (e, toState, toParams, fromState, fromParams) {
            if (startRecord) {
                wx.stopRecord();
                stopRecord();
            }
            var stateId = getStateId(fromState, fromParams);
            var toStateId = getStateId(toState, toParams);
            if (states[toStateId]) {
                states[toStateId].ele.append(audioButton);
            } else if (states[stateId]) {
                audioButton.remove();
            }
            angular.forEach(states, function (state, stateKey) {
                if (state.ele.length && !$window.document.body.contains(state.ele[0])) {
                    delete states[stateKey];
                }
            });
        });

        /**
         * 定位元素位置 绝对定位父元素 以实现通过right，bottom定位
         * @param ele
         * @returns [height,width]
         */
        function offsetPos(ele) {
            if (ele && ele.parentElement) {
                var css = ele.parentElement.css || $window.getComputedStyle(ele.parentElement);
                ele.parentElement.css = css;
                if (css.position !== 'static') {
                    css = ele.css || $window.getComputedStyle(ele);
                    ele.css = css;
                    if (/flex/.test(css.display)) {
                        return [ele.offsetHeight, ele.offsetWidth];
                    } else {
                        return [ele.parentElement.offsetHeight, ele.parentElement.offsetWidth];
                    }
                }
                return offsetPos(ele.parentElement);
            } else if (ele) {
                return [ele.offsetHeight, ele.offsetWidth];
            } else {
                return [0, 0];
            }
        }

        /**
         * 确认位置是否移出父元素
         * @param ele
         */
        function checkPos(ele) {
            var right = parseInt(ele.style.right, 10);
            var bottom = parseInt(ele.style.bottom, 10);
            var offset = offsetPos(ele.parentElement);
            var stateId = getStateId($state.current);
            var topPosLimit = 0;
            if (states[stateId]) {
                topPosLimit = states[stateId].topPosLimit;
            }
            if (right < -25) {
                ele.style.right = '-25px';
            } else if (right > offset[1] - 25) {
                ele.style.right = offset[1] - 25 + 'px';
            }
            if (bottom < -25) {
                ele.style.bottom = '-25px';
            } else if (bottom > offset[0] - 25 - topPosLimit) {
                ele.style.bottom = offset[0] - 25 - topPosLimit + 'px';
            }
            //             console.log(offset, ele.style.cssText)
            localStorage.buttonPostion = ele.style.cssText;
        }

        /**
         * 确认当前页面id
         * @param state
         * @param params
         * @returns {*}
         */
        function getStateId(state, params) {
            var id;
            params = params || $state.params;
            if (state.name) {
                id = state.name;
                if (params) {
                    for (var key in params) {
                        if (params.hasOwnProperty(key) && params[key]) {
                            id += "_" + key + "=" + params[key];
                        }
                    }
                }
                return id;
            }
        }

        return {
            scope: {},
            restrict: 'A',
            controller: function ($scope, $element, $attrs) {
                var commandes = {};
                var commandArr = [];
                var topPosLimit;
                if ($scope.$eval($attrs.hideNavBar)) {
                    topPosLimit = 0;
                } else {
                    topPosLimit = 44;
                }
                var stateId = getStateId($state.current);
                var preParent = audioButton.parent();
                if (!states[stateId] || (states[stateId] && !$window.document.contains(states[stateId].ele[0]))) {
                    states[stateId] = {
                        ele: $element,
                        command: commandes,
                        arr: commandArr,
                        topPosLimit: topPosLimit
                    };
                    preParent = null;
                } else {
                    var preAction = states[stateId].audioAction;
                    var pretopPosLimit = states[stateId].topPosLimit;
                    states[stateId].topPosLimit = 0;
                    $scope.$on('$destroy', function () {
                        if (stateId === getStateId($state.current)) {
                            preParent.append(audioButton);
                            states[stateId].audioAction = preAction;
                            states[stateId].topPosLimit = pretopPosLimit;
                            checkPos(audioButton[0]);
                        }
                    });
                }
                $element.append(audioButton);
                checkPos(audioButton[0]);
                /**
                 * 注册指令
                 * @param element 指令对应元素
                 * @param command 指令内容
                 */
                this.registerCommand = function (element, command) {
                    commandArr = commandArr.concat(command);
                    command.forEach(function (e) {
                        if (e) commandes[e] = element;
                    });
                };
                /**
                 * 绑定输入框语音输入
                 * @param callback
                 */
                this.registerInput = function (callback) {
                    states[stateId].audioAction = callback;
                };
            }
        };
    }])
    /**
     * 创建语音指令 依赖audioRegister
     */
    .directive('audioCommand', [function () {
        return {
            scope: true,
            require: '^audioRegister',
            restrict: 'A',
            link: function ($scope, iElm, iAttrs, RegisterController) {
                RegisterController.registerCommand(iElm, iAttrs.audioCommand.split(','));
            }
        };
    }])
    /**
     * 输入框语音输入 依赖audioRegister
     */
    .directive('audioAction', [function () {
        return {
            scope: {
                audioAction: '&'
            },
            require: '^audioRegister',
            restrict: 'A',
            link: function ($scope, iElm, iAttrs, RegisterController) {
                RegisterController.registerInput($scope.audioAction);
            }
        };
    }])
    /**
     * 简化ionicPopup调用方法
     * alert,confirm,fankui方法
     */
    .service('Popup', ['$timeout', '$ionicPopup', '$window', '$rootScope', 'XywyService', '$ionicLoading', function ($timeout, $ionicPopup, $window, $rootScope, XywyService, $ionicLoading) {
        var backFunc = $window.history.back.bind($window.history);
        var popup;
        var style = 'align="center"';
        $rootScope.$on('$locationChangeStart', function () {
            if (popup) popup.close();
        });
        var self = this;
        //content 提示内容;back 是否返回上一页
        this.alert = function (content, back) {
            content = angular.isString(content) ? content : "系统繁忙，请稍候再试！";
            //超过十五个字符放弃居中
            /*if (content.length <= 15) {
                content = '<div ' + style + '>' + content + '</div>';
            } else {
                content = '<div>' + content + '</div>';
            }*/
            /*popup = $ionicPopup.alert({
                title: '提示',
                template: content,
                okText: '确定'
            });*/


            $ionicLoading.show({
                template: content,
                duration: 2000
            });
            // popup = $ionicPopup.show({
            //     title: '提示',
            //     template: content,
            // });
            // popup.then((back === true) && backFunc);

            // $timeout(function() {
            //     popup.close(); //由于某种原因2秒后关闭弹出
            // }, 2000);
        };
        //获取反馈意见列表
        this.fankuiyijianlist = function () {
            XywyService.query("/pingjia/getwenti")
                .then(function () {
                    var fankuilist = data.wtList
                    return fankuilist
                })
        }
        //content 内容数组，confirm确认回调方法，cancel....
        this.confirm = function (content, confirm, cancel) {
            popup = $ionicPopup.confirm({
                title: content[0] || '未能找到科室',
                template: content[1] || '是否前往科室列表选择科室挂号？',
                buttons: [{
                    text: '取消',
                    type: 'button-default',
                    onTap: function (e) {
                        if (cancel) {
                            cancel(e);
                        } else {
                            backFunc();
                        }
                    }
                }, {
                    text: '确定',
                    type: 'button-positive',
                    onTap: function (e) {
                        if (confirm && angular.isFunction(confirm)) confirm();
                    }
                }]
            });
        };
        //删除记录confirm
        this.delConfirm = function (confirm, cancel) {
            popup = $ionicPopup.confirm({
                title: '提示',
                template: '您确定要删除该条记录吗？',
                buttons: [{
                    text: '取消',
                    type: 'button-default',
                    onTap: function (e) {
                        if (cancel) {
                            cancel(e);
                        } else {
                            backFunc();
                        }
                    }
                }, {
                    text: '确定',
                    type: 'button-positive',
                    onTap: function (e) {
                        if (confirm && angular.isFunction(confirm)) confirm();
                    }
                }]
            });
        };
        this.fankui = function (option) {
            option = option || {};
            var $scope = $rootScope.$new();
            $scope.checked = true;
            $scope.data = {
                fknr: '',
                lxfs: ''
            };
            $scope.input = function (text) {
                $scope.$apply(function () {
                    $scope.data.fknr = text;
                });
            };
            popup = $ionicPopup.show({
                template: "<form name=\"fankui\">" +
                    "<div><div>" + (option.title || '反馈意见：') + "<span style=\"color:red\" ng-show=\"notInput&&fankui.fknr.$error.required\">请输入反馈内容</span></div>\n" +
                    "    <textarea style=\"height: 100px;\" ng-model=\"data.fknr\" name=\"fknr\" required></textarea>" +
                    "<div class='padding-top'>联系方式：</div><input type=\"text\" ng-model=\"data.lxfs\" placeholder=\"电话、QQ、邮箱等联系方式\">" +
                    "</div></form>",
                title: option.title || '意见反馈',
                scope: $scope,
                buttons: [{
                    text: '取消'
                },
                {
                    text: '<b>提交</b>',
                    type: 'button-positive',
                    onTap: function (e) {
                        if ($scope.data.fknr) {
                            XywyService.save('/fankuiyijian', angular.extend($scope.data, {
                                jhnr: option.data
                            })).then(function (res) {
                                self.alert(res.data);
                            }, function (res) {
                                self.alert(res.data);
                            });
                        } else {
                            $scope.notInput = true;
                            e.preventDefault();
                        }
                    }
                },
                ]
            });
        };
    }])
    /**
     * 定义微信录音统一接口
     * 简化调用方式
     */
    .factory('Yuyin', ['wxApi', 'audioControl', 'Popup', '$timeout', function (wxApi, audioControl, Popup, $timeout) {

        //标志是否停止录音，有时停止录音会比开始录音更快完成调用
        var stop = false;

        /**
         * 录音开始操作
         * @param startFunc 开始操作（样式变换）
         * @param successFunc 成功操作（用于超时识别）
         */
        function startRecord(startFunc, successFunc) {
            stop = false;
            audioControl.pause();
            wxApi.startRecord({
                success: function () {
                    if (!stop) startFunc();
                },
                fail: function (reason) {
                    Popup.alert(reason + "！");
                }
            });
            //绑定超时识别回调
            wxApi.wxPromise().then(function (wx) {
                wx.onVoiceRecordEnd({
                    complete: translateVoice.bind(null, successFunc)
                });
            });
        }

        /**
         * 正常结束录音
         * @param finishFunc 结束录音需要做的操作
         * @param successFunc 成功操作,后回调参数
         * （了解call,apply,bind的用法）
         */
        function finishRecord(finishFunc, successFunc) {
            stopRecord(finishFunc, {
                success: translateVoice.bind(null, successFunc)
            });
        }

        /**
         * 语音识别回调
         * @param successFunc 识别成功回调,参数为识别结果
         * @param recordRes 停止录音回调参数
         */
        var yuyinVideo = false;

        function translateVoice(successFunc, recordRes) {
            if (recordRes) {
                wx.translateVoice({
                    localId: recordRes.localId,
                    //                         isShowProgressTips: 1,
                    success: function (res) {
                        //alert(res.translateResult);
                        if (res.translateResult != undefined) {
                            var text = res.translateResult.replace(/[。？！、，;]$/, '');
                            successFunc(text);
                        } else {
                            if (yuyinVideo == true) {
                                successFunc(false);
                                return;
                            } else {
                                yuyinVideo = true;
                                translateVoice(successFunc, recordRes);
                            }
                        }
                    },
                    fail: function () {
                        successFunc(false);
                    }
                });
            }
        }

        /**
         * 停止录音操作
         * @param finishFunc 停止录音操作
         * @param option 不传此参数时是取消录音
         */
        function stopRecord(finishFunc, option) {
            wxApi.wxPromise().then(function (wx) {
                wx.stopRecord(option);
                stop = true;
                finishFunc();
            });
        }

        //开始录音动作，结束录音动作，成功录音动作
        /**
         * startFunc :开始回调，做样式变动等
         * finishFun ：正常结束或超时结束回调
         * osuccuessFunc :原始识别成功回调
         */
        return function (startFunc, finishFunc, osuccessFunc) {
            var successFunc = function (text) {
                //由于语音识别是异步任务，会在angularjs 的$degest周期外
                $timeout(osuccessFunc.bind(null, text));
            }
            /**
             *
             * start :绑定在开始，开始录音，并变动样式等
             * finish ：绑定在结束，结束录音，并还原样式等
             * stop :触发取消录音
             */
            return {
                start: startRecord.bind(null, startFunc, successFunc),
                finish: finishRecord.bind(null, finishFunc, successFunc),
                stop: stopRecord.bind(null, finishFunc),
            };
        };
    }])
    /**
     * input焦点指令
     */
    .directive('makeFocus', ['$timeout', '$interval', '$ionicScrollDelegate', '$window', '$ionicPosition', function ($timeout, $interval, $ionicScrollDelegate, $window, $ionicPosition) {
        var smallScroll = $ionicScrollDelegate.$getByHandle('small');
        var realHeight = $window.innerHeight;
        var addEvent = false;
        var bfscrolltop = document.body.scrollTop;

        //在手机端收起键盘触发window的resize事件后resize滚动容器
        function listen(event) {
            //console.log($window.innerHeight)
            if ($window.innerHeight < realHeight) {
                smallScroll.scrollBy(0, realHeight - $window.innerHeight, true);
            } else {
                smallScroll.resize();
            }
            realHeight = $window.innerHeight;
        }

        return {
            scope: false,
            restrict: 'A',
            link: function ($scope, $element, $attrs) {
                if (!addEvent) {
                    //确保只添加一次resize事件
                    $window.addEventListener('resize', listen);
                }
                //获取属性真正所属scope
                function getParent(scope) {
                    if (scope.hasOwnProperty($attrs.makeFocus)) {
                        return scope;
                    } else {
                        return getParent(Object.getPrototypeOf(scope));
                    }
                }

                var parentScope = getParent($scope);
                $element.on('blur', function () {
                    parentScope[$attrs.makeFocus] = false;
                    document.body.scrollTop = bfscrolltop
                });
                $element.on('focus', function () {
                    // parentScope[$attrs.makeFocus] = true;
                    //判断ios下获取键盘socoll的高度
                    if (ionic.Platform.isIOS()) {
                        // var top = $ionicScrollDelegate.getScrollPosition().top;
                        // var eleTop = ($ionicPosition.offset($element).top) / 2
                        // var realTop = eleTop + top;
                        $timeout(function () {
                            if (!$scope.$last) {
                                // $ionicScrollDelegate.scrollTo(0,realTop);
                                // if ($window.innerHeight < realHeight) {
                                //     smallScroll.scrollBy(0, realHeight - $window.innerHeight, true);
                                // } else {
                                //     smallScroll.resize();
                                // }
                                // realHeight = $window.innerHeight;
                                // smallScroll.scrollBy(0, realHeight - $window.innerHeight, true);

                                document.body.scrollTop = document.body.scrollHeight;
                                parentScope[$attrs.makeFocus] = true;
                            } else {
                                try {
                                    $timeout(function () {
                                        $element[0].focus();
                                        //console.log(2);
                                    }, 300)
                                } catch (e) { }
                            }
                        }, 500)
                    } else {
                        parentScope[$attrs.makeFocus] = true;
                    }

                });
                parentScope.$watch($attrs.makeFocus, function (newValue, oldValue) {
                    if (newValue) {
                        $timeout(function () {
                            $element[0].focus();
                        });
                    } else {
                        $element[0].blur();
                    }
                });
            }
        };
    }])

    /**
     * 
     * 滚动显示用户信息
     */
    .directive('gunDong', ['$rootScope', '$state', 'Popup', '$window', '$location', function ($rootScope, $state, Popup, $window, $location) {

        return {
            scope: {
                yonghuinput: "=yonghuInput",
                title: "=titleSx"
            },
            restrict: 'ACE',
            template: '<div ng-show="show" style="background-color: #90daff;height: 30px;">' +
                '<div class=" gundong">{{yonghuinput}}</div>' +
                '<i class="ion-close-circled" style="font-size:27px;position: absolute;right: 0px;top: 0px;color:white;" ng-click="hideclick()"></i>' +
                '</div>' +
                '<div ng-show="!show" ng-click="showclick()" style="width: 80px;    float: right;    border-radius: 10px;    margin-right: -33px;    color: white;    margin-top: 5px;    background-color: rgb(144, 218, 255);"><p style="margin: 0 auto; margin-left: 10px">显示</p></div>',
            link: function ($scope, $element, $attrs) {
                //            	判断是否显示用户输入信息滚动栏（当localStorage.getItem('showuserinput')不存在时默认显示）
                /*if(localStorage.getItem('showuserinput')){
                	if(localStorage.getItem('showuserinput')==="true"){
                		$scope.show=true;
                	}else if(localStorage.getItem('showuserinput')==="false"){
                		$scope.show=false;
                	}else{
                		$scope.show=localStorage.getItem('showuserinput');
                	}
                }else{
                	$scope.show=true;
                	localStorage.setItem("showuserinput",true);
                }*/
                if ($scope.title == "ZWPG") {
                    $scope.show = true;
                    localStorage.setItem("showuserinput", true);
                } else {
                    $scope.show = false;
                    localStorage.setItem("showuserinput", false);
                }
                //            	隐藏用户输入信息滚动条
                $scope.hideclick = function () {
                    $scope.show = false;
                    localStorage.setItem("showuserinput", false);
                }
                //            	展示用户输入信息滚动条
                $scope.showclick = function () {
                    $scope.show = true;
                    localStorage.setItem("showuserinput", true);
                }
            }
        };
    }])
    /**
     * 是否展示评分
     */
    .directive('showPingfen', ['$rootScope', 'Popup', '$window', '$location', function ($rootScope, Popup, $window, $location) {
        return {
            template: '<div ng-click="showpf()" style="position: absolute; left:12px;top: 10px;border-radius: 10px;color:rgb(255, 247, 0);width:80px;">{{showpingfen}}</div>',
            link: function ($scope, $element, $attrs) {
                if (localStorage.getItem("showpingfen")) {
                    if (localStorage.getItem("showpingfen") === "false") {
                        $scope.showpingfen = "显示评分";
                    } else {
                        $scope.showpingfen = "隐藏评分";
                    }
                } else {
                    $scope.showpingfen = "隐藏评分";
                    localStorage.setItem("showpingfen", true);
                }
                //			点击事件（切换是否显示评分）
                $scope.showpf = function () {
                    if (localStorage.getItem("showpingfen") === "true") {
                        $scope.showpingfen = "显示评分";
                        localStorage.setItem("showpingfen", false);
                    } else {
                        $scope.showpingfen = "隐藏评分";
                        localStorage.setItem("showpingfen", true);
                    }
                }
            }
        };
    }])
    /***
     * 单击，双击事件的判断
     */
    .directive('sglclick', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                //            	$parse作用：将一个AngularJS表达式转换成一个函数
                //            	单击事件
                var fn = $parse(attr['sglclick']);
                //                双击事件
                var dblfn = $parse(attr['dblglclick']);
                var delay = 400,
                    clicks = 0,
                    timer = null;
                element.on('click', function (event) {
                    clicks++; //count clicks  
                    if (clicks === 1) {
                        timer = setTimeout(function () {
                            scope.$apply(function () {
                                //                            	在延迟执行中clicks可能发生改变（在400ms内clicks可能变成2，此时不执行单击事件）
                                if (clicks === 1) {
                                    fn(scope, {
                                        $event: event
                                    });
                                }
                            });
                            clicks = 0;
                        }, delay);
                    } else if (clicks === 2) {
                        timer = setTimeout(function () {
                            scope.$apply(function () {
                                dblfn(scope, {
                                    $event: event
                                });
                            });
                            clicks = 0;
                        }, delay);
                    } else {
                        clearTimeout(timer);
                        clicks = 0;
                    }
                });
            }
        };
    }])
    /**
     * 免责声明
     */
    .directive('mianZe', ['$rootScope', '$state', 'Popup', '$window', '$location', function ($rootScope, $state, Popup, $window, $location) {
        return {
            scope: {
                mianzetext: "=mianzeText"
            },
            restrict: 'ACE',
            //            template:'<div class="bar bar-footer bar-balanced" style="height:auto;background-color: #b2b2b2;">'
            //            +'<artice style="padding: 0 2px;color:#fff;font:12px Microsoft Yahei">免责声明：信息仅供参考，不能作为诊断及医疗的依据，就医请选择正规医疗机构</artice>'
            //            +'</div>',
            template: '<ion-footer-bar style="height: 44px;background-size: 0;">' +
                '<div class="bar bar-footer bar-balanced" style="height:auto;background: #D8D8D8;">' +
                '<artice style="padding:0 2%;font-size:12px;color:#fff;">免责声明：草堂上医仅仅提供家庭健康管理的建议参考，不能作为医院诊断和治疗的方案或依据。</artice>' +
                '</div>' +
                '</ion-footer-bar>',
            link: function ($scope, $element, $attrs) {

            }
        };
    }])

    /**
     * 右侧字母选择(右侧选择列表)
     */
    .directive('rightList', ['$ionicViewSwitcher', '$rootScope', '$state', 'Popup', '$window', '$location', 'audioControl', 'XywyService', 'Message', function ($ionicViewSwitcher, $rootScope, $state, Popup, $window, $location, audioControl, XywyService, Message) {

        return {
            scope: {
                ziMu: "=",
                aClick: "&",
                cruGn: "=",
                id: "@"
            },
            restrict: 'ACE',
            template: '<div class="city_anchor" ng-style="heightstyle()"><i ng-click="scrollUp()" ng-class="{true:\'\',false:\'hidden\'}[upShow]" class="icon ion-arrow-up-b jt-scroll"></i><div class="zm-container">' /*#18b3ed*/ +
                '<a class="zimua" href="" ng-click="click(item,$index)" ng-repeat="item in list" style="font-family: sans-serif;" ng-style="astyle()">{{item}}</a>' +
                '</div><i class="icon ion-arrow-down-b jt-scroll" ng-click="scrollDown()"  ng-class="{true:\'\',false:\'hidden\'}[downShow]"></i></div>',
            link: function ($scope, $element, $attrs) {
                $scope.list = [];
                $scope.list.push("全");
                for (var i = 0; i < 13; i++) {
                    $scope.list.push(String.fromCharCode(65 + i));
                }
                var idslectStr = "";
                if ($scope.id) {
                    idslectStr = "#" + $scope.id + " ";
                }
                $scope.click = function (zimu, index) {
                    if (zimu == "全") {
                        zimu = "";
                    }

                    //获取div距离顶部的距离
                    var mTop = document.getElementsByClassName('zimua')[index].offsetTop;
                    //减去滚动条的高度
                    var sTop = document.body.scrollTop;
                    var zimuheight = mTop - sTop;
                    $rootScope.$broadcast('zimu', {
                        zimu: zimu,
                        zimuheight: zimuheight
                    });

                    //var zimuList = document.getElementsByClassName('zimua');
                    /*var zimuList = document.getElementsByTagName('a');*/
                    //for(var i = 0; i < zimuList.length; i++) {
                    //	zimuList[i].style.color = "#444444c2";
                    //}
                    //点击字母改变颜色
                    /*zimuList[index].style.color="#18b3ed";*/

                    if ($(idslectStr + ".zm-container").children(".target").length > 0) {
                        $(idslectStr + ".zm-container").children(".target").each(function () {
                            $(this).removeClass("target");
                        });
                    }

                    $(idslectStr + ".zm-container").children("a").eq(index).addClass("target");

                }
                $scope.upShow = false;
                $scope.downShow = true;
                $scope.scrollDown = function () {
                    $scope.list = [];
                    $scope.list.push("全");
                    for (var i = 13; i < 26; i++) {
                        $scope.list.push(String.fromCharCode(65 + i));
                    }
                    $scope.upShow = true;
                    $scope.downShow = false;
                };
                $scope.scrollUp = function () {
                    $scope.list = [];
                    $scope.list.push("全");
                    for (var i = 0; i < 13; i++) {
                        $scope.list.push(String.fromCharCode(65 + i));
                    }
                    $scope.downShow = true;
                    $scope.upShow = false;
                };


                $scope.heightstyle = function () {
                    if ($scope.cruGn == "WJB") {
                        if (ionic.Platform.isIOS()) {
                            return {
                                "top": "155px"
                            };
                        } else {
                            return {
                                "top": "202px"
                            };
                        }
                    }
                    if ($scope.cruGn == "ZYYS") {
                        if (ionic.Platform.isIOS()) {
                            return {
                                "top": "105px"
                            };
                        } else {
                            return {
                                "top": "145px"
                            };
                        }
                    }
                    if ($scope.cruGn == "WYP") {
                        if (ionic.Platform.isIOS()) {
                            return {
                                "top": "48px"
                            };
                        } else {
                            return {
                                "top": "92px"
                            };
                        }
                    }
                    if ($scope.cruGn == "WYP-JT") {
                        if (ionic.Platform.isIOS()) {
                            return {
                                "top": "50px"
                            };
                        } else {
                            return {
                                "top": "94px"
                            };
                        }
                    }
                    if ($scope.cruGn == "MBL") {
                        if (ionic.Platform.isIOS()) {
                            return {
                                "top": "108px"
                            };
                        } else {
                            return {
                                "top": "143px"
                            };
                        }
                    }


                }
                $scope.astyle = function () {
                    if ($scope.cruGn == "WJB") {
                        return {
                            "font-size": "0.8em"
                        };
                    }
                    if ($scope.cruGn == "WYP") {
                        return {
                            "font-size": "0.8em"
                        };
                    }
                    if ($scope.cruGn == "WYP-JT") {
                        return {
                            "font-size": "0.8em"
                        };
                    }
                    if ($scope.cruGn == "ZYYS") {
                        return {
                            "font-size": "0.8em"
                        };
                    }
                    if ($scope.cruGn == "MBL") {
                        return {
                            "font-size": "0.8em"
                        };
                    }

                }
            }
        };
    }])
    /**
     * 通过$sce构建一个过滤器来对输出的html进行过滤
     * 将自动屏蔽的内容显示出来
     */
    .filter('trustHtml', ['$sce', function ($sce) {
        return function (val) {
            return $sce.trustAsHtml(val);
        };
    }])
    /**
     * 用ng-bind-html转化后的html点击事件无法触发，所以再次用$compile使得点击事件可触发
     * https://blog.csdn.net/bluesheaven/article/details/53729694
     * https://segmentfault.com/q/1010000006789068
     */
    .directive('compileHtml', function ($compile) {
        return {
            restrict: 'A',
            replace: true,
            link: function (scope, ele, attrs) {
                scope.$watch(function () {
                    return scope.$eval(attrs.ngBindHtml);
                },
                    function (html) {
                        ele.html(html);
                        $compile(ele.contents())(scope);
                    });
            }
        };
    })
    /**
     * 健康圈发帖时间转换
     */

    .filter('getDateDiff', function () {
        return function (dateTimeStamp) {
            var date = new Date(dateTimeStamp);
            var str = date.getTime();
            var minute = 1000 * 60;
            var hour = minute * 60;
            var day = hour * 24;
            var halfamonth = day * 15;
            var month = day * 30;
            var now = new Date().getTime();
            var diffValue = now - str;
            if (diffValue < 0) {
                return;
            }
            var monthC = diffValue / month;
            var weekC = diffValue / (7 * day);
            var dayC = diffValue / day;
            var hourC = diffValue / hour;
            var minC = diffValue / minute;
            if (monthC >= 12) {
                result = date
            }
            if (monthC >= 1) {
                result = "" + parseInt(monthC) + "月前";
            } else if (weekC >= 1) {
                result = "" + parseInt(weekC) + "周前";
            } else if (dayC >= 1) {
                result = "" + parseInt(dayC) + "天前";
            } else if (hourC >= 1) {
                result = "" + parseInt(hourC) + "小时前";
            } else if (minC >= 1) {
                result = "" + parseInt(minC) + "分钟前";
            } else
                result = "刚刚";
            return result;
        };
    })

    .filter('getmorewenben', function () {
        return function (wenben) {
            if (wenben.length > 75) {
                results = wenben.substring(0, 73) + "...";
            } else {
                results = wenben;
            }
            return results;
        };
    })
    .filter('getnewnormalvalue', function () {
        return function (normalvalue) {
            if (normalvalue.substr(0, 1) == '-') {
                results = '<=' + normalvalue.substr(1, normalvalue.length - 1)
            }
            if (normalvalue.substr(-1) == '-') {
                results = '>=' + normalvalue.substr(0, normalvalue.length - 1)
            }
            if (normalvalue.substr(0, 1) != '-' && normalvalue.substr(-1) != '-') {
                results = normalvalue
            }
            return results;
        };
    })
    .filter('getnewmessage', function () {
        return function (wenben) {
            if (wenben.length > 15) {
                results = wenben.substring(0, 20) + "...";
            } else {
                results = wenben;
            }
            return results;
        };
    })
    /**
     * 交流天地（个人发表内容展示）
     */
    .directive('showMessagejkq', ['$ionicViewSwitcher', '$rootScope', '$state', 'Popup', '$window', '$location', 'audioControl', 'XywyService', 'Message', '$ionicPopup', '$timeout', '$ionicLoading', function ($ionicViewSwitcher, $rootScope, $state, Popup, $window, $location, audioControl, XywyService, Message, $ionicPopup, $timeout, $ionicLoading) {

        return {
            scope: {
                geRen: "=",
                qzXiangqing: "="
            },
            restrict: 'ACE',
            template: '<div style="margin-top: 10px;" ng-repeat="items in geRen track by $index" ng-init="outerindex=$index" ng-click="gopostDetail(items.id)" class="tezi">' +
                '<div class="item item-avatar">' +
                '<img ng-src="{{items.usertouxiang}}">' +
                '<div style="float: left;">' +
                '   <div class="f-12">{{items.username}}</div>' +
                '   <div class="f-12">{{items.ftsj | getDateDiff}}</div>' +
                '</div>' +
                '<div style="float: right;" ng-if="qzXiangqing">' +
                '<span class="yuanjiao" ng-click="goquanzi($event,items.qId)">' + '<i class="icon iconfont icon-quanzi">' + '</i>{{items.qname}}<span>' +
                '</div>' +
                '</div>'

                +
                '<div class="item item-body" style="border: 0px;">' +
                '<h2>{{items.name}}</h2>' +
                '<p>{{items.neirong | getmorewenben}}</p>' +
                ' <img ng-if="items.pictureList.length==1" ng-repeat="itemurl in items.pictureList" class="full-image" style="height:10rem; width:33%" ng-src="{{itemurl.picture}}" ng-click="showimg($event,items.pictureList,0)">'
                //				         +' <img ng-if="items.imgurl.length >1" ng-repeat="itemurl in items.imgurl track by $index" ng-init="innerindex=$index" style="height: 10rem; width:33%;padding:0.3rem;clip: rect(0px 130px 116px 0px);" src="{{itemurl}}">'
                +
                ' <div ng-if="items.pictureList.length >1" ng-repeat="itemurl in items.pictureList track by $index" ng-init="innerindex=$index" style="height: 10rem; width:30%;margin:0.3rem;background:url({{itemurl.picture}});background-size: cover;background-repeat: no-repeat;float: left;" ng-click="showimg($event,items.pictureList,innerindex)"></div>' +
                '</div>' +
                '<div class="item-footer op">' +
                '<span class="jinghua" style="margin-top:1rem" ng-show="items.jinghua==1">精华</span>' +
                '<a class="" href="" ><i class="icon iconfont icon-liulan" style="color: darkgray;"></i> {{items.ckcs}}</a>' +
                '<a class="" href="" ng-click="pinglun($event,items.id,items.qId,items.name)"><i class="icon iconfont icon-huifu" style="color: darkgray;"></i> {{items.pjcs}}</a>' +
                '<a class="" href="" ng-click="dianzan($event,items.id,items.dianzan)" ><i class="icon iconfont icon-dianzan" style="color: darkgray;" ng-style=\"{color:(items.dianzan==1)? \'#FFA800\':\'darkgray\'}\"></i> {{items.dzcs}}</a>' +
                '</div>' +
                '</div>',
            link: function ($scope, $element, $attrs) {
                $scope.list = $scope.geRen;
                $scope.picturelist = [];
                $scope.showimg = function (event, imgurllist, index) {
                    for (var i = 0; i < imgurllist.length; i++) {
                        $scope.picturelist.push(imgurllist[i].picture)
                    }
                    event.stopPropagation();
                    var list = angular.toJson($scope.picturelist);
                    $state.go("jkqimgyulan", {
                        list: list,
                        curindex: index
                    });
                };

                //点赞单击
                $scope.dianzan = function (event, id, dianzan) {
                    event.stopPropagation();
                    if ($scope.clicked) {
                        $scope.cancelClick = true;
                        return;
                    }

                    $scope.clicked = true;

                    $timeout(function () {
                        if ($scope.cancelClick) {
                            $scope.cancelClick = false;
                            $scope.clicked = false;
                            return;
                        }
                        var param = {};
                        param.userId = sessionStorage.getItem("openId");
                        param.tId = id;
                        for (var i = 0; i < $scope.geRen.length; i++) {
                            if ($scope.geRen[i].id == id) {
                                param.shoucang = $scope.geRen[i].shoucang
                                break;
                            }
                        }
                        if (dianzan == 1) {
                            param.dianzan = 0;
                        } else {
                            param.dianzan = 1;
                        }
                        XywyService.save("/jkq/settieizidzsc", param)
                            .then(function (data) {
                                if (data) {
                                    if (param.dianzan == 0) {
                                        for (var i = 0; i < $scope.geRen.length; i++) {
                                            if ($scope.geRen[i].id == id) {
                                                $scope.geRen[i].dianzan = "0";
                                                break;
                                            }
                                        }
                                        for (var i = 0; i < $scope.geRen.length; i++) {
                                            if ($scope.geRen[i].id == id) {
                                                $scope.geRen[i].dzcs = parseInt($scope.geRen[i].dzcs) - 1;
                                                break;
                                            }
                                        }
                                        $ionicLoading.show({
                                            template: '取消点赞',
                                        });
                                    } else {
                                        for (var i = 0; i < $scope.geRen.length; i++) {
                                            if ($scope.geRen[i].id == id) {
                                                $scope.geRen[i].dianzan = "1";
                                                break;
                                            }
                                        }
                                        for (var i = 0; i < $scope.geRen.length; i++) {
                                            if ($scope.geRen[i].id == id) {
                                                $scope.geRen[i].dzcs = parseInt($scope.geRen[i].dzcs) + 1;
                                                break;
                                            }
                                        }
                                        $ionicLoading.show({
                                            template: '已点赞',
                                        });
                                    }


                                }

                                $timeout(function () {
                                    $ionicLoading.hide();
                                }, 2000);
                            }).catch(function (err) {
                                console.log(err)
                            });
                        $scope.cancelClick = false;
                        $scope.clicked = false;
                    }, 500);


                };
                /**
                 * 跳转圈子页面
                 */
                $scope.qzname = "";
                $scope.qzrenshu = "";
                $scope.qzhuati = "";
                $scope.shifoujiaru = "";
                $scope.goquanzi = function (event, id) {
                    event.stopPropagation();
                    $state.go("qzXiangQing", {
                        qzid: id
                    });
                };
                /**
                 * 跳转评论页面
                 */
                $scope.pinglun = function (event, id) {
                    event.stopPropagation();
                    $state.go("postDetail", {
                        tzid: id
                    });
                };
                /**
                 * 帖子详情页跳转
                 */
                $scope.gopostDetail = function (id) {
                    $state.go("postDetail", {
                        tzid: id
                    });
                };


            }
        };
    }])
    /**
     * 症状、疾病、药品、指标详情页面标签跳转提取
     */
    .service('GoZzJbYp', ['XywyService', '$state', function (XywyService, $state) {
        var self = this;
        //详情页面跳转（不同知识间的跳转形成闭环）
        this.yaopinlist = function (name, leixing) {
            //        	name="红细胞";
            //        	leixing="检验";
            if (leixing == "中医体质") {
                $state.go('tzpgOneDetail', {
                    name: name
                });
            }
            if (leixing == "穴位") {
                $state.go('xueweiOneDetail', {
                    name: name
                });
            }
            //阻止冒泡事件
            event.stopPropagation();
            var param = {
                ypmc: name,
                leixing: leixing
            };
            var config = {
                params: param,
                cache: false
            }
            XywyService.query("/getyaopinlist", config).then(function (response) {
                if (response.data.length == 0) {

                } else if (response.data.length == 1) {
                    if (leixing === "药品") {
                        $state.go('wenyaodetail', {
                            id: response.data[0].id,
                            estype: "yp",
                            viewTitle: name
                        });
                    } else if (leixing === "症状") {
                        $state.go('changjianzzdetail', {
                            id: response.data[0].id
                        });
                    } else if (leixing === "检验") {
                        $state.go('jianyanzhibiao', {
                            id: response.data[0].id,
                            viewTitle: name
                        });
                    } else if (leixing === "疾病") {
                        $state.go('wenjibingdetail', {
                            id: response.data[0].id,
                            estype: "jb",
                            viewTitle: name
                        });
                    }else if (leixing === "手术") {
                        $state.go('shouShuDetail', {
                            id: response.data[0].id,
                            estype: "ss",
                            viewTitle: name
                        });
                    }

                } else {
                    //跳转到药品列表页面
                    sessionStorage.setItem("yaopinlist", angular.toJson(response.data));
                    $state.go('yaopinlist', {
                        leixing: leixing
                    });
                }
            });
        }

    }])
    /**
     * 时间选择器
     */
    .service('TimeXuanZe', ['XywyService', '$state', '$ionicLoading', '$timeout', function (XywyService, $state, $ionicLoading, $timeout, $scope) {
        var self = this;
        // 初始化时间
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

        this.datePiker = function (id) {
            var date;
            var selectDateDom = $("#" + id);
            var showDateDom = selectDateDom;
            if (showDateDom.attr('data-year')) {

            } else {
                showDateDom.attr('data-year', nowYear);
            }
            if (showDateDom.attr('data-month')) {

            } else {
                showDateDom.attr('data-month', nowMonth);
            }
            if (showDateDom.attr('data-date')) {

            } else {
                showDateDom.attr('data-date', nowDate);
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

                    selectDateDom.val(selectOneObj.value + '/' + selectTwoObj.value + '/' + selectThreeObj.value);

                    //返回值
                }
            });

        };


    }]);