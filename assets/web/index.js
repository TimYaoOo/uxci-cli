window.onload = function () {


    $env.appPlatform = 143;
    $env.defaultLoader = "web-vue2";

    if(!$env.urlParams["clz"]){
        $env.urlParams["clz"] = ".uxci.portal.Portal";
    }

    $create("ssdev.ux.WebLoader").then(function (loader) {
        loader.on("moduleLoaded",function (m) {
            $event.emit("moduleLoaded",m);
        });
        loader.on("moduleLoadError",function (e) {
            console.error(e);
            $event.emit("moduleLoadError",e);
        });
        loader.init();
    },function (e) {
        console.error(e);
        $event.emit("moduleLoadError",e);
    });


};