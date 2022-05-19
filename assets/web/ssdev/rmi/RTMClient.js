$class("ssdev.rmi.RTMClient",function(){
	let msgId = 0;
	const cmds = {
		CONNECT : 1,
		CONNACK : 2,
		PUBLISH : 3,
		PUBACK  : 4,
		SUBSCRIBE : 8,
		SUBACK : 9,
		UNSUBSCRIBE : 10,
		UNSUBACK : 11,
		DISCONNECT : 14,
		DELIVER : 90,
		DELIACK : 91
	};
	const ackDefers = {};
	const onAck = function (id,payload) {
		const d = ackDefers[id];
		delete ackDefers[id];
		if(d){
			d.resolve(payload);
		}
	};
    const onSubscribed = function (topics) {
        const me = this,subscribed = me.subscribed;
        if(topics.indexOf(",") > 0){
            const tps = topics.split(",");
            for(var i = 0,n = tps.length; i < n; i ++){
                var tp = tps[i];
                if(subscribed.indexOf(tp) < 0){
                    subscribed.push(tp);
                }
            }
        }
        else{
            if(subscribed.indexOf(topics) < 0){
                subscribed.push(topics);
            }
        }
        console.log("rtm topic[" +topics + "] subscribed.");
    };

    const onUnsubscribe = function (topic) {
        const me = this,subscribed = me.subscribed,idx = subscribed.indexOf(topic);
        if(idx > -1){
            subscribed.splice(idx,1);
            console.log("rtm topic[" + topic + "] unsubscribe.");
        }
    };

    var doAck = function (msgId,cmd,payload) {
        const me = this;
        if(msgId > 0){
            me.send({
                correlationId:msgId,
                cmd:cmd,
                payload:payload
            });
        }
    };

	return {
		cmds:cmds,
		mixins:"/ssdev.utils.Observable",
		constructor:function(conf){
			const me = this;
			me.url = conf.url;
			me.token = conf.token;
			me.autoReconnect = conf.autoReconnect;
			me.reconnectDelay = (conf.reconnectDelaySeconds || 15)*1000;
			me.subscribed = [];
			me.subscribeQueue = conf.subscribes || [];
			me.connectPromiseIsDone = 0;
            me.eventHandler = {
                onOpen:function () {
                    const token = me.token;
                    me.ws.send($encode({
                        correlationId:++msgId,
                        cmd:cmds.CONNECT,
                        payload:{
                            cid:token.id
                        }
                    }))
                },
                onMessage:function(e) {
					const data = e.data,json = $decode(data),cmd = json.cmd,msgId = json.correlationId,payload = json.payload;
                    switch(cmd){
                        case cmds.CONNACK:
                            if(payload == 200) {
                                me.connectDefer.resolve();
                                if(me.subscribeQueue.length){
                                    me.subscribe();
                                }
                                me.fireEvent("state:connected");
								console.log("rtm server[" + me.url +"] connected.")
                            }
                            else{
                                me.connectDefer.reject(new Error("rtm CONNACK with failed code[" + payload + "]."));
                            }
                            me.connectPromiseIsDone = 1;
                            break;

                        case cmds.PUBLISH:
                            doAck.call(me,msgId,cmds.PUBACK);
                            me.fireEvent("topic:" + payload.topic,payload);
                            break;

                        case cmds.DELIVER:
                            doAck.call(me,msgId,cmds.DELIACK);
                            me.fireEvent("deliver:" + payload.topic,payload);
                            break;

                        case cmds.SUBACK:
                            onSubscribed.call(me,payload);
                            onAck(msgId,payload);
                            break;

                        case cmds.UNSUBACK:
                            onUnsubscribe.call(me,payload);
                            break;

                        case cmds.PUBACK:
                        case cmds.DELIACK:
                            onAck(msgId,payload);
                            break;
                    }
                },
                onError:function(){
                    if(me.ws.readyState == 1){
                        me.ws.close();
                    }
                    me.fireEvent("state:error");
                    me.tryReconnect();
                },
                onClose:function (event) {
                    me.fireEvent("state:close",event);
                    me.tryReconnect();
                }
            };
		},
		connect:function(){
			const me = this,url=me.url;

			if(me.ws && me.ws.readyState < 2){
				return me.connectDefer.promise;
			}
            me.fireEvent("state:connect");

			const ws = new WebSocket(url);
			let defer = null;

			if(!me.connectDefer || me.connectPromiseIsDone){
				defer = $Defer();
				me.connectPromiseIsDone = 0;
				me.connectDefer = defer;
			}
			else{
				defer = me.connectDefer;
			}

			me.ws = ws;
			ws.binaryType = "arraybuffer";
			ws.onopen = me.eventHandler.onOpen;
			ws.onmessage = me.eventHandler.onMessage;
			ws.onerror = me.eventHandler.onError;
			ws.onclose = me.eventHandler.onClose;

			return defer.promise;
		},
		tryReconnect:function(){
			const me = this,delay = me.reconnectDelay;
			if(me.retrying){
				return;
			}
			me.retrying = true;
			if(me.subscribed.length){
                me.subscribeQueue = me.subscribed;
            }
			me.subscribed = [];
			if(me.autoReconnect){
				setTimeout(function(){
					console.log("rtm try reconnecting.");
					me.connect();
					me.retrying = false;
				},delay)
			}
		},
		nextId:function () {
			return ++msgId;
		},
		send:function(data,conf){
			const me = this,ws = me.ws,callId = data.correlationId;
			let defer;
			if(conf && conf.ack){
				defer = $Defer();
				ackDefers[callId] = defer;
				var delay = conf.timeout || 10000;
				setTimeout(function () {
					var df = ackDefers[callId];
					if(df){
						df.reject(new Error("rtm wait ack message[" + callId + "] cmd[" + data.cmd + "] timeout."));
					}
				},delay);
			}
			var rawData;
			if($is.Object(data)){
                if(conf && conf.sendAsBinary){
                    let cmd = data.cmd;
					let rawData = $encode(data);
                    if(cmd){
                       delete data.cmd;
                       let rawAb = $utils.typedArray.string2ArrayBuffer(rawData);
                       rawData = new Uint8Array(rawAb.byteLength+1);
                       rawData[0] = cmd;
                       rawData.set(rawAb,1);
                    }
                    else{
                        rawData =  $utils.typedArray.string2ArrayBuffer(rawData);
                    }
                }
                else{
                    rawData = $encode(data);
                }
			}
            else{
				rawData = data;
			}

			if(ws.readyState == 1){
				ws.send(rawData)
			}
			else{
				me.connect().then(function(){
					me.ws.send(rawData);
				})
			}

			if(defer){
				return defer.promise;
			}
		},
		publish:function(data){
			const me = this;
			if(!data.topic){
				return;
			}

			me.send({
				correlationId:++msgId,
				cmd:cmds.PUBLISH,
				payload:data
			})
		},
		deliver:function (data) {
			const me = this;
			return me.send({
				correlationId:++msgId,
				cmd:cmds.DELIVER,
				payload:data
			},{
				ack:true,
				timeout:10000
			})
		},
		subscribe:function(topic,f){
			const me = this,subscribed = me.subscribed;
			let tps = topic;

			if(!tps){
				tps = me.subscribeQueue;
			}

			if($is.Array(tps)){
				var newTps = [];
				for(var i = 0,n = tps.length; i < n; i ++){
					var tp = tps[i];
					if(f){
						me.on("topic:" + tp,f);
					}
					if(subscribed.indexOf(tp) < 0){
						newTps.push(tp);
					}
				}
				if(!newTps.length){
					return;
				}
				tps = newTps.join(",");
			}
			else{
				if(f){
					me.on("topic:" + tps,f);
				}
				if(subscribed.indexOf(tps) > -1){
					return;
				}
			}

			var data = {
				correlationId:++msgId,
				cmd:cmds.SUBSCRIBE,
				payload:tps
			};

			me.send(data,{ack:true}).fail(function (e) {
				console.log("rtm topic[" + topic + "] subscribe failed:" + e.message)
			});
		},
        unsubscribe:function(topic,f){
            const me = this,evt = "topic:" + topic;
            if(f){
                me.off(evt,f);
            }
            else{
                me.removeAllListeners(evt);
            }
            if(!me.listenerCount(evt)){
                var data = {
                    correlationId:++msgId,
                    cmd:cmds.UNSUBSCRIBE,
                    payload:topic
                };
                me.send(data);
            }
        }
	}
});