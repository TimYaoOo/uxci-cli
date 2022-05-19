$class("ssdev.ux.LoaderBase",{
    mixins:"/ssdev.utils.Observable",
    constructor:function () {
        const me = this;
        var modConf;

        me.id = $env.urlParams["loader"] || $env.defaultLoader || "web-vue2";
        me.bootCls = $env.urlParams["clz"];
        var init = parseInt($env.urlParams["init"]);
        var modConfStr = $env.urlParams["modConf"];

        if(isNaN(init)){
            init = 0;
        }
        me.initIndex = init;
        if(modConfStr){
            try{
                modConf = $decode(decodeURIComponent(atob(modConfStr)));
                me.modConf = modConf;
            }
            catch (e){
                $event.emit("moduleLoadError",e);
                return;
            }
        }
        $env.loader = me.id;
        $env.init = me.initIndex;
    },
    setEnvExtras:function (json) {

    },
    setupEnv:function(json){
        let me = this, env = json.env, p;
        $apply($env,env);
        me.setEnvExtras(json);

        let init = $is.Array(json.init) ? json.init[me.initIndex] : json.init;
        let css = init.css,js = init.js;
        let names = json.names;

        let lds = [];
        let resolveCss = function (css) {
            if($is.Array(css)){
                for(let i = 0,n = css.length; i < n; i ++){
                    css[i] = resolveCss(css[i]);
                }
            }
            else if($is.Object(css)){
                resolveCss(css.css);
                return css;
            }
            else if($is.String(css)){
                if(names && names.hasOwnProperty(css)){
                    return names[css];
                }
                else{
                    return css;
                }
            }
            else{
                throw new Error("css name invalid.");
            }
        };

        if(css){
            resolveCss(css);
            p = $styleSheet(css);
        }

        if(js) {
            if (names) {
                if ($is.Array(js)) {
                    for (let i = 0, n = js.length; i < n; i++) {
                        let nm = js[i];
                        if (names.hasOwnProperty(nm)) {
                            js[i] = names[nm];
                        }
                    }
                }
                else {
                    if (names.hasOwnProperty(js)) {
                        js = names[js];
                    }
                }
            }
            p = p.then(function () {
                return $require(js, true);
            }).then(function () {
                if (init.script) {
                    (new Function(init.script))();
                }
            });
        }

        if(!p){
            let defer = $Defer();
            defer.resolve();
            return defer.promise;
        }

        return p;
    },
    onEnvConfLoaded:function (json) {
        const me = this,env = json.env,init = $is.Array(json.init) ? json.init[me.initIndex] : json.init;

        me.setupEnv(json).then(function () {
            var modCls = me.bootCls || init.defaultBootCls;
            if(modCls){
                return me.loadModule(modCls);
            }
            else{
                throw new Error("module js class not defined.");
            }
        }).then(function (m){
            me.fireEvent("moduleLoaded", m);
        }).fail(function (e) {
            me.fireEvent("moduleLoadError",e);
        })

    },
    loadModule:function (modCls) {

    }
});