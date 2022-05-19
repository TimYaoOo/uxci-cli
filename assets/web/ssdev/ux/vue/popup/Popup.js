$class("ssdev.ux.vue.popup.Popup",function(){

    var BUTTONS = {
        YES:{id:"yes",text:"确认",icon:"zmdi zmdi-check"},
        NO:{id:"no",text:"取消",icon:"zmdi zmdi-close"}
    };

    var DEFAULT = {
        progress:{
            view:'popup-progress',
            title:"",
            data:{
                text:"",
                value:0
            },
            buttons:[]
        },
        loading:{
            view:'popup-loading',
            title:"",
            data:{
                text:"",
            },
            buttons:[]
        },
        alert:{
            view:"popup-text",
            data:{
                icon:"fa fa-exclamation-circle c-red",
                text:""
            },
            buttons:[BUTTONS.YES]
        },
        info:{
            view:"popup-text",
            data: {
                icon:"fa fa-info-circle c-blue",
                text:""
            },
            buttons:[BUTTONS.YES]
        },
        confirm:{
            view:"popup-text",
            data: {
                icon:"fa fa-question-circle c-blue",
                text:""
            },
            buttons:[BUTTONS.YES,BUTTONS.NO]
        }
    };

    return {
        extend:"/ssdev.ux.vue.VueContainer",
        deps:[
            "/ssdev.ux.vue.mask.Mask",
            "/ssdev.ux.vue.popup.Loading",
            "/ssdev.ux.vue.popup.Progress",
            "/ssdev.ux.vue.popup.Text"
        ],
        css:"/ssdev.ux.vue.popup.css.popup",
        tpl:"/",
        alias:"popup",
        conf:{
            show:false,
            title:"",
            view:'popup-loading',
            data:{},
            buttons:[]
        },
        initComponent:function (conf) {
            var me = this;
            me.evtHandlers = {
                onBtnClick:function (e) {
                    var t = e.target.closest(".btn");
                    if(me.defer){
                        me.defer.resolve(t.id);
                        me.defer = null;
                    }
                    me.close();
                },
                onAnimateEnter:function () {

                },
                onAnimateLeft:function () {
                    me.detach();
                }
            };
            me.callParent(arguments);
        },
        afterVueConfInited:function (vueConf) {
            var me = this, data = me.conf;
            vueConf.components = {
                popupProgress:ssdev.ux.vue.popup.Progress,
                popupLoading:ssdev.ux.vue.popup.Loading,
                popupText:ssdev.ux.vue.popup.Text
            }
        },
        show:function (conf) {
            var me = this;
            if(me.conf.show){
                return;
            }
            if(conf){
                $apply(me.conf,conf);
            }
            $widgets.get("mask").then(function (msk) {
                msk.remain();
            });
            me.appendTo(me.conf.renderTo || document.body);
            me.conf.show = true;
        },
        alert:function (conf) {
            var me = this, newConf = $apply({}, DEFAULT.alert),defer = $Defer();
            if($is.String(conf)){
                newConf.data.text = conf;
            }
            else{
                $apply(newConf.data,conf);
                newConf.title = conf.title;
            }
            $apply(me.conf,newConf);
            me.defer = defer;
            me.show();
            return defer.promise;
        },
        info:function (conf) {
            var me = this, newConf = $apply({}, DEFAULT.info),defer = $Defer();
            if($is.String(conf)){
                newConf.data.text = conf;
            }
            else{
                $apply(newConf.data,conf);
                newConf.title = conf.title;
            }
            $apply(me.conf,newConf);
            me.defer = defer;
            me.show();
            return defer.promise;
        },
        confirm:function (conf) {
            var me = this, newConf = $apply({}, DEFAULT.confirm),defer = $Defer();
            if($is.String(conf)){
                newConf.data.text = conf;
            }
            else{
                $apply(newConf.data,conf);
                newConf.title = conf.title;
            }
            $apply(me.conf,newConf);
            me.defer = defer;
            me.show();
            return defer.promise;
        },
        progress:function (conf) {
            var me = this, newConf = $apply({}, DEFAULT.progress);
            $apply(newConf.data,conf);
            if(conf.cancelable){
                newConf.buttons = [BUTTONS.NO];
                me.defer = $Defer();
                return me.defer.promise;
            }
            $apply(me.conf,newConf);
            me.show();
        },
        loading:function(conf){
            var me = this, newConf = $apply({}, DEFAULT.loading);
            $apply(newConf.data,conf);
            $apply(me.conf,newConf);
            me.show();
        },
        close:function () {
            var me = this;
            me.conf.show = false;
            $widgets.get("mask").then(function (msk) {
                msk.release();
            });
        }
    }
});