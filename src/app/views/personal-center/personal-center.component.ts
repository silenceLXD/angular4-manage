import {AfterViewInit, Component, OnInit, TemplateRef} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {CommonService} from '@services/common.service';
import {environment} from '../../../environments/environment';
import {NzModalService} from 'ng-zorro-antd';
import {NzNotificationService} from 'ng-zorro-antd';

@Component({
  selector: 'app-personal-center',
  templateUrl: './personal-center.component.html',
  styleUrls: ['./personal-center.component.css']
})
export class PersonalCenterComponent implements OnInit, AfterViewInit {

  // entUser: boolean = true;  //企业用户信息 true 显示
  private timestamp: number;//生成图片验证码时的时间戳
  public captchaUrl = environment.apiBase + '/uc/captcha';//验证码图片初始化
  roleType: any;
  msgBindWeChatError: any;

  //测试数据
  personalData: any = {
    'user': {
      'activateStatus': 1,
      'apiUserId': '',
      'createTime': '',
      'deleteFlag': 0,
      'deptId': 0,
      'email': '',
      'isBinding': 0,
      'isBlocked': false,
      'mobilePhone': '',
      'orgId': 0,
      'company': '',
      'password': '',
      'realName': '',
      'roleId': 0,
      'subdeptId': 0,
      'threedeptId': 0,
      'userId': '',
      'userType': 0,
      'verifyNumber': '',
      'deptName': '',
      'subdeptName': '',
      'threedeptName': '',
      'empno': ''
    },
    'sipList': {
      'assignedTime': '',
      'assigneeUserId': '',
      'assignorUserId': '',
      'entId': '',
      'entName': '',
      'isFrozen': 0, 'isRecovered': 0, 'sipDomain': '',
      'sipNumber': 0, 'sipPassword': '', 'sipServer': ''
    }
  };

  constructor(private router: Router, private http: HttpClient, private commonService: CommonService, private confirmServ: NzModalService, private _notification: NzNotificationService) {
  }

  public loginUserData = this.commonService.getLoginMsg();
  userId: any = this.loginUserData.userId;

  ngOnInit() {
    this.roleType = this.loginUserData.roleType;
    this.getUserList();
    this.changeImg();
    this.msgBindWeChatError = this.decodeUTF8(this.commonService.getCookie('bindWeChatError'));
    if (this.msgBindWeChatError) {
      this._notification.create('error', this.msgBindWeChatError, '');
      this.commonService.deleCookie('bindWeChatError');
    }
  }

  ngAfterViewInit() {

  }

  // 解码utf8
  decodeUTF8(str) {
    return str.replace(/(\\u)(\w{4}|\w{2})/gi, function ($0, $1, $2) {
      return String.fromCharCode(parseInt($2, 16));
    });
  }

  //获取个人信息
  getUserList() {
    this.http.get('/uc/user/' + this.userId).subscribe(
      res => {
        let datalist: any = res;
        if (datalist.code == 200) {
          this.personalData.user.realName = datalist.data.realName; // 姓名
          this.personalData.user.company = datalist.data.company; // 公司单位
          this.personalData.user.empno = datalist.data.empno; //工号
          this.personalData.user.position = datalist.data.position; //职务
          this.personalData.user.email = datalist.data.email; // 邮箱
          this.personalData.user.mobilePhone = datalist.data.mobilePhone;  //手机号
          this.personalData.sipList.sipNumber = datalist.data.sipNumber; // sip账号
          this.personalData.sipList.sipPassword = datalist.data.sipPassword; //sip密码
          this.personalData.user.userType = datalist.data.userType;  // 判断是否个人还是会议室
          this.personalData.user.deptName = datalist.data.deptName;
          this.personalData.user.subdeptName = datalist.data.subdeptName;
          this.personalData.user.threedeptName = datalist.data.threedeptName;
          this.personalData.user.orgId = datalist.data.orgId;
          this.personalData.user.isBindWechat = datalist.data.isBindWechat;

        }
      },
      err => {
        console.log(err);
      }
    );
  }

