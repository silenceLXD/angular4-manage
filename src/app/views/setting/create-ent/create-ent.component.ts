import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '@services/common.service';
import { AuthService } from '@services/auth.service';
import { NzModalService } from 'ng-zorro-antd';
import { NzNotificationService } from 'ng-zorro-antd';

@Component({
  selector: 'app-create-ent',
  templateUrl: './create-ent.component.html',
  styleUrls: ['./create-ent.component.css']
})
export class CreateEntComponent implements OnInit {

  emailMsg: boolean = false;  //判断邮箱是否已被注册  true为  已注册
  entNameMsg: boolean = false; //判断企业名称是否已被注册 true为  已注册
  validaeEmail: boolean = false; //点击下一步  true为已通过
  entName: any = '';  //企业名称
  email: any = ''; // 邮箱名称

  public loginUserData = this.commonService.getLoginMsg();
  entId: any = this.loginUserData.entId;
  userId: any = this.loginUserData.userId;
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient,
    private commonService: CommonService,
    private confirmServ: NzModalService,
    private _notification: NzNotificationService,
    private authService: AuthService
  ) {
  }

  ngOnInit() {
  }

  /* 验证企业名称是否重复 */
  checkEntName() {
    this.http.get('/uc/ents/validation/name?entName=' + this.entName).subscribe(
      res => {
        console.log(res);
        let datalist: any = res;
        if (datalist.code == 200) {
          this.entNameMsg = false;
        } else {
          if (this.entName != '') {
            this.entNameMsg = true
          }
        }
      },
      err => {
        console.log(err);
      }
    );
  }
  /* 验证邮箱是否存在 */
  checkEmail() {
    this.http.get('/uc/user/validation/email?email=' + this.email).subscribe(
      res => {
        console.log(res);
        let datalist: any = res;
        if (datalist.code == 200) {
          this.emailMsg = false;
        } else {
          if (this.email != '') {
            this.emailMsg = true;
          }
        }
      },
      err => {
        console.log(err);
      }
    );
  }
  /* 下一步 */
  nextStep() {
    if (!this.entNameMsg && !this.emailMsg) {
      this.validaeEmail = true;
    }
    if (this.validaeEmail) {
      let getData = {
        orgName: this.entName,
        email: this.email
      }
      this.http.post('/uc/ents/person/user/create/ent', getData).subscribe(
        res => {
          console.log(res);
          let datalist: any = res;
          if (datalist.code == 200) {
            // this._notification.create('success', '创建成功', '即将退出当前登录');
            this.router.navigate(['/email',2,this.email]);
          } else {
            this._notification.create('error', '创建失败', '');
          }
        },
        err => {
          console.log(err);
        }
      );
    }
  }

  /* 立即登录邮箱验证 */
  // loginEmail() {
  //   let isEmail = this.email.split('@')[1];
  //   switch (isEmail) {
  //     case 'qq.com':
  //       window.location.href = 'https://mail.qq.com/';
  //       break;
  //     case '163.com':
  //       window.location.href = 'https://mail.163.com/';
  //       break;
  //     case '126.com':
  //       window.location.href = 'https://mail.126.com/';
  //       break;
  //     case 'gmail.com':
  //       window.location.href = 'https://mail.google.com/mail';
  //       break;
  //     case 'Hotmail.com':
  //       window.location.href = 'https://outlook.live.com/owa/';
  //       break;
  //     case 'aliyun.com':
  //       window.location.href = 'https://qiye.aliyun.com/';
  //       break;
  //   }
  //
  //   setTimeout(() => {
  //    this.router.navigate(['/login']);
  //    localStorage.clear();
  //  }, 1000);
  // }

  loginEmail() {
    let email = this.email;
    /* 截取@后面.前面的所有数据 */
    let index = email.lastIndexOf("@");
    email = email.substring(index + 1, email.length);
    let dotIndex=email.indexOf('.');
    email= email.substring(0, dotIndex);
    // 跳转到对应邮箱网站
    window.open("http://mail."+email+".com/","_blank");

    setTimeout(() => {
     this.router.navigate(['/login']);
     localStorage.clear();
   }, 1500);

  }

}
