import { NgModule }     from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@services/auth-guard.service';
//登录
import { LoginComponent } from './views/login/login.component';
//注册
import { RegisterComponent } from './views/register/register.component';
// import { PageComponent } from './views/page/page.component';
//直播
import { WatchLiveComponent } from './views/live-video/watch-live/watch-live.component';
import { PlayVideoComponent } from './views/live-video/play-video/play-video.component';
// 服务条款
import { TermsServiceComponent } from './views/setting/terms-service/terms-service.component';
// 绑定手机号
import { BindPhoneComponent } from './views/setting/bind-phone/bind-phone.component';
// 忘记密码
import { ForgetPsdComponent } from './views/setting/forget-psd/forget-psd.component';
// 邮箱
import { SendEmailComponent } from './views/setting/send-email/send-email.component';
import { CheckEmailComponent } from './views/setting/check-email/check-email.component';

const appRoutes:Routes = [
  { path:'', redirectTo:'page', pathMatch:'full' },
  { path:'login', component: LoginComponent},
  { path:'register', component: RegisterComponent},
  { path:'watch-live/:mid', component: WatchLiveComponent},
  { path:'play/:mid', component: PlayVideoComponent},
  { path:'terms-service', component: TermsServiceComponent},
  { path:'forget', component: ForgetPsdComponent},
  { path:'email/:type/:val', component: SendEmailComponent},
  { path:'success', component: CheckEmailComponent},
  { path:'bind/:userId', component: BindPhoneComponent},
  { path:'page',loadChildren: './views/page/page.module#PageModule',canActivate:[AuthGuard]}, //主入口 ,
  { path:'**', component: LoginComponent},
]

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes,{useHash:true})
  ],
  exports: [
    RouterModule
  ]

})
export class AppRoutesModule {}