  //修改姓名
  updateNameModal: boolean = false;
  updateRealName: any = '';  //修改姓名
  updateNameFn(name: any) {
    this.updateRealName = name;
    this.updateNameModal = true;
  }

  // 确定修改姓名
  saveEditRealName() {
    let getData = {
      realName: this.updateRealName,
      userId: this.userId
    };
    this.http.post('/uc/user/name', getData).subscribe(
      res => {
        let datalist: any = res;
        if (datalist.code == 200) {
          this.updateNameModal = false;
          this.getUserList();
          this._notification.create('success', '修改成功', '');
          this.loginUserData.realName = this.updateRealName;
          this.commonService.editRealNameFn.next(this.updateRealName);
          localStorage.setItem('uc_loginData', JSON.stringify(this.loginUserData));//重新设置本地存储
        } else {
          this._notification.create('error', '修改失败', '');
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  // 修改手机号
  updateNumberIphoneModal: boolean = false;

  updateNumberIphoneFn() {
    this.updateNumberIphoneModal = true;
  }

  // 获取短信验证码
  messCodeError: any;

  getPhoneCode() {
    let getData = {
      mobile: this.oldPhone ? this.oldPhone : this.personalData.user.mobilePhone,
      type: 4
    };
    if (getData.mobile) {
      this.sendMessage();//倒计时
      this.http.post('/uc/common/verificationCode', getData).subscribe(
        res => {
          let resData: any = res;
          if (resData.code != 200) {
            this.messCodeError = resData.msg;
          }
        },
        err => {
          console.log(err);
        });
    } else {
      this.messCodeError = '手机号不能为空';
    }

  }

  /*
    获取验证码 倒计时定时器
  */
  private timer;
  private paracont: string = '获取验证码';
  private disabledClick: boolean = false;

  sendMessage() {
    let second = 60;
    this.timer = setInterval(() => {
      this.disabledClick = true;
      if (second <= 0) {
        clearInterval(this.timer);
        second = 60;
      } else {
        second--;
        this.paracont = second + '秒后可重发';
        if (second == 0) {
          this.paracont = '获取验证码';
          this.disabledClick = false;
        }
      }
    }, 1000, 60);
  }

  // 销毁组件时清除定时器
  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  // 切换验证码
  oImgSrc: string;

  changeImg() {
    this.timestamp = (new Date()).valueOf();
    this.oImgSrc = this.captchaUrl + '/' + this.timestamp;
  }

  // 绑定修改手机号
  oldPhone: any = ''; //新手机号
  isUpdatePhone: boolean = false; //true为 绑定新手机号
  phoneCode: any = '';  //手机号验证码
  imgCode: any = ''; //图片验证码
  relievePhone() {
    if (!this.isUpdatePhone) {
      // 校验手机号验证码
      let getData = {
        picCode: this.phoneCode,
        msgCode: this.imgCode,
        randomStr: this.timestamp
      };
      this.http.post('/uc/user/bind/phone/' + this.personalData.user.mobilePhone + '/1', getData).subscribe(
        res => {
          let datalist: any = res;
          if (datalist.code == 200) {
            // 验证成功 改为true
            this.isUpdatePhone = true;
            this.phoneCode = '';
            this.imgCode = '';
          }
        },
        err => {
          console.log(err);
        }
      );
    } else {
      // 绑定新手机号
      let getData = {
        picCode: this.phoneCode,
        msgCode: this.imgCode,
        randomStr: this.timestamp
      };
      this.http.post('/uc/user/bind/phone/' + this.oldPhone + '/2', getData).subscribe(
        res => {
          let datalist: any = res;
          if (datalist.code == 200) {
            this.isUpdatePhone = false;
            this.updateNumberIphoneModal = false;
            this.phoneCode = '';
            this.imgCode = '';

            this.getUserList();
            this._notification.create('success', '绑定成功', '');
          } else {
            this._notification.create('error', '绑定失败', '');
          }
        },
        err => {
          console.log(err);
        }
      );
    }
    clearInterval(this.timer);
    this.paracont = '获取验证码';
  }

  //退出企业
  deleteModal: boolean = false;
  // quitEntModal: boolean = false;
  quitEntFn = () => {
    if (+this.roleType === 1) { // routerLink="/page/change-admin"
      this.router.navigate(['/page/change-admin']);
    } else {
      this.confirmServ.confirm({
        title: '退出',
        content: '退出企业后，当前账号更改为个人用户账号，是否确认退出？',
        okText: '确定',
        cancelText: '取消',
        onOk: async () => {
          await this.saveQuitEntFn();
        },
        onCancel() {
        }
      });
    }
  };

  // 确定退出
  saveQuitEntFn() {
    this.http.post('/uc/user/quit/' + this.userId, '').subscribe(
      res => {
        let datalist: any = res;
        if (+datalist.code === 200) {
          // this.quitEntModal = false
          this.getUserList();
          this._notification.create('success', '退出成功', '');
          this.router.navigateByUrl('login');//跳回登录
          localStorage.clear();//清除
        } else {
          this._notification.create('error', '退出失败', '');
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  //绑定微信
  bindWeChatModal: boolean = false;

  bindWeChatFn() {
    this.bindWeChatModal = true;
    this.http.get('/uc/wechat/wxBind/config').subscribe(
      res => {
        const resData: any = res;
        const wxLoginData: any = {
          id: 'login_container',
          appid: resData.data.appId,
          scope: resData.data.scope,
          redirect_uri: encodeURIComponent(resData.data.redirectUri),
          state: resData.data.state,
          style: 'black',
          href: ''
        };
        this.WxLogin(wxLoginData);
      },
      err => {
        console.log(err);
      });
  }

  WxLogin(a: any) {
    let c = 'default';
    a.self_redirect === !0 ? c = 'true' : a.self_redirect === !1 && (c = 'false');
    let d = document.createElement('iframe'),
      e = 'https://open.weixin.qq.com/connect/qrconnect?appid=' + a.appid + '&scope=' + a.scope + '&redirect_uri=' + a.redirect_uri + '&state=' + a.state + '&login_type=jssdk&self_redirect=' + c;
    e += a.style ? '&style=' + a.style : '', e += a.href ? '&href=' + a.href : '', d.src = e, d.frameBorder = '0', d.scrolling = 'no', d.width = '300px', d.height = '400px';
    let f = document.getElementById(a.id);
    f.innerHTML = '', f.appendChild(d);
  }

  //修改登录密码
  PassWord: any = {
    oldPassword: '',
    newPassword: '',
    repeatPassword: '',
    userId: this.userId
  };
  psdErrorMsg: string = '';
  userPsdModal: boolean = false;

  updatePsdFn() {
    this.userPsdModal = true;
  }

  // 确定修改登录密码
  saveEditPw() {
    this.http.post('/uc/user/password', this.PassWord).subscribe(
      res => {
        let datalist: any = res;
        if (datalist.code == 200) {
          this.userPsdModal = false;
          this._notification.create('success', '修改成功', '');
        } else if (datalist.code == 32601) {
          this._notification.create('error', '原密码错误', '');
        } else {
          // this.userPsdModal = false;
          // this._notification.create('error', '修改失败', '');
          this.psdErrorMsg = datalist.msg;
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  //修改sip密码
  SipPassWord: any = {
    oldPwd: '',  //当前密码
    newPwd: '',  //新密码
    verifyPwd: '', //重复新密码
    sipNumber: 0
  };
  SIPpsdModal: boolean = false;

  updateSipPsdFn() {
    this.SIPpsdModal = true;
  }

  // 确定修改Sip密码
  saveEditSIP() {
    this.SipPassWord.sipNumber = this.personalData.sipList.sipNumber;
    this.http.post('/uc/user/sip/password', this.SipPassWord).subscribe(
      res => {
        let datalist: any = res;
        if (datalist.code == 200) {
          this.SIPpsdModal = false;
          this.getUserList();
          this._notification.create('success', '修改成功', '');
        } else {
          this.SIPpsdModal = false;
          this._notification.create('success', '修改失败', '');
        }
      },
      err => {
        console.log(err);
      }
    );
  }

}
