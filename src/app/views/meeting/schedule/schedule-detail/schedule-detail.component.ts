import {Component, OnInit, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '@services/common.service';
import {NzNotificationService} from 'ng-zorro-antd';
import {environment} from '../../../../../environments/environment';

@Component({
  selector: 'app-schedule-detail',
  templateUrl: './schedule-detail.component.html',
  styleUrls: ['./schedule-detail.component.css']
})
export class ScheduleDetailComponent implements OnInit, OnDestroy {
  // 服务状态
  serviceState: any;
  // 用户角色
  roleId: any;
  // 是否可用
  isAvailableOne: boolean;
  private appointmentId: number;//会议的appointmentId
  private sub: any;// 传递参数对象

  constructor(private _activatedRoute: ActivatedRoute,
              private http: HttpClient,
              private commonService: CommonService,
              private _notification: NzNotificationService) {
  }

  ngOnInit() {
    this.serviceState = localStorage.setEntServiceData;
    this.roleId = this.commonService.getLoginMsg().roleType;
    this.isAvailableOne = !([5, 3, 4, 2, 6, 1].indexOf(+this.serviceState) === -1) && !([3].indexOf(+this.roleId) === -1);
    this.sub = this._activatedRoute.params.subscribe(params => {
      this.appointmentId = params['mid'];
      // console.log(`mid:${this.appointmentId}`)
    });
    this.operationDetailFn();
  }

  /*** 点击会议名称 查看会议详情  根据appointmentId查询**/
  detailsData: any = {
    appointment: {
      appointmentType: ''
    }
  };
  conferenceImg: any;
  srcContent: any;
  copyContent: any;
  liveContent: any;
  weekDay = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  weeks: any;

  operationDetailFn() {
    this.conferenceImg = environment.apiBase + '/uc/appointments/' + this.appointmentId + '/code';//会议二维码图片初始化
    this.srcContent = this.commonService.getPath() + '#/watch-live/' + this.appointmentId;
    this.http.get('/uc/appointments/' + this.appointmentId).subscribe(
      res => {
        let resultData: any = res;
        this.detailsData = resultData.data;

        let dt = new Date(this.detailsData.appointment.startTime);
        this.weeks = this.weekDay[dt.getDay()];

        /* 复制展示内容 拼接 start */
        this.copyContent = '会议名称:' + resultData.data.appointment.appointmentName + '; \n ' +
          '会议号:' + resultData.data.appointment.appointmentNumber + '; \n ' +
          '密码:' + resultData.data.appointment.hostPwd + '; \n ' +
          '会议开始时间:北京时间 ' + this.commonService.getLocalTime(resultData.data.appointment.startTime) + '(' + this.weeks + ')';

      },
      err => {
        console.log(err);
      });
  }

  // 复制会议内容
  toClipboard() {
    this._notification.create('success', '复制成功', '');
  }

  //返回
  // returnTableFn(){
  //   location.back()
  // }


  //组件卸载的时候取消订阅
  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

}
