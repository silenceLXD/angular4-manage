import {Component, OnInit, OnDestroy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CommonService} from '@services/common.service';

@Component({
  selector: 'app-send-email',
  templateUrl: './send-email.component.html',
  styleUrls: ['./send-email.component.css']
})
export class SendEmailComponent implements OnInit, OnDestroy {
  private thisType: number;//注册类型
  private thisValue: any;//注册类型
  private sub: any;// 传递参数对象

  userSuccess: boolean = false;
  validaEmail: boolean = false;
  nowDate: any;
  loginTimes = 10;

  constructor(private _activatedRoute: ActivatedRoute,
              private route: Router,
              private commonService: CommonService) {
    this.nowDate = new Date().getFullYear();
  }

  ngOnInit() {
    this.sub = this._activatedRoute.params.subscribe(params => {
      this.thisType = params['type'];
      this.thisValue = params['val'];
      if (+this.thisType === 1) {
        this.userSuccess = true;
      } else {
        this.validaEmail = true;
      }
    });

    const loginTimesFn = setInterval(() => {
      if (this.loginTimes <= 0) {
        this.regToLoginFn();
        clearInterval(loginTimesFn);
      }
      this.loginTimes--;
    }, 1000);
  }

  // 立即登录到主页
  regToLoginFn() {
    this.route.navigate(['/login']);
  }

  // 邮箱 下一步操作
  loginEmail() {
    let email = this.thisValue;
    /* 截取@后面.前面的所有数据 */
    let index = email.lastIndexOf('@');
    email = email.substring(index + 1, email.length);
    let dotIndex = email.indexOf('.');
    email = email.substring(0, dotIndex);
    // 跳转到对应邮箱网站
    window.open('http://mail.' + email + '.com/', '_blank');

  }

  //组件卸载的时候取消订阅
  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

}
