import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '@services/common.service';
import {environment} from '../../../../../environments/environment';

@Component({
  selector: 'app-history-detail',
  templateUrl: './history-detail.component.html',
  styleUrls: ['./history-detail.component.css']
})
export class HistoryDetailComponent implements OnInit {

  roleId = this.commonService.getLoginMsg().roleType; // 8是个人用户
  private cid: number; // 会议的appointmentId
  private sub: any; // 传递参数对象
  private appointType: number; // 1 历史会议；2 历史预约
  // isAppointType
  public loginUserData = this.commonService.getLoginMsg();
  userId: any = this.loginUserData.userId;

  constructor(private _activatedRoute: ActivatedRoute,
              private http: HttpClient,
              private commonService: CommonService) {
  }

  ngOnInit() {
    this.sub = this._activatedRoute.params.subscribe(params => {
      this.cid = params['cid'];
      this.appointType = params['type'];
    });

    this.operationDetailFn();
  }

  weekDay = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  viewWeeks: any;
  endviewWeeks: any;

  detailsData: any = {
    conference: {
      appointmentStatus: ''
    }
  };

  operationDetailFn() {
    let geturl;
    if (+this.appointType === 1) {
      geturl = '/uc/conferences/' + this.cid + '/history';
    } else if (+this.appointType === 2) {
      geturl = '/uc/appointments/' + this.cid + '/history';
    }
    this.http.get(geturl).subscribe(
      res => {
        const resultData: any = res;
        this.detailsData = resultData.data;
        const startdt = new Date(this.detailsData.conference.startTime);
        this.viewWeeks = this.weekDay[startdt.getDay()];
        const enddt = new Date(this.detailsData.conference.endTime);
        this.endviewWeeks = this.weekDay[enddt.getDay()];
      },
      err => {
        console.log(err);
      });
  }


  //下载会议日志 modal
  historyLogModal: boolean = false;
  logData: any;

  checkLogFn(cid: any) {
    this.historyLogModal = true;
    this.http.get('/uc/conferences/' + cid + '/log').subscribe(
      res => {
        const resultData: any = res;
        if (+resultData.code === 200) {
          this.logData = resultData.data;
        }
      },
      err => {
        console.log(err);
      });
  }

  // 下载会议日志
  downloadLogFn() {
    const url = '/uc/conferences/' + this.cid + '/down-log/' + this.userId;
    this.commonService.downloadExport(url, '会议日志');
    this.historyLogModal = false;
  }

}
