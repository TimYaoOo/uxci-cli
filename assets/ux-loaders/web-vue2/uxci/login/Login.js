$class("uxci.login.Login",{
	extend:"/ssdev.ux.vue.VueContainer",
	mixins:[
		"/ssdev.utils.ServiceSupport",
    	"/ssdev.ux.login.LoginApi"
	],
	tpl:".",
    css:".uxci.login.css.login",
	requestDefineDeep:3,
    winConf:{
        title:"系统登录",
        noHeader:true,
        autoShow:false,
        enableToolMini:false,
        enableToolClose:false
    },
    autoLoginFirstUrt:false,
    $afterClassInit:function () {

    },
    initComponent:function (conf) {
        const me = this;
        const evtHandlers = {
            handleLogin:function () {
                const vue = this, form = me.data.form;
                me.doLogin()
            },
            handleEnter:function (e) {
                let t = e.target,fmData = me.data.form;
                let form = me.vue.$refs["form"];
                if(t.id === 'uid' && fmData.uid){
                    me.vue.$refs["pwd"].focus();
                }
                if(t.id === 'pwd' && fmData.pwd){
                    let codec = ssdev.utils.codec.md5;
                    fmData.md5Pwd = codec.MD5(fmData.pwd).toString();

                    me.data.selectedUrt = null;

                    me.doGetUserRoles(fmData).then(function (json) {
                        let items = json.body;
                        let urts = me.data.urts;
                        me.urts = items;

                        urts.splice(0,urts.length);
                        items.forEach(function (it) {
                            urts.push({
                                id:it.id,
                                name:it.displayName
                            })
                        });
                        fmData.urts = urts;
                        if (urts.length == 1){
                            me.data.selectedUrt = urts[0].id;
                            me.userRoleToken = urts[0]
                            $nextTick(function () {
                                me.vue.$refs["urt"].focus();
                            });
                        }
                    })
                }
                if(t.id == "urt"){
                    me.userRoleToken = me.urts.find(function (urt) {
                       return urt.id == me.data.selectedUrt;
                    });
                    me.doLoadAppDefines(me.data.selectedUrt)
                }
            },
            handleLogin:function () {
                const fmData = me.data.form;
                if(!fmData.uid){
                    me.vue.$refs["uid"].focus();
                    return;
                }
                if(!fmData.pwd){
                    me.vue.$refs["pwd"].focus();
                    return;
                }
                if(!me.data.selectedUrt){
                    me.vue.$refs["urt"].focus();
                    return;
                }
                me.doLoadAppDefines(me.data.selectedUrt)
            }
        };
        me.evtHandlers = evtHandlers;

        const formData = me.getLocalUserData();
        me.data = {
            loading:false,
            form:formData,
            errorInfo:null,
            selectedUrt:null,
            isProcessing:false,
            urts:[]
        };
        me.callParent(arguments);
    },
    doLogin:function(){
        let fm = me.data.form,el = me.el;
        if(!fm.uid){
            me.uidFieldFocus();
            return;
        }
        if(!fm.pwd){
            me.pwdFieldFocus();
            return;
        }
        me.data.loading = true;
        me.data.errorInfo = null;
        me.doLogin(fm).then(function(){
            me.data.loading = false;
            if(fm.rememberMe){
                $env.setLocalStorage("userData",{
                    uid:fm.uid,
                    rememberMe:fm.rememberMe
                })
            }
            else{
                $env.removeLocalStorage("userData");
            }
        }).fail(function(){
            me.data.loading = false;
        });
    },
    pwdFieldFocus:function(){
	    const me = this,el = me.el;
        el.querySelector("#pwd").focus();
    },
    uidFieldFocus:function (){
        const me = this,el = me.el;
        el.querySelector("#uid").focus();
    },
    showError:function (s) {
      const me = this;
      me.data.errorInfo = s;
    },
    afterAppend:function () {
        const me = this;
        me.onActive();
    },
    onActive:function(){
        const me=this,el=this.el;
        me.fireEvent("ready");
        setTimeout(function(){
            const token = $env.globalContext.get("urt");
            const uidEl = me.vue.$refs["uid"];
            const pwdEl = me.vue.$refs["pwd"];

            if(token){
                uidEl.disabled  = true;
                pwdEl.focus();
            }
            else{
                let fm = me.data.form;
                if(fm.uid){
                    pwdEl.focus();
                }
                else{
                    uidEl.focus();
                }
            }
        },200);
    },
});

