window.onload = function(){


    $env.appPlatform = 2096128;
    $env["apps.deep"] = 4;
    $env.defaultLoader = "mobile-vue";

    if(!$env.urlParams["clz"]){
        $env.urlParams["clz"] = ".xwx.portal.Portal";
        $env.urlParams["init"] = 2;
    }

    $create("ssdev.ux.WebLoader").then(function (loader) {
        loader.on("moduleLoaded",function (m) {
            $event.emit("moduleLoaded",m);
        });
        loader.on("moduleLoadError",function (e) {
            $event.emit("moduleLoadError",e);
            console.error(e);
        });
        loader.init();
    },function (e) {
        console.error(e);
        $event.emit("moduleLoadError",e);
    });

};