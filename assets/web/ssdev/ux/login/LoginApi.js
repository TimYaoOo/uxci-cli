$class("ssdev.ux.login.LoginApi",{
    deps:"/ssdev.utils.codec.md5",
    autoLoginFirstUrt:true,
    getLocalUserData:function () {
        const localUserData = $env.getLocalStorage("userData",true) || {};
        const formData = {
            uid:localUserData.uid,
            pwd:null,
            urt:"",
            tenantId: "bsoft",
            rememberMe:localUserData.rememberMe
        };
        return formData;
    },
    doGetUserRoles:function (data) {
        return $ajax({
            url:"logon/myRoles",
            jsonData:{
                loginName:data.uid,
                pwd:data.md5Pwd,
                tenantId:data.tenantId,
                forAccessToken:true
            }
        });
    },
    doRelogin:function(data){
        const me = this,codec = ssdev.utils.codec.md5,md5Pwd = codec.MD5(data.pwd).toString(),urt = data.urt, urtDept = data.urtDept || "";
        return $ajax({
            url:"logon/login",
            jsonData:{
                uid:data.uid,
                loginName:data.uid,
                pwd:md5Pwd,
                rid:data.rid,
                tenantId:data.tenantId,
                urtDept: data.urtDept,
                forAccessToken:true
            }
        }).then(function(json){
            me.fireEvent("relogin",json);
        }).fail(function(json){
            switch(json.code){
                case 401:
                    json.msg = "无法连接到服务器";
                    break;

                case 501:
                    json.msg = "密码输入错误";
                    break;

                case 404:
                    if(json.msg === 'ServerError'){
                        json.msg = "该网络地址无法访问";
                    }
                    else{
                        json.msg = "用户名输入错误";
                    }
                    break;
                case 509:
                    json.msg = "当前租户[" + tenantId + "]下尚未注册用户[" + uid + "]";
                    break;
                default:
                    json.msg = "服务器异常,请联系系统管理员";
                    break;
            }
            return json;
        });
    },
    doLogin:function(data){
        const me = this,uid = data.uid, tenantId = data.tenantId,codec = ssdev.utils.codec.md5,md5Pwd = codec.MD5(data.pwd).toString();
        return $ajax({
            url:"logon/myRoles",
            timeout:5000,
            jsonData:{
                loginName:uid,
                pwd:md5Pwd,
                tenantId:tenantId,
                forAccessToken:true
            }
        }).then(function(json){
            let urs = json.body;
            if(urs.length){
                if(me.autoLoginFirstUrt){
                    me.userRoleToken = urs[0];
                    me.showError("");
                    me.userRoleToken.md5Pwd = md5Pwd;
                    me.doLoadAppDefines(me.userRoleToken.id)
                }
                else{
                    return urs;
                }
            }
            else{
                me.showError("该用户未找到角色，无法登陆系统.")
            }
        }).fail(function(json){
            const el = me.el;
            switch(json.code){
                case 401:
                    me.showError("无法连接到服务器");
                    break;

                case 501:
                    me.pwdFieldFocus();
                    me.showError("密码输入错误");
                    break;

                case 404:
                    if(json.msg === 'ServerError'){
                        me.showError("该网络地址无法访问");
                    }
                    else{
                        me.uidFieldFocus();
                        me.showError("用户名输入错误");
                    }
                    break;
                case 509:
                    me.tidFieldFocus();
                    me.showError("当前租户[" + tenantId + "]下尚未注册用户[" + uid + "]");
                    break;
                default:
                    me.showError("服务器异常,请联系系统管理员");
                    break;
            }
        })
    },
    tidFieldFocus:function(){},
    pwdFieldFocus:function(){},
    uidFieldFocus:function (){},
    showError:function () {},
    doLoadAppDefines:function(urt, urtDept, login){
        var me = this;
        return $ajax({
            url:"logon/myApps",
            params:{
                urt:urt,
                deep:3,
                platform:$env.appPlatform || 256,
                login: login || 0,
                urtDept: urtDept || ""
            },
            method:"GET"
        }).then(function(json){
            const appData = json.body;
            $env.globalContext.put("urt",me.userRoleToken);
            me.fireEvent("appsDefineLoaded",me.userRoleToken,appData);
            me.relogonCallbackContext = {};
        })
    },
    getSessionUrt:function(){
        return $ajax({
            url:"logon/currentUrt",
            method:"GET"
        });
    },
    doLogout:function(){
        return $ajax({
            url:"logon/logout",
            method:"GET"
        });
    },
    tryRelogin:function(){
        const me = this,token = me.userRoleToken;
        return me.doRelogin({uid:token.userId,md5Pwd:token.md5Pwd,rid:token.roleId});
    },
    getUserRoles:function(){
        var me = this;
        return $ajax({
            url:"logon/myRolesAfterLogin",
            method:"GET"
        }).then(function(json){
            return json.body;
        });
    },
    doValidateRoles:function(data){
        const me = this,codec = ssdev.utils.codec.md5,md5Pwd = codec.MD5(data.pwd).toString(),urt = data.urt, urtDept = data.urtDept || "";
        return $ajax({
            url:"logon/login",
            jsonData:{
                uid:data.uid,
                loginName:data.uid,
                pwd:md5Pwd,
                rid:data.rid,
                tenantId:data.tenantId,
                urtDept: data.urtDept,
                forAccessToken:true
            }
        }).then(function(json){
            return me.doLoadAppDefines(urt, urtDept);
        }).fail(function(json){
            switch(json.code){
                case 401:
                    json.msg = "无法连接到服务器";
                    break;

                case 501:
                    json.msg = "密码输入错误";
                    break;

                case 404:
                    if(json.msg === 'ServerError'){
                        json.msg = "该网络地址无法访问";
                    }
                    else{
                        json.msg = "用户名输入错误";
                    }
                    break;
                case 509:
                    json.msg = "当前租户[" + tenantId + "]下尚未注册用户[" + uid + "]";
                    break;
                default:
                    json.msg = "服务器异常,请联系系统管理员";
                    break;
            }
            return json;
        });
    }
});