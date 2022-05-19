$class("ssdev.ux.vue.window.MdiWindow", function () {
    var midWins = [];
    var midWinIdSeed = 0;

    var registerMidWin = function (win) {
        midWins.push(win);
    };

    var unRegisterMidWin = function (win) {
        var index = midWins.findIndex(function (w) {
            return w === win;
        });
        if (index > -1) {
            midWins.splice(index, 1);
        }
    };

    var activeMidWin = function (win) {
        var lastAct = midWins.find(function (w) {
            return w.active;
        });
        if (lastAct) {
            lastAct.active = false;
            lastAct.conf.level = 12;
        }
        win.active = true;
        win.conf.level = 13;
    };

    return {
        extend: "/ssdev.ux.vue.VueContainer",
        mixins: "/ssdev.ux.window.ModuleContainerSupport",
        css: "/ssdev.ux.vue.window.css.window",
        tpl: "/",
        alias: "mdi",
        renderTo:null,
        conf: {
            enableToolMini: true,
            enableToolClose: true,
            closeAction: "close",
            noHeader: false,
            title: "",
            icon: "fa fa-connectdevelop",
            width: 500,
            height: 300,
            x: 100,
            y: 100,
            moving: false,
            level: 12,
            noScroller: false,
            fullscreen: false,
            position: 'center',
            show:false,
            exCls:""
        },
        active: false,
        initComponent: function (conf) {
            var me = this;
            var evtHandlers = {
                toolClick: function (e) {
                    var el = e.target;
                    var cmd = el.getAttribute("data-act");
                    me.doToolAct(cmd);
                },
                onFocus: function () {
                    activeMidWin(me);
                }
            };
            var offsetX = 0;
            var offsetY = 0;
            me.id = ++midWinIdSeed;
            me.evtHandlers = evtHandlers;
            me.dragEvtHandlers = {
                dragStart: function (e) {
                    var tn = e.target.tagName.toLowerCase();
                    if (conf.fullscreen || tn == 'a') {
                        return;
                    }
                    if (tn == 'span' || tn == 'i') {
                        offsetX = e.offsetX + 12;
                        offsetY = e.offsetY + 12;
                    }
                    else {
                        offsetX = e.offsetX;
                        offsetY = e.offsetY;
                    }

                    me.conf.moving = true;
                    me.el.style.cursor = "move";
                    window.addEventListener("mousemove", me.dragEvtHandlers.move, false);
                    window.addEventListener('mouseup', me.dragEvtHandlers.dragStop, true)
                },
                move: function (e) {
                    var x = e.x - offsetX;
                    var y = e.y - offsetY;
                    if (conf.fullscreen) {
                        return;
                    }
                    me.conf.x = x;
                    me.conf.y = y;
                },
                dragStop: function () {
                    me.el.style.cursor = 'default';
                    me.conf.moving = false;
                    window.removeEventListener("mousemove", me.dragEvtHandlers.move);
                    window.removeEventListener('mouseup', me.dragEvtHandlers.dragStop);
                }
            };

            me.callParent(arguments);
        },
        afterInitComponent: function () {
            var me = this, el = me.el, dragEvtHandlers = me.dragEvtHandlers;
            me.containerEl = el.querySelector("div.widget-body");
            el.querySelector(".widget-header").addEventListener("mousedown", dragEvtHandlers.dragStart);

            let done = {};
            let transitionend = function(e){
                e.cancelBubble = true;
                const t = e.target;
                if(t.classList.contains("mdi-window")){
                    if(e.propertyName == "width"){
                        done.w = true
                    }
                    else if(e.propertyName == "height"){
                        done.h = true;
                    }
                    else{
                        return;
                    }
                    if(done.w && done.h){
                        done.w = false;
                        done.h = false;
                        me.onResize();
                    }
                }
            };
            el.addEventListener("transitionend",transitionend);
        },
        doToolAct: function (act) {
            var me = this,el = me.el;
            switch (act) {

                case "fullscreen":
                    me.conf.fullscreen = !me.conf.fullscreen;
                    break;

                case "close":
                    if (me.conf.closeAction == "close") {
                        me.close();
                    }
                    else {
                        me.hide();
                    }
                    break;
            }
        },
        resizeTo: function (w, h) {
            var me = this, conf = me.conf;
            conf.width = w;
            conf.height = h;
            me.onResize()
        },
        onResize : function(){
            var me = this,m = me.module;
            if(m && $is.Function(m.updateLayout)){
                m.updateLayout();
            }
        },
        moveTo: function (x, y) {
            var me = this, conf = me.conf;
            conf.x = x;
            conf.y = y;
        },
        setBounds: function (bounds) {
            var me = this, conf = me.conf;
            var w = bounds.width || conf.width;
            var h = bounds.height || conf.height;

            if (bounds.width || bounds.height) {
                me.resizeTo(w, h);
            }

            if (bounds.x || bounds.y || bounds.position) {
                let x = bounds.x || conf.x;
                let y = bounds.y || conf.y;
                let pos = bounds.position;
                let sw = window.innerWidth, sh = window.innerHeight;

                if (pos) {
                    y = Math.ceil((sh - h) / 2);
                    switch (pos) {
                        case "center":
                            x = Math.ceil((sw - w) / 2);
                            break;

                        case "rightSide":
                            x = sw - w - 5;
                            break;

                        case "leftSide":
                            x = 0;
                            break
                    }
                    conf.position = pos;
                }
                me.moveTo(x, y);
            }
        },
        minimize: function () {

        },
        hide: function () {
            var me = this;
            me.fireEvent("hide");
            me.detach();
            me.shown = false;
            unRegisterMidWin(me);
        },
        close: function () {
            var me = this;
            me.fireEvent("close");
            me.destroy();
        },
        show: function () {
            var me = this, renderTo = me.renderTo || document.body;
            if (!me.shown) {
                me.setBounds({
                    position: me.conf.position
                });
                me.appendTo(renderTo);
                me.shown = true;
                registerMidWin(me);
            }
            activeMidWin(me);
        },
        destroy: function () {
            var me = this;
            me.hide();
        }
    }
});
