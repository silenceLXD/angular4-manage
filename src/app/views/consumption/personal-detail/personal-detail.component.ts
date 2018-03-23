import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormControl} from '@angular/forms';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '@services/common.service';
import {NzModalService} from 'ng-zorro-antd';
import {NzNotificationService} from 'ng-zorro-antd';

@Component({
  selector: 'app-personal-detail',
  templateUrl: './personal-detail.component.html',
  styleUrls: ['./personal-detail.component.css']
})
export class PersonalDetailComponent implements OnInit {

  isViewDetail: boolean = false;  // 是否点击了查看详情 ，  false是没有点击
  isActive: any = '2'; //企业和个人详单切换
  isEntActive: any = '3'; //会议详单：3 ，直播详单：4，点播详单：5，切换
  sixMonthArr: any = '';  //获取当前日期前六个月的时间
  monthSt: any = ''; //当前选择月份
  monSelectName: any = ''; // 姓名
  /******************** 初始化声明 ******************/
  ConsumerDetailsList: any = {
    list: [],
    totalPages: 0,
    currentPage: 1
  };
  // 查询条件
  getUserData: any = {
    pageNum: '1',//页码
    pageSize: '10',//每页条数
    searchmonth: this.monthSt, //查询时间
    realName: '',
    deptId: ''
  };

  public loginUserData = this.commonService.getLoginMsg();
  entId: any = this.loginUserData.entId;
  userId: any = this.loginUserData.userId;

  constructor(private router: Router,
              private fb: FormBuilder,
              private http: HttpClient,
              private commonService: CommonService,
              private confirmServ: NzModalService,
              private _notification: NzNotificationService) {
  }

  ngOnInit() {
    this.getSixMonth(); // 获取当前日期为前六个月的时间
    this.getMeetingList(); // 获取数据列表
    this.getOneOrganization(); // 一级部门选择
  }

  /* 获取当前日期为前六个月的时间 */
  getSixMonth() {
    const date = new Date();
    this.sixMonthArr = this.commonService.addMonthFn(date, 6);
    this.monthSt = this.sixMonthArr[0].date;
    this.getUserData.searchmonth = this.monthSt;
    this.getUserDataDetail.searchmonth = this.monthSt;
  }

  /* 下拉选择日期 */
  SelectMonthFn(item) {
    this.monthSt = item;
    this.getUserData.searchmonth = this.monthSt;
    this.getUserDataDetail.searchmonth = this.monthSt;
    this.getMeetingList();
  }

  /* 会议详单，直播详单，点播详单切换 */
  changeEntTab(value: any) {
    this.isEntActive = value;
    this.ConsumerDetailsList.list = [];
    this.getMeetingList();
  }

  /* 获取数据 会议详单*/
  getMeetingList() {
    let getData = this.commonService.formObject(this.getUserData);
    this.http.get('/uc/users/' + this.entId + '/participant/detail' + getData).subscribe(
      res => {
        // console.log(res);
        let datalist: any = res;
        if (datalist.code == 200) {
          // this.ConsumerDetailsList.list = datalist.data.list;
          this.ConsumerDetailsList.list = datalist.data.pageInfo.list;
          this.allTimeAmount.allTime = this.commonService.getTimeCode(datalist.data.conferenceMap.allTime);
          this.allTimeAmount.allAmount = datalist.data.conferenceMap.allAmount;
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

  /* 姓名搜索 */
  changeSearchFn() {
    this.getUserData.realName = this.monSelectName;
    this.getMeetingList();
  }

  /* 个人详单 企业详单切换 */
  changeTab(value: any) {
    if (value == '1') {
      this.router.navigateByUrl('/page/consumption-detail');
    } else if (value == '2') {
      // this.router.navigateByUrl('/page/personal-consumption');
    }
  }

  /* 查询个人消费详单的汇总 */
  /* 总消耗分钟数  总金额  */
  allTimeAmount: any = {
    allTime: '',
    allAmount: ''
  };

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

  /******************* 查看详情 *******************/
  ConsumerDetailsListDetail: any = {
    list: [],
    totalPages: 0,
    currentPage: 1
  };
  // 查看详情- 查询条件
  getUserDataDetail: any = {
    pageNum: '1', // 页码
    pageSize: '10', // 每页条数
    searchmonth: this.monthSt, // 查询时间
    meetingName: '' // 查询会议
  };
  //回显数据
  ConsumerDetailsEcho: any = {
    realName: '',
    deptName: '',
    consumeTime: '',
    billAmount: ''
  };
  consumeTimeDetal: any; //消耗分钟数
  entLookBtn(list: any) {
    this.ConsumerDetailsEcho = list;
    this.consumeTimeDetal = this.commonService.getTimeCode(list.consumeTime);
    // this.ConsumerDetailsEcho.consumeTime = this.commonService.getTimeCode(list.consumeTime);
    this.isViewDetail = true;
    const getData = this.commonService.formObject(this.getUserDataDetail);
    this.http.get('/uc/ents/' + list.userId + '/userbills/detail' + getData).subscribe(
      res => {
        let datalist: any = res;
        if (datalist.code == 200) {
          this.ConsumerDetailsListDetail.list = datalist.data.list;
          this.ConsumerDetailsListDetail.totalPages = datalist.data.total;
          this.ConsumerDetailsListDetail.currentPage = datalist.data.pageNum;
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  // 按查找
  dataSearchFn() {
    this.entLookBtn(this.ConsumerDetailsEcho);
  }

  // 分页
  pageChangedDetails(pagenum) {
    this.getUserDataDetail.pageNum = pagenum;
    this.dataSearchFn();
  }

  /* 一级部门选择 */
  oneDepartmentList: any = [];
  deptName: any; //选中的部门
  getOneOrganization() {
    this.http.get('/uc/organization/select/' + this.entId).subscribe(
      res => {
        // console.log(res);
        let datalist: any = res;
        if (datalist.code == 200) {
          this.oneDepartmentList = datalist.data;
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  /* 选中的一级部门的 change 事件 */
  getSecondDepat(value: any) {
    if (value != '') {
      this.getUserData.deptId = value;
    }
    this.getMeetingList();
  }

  /* 下载消费明细 */
  downEntExcel() {
    let url = '/uc/ents/exportUserBill?entId=' + this.entId + '&userId=' + this.userId + '&searchmonth=' + this.monthSt;
    this.commonService.downloadExport(url, '消费明细');
  }

}
