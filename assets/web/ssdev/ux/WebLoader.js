$class("ssdev.ux.WebLoader",{
    extend:"/ssdev.ux.LoaderBase",
    init:function (env) {
        var me = this;
        if(env){
            me.onEnvConfLoaded(env);
        }
        else{
            $loadJson(me.id + ".env").then(function (env) {
                me.onEnvConfLoaded(env);
            })
        }
    },
    setEnvExtras:function () {
        var me = this;
        $env.cwd = me.id + "/";
    },
    loadModule:function (modCls) {
        var me = this;
        return $create(modCls,me.modConf).then(function (m) {
            m.appendTo(document.body);
            return m;
        });
    }
});