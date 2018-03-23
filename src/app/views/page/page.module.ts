import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
// import { HttpModule } from '@angular/http';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {ClipboardModule} from 'ngx-clipboard';
// import { Http, HttpModule, XHRBackend, RequestOptions }    from '@angular/http';
// import { HttpInterceptorService }   from '@services/http.interceptor.service';

// import { HttpClientModule } from '@angular/common/http';
// import { HTTP_INTERCEPTORS } from '@angular/common/http';
// import { AuthInterceptor } from '@services/auth.interceptor';
//
// import { TokenService } from '@services/token.service';

// ngx-echarts
import {NgxEchartsModule} from 'ngx-echarts';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {NZ_NOTIFICATION_CONFIG} from 'ng-zorro-antd';
// import { NZ_MESSAGE_CONFIG } from 'ng-zorro-antd';
// ngx-bootstrap
import {AlertModule, PaginationModule, ModalModule, TabsModule} from 'ngx-bootstrap';
// 公共组件
import {LayoutModule} from '../layout/layout.module';
//路由
import {PageRoutesModule} from './page.routes';

//自定义管道pipe
import {AllPipesModule} from '@pipes/all-pipes.module';

//主入口组件
import {PageComponent} from './page.component';
//homePage
import {HomePageComponent} from '../homePage/home-page.component';
import {AdminHomeComponent} from '../homePage/admin-home/admin-home.component';
import {UserHomeComponent} from '../homePage/user-home/user-home.component';
import {PersonalHomeComponent} from '../homePage/personal-home/personal-home.component';

// product(商品)
import {ProductListComponent} from '../product/product-list/product-list.component';
import {ProductDetailComponent} from '../product/product-detail/product-detail.component';
// meeting(会议)
import {BookComponent} from '../meeting/book/book.component';
import {BookDetailComponent} from '../meeting/book/book-detail/book-detail.component';
import {JoinComponent} from '../meeting/join/join.component';
import {ConferenceManagementComponent} from '../meeting/conference-management/conference-management.component';
import {MeetingControlComponent} from '../meeting/meeting-control/meeting-control.component';
import {SplitModelComponent} from '../meeting/meeting-control/split-model/split-model.component';//会控 屏幕设置
// meeting/schedule(会议日程)
import {EntScheduleComponent} from '../meeting/schedule/ent-schedule/ent-schedule.component';
import {UserScheduleComponent} from '../meeting/schedule/user-schedule/user-schedule.component';
import {HistoryScheduleComponent} from '../meeting/schedule/history-schedule/history-schedule.component';
import {ScheduleDetailComponent} from '../meeting/schedule/schedule-detail/schedule-detail.component';
// meeting/history(历史会议)
import {EntHistoryComponent} from '../meeting/history/ent-history/ent-history.component';
import {UserHistoryComponent} from '../meeting/history/user-history/user-history.component';
import {HistoryDetailComponent} from '../meeting/history/history-detail/history-detail.component';
//consumption(消费)
import {ConsumptionAllComponent} from '../consumption/consumption-all/consumption-all.component';
import {ConsumptionDetailComponent} from '../consumption/consumption-detail/consumption-detail.component';
import {PersonalConsumptionComponent} from '../consumption/personal-consumption/personal-consumption.component';
import {AccountBalanceComponent} from '../consumption/account-balance/account-balance.component';
import {PersonalDetailComponent} from '../consumption/personal-detail/personal-detail.component';
import {RechargeComponent} from '../consumption/recharge/recharge.component';
//order(订单)
import {OrderListComponent} from '../order/order-list/order-list.component';
import {OrderDetailComponent} from '../order/order-detail/order-detail.component';
import {PayinfoComponent} from '../order/payinfo/payinfo.component';
//room(会议室)
import {EntRoomComponent} from '../room/ent-room/ent-room.component';
import {UserRoomComponent} from '../room/user-room/user-room.component';
//contacts（通讯录）
import {EntContactsComponent} from '../contacts/ent-contacts/ent-contacts.component';
import {EntGroupComponent} from '../contacts/ent-group/ent-group.component';
import {EntRealroomComponent} from '../contacts/ent-realroom/ent-realroom.component';
import {UserContactsComponent} from '../contacts/user-contacts/user-contacts.component';
import {UserGroupComponent} from '../contacts/user-group/user-group.component';
import {UserRealroomComponent} from '../contacts/user-realroom/user-realroom.component';
//video(视频列表)
import {EntVideoComponent} from '../video/ent-video/ent-video.component';
import {UserVideoComponent} from '../video/user-video/user-video.component';
// live（直播）
import {LiveComponent} from '../live/live.component';
// personal-center（个人中心）
import {PersonalCenterComponent} from '../personal-center/personal-center.component';
// operation-log（操作日志）
import {OperationLogComponent} from '../operation-log/operation-log.component';
// message（消息中心）
import {MessageComponent} from '../message/message.component';
// customize（企业定制）
import {CustomizeComponent} from '../customize/customize.component';
// change-admin(更换管理员)
import {ChangeAdminComponent} from '../setting/change-admin/change-admin.component';
// create-ent（创建企业）
import {CreateEntComponent} from '../setting/create-ent/create-ent.component';
// 无权限
import {NoJurisdictionComponent} from '../setting/no-jurisdiction/no-jurisdiction.component';
// 自定义组件
import {SliderDateComponent} from '../product/slider-date.component';//购买商品 滑动选择时长
import {meetingRequestComponent} from '../meeting/meeting-control/meeting-request.component';//会控 入会申请
import {meetingVoteComponent} from '../meeting/meeting-control/meeting-vote.component';//会控 投票
import {ContactsTreeComponent} from '../contacts/contacts-tree.component';//通讯录 树形结构
import {AddAttendComponent} from '../meeting/add-attend/add-attend.component'; //选择参会者
import {AttendTreeComponent} from '../meeting/add-attend/attend-tree.component';
import {WrapComponent} from '../plugins/wrap/wrap.component';
import {MeetingControlBtnComponent} from '../layout/meeting-control-btn.component';
import {EntBookComponent} from '../contacts/ent-book/ent-book.component';
//选择参会者 树结构
// import { TimerButtonComponent } from '../layout/timer-button.component';//60s倒计时
// import { TimerButtonComponent } from '../layout/timer-button.component';  //60s倒计时


// export function interceptorFactory(xhrBackend: XHRBackend, requestOptions: RequestOptions){
//    let service = new HttpInterceptorService(xhrBackend, requestOptions);
//    return service;
//  }

@NgModule({
  declarations: [
    PageComponent,
    HomePageComponent,
    AdminHomeComponent,
    UserHomeComponent,
    PersonalHomeComponent,
    ProductListComponent,
    ProductDetailComponent,
    BookComponent,
    BookDetailComponent,
    JoinComponent,
    ConferenceManagementComponent,
    EntScheduleComponent,
    UserScheduleComponent,
    HistoryScheduleComponent,
    ScheduleDetailComponent,
    EntHistoryComponent,
    UserHistoryComponent,
    HistoryDetailComponent,
    MeetingControlComponent,
    SplitModelComponent,
    ConsumptionAllComponent,
    ConsumptionDetailComponent,
    PersonalConsumptionComponent,
    AccountBalanceComponent,
    RechargeComponent,
    PersonalDetailComponent,
    OrderListComponent,
    OrderDetailComponent,
    PayinfoComponent,
    EntRoomComponent,
    UserRoomComponent,
    EntContactsComponent,
    EntGroupComponent,
    EntRealroomComponent,
    UserContactsComponent,
    UserGroupComponent,
    UserRealroomComponent,
    LiveComponent,
    PersonalCenterComponent,
    OperationLogComponent,
    MessageComponent,
    CustomizeComponent,
    EntVideoComponent,
    UserVideoComponent,
    ChangeAdminComponent,
    CreateEntComponent,
    NoJurisdictionComponent,
    EntBookComponent,

    //自定义组件
    SliderDateComponent,
    meetingRequestComponent,
    meetingVoteComponent,
    ContactsTreeComponent,
    AddAttendComponent,
    AttendTreeComponent,
    WrapComponent,
    MeetingControlBtnComponent
    // TimerButtonComponent,


  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // HttpModule,
    // HttpClientModule,
    PageRoutesModule,//路由
    LayoutModule,
    AllPipesModule,//管道
    NgxEchartsModule,
    ClipboardModule,
    // AngularEchartsModule,
    AlertModule.forRoot(),
    PaginationModule.forRoot(),
    // BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    NgZorroAntdModule.forRoot(),
    // RouterModule.forRoot(appRoutes)
  ],
  // providers: [
  //   HttpInterceptorService,
  //   {
  //      provide: Http,
  //      useFactory: interceptorFactory,
  //      deps: [XHRBackend, RequestOptions]
  //    }
  // ],
  providers: [
    // { provide: TokenService, useClass: TokenService },
    {
      provide: NZ_NOTIFICATION_CONFIG,
      useValue: {nzTop: '70px'}
    },
    // { provide: NZ_MESSAGE_CONFIG, useValue: { nzTop: '70px' } }
  ],
})
export class PageModule {
}
