import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormControl} from '@angular/forms';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '@services/common.service';
import {AuthService} from '@services/auth.service';
import {NzModalService} from 'ng-zorro-antd';
import {NzNotificationService} from 'ng-zorro-antd';

@Component({
  selector: 'app-change-admin',
  templateUrl: './change-admin.component.html',
  styleUrls: ['./change-admin.component.css']
})
export class ChangeAdminComponent implements OnInit {

  currentPhone: any = '';  //用户手机
  currentPhoneCode: any = ''; //验证码
  isPhone: boolean = false; //判断用户是否绑定了手机  false是未绑定  true是绑定
  stepTwo: boolean = true;  //判断是否显示下一步
  hidden: boolean = false;
  bindPhoneList: any;  //绑定企业账号数据
  searchField: any = ''; //绑定企业账号的手机号
  searchFieldcode: any = ''; //绑定企业账号的手机号 验证码

  public loginUserData = this.commonService.getLoginMsg();
  entId: any = this.loginUserData.entId;
  userId: any = this.loginUserData.userId;

  constructor(private router: Router,
              private fb: FormBuilder,
              private http: HttpClient,
              private commonService: CommonService,
              private confirmServ: NzModalService,
              private _notification: NzNotificationService,
              private authService: AuthService) {
  }

  ngOnInit() {
    this.getUserList(); //获取用户信息
    this.getBindPhoneList();
  }

  /* 获取用户信息 */
  getUserList() {
    this.http.get('/uc/user/' + this.userId).subscribe(
      res => {
        let datalist: any = res;
        if (datalist.code == 200) {
          this.currentPhone = datalist.data.mobilePhone;
          if (this.currentPhone != '') {
            this.isPhone = true;
          }
        }
      },
      err => {
        console.log(err);
      });
  }

  /* 下一步 */
  currentCodeError: any;

  nextStepTwo() {
    // 先清除定时器
    if (this.timer) {
      this.paracont = '获取验证码';
      this.disabledClick = false;
      clearInterval(this.timer);
    }
    let getData = {
      mobile: this.currentPhone,
      verificationCode: this.currentPhoneCode,
      type: 4
    };
    if (!this.currentPhoneCode) {
      this.currentCodeError = '验证码不能为空';
      return false;
    }
    this.http.post('/uc/common/verificationCode/check', getData).subscribe(
      res => {
        let datalist: any = res;
        if (datalist.code == 200) {
          this.stepTwo = false;
          // this._notification.create('success', '验证成功', '');
        } else {
          this._notification.create('error', '验证失败', '');
        }
      },
      err => {
        console.log(err);
      });
  }

  /* 获取已绑定手机的用户（除去当前用户） */
  getBindPhoneList() {
    this.http.get('/uc/user/bind/phone/list').subscribe(
      res => {
        let datalist: any = res;
        if (datalist.code == 200) {
          this.bindPhoneList = datalist.data;
        } else {
          this.bindPhoneList = [];
        }
      },
      err => {
        console.log(err);
      });
  }

  // 获取短信验证码
  searchFieldError: any;

  getPhoneCode(phone: any) {
    // if(this.stepTwo==false) {
    // 		this.currentPhone=this.searchField;
    // 	}
    let getData = {
      mobile: phone,
      type: 4
    };
    if (phone) {
      this.http.post('/uc/common/verificationCode', getData).subscribe(
        res => {
          // console.log(res);
          this.sendMessage();//倒计时
        },
        err => {
          console.log(err);
        });
    } else {
      this.searchFieldError = '手机号不能为空';
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

  /* 选择新的企业管理员账号 */
  // change(item) {
  //   this.searchField = item[0];
  // }
  chooseBox: boolean = false;

  chooseNewPhoneFn(num: any) {
    this.searchField = num;
    this.chooseBox = false;
  }

  /* 保存更换企业管理员 */
  sureUpdateAdminFn() {
    const getData = {
      phoneNumber: this.searchField,
      code: this.searchFieldcode,
      type: 4
    };
    if (!this.searchFieldcode) {
      this.searchFieldError = '验证码不能为空';
      return false;
    }
    const getDataString = this.commonService.formObject(getData);
    this.http.post('/uc/ents/change/' + this.entId + '/admin' + getDataString, '').subscribe(
      res => {
        const datalist: any = res;
        if (+datalist.code === 200) {
          this._notification.create('success', '更换管理员成功', '');
          this.authService.logout(); // 退出登录清除cookies
        } else if (+datalist.code === 10404) {
          this.searchFieldError = '该账号不存在';
          // this._notification.create('error', '该账号不存在', '');
        } else if (+datalist.code === 32616) {
          this.searchFieldError = '该账号未绑定';
          // this._notification.create('error', '该账号未绑定', '');
        } else if (+datalist.code === 32613) {
          this.searchFieldError = '该账号不属于本企业';
          // this._notification.create('error', '该账号不属于本企业', '');
        } else {
          this._notification.create('error', '更换失败', '');
        }
      },
      err => {
        console.log(err);
      });
  }

}
