$class("ssdev.ux.vue.VueContainer",{
    extend:"/ssdev.ux.Container",
    initComponent:function(conf){
        var me = this;
        var vueConf = me.initVue();
        if(!vueConf){
            throw new Error("class[" + me.$classname + "] method[initVue] return invalid conf object.")
        }
        me.afterVueConfInited(vueConf);

        var vue = new Vue(vueConf);
        me.vue = vue;
        me.beforeVueMount(vue);

        vue.$mount();
        me.el = vue.$el;
        me.callParent(arguments);
    },
    initVue:function () {
        var me = this;
        return {
            data:me.data || me.conf,
            template:me.html,
            methods:me.evtHandlers
        }
    },
    afterVueConfInited:function (conf) {

    },
    beforeVueMount:function () {

    },
    destroy:function () {
        var me = this,vue = me.vue;
        if(vue){
            vue.$destroy();
        }
    }
});