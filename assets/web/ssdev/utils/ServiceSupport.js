$class("ssdev.utils.ServiceSupport",{
    deps:"/ssdev.rmi.serviceAdapter",
	setupService:function(conf){
		var me = this,service = me.service,adapter = ssdev.rmi.serviceAdapter;
		
		if(!service){
			service = me.service = {};
		}
		
		if($is.Object(conf)){
			var method = conf.method;
			if($is.Array(method)){
				for(var i = 0; i < method.length; i++){
					var m = method[i];
					var nm = m;
					var fn = m;
					if($is.Object(m)){
						nm = m.alias || m.method;
						fn = m.method;
					}
					service[nm] = adapter.bindMethod({
						beanName:conf.beanName,
						method:fn,
						actionId:conf.actionId,
                        useHttpHeader:true
					})
				}
			}
			else{
				service[conf.alias || conf.method] = adapter.bindMethod({
					beanName:conf.beanName,
					method:conf.method,
					actionId:conf.actionId,
                    useHttpHeader:true
				})
			}
		}
		else if($is.Array(conf)){
			for(var i = 0,n = conf.length;i < n; i ++){
				me.setupService(conf[i]);
			}
		}
	}
});