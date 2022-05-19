

function hello(name){
    var data = require("../data/data.js").data()
    var cpus = require("os").Cpus()
    return {name:name,msg:"hello world",body:data,cpus:cpus}
}

