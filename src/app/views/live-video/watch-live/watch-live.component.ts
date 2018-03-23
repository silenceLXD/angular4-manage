import {Component, OnInit, AfterContentInit, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '@services/common.service';
import {AuthService} from '@services/auth.service';
import {NzModalService} from 'ng-zorro-antd';
import {NzNotificationService} from 'ng-zorro-antd';
import {environment} from '../../../../environments/environment';
import * as $ from 'jquery';
import {Strophe} from 'strophe.js';

@Component({
  selector: 'app-watch-live',
  templateUrl: './watch-live.component.html',
  styleUrls: ['./watch-live.component.css']
})

export class WatchLiveComponent implements OnInit, AfterContentInit, OnDestroy {
  private appointmentId: number;//会议的appointmentId
  private sub: any;// 传递参数对象
  loginUserData = this.commonService.getLoginMsg();
  isLogin: boolean = false;
  // xmppPassword:any;
  // xmppServer:any;
  // xmppUsername:any;
  webrtcXmppIp: any;

  endInterval:any;
  isPc: any;//是否pc
  browser: any;//浏览器类型
  constructor(private _activatedRoute: ActivatedRoute,
              private http: HttpClient,
              private commonService: CommonService,
              private authService: AuthService,
              private router: Router,
              private confirmServ: NzModalService,
              private _notification: NzNotificationService) {
    this.sub = this._activatedRoute.params.subscribe(params => {
      this.appointmentId = params['mid'];
    });

    this.isPc = this.commonService.IsPC();
    this.browser = this.commonService.BrowserType();

    this.isLogin = this.authService.isLoggedIn;
    // this.isLogin = this.authService.isLoggedInBool();
    if (!this.isLogin) {
      if (this.commonService.getCookie('liveId')) {
        this.commonService.deleCookie('liveId');
      }
    }
    if (this.isLogin && this.loginUserData) {
      this.XMPPConferencesData.xmppPassword = this.loginUserData.xmppPassword;
      this.XMPPConferencesData.xmppServer = this.loginUserData.xmppServer;
      this.XMPPConferencesData.xmppUsername = this.loginUserData.xmppUsername;
      this.XMPPConferencesData.webrtcXmppIp = this.webrtcXmppIp = this.loginUserData.webrtcXmppIp;
    }else{
      this.endInterval = setInterval(() => {
        this.liveStatusFn();
      },300000);

    }
  }

  ngOnInit() {
    this.getLiveMeetingFn();//查询直播会议相关信息

  }

  ngAfterContentInit() {
    this.XMPPData.BOSH_SERVICE = this.webrtcXmppIp + '/http-bind/';
  }

  // 通过appointmentId查询会议信息
  liveConferenceData: any = {
    appointUser: '',
    conferenceName: '',
    conferenceDesc: '',
    startTime: '',
  };
  noConference: boolean = false;
  liveVideo: boolean = true;
  isCountDown = false; // 是否是倒计时
  liveState: any = {
    liveVideo: false,
    noConference: false,
    countDown: false,
    startTime: null
  };
  playNum: any = 0;
  isShowConMsg: boolean = false;

  getLiveMeetingFn() {
    this.http.get('/uc/lives/' + this.appointmentId + '/live-date').subscribe(
      res => {
        let resultData: any = res;
        this.liveState.startTime = resultData.data.startTime;
        /* this.liveState.startTime = 1521701918442;
         resultData.code = 33306;*/
        switch (resultData.code) {
          case 200:
            this.isShowConMsg = true;
            this.liveState.liveVideo = true;
            this.liveState.countDown = false;
            this.liveConferenceData = resultData.data;
            this.checkLiveFn(resultData);
            break;
          case 33302://此会议室没有正在召开的会议
            this.liveState.noConference = true;
            break;
          case 33306://倒计时页面
            this.isShowConMsg = true;
            this.isCountDown = true;
            this.liveConferenceData = resultData.data;
            this.checkLiveFn(resultData);
            break;
          case 33310://直播结束
            this.liveEndedFn();
            break;
          case 30416://未开启直播
            this.noLiveFn();
            break;
        }
        this.XMPPData.ROOM_JID = resultData.data.vmrNumber + '@conference.127.0.0.1';

      },
      err => {
        console.log(err);
      });
  }


  videoObject: any;
  player: any;
  videoUrlObj: any = {
    'address': '',
    'phoneAddress': ''
  };
  LiveAddressType: any;

  //验证直播数据
  checkLiveFn(data: any) {
    this.videoUrlObj = {
      'address': data.data.address,
      'phoneAddress': data.data.phoneAddress
    };
    if (data.data.setPass && !this.commonService.getCookie('liveId')) {//是否存在直播密码 true存在，false不存在
      this.livePwdModal = true;
    } else {
      this.commonService.deleCookie('liveId');
      if (+data.code === 33306) {
        this.startInterval(this.liveState.startTime);
      } else {
        this.liveState.countDown = false;
        setTimeout(() => {
          this.setVideoPlayer();
          if (this.isLogin) {
            this.loginConnect();
          }
        }, 1000);
      }

    }
  }

  getLiveAddressType() {
    if (this.isPc) {//是否pc
      if (this.browser == 'FF' || this.browser == 'Chrome') {//Chrome,FF
        return this.videoUrlObj.address;
      } else if (this.browser == 'Safari') {//Safari
        return this.videoUrlObj.phoneAddress;
      } else {
        return this.videoUrlObj.address;
      }
    } else {
      return this.videoUrlObj.phoneAddress;
    }
  }

  //加载播放器
  setVideoPlayer() {
    this.LiveAddressType = this.getLiveAddressType();
    this.videoObject = {
      container: '#video',//“#”代表容器的ID，“.”或“”代表容器的class
      variable: 'player',//该属性必需设置，值等于下面的new chplayer()的对象
      // flashplayer: true,//如果强制使用flashplayer则设置成true
      autoplay: true,//自动播放
      debug: true,//开启调试模式
      html5m3u8: true,
      live: true,//直播视频形式
      video: this.getLiveAddressType(), //'rtmp://live.hkstv.hk.lxdns.com/live/hks', //视频地址(rtmp协议/m3u8协议)
      // unescape: true
      crossdomain: 'crossdomain.xml'
    };
    this.player = new ckplayer(this.videoObject);
  }

  //验证输入的直播密码
  livePwdModal: boolean = false;
  livePwd: any = '';

  checkLivePwdFn() {
    if (!this.livePwd) {
      this._notification.create('error', '请输入直播密码', '');
      return false;
    }
    let postData = {'livePwd': this.livePwd};
    this.http.post('/uc/lives/' + this.appointmentId + '/veri', postData).subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == 200) {
          this.livePwdModal = false;
          if (this.isCountDown) {
            this.startInterval(this.liveState.startTime);
          } else {
            this.setVideoPlayer();
            if (this.isLogin) {
              this.loginConnect();
            }
          }
        } else {
          this._notification.create('error', resultData.msg, '');
        }
      },
      err => {
        this.livePwdModal = false;
      });
  }

  //直播结束 弹框
  alertModal: boolean = false;

  liveEndedFn() {
    this.confirmServ.confirm({
      title: '结束',
      content: '当前直播已结束!',
      okText: '确定',
      // cancelText: '取消',
      onOk: async () => {
        // await this.sureDeleteMeetingFn(deleteArr);
      },
      onCancel() {
      }
    });
  }

  noLiveFn() {
    this.confirmServ.confirm({
      title: '提示',
      content: '当前未开启直播!',
      okText: '确定',
      // cancelText: '取消',
      onOk: async () => {
        // await this.sureDeleteMeetingFn(deleteArr);
      },
      onCancel() {
      }
    });
  }


  // 直播未开始 倒计时
  //date(毫秒)
  getCountdown(date: any) {
    var obj = {};
    var current_date = new Date().getTime();
    var seconds_left = (date - current_date) / 1000;

    var days = this.pad(parseInt('' + seconds_left / 86400));
    seconds_left = seconds_left % 86400;

    var hours = this.pad(parseInt('' + seconds_left / 3600));
    seconds_left = seconds_left % 3600;

    var minutes = this.pad(parseInt('' + seconds_left / 60));
    var seconds = this.pad(parseInt('' + seconds_left % 60));
    obj = {
      'days': days,
      'hours': hours,
      'minutes': minutes,
      'seconds': seconds
    };
    return obj;
  }

  pad(n) {
    return (n < 10 ? '0' : '') + n;
  }

  downTimer: any;
  ouptCountDown: any = {
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00'
  };

  startInterval(startTime: any) {
    this.liveState.countDown = true;
    this.downTimer = setInterval(() => {
      if (startTime <= new Date().getTime()) {
        this.liveState.liveVideo = true;
        this.liveState.countDown = false;
        setTimeout(() => {
          this.setVideoPlayer();
          if (this.isLogin) {
            this.loginConnect();
          }
        }, 100);
        clearInterval(this.downTimer);
      }
      this.ouptCountDown = this.getCountdown(startTime);
    }, 1000);
  }

  /***  分享  ***/
  shareAddress: string;
  shareLiveModal: boolean = false;
  liveQrImg: any;

  shareFn() {
    this.shareAddress = this.commonService.getPath() + '#/watch-live/' + this.appointmentId;
    this.liveQrImg = environment.apiBase + '/uc/lives/' + this.appointmentId + '/code';//会议二维码图片初始化
    this.shareLiveModal = true;
  }

  //复制链接
  toClipboardLive() {
    this.shareLiveModal = false;
    this._notification.create('success', '复制成功', '');
  }

  //分享到qq
  sharetoqqzone(title, url, picurl) {
    var shareqqzonestring = 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?summary=' + title + '&url=' + url + '&pics=' + picurl;
    window.open(shareqqzonestring, 'newwindow', 'height=500,width=500,top=100,left=100');
  }

  //分享至
  showWeChatImg: boolean = false;

  shareToFn(type: any) {
    var address = window.location.href;
    if (type == 'weixin') {
      this.showWeChatImg = true;
      this.shareLiveModal = false;
    } else if (type == 'qq') {
      this.sharetoqqzone(
        '会议直播',
        address,
        'http://img.tiantianshangke.com/img/video/1470985253.jpg'
      );
    }
  }

  /********* 直播聊天 *********/
  messageContent: any = [];

  /**************** xmpp连接 开始 ****************/
  XMPPConferencesData: any = {
    xmppUsername: '',
    xmppPassword: '',
    webrtcXmppIp: '',
    xmppServer: ''
  };
  XMPPData: any = {
    reConnectFlag: false,
    // XMPP服务器BOSH地址
    BOSH_SERVICE: '',//this.loginUserData.webrtcXmppIp + '/http-bind/'
    // 房间JID 1085911
    ROOM_JID: '',
    // XMPP连接
    connection: null,
    // 当前状态是否连接
    connected: false,
    // 当前登录的JID
    jid: ''
  };
  i = 0;
  // reConnectFlag = false;
  //是否是被别人踢掉的
  isKicked = false;
  timer = null;

  // 连接状态改变的事件
  onConnect = (status) => {
    if (status == Strophe.Status.CONNFAIL) {
      console.log('连接失败！');
    } else if (status == Strophe.Status.AUTHFAIL) {
      console.log('登录失败！');
    } else if (status == Strophe.Status.DISCONNECTED) {
      console.log('连接断开！');
      this.XMPPData.connected = false;
      if (this.i == 0) {
        this.reConnect();
      }
      this.i++;
    } else if (status == Strophe.Status.CONNECTED) {
      console.log('连接成功，可以开始聊天了！');
      console.log('before', this.XMPPData);
      this.XMPPData.connected = true;
      // 当接收到<message>节，调用onMessage回调函数
      this.XMPPData.connection.addHandler(this.onMessage, null, 'message', null, null, null);
      if (this.XMPPData.reConnectFlag) {
        setTimeout(() => {
          this.XMPPData.connection.addHandler(this.onStream, null, 'stream:error', null, null, null);
        }, 60000);
        // self.getParticipantsFn();
      } else {
        this.XMPPData.connection.addHandler(this.onStream, null, 'stream:error', null, null, null);
      }

      // 首先要发送一个<presence>给服务器（initial presence）
      // this.XMPPData.connection.send($pres().tree());
      this.XMPPData.connection.sendPresence($pres().tree());

      // 发送在线状态
      this.XMPPData.connection.sendPresence($pres({
        from: this.XMPPData.jid,
      }).c('status', '2').tree());

      // 发送<presence>元素，加入房间
      // var pres = $pres({
      //     from: this.XMPPData.jid,
      //     to: this.XMPPData.ROOM_JID,
      // }).c('x',{xmlns: 'http://jabber.org/protocol/muc'}).tree();
      // this.XMPPData.connection.sendPresence($pres);
      this.XMPPData.connection.sendPresence($pres({
        from: this.XMPPData.jid,
        to: this.XMPPData.ROOM_JID + '/' + this.XMPPData.jid.substring(0, this.XMPPData.jid.indexOf('@'))
      }).c('x', {xmlns: 'http://jabber.org/protocol/muc'}).tree());


      this.XMPPData.connection.send($pres().c('priority').t('1'));
      // this.XMPPData.connection.sendIQ(pres);//获取房间列表
      console.log('after', this.XMPPData);
    }
  };

  onStream = (msg) => {
    console.log(msg);
    // self.showGreeting({
    //     "groupId": "",
    //     "msgData": {},
    //     "msgType": 3008
    // });
  };

  // 接收到<message>
  onMessage = (msg) => {
    console.log(msg);
    // 解析出<message>的from、type属性，以及body子元素
    var from = msg.getAttribute('from');
    var type = msg.getAttribute('type');
    var elems = msg.getElementsByTagName('body');

    var elemsSubject = msg.getElementsByTagName('subject');
    if (type == 'groupchat' && elems.length > 0) {
      var body = elems[0];
      var subject = elemsSubject[0];
      if (elemsSubject.length > 0) {
        var subjectArr = subject.innerHTML.split('|');
        var userData = from.substring(from.indexOf('/') + 1);
        var userArr = userData.split('-');
        var chatMsgObj = {
          'userId': userArr[0],
          'realName': userArr[1],
          'msgType': subjectArr[0],
          'roomType': subjectArr[1],
          'content': body.innerHTML
        };
        chatMsgObj['colors'] = 'avatar-color' + Math.ceil(parseInt(userArr[0]) % 10 / 2);
        if(subjectArr[0] == "5000"){
          this.messageContent.push(chatMsgObj);
        }
      }
      var bodyObj = JSON.parse(body.innerHTML);
      if(bodyObj.msgType == 3032){
        this.liveEndModal=true;
      }
    }
    return true;
  };

  //发送消息
  sendMessage = (data, subject) => {
    if (this.XMPPData.connected) {
      var sendMsg = data;
      // 创建一个<message>元素并发送
      var msg = $msg({
        to: this.XMPPData.ROOM_JID,
        from: this.XMPPData.jid,
        type: 'groupchat'
      }).c('body', null, sendMsg).c('subject', null, subject);
      this.XMPPData.connection.send(msg.tree());
    } else {
      console.log('请先登录！');
    }
  };
  //重连
  reConnect = () => {
    this.XMPPData.reConnectFlag = true;
    this.timer = setInterval(() => {
      if (!this.XMPPData.connected) {
        this.loginConnect();
        if (this.XMPPData.connected) {
          console.log('重连成功');
          clearInterval(this.timer);
          this.timer = null;
          return;
        }
      }
    }, 15000);
  };

  // 通过BOSH连接XMPP服务器
  loginConnect = () => {
    if (!this.XMPPData.connected) {
      this.XMPPData.connection = new Strophe.Connection(this.XMPPData.BOSH_SERVICE);
      this.XMPPData.connection.connect(this.XMPPConferencesData.xmppUsername + '@' + this.XMPPConferencesData.xmppServer + '/live', this.XMPPConferencesData.xmppPassword, this.onConnect);
      // this.XMPPData.jid = this.XMPPConferencesData.xmppUsername+"-"+this.loginUserData.realName + '@' + this.XMPPConferencesData.xmppServer;
      this.XMPPData.jid = this.XMPPConferencesData.xmppUsername + '-' + this.loginUserData.realName + '@' + this.XMPPConferencesData.xmppServer;
    } else {
      clearInterval(this.timer);
      this.timer = null;
    }
  };

  // 断开xmpp连接
  disConnectXmpp = () => {
    this.isKicked = true;
    if (this.XMPPData.connected) {
      this.XMPPData.connection.disconnect();
    }
  };


  /******************* xmpp连接 结束 ****************/
  sendMsgCont: string;//发送框输入内容
  keyDownSendMsgFn = (data) => {
    if (this.isLogin) {
      if (data) {
        this.sendMessage(data, '5000|1');
        this.sendMsgCont = '';//输入框设为空
      }
    } else {
      // alert("请先登录")
      // this._notification.create('error', '请先登录','');
      this.confirmServ.confirm({
        title: '提示',
        content: '请先登录，登录后才可以聊天!',
        okText: '登录',
        cancelText: '取消',
        onOk: async () => {
          this.commonService.setCookie('fromWeb', 'live');
          this.commonService.setCookie('liveId', this.appointmentId);
          this.router.navigate(['/login']);
        },
        onCancel() {
        }
      });
    }

  };

  //未登录请求查询直播是否结束
  liveEndModal:boolean = false;
  liveStatusFn(){
    this.http.get('/uc/conferences/' + this.appointmentId + '/live-status').subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == 200 && resultData.data) {
          // 直播结束
          this.liveEndModal=true;
        }
      },
      err => {
        // this.livePwdModal = false;
      });
    }

  //组件卸载的时候取消订阅
  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.disConnectXmpp();
    if (this.downTimer) {
      clearInterval(this.downTimer);
    }
    if(this.endInterval){
      clearInterval(this.endInterval);
    }
  }
}
