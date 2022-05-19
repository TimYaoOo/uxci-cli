$class("workspace.gridexample.GridAreaContainer", {
    extend: "/ssdev.ux.vue.VueContainer",
    mixins: "/ssdev.ux.window.ModuleContainerSupport",
    css: "/workspace.gridexample.css.container",
    tpl: "/",
    initComponent:function(conf){
        const me = this;
        me.callParent(arguments);
        me.containerEl = me.el;
    },
    onResize:function () {
        const me = this,m = me.module;
        if(m && $is.Function(m.updateLayout)){
            m.updateLayout()
        }
    }
})