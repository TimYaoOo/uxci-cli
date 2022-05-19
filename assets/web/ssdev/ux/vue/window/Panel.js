$class("ssdev.ux.vue.window.Panel",{
    extend:"/ssdev.ux.vue.VueContainer",
    mixins: "/ssdev.ux.window.ModuleContainerSupport",
    tpl:"/",
    css:"/ssdev.ux.vue.window.css.panel",
    alias:"panel",
    conf:{
        title:"",
        noHeader:false,
        headerIcon:"fa fa-connectdevelop",
    },
    initComponent:function (conf) {
        const me = this;
        me.callParent(arguments);
    },
    afterInitComponent:function () {
        const me = this,el = me.el,conf = me.conf;
        me.containerEl = el.querySelector(".panel-body");
    }
});

