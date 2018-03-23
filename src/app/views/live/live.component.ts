import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '@services/common.service';

@Component({
  selector: 'app-live',
  templateUrl: './live.component.html',
  styleUrls: ['./live.component.css']
})
export class LiveComponent implements OnInit {

  // 服务状态
  serviceState: any;
  // 用户角色
  roleId: any;
  // 是否可用
  isAvailableOne: boolean;
  public loginUserData = this.commonService.getLoginMsg();
  ENTID = this.loginUserData.entId;

  constructor(private http: HttpClient, private _activatedRoute: ActivatedRoute, private commonService: CommonService) {
  }

  ngOnInit() {
    this.serviceState = localStorage.setEntServiceData;
    this.roleId = this.commonService.getLoginMsg().roleType;
    this.isAvailableOne = !([5, 3, 4, 2, 6, 1].indexOf(+this.serviceState) === -1) && !([1, 2, 3].indexOf(+this.roleId) === -1);
    this.getLiveListFn();
  }

  liveListData: any;
  isHaveData: boolean = false;

  // 查询企业直播列表
  getLiveListFn() {
    this.http.get('/uc/' + this.ENTID + '/lives').subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == '200') {
          if (resultData.data.length) {
            this.isHaveData = true;
            this.liveListData = resultData.data;
          } else {
            this.isHaveData = false;
          }
        }
      },
      err => {
        console.log('在线状态 error...');
      });
  }
}
