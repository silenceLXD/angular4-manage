import {Injectable} from '@angular/core';

import {Observable} from 'rxjs/Observable';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '@services/common.service';
import {Router} from '@angular/router';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/delay';

@Injectable()
export class AuthService {
  constructor(private http: HttpClient, private router: Router, private commonService: CommonService) {
  }

  // isLoggedIn = true;
  // this.commonService.checkCookie('uc_access_token');
  // isLoggedIn: boolean = this.commonService.checkCookie('uc_access_token');

  get isLoggedIn(): boolean {
    return this.commonService.checkCookie('uc_access_token');
  }

  set isLoggedIn(bool) {
    this.isLoggedIn = bool;
  }

  isLoggedInBool() {
    return this.commonService.checkCookie('uc_access_token');
  }

  // this.isLoggedIn = !!localStorage.getItem('uc_access_token');
  isAdmin: boolean = true;//当前用户是否为管理员
  // store the URL so we can redirect after logging in
  redirectUrl: string;

  login(): Observable<boolean> {
    return Observable.of(true).delay(1000).do(val => this.isLoggedIn = true);
  }

  logout(): void {
    // this.isLoggedIn = false;
    /* this.commonService.deleAllCookie();//清除cookies
     this.router.navigateByUrl('login');//跳回登录
     localStorage.clear();//清除localStorage*/
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

  validationError: any = {
    isCan: false,
    msg: ''
  };

  // 验证邮箱是否存在/uc/user/validation/email
  validationEmail(email: string) {
    // this.validationError = {
    //   isCan: false,
    //   msg: ''
    // };
    return this.http.get('/uc/user/validation/email?email=' + email);
    // .subscribe(
    //   res => {
    //     let resultData: any = res;
    //     if (resultData.code == 200) {//可以使用
    //       this.validationError.isCan = true;
    //     } else {
    //       this.validationError.isCan = false;
    //       this.validationError.msg = resultData.msg;
    //     }
    //   },
    //   err => {
    //     console.log(err);
    //   });
  }

  // 验证手机是否存在uc/user/validation/phone
  // validationPhone(phone:string):Observable<any> {
  //       return this.http.get('/uc/user/validation/phone?phone=' + phone).subscribe((res:any)=> {
  //           return res;
  //       });
  //   }
  validationPhone(phone: string) {
    // this.validationError = {
    //   isCan: false,
    //   msg: ''
    // };
    return this.http.get('/uc/user/validation/phone?phone=' + phone);
    // return this.http.get('/uc/user/validation/phone?phone=' + phone).subscribe(
    //   res => {
    //     let resultData:any = res;
    //     if (resultData.code == 200) {//可以使用
    //       this.validationError.isCan = true;
    //     } else {
    //       this.validationError.isCan = false;
    //       this.validationError.msg = resultData.msg;
    //     }
    //     return resultData;
    //   },
    //   err => {
    //     console.log(err);
    //   })
  }

  // 验证企业名称是否重复/uc/ents/validation/name
  validationEntName(name: any) {
    // this.validationError = {
    //   isCan: false,
    //   msg: ''
    // };
    return this.http.get('/uc/ents/validation/name?entName=' + name);
    // .subscribe(
    //   res => {
    //     let resultData: any = res;
    //     // alert(resultData.code)
    //     if (resultData.code == 200) {//可以使用
    //       this.validationError.isCan = true;
    //     } else {
    //       this.validationError.isCan = false;
    //       this.validationError.msg = resultData.msg;
    //     }
    //   },
    //   err => {
    //     console.log(err);
    //   });
  }
}
