$class("ssdev.ux.HTMLContainer",{
    extend:"/ssdev.ux.Container",
    initComponent:function(conf){
        const me = this;
        const frag = document.createRange().createContextualFragment(conf.html);
        me.el = frag.firstChild;
        me.callParent(arguments);
    }
});