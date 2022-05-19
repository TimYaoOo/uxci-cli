$class("ssdev.ux.vue.mask.Mask",{
    extend:"/ssdev.ux.vue.VueContainer",
    tpl:"/",
    css:"/ssdev.ux.vue.mask.css.mask",
    alias:"mask",
    afterInitComponent:function(){
        var me = this,el = me.el,body = document.body;
        body.insertBefore(el,body.firstChild);
        me.callParent(arguments);
    },
    afterVueConfInited:function (vueConf) {
        var me = this, data = me.conf;
        data.refCount  = 0;
        vueConf.computed = {
            show:function () {
                return this.refCount > 0;
            }
        }
    },
    remain:function () {
        var me = this;
        me.conf.refCount ++;
    },
    release:function () {
        var me = this;
        if(me.conf.refCount > 0){
            me.conf.refCount --;
        }
    }
});