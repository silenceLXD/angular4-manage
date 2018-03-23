import {Component, OnInit, OnDestroy} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '@services/common.service';
import * as $ from 'jquery';
import {Strophe} from 'strophe.js';

// import * as Strophe from '../../../assets/js/widgets/strophe.js';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.css']
})
export class PageComponent implements OnInit, OnDestroy {
  public loginUserData = this.commonService.getLoginMsg();
  xmppPassword = this.loginUserData.xmppPassword;
  xmppServer = this.loginUserData.xmppServer;
  xmppUsername = this.loginUserData.xmppUsername;
  webrtcXmppIp = this.loginUserData.webrtcXmppIp;
  ENTID = this.loginUserData.entId;
  roleId = this.loginUserData.roleType;

  switchPageFlag: number;

  constructor(private http: HttpClient, private commonService: CommonService) {
    if (this.commonService.getCookie('localStorage_uc_loginData')) {
      // const resData = JSON.parse(this.commonService.getCookie('localStorage_uc_loginData'));
      /****localStorage 存信息****/
      localStorage.setItem('uc_access_token', this.loginUserData.access_token); // 请求token
      localStorage.setItem('uc_expires_in', this.loginUserData.expires_in); // token有效期
      localStorage.setItem('uc_token_type', this.loginUserData.token_type); // token类型
      localStorage.setItem('uc_refresh_token', this.loginUserData.refresh_token); // 刷新token
      if (+this.loginUserData.roleType === 1 || +this.loginUserData.roleType === 2) {
        localStorage.setItem('switchflag', '0');
      } else if (+this.loginUserData.roleType === 3) {
        localStorage.setItem('switchflag', '1');
      } else {
        localStorage.setItem('switchflag', '2');
      }

      // localStorage.setItem('uc_loginData', JSON.stringify(this.loginUserData)); // 登录返回信息
      /****localStorage 存信息****/
    }

    commonService.changeFlag.subscribe((value: number) => {
      this.switchPageFlag = value;
    });
  }

  ngOnInit() {
    this.loginConnect();
    this.getEntServiceFn();
   /* this.commonService.setServiceAlertTipBool.subscribe(bool => {
      this.ServiceAlertTip = bool;
    });*/
    this.commonService.setServiceSecondsChange.subscribe(num => {
      this.getEntServiceFn();
    });
  }

  //被叫入会 modal
  CallModal: boolean = false;//模态框
  modalTimer: any;//定时器 1分钟后关闭
  roomNum: any;
  hostPin: any;
  conferenceName: any;
  webRTCPath: any;

  /**************** xmpp连接 开始 ****************/
  XMPPData: any = {
    conferences: {
      xmppUsername: this.xmppUsername,
      xmppPassword: this.xmppPassword,
      webrtcXmppIp: this.webrtcXmppIp,
      xmppServer: this.xmppServer
    },
    reConnectFlag: false,
    // XMPP服务器BOSH地址
    BOSH_SERVICE: this.webrtcXmppIp + '/http-bind/',
    // 房间JID 1085911
    ROOM_JID: '',
    // XMPP连接
    connection: null,
    // 当前状态是否连接
    connected: false,
    // 当前登录的JID
    jid: this.xmppUsername + '@' + this.xmppServer
  };
  i = 0;
  // reConnectFlag = false;
  //是否是被别人踢掉的
  isKicked = false;
  timer = null;

  // 连接状态改变的事件
  onConnect = (status) => {
    console.log(status)
    if (status == Strophe.Status.CONNFAIL) {
      console.log('连接失败！');
    } else if (status == Strophe.Status.AUTHFAIL) {
      console.log('登录失败！');
    } else if (status == Strophe.Status.DISCONNECTED) {
      console.log('连接断开！');
      this.XMPPData.connected = false;
      if (this.i == 0 && !this.isKicked) {
        this.reConnect();
      }
      this.i++;
    } else if (status == Strophe.Status.CONNECTED) {
      console.log('连接成功，可以开始聊天了！');
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
        // to: this.XMPPData.ROOM_JID + "/" + this.XMPPData.jid.substring(0,this.XMPPData.jid.indexOf("@"))
      }).c('status', '2').tree());

      // 发送<presence>元素，加入房间
      // var pres = $pres({
      //     from: this.XMPPData.jid,
      //     to: this.XMPPData.ROOM_JID + "/" + this.XMPPData.jid.substring(0,this.XMPPData.jid.indexOf("@"))
      // }).c('x',{xmlns: 'http://jabber.org/protocol/muc'}).tree();
      // this.XMPPData.connection.send($pres);
      this.XMPPData.connection.send($pres().c('priority').t('1'));
      // this.XMPPData.connection.sendIQ(pres);//获取房间列表
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

    if (type == 'groupchat' && elems.length > 0) {
      var body = elems[0];
    } else if (type == 'chat') {
      var body = elems[0];
      var msg = JSON.parse(body.innerHTML);
      if (msg.msgType == 3023) {
        this.CallModal = true;
        this.roomNum = msg.msgData.roomNumber;
        this.hostPin = msg.msgData.password;
        this.conferenceName = msg.msgData.conferenceName;
        this.webRTCPath = '?conference=' + this.roomNum + '&pin=' + this.hostPin;

        this.modalTimer = setTimeout(() => {
          this.CallModal = false;
        }, 36000);
      }
    }
    return true;
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
      this.XMPPData.connection.connect(this.XMPPData.conferences.xmppUsername + '@' + this.XMPPData.conferences.xmppServer + '/uc', this.XMPPData.conferences.xmppPassword, this.onConnect);
      this.XMPPData.jid = this.XMPPData.conferences.xmppUsername + '@' + this.XMPPData.conferences.xmppServer;
    } else {
      clearInterval(this.timer);
      this.timer = null;
    }
  };
  // 断开xmpp连接
  disConnectXmpp = () => {
    this.isKicked = true;
	  this.XMPPData.connection.disconnect();
  }

  /******************* xmpp连接 结束 ****************/


    // 查询企业服务状态
  entServiceAlert: string = '';
  ServiceAlertTip: boolean = false;

  getEntServiceFn() {
    if (this.ENTID) {
      return this.http.get('/uc/baseresource/resource/ent/' + this.ENTID).subscribe(
        res => {
          const resultData: any = res;
          if (+resultData.code === 200) {
            if (+localStorage.accountStatus === 4 && +this.commonService.getLoginMsg().roleType === 3) {
              this.ServiceAlertTip = true;
              this.entServiceAlert = '企业已冻结！如有疑问，请拨打电话：010-5873 4583';
            }
            localStorage.setEntServiceData = resultData.data;
            this.commonService.entServiceData.emit(resultData.data);
            if (+resultData.data === 0) { // 正常
              this.entServiceAlert = '';
              this.ServiceAlertTip = false;
            } else if (+resultData.data === 2) { // 已购买,已支付,服务到期
              this.ServiceAlertTip = true;
              this.entServiceAlert = +this.roleId === 3 ? '服务已到期，请联系企业管理员！' : '服务已到期，请购买！';
            } else if (+resultData.data === 3) { // 已购买,待支付
              this.ServiceAlertTip = true;
              this.entServiceAlert = +this.roleId === 3 ? '' : '订单未支付，请点击订单管理进行支付！';
            } else if (+resultData.data === 4) { // 已购买,已支付,待开通
              this.ServiceAlertTip = true;
              this.entServiceAlert = +this.roleId === 3 ? '' : '服务已购买，请等待服务开通！';
            } else if (+resultData.data === 5) { // 未购买
              this.ServiceAlertTip = true;
              this.entServiceAlert = +this.roleId === 3 ? '' : '未购买服务，请购买！';
            } else if (+resultData.data === 6) { // 终止服务
              this.ServiceAlertTip = true;
              this.entServiceAlert = +this.roleId === 3 ? '' : '服务已到期，请购买！';
            }
          }
        }, err => {
          console.log(err);
        });
    }
  }

  // 冻结用户的提示信息
  emitAccountStatus() {
    this.ServiceAlertTip = true;
    this.entServiceAlert = '企业已冻结！如有疑问，请拨打电话：010-5873 4583';
  }

  // 同意入会
  acceptCallFn() {
    this.CallModal = false;
  }

  // 销毁组件时清除定时器
  ngOnDestroy() {
    this.disConnectXmpp();//断开xmpp
    if (this.modalTimer) {
      clearTimeout(this.modalTimer);
    }
  }


}
