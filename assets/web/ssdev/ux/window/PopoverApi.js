$class("ssdev.ux.window.PopoverApi",function () {
    var historyPopovers = [0];
    var popovers = {};
    var popId = 0;
    var activePop;

    window.addEventListener("popstate",function(ev){
        var state = ev.state;
        if(!state){
            return;
        }
        var id = state.id;
        var pop,popid,find,i,n = historyPopovers.length;

        var needCloses = 0;
        for(i = 0;i < n; i ++){
            popid = historyPopovers[i];
            if(find){
                needCloses ++;
            }
            else{
                if(popid == id){
                    find = true;
                }
            }
        }

        if(needCloses > 0){
            var noAn = false;
            while(needCloses > 0){
                popid = historyPopovers.pop();
                pop = popovers[popid];
                if(pop){
                    if(pop.conf.closeAction == "hide"){
                        pop.hide(noAn);
                    }
                    else{
                        pop.close(noAn);
                    }
                }
                noAn = true;
                needCloses --;
            }
            changeWinTitle(state.title);
        }
        else{
            pop = popovers[id];
            if(pop){
                pop.show();
            }
            else{
                if(id == 0){
                    changeWinTitle(state.title);
                }
                else{
                    window.history.back();
                }
            }
        }
    });

    var rootState = {
        title : document.title,
        id : 0
    };
    window.history.replaceState(rootState,rootState.title);
    $env.historyPopovers = historyPopovers;
    $env.popovers = popovers;

    var changeWinTitle = function(t){
        var ifm,env = $env;
        document.title = t;
        if(env.isWeixin && env.platform.name == 'iOS' && env.weixinVersion < 6.53){
            var onLoad = function () {
                $nextTick(function() {
                    ifm.removeEventListener("load",onLoad);
                    ifm.parentNode.removeChild(ifm);
                })
            };
            ifm = document.createElement("iframe");
            ifm.style.visibility = 'hidden';
            ifm.style.width = '1px';
            ifm.style.height = '1px';
            ifm.src = "/favicon.ico";
            ifm.addEventListener("load",onLoad);
            document.body.appendChild(ifm);
        }
    };

    return {
        mixins:"/ssdev.ux.window.ModuleContainerSupport",
        conf:{
            historyEnable:true,
            closeAction:"hide",
            title:"",
            noHeader:false,
            noClose:false,
            headerIcon:"fa fa-connectdevelop",
            disableEnterAnimate:false,
            disableLeaveAnimate:false,
            slideAnimate:"slide-right",
            active:false,
            autoShow:true,
            show:false,
            exCls:""
        },
        constructor:function (conf) {
            var me = this;
            me.id = ++popId;
            me.mid = conf.mid;
            popovers[me.id] = me;
        },
        setupEvents:function () {
            var me = this;
            var evtHandlers = {
                toolClick:function (e) {
                    var cmd = e.target.closest("a").getAttribute("data-act");
                    switch (cmd){
                        case 'quit':
                            if(me.conf.closeAction == "hide")
                                me.hide();
                            else
                                me.close();
                            break
                    }
                },
                onAnimateEnter:function () {
                    me.fireEvent("show",me);
                },
                onAnimateLeft:function () {
                    me.detach();
                    if(me.inDestroyProcess){
                        me.destroy();
                    }
                }
            };
            me.evtHandlers = evtHandlers;
        },
        afterAppend: function (parent) {
            var me = this,el = me.el;
            var title = me.conf.title;
            if(me.conf.historyEnable){
                var his = window.history;
                if(his.state.id != me.id){
                    his.pushState({
                        id:me.id,
                        title:title,
                        mid:me.mid
                    },title);
                }
                historyPopovers.push(me.id);
            }
            changeWinTitle(title);

            if(me.conf.autoShow){
                me.conf.show = true;
            }
            me.parentEl = parent;
        },
        show:function(){
            var me = this,parent = me.conf.renderTo || document.body,id;
            if(!me.conf.show){
                if(me.conf.disableEnterAnimate){
                    me.conf.show = true;
                }
            }

            if(!me.parentEl && me.parentEl !== parent){
                me.appendTo(parent);
            }
            else if(me.popIframe){
                me.conf.show = true;
            }

            if(activePop){
                activePop.conf.active = false;
            }
            me.conf.active = true;
            activePop = me;

        },
        close:function(noAnimate){
            var me = this,aniEnable = !me.conf.disableLeaveAnimate && !noAnimate;
            me.fireEvent("close");
            me.inDestroyProcess = true;
            if(aniEnable){
                me.hide();
            }
            else{
                me.hide(true);
                me.destroy();
            }
        },
        hide:function(noAnimate){
            var me = this,el = me.el,animateOut = me.conf.animateOut;
            if(!me.conf.show){
                return;
            }
            if(activePop == me){
                me.conf.active = false;
                activePop = null;
            }
            if(noAnimate){
                me.detach();
            }
            me.conf.show = false;
        },
        hideModPopovers:function(noAnimate){
            var me = this,m = me.module;
            if(m && m.popovers){
                var id,popovers = m.popovers;
                for(id in popovers){
                    var pop = popovers[id];
                    pop.hide(noAnimate);
                }
            }
        },
        detach:function(){
            var me = this;
            if(!me.popIframe || me.inDestroyProcess){
                me.callParent();
                me.parentEl = null;
            }
            else{
                me.afterDetach();
            }
        },
        afterDetach:function(){
            var me = this;
            if(me.conf.historyEnable) {
                var his = window.history;
                if (his.state.id == me.id) {
                    his.back();
                }
            }
            me.hidden = true;
            me.fireEvent("hide");
        },
        destroy:function(){
            var me = this;
            delete popovers[me.id];
        }
    }
});