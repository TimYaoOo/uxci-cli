$class("ssdev.ux.portal.PortalBase",{
    popwins:{},
    popovers:{},
    midiMods:{},
    openModule:function (m) {
        const me = this;
        if(!m.url){
            return;
        }
        var target = (m.properties && m.properties.target);

        switch(target){
            case "popover":
                me.showInPopover(m);
                break;

            case 'window':
            default:
                me.showInWindow(m);
        }

    },
    closeModule:function (m) {
        const me = this,mid = m.id,mod = me.popovers[mid] || me.popwins[mid];
        if(mod){
            mod.close();
        }
    },
    setModConf:function (mod,conf) {
        if($is.Function(mod.setModConf)){
            mod.setModConf(conf);
        }
    },
    showInWindow:function(m){
        const me = this,mid = m.id;
        var win = me.popwins[mid];
        if(!win){
            const url = m.url;
            const props = m.properties;

            if(url){
                let winConf = {
                    icon:m.icon,
                    title:m.name,
                    cls:url,
                    loader:props.loader,
                    loaderVer:props.loaderVer,
                    init:props.init,
                    modConf:m
                };

                if(props.fullscreen){
                    winConf.fullscreen = true;
                }
                else {
                    winConf.width = parseInt(props.width);
                    winConf.height = parseInt(props.height);
                }

                win = me.createWinStub(winConf);
                win.on("close",function(){
                    me.onModuleDeactive(m);
                    delete me.popwins[mid];
                });
                win.on("moduleLoaded",function (mod) {
                    m.loading = false;
                    me.setModConf(mod,m);
                });
                me.popwins[mid] = win;
                win.show();
            }
        }
        else{
            if(win.module){
                m.loading = false;
            }
            win.show();
        }
        me.onModuleActive(m);
    },
    showInPopover:function (m) {
        var me = this,el = me.containerEl || document.body,mid = m.id;

        var popover = me.popovers[mid];
        if(!popover){
            var url = m.url;
            if(url){
                var loader = m.properties && m.properties.loader;
                popover = me.createPopover({
                    historyEnable:$env['pop.historyEnable'],
                    title: m.name,
                    mid:mid,
                    headerIcon: m.icon,
                    renderTo:el
                });

                var modConf = {
                    cls:url
                };
                if(m.properties){
                    $apply(modConf,m.properties);
                }

                popover.setModule(modConf, m).then(function (mod) {
                    m.loading = false;
                    me.onModuleActive(m);
                    if(mod) {
                        me.setModConf(mod,m);
                    }
                }).fail(function (e) {
                    m.loading = false;
                    console.error(e);
                });

                popover.on("close",function () {
                    me.onModuleDeactive(m);
                    delete me.popovers[mid];
                });

                popover.show();
                me.popovers[mid] = popover;
            }
        }
        else {
            m.loading = false;
            popover.show();
            me.onModuleActive(m);
        }
    },
    createWinStub:function (conf) {

    },
    createPopover:function (conf) {

    },
    onModuleActive:function (m) {
        m.active = true;
    },
    onModuleDeactive:function (m) {
        m.active = false;
    },
    destroy:function() {
        var me = this, popwins = me.popwins, popovers = me.popovers;
        var id;
        for (id in popwins) {
            var win = popwins[id];
            win.destroy();
        }
        for (id in popovers) {
            var pop = popovers[id];
            pop.destroy();
        }
    }
});