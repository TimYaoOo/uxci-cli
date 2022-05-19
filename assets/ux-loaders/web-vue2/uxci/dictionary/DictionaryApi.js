$define("uxci.dictionary.DictionaryApi",function () {
    return {
        created: function () {
            const me = this,dicId = me.dicId,parentKey = me.parentKey,options = me.options;
            $ajax({
                method:"GET",
                url:dicId + ".dic?parentKey=" + parentKey
            }).then(function (json) {
                let items = json.body.items;
                if(options.length){options.splice(0,options.length);}
                items.forEach(function (it) {
                    options.push({
                        value:it.key,
                        label:it.text
                    })
                })
            })
        }
    }
});