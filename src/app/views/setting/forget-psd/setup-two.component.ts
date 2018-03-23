import {Component, OnInit, OnDestroy, EventEmitter, Output, Input, AfterViewInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import * as $ from 'jquery';

@Component({
  selector: 'setup-two',
  template: `
    <!-- 手机账号验证方式 -->
    <div class="" *ngIf="inputParentData.type=='phone'">
      <h4 class="setup-title"><span class="setup-icon setup-phone-icon"></span> 重置密码</h4>
      <form class="form-horizontal" name="setupTwoForm">
        <div class="form-group">
          <p class="text-center" style="font-size:14px;">手机号验证 {{inputParentData.account | substringStar}}</p>
          <input type="hidden" name="phone" [value]="inputParentData.account">
        </div>
        <div class="form-group">
          <div class="col-xs-12 msg-code">
            <input type="text" class="form-control input-radius" name="msgCode" (ngModelChange)="bindDataInput()"
                   [(ngModel)]="msgCode" value="" maxlength="6" placeholder="请输入验证码">
            <timer-button class="get-msg-code" [sendType]="2" [phoneNum]="inputParentData.account"></timer-button>
            <p class="error">{{ errorMsg}}</p>
          </div>
        </div>
        <div class="form-group">
          <div class="col-xs-12">
            <a href="javascript:;" class="btn btn-svoc setup-btn" (click)="toNextStep()">下一步</a>
          </div>
        </div>
      </form>
    </div>
    <!-- 邮箱账号验证方式 -->
    <div class="" *ngIf="inputParentData.type=='email'">
      <h4 class="setup-title"><span class="setup-icon setup-email-icon"></span> 重置密码</h4>
      <form class="form-horizontal" name="setupTwoForm">
        <div class="form-group">
          <p class="" style="font-size:14px;width:600px;">邮件已发送到<span
            style="font-size:16px;">{{inputParentData.account | substringStar:'email'}}</span>，点击链接重置密码。</p>
          <input type="hidden" name="useremail" value="">
        </div>
        <div class="form-group">
          <div class="col-xs-12">
            <button type="submit" name="button" class="btn btn-svoc setup-btn" (click)="loginEmail()">立即登录邮箱</button>
          </div>
        </div>
        <p style="margin-bottom: 30px;color:#bbb;" class="text-center">如果还没收到邮件或邮件已失效，请再次<a routerLink="/forget">申请重置密码</a></p>
      </form>
    </div>
  `,
  styleUrls: ['./forget-psd.component.css']
})
export class SetupTwoComponent implements OnInit, OnDestroy, AfterViewInit {

  errorMsg = ''; // 接口成功 code不为200时的错误提示
  constructor(private http: HttpClient) {
  }

  @Output() outPutSetupTwoData: EventEmitter<any> = new EventEmitter();//子传父
  @Input() inputParentData: any;//父传子  获取来自父组件的数据

  ngOnInit() {
    // this.getSliderdate.emit(this.purchasetime);
    // console.log(this.inputParentData)
  }

  private msgCode: string;//密码

  // 验证码输入
  bindDataInput() {
    this.errorMsg = '';
  }

  // 手机号 下一步操作
  toNextStep() {
    let postData = {mobile: this.inputParentData.account, type: '2', verificationCode: this.msgCode};
    this.http.post('/uc/user/phone/valadation/identity', postData).subscribe(
      res => {
        let resData: any = res;
        if (resData.code == 200) {
          this.outPutSetupTwoData.emit(this.inputParentData);
        } else {
          this.errorMsg = resData.msg;
        }
      },
      err => {
        console.log(err);
      });
  }

  // 邮箱 下一步操作
  loginEmail() {
    let email = this.inputParentData.account;
    /* 截取@后面.前面的所有数据 */
    let index = email.lastIndexOf('@');
    email = email.substring(index + 1, email.length);
    let dotIndex = email.indexOf('.');
    email = email.substring(0, dotIndex);
    // 跳转到对应邮箱网站
    window.open('http://mail.' + email + '.com/', '_blank');

  }


  /************************* 分割线 ************************/

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

  ngAfterViewInit() {

  }

  // 销毁组件时清除定时器
  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

}
