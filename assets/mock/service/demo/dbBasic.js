
var DB_PATH = "./assets/service/data/testDb"
var BKT = "USR"
var db = require("db")

function getPerson(id){
    try{
        var ss = db.Open(DB_PATH)
        return ss.Get(BKT,id)
    }
    catch (e) {
        throw e
    }
    finally {
        if (ss) {
            ss.Close()
        }
    }
}

function savePerson(id,data){
    try{
        var ss = db.Open(DB_PATH)
        ss.Put(BKT,id,data)
    }
    catch (e) {
        throw e
    }
    finally {
        if (ss) {
            ss.Close()
        }
    }
}

function getAll(){
    try{
        var ss = db.Open(DB_PATH)
        var rs = []
        ss.ForEach(BKT,function (u){
            rs.push(u)
        })
        return rs
    }
    catch (e) {
        throw e
    }
    finally {
        if (ss) {
            ss.Close()
        }
    }
}