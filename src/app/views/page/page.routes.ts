import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AuthGuard} from '@services/auth-guard.service';

import {PageComponent} from './page.component';
//homePage
import {HomePageComponent} from '../homePage/home-page.component';
import {AdminHomeComponent} from '../homePage/admin-home/admin-home.component';
import {UserHomeComponent} from '../homePage/user-home/user-home.component';
import {PersonalHomeComponent} from '../homePage/personal-home/personal-home.component';

// product
import {ProductListComponent} from '../product/product-list/product-list.component';
import {ProductDetailComponent} from '../product/product-detail/product-detail.component';
// meeting
import {BookComponent} from '../meeting/book/book.component';
import {BookDetailComponent} from '../meeting/book/book-detail/book-detail.component';
import {JoinComponent} from '../meeting/join/join.component';
import {ConferenceManagementComponent} from '../meeting/conference-management/conference-management.component';
import {MeetingControlComponent} from '../meeting/meeting-control/meeting-control.component';
// meeting/schedule
import {EntScheduleComponent} from '../meeting/schedule/ent-schedule/ent-schedule.component';
import {UserScheduleComponent} from '../meeting/schedule/user-schedule/user-schedule.component';
import {HistoryScheduleComponent} from '../meeting/schedule/history-schedule/history-schedule.component';
import {ScheduleDetailComponent} from '../meeting/schedule/schedule-detail/schedule-detail.component';
// meeting/history
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
import {EntBookComponent} from '../contacts/ent-book/ent-book.component';

const pageRoutes: Routes = [
  {
    path: '',
    component: PageComponent,
    children: [
      {path: '', redirectTo: 'home-page', pathMatch: 'full'},
      {path: 'home-page', component: HomePageComponent},
      {path: 'admin-home', component: AdminHomeComponent},
      {path: 'user-home', component: UserHomeComponent},
      {path: 'personal-home', component: PersonalHomeComponent},

      {path: 'product-list', component: ProductListComponent},
      {path: 'product-detail/:pid', component: ProductDetailComponent},

      {path: 'book/:appointid/:appointType', component: BookComponent},
      {path: 'book-detail/:mid', component: BookDetailComponent},
      {path: 'join', component: JoinComponent},
      {path: 'conference-management', component: ConferenceManagementComponent},
      {path: 'meeting-control/:cid', component: MeetingControlComponent},

      {path: 'ent-schedule', component: EntScheduleComponent},
      {path: 'user-schedule', component: UserScheduleComponent},
      {path: 'history-schedule/:type', component: HistoryScheduleComponent},
      {path: 'schedule-detail/:mid', component: ScheduleDetailComponent},

      {path: 'ent-history', component: EntHistoryComponent},
      {path: 'user-history', component: UserHistoryComponent},
      {path: 'history-detail/:cid/:type', component: HistoryDetailComponent},

      {path: 'consumption-all', component: ConsumptionAllComponent},
      {path: 'consumption-detail', component: ConsumptionDetailComponent},
      {path: 'personal-consumption', component: PersonalConsumptionComponent},
      {path: 'account-balance', component: AccountBalanceComponent},
      {path: 'personal-detail', component: PersonalDetailComponent},
      {path: 'recharge/:receivable', component: RechargeComponent},


      {path: 'order-list', component: OrderListComponent},
      {path: 'order-detail/:orderNo', component: OrderDetailComponent},
      {path: 'payinfo/:orderNo', component: PayinfoComponent},

      {path: 'ent-room', component: EntRoomComponent},
      {path: 'user-room', component: UserRoomComponent},

      {path: 'ent-contacts', component: EntContactsComponent},
      {path: 'ent-group', component: EntGroupComponent},
      {path: 'ent-realroom', component: EntRealroomComponent},
      {path: 'user-contacts', component: UserContactsComponent},
      {path: 'user-group', component: UserGroupComponent},
      {path: 'user-realroom', component: UserRealroomComponent},

      {path: 'ent-video', component: EntVideoComponent},
      {path: 'user-video', component: UserVideoComponent},

      {path: 'live', component: LiveComponent},
      {path: 'personal-center', component: PersonalCenterComponent},
      {path: 'operation-log', component: OperationLogComponent},
      {path: 'message', component: MessageComponent},
      {path: 'customize', component: CustomizeComponent},
      {path: 'change-admin', component: ChangeAdminComponent},
      {path: 'create-ent', component: CreateEntComponent},
      {path: 'noJurisdiction', component: NoJurisdictionComponent},
      {path: 'ent-book', component: EntBookComponent},

    ]
  }


  // { path:'login', component: LoginComponent},
  // { path:'**', component:HomePageComponent },
];

@NgModule({
  imports: [
    RouterModule.forChild(pageRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class PageRoutesModule {
}
