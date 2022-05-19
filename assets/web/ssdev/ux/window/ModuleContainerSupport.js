$class("ssdev.ux.window.ModuleContainerSupport",{
    deps: ["ssdev.ux.beehive.beehive"],
    setModule:function(mod, m){
        const me = this,containerEl = me.containerEl;
        let modCls,modConf,modLoader,modInit,defer;
        if($is.Function(mod.appendTo)){
            if($is.Function(me.onModuleLoaded)){
                me.onModuleLoaded(m);
            }
            me.bind(m);
            mod.appendTo(containerEl);
            me.module = mod;
            defer = $Defer();
            defer.resolve(mod);
            return defer.promise;
        }
        else {
            if($is.String(mod)){
                modCls = mod;
            }
            else if($is.Object(mod)){
                modCls = mod.cls || mod.url;
                modLoader = mod.loader;
                modInit = mod.init;
                modConf = mod.conf || mod;
            }

            beehive.start({
                triggerMode: "event",
                cssShadowBox: false,
                singular: false
            })

            if(mod.format === "extra") {
                const wrap = document.createElement("div");
                wrap.id = m.id;
                containerEl.appendChild(wrap);


                return beehive.loadMircoModule({
                    name: mod.subName,
                    activeRule: m.id,
                    container: "#"+wrap.id,
                    entry: mod.cls,
                    props: {
                        rootEl:  mod.cls.endsWith('.js') ? "#"+wrap.id : null,
                        libs: {
                            Vue,
                            Element
                        }
                    }
                })
            }else {

                const isFrameLoader = (modLoader && modLoader  != $env.loader) || (modInit && modInit != $env.init);
                if(isFrameLoader) {
                    // const me = this,
                    //     defer = $Defer(),
                    //     modConf = mod.conf || mod,
                    //     cls = mod.cls || mod.url,
                    //     init = mod.init,
                    //     index = $env.index || "index.html";

                    // let url = index + '?clz=' + cls + "&loader=" + mod.loader + "&mode=frame";
                    // me.conf.autoShow = false;
                    // if(init){
                    //     url += "&init=" + init;
                    // }
                    // url += "&modConf=" + btoa(encodeURIComponent($encode(modConf)));
                    // console.log(url)

                    // let presets = {
                    //     clz: cls,
                    //     loader: mod.loader,
                    //     mode: "frame",
                    //     init,
                    //     modConf
                    // }
                    // const wrap = document.createElement("div");
                    // wrap.id = m.id;
                    // containerEl.appendChild(wrap);
                    // return beehive.loadMircoModule({
                    //     name: mod.subName,
                    //     activeRule: m.id,
                    //     container: "#"+wrap.id,
                    //     entry: url,
                    //     presets
                    // })

                    return me.setModuleInFrame(mod);
                }
                else{
                    beehive.pause()

                    return $create(modCls,modConf).then(function (m) {
                        console.log("create");
                        me.bind(m);
                        if($is.Function(me.onModuleLoaded)){
                            me.onModuleLoaded(m);
                        }
                        m.appendTo(containerEl);
                        return m;
                    }).catch(err => {
                        console.err(err);
                    });
                }
            }

        }
    },
    setModuleInFrame:function (mod) {
        const me = this,
            defer = $Defer(),
            modConf = mod.conf || mod,
            cls = mod.cls || mod.url,
            init = mod.init,
            index = $env.index || "index.html";

        let url = index + '?clz=' + cls + "&loader=" + mod.loader + "&mode=frame";
        me.conf.autoShow = false;
        if(init){
            url += "&init=" + init;
        }
        url += "&modConf=" + btoa(encodeURIComponent($encode(modConf)));

        const iframe = document.createElement("iframe");
        iframe.id = "mod-Ifm-" + me.id;
        iframe.src = url;
        iframe.classList.add("mod-iframe");

        const onIframeLoaded = function () {
            const cw = iframe.contentWindow,ev = cw.$event;

            if(!$env.isNW && !$env.isElectron){
                let ctx = $env.globalContext.getContext();
                cw.$env.globalContext.putAll(ctx);
            }

            if(ev){
                cw.addEventListener("click",function () {
                    me.el.dispatchEvent(new MouseEvent('click'));
                });
                ev.on("moduleLoaded",function (m) {
                    me.bind(m);
                    if($is.Function(me.onModuleLoaded)){
                        me.onModuleLoaded(m);
                    }
                    defer.resolve(m);
                    me.conf.show = true;
                });
                ev.on("moduleLoadError",function (e) {
                    defer.reject(e);
                });
            }
            else{
                defer.reject(new Error("mod-iframe[" + url + "] load failed."))
            }
            iframe.removeEventListener("load",onIframeLoaded);
        };
        iframe.addEventListener("load",onIframeLoaded);
        me.popIframe = iframe;
        me.containerEl.appendChild(iframe);
        return defer.promise;
    },
    bind:function(m){
        const me = this,winConf = m.winConf,win = me.win;
        if(winConf){
            $apply(me.conf,winConf);
        }

        if(!me.conf.title){
            me.conf.title = me.title;
        }
        me.module = m;
    },
    isAutoShow:function(){
        const me = this,m = me.module,winConf = m.winConf;
        if(me.moduleReady === true || !winConf){
            return true;
        }
        return !(winConf.autoShow === false);
    },
    onModuleLoaded:function (m) {
        const me = this, autoShow = me.isAutoShow();
        if(autoShow){
            me.conf.show = true;
        }
        else{
            m.on("ready",function(){
                me.moduleReady = true;
                if(!autoShow){
                    me.conf.show = true;
                }
            });
        }
    },
    getModule: function () {
        var me = this;
        return me.module;
    },
    destroy:function(){
        var me = this,m = me.module;
        var ifm = me.popIframe;
        if(ifm){
            if(ifm.contentWindow){
                ifm.contentWindow.document.write('');
                ifm.contentWindow.close();
            }
            ifm.parentNode.removeChild(ifm);
            delete me.popIframe;
        }
        else{
            if(m && $is.Function(m.destroy)){
                m.destroy();
            }
        }
    }
});