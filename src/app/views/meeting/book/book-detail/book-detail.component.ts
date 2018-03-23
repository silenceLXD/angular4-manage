import { Component, OnInit, Input, Output,EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { HttpClient } from '@angular/common/http';
import { CommonService } from '@services/common.service';
import { environment } from '../../../../../environments/environment';
import { NzNotificationService } from 'ng-zorro-antd';
@Component({
  selector: 'book-detail',
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.css']
})
export class BookDetailComponent implements OnInit {
  public loginUserData = this.commonService.getLoginMsg();
  private sub:any;// 传递参数对象
  private appointmentId: any;//会议的appointmentId

  conferenceImg:any;
  srcContent:any;
  copyContent:any;
  liveContent:any;
  weekDay = ["星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  weeks:any;
  constructor(
    private http: HttpClient,
    private _activatedRoute:ActivatedRoute,
    private commonService: CommonService,
    private _notification: NzNotificationService
  ) {

   }
  ngOnInit() {
    // this.conferenceImg  = environment.apiBase+'/uc/appointments/'+this.detailsData.appointmentId+'/code';//会议二维码图片初始化
    // this.srcContent = this.commonService.getPath()+"#/watch-live/"+this.detailsData.appointmentId;
    //
    // let dt = new Date(this.detailsData.startTime);
    // this.weeks = this.weekDay[dt.getDay()];
    //
    // /* 复制展示内容 拼接 start */
    // this.copyContent = "会议名称:" + this.detailsData.appointmentName + "; \n " +
    // "会议号:" + this.detailsData.appointmentNumber + "; \n " +
    // "密码:" + this.detailsData.hostPwd + "; \n " +
    // "会议开始时间:北京时间 " + this.commonService.getLocalTime(this.detailsData.startTime) +"("+this.weeks+")";
    //
    // this.liveContent="直播链接:" + this.srcContent + "; \n " +
   	//    							  "密码:" + this.detailsData.livePwd;

    this.sub = this._activatedRoute.params.subscribe(params=>{
      this.appointmentId = params["mid"];
    })

    this.operationDetailFn();
  }
  detailsData:any = {
    appointUser:[],
  };
  detailAppointMentData:any = {
    appointmentName:'',
    appointmentType:'',
  };
  operationDetailFn(){
    this.conferenceImg  = environment.apiBase+'/uc/appointments/'+this.appointmentId+'/code';//会议二维码图片初始化
    this.srcContent = this.commonService.getPath()+"#/watch-live/"+this.appointmentId;
    this.http.get('/uc/appointments/'+this.appointmentId).subscribe(
        res => {
          let resultData:any = res;
          this.detailsData = resultData.data;
          this.detailAppointMentData = resultData.data.appointment;

          let dt = new Date(this.detailsData.appointment.startTime);
          this.weeks = this.weekDay[dt.getDay()];

          /* 复制展示内容 拼接 start */
          this.copyContent = "会议名称:" + resultData.data.appointment.appointmentName + "; \n " +
          "会议号:" + resultData.data.appointment.appointmentNumber + "; \n " +
          "密码:" + resultData.data.appointment.hostPwd + "; \n " +
          "会议开始时间:北京时间 " + this.commonService.getLocalTime(resultData.data.appointment.startTime) +"("+this.weeks+")";

          this.liveContent="直播链接:" + this.srcContent + "; \n " +
                            "密码:" + resultData.data.appointment.livePwd;
        },
        err => {
          console.log(err);
        });
  }


  // 复制会议内容
  toClipboard(){
    this._notification.create('success', '复制成功','');
  }
  // 复制直播地址
  toClipboardLive(){
    this._notification.create('success', '复制成功','');
  }
  // isShowDetail:boolean;
  // 编辑会议
  editMeetingFn(data:any){
    // this.isShowDetail = false;
    // this.isShow.emit(this.isShowDetail);

  }

  //组件卸载的时候取消订阅
  ngOnDestroy() : void {
    this.sub.unsubscribe();
  }
}
