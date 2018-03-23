import {Component, OnInit, EventEmitter, Output} from '@angular/core';
import {CommonService} from '@services/common.service';
import {CustomizeService} from '@services/customize.service';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {NzModalService} from 'ng-zorro-antd';
import {NzNotificationService} from 'ng-zorro-antd';
import {environment} from '../../../../environments/environment';
import {SettingService} from '@services/setting.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  public loginUserData = this.commonService.getLoginMsg();
  nickName = this.commonService.decodeUTF8(this.commonService.getCookie('nickName'));
  // public loginUserData = JSON.parse(localStorage.getItem('uc_loginData'));
  settingData: any;
  entId: any = this.loginUserData.entId;
  roleType: any = this.loginUserData.roleType;

  bgColor: any = '';
  entShowName: any = ''; // 企業名
  slogan: any = '';   // 企業標語
  logURL: any = '';
  dataBaseType: any;
  switchflag: number;

  msgUnreadCount: any; // 未读消息数
  // 获取消息总数和未读总数
  msgCountSearch: any = { // 查询条件数据
    isReadActivityMessage: '', // 是否读取群发消息（1是 管理员,0否 用户）
    isRead: '',
    createTime: '' // 登录人创建时间
  };

  @Output() emitAccountStatus: EventEmitter<any> = new EventEmitter();

  constructor(private router: Router,
              private commonService: CommonService,
              private http: HttpClient,
              private confirmServ: NzModalService,
              private _notification: NzNotificationService,
              private customizeService: CustomizeService,
              private settingService: SettingService) {
    // this.commonService.changeFlag.emit(this.switchflag);
    customizeService.templateType.subscribe((value: number) => {
      if (value == 0) {
        this.bgColor = 'navbarHeaderBlack';
      } else if (value == 1) {
        this.bgColor = 'navbarHeaderTechBlur';
      } else if (value == 2) {
        this.bgColor = 'navbarHeaderBlur';
      } else if (value == 3) {
        this.bgColor = 'navbarHeaderDark';
      } else if (value == 4) {
        this.bgColor = 'navbarHeaderGreen';
      }
    });

    customizeService.entShowName.subscribe((value: string) => {
      this.entShowName = value;
    });
    customizeService.slogan.subscribe((value: string) => {
      this.slogan = value;
    });
    customizeService.logURL.subscribe((value: string) => {
      this.logURL = value;
    });
  }

  // 入会设置数据
  setting: any = {
    nonEnt: false,
    nonRegistered: false,
  };

  ngOnInit() {
    this.getCurrentThemeColor();
    if (this.loginUserData.roleType == 1 || this.loginUserData.roleType == 2) {
      this.switchflag = 0;
    } else {
      this.switchflag = 1;
    }
    this.commonService.changeFlag.emit(this.switchflag);
    this.settingData = this.settingService.vcsSetting;
    // this.bgColor = this.settingData.VCS_THEME_COLOR;

    // this.roleType = this.loginUserData.roleType;
    // this.getCurrentThemeColor();
    this.getEntDataFn();
    this.commonService.editRealNameFn.subscribe(value => {
      this.loginUserData.realName = value;
    });
    this.commonService.msgCountFn.subscribe(value => {
      this.msgUnreadCount = value;
    });
    // this.getMsgCount();
  }

  // 获取消息总数和已读数
  getMsgCount() {
    this.msgCountSearch.isReadActivityMessage = this.roleType;
    if (+this.msgCountSearch.isReadActivityMessage === 1) {
      this.msgCountSearch.createTime = localStorage.accountcreateTime;
    } else {
      this.msgCountSearch.createTime = '0';
    }
    const getData = this.commonService.formObject(this.msgCountSearch);
    this.http.get('/uc/message/count' + getData).subscribe(
      res => {
        const resultData: any = res;
        this.msgUnreadCount = resultData.data.allCount - resultData.data.readCount;
      },
      err => {
        console.log(err);
      });
  }

  /* 调用服务获取主题颜色 */
  // getServe() {
  //   let isTab: any = this.customizeService.getCurrentThemeColor(this.entId);
  // }
  getCurrentThemeColor() {
    if (this.roleType == 8) {
      this.bgColor = 'navbarHeaderBlack';
      this.customizeService.templateType.emit(0);
      this.customizeService.entShowName.emit('');
      this.customizeService.slogan.emit('');
      this.customizeService.logURL.emit('assets/img/logo_white.png');
    } else {
      this.http.get('/uc/ents/customize/' + this.entId).subscribe(
        res => {
          // console.log(res);
          let datalist: any = res;
          if (datalist.code == 200) {
            let type = datalist.data.ent.templateType;
            this.dataBaseType = type;
            // let type = datalist.data.templateType;
            if (type == 0) {
              this.bgColor = 'navbarHeaderBlack';
            } else if (type == 1) {
              this.bgColor = 'navbarHeaderTechBlur';
            } else if (type == 2) {
              this.bgColor = 'navbarHeaderBlur';
            } else if (type == 3) {
              this.bgColor = 'navbarHeaderDark';
            } else if (type == 4) {
              this.bgColor = 'navbarHeaderGreen';
            }
            this.customizeService.templateType.emit(type);
            this.customizeService.entShowName.emit(datalist.data.ent.entShowName);
            this.customizeService.slogan.emit(datalist.data.ent.slogan);
          }
        },
        err => {
          console.log(err);
        }
      );
    }

  }

  // 根据企业ID查询企业信息
  isShowProduct: boolean = false;
  entData: any = {
    entName: ''
  };

  getEntDataFn() {
    if (this.entId != undefined) {
      this.http.get('/uc/ents/' + this.entId).subscribe(
        res => {
          // console.log(res);//打印返回的数据
          const datalist: any = res;
          if (+datalist.code === 200) {
            localStorage.accountStatus = datalist.data.accountState;
            localStorage.accountcreateTime = datalist.data.createTime;
            // this.commonService.getLoginMsg().roleType;
            localStorage.accountcreateTime = datalist.data.createTime;
            this.getMsgCount();
            if (+localStorage.accountStatus === 4 && +this.commonService.getLoginMsg().roleType === 3) {
              this.emitAccountStatus.emit();
            }
            this.isShowProduct = datalist.data.isShow;
            this.entData = datalist.data;
            if (datalist.data.logoUrl) {
              this.customizeService.logURL.emit(environment.apiBase + '/uc/ents/logo/logoUrl?logoUrl=' + datalist.data.logoUrl);
            } else {
              this.customizeService.logURL.emit('assets/img/logo_white.png');
            }

            if (datalist.data.conferenceSetting == 0) {
              this.setting.nonEnt = false;
              this.setting.nonRegistered = false;
            } else if (datalist.data.conferenceSetting == 1) {
              this.setting.nonEnt = true;
              this.setting.nonRegistered = false;
            } else if (datalist.data.conferenceSetting == 2) {
              this.setting.nonEnt = false;
              this.setting.nonRegistered = true;
            } else if (datalist.data.conferenceSetting == 3) {
              this.setting.nonEnt = true;
              this.setting.nonRegistered = true;
            }
          }
        },
        err => {
          console.log(err);
        });
    }

  }

  /************** 切换控制台 ************/
  changeFlagFn() {
    if (this.switchflag == 0) {
      this.switchflag = 1;
      localStorage.setItem('switchflag', '1');
    } else {
      this.switchflag = 0;
      localStorage.setItem('switchflag', '0');
    }
    this.commonService.changeFlag.emit(this.switchflag);

  }

  /************** 总览页 ************/
  //查看当前身份的
  overviewFn() {
    this.commonService.changeFlag.emit(this.switchflag);
  }

  /************** 入会设置 ************/
  meetingSettingModal: boolean = false;

  meetingSettingFn() {
    this.meetingSettingModal = true;
  }

  //确定入会设置
  sureSettingFn() {
    let type: any;
    if (this.setting.nonEnt && this.setting.nonRegistered) {
      type = 3;
    } else if (this.setting.nonEnt) {
      type = 1;
    } else if (this.setting.nonRegistered) {
      type = 2;
    } else if (!this.setting.nonEnt && !this.setting.nonRegistered) {
      type = 0;
    }
    let getData = {
      'conferenceSetting': type
    };
    return this.http.patch('/uc/ents/' + this.entId + '/conferences/setting', getData).subscribe(
      res => {
        let datalist: any = res;
        if (datalist.code == 200) {
          this.meetingSettingModal = false;
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  /************** 退出登录 ************/
  logoutModal: boolean = false;
  logoutFn = () => {
    this.confirmServ.confirm({
      title: '退出',
      content: '是否确认退出登录！',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        await this.sureLogoutFn();
      },
      onCancel() {
      }
    });
  };

  //确定退出登录logout
  sureLogoutFn() {
    /* this.router.navigateByUrl('login');//跳回登录
     localStorage.clear();//清除
     this.commonService.deleAllCookie();//清除cookies*/
    this.http.post('/uc/logout', '').subscribe(
      res => {
        let resData: any = res;
        if (resData.code == 200) {
          this.commonService.deleAllCookie();//清除cookies
          this.router.navigateByUrl('login');//跳回登录
          localStorage.clear();//清除localStorage
        }
      },
      err => {
        console.log(err);
      });
  }
}
