$class("ssdev.utils.Observable",{
	constructor:function () {
        this.listenersStore = {};
    },
	addListener:function(ename,fn,once){
        if(!$is.Function(fn)){
            return;
        }
        var store = this.listenersStore;
		var listeners = store[ename];
        if(!listeners){
			listeners = [];
			store[ename] = listeners
		}
        var n = listeners.length;
        for(var i = 0;i < n; i++) {
            var l = listeners[i];
            if(l.fn === fn){
                return;
            }
        }
		listeners.push({
			fn:fn,
            once:once
		})
	},
	removeListener:function(ename,fn){
		var store = this.listenersStore;
		var listeners = store[ename];
		if(!listeners){
			return;
		}
		var n = listeners.length;
        for(var i = 0;i < n; i++){
			var listener = listeners[i];
			if(listener.fn === fn){
                listeners.splice(i, 1);
				return true;
			}
		}
	},
	listenerCount:function (ename) {
		var store = this.listenersStore;
		var listeners = store[ename];
		if(listeners){
			return listeners.length;
		}
		return 0;
	},
	fireEvent:function(){
		if (arguments.length == 0) {
			return
		}
		var ename = arguments[0];
		var store = this.listenersStore;
		var listeners = store[ename];

		if(listeners && listeners.length){
            var arraySlice = Array.prototype.slice;
			for(var i = 0;i < listeners.length; i++){
				var listener = listeners[i];
                if(listener.once === true){
                    listeners.splice(i, 1);
                    i --;
                }
                var fn = listener.fn;
                fn.apply(null,arraySlice.call(arguments, 1));
			}
		}
	},
	removeAllListeners:function(ename){
		if(ename){
			var store = this.listenersStore;
			store[ename] = [];
		}
		else{
			this.listenersStore = {};
		}
	},
	bindEventHandlers:function (source,handlers) {
        var bf = source.on || source.addListener || source.addEventListener;
        if(!$is.Function(bf)){
           throw new TypeError("source is not an event emitter")
        }
        for(let evt in handlers){
            if(handlers.hasOwnProperty(evt)){
                let fn = handlers[evt];
                if($is.Function(fn)) {
                    bf.call(source,evt,fn);
                }
            }
        }
    },
    unbindEventHandlers:function (source,handlers) {
        var bf =  source.off || source.removeListener || source.removeEventListener;
        if(!$is.Function(bf)){
           throw new TypeError("source is not an event emitter");
        }
        for(let evt in handlers){
            if(handlers.hasOwnProperty(evt)){
                let fn = handlers[evt];
                if($is.Function(fn)) {
                    bf.call(source,evt,fn);
                }
            }
        }
    },
    destroy:function(){
        var me = this;
        me.removeAllListeners();
        //me.callParent(arguments);
    }
});

ssdev.utils.Observable.prototype.on = ssdev.utils.Observable.prototype.addListener;
ssdev.utils.Observable.prototype.un = ssdev.utils.Observable.prototype.removeListener;
ssdev.utils.Observable.prototype.off = ssdev.utils.Observable.prototype.removeListener;
ssdev.utils.Observable.prototype.emit = ssdev.utils.Observable.prototype.fireEvent;