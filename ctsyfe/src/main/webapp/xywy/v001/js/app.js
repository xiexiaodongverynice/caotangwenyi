// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'tabSlideBox', 'touch', 'starter.newControllers', 'starter.wenyiControllers', 'starter.jbssbmcxControllers', 'starter.JianKangQuanControllers', 'starter.FuYouJianKangControllers', 'starter.pingGuControllers', 'starter.zndzControllers', 'starter.tjkswzxyController', 'starter.ZhongYiYangShengControllers', 'starter.ZhongYiYangShengNewControllers', 'starter.ypznControllers', 'starter.jiaTingJKDAControllers', 'starter.tiJianBaoGaoControllers', 'starter.zhenLiaoJLControllers', 'starter.services', 'starter.audioCtrl', 'starter.newStart', 'component', 'jsUtil', 'ui.router', 'ngFileUpload', 'jtjkdaechars', 'starter.commonserch', 'starter.WDSCControllers'])
    //'ngCordova',
    .run(['$q', '$http', '$rootScope', '$location', '$window', 'wxApi', 'Popup', '$ionicHistory', '$timeout',
        function ($q, $http, $rootScope, $location, $window, wxApi, Popup, $ionicHistory, $timeout) {
            //wxApi.init().catch(Popup.alert);
            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                if (toState.name !== "yunqi" && toState.name !== "ertongmianyi") {
                    wxApi.init().catch(Popup.alert);
                }
                if ((fromState.name === "ssys" || fromState.name === "xwys" || fromState.name === "wenyi" || "jbssbmcx" || fromState.name === "yuyinjiaohuclick" || fromState.name === "wenyaodetail" || fromState.name === "changjianzzdetail" || fromState.name === "jianyanzhibiao" || fromState.name === "jianchajielun" || fromState.name === "wenjibingdetail" || fromState.name === "wenzzxq" || fromState.name === "wenzzjcjy" || fromState.name === "guahao" || fromState.name === "wenjibinglist" || fromState.name === "yaoPinZhiNan" || fromState.name === "huiyuan") && (toState.name === "shouye" || toState.name === "yiyuanshouye" || toState.name === "Physicianshouye" || toState.name === "zyysMain"|| toState.name === "ypznMain")) {
                    $timeout(function () {
                        //手动清除交互缓存
                        $ionicHistory.clearCache(["yuyinjiaohuclick_gn=WBG", "yuyinjiaohuclick_gn=WZZ", "yuyinjiaohuclick_gn=WJB", "yuyinjiaohuclick_gn=WSS", "yuyinjiaohuclick_gn=WYP", "yuyinjiaohuclick_gn=ZNDZ", "yuyinjiaohuclick_gn=ZWPG", "yuyinjiaohuclick_gn=CJZZ", "wenjibinglist", "ssys_type=ss", "xwys_type=xw", "yaoPinZhiNan", "wenyi", "huiyuan", "jbssbmcx_gn=JBSSBMCX", "healthcarequery_gn=YBCX", "yuyinjiaohuclick_gn=FYJK", "yuyinjiaohuclick_gn=JJJK"]);
                    });
                }
            });
        }
    ])
    //全局设置loading
    .constant('$ionicLoadingConfig', {
        noBackdrop: false,
        template: '<ion-spinner icon="ios"></ion-spinner>',
        animation: 'fade-in',
    })
    .filter('toPy', function () {
        return function (str) {
            return codefans_net_CC2PY(str);
        };
    })
    .factory('fileReader', ["$q", "$log", function ($q, $log) {
        var onLoad = function (reader, deferred, scope) {
            return function () {
                scope.$apply(function () {
                    deferred.resolve(reader.result);
                });
            };
        };
        var onError = function (reader, deferred, scope) {
            return function () {
                scope.$apply(function () {
                    deferred.reject(reader.result);
                });
            };
        };
        var getReader = function (deferred, scope) {
            var reader = new FileReader();
            reader.onload = onLoad(reader, deferred, scope);
            reader.onerror = onError(reader, deferred, scope);
            return reader;
        };
        var readAsDataURL = function (file, scope) {
            var deferred = $q.defer();
            var reader = getReader(deferred, scope);
            reader.readAsDataURL(file);
            return deferred.promise;
        };
        return {
            readAsDataUrl: readAsDataURL
        };
    }])
    .config(['$stateProvider', '$locationProvider', '$urlRouterProvider', '$ionicConfigProvider', function ($stateProvider, $locationProvider, $urlRouterProvider, $ionicConfigProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

            .state('shouye', {
                url: "/shouye/:openid/:token",
                cache: true,
                templateUrl: "Xunyiwenyao/shouye.v1001.html",
                controller: 'ShouYeC'
            })

            //授权登录
            .state('shouQuanDenglu', {
                url: "/shouQuanDenglu/:openid/:isshouquan",
                cache: false,
                reloadOnSearch: false,
                templateUrl: "Xunyiwenyao/shouQuandenglu.html",
                controller: 'ShouQuanDengluC'
            })

            .state('yiyuanshouye', {
                url: "/hosver/:hosorgCode/:yxzsurl/:openid/:token",
                cache: true,
                templateUrl: function ($routeParams) {
                    return "hosVersion/" + $routeParams.hosorgCode + "/shouye.html";
                },
                controller: 'ShouYeC'
            })

            //问药详情
            .state('wenyaodetail', {
                url: "/wenyaodetail/:id/:showItem/:estype/:viewTitle",
                cache: true,
                templateUrl: "Zhinengdaozhen/detail.v1001.html",
                controller: 'Wenyaodetail',
                controllerAs: 'ctrl'
            })
            //常见症状详情
            .state('changjianzzdetail', {
                url: "/changjianzzdetail/:id/:estype",
                cache: true,
                templateUrl: "Zhinengdaozhen/detail.v1001.html",
                controller: 'Changjianzzdetail',
                controllerAs: 'ctrl'
            })
            //手术详情
            .state('wenshoushudetail', {
                url: "/wenshoushudetail/:id",
                cache: true,
                templateUrl: "Zhinengdaozhen/detail.v1001.html",
                controller: 'Wenshoushudetail',
                controllerAs: 'ctrl'
            })
            //问报告
            .state('wenbaogao', {
                url: "/wenbaogao",
                cache: true,
                templateUrl: "Xunyiwenyao/wenbaogao.v1001.html",
                controller: 'Wenbaogao'
            })
            .state('jianyanzhibiao', {
                url: "/jianyanzhibiao/:id/:estype/:viewTitle/:fanwei/:fanweititle",
                cache: true,
                templateUrl: "Zhinengdaozhen/detail.v1001.html",
                controller: 'jianyanzhibiaoC',
                controllerAs: 'ctrl'
            })
            .state('jianchajielun', {
                url: "/jianchajielun/:id/:viewTitle",
                cache: true,
                templateUrl: "Zhinengdaozhen/detail.v1001.html",
                controller: 'jianchajielunC',
                controllerAs: 'ctrl'
            })
            //问报告详情
            .state('wenbaogaodetail', {
                url: "/wenbaogaodetail/:xmlb/:id",
                cache: true,
                templateUrl: "Xunyiwenyao/wenbaogaodetail.v1001.html",
                controller: 'Wenbaogaodetail'
            })
            //问报告详情
            .state('wenbaogaodetailclick', {
                url: "/wenbaogaodetail/:xmlb/:id/:click",
                cache: true,
                templateUrl: "Xunyiwenyao/wenbaogaodetail.v1001.html",
                controller: 'Wenbaogaodetail'
            })

            //问疾病详情
            .state('wenjibingdetail', {
                url: "/wenjibingdetail/:id/:estype/:viewTitle",
                cache: true,
                templateUrl: "Zhinengdaozhen/detail.v1001.html",
                controller: 'Wenjibingdetail',
                controllerAs: 'ctrl'
            })
            
            //手术详情
            .state('shouShuDetail', {
                url: "/shouShuDetail/:id/:estype/:viewTitle",
                cache: true,
                templateUrl: "Zhinengdaozhen/detail.v1001.html",
                controller: 'shouShuDetail',
                controllerAs: 'ctrl'
            })
            //妇幼健康详情
            .state('fuYougdetail', {
                url: "/fuYougdetail/:id/:estype/:viewTitle",
                cache: true,
                templateUrl: "Zhinengdaozhen/detail.v1001.html",
                controller: 'FuYougdetail',
                controllerAs: 'ctrl'
            })
            //接受便民助手跳转
            .state('xywy', {
                url: "/xywy/:state/:openId/:orgCode",
                cache: false,
                template: '',
                controller: 'BmzsC'
            })
            //科室推荐首页
            .state('keshituijian', {
                url: "/keshituijian",
                cache: true,
                templateUrl: "Zhinengdaozhen/keshituijian.html",
                controller: 'KSTJ'
            })
            //图片选部位
            .state('xuanbuwei', {
                url: "/buwei",
                cache: true,
                templateUrl: "Zhinengdaozhen/xuanbuwei.v1001.html",
                controller: 'XuanbuweiC'
            })
            //列表选疾病
            .state('changjianjb', {
                url: "/liebiao/:xingbie/:renqun",
                cache: false,
                templateUrl: "Zhinengdaozhen/jibingliebiao.v1001.html",
                controller: 'changjianjbC'
            })
            .state('xitongjb', {
                url: '/xitong/:xingbie/:renqun/:xitong',
                cache: true,
                templateUrl: "Zhinengdaozhen/xitong.v1001.html",
                controller: "xitongjbC"
            })
            //部位症状
            .state('buweizz', {
                resolve: {
                    buweiData: ['XywyService', '$stateParams', '$state', '$window', 'Popup', function (XywyService, $stateParams, $state, $window, Popup) {
                        return XywyService.query("/getBuWeiZz", { params: $stateParams }).then(
                            function (response) {
                                if (response.data.recordId) {
                                    var keshi = {};
                                    keshi[response.data.keshi] = 0;
                                    $window.sessionStorage.setItem('tuijiankeshi', angular.toJson(keshi));
                                    //$state.go('tuijiankeshi', { recordId: response.data.recordId });
                                    //if($window.sessionStorage.getItem("dingwei")) {
                                    //	if(sessionStorage.getItem("dingwei")=="true") {
                                    /*$state.go('tuijianyyks2', { recordId: response.data.recordId });*/
                                    $state.go('cgkeshi', { recordId: response.data.recordId });
                                    //	} else {
                                    //		Popup.alert('请先选择城市！');
                                    //	}
                                    //} else {
                                    //	Popup.alert('请先选择城市！');
                                    //}
                                } else {
                                    return response;
                                }
                            });
                        //return deferred.promise;
                    }]
                },
                url: "/buwei/:xingbie/:renqun/:buwei",
                cache: true,
                templateUrl: "Zhinengdaozhen/bwZhengZhuang.v1001.html",
                controller: "buweizzC"
            })
            .state('yypm', {
                url: "/yypm",
                cache: false,
                templateUrl: "Zhinengdaozhen/yypm.v1001.html",
                controller: "yypmC"
            })
            // //症状问答
            // .state('wenda', {
            //     url: "/wenda/:xingbie/:renqun/:buwei/:zhengzhuang",
            //     cache: false,
            //     templateUrl: "Zhinengdaozhen/zhengZhuangWenDa.v1001.html",
            //     controller: "ZZWenDaC",
            // })
            //推荐科室
            .state('cgkeshi', {
                url: "/cgkeshi/:recordId/:showjb/:jbmc",
                cache: false,
                templateUrl: "Zhinengdaozhen/cgkeshi.v1001.html",
                controller: "CGkeshiC"
            })

            //挂号页面
            .state('guahao', {
                url: "/guahao/:recordId/:cgks",
                cache: true,
                templateUrl: "Zhinengdaozhen/guahao.v1001.html",
                controller: "GuahaoC"
            })
            //中医养生首页
            .state('zyysMain', {
                url: "/zyysMain",
                cache: true,
                templateUrl: "zhongyiyangsheng/zyysMain.v1001.html",
                controller: "zyysMainC"
            })
            //膳食养生
            .state('ssys', {
                url: "/ssys/:type",
                cache: true,
                templateUrl: "zhongyiyangsheng/ssys.v1001.html",
                controller: "ssysC"
            })
            //穴位养生
            .state('xwys', {
                url: "/xwys/:type",
                cache: true,
                templateUrl: "zhongyiyangsheng/xwys.v1001.html",
                controller: "ssysC"
            })
            //中医养生首页
            .state('zhongyiyangsheng', {
                url: "/zhongyiyangsheng/:recordId",
                cache: true,
                templateUrl: "Xunyiwenyao/zyysshouye.v1001.html",
                controller: "ZyysC"
            })
            //风险评估
            .state('fengxianpinggu', {
                url: "/fengxianpinggu/:recordId",
                cache: false,
                templateUrl: "fengXianPingGu/FengXianPingGu.v1001.html",
                controller: "FxpgC"
            })
            .state('yuyinjiaohu', {
                url: "/yuyinjiaohu",
                cache: false,
                templateUrl: "Zhinengdaozhen/yuyinjiaohu.v1001.html",
                controller: "yuyinjiaohu"
            })
            .state('yuyinjiaohuclick', {
                url: "/yuyinjiaohu/:gn/:zhuci",
                cache: true,
                reloadOnSearch: false,
                templateUrl: "Zhinengdaozhen/yuyinjiaohu.v1001.html",
                controller: "yuyinjiaohu"
            })

            .state('yuyinjiaohuclickZndz', {
                url: "/yuyinjiaohu/:gn/:zhuci/:history",
                cache: true,
                reloadOnSearch: false,
                templateUrl: "Zhinengdaozhen/yuyinjiaohu.v1001.html",
                controller: "yuyinjiaohu"
            })

            .state('yuyinjiaohujcswzz', {
                url: "/yuyinjiaohu/:gn/:zhuci/:openid/:token",
                cache: true,
                reloadOnSearch: false,
                templateUrl: "Zhinengdaozhen/yuyinjiaohu.v1001.html",
                controller: "yuyinjiaohu"
            })
            .state('yuyinjiaohufangan', {
                url: "/yuyinjiaohu/:gn/:zhuci/:openid/:token/:fangan",
                cache: true,
                reloadOnSearch: false,
                templateUrl: "Zhinengdaozhen/yuyinjiaohu.v1001.html",
                controller: "yuyinjiaohu"
            })
            .state('hmpyuyinjiaohujcswzz', {
                url: "/yuyinjiaohu/:gn/:zhuci/:hosorgCode/:yxzsurl/:openid/:token",
                cache: true,
                reloadOnSearch: false,
                templateUrl: "Zhinengdaozhen/yuyinjiaohu.v1001.html",
                controller: "yuyinjiaohu"
            })

            .state('yuyinjiaohuorgzzpg', {
                url: "/yuyinjiaohu/:gn/:zhuci/:orgid/:openid/:t1/:t2/:t3",
                cache: true,
                reloadOnSearch: false,
                templateUrl: "Zhinengdaozhen/yuyinjiaohu.v1001.html",
                controller: "yuyinjiaohu"
            })


            /*问症状详情*/
            .state('wenzzxq', {
                url: "/wenzzxq/:jbmc",
                cache: false,
                //                templateUrl: "Xunyiwenyao/wenzzxq.v1001.html",
                templateUrl: "Zhinengdaozhen/detail.v1001.html",
                controller: 'wenzzxqjs',
                controllerAs: 'ctrl'
            })
            /*问症状检查检验详情*/
            .state('wenzzjcjy', {
                url: "/wenzzjcjy/:jcmc",
                cache: false,
                templateUrl: "Zhinengdaozhen/detail.v1001.html",
                controller: 'wenzzjcjyxq',
                controllerAs: 'ctrl'
            })

            //            会员天地
            .state('huiyuan', {
                url: "/huiyuan",
                cache: false,
                templateUrl: "Xunyiwenyao/huiyuan.v1001.html",
                controller: 'huiyuan'
            })
             //            我的消息
             .state('myMessage', {
                url: "/myMessage",
                cache: false,
                templateUrl: "myMessage/myMessage.v1001.html",
                controller: 'myMessage'
            })
            //            消息列表
            .state('messageList', {
                url: "/messageList/:type",
                cache: false,
                templateUrl: "myMessage/messagelist.v1001.html",
                controller: 'messageList'
            })
            //            我的收藏
            .state('wdscMain', {
                url: "/wdscMain",
                cache: true,
                templateUrl: "woDeShouCang/wdscMain.v1001.html",
                controller: 'wdscMainC'
            })
            .state('wdscList', {
                url: "/wdscList/:type",
                cache: true,
                templateUrl: "woDeShouCang/wdscList.v1001.html",
                controller: 'wdscListC'
            })
            //            关于我们
            .state('guanyu', {
                url: "/guanyu",
                cache: true,
                templateUrl: "Xunyiwenyao/guanyu.v1001.html",
                controller: 'guanyu'
            })
            //           吐槽
            .state('tucao', {
                url: "/tucao",
                cache: true,
                templateUrl: "Xunyiwenyao/tucao.v1001.html",
                controller: 'tucao'
            })
            //          预览
            .state('tpyulan', {
                url: "/tpyulan",
                cache: false,
                templateUrl: "Xunyiwenyao/tpyulan.v1001.html",
                controller: 'tpyulan'
            })

            .state('jlhd', {
                url: '/jlhd',
                cache: false,
                templateUrl: "Xunyiwenyao/jlhd.v1001.html",
                controller: "jlhdC"
            })

            .state('wenjibinglist', {
                url: "/wenjibinglist",
                cache: true,
                templateUrl: "Xunyiwenyao/wenjibinglist.v1001.html",
                controller: 'wenjibinglist'
            })
            //疾病查询页
            .state('jibingserch', {
                url: "/jibingserchMain/:gn",
                cache: true,
                templateUrl: "Xunyiwenyao/jibingserchMain.html",
                controller: 'commonserch'
            })
            //快速问医
            .state('wenyi', {
                url: "/wenyi",
                cache: true,
                reloadOnSearch: false,
                templateUrl: "wenyi/wenyi.v1001.html",
                controller: 'wenyi'
            })
            //--------------------------气象医学开始---------------------------
            //气象医学首页
            .state('weathershouye', {
                url: "/weathershouye",
                cache: false,
                templateUrl: "weathermedicine/weathershouye.html",
                controller: 'weathershouye'
            })
            //慢病气候健康
            .state('manbingweatherlist', {
                url: "/manbingweatherlist",
                cache: false,
                templateUrl: "weathermedicine/manbingweatherlist.html",
                controller: 'manbingweather'
            })
            //慢病详情
            .state('manbingdetail', {
                url: "/manbingdetail/:id/:estype/:viewTitle",
                cache: false,
                templateUrl: "Zhinengdaozhen/detail.v1001.html",
                controller: 'manbingdetail',
                controllerAs: 'ctrl'
            })
            //--------------------------气象医学结束---------------------------
            //--------------------------医师助手开始---------------------------
            // 疾病手术编码查询
            .state('jbssbmcx', {
                url: "/jbssbmcx/:gn",
                cache: true,
                reloadOnSearch: false,
                templateUrl: "jbssbmcx/jbssbmcx.v1001.html",
                controller: 'jbssbmcxC'
            })
            // 疾病手术类目详情
            .state('typedetail', {
                url: "/typedetail/:bm/:lx/:name",
                cache: true,
                reloadOnSearch: false,
                templateUrl: "jbssbmcx/typedetail.v1001.html",
                controller: 'typedetail',
                controllerAs: 'typedetail'
            })
            //医保查询
            .state('healthcarequery', {
                url: "/healthcarequery/:gn",
                cache: true,
                reloadOnSearch: false,
                templateUrl: "Physicianassistants/healthcarequery.html",
                controller: 'healthcarequery'
            })
            //医师助手首页
            .state('Physicianshouye', {
                url: "/Physicianshouye",
                cache: false,
                templateUrl: "Physicianassistants/Physicianshouye.html",
                controller: 'Physicianshouye'
            })
            //药品详情
            .state('yaopindetails', {
                url: "/yaopindetails/:yaopinid/:yaopinname",
                cache: true,
                reloadOnSearch: false,
                templateUrl: "Physicianassistants/yaopindetails.html",
                controller: 'yaopindetails',
                controllerAs: 'ctrl'
            })
            //--------------------------医师助手结束---------------------------
            //--------------------------体检报告解读与检验检查报告开始---------------------------
            // 体检报告解读上传页面
            .state('tiJianBaoGao', {
                url: "/tiJianBaoGao/:type/:id",
                cache: true,
                templateUrl: "tiJianBaoGao/medical.html",
                controller: 'medical'
            })
            // 体检报告确认上传
            .state('tiJianBaoGaoQR', {
                url: "/tiJianBaoGaoQR/:id/:type/:fid",
                cache: false,
                templateUrl: "tiJianBaoGao/tiJianBaoGaoQR.html",
                controller: 'tiJianBaoGaoQR'
            })
            // 体检报告列表
            .state('medicallist', {
                url: "/medicallist/:type/:id",
                cache: false,
                templateUrl: "tiJianBaoGao/medicallist.html",
                controller: 'medicallist'
            })
            // 体检报告详情
            .state('medicalDetails', {
                url: "/medicalDetails/:id/:type/:fid/:status",
                cache: false,
                templateUrl: "tiJianBaoGao/medicalDetails.html",
                controller: 'medicalDetails'
            })
            // 体检报告状态
            .state('medicalstats', {
                url: "/medicalstats/:type/:id/:recordPid",
                cache: false,
                templateUrl: "tiJianBaoGao/medicalstats.html",
                controller: 'medicalstats'
            })
            // 体检报告修改检验信息
            .state('jianyanEdit', {
                url: "/jianyanEdit/:qid/:rid/:type",
                cache: false,
                templateUrl: "tiJianBaoGao/jianyanEdit.html",
                controller: 'jianyanEdit'
            })
            // 体检报告修改检查信息
            .state('jianchaEdit', {
                url: "/jianchaEdit/:id/:rid",
                cache: false,
                templateUrl: "tiJianBaoGao/jianchaEdit.html",
                controller: 'jianchaEdit'
            })
            //--------------------------体检报告解读与检验检查报告结束---------------------------
            // 
            .state('lmxx', {
                url: "/lmxx/:bm",
                cache: true,
                reloadOnSearch: false,
                templateUrl: "jbssbmcx/lmxx.v1001.html",
                controller: 'lmxxC'
            })
            //症状问答
            .state('wenda', {
                url: "/wenda/:xingbie/:renqun/:buwei/:zhengzhuang",
                cache: false,
                templateUrl: "Zhinengdaozhen/zhengZhuangWenDa.v1001.html",
                controller: "ZZWenDaC",
            })
            //            推荐科室中问症寻医
            .state('tjkswzxy', {
                url: "/wenyi/:gn/:zhuci/:history",
                cache: true,
                reloadOnSearch: false,
                templateUrl: "wenyi/wenyi.v1001.html",
                controller: 'tjkswzxy'
            })
            .state('pingGu', {
                url: "/pingGu/:type/:mainId",
                cache: false,
                templateUrl: "pingGu/tzpg.v1001.html",
                controller: 'tzpgC'
            })
            .state('pingGuMain', {
                url: "/pingGuMain/:type",
                cache: false,
                templateUrl: "pingGu/pingGuMain.v1001.html",
                controller: 'pingGuMainC'
            })


            .state('tzpgJieShao', {
                url: "/tzpgJieShao",
                cache: false,
                reloadOnSearch: false,
                templateUrl: "pingGu/tzpgJieShao.html",
                controller: 'tzpgjieshaoC'
            })
            .state('tzpgJieGuo', {
                url: "/tzpgJieGuo/:type",
                cache: false,
                reloadOnSearch: false,
                templateUrl: "pingGu/tzpgJieGuo.html",
                controller: 'tzpgjieguoC'
            })
            .state('tzpgDetail', {
                url: "/tzpgDetail/:type",
                cache: false,
                reloadOnSearch: false,
                templateUrl: "pingGu/tzpgDetail.html",
                controller: 'tzpgDetail'
            })
            // 体质评估闭环详情页
            .state('tzpgOneDetail', {
                url: "/tzpgOneDetail/:name",
                cache: false,
                templateUrl: "Zhinengdaozhen/detail.v1001.html",
                controller: 'tzpgOneDetail',
                controllerAs: 'ctrl'
            })
            .state('tzpgHistory', {
                url: "/tzpgHistory/:type",
                cache: false,
                reloadOnSearch: false,
                templateUrl: "pingGu/tzpgHistory.html",
                controller: 'tzpgHistory'
            })
            .state('yaopinlist', {
                url: "/yaopinlist/:leixing",
                cache: false,
                templateUrl: "Xunyiwenyao/yaopinlist.v1001.html",
                controller: "yaopinlist",
            })
            //--------------------------健康圈开始---------------------------
            //健康圈子列表
            .state('qzGuangChang', {
                url: "/qzGuangChang",
                cache: false,
                templateUrl: "JianKangQuan/quanZiGuangChang.html",
                controller: "qzGuangChang",
            })
            //健康圈子详情
            .state('qzXiangQing', {
                url: "/qzXiangQing/:qzid",
                cache: false,
                templateUrl: "JianKangQuan/quanZiXiangQing.html",
                controller: "qzXiangQing",
            })
            //健康圈首页
            .state('jiankangquan', {
                url: "/jiankangquan",
                cache: false,
                templateUrl: "JianKangQuan/jkq.v1001.html",
                controller: "jkqfind",
            })
            //健康圈之帖子详情
            .state('postDetail', {
                url: "/postDetail/:tzid/:go",
                cache: false,
                templateUrl: "JianKangQuan/postDetail.html",
                controller: 'postDetailC'
            })
            //健康圈图片预览
            .state('jkqimgyulan', {
                url: "/jkqimgyulan/:list/:curindex",
                cache: true,
                templateUrl: "JianKangQuan/jkqimgyulan.v1001.html",
                controller: "jkqimgyulan",
            })
            //健康圈之跳转评论
            .state('commentFaBu', {
                url: "/commentFaBu/:tziid/:qzid/:tzname",
                cache: true,
                templateUrl: "JianKangQuan/commentFaBu.html",
                controller: 'commentFaBuC'
            })
            //健康圈之跳转写帖子
            .state('writePost', {
                url: "/writePost/:qzid/:qzname",
                cache: true,
                reloadOnSearch: false,
                templateUrl: "JianKangQuan/xieTieZi.html",
                controller: 'writePostC'
            })
            //健康圈之已参与话题
            .state('jkqparticipate', {
                url: "/jkqparticipate",
                cache: false,
                templateUrl: "JianKangQuan/jkqparticipate.html",
                controller: 'jkqparticipate'
            })
            //健康圈之评论回复
            .state('jkqpinglunrelay', {
                url: "/jkqpinglunrelay/:tziid/:qlid/:name/:hfuserId",
                cache: false,
                templateUrl: "JianKangQuan/jkqpinglunrelay.html",
                controller: 'jkqpinglunrelay'
            })
            //--------------------------健康圈结束---------------------------
            .state('ertongmianyi', {
                url: "/ertongmianyi",
                cache: false,
                templateUrl: "fuyoujiankang/ertongmianyi.html",
                controller: 'ertongmianyi'
            })
            .state('yunqi', {
                url: "/yunqi",
                cache: false,
                templateUrl: "fuyoujiankang/yunqi.html",
                controller: 'yunqi'
            })
            //中医养生首页
            .state('zyys', {
                url: "/zyys",
                cache: true,
                templateUrl: "zhongyiyangsheng/zyys.html",
                controller: 'zyysC'
            })
            //中医养生首页
            .state('yangshengshouye', {
                url: "/yangshengshouye",
                cache: false,
                templateUrl: "zhongyiyangsheng/yangshengshouye.html",
                controller: 'yangshengshouyeC'
            })
            //每日一膳详情
            .state('shanshidetail', {
                url: "/shanshidetail/:pid/:viewTitle/:displayAllContentFlag ",
                cache: false,
                //templateUrl: "zhongyiyangsheng/shanshidetail.html",
                templateUrl: "Zhinengdaozhen/detail.v1001.html",
                //controller: 'shanshidetailC'
                controller: 'ssDetailC',
                controllerAs: 'ctrl'
            })
            //每日一膳详情
            .state('xueweidetail', {
                url: "/xueweidetail/:pid/:viewTitle/:displayAllContentFlag",
                cache: false,
                //templateUrl: "zhongyiyangsheng/xueweidetail.html",
                templateUrl: "Zhinengdaozhen/detail.v1001.html",
                //controller: 'xueweidetailC',
                controller: 'xwDetailC',
                controllerAs: 'ctrl'
            })
            //每日一穴详情
            .state('xueweiOneDetail', {
                url: "/xueweiOneDetail/:name",
                cache: false,
                templateUrl: "Zhinengdaozhen/detail.v1001.html",
                controller: 'xueweiOneDetailC',
                controllerAs: 'ctrl'
            })
            //中医养生高级搜索
            .state('xuanTiaoJian', {
                url: "/xuanTiaoJian",
                cache: false,
                templateUrl: "zhongyiyangsheng/xuanTiaoJian.html",
                controller: 'xuanTiaoJianC'
            })

            //亚健康评估结果
            .state('yjkmain', {
                url: "/yjkMain/:type",
                cache: false,
                templateUrl: "pingGu/yjkMain.html",
                controller: 'yjkMainC'
            })
            //--------------------------药品指南开始---------------------------
            //药品指南主页
            .state('ypznMain', {
                url: "/ypznMain",
                cache: false,
                templateUrl: "yaoPinZhiNan/ypznMain.html",
                controller: 'ypznMainC'
            })
            //家庭用药
            .state('jtyy', {
                url: "/jtyy",
                cache: true,
                templateUrl: "yaoPinZhiNan/jtyy.html",
                controller: 'jtyyC'
            })
            //药品库
            .state('ypk', {
                url: "/ypk",
                cache: false,
                templateUrl: "yaoPinZhiNan/ypk.html",
                controller: 'ypkC'
            })
            //药品搜索页
            .state('ypSearch', {
                url: "/ypSearch/:gn",
                cache: false,
                templateUrl: "yaoPinZhiNan/ypSearch.html",
                controller: 'commonserch'
            })
            //药品列表
            .state('yplb', {
                url: "/yplb/:tj/:type/:title",
                cache: false,
                templateUrl: "yaoPinZhiNan/yplb.html",
                controller: 'yplbC'
            })
            //厂商药品列表
            .state('csyplb', {
                url: "/csyplb/:ypmc",
                cache: false,
                templateUrl: "yaoPinZhiNan/csyplb.html",
                controller: 'csyplbC'
            })
            //全部药品
            .state('yaoPinZhiNan', {
                url: '/yaoPinZhiNan/:jj_yp_keyWord',
                cache: true,
                templateUrl: "Xunyiwenyao/YaoPinZhiNan.v1001.html",
                controller: "yaoPinZhiNan"
            })

            //系统用药搜索
            .state('XiTongYongYaoFilter', {
                url: "/XiTongYongYaoFilter",
                cache: true,
                templateUrl: "yaoPinZhiNan/XiTongYongYaoFilter.html",
                controller: 'XiTongYongYaoFilterC'
            })

            //家庭用药筛选页
            .state('jtyyFilter', {
                url: "/jtyyFilter",
                cache: true,
                templateUrl: "yaoPinZhiNan/jtyyFilter.html",
                controller: 'jtyyFilterC'
            })
            //药品指南主页搜索
            .state('ypznMainSearch', {
                url: "/ypznMainSearch/:ypmc",
                cache: true,
                templateUrl: "yaoPinZhiNan/ypznMainSearch.html",
                controller: 'ypznMainSearchC'
            })
            //药品指南列表
            .state('ypchaxunliebiao', {
                url: "/ypchaxunliebiao/:xt/:type/:zz/:data/:title",
                cache: true,
                templateUrl: "yaoPinZhiNan/ypchaxunliebiao.html",
                controller: 'ypchaxunliebiaoC'
            })
            //反馈
            .state('fankui', {
                url: "/fankui",
                cache: true,
                templateUrl: "Xunyiwenyao/fankui.v1001.html",
                controller: 'fankui'
            })


            //--------------------------药品指南结束---------------------------

            //---------------------------新版症状指南（5.29）开始---------------
            .state('zhengzhuangzhinan', {
                url: "/zzzn",
                cache: true,
                templateUrl: "Xunyiwenyao/zhengzhuangzhinan.html",
                controller: "zhengzhuangzhinanC"
            })
            //---------------------------新版症状指南（5.29）开始---------------

            //---------------------------家庭健康档案（7.12）开始---------------
            //档案编辑页
            .state('dangAnEdit', {
                url: "/dangAnEdit/:self/:id",
                cache: false,
                templateUrl: "jiaTingJKDA/dangAnEdit.html",
                controller: "dangAnEditC"
            })
            //档案列表页
            .state('dangAnList', {
                url: "/dangAnList",
                cache: false,
                templateUrl: "jiaTingJKDA/dangAnList.html",
                controller: "dangAnListC"
            })
            //血压测量结果展示页
            .state('xueya', {
                url: "/xueYa/:id",
                cache: false,
                templateUrl: "jiaTingJKDA/xueYa.html",
                controller: "xueYaC"
            })
            // 血压历史
            .state('xueYaList', {
                url: "/xueYaList/:id",
                cache: false,
                templateUrl: "jiaTingJKDA/xueYaList.html",
                controller: "xueYaListC"
            })
            //手动测量血压页
            .state('celiangxueya', {
                url: "/celiangxueya/:id",
                cache: false,
                templateUrl: "jiaTingJKDA/celiangxueya.html",
                controller: "celiangxueyaC"
            })
            // 血糖页面
            .state('xueTang', {
                url: "/xueTang/:id",
                cache: false,
                templateUrl: "jiaTingJKDA/xueTang.html",
                controller: "xueTangC"
            })
            // 血糖历史
            .state('xueTangList', {
                url: "/xueTangList/:id/:code",
                cache: false,
                templateUrl: "jiaTingJKDA/xueTangList.html",
                controller: "xueTangListC"
            })
            // 血糖记录
            .state('xueTangEdit', {
                url: "/xueTangEdit/:id",
                cache: false,
                templateUrl: "jiaTingJKDA/xueTangEdit.html",
                controller: "xueTangEditC"
            })
            //体重
            .state('tizhong', {
                url: "/tiZhong/:id",
                cache: false,
                templateUrl: "jiaTingJKDA/tiZhong.html",
                controller: "tiZhongC"
            })
            //体重手动添加
            .state('tiZhongEdit', {
                url: "/tiZhongEdit/:id",
                cache: false,
                templateUrl: "jiaTingJKDA/tiZhongEdit.html",
                controller: "tiZhongEditC"
            })
            //体重历史
            .state('tiZhongList', {
                url: "/tiZhongList/:id",
                cache: false,
                templateUrl: "jiaTingJKDA/tiZhongList.html",
                controller: "tiZhongListC"
            })
            //正常值范围
            .state('zhengChangZhi', {
                url: "/zhengChangZhi/:type",
                cache: false,
                templateUrl: "jiaTingJKDA/zhengChangZhi.html",
                controller: "zhengChangZhiC"
            })
            //儿童疫苗
            .state('ChildhoodVaccines', {
                url: "/ChildhoodVaccines/:cyid/:birthday",
                cache: false,
                templateUrl: "jiaTingJKDA/ChildhoodVaccines.html",
                controller: "ChildhoodVaccines"
            })
            //全部疫苗
            .state('vaccineslist', {
                url: "/vaccineslist/:cyid/:birthday",
                cache: false,
                templateUrl: "jiaTingJKDA/vaccineslist.html",
                controller: "vaccineslist"
            })
            //全部健康体检
            .state('jiankangtijian', {
                url: "/jiankangtijian/:birthday",
                cache: false,
                templateUrl: "jiaTingJKDA/jiankangtijian.html",
                controller: "jiankangtijian"
            })
            //预产期设置
            .state('yuChanQiCZ', {
                url: "/yuChanQiCZ/:userId/:pid",
                cache: false,
                templateUrl: "jiaTingJKDA/yuChanQiCZ.html",
                controller: "yuChanQiCZC"
            })
            //孕期呵护
            .state('yuQiHH', {
                url: "/yuQiHH/:userId",
                cache: false,
                templateUrl: "jiaTingJKDA/yuQiHH.html",
                controller: "yuQiHHC"
            })
            //孕期所有产检信息列表
            .state('cjList', {
                url: "/cjList/:userId/:endtime/:index",
                cache: false,
                templateUrl: "jiaTingJKDA/cjList.html",
                controller: "cjListC"
            })
            //---------------------------家庭健康档案（7.12）开始---------------


            //---------------------------诊疗记录（11.8）开始---------------

            //诊疗记录列表页
            .state('zlJiLuList', {
                url: "/zlJiLuList/:id",
                cache: false,
                templateUrl: "zhenLiaoJiLu/zlJiLuList.html",
                controller: "zlJiLuListC"
            })

        //---------------------------诊疗记录（11.8）结束---------------

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/shouye');

        //配置安卓标题居中
        $ionicConfigProvider.navBar.alignTitle('center');
        //默认所有的滚动使用native
        $ionicConfigProvider.scrolling.jsScrolling(false);

        //配置ionic加载模板数量
        //$ionicConfigProvider.templates.maxPrefetch(5);

        //启用History Html5 模式
        // $locationProvider.html5Mode({
        //   enabled: true,
        //   requireBase: false
        // });
    }]);