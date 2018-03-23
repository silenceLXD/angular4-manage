import { Injectable }       from '@angular/core';
import {
  CanActivate, Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivateChild,
  NavigationExtras,
  CanLoad, Route
}                           from '@angular/router';
import { AuthService }      from './auth.service';
import {CommonService} from '@services/common.service';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  constructor(private authService: AuthService, private router: Router,private commonService: CommonService) {}

  // canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
  //   let url: string = state.url;
  //   let isLogined = this.checkLogin(url);
  //   if(isLogined){
  //     this.router.navigate(['/page']);
  //   }else{
  //     return true;
  //   }
  //
  // }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let url: string = state.url;
    return this.checkLogin(url);
    // return this.canActivate(route, state);
  }

  canLoad(route: Route): boolean {
    let url = `/${route.path}`;

    return this.checkLogin(url);
  }

  checkAdmin(url: string): boolean {
    if(this.authService.isAdmin){
      return true
    }

    this.router.navigate(['/page']);
    return false;
  }

  checkLogin(url: string): boolean {
    if (this.authService.isLoggedIn) { return true; }

    // Store the attempted URL for redirecting
    this.authService.redirectUrl = url;


    // Navigate to the login page with extras
    this.router.navigate(['/login']);
    return false;
  }



  //
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean{
    // 返回值 true: 跳转到当前路由 false: 不跳转到当前路由
    // 当前路由名称
    var path = route.routeConfig.path;
    // nextRoute: 设置需要路由守卫的路由集合
    const nextRoute = ['page'];
    let isLogin = this.commonService.checkCookie('uc_access_token');  // 是否登录this.authService.isLoggedIn;
    // 当前路由是nextRoute指定页时
    if (nextRoute.indexOf(path) >= 0) {
      if (!isLogin) {
        // 未登录，跳转到login
        this.router.navigate(['login']);
        return false;
      }else{
        // 已登录，跳转到当前路由
        return true;
      }
    }
    // 当前路由是login时
    if (path === 'login') {
      if (!isLogin) {
        // 未登录，跳转到当前路由
        return true;
      }else{
        // 已登录，跳转到home
        this.router.navigate(['page']);
        return false;
      }
    }
  }

}
