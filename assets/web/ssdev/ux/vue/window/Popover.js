$class("ssdev.ux.vue.window.Popover",{
    extend:"/ssdev.ux.vue.VueContainer",
    mixins:"/ssdev.ux.window.PopoverApi",
    tpl:"/",
    css:"/ssdev.ux.vue.window.css.popover",
    alias:"popover",
    initComponent:function (conf) {
        var me = this;
        me.setupEvents();
        me.callParent(arguments);
    },
    afterInitComponent:function () {
        var me = this,el = me.el,conf = me.conf;
        me.containerEl = el.querySelector(".pop-body");
    }
});

