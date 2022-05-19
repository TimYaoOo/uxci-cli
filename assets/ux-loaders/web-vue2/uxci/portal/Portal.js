$class("uxci.portal.Portal",{
    extend:"/ssdev.ux.vue.VueContainer",
    mixins:"/ssdev.ux.portal.PortalBase",
    deps:[
        "/ssdev.ux.vue.window.Popover",
        ".ssdev.ux.window.WindowStub"
    ],
    css:".uxci.portal.css.portal",
    tpl:".",
    initComponent:function (conf) {
        const me = this;
        const evtHandlers = {
            onModIconClick:function (mod) {
                const vm = this;
                if(!mod.hasOwnProperty("active")){
                    vm.$set(mod,"active",false);
                    vm.$set(mod,"loading",true);
                }
                else{
                    mod.loading = true;
                }
                me.openModule(mod);
            },
            onAppChange:function (id) {
                me.data.currentApp = id
            }
        };
        me.evtHandlers = evtHandlers;
        me.data = {
            show:false,
            showTabs:true,
            currentApp:"",
            apps: [],
            portalReady:false,
            urt:{
                avatar:""
            }
        };
        me.callParent(arguments);
    },
    afterVueConfInited:function (conf) {
        const  me = this;

        conf.computed = {
            appMods : function () {
                const  vm = this;
                if(vm.currentApp == ""){
                    return [];
                }
                let app = this.apps.find(function (a) {
                    return a.id == vm.currentApp
                });
                return app.items;
            }
        }
    },
    afterAppend:function () {
        const me = this;
        $widgets.get("mask").then(function (mask) {
            mask.remain();
            me.mask = mask;
            me.showLogin();
        })
    },
    showLogin:function () {
        const me = this,el = me.el,stub = me.midiMods["$login"];
        if(!stub){
            $widgets.create("winStub",{
                cls:".uxci.login.Login",
                width:550,
                height:420,
                icon:"fa fa-key"
            }).then(function (stub) {
                stub.on("moduleLoaded",function (m) {
                    m.on("appsDefineLoaded",function (urt,apps) {
                        me.urt = urt;
                        me.apps = apps;
                        if(me.mask){
                            me.mask.release();
                        }
                        stub.win.hide();
                        me.data.portalReady = true;
                        me.afterLogin({
                            urt: urt,
                            apps:apps
                        });
                    });
                    m.on("relogin",function () {
                        stub.win.hide();
                    });
                    me.fireEvent("ready");
                    m.on("login",function () {
                        me.showInPopover(me.data.nav[0]);

                    })
                });
                me.midiMods["$login"] = stub;
                stub.show();
            });
        }
        else{
            me.data.show = false;
            stub.show();
        }
    },
    afterLogin:function (data) {
        const me = this;
        me.data.show = true;
        me.data.apps = data.apps;
        me.data.urt = data.urt;

        me.data.urt.avatar = "resources/images/avatars/1.jpg";
        if(data.apps.length){
            me.data.currentApp = data.apps[0].id;
        }

    },
    afterInitComponent:function () {
        const me = this,el = me.el;
        me.containerEl = el.querySelector(".main-container");
    },
    createPopover:function (conf) {
        return new ssdev.ux.vue.window.Popover(conf);
    },
    createWinStub:function (conf) {
        return new ssdev.ux.window.WindowStub(conf);
    }
});