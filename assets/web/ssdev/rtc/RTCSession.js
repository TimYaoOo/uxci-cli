$class("ssdev.rtc.RTCSession",{
	mixins:"/ssdev.utils.Observable",
	actions:{
		JOIN        : 10,
		JOIN_ACK    : 11,
		PEER_JOINED : 12,
		QUIT        : 20,
		PEER_QUITED : 21,
		CANDIDATE   : 30,
		OFFER       : 40,
		OFFER_RECV  : 41,
		ANSWER      : 51,
		ANSWER_RECV : 52
	},
	RTC_TOPIC:"RTC",
	autoAnswer:true,
	constructor:function(conf){
		var me = this;
		me.rtm = conf.rtm;

		var iceServer = $env.webRTCIceServer;
		if(iceServer){
			me.iceServer = iceServer;
		}
		if(conf.autoAnswer){
			me.autoAnswer = conf.autoAnswer;
		}

		var p =  new RTCPeerConnection(iceServer);
		me.peerConnection = p;
		me.localStreams = [];
		p.onicecandidate = function(e) {
			var candi = e.candidate;
			if(candi){
				me.rtm.publish({
					topic:me.RTC_TOPIC,
					action:me.actions.CANDIDATE,
					ssid:me.ssid,
					data:candi.toJSON()
				});
			}
		};
		p.onaddstream = function(e){
			var stream = e.stream;
			me.fireEvent("remoteStream",stream);
		};

		var onSignalingMessage = function(json){
			var p = me.peerConnection,actions = me.actions;
			switch(json.action){
				case actions.JOIN_ACK:
					me.status = 1;
					me.ssid = json.ssid;
					if(me.joinDefer){
						me.joinDefer.resolve(me.ssid);
						me.joinDefer = null;
					}
					me.fireEvent("joined",json.ssid);
					break;

				case actions.PEER_JOINED:
					me.otherPeer = json.data;
					me.status = 10;
					me.fireEvent("peerJoined",me.otherPeer);
					break;

				case actions.PEER_QUITED:
					me.otherPeer = null;
					me.fireEvent("peerQuit");
					break;

				case actions.OFFER_RECV:
					p.setRemoteDescription(new RTCSessionDescription(json.data));
					me.status = 20;
					me.answer();
					me.fireEvent("offerRcv");
					break;

				case actions.ANSWER_RECV:
					p.setRemoteDescription(new RTCSessionDescription(json.data));
					me.fireEvent("answerRcv");
					me.status = 21;
					break;

				case actions.CANDIDATE:
					p.addIceCandidate(new RTCIceCandidate(json.data));
					break;
			}
		};
		me.onSignalingMessage = onSignalingMessage;
		me.rtm.subscribe(me.RTC_TOPIC,onSignalingMessage);
	},
	offer:function(){
		var me = this,p = me.peerConnection,rtm =me.rtm;
		if(me.status > 1){
			p.createOffer().then(function(offer){
				p.setLocalDescription(offer);
				rtm.publish({
					topic:me.RTC_TOPIC,
					action:me.actions.OFFER,
					ssid:me.ssid,
					data:offer.toJSON()
				});
				me.status = 10;
			});
		}
	},
	answer:function(){
		var me = this,p = me.peerConnection,rtm=me.rtm;
		if(me.status != 20){
			return;
		}
		p.createAnswer().then(function(answer){
			p.setLocalDescription(answer);
			rtm.publish({
				topic:me.RTC_TOPIC,
				action:me.actions.ANSWER,
				ssid:me.ssid,
				data:answer.toJSON()
			});
			me.status = 21;
		});
	},
	join:function(ssid){
		var me = this,rtm = me.rtm;

		if(me.joinDefer){
			return me.joinDefer.promise;
		}
		var defer = $Defer();
		me.joinDefer = defer;
		rtm.publish({
			topic:me.RTC_TOPIC,
			action:me.actions.JOIN,
			ssid:ssid
		});
		setTimeout(function () {
			if(me.joinDefer){
				me.joinDefer.reject(new Error("rtc join timeout."));
			}
			me.joinDefer = null;
		},10000);
		return defer.promise;
	},
	callPeer:function (data) {
		var me = this,rtm = me.rtm,defer = $Defer();
		if(me.status > 0){
			defer.reject(new Error("rtc session not joined."));
		}
		else{
			me.callPeerDefer = defer;
			rtm.deliver(data).then(function (code) {
				if(code != 200){
					defer.reject(new Error(code));
					me.callPeerDefer = null;
				}
			})
		}
		return defer.promise;
	},
	quit:function(){
		var me = this,rtm = me.rtm;
		if(me.ssid && me.status > 0){
			rtm.publish({
				topic:me.RTC_TOPIC,
				action:me.actions.QUIT,
				ssid:me.ssid
			});
			me.status = 0;
			me.fireEvent("quit")
		}
	},
	removeLocalStream:function(){
		var me = this,p = me.peerConnection,localStreams = p.getLocalStreams();
		localStreams.forEach(function (s) {
			p.removeStream(s);
		});
	},
	addLocalStream:function(newMediaConf,label,manualOffer){
		var me = this,p = me.peerConnection;
		if(me.existStream(label)){
			return;
		}

		navigator.getUserMedia(newMediaConf,function(stream){
			stream.label = label;
			me.localStreams.push(stream);
			me.fireEvent("localStream",stream);
			p.addStream(stream);
			if(!manualOffer) {
				me.offer();
			}
		},function(e){
			me.fireEvent("error",e);
		})
	},
	existStream:function(label){
		var me = this,streams = me.localStreams;
		var idx = streams.findIndex(function (s) {
			return s.label == label;
		});
		return idx >=0;
	},
	stopLocalStreams:function(){
		var me = this,streams = me.localStreams;
		streams.forEach(function (s) {
			s.getAudioTracks().forEach(function(track) {
				track.stop();
			});
			s.getVideoTracks().forEach(function(track) {
				track.stop();
			});
		});
	},
	pauseLocalStreams:function(status) {
		var me = this,streams = me.localStreams;
		streams.forEach(function (s) {
			s.getAudioTracks().forEach(function(track) {
				track.enabled = status;
			});
			s.getVideoTracks().forEach(function(track) {
				track.enabled = status;
			});
		});
	},
	destroy:function(){
		var me = this,rtm = me.rtm;
		rtm.unsubscribe(me.RTC_TOPIC,me.onSignalingMessage);
		if(me.status && me.status > 0){
			me.removeLocalStream();
			me.stopLocalStreams();
			me.quit();
			me.peerConnection.close();
		}
		me.callParent();
	}
});