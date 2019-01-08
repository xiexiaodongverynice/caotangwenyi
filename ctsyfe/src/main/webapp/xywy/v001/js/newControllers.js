angular.module('starter.newControllers', ['ionic'])
    //药品结果详情
    .controller('Wenyaodetail', ['$stateParams', 'Popup', 'QueryEsZhiShi', '$scope', '$window', '$state', 'GoZzJbYp', 'XywyService', function ($stateParams, Popup, QueryEsZhiShi, $scope, $window, $state, GoZzJbYp, XywyService) {
        $scope.isIos = false;
        $scope.inputFocus = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
            $scope.localyyzt = "打开";
        }
        $scope.currentShowItem = $stateParams.showItem;
        $scope.showJbxx = true;
        $scope.showJjz = false;
        $scope.showBlfy = false;
        if ($scope.currentShowItem) {
            $scope.showJbxx = false;
            if ($scope.currentShowItem == 1) {
                $scope.showJjz = true;
            } else {
                $scope.showBlfy = true;
            }
        }
        var self = this;
        if ($stateParams.viewTitle) {
            self.viewTitle = $stateParams.viewTitle;
        } else {
            self.viewTitle = '药品详情';
        }
        $scope.showotc;
        $scope.showYbyw;
        $scope.showjbyw;
        QueryEsZhiShi(self).then(function (data) {
            self.haveResult = true;
            self.items = [];
            var push = Array.prototype.push.bind(self.items);
            if (data.spmc) {
                self.spmc = " (" + data.spmc + ")";
            }

            self.title = data.tymc;
            //厂家
            self.subtitle = data.cj;
            if (data.isotc) {
                self.otc = 'OTC';
                $scope.showotc = true;
            }
            if (data.ybyw == '1') {
                self.ybyw = '保';
                $scope.showybyw = true;
            }
            if (data.jbyw == '1') {
                self.jbyw = '基';
                $scope.showjbyw = true;
            }
            //1英文名称
            if (data.ywmc) {
                push({ title: '英文名称', content: data.ywmc, show: true });
            }
            //2成分
            if (data.p_cf) {
                push({ title: '成份', content: data.p_cf, show: true });
            }
            //3性状
            if (data.p_xz) {
                push({ title: '性状', content: data.p_xz.trim(), show: true });
            }
            //4适应症
            if (data.syz) {
                push({ title: '适应症', content: data.syz, show: true });
            }
            //5规格
            if (data.p_gg) {
                push({ title: '规格', content: data.p_gg, show: true });
            }
            //6用法用量
            if (data.yfyl) {
                push({ title: '用法用量', content: data.yfyl, show: true });
            }
            //7不良反应
            if (data.blfy) {
                push({ title: '不良反应', content: data.blfy, show: true });
            }
            //8禁忌症
            if (data.jjz) {
                push({ title: '禁忌症', content: data.jjz, show: true });
            }
            //9注意事项
            if (data.zysx) {
                push({ title: '注意事项', content: data.zysx, show: true });
            }
            //10儿童用药
            if (data.p_et_yy) {
                push({ title: '儿童用药', content: data.p_et_yy, show: true });
            }
            //11孕妇及哺乳期妇女用药
            if (data.p_yfjbr) {
                push({ title: '孕妇及哺乳期妇女用药', content: data.p_yfjbr, show: true });
            }
            //12老年用药
            if (data.p_lnyy) {
                push({ title: '老年用药', content: data.p_lnyy, show: true });
            }
            //13药物相互作用
            if (data.p_yw_xh) {
                push({ title: '药物相互作用', content: data.p_yw_xh, show: true });
            }
            //14药理作用
            if (data.p_yl_zy) {
                push({ title: '药理作用', content: data.p_yl_zy, show: true });
            }
            //15贮藏
            if (data.p_zc) {
                push({ title: '贮藏', content: data.p_zc, show: true });
            }
            //16包装
            if (data.p_bz) {
                push({ title: '包装', content: data.p_bz, show: true });
            }
            push = null;
        }, function (reason) {
            Popup.alert(reason)
        });
        var openid = sessionStorage.getItem("openId");
        self.backshouye = function () {
            var token = sessionStorage.getItem("token");
            if (sessionStorage.getItem('hosorgCode')) {
                var yxzsurl = sessionStorage.getItem('yxzsurl');
                var hosorgCode = sessionStorage.getItem('hosorgCode');
                $state.go("yiyuanshouye", { hosorgCode: hosorgCode, openid: openid, token: token, yxzsurl: yxzsurl });
            } else {
                $state.go("shouye", { openid: openid, token: token });
            }

        }
        /**
         * 症状指南详情中药品查询
         */
        $scope.yaopinlist = function (name, leixing) {
            GoZzJbYp.yaopinlist(name, leixing);
        };

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
        $scope.showShouCang = "1"; //页面显示收藏按钮
        // 查询膳食是否收藏
        $scope.collectFlag = false;
        XywyService.save("/member/collect/determineCollectFlag.json", { userId: openid, collectDataPid: $stateParams.id, collectType: "YPZS" })
            .then(function (data) {
                $scope.collectFlag = data.data.collectFlag;

            }, function (reason) {
                Popup.alert(reason)
            });
        //添加收藏
        $scope.addShouCang = function () {
            XywyService.save("/member/collect/addCollect.json", { userId: openid, collectDataPid: $stateParams.id, collectType: "YPZS" })
                .then(function (data) {
                    $scope.collectFlag = true;
                    Popup.alert("收藏成功！");
                }, function (reason) {
                    Popup.alert(reason)
                });



        };
        //取消收藏
        $scope.cancelShouCang = function () {
            XywyService.save("/member/collect/cancelCollect.json", { userId: openid, collectDataPid: $stateParams.id, collectType: "YPZS" })
                .then(function (data) {
                    $scope.collectFlag = false;
                    Popup.alert("取消成功！");
                }, function (reason) {
                    Popup.alert(reason)
                });

        };
    }])

    //常见症状详情
    .controller('Changjianzzdetail', ['$stateParams', 'Popup', 'XywyService', '$scope', '$window', '$state', 'GoZzJbYp', 'audioControl', function ($stateParams, Popup, XywyService, $scope, $window, $state, GoZzJbYp, audioControl) {
        $scope.isIos = false;
        $scope.inputFocus = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
            $scope.localyyzt = "打开";
        }

        var self = this;
        self.viewTitle = '症状详情';
        XywyService.query('/getCjzz', { params: $stateParams }).then(function (data) {
            self.haveResult = true;
            self.items = [];
            var push = Array.prototype.push.bind(self.items);
            self.title = data.zzmc;
            var bm;
            if (data.zzbm) {
                bm = data.zzbm;
                if (bm.indexOf("、") == 0) {
                    bm = bm.substring(1, bm.length - 1);
                }
            }
            push({ title: '别名', content: bm || '暂无', show: true });
            push({ title: '症状描述', content: data.zzms || '暂无', show: true });
            /*push({ title: '就诊指南(立即就医)', content: data.jzzn1||'暂无' });
            push({ title: '就诊指南(及时就医)', content: data.jzzn2||'暂无' });*/
            var jzzncontent = "";
            var fenge = false
            if (data.jzzn1 && data.jzzn2) {
                var fenge = true;
            }

            if (data.jzzn1) {
                jzzncontent += '<div class="padding-bottom"><h4>立即就医</h4><p class="ptext">' + data.jzzn1 + '</p></div>';
            }
            if (data.jzzn2) {
                if (fenge) {
                    jzzncontent += '\n<div class="padding-bottom"><h4>及时就医</h4><p class="ptext">' + data.jzzn2 + '</p></div>';
                } else {
                    jzzncontent += '<div class="padding-bottom"><h4>及时就医</h4><p class="ptext">' + data.jzzn2 + '</p></div>';
                }
            }

            if (!data.jzzn1 && !data.jzzn2) {
                jzzncontent = "暂无"
            }

            push({ title: '就诊指南', content: jzzncontent, show: true });
            //push({ title: '就诊指南(建议就医)', content: data.jzzn3||'暂无' });
            push({ title: '自我处置', content: data.zwcz || '暂无', show: true });
            push({ title: '健康指导', content: data.jkzd || '暂无', show: true });
            push = null;
        }, function (reason) {
            Popup.alert(reason)
        });
        self.backshouye = function () {
            var openid = sessionStorage.getItem("openId");
            var token = sessionStorage.getItem("token");
            if (sessionStorage.getItem('hosorgCode')) {
                var yxzsurl = sessionStorage.getItem('yxzsurl');
                var hosorgCode = sessionStorage.getItem('hosorgCode');
                $state.go("yiyuanshouye", { hosorgCode: hosorgCode, openid: openid, token: token, yxzsurl: yxzsurl });
            } else {
                $state.go("shouye", { openid: openid, token: token });
            }

        }

        /**
         * 症状指南详情中药品查询
         */
        $scope.yaopinlist = function (name, leixing) {
            GoZzJbYp.yaopinlist(name, leixing);
        };

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

    //手术结果详情
    .controller('Wenshoushudetail', ['$stateParams', 'Popup', 'QueryZhiShi', function ($stateParams, Popup, QueryZhiShi) {
        var self = this;
        self.viewTitle = '手术详细';
        QueryZhiShi(self).then(function (data) {
            self.haveResult = true;
            self.items = [];
            var push = Array.prototype.push.bind(self.items);
            self.title = data.ssmc;
            self.subtitle = data.ssfs;
            push({ title: '手术效果', content: data.ssxg, show: true });
            push({ title: '适应症', content: data.syz });
            push({ title: '禁忌症', content: data.jjz });
            push({ title: '并发症', content: data.bfz });
            push({ title: '麻醉方式', content: data.mzfs });
            push({ title: '手术步骤', content: data.ssbz });
            push({ title: '注意事项', content: data.zysx });
            push({ title: '不良反应', content: data.slbhjs });
            push = null;
        }, function (reason) {
            Popup.alert(reason)
        });

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
    //问报告搜索
    .controller('Wenbaogao', function ($scope, $stateParams, $cacheFactory, $state, $http, $rootScope, Popup, $ionicScrollDelegate, $log, wxApi) {
        //      微信授权
        wxApi.config().catch(function (result) {
            //          失败提示
            Popup.alert(result);
        });
        $scope.begin = false;
        $scope.data = { more: false };
        $scope.yaopines = [];
        $scope.direction = [];
        $scope.data.keyword = (!!sessionStorage.getItem('yaopinmc')) ? sessionStorage.getItem('yaopinmc') : '损伤';
        $scope.clean = function () {
            $scope.data.keyword = "";
        }
        $scope.goDetail = function (xmlb, id) {
            $state.go('wenbaogaodetail', { xmlb: xmlb, id: id });
        }

        $scope.selectDetail = function (xmlb, id, index) {
            $state.go('wenbaogaodetailclick', { xmlb: xmlb, id: id, click: index });
        }

        //加载药品
        function getYaoPin(newquery) {
            var config = {
                params: {
                    keyword: $scope.data.keyword,
                    count: newquery ? 0 : $scope.yaopines.length
                }
            }
            $http.get(myConfig.serverUrl + "/getBaoGaoes", config).then(function (response) {
                if (newquery && response.data.error) {
                    Popup.alert(response.data.error)
                } else if (newquery && !config.params.count && !response.data.length) {
                    //无结果时提示
                    Popup.alert('相关数据不存在!');
                } else if (!newquery && response.data.length === 0) {
                    $scope.data.more = false;
                } else {
                    var data = response.data;
                    $scope.begin = true;
                    $scope.data.more = true;
                    $scope.data.count = data.length;
                    if (newquery) {
                        $scope.yaopines = data;
                    } else {
                        Array.prototype.push.apply($scope.yaopines, data)
                    }
                }
            }, Popup.alert);
        }

        $scope.getResult = function () {
            if (!$scope.data.keyword) {
                Popup.alert('请输入关键字！');
            } else {
                getYaoPin(true);
            }
        }
        if (sessionStorage.getItem('yaopinmc')) { //判断其他地方传入检查检验名称是否存在
            $scope.data.keyword = sessionStorage.getItem('yaopinmc');
            sessionStorage.removeItem('yaopinmc');
            $scope.getResult();
        }

        $scope.loadMore = function () {
            getYaoPin(false);
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }

        $scope.scrollTop = function () {
            $ionicScrollDelegate.$getByHandle('small').scrollTop(true);
        };
        //跳转语音输入
        $scope.goyuyin = function () {
            $state.go("yuyinsr", { mc: "wenbaogao", yuyintishi: "您可以通过语音录入检查、检验名称，我们将为您查询相应信息。" });
        }
    })

    .controller('jianchajielunC', ['$stateParams', 'QueryZhiShi', 'Popup', '$scope', '$window', '$state', 'GoZzJbYp', function ($stateParams, QueryZhiShi, Popup, $scope, $window, $state, GoZzJbYp) {
        $scope.isIos = false;
        $scope.inputFocus = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
            $scope.localyyzt = "打开";
        }

        var self = this;
        if ($stateParams.viewTitle) {
            self.viewTitle = $stateParams.viewTitle;
        } else {
            self.viewTitle = '指标详情';
        }
        QueryZhiShi().then(function (data) {
            self.haveResult = true;
            self.items = [];
            var push = Array.prototype.push.bind(self.items);
            self.title = data.jlzb + ' ' + (data.zbsx ? ('(' + data.zbsx + ')') : '');
            self.subtitle = data.xmmc;
            if (data.md) {
                push({ title: '项目目的', content: data.md, show: true });
            }
            if (data.yxms) {
                push({ title: '检查表现', content: data.yxms, show: true });
            }
            if (data.lcjs) {
                push({ title: '临床解释', content: data.lcjs, show: true });
            }
            if (data.jkzd) {
                push({ title: '健康指导', content: data.jkzd, show: true });
            }

            push = null;
        }, Popup.alert);
        self.backshouye = function () {
            var openid = sessionStorage.getItem("openId");
            var token = sessionStorage.getItem("token");
            if (sessionStorage.getItem('hosorgCode')) {
                var yxzsurl = sessionStorage.getItem('yxzsurl');
                var hosorgCode = sessionStorage.getItem('hosorgCode');
                $state.go("yiyuanshouye", { hosorgCode: hosorgCode, openid: openid, token: token, yxzsurl: yxzsurl });
            } else {
                $state.go("shouye", { openid: openid, token: token });
            }
        };
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
        /**
         * 症状指南详情中药品查询
         */
        $scope.yaopinlist = function (name, leixing) {
            GoZzJbYp.yaopinlist(name, leixing);
        };
    }])
    //问报告结果详情
    .controller('jianyanzhibiaoC', ['$stateParams', 'QueryZhiShi', 'Popup', '$scope', '$window', '$state', 'GoZzJbYp', function ($stateParams, QueryZhiShi, Popup, $scope, $window, $state, GoZzJbYp) {
        $scope.isIos = false;
        $scope.inputFocus = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
            $scope.localyyzt = "打开";
        }
        var self = this;
        if ($stateParams.viewTitle) {
            self.viewTitle = $stateParams.viewTitle;
        } else {
            self.viewTitle = '指标详情';
        }

        QueryZhiShi(self).then(function (data) {
            self.haveResult = true;
            self.items = [];
            var push = Array.prototype.push.bind(self.items);
            self.title = data.jlzb;
            //            self.subtitle = data.zbmc + ' ' + (data.zbsx ? ('(' + data.zbsx + ')') : '');
            self.subtitle = data.xmmc;
            if (data.zbjymd) {
                push({ title: '检查意义', content: data.zbjymd, show: true });
            }

            var zcLabel, zcValue;
            if (data.zlx === '定量') {
                if (data.zczxx && data.zczsx) {
                    zcLabel = '正常值范围：';
                    zcValue = data.zczxx + '~' + data.zczsx;
                } else {
                    zcLabel = '正常值' + (data.zczxx ? '下限：' : '') + (data.zczsx ? '上限：' : '');
                    zcValue = (data.zczxx || '') + (data.zczsx || '');
                }
                if (data.dw) {
                    zcValue = zcValue + data.dw;
                }
            } else {
                zcLabel = '正常值：';
                zcValue = data.zcz
            }
            if ($stateParams.fanwei) {
                push({ title: $stateParams.fanweititle, content: $stateParams.fanwei, show: true });
            } else
                if (zcValue) {
                    push({ title: '正常值范围', content: zcValue, show: true });
                }

            //            push({ title: '基本信息', content: ['适用条件：' + (data.sytj || '无'), zcLabel + (zcValue || '无'), '来源：' + (data.ckly || '无')], show: true });
            if (data.slbhjs) {
                push({ title: '生理解释', content: data.slbhjs, show: true });
            }

            var bljs = "";
            if (data.yczjs) {
                bljs += '<div class="padding-bottom"><h4>异常值解释</h4><p class="ptext">' + data.yczjs + '</p></div>\n';
            }
            if (data.blzgjs) {
                bljs += '<div class="padding-bottom""><h4>病理增高解释</h4><p class="ptext">' + data.blzgjs + '</p></div>\n';
            }
            if (data.bljdjs) {
                bljs += '<div><h4>病理降低解释</h4><p class="ptext">' + data.bljdjs + '</p></div>\n';
            }
            if (data.zbjjgys) {
                bljs += '<div><h4>常见致病菌及结果解释（医师）</h4><p class="ptext">' + data.zbjjgys + '</p></div>\n';
            }
            if (data.zbjjghz) {
                bljs += '<div><h4>常见致病菌及结果解释（患者）</h4><p class="ptext">' + data.zbjjghz + '</p></div>';
            }
            if (bljs) {
                push({ title: '病理解释', content: bljs, show: true });
            }
            if (data.jkzd) {
                push({ title: '健康指导', content: data.jkzd, show: true });
            }

            push = null;
        }, Popup.alert);
        self.backshouye = function () {
            var openid = sessionStorage.getItem("openId");
            var token = sessionStorage.getItem("token");
            if (sessionStorage.getItem('hosorgCode')) {
                var yxzsurl = sessionStorage.getItem('yxzsurl');
                var hosorgCode = sessionStorage.getItem('hosorgCode');
                $state.go("yiyuanshouye", { hosorgCode: hosorgCode, openid: openid, token: token, yxzsurl: yxzsurl });
            } else {
                $state.go("shouye", { openid: openid, token: token });
            }
        }
        /**
         * 症状指南详情中药品查询
         */
        $scope.yaopinlist = function (name, leixing) {
            GoZzJbYp.yaopinlist(name, leixing);
        };


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

    //首页
    .controller('ShouYeC', function ($scope, $state, $stateParams, XywyService, UserInfoService, Popup, $window, projectConfig, $http, $ionicViewSwitcher) {
        /*
         * 首页访问历史
         */
        $scope.saveAccessRecord = function () {
            var userAgent = $window.navigator.userAgent;
            var md = new MobileDetect(userAgent);
            var params = {};
            params.openId = $window.sessionStorage.getItem('openId');
            params.userAgent = userAgent;
            params.mobile = md.mobile();
            params.weiXinVersion = md.versionStr('MicroMessenger');
            params.cityCode = $window.returnCitySN.cid;
            params.cityName = $window.returnCitySN.cname;
            XywyService.save("/saveAccessRecord", params).then(function (response) { }, Popup.alert);
        }
        // $scope.saveAccessRecord();


        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;

        }
        sessionStorage.setItem('isIos', $scope.isIos);
        //sessionStorage.clear();     //清空缓存数据
        sessionStorage.setItem('openId', $stateParams.openid);
        sessionStorage.setItem('token', $stateParams.token);
        if ($stateParams.hosorgCode) {
            sessionStorage.setItem('hosorgCode', $stateParams.hosorgCode);
        }
        if ($stateParams.yxzsurl) {
            sessionStorage.setItem('yxzsurl', $stateParams.yxzsurl);
        }

        var upPage = $window.history;
        //console.log(upPage);

        //geoLocation.getCity().then(function(city) {
        //    $scope.yiyuan = city.mc;
        //},function(reason){
        //    $scope.yiyuan = angular.isString(reason)? reason:'';
        //});
        //更新为城市名称
        //$rootScope.$on('userCityUpdate', function(event, city) {
        //    $scope.yiyuan = city.mc;
        //});

        //更新为医院名称
        // $rootScope.$on('userHosUpdate', function(event, userHos) {
        //     $scope.yiyuan = userHos.yymc;
        // });

        function goGn(gn) {
            $state.transitionTo('yuyinjiaohuclick', { gn: gn, zhuci: '' }, { reload: true, notify: true });
        }

        $scope.showXuanYiYuan = projectConfig.yiyuanEdition;

        $scope.zhao = function () {
            $state.go('zysresults');
        }
        $scope.test = function () {
            $state.go('tuijiankeshi');
        }
        $scope.yao = function () {
            //          用于判断交互页面是否从首页进入（用于交互对话框的位置定位的判断） 
            sessionStorage.setItem("isfromshouye", true);
            //Popup.alert("正在开发中,敬请期待！");
            //goGn('WYP');
            // $state.go('yuyinjiaohuclick',{gn:"WYP",zhuci:""});
            // $state.go('yaoPinZhiNan', { jj_yp_keyWord: "" });
            $state.go('ypznMain');
        }
        if (localStorage.getItem("yyzhuangtai")) {
            if (localStorage.getItem("yyzhuangtai") == "打开") {
                $scope.isBanned = true;
            } else {
                $scope.isBanned = false;
            }
        } else {
            $scope.isBanned = true;
            localStorage.setItem("yyzhuangtai", "打开");
        }
        //语音开关
        $scope.banned = function () {
            if ($scope.isBanned == false) {
                $scope.isBanned = true;
                localStorage.setItem("yyzhuangtai", "打开");
            } else {
                $scope.isBanned = false;
                localStorage.setItem("yyzhuangtai", "禁止");
            }
        }

        $scope.baogao = function () {
            //          用于判断交互页面是否从首页进入（用于交互对话框的位置定位的判断） 
            sessionStorage.setItem("isfromshouye", true);
            goGn('WBG');
            // $state.go('yuyinjiaohuclick',{gn:"WBG",zhuci:""});
        }
        $scope.yuyinshouye = function () {
            $state.go('yuyinshouye');
        }
        $scope.zwpg = function () {
            //          用于判断交互页面是否从首页进入（用于交互对话框的位置定位的判断） 
            sessionStorage.setItem("isfromshouye", true);
            goGn('ZWPG');
        }
        //气象健康
        $scope.goweather = function () {
            return
            // $state.go('weathershouye');
        }
        //妇幼健康
        $scope.fuyoujk = function () {
            goGn('FYJK');
        }
        // 问疾病
        $scope.wenjibing = function () {
            //          用于判断交互页面是否从首页进入（用于交互对话框的位置定位的判断） 
            sessionStorage.setItem("isfromshouye", true);
            //Popup.alert("正在开发中,敬请期待！");
            goGn('WJB');
            // $state.go('wenjibinglist');
        }
        $scope.guahao = function () {
            //          用于判断交互页面是否从首页进入（用于交互对话框的位置定位的判断） 
            sessionStorage.setItem("isfromshouye", true);
            //Popup.alert("正在开发中,敬请期待！");
            goGn('ZNDZ');
        }
        //常见症状
        $scope.cjzz = function () {
            //          用于判断交互页面是否从首页进入（用于交互对话框的位置定位的判断） 
            // sessionStorage.setItem("isfromshouye", true);
            //Popup.alert("正在开发中,敬请期待！");
            // goGn('CJZZ');
            $state.go("zhengzhuangzhinan");
        }
        $scope.wenshoushu = function () {
            sessionStorage.setItem("isfromshouye", true);
            // Popup.alert("正在开发中,敬请期待！");
            goGn('WSS');
            // Popup.alert("正在开发中,敬请期待！");
        }
        $scope.zhinengdaozhen = function () {
            /*sessionStorage.setItem("isfromshouye",true);*/
            //$window.location.href = myConfig.zndzurl + '/xywy/index.html#/buwei';
            $ionicViewSwitcher.nextDirection('forward');
            $state.go('keshituijian');
        }

        $scope.zhongyiyangsheng = function () {
            $ionicViewSwitcher.nextDirection('forward');
            //$state.go('zyys');
            $state.go('zyysMain');
        }
        // 健康圈
        $scope.goJkq = function () {
            $state.go("jiankangquan");
        }
        $scope.fengxianpinggu = function () {
            sessionStorage.setItem("isfromshouye", true);
            //$window.location.href = myConfig.zndzurl + '/xywy/index.html#/buwei';

            $ionicViewSwitcher.nextDirection('forward');
            $state.go('fengxianpinggu');
        }
        $scope.wenzhengzhuang = function () {
            //          用于判断交互页面是否从首页进入（用于交互对话框的位置定位的判断） 
            sessionStorage.setItem("isfromshouye", true);
            goGn('WZZ');
        };
        $scope.zhaoyaofang = function () {
            Popup.alert("正在开发中,敬请期待！");
        };
        //按钮点击事件
        $scope.jiankangguanli = function () {
            $state.go('jiankangguanli');
            $scope.popover.hide();
        }


        $scope.zhenhoufuwu = function () {
            if (localStorage.getItem("huanzheidno")) {
                $state.go('zhenhoufwsy');
                $scope.popover.hide();
            } else {
                $state.go('register');
                $scope.popover.hide();
            }

        }
        // 会员中心点击事件
        $scope.huiyuan = function () {
            var userInfo = UserInfoService.getInfo();
            if (userInfo.isGrxxCunZai === "1") {
                $state.go('huiyuan');
            } else {
                // Popup.confirm(['提示', '您还没有填写个人信息，确定现在立即去完善吗？'], function() {
                var wantTo = { name: "huiyuan", para: null };
                $window.sessionStorage.setItem("wantTo", JSON.stringify(wantTo));
                $state.go("dangAnEdit", { self: "1", id: null });
                // }, function() {});
            }
        }
        $scope.goPhysician = function () {
            $ionicViewSwitcher.nextDirection('forward');
            $state.go('Physicianshouye');
        }
        //快速问医点击事件 
        $scope.wenyi = function () {
            $state.go('wenyi');
        }
        //        判断年龄性别并给userinfo赋值
        //      保存性别年龄
        var savesexage = function (sex, age, gn) {
            var param = { userid: $stateParams.openid, sex: sex, age: age, gn: gn };
            var config = {
                params: param
            }
            //          修改userinfo中的性别人群
            $http.get(myConfig.serverUrl + "/saveuserinfoxx", config).then(function (response) { }, Popup.alert);
        }
        $scope.yesclick = function () {
            //          用于保存年龄性别用的数据
            var saveage = "";
            var savesex = "";
            if ($scope.itemsex != "未选择") {
                savesex = $scope.itemsex;
            }
            if ($scope.itemage != "未选择") {
                saveage = $scope.itemage;
            }
            savesexage(savesex, saveage, "");
            localStorage.setItem("sex", $scope.itemsex);
            localStorage.setItem("age", $scope.itemage);
        }
        $scope.itemage = localStorage.getItem("age");
        $scope.itemsex = localStorage.getItem("sex");
        if ($scope.itemage == "null") {
            $scope.itemage = "未选择";
        }
        if ($scope.itemsex == "null") {
            $scope.itemsex = "未选择";
        }
        //       初始化页面时判断年龄性别
        $scope.yesclick();
        $(function () {
            //一段正则，匹配所有_min.的图片src属性
            var test = /.min\./
            //遍历所有的图片节点
            $(".imgstyle").each(function (index, obj) {
                if (test.test($(this).attr("src"))) {
                    var reSrc = $(this).attr("src").replace(test, ".");
                    $(this).attr("src", reSrc)
                }
            })
        });
        /**
         * 交流天地（健康圈）
         */
        $scope.jiankangquan = function () {
            $state.go("jiankangquan");
        }
        //妇幼健康
        $scope.jijiejiankang = function () {
            goGn('JJJK');
        }
    })

    //问疾病结果详情
    .controller('Wenjibingdetail', ['$stateParams', 'Popup', 'QueryEsZhiShi', '$scope', '$window', '$state', 'GoZzJbYp', 'XywyService', function ($stateParams, Popup, QueryEsZhiShi, $scope, $window, $state, GoZzJbYp, XywyService) {
        $scope.isIos = false;
        $scope.inputFocus = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
            $scope.localyyzt = "打开";
        }

        var self = this;
        if ($stateParams.viewTitle) {
            self.viewTitle = $stateParams.viewTitle;
        } else {
            self.viewTitle = '疾病详情';
        }

        QueryEsZhiShi(self).then(function (data) {
            self.haveResult = true;
            self.items = [];
            var push = Array.prototype.push.bind(self.items);
            self.title = data.jbmc;
            if (data.bm) {
                self.subtitle = "别名：" + data.bm;
            }

            var jkzd = data.jkzd;
            if (jkzd) {
                jkzd = data.jkzd.replace(/健康指导：|健康指导:|健康指导/, "");
                jkzd = jkzd.trim();
                jkzd = jkzd.replace(/\ +/g, "");
            }
            if (data.jbms) {
                push({ title: '概述', content: data.jbms, show: true });
            }
            if (data.lcbx) {
                push({ title: '临床表现', content: data.lcbx, show: true });
            }
            if (data.jyzs) {
                push({ title: '辅助检查', content: data.jyzs, show: true });
            }
            if (data.zlyz) {
                push({ title: '治疗方案及原则', content: data.zlyz, show: true });
            }

            //            if(data.ctzs){
            //            	 push({ title: '查体知识', content: data.ctzs, show: true });
            //            }

            if (jkzd) {
                push({ title: '健康指导', content: jkzd, show: true });
            }
            push = null;
        }, function (reason) {
            Popup.alert(reason)
        });
        var openid = sessionStorage.getItem("openId");
        self.backshouye = function () {
            var token = sessionStorage.getItem("token");
            if (sessionStorage.getItem('hosorgCode')) {
                var yxzsurl = sessionStorage.getItem('yxzsurl');
                var hosorgCode = sessionStorage.getItem('hosorgCode');
                $state.go("yiyuanshouye", { hosorgCode: hosorgCode, openid: openid, token: token, yxzsurl: yxzsurl });
            } else {
                $state.go("shouye", { openid: openid, token: token });
            }
        }
        // 语音条
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
        // 语音条_end

        /**
         * 症状指南详情中药品查询
         */
        $scope.yaopinlist = function (name, leixing) {
            GoZzJbYp.yaopinlist(name, leixing);
        };
        $scope.showShouCang = "1";//页面显示收藏按钮
        // 查询膳食是否收藏
        $scope.collectFlag = false;
        XywyService.save("/member/collect/determineCollectFlag.json", { userId: openid, collectDataPid: $stateParams.id, collectType: "JBZS" })
            .then(function (data) {
                $scope.collectFlag = data.data.collectFlag;

            }, function (reason) {
                Popup.alert(reason)
            });
        //添加收藏
        $scope.addShouCang = function () {
            XywyService.save("/member/collect/addCollect.json", { userId: openid, collectDataPid: $stateParams.id, collectType: "JBZS" })
                .then(function (data) {
                    $scope.collectFlag = true;
                    Popup.alert("收藏成功！")
                }, function (reason) {
                    Popup.alert(reason)
                });



        };
        //取消收藏
        $scope.cancelShouCang = function () {
            XywyService.save("/member/collect/cancelCollect.json", { userId: openid, collectDataPid: $stateParams.id, collectType: "JBZS" })
                .then(function (data) {
                    $scope.collectFlag = false;
                    Popup.alert("取消成功！")
                }, function (reason) {
                    Popup.alert(reason)
                });

        };


    }])
    //手术详情
    .controller('shouShuDetail', ['$stateParams', 'Popup', 'QueryEsZhiShi', '$scope', '$window', '$state', 'GoZzJbYp', 'XywyService', function ($stateParams, Popup, QueryEsZhiShi, $scope, $window, $state, GoZzJbYp, XywyService) {
        $scope.isIos = false;
        $scope.inputFocus = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
            $scope.localyyzt = "打开";
        }

        var self = this;
        if ($stateParams.viewTitle) {
            self.viewTitle = $stateParams.viewTitle;
        } else {
            self.viewTitle = '手术详情';
        }

        QueryEsZhiShi(self).then(function (data) {
            self.haveResult = true;
            self.items = [];
            var push = Array.prototype.push.bind(self.items);
            self.title = data.shushi;
            if (data.ssmc) {
                self.subtitle = "别名：" + data.ssmc;
            }

            if (data.gs) {
                push({ title: '概述', content: data.gs, show: true });
            }

            if (data.sqzb) {
                push({ title: '手前准备', content: data.sqzb, show: true });
            }
            if (data.ssbz) {
                push({ title: '手术步骤', content: data.ssbz, show: true });
            }
            if (data.shcl) {
                push({ title: '手后处理', content: data.shcl, show: true });
            }
            if (data.syz) {
                push({ title: '适应症', content: data.syz, show: true });
            }
            push = null;
        }, function (reason) {
            Popup.alert(reason)
        });
        var openid = sessionStorage.getItem("openId");
        self.backshouye = function () {
            var token = sessionStorage.getItem("token");
            if (sessionStorage.getItem('hosorgCode')) {
                var yxzsurl = sessionStorage.getItem('yxzsurl');
                var hosorgCode = sessionStorage.getItem('hosorgCode');
                $state.go("yiyuanshouye", { hosorgCode: hosorgCode, openid: openid, token: token, yxzsurl: yxzsurl });
            } else {
                $state.go("shouye", { openid: openid, token: token });
            }
        }
        // 语音条
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
        // 语音条_end

    }])
    //妇幼健康结果详情
    .controller('FuYougdetail', ['$stateParams', 'Popup', 'QueryEsZhiShi', '$scope', '$window', '$state', 'GoZzJbYp', function ($stateParams, Popup, QueryEsZhiShi, $scope, $window, $state, GoZzJbYp) {
        $scope.isIos = false;
        $scope.inputFocus = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
            $scope.localyyzt = "打开";
        }

        var self = this;
        if ($stateParams.viewTitle) {
            self.viewTitle = $stateParams.viewTitle;
        } else {
            self.viewTitle = '妇幼健康详情';
        }

        QueryEsZhiShi(self).then(function (data) {
            self.haveResult = true;
            self.items = [];
            var push = Array.prototype.push.bind(self.items);
            self.title = data.xmmc;

            if (data.xmgs) {
                push({ title: '概述', content: data.xmgs, show: true });
            }
            if (data.by) {
                push({ title: '病因', content: data.by, show: true });
            }
            if (data.lcbx) {
                push({ title: '临床表现', content: data.lcbx, show: true });
            }
            if (data.xmzl) {
                push({ title: '治疗意见', content: data.xmzl, show: true });
            }
            if (data.xmff) {
                push({ title: '方法', content: data.xmff, show: true });
            }
            if (data.yqd) {
                push({ title: '优缺点', content: data.yqd, show: true });
            }
            if (data.syz) {
                push({ title: '适应证', content: data.syz, show: true });
            }
            if (data.jjz) {
                push({ title: '禁忌证', content: data.jjz, show: true });
            }
            if (data.bfz) {
                push({ title: '并发症', content: data.bfz, show: true });
            }
            if (data.zysx) {
                push({ title: '注意事项', content: data.zysx, show: true });
            }
            if (data.jkzd) {
                push({ title: '健康指导', content: data.jkzd.trim(), show: true });
            }

            //            if(data.ctzs){
            //            	 push({ title: '查体知识', content: data.ctzs, show: true });
            //            }


            push = null;
        }, function (reason) {
            Popup.alert(reason)
        });
        self.backshouye = function () {
            var openid = sessionStorage.getItem("openId");
            var token = sessionStorage.getItem("token");
            if (sessionStorage.getItem('hosorgCode')) {
                var yxzsurl = sessionStorage.getItem('yxzsurl');
                var hosorgCode = sessionStorage.getItem('hosorgCode');
                $state.go("yiyuanshouye", { hosorgCode: hosorgCode, openid: openid, token: token, yxzsurl: yxzsurl });
            } else {
                $state.go("shouye", { openid: openid, token: token });
            }
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

        /**
         * 症状指南详情中药品查询
         */
        $scope.yaopinlist = function (name, leixing) {
            GoZzJbYp.yaopinlist(name, leixing);
        }
    }])
    .controller('ZyysC', ['$ionicViewSwitcher', '$scope', '$rootScope', '$stateParams', '$state', 'CitiesAndLevel', '$log', 'geoLocation', 'locHistory', 'Popup', '$http', '$window', 'wxApi', '$q', 'XywyService', function ($ionicViewSwitcher, $scope, $rootScope, $stateParams, $state, CitiesAndLevel, $log, geoLocation, locHistory, Popup, $http, $window, wxApi, $q, XywyService) {
        'use strict';

        $scope.back = function () {
            var openid = sessionStorage.getItem("openId");
            $ionicViewSwitcher.nextDirection('back');
            var token = sessionStorage.getItem("token");
            $state.go("shouye", { openid: openid, token: token });
        }

        //IOS隐藏最上方标题栏
        $scope.isIos = false;
        $scope.inputFocus = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
            $scope.localyyzt = "打开";
        }
        //IOS隐藏最上方标题栏 结束
        $scope.clicked = 1;

        $scope.show = function (num) {
            if (num == 1) {
                $scope.clicked = 2;
            }
            if (num == 2) {
                $scope.clicked = 1;
            }
        }

        $scope.goDetail = function () {
            $state.go('zyysDetail');
        }

        $scope.open_win = function (url) {
            $window.open(url);
        }
        /*if($scope.isIos) {
            var screenHeight = $window.screen.height;
        } else {
            var screenHeight = $window.screen.height - 43;
        }
        $scope.halfScreen = ((screenHeight*100/2)/($window.screen.height)).toFixed(1) + "%";*/

        var sanliaoData = "定位于“治未病”，以“让天下人少生病”为使命，以中西医专家为主导，以健康管理师为纽带，运用中医养生文化及思想，创新研发以“情绪疏导”、“排毒净化”、“能量提升”为核心的三疗康养体系，" +
            "帮助人们恢复机体的平衡、净化与健康。三疗秉承中医整体观、辨证论治的思想，依托传统中医内、外治法，结合量子医学等国内尖端技术；引导人们建立正确的生活方式，调整心神情绪，以达到防病、康复、延年益寿之功效。"

        $scope.sanliao = sanliaoData;

        var qixiuData = "何谓七修，祖述羲黄，顺承汉唐，代代相传，念念不忘者，七修事也！其德功食书香乐花者，乃修心养性、安身立命之大裨益事也。生之根本，在阴阳二气。聚气、调气、行气、运气，七修之事不可须臾离也！"

        $scope.qixiu = qixiuData;

        $scope.goSanliao = function () {
            $state.go("sanliaojk");
        }

    }])

    .controller('SanliaojkC', ['$ionicViewSwitcher', '$scope', '$rootScope', '$stateParams', '$state', 'CitiesAndLevel', '$log', 'geoLocation', 'locHistory', 'Popup', '$http', '$window', 'wxApi', '$q', function ($ionicViewSwitcher, $scope, $rootScope, $stateParams, $state, CitiesAndLevel, $log, geoLocation, locHistory, Popup, $http, $window, wxApi, $q) {
        'use strict';

        $scope.back = function () {
            var openid = sessionStorage.getItem("openId");
            $ionicViewSwitcher.nextDirection('back');
            var token = sessionStorage.getItem("token");
            $state.go("shouye", { openid: openid, token: token });
        }

        //IOS隐藏最上方标题栏
        $scope.isIos = false;
        $scope.inputFocus = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
            $scope.localyyzt = "打开";
        }
        //IOS隐藏最上方标题栏 结束

    }])

    //症状指南
    .controller('zhengzhuangzhinanC', ['$ionicViewSwitcher', '$scope', '$rootScope', '$stateParams', '$state', 'CitiesAndLevel', '$log', 'geoLocation', 'locHistory', 'Popup', '$http', '$window', 'wxApi', '$q', 'XywyService',
        function ($ionicViewSwitcher, $scope, $rootScope, $stateParams, $state, CitiesAndLevel, $log, geoLocation, locHistory, Popup, $http, $window, wxApi, $q, XywyService) {


            // XywyService.getRem(750);

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
                sessionStorage.removeItem('jtyyzz');
                var openid = sessionStorage.getItem("openId");
                $ionicViewSwitcher.nextDirection('back');
                var token = sessionStorage.getItem("token");
                if (sessionStorage.getItem('hosorgCode')) {
                    var yxzsurl = sessionStorage.getItem('yxzsurl');
                    var hosorgCode = sessionStorage.getItem('hosorgCode');
                    $state.go("yiyuanshouye", { hosorgCode: hosorgCode, openid: openid, token: token, yxzsurl: yxzsurl });
                } else { $state.go("shouye", { openid: openid, token: token }); }
            }

            $scope.goDetail = function (id) {
                $scope.currentChoose = id;
                $state.go('changjianzzdetail', { id: id });
            }
            $scope.pageNum = 1;
            $scope.currentChoose;
            $scope.data = {
                keyword: ""
            };

            function MianQuery() {
                $scope.currentChoose = "";
                var param = {
                    params: {
                        pageNum: $scope.pageNum
                    }
                }
                $scope.zzList;
                XywyService.query("/queryCjzz", param).then(function (response) {
                    $scope.zzList = response.data
                });
            }
            MianQuery();

            //输入框点击查询
            $scope.searchZzName = function () {
                $scope.currentChoose = "";
                var param = {
                    params: {
                        pageNum: $scope.pageNum,
                        gjc: $scope.data.keyword
                    }
                }

                XywyService.query("/queryCjzz", param).then(function (response) {
                    $scope.zzList = response.data
                });
            }

            //删除输入框内容
            $scope.clean = function () {
                $scope.data.keyword = "";
                MianQuery();
            }

        }
    ])

    //授权登录
    .controller('ShouQuanDengluC', function (wxApi, $scope, $http, $state, $stateParams, $timeout, XywyService, Popup, Outlet, $ionicScrollDelegate, audioControl, $window, $rootScope, geoLocation, $ionicLoading) {

        sessionStorage.setItem('openId', $stateParams.openid);
        var c = 750; // 基准宽度,取的是iphone6
        var b = document.getElementsByTagName('html')[0];
        var f = b.getBoundingClientRect().width / c;
        b.style.fontSize = f + 'rem';
        $scope.openid = $stateParams.openid;
        var token = sessionStorage.getItem("token");
        //判断手机类型
        $scope.isIos = false;
        if (!!$window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            $scope.isIos = true;
        }
        $scope.action = myConfig.serverUrl + "/shouQuanMaYz"
        //  返回按钮
        $scope.goBack = function () {
            $window.history.back();
        }

        var windheight = $(window).height(); //未唤起键盘时当前窗口高度

        $(window).resize(function () {

            var docheight = $(window).height(); //唤起键盘时当前窗口高度
            if (docheight < windheight) { //当唤起键盘高度小于未唤起键盘高度时执行   		  
                $("#sqdl-imgstyle").css("position", "static");
            } else {
                $("#sqdl-imgstyle").css("position", "fixed");
            }
        });
        /* window.onload=function(){
               if($stateParams.isshouquan == 'false'){
                     $ionicLoading.hide();
                  Popup.alert('授权失败，请输入正确的授权码或联系管理员');
             	
             }
         }*/

        $scope.submit = function () {
            $scope.inputCode = document.getElementById('sqdl-code').value;
            if ($scope.inputCode.length == 0) {
                $ionicLoading.hide();
                Popup.alert('授权码不能为空！');
                return false;
            }
            if ($scope.inputCode.length < 8 || $scope.inputCode.length > 8) {
                $ionicLoading.hide();
                Popup.alert('授权码无效！');
                return false;
            }
            var param = {};
            param.shouquanma = $scope.inputCode;
            param.openid = $scope.openid;
            XywyService.query('/shouQuanMaYz', { params: param })
                .then(function (res) {
                    if (res.data == "9999") {
                        $state.go("shouye", { openid: $scope.openid, token: token });
                    } else {
                        $ionicLoading.show({
                            template: '授权码无效！',
                        });
                        $timeout(function () {
                            $ionicLoading.hide(); //由于某种原因2秒后关闭弹出
                        }, 2000);
                    }
                }, Popup.alert);
        }

    })