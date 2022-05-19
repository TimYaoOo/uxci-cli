var db = require('db')

function loadChartData(id){
    return require("../data/chart/chartData-" + id + ".json")
}

