import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '@services/common.service';
import { NzModalService } from 'ng-zorro-antd';
import { NzNotificationService } from 'ng-zorro-antd';

@Component({
  selector: 'app-consumption-detail',
  templateUrl: './consumption-detail.component.html',
  styleUrls: ['./consumption-detail.component.css']
})
export class ConsumptionDetailComponent implements OnInit {

  isViewDetail: boolean = false;  // 是否点击了查看详情 ，  false是没有点击
  isActive: any = '1'; //企业和个人详单切换
  isEntActive: any = '3'; //月租费用详单：3 ，会议详单：4，直播详单：5，点播详单 ：6切换
  sixMonthArr: any = '';  //获取当前日期前六个月的时间
  monthSt: any = ''; //当前选择月份
  monSelectName: any = '' // 会议名称
  /******************** 初始化声明 ******************/
  ConsumerDetailsList: any = {
    list: [],
    totalPages: 0,
    currentPage: 1
  }
  /* 消耗总分钟数及总流量，总金额 */
  ConsumeMinutes: any = {
    minutes: '总金额（元）：0',
    amount: ''
  }

  // 查询条件
  getUserData: any = {
    pageNum: '1',//页码
    pageSize: '10',//每页条数
    searchmonth: this.monthSt,//查询时间
    meetingName: this.monSelectName //会议名称
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

  /* 会议列表 */
  confList: any;
  conferenceMap: any;
  /* 点播列表 */
  fileList: any;
  fileMap: any;
  /* 直播列表 */
  liveList: any;
  liveMap: any;
  /* 月租费用详单  */
  monthList: any;
  monthlyAmount: any;

  ngOnInit() {
    this.getSixMonth(); //获取当前日期为前六个月的时间
    this.getMeetingList(); //获取数据列表
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
  /* 月租费用详单，会议详单，直播详单，点播详单切换 */
  changeEntTab(value: any) {
    this.isEntActive = value;
    this.ConsumerDetailsList.list = [];
    this.ConsumeMinutes.minutes = '';
    this.ConsumeMinutes.amount = '';

    // this.getMeetingList();
    switch (this.isEntActive) {
      case 3:
        // this.ConsumeMinutes.minutes = '总金额（元）：' + this.monthlyAmount;
        this.ConsumerDetailsList.list = this.monthList;
        let Amount = 0;
        for (let i = 0; i < this.monthList.length; i++) {
          Amount += this.monthList[i].billAmount;
        }
        this.ConsumeMinutes.minutes = '总金额（元）：' + Amount;
        break;
      case 4:
        this.ConsumerDetailsList.list = this.confList.list;
        this.ConsumerDetailsList.totalPages = this.confList.total;
        this.ConsumerDetailsList.currentPage = 1;
        this.ConsumeMinutes.minutes = '总消耗分钟数：' + this.commonService.getTimeCode(this.conferenceMap.allTime);
        this.ConsumeMinutes.amount = '总金额（元）：' + this.conferenceMap.allAmount;
        break;
      case 5:
        this.ConsumerDetailsList.list = this.liveList.list;
        this.ConsumerDetailsList.totalPages = this.liveList.total;
        this.ConsumerDetailsList.currentPage = 1;
        if (this.liveMap == undefined) {
          this.ConsumeMinutes.minutes = '总直播流量：0';
          this.ConsumeMinutes.amount = '总金额（元）：0';
        } else {
          this.ConsumeMinutes.minutes = '总直播流量：' + this.commonService.bytesToSize(this.liveMap.liveConsumingTraffic);
          this.ConsumeMinutes.amount = '总金额（元）：' + this.liveMap.amount;
        }
        break;
      case 6:
        this.ConsumerDetailsList.list = this.fileList.list;
        this.ConsumerDetailsList.totalPages = this.fileList.total;
        this.ConsumerDetailsList.currentPage = this.fileList.pageNum;
        this.ConsumeMinutes.minutes = '总点播流量：' + this.commonService.bytesToSize(this.fileMap.recordPlayTraffic);
        this.ConsumeMinutes.amount = '总金额（元）：' + this.fileMap.amount;
        break;
    }
  }
  /* 获取数据 月租费用详单：3 ，会议详单：4，直播详单：5，点播详单 ：6 */
  getMeetingList() {
    let getData = this.commonService.formObject(this.getUserData);
    this.http.get('/uc/ents/' + this.entId + '/entbills/detail' + getData).subscribe(
      res => {
        let datalist: any = res;
        if (datalist.code == 200) {
          this.confList = datalist.data.confList;
          this.conferenceMap = datalist.data.conferenceMap;
          this.fileList = datalist.data.fileList;
          this.fileMap = datalist.data.fileMap;
          this.liveList = datalist.data.liveList;
          this.liveMap = datalist.data.liveMap;
          this.monthList = datalist.data.monthList;
          // this.monthlyAmount = datalist.data.monthlyAmount;
          switch (this.isEntActive) {
            case 3:
              // this.ConsumeMinutes.minutes = '总金额（元）：' + datalist.data.monthlyAmount;
              this.ConsumerDetailsList.list = datalist.data.monthList
              let Amount = 0;
              for (let i = 0; i < this.monthList.length; i++) {
                Amount += this.monthList[i].billAmount;
              }
              this.ConsumeMinutes.minutes = '总金额（元）：' + Amount;
              break;
            case 4:
              this.ConsumerDetailsList.list = datalist.data.confList.list;
              this.ConsumerDetailsList.totalPages = datalist.data.confList.total;
              this.ConsumerDetailsList.currentPage = datalist.data.confList.pageNum;
              this.ConsumeMinutes.minutes = '总消耗分钟数：' + this.commonService.getTimeCode(datalist.data.conferenceMap.allTime);
              this.ConsumeMinutes.amount = '总金额（元）：' + datalist.data.conferenceMap.allAmount;
              break;
            case 5:
              this.ConsumerDetailsList.list = datalist.data.liveList.list;
              this.ConsumerDetailsList.totalPages = datalist.data.liveList.total;
              this.ConsumerDetailsList.currentPage = datalist.data.liveList.pageNum;
              if (datalist.data.liveMap == undefined) {
                this.ConsumeMinutes.minutes = '总直播流量：';
                this.ConsumeMinutes.amount = '总金额（元）：';
              } else {
                this.ConsumeMinutes.minutes = '总直播流量：' + this.commonService.bytesToSize(datalist.data.liveMap.liveConsumingTraffic);
                this.ConsumeMinutes.amount = '总金额（元）：' + datalist.data.liveMap.amount;
              }
              break;
            case 6:
              this.ConsumerDetailsList.list = datalist.data.fileList.list;
              this.ConsumerDetailsList.totalPages = datalist.data.fileList.total;
              this.ConsumerDetailsList.currentPage = datalist.data.fileList.pageNum;
              this.ConsumeMinutes.minutes = '总点播流量：' + this.commonService.bytesToSize(datalist.data.fileMap.recordPlayTraffic);
              this.ConsumeMinutes.amount = '总金额（元）：' + datalist.data.fileMap.amount;
              break;
          }
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
    this.getUserData.meetingName = this.monSelectName;
    this.getMeetingList();
  }
  /* 个人详单 企业详单切换 */
  changeTab(value: any) {
    if (value == '1') {
      this.router.navigateByUrl("/page/consumption-detail");
    } else if (value == '2') {
      // this.router.navigateByUrl("/page/personal-consumption");
      this.router.navigateByUrl("/page/personal-detail");
    }
  }
  /******************* 查看详情 *******************/
  ConsumerDetailsListDetail: any = {
    list: [],
    totalPages: 0,
    currentPage: 1
  }
  // 查看详情- 查询条件
  getUserDataDetail: any = {
    pageNum: '1',//页码
    pageSize: '10',//每页条数
    realName: '',
    searchmonth: this.monthSt //查询时间
  }
  //回显数据
  ConsumerDetailsEcho: any = {
    startTime: '',
    conferenceName: '',
    concurrenceCount: '',
    productName: '',
    resolution: '',
    duration: '',
    consumeTime: '',
    billAmount: ''
  }
  durationDetal: any; // 时长
  consumeTimeDetal: any; //消耗分钟数
  entLookBtn(list: any) {
    this.ConsumerDetailsEcho = list;
    this.durationDetal = this.commonService.getTimeCode(list.duration);
    this.consumeTimeDetal = this.commonService.getTimeCode(list.consumeTime);
    this.isViewDetail = true;
    this.getDetailDataFn(list);
  }
  getDetailDataFn(list:any){
    this.getUserDataDetail.searchmonth = this.monthSt;
    let getData = this.commonService.formObject(this.getUserDataDetail);
    this.http.get('/uc/users/' + list.cid + '/participants' + getData).subscribe(
      res => {
        let datalist: any = res;
        if (datalist.code == 200) {
          this.ConsumerDetailsListDetail.list = datalist.data.list;
          this.ConsumerDetailsListDetail.total = datalist.data.total;
          this.ConsumerDetailsListDetail.totalPages = datalist.data.pageNum;
        }
      },
      err => {
        console.log(err);
      });
  }
  /* 查询 */
  searchDetailByName() {
    this.getDetailDataFn(this.ConsumerDetailsEcho);
  }
  downEntExcel() {
    let url = '/uc/ents/exportUserBill?entId='+this.entId+'&userId='+this.userId+'&searchmonth='+this.monthSt;
    this.commonService.downloadExport(url,'消费明细');
  }
}
