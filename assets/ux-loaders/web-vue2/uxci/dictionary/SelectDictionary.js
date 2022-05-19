$define("uxci.dictionary.SelectDictionary",{
    tpl:".",
    deps:".uxci.dictionary.DictionaryApi"
},function (template,api) {
    console.log(api)
    return Vue.component('x-select-dictionary', {
        props: {dicId:String,defaultText:String,value:String,parentKey:{type:String,default:""}},
        model: {
            prop: 'value',
            event: 'change'
        },
        template:template,
        methods:{
            onChange:function () {
               this.$emit("change",this.selectedValue);
            }
        },
        data:function () {
           return  {
               options:[],
               selectedValue:this.value
            };
        },
        watch:{
            value:function (val) {
               if(this.selectedValue != val){
                  this.selectedValue = val;
               }
            },
            parentKey:function (val) {
                this.selectedValue = null;
                api.created.call(this)
            }
        },
        created: api.created
    });
});