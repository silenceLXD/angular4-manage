import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '@services/common.service';
import { NzModalService } from 'ng-zorro-antd';
import { NzNotificationService } from 'ng-zorro-antd';

@Component({
  selector: 'app-personal-consumption',
  templateUrl: './personal-consumption.component.html',
  styleUrls: ['./personal-consumption.component.css']
})
export class PersonalConsumptionComponent implements OnInit {

  sixMonthArr: any = '';  //获取当前日期前六个月的时间
  monthSt: any = ''; //当前选择月份
  monSelectName: any = '' // 会议名称
  /******************** 初始化声明 ******************/
  ConsumerDetailsList: any = {
    list: [],
    totalPages: 0,
    currentPage: 1
  }
  // 查询条件
  getUserData: any = {
    pageNum: '1',//页码
    pageSize: '10',//每页条数
    searchmonth: this.monthSt, //查询时间
    realName: ''
  }

  /* 总消耗分钟数  总金额  */
  allTimeAmount: any = {
    allTime: '',
    allAmount: ''
  }

  public loginUserData = this.commonService.getLoginMsg();
  entId: any = this.loginUserData.entId;
  userId: any = this.loginUserData.userId;
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient,
    private commonService: CommonService,
    private confirmServ: NzModalService,
    private _notification: NzNotificationService
  ) {
  }

  ngOnInit() {
    this.getSixMonth(); //获取当前日期为前六个月的时间
    this.getMeetingList(); //获取数据列表
    this.getUserbills(); //查询个人消费详单的汇总
  }
  /* 获取当前日期为前六个月的时间 */
  getSixMonth() {
    let date = new Date();
    this.sixMonthArr = this.commonService.addMonthFn(date, 6);
    this.monthSt = this.sixMonthArr[0].date;
    this.getUserData.searchmonth = this.monthSt;
  }
  /* 下拉选择日期 */
  SelectMonthFn(item) {
    this.monthSt = item;
    this.getUserData.searchmonth = this.monthSt;
    this.getMeetingList();
  }
  /* 获取数据 会议详单*/
  getMeetingList() {
    let getData = this.commonService.formObject(this.getUserData);
    this.http.get('/uc/ents/' + this.userId + '/userbills/detail' + getData).subscribe(
      res => {
        let datalist: any = res;
        if (datalist.code == 200) {
          this.ConsumerDetailsList.list = datalist.data.list;
        }
      },
      err => {
        console.log(err);
      }
    );
  }
  //分页
  pageChanged(pagenum: any) {
    this.getUserData.pageNum = pagenum;
    this.getMeetingList();
  }
  /* 会议名称搜索 */
  changeSearchFn() {
    this.getUserData.realName = this.monSelectName;
    this.getMeetingList();
  }
  /* 查询个人消费详单的汇总 */
  getUserbills() {
    this.http.get('/uc/ents/' + this.userId + '/userbills/collect?searchmonth=' + this.monthSt).subscribe(
      res => {
        let datalist: any = res;
        if (datalist.code == 200) {
          this.allTimeAmount.allTime = this.commonService.getTimeCode(datalist.data.allTime);
          this.allTimeAmount.allAmount = datalist.data.allAmount;
        }
      },
      err => {
        console.log(err);
      }
    );
  }

}
