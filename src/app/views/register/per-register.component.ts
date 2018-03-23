import {Component, OnInit, OnDestroy} from '@angular/core';
import {FormGroup, FormBuilder, Validators, FormControl} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {AuthService} from '@services/auth.service';
import {CommonService} from '@services/common.service';

@Component({
  selector: 'per-register',
  template: `
    <form novalidate class="form-horizontal flip in" role="form" [formGroup]="perRegisterForm"
          (ngSubmit)="postFormData(perRegisterForm.value)">
      <div class="form-group">
        <i class="fa fa-user" aria-hidden="true"></i>
        <input type="text" formControlName="realName" class="form-control" placeholder="请输入姓名" required maxlength="30">
        <p *ngIf="isusernameOK" class="fa fa-check faisok" aria-hidden="true"></p>
        <p class="error" *ngIf="perUserName" style="padding-left:20px;"><span class='alert-icon validtip-icon'></span></p>
      </div>
      <div class="form-group pw-group">
        <i class="fa fa-lock" aria-hidden="true"></i>
        <input type="password" formControlName="password" class="form-control" placeholder="请输入密码" minlength="6" maxlength="20" required>
        <p *ngIf="ispwdOK" class="fa fa-check faisok" aria-hidden="true"></p>
        <p *ngIf="ispwdclose" class="fa fa-close faisclose" aria-hidden="true"></p>
      </div>

      <div class="form-group">
        <i class="fa fa-mobile" aria-hidden="true" style="font-size:18px;"></i>
        <input type="text" formControlName="mobile" [(ngModel)]="mobile" class="form-control" (blur)="checkPhoneFn(mobile)" maxlength="11"
               placeholder="请输入11位手机号码" required>
        <p *ngIf="checkPhoneMsg.isCan" class="fa fa-check faisok"></p>
        <p class="error" style="margin-left:30px;" *ngIf="!checkPhoneMsg.isCan">{{checkPhoneMsg.msg}}</p>
        <p class="error" *ngIf="mobilePhoneMsg"><span class='alert-icon validtip-icon'></span><span>该手机号码已被注册，请更换手机号码</span></p>
        <p class="w5c-error" *ngIf="emptyPhoneMsg">手机号码不能为空</p>
      </div>

      <div class="form-group">
        <div class="col-md-8 col-xs-9" style="padding: 0;">
          <i class="fa fa-key" aria-hidden="true" style="left:20px;"></i>
          <input type="text" id="msgCode" formControlName="verificationCode" class="form-control" maxlength="6" placeholder="请输入验证码"
                 [(ngModel)]="msgCode" required="">
          <p class="error"><span>{{errorMsg}}</span></p>
        </div>
        <div class="col-md-4 col-xs-3">
          <timer-button class="getCode" [sendType]="3" [phoneNum]="mobile"></timer-button>
        </div>
      </div>
      <div class="form-group">
        <label for="agreed" style="color:#fff;">
          <input type="checkbox" id="agreed" formControlName="agreed" [(ngModel)]="isagreed" required
                 style="height: auto;margin-right: 8px;vertical-align: text-bottom;">
          同意并遵守<a routerLink="/terms-service" target="_blank">《云起云服务条款》</a>
        </label>
        <span *ngIf="!isagreed" style="padding-left: 20px;color: #f00;display: block;"> 请阅读并同意服务条款</span>
      </div>
      <div class="form-group">
        <button type="submit" [disabled]="perRegisterForm.invalid" class="btn btn-svoc login-btn">注 册</button>
        <div style="margin-top: 10px;">
          <p class="pull-right forgetpsd" style="color:#fff;">已有账号？<a routerLink="/login">登 录</a></p>
        </div>
      </div>
    </form>
  `,
  styleUrls: ['./register.component.css']
})
export class PerRegisterComponent implements OnInit {
  private perRegisterForm: FormGroup;
  isagreed = true;

  constructor(private fb: FormBuilder,
              private router: Router,
              private http: HttpClient,
              private commonService: CommonService,
              private authService: AuthService) {
    this.perRegisterForm = this.fb.group({
      realName: '', // 用户名称
      password: '',  // 密码
      mobile: '',  // 手机号
      verificationCode: '',  // 手机号验证码
      agreed: true
    });
  }

  ngOnInit() {

  }

  errorMsg: string = '';
  checkPhoneMsg: any = {
    isCan: false,
    msg: ''
  };

  checkPhoneFn(phone: any) {
    const myReg = /^1(3|4|5|7|8)+\d{9}$/;
    if (myReg.test(phone)) {
      // this.authService.validationPhone(phone)
      // this.checkErrorMsg = this.authService.validationError;
      this.authService.validationPhone(phone).subscribe((data: any) => {
        if (+data.code === 200) {
          this.checkPhoneMsg.isCan = true;
        } else {
          this.checkPhoneMsg.isCan = false;
          this.checkPhoneMsg.msg = data.msg;
        }
      });
    } else {
      this.checkPhoneMsg.msg = '输入的手机格式不正确';
    }
  }

  // 提交个人注册
  postFormData(val: any) {
    const postData = val;
    this.http.post('/uc/user/register', postData).subscribe(
      res => {
        const resultData: any = res;
        if (+resultData.code === 200) {
          // this.router.navigateByUrl("email");
          this.router.navigate(['/email', 1, val.mobile]);
          const exp = new Date();
          exp.setTime(exp.getTime() + 15 * 1000);
          document.cookie = 'username=' + postData.mobile + '; path=/;expires=' + exp.toUTCString();
          document.cookie = 'password=' + postData.password + '; path=/;expires=' + exp.toUTCString();
          document.cookie = 'captcha=' + resultData.data.captcha + '; path=/;expires=' + exp.toUTCString();
          document.cookie = 'randomStr=' + resultData.data.nanoTime + '; path=/;expires=' + exp.toUTCString();
        } else {
          this.errorMsg = resultData.msg;
        }
      },
      err => {
        console.log(err);
      }
    );
  }


}
