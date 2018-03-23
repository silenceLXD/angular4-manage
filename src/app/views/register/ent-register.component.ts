import {Component, OnInit, OnDestroy} from '@angular/core';
import {FormGroup, FormBuilder, Validators, FormControl} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {AuthService} from '@services/auth.service';
import {FormValidators} from '@services/form-validators';

@Component({
  selector: 'ent-register',
  template: `
    <form novalidate class="form-horizontal flip in" role="form" id="userForm" [formGroup]="entRegisterForm"
          (ngSubmit)="postFormData(entRegisterForm.value)">
      <div class="form-group">
        <i class="fa fa-building-o"></i>
        <input type="text" formControlName="entName" [(ngModel)]="entName" (blur)="checkEntNameFn(entName)" class="form-control"
               maxlength="20" placeholder="请输入企业的全称">

        <p *ngIf="!entRegisterForm.get('entName').hasError('required') && checkEntNameMsg.isCan" class="fa fa-check faisok"></p>
        <div class="error" style="margin-left:30px;">
          <p *ngIf="!checkEntNameMsg.isCan&&entRegisterForm.get('entName').value">{{checkEntNameMsg.msg}}</p>
          <p *ngIf="entRegisterForm.get('entName').hasError('required') &&  entRegisterForm.get('entName').touched"> 企业名称不能为空 </p>
        </div>
      </div>

      <div class="form-group">
        <i class="fa fa-envelope-o" aria-hidden="true"></i>
        <input type="email" formControlName="email" [(ngModel)]="email" class="form-control" placeholder="请填写企业邮箱"
               (blur)="checkEmailFn(email)">

        <p *ngIf="!entRegisterForm.get('email').hasError('required') && checkEmailMsg.isCan" class="fa fa-check faisok"></p>
        <div class="error" style="margin-left:30px;">
          <p *ngIf="!checkEmailMsg.isCan&&entRegisterForm.get('email').value">{{checkEmailMsg.msg}}</p>
          <p *ngIf="entRegisterForm.get('email').hasError('required') &&  entRegisterForm.get('email').touched"> 企业邮箱不能为空 </p>
        </div>
      </div>

      <div class="form-group pw-group">
        <i class="fa fa-lock" aria-hidden="true"></i>
        <input type="password" formControlName="password" class="form-control" placeholder="请输入密码" minlength="6" maxlength="20">
        <p *ngIf="ispwdOK" class="fa fa-check faisok" aria-hidden="true"></p>
        <p *ngIf="ispwdclose" class="fa fa-close faisclose" aria-hidden="true"></p>
        <p class="error" style="margin-left:30px;"
           *ngIf="entRegisterForm.get('password').hasError('required') &&  entRegisterForm.get('password').touched"> 密码不能为空 </p>
      </div>

      <div class="form-group">
        <i class="fa fa-mobile" aria-hidden="true" style="font-size:18px;"></i>
        <input type="text" formControlName="mobile" [(ngModel)]="mobile" class="form-control" maxlength="11" placeholder="请输入11位手机号码"
               (blur)="checkPhoneFn(mobile)">

        <p *ngIf="!entRegisterForm.get('mobile').hasError('required') && checkPhoneMsg.isCan" class="fa fa-check faisok"></p>
        <div class="error" style="margin-left:30px;">
          <p *ngIf="!checkPhoneMsg.isCan&&entRegisterForm.get('mobile').value!==''">{{checkPhoneMsg.msg}}</p>
          <p *ngIf="entRegisterForm.get('mobile').hasError('required') &&  entRegisterForm.get('mobile').touched"> 手机号码不能为空 </p>
        </div>
      </div>

      <div class="form-group">
        <div class="col-md-8 col-xs-9" style="padding: 0;">
          <i class="fa fa-key" aria-hidden="true" style="left:20px;"></i>
          <input type="text" id="msgCode" formControlName="verificationCode" class="form-control" maxlength="6" placeholder="请输入验证码"
                 [(ngModel)]="msgCode">
          <div class="error" style="margin-left:30px;">
            <p class="error"><span>{{errorMsg}}</span></p>
            <p *ngIf="entRegisterForm.get('verificationCode').hasError('required') &&  entRegisterForm.get('verificationCode').touched">
              验证码不能为空 </p>
          </div>
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
        <button type="submit" [disabled]="entRegisterForm.invalid" class="btn btn-svoc login-btn">注 册</button>
        <div style="margin-top: 10px;">
          <p class="pull-right forgetpsd" style="color:#fff;">已有账号？<a routerLink="/login">登 录</a></p>
        </div>
      </div>
    </form>
  `,
  styleUrls: ['./register.component.css']
})
export class EntRegisterComponent implements OnInit {
  private entRegisterForm: FormGroup;

  // public val:FormValidators;//定义一个validators类型的变量 val

  isagreed = true;

  constructor(private fb: FormBuilder,
              private router: Router,
              private http: HttpClient,
              private authService: AuthService) {
    // this.val = new FormValidators();
    this.entRegisterForm = this.fb.group({
      entName: ['', Validators.required], // 企业名称
      email: ['', Validators.required], // 邮箱
      password: ['', Validators.required],  // 密码
      mobile: ['', Validators.required],  // 手机号
      verificationCode: ['', Validators.required],  // 验证码
      agreed: true
    });
  }

  ngOnInit() {
  }

  // 验证手机号是否存在
  checkPhoneMsg: any = {
    isCan: false,
    msg: ''
  };

  checkPhoneFn(phone: any) {
    const myReg = /^1(3|4|5|7|8)+\d{9}$/;
    if (myReg.test(phone)) {
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

  // 验证企业名称是否存在
  checkEntNameMsg: any = {
    isCan: false,
    msg: ''
  };

  checkEntNameFn(name: any) {
    this.authService.validationEntName(name).subscribe((data: any) => {
      if (+data.code === 200) {
        this.checkEntNameMsg.isCan = true;
      } else {
        this.checkEntNameMsg.isCan = false;
        this.checkEntNameMsg.msg = data.msg;
      }
    });
  }

  // 验证邮箱是否存在
  checkEmailMsg: any = {
    isCan: false,
    msg: ''
  };

  checkEmailFn(email: any) {
    const emailReg = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    if (emailReg.test(email)) {
      this.authService.validationEmail(email).subscribe((data: any) => {
        if (+data.code === 200) {
          this.checkEmailMsg.isCan = true;
        } else {
          this.checkEmailMsg.isCan = false;
          this.checkEmailMsg.msg = data.msg;
        }
      });
    } else {
      this.checkEmailMsg.isCan = false;
      this.checkEmailMsg.msg = '输入的邮箱格式不正确';
    }

  }

  errorMsg = ''; // 错误消息提示
  // 提交企业注册
  postFormData(val: any) {
    const postData = val;
    this.http.post('/uc/ents/register', postData).subscribe(
      res => {
        // console.log(res);//打印返回的数据
        const resultData: any = res;
        if (+resultData.code === 200) {
          // this.router.navigateByUrl("email");
          this.router.navigate(['/email', 2, val.email]);
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
