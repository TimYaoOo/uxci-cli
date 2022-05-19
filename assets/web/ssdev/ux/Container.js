$class("ssdev.ux.Container",{
    mixins:"/ssdev.utils.Observable",
    constructor:function (conf) {
        var me = this;
        var initConf =  $apply({},me.conf);
        me.conf = $apply(initConf,conf);
        me.initComponent(me.conf);
    },
    initComponent:function(conf){
      var me = this;
      me.afterInitComponent();
    },
    afterInitComponent:function () {

    },
    getElement:function(){
        return this.el
    },
    appendTo:function(parent){
        var me = this,el = me.el;
        if(el){
           if(window.jQuery && el instanceof jQuery){
               $(parent).append(el);
           }
           else if($is.Element(el) && $is.Element(parent)){
                parent.appendChild(el);
           }
           else{
               throw new TypeError("appendTo failed for el:"+el)
           }
           me.afterAppend(parent);
        }
    },
    afterAppend:function (parent) {

    },
    detach:function () {
        var me = this,el = me.el;
        if(el){
            if(window.jQuery && el instanceof jQuery){
                el.detach();
            }
            else if($is.Element(el)){
                if(el.remove){
                    el.remove();
                }
                else if(el.parentNode){
                    el.parentNode.removeChild(el);
                }
            }
            me.afterDetach();
        }
    },
    afterDetach:function () {

    },
    destroy:function () {
        var me = this,el = me.el;
        if(el){
            if(window.jQuery && el instanceof jQuery){
                el.empty();
            }
            else if($is.Element(el)){
                el.textContent = "";
            }
        }

    }
});
