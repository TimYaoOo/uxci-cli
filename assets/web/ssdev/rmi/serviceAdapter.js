$define("ssdev.rmi.serviceAdapter",function () {
    return {
        bindMethod:function(conf){
            let jsonData = {};
            let headers = null;
            const useHttpHeader = conf.useHttpHeader;
            if(useHttpHeader){
                headers = {
                    "X-Service-Id":conf.beanName,
                    "X-Service-Method":conf.method,
                    "X-Action":conf.actionId
                }
            }
            else{
                jsonData.serviceId = conf.beanName;
                jsonData.method = conf.method;
                jsonData.actionId = conf.actionId;
            }
            return (function(){
                const deferred = $Defer();
                const parameters = Array.prototype.slice.call(arguments, 0);
                if(useHttpHeader){
                    jsonData = parameters;
                }
                else{
                    jsonData.body = parameters;
                }
                $ajax({
                    headers:headers,
                    jsonData:jsonData,
                    headers:headers
                }).then(function(json){
                    deferred.resolve(json.body)
                },function(e){
                    deferred.reject(e)
                });
                return deferred.promise;
            })//function()
        }
    };
});


