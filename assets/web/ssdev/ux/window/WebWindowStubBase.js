$class("ssdev.ux.window.WebWindowStubBase",{
    mixins:"/ssdev.utils.Observable",
    constructor:function(conf){
        var me = this;
        me.bootCls = conf.cls;
        me.winConf = {
            "resizable":true,
            "fullscreen" : false,
            "position": "center",
            "alwaysOnTop":false,
            "width":600,
            "height":400,
            "show":false
        };
        var c = conf;
        if(c){
            let winConf = me.winConf;
            if(c.loader){
                me.loader = c.loader;
            }
            me.loaderVer = c.loadVer;
            me.modConf = c.modConf;
            me.init = c.init;

            if(c.width){
                winConf.width = c.width;
            }
            if(c.height){
                winConf.height = c.height;
            }
            if(c.icon){
                winConf.icon = c.icon;
            }
            if(c.fullscreen === true){
                winConf.fullscreen = true;
            }
            if(c.title){
                winConf.title = c.title;
            }
        }
    },
    createWin:function () {
        const me = this,winConf = me.winConf,loader = me.loader || $env.loader,cls=me.bootCls,modConf = me.modConf,init = me.init;
        const defer = $Defer();
        const wm = window.top ? window.top.$widgets : $widgets;

        wm.create("mdi",winConf).then(function (win) {
            win.setModule({
                loader:loader,
                cls:cls,
                init:init,
                conf:modConf
            }).then(function (m) {
                me.module = m;
                me.fireEvent("moduleLoaded",m);
            }).fail(function (e) {
                me.fireEvent("moduleLoadError",e);
            });
            win.on("hide",function () {
                me.fireEvent("hide");
            });
            win.on("close",function () {
                me.fireEvent("close");
                me.win = null;
                me.module = null;
            });
            defer.resolve(win);
        }).fail(function (e) {
            defer.reject(e);
            console.error(e);
        });

        return defer.promise;
    },
    show:function(){
        var me = this,win = me.win;
        if(!win){
            me.createWin().then(function (win) {
                me.win = win;
                win.show();
            });
        }
        else{
            win.show();
        }
    }
});