import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs/observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

import {Router} from '@angular/router';
import {TokenService} from './token.service';
import {NzNotificationService} from 'ng-zorro-antd';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private tokenService: TokenService,
              private router: Router,
              private _notification: NzNotificationService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // const apiUrl = "http://172.18.7.172:9100";//配置api统一资源请求路径
    const apiBase = environment.apiBase;
    const jwtReq = req.clone({
      url: apiBase + req.url,
      // withCredentials: true,
      headers: req.headers
      // .set('Content-Type', 'application/x-www-json-urlencoded; charset=UTF-8')//设置请求头
        .set('Authorization', this.tokenService.getToken())
        .set('terminalType', 'web')
    });
    return next.handle(jwtReq).do(event => {
      if (event instanceof HttpResponse) {
        // if(event.body.code == 11017){
        //   this.tokenService.refreshToken();
        // }
        switch (event.status) {
          case 401:
            console.log('token过期');
            // location.href = 'login'; // 重新登录
            this.router.navigateByUrl('login'); // 重新登录
            localStorage.clear();
            break;
          case 500:
            console.log('服务器错误');
            break;
          case 404:
            console.log('找不到');
            break;
        }
      }
      return event;
    }, (err: any) => {

      switch (err.status) {
        case 401:
          console.log('token无效');
          this.router.navigateByUrl('login'); // 重新登录
          localStorage.clear();
          break;
        case 413:
          console.log('token已过期');
          this.tokenService.refreshToken(); // 刷新token
          break;
        case 500:
          console.log('服务器错误');
          break;
        case 404:
          console.log('找不到api');
          break;
        case 402:
          console.log('服务器异常');
          break;
        default:
          if (+err.error.code === 4021) {
            this._notification.create('error', '账号已被冻结！如有疑问，请拨打电话：010-5873 4583', '');
          }else if (+err.error.code === 6002) {
            // this._notification.create('error', '', '');
          } else {
            this._notification.create('error', err.error.msg, '');
          }
          break;
      }
    });
  }
}
