import {Component, OnInit, OnDestroy} from '@angular/core';
import {FormBuilder, FormGroup, FormControl} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {Router, ActivatedRoute} from '@angular/router';
import {CommonService} from '@services/common.service';
import {NzModalService} from 'ng-zorro-antd';
import {NzNotificationService} from 'ng-zorro-antd';

@Component({
  selector: 'app-history-schedule',
  templateUrl: './history-schedule.component.html',
  styleUrls: ['./history-schedule.component.css']
})
export class HistoryScheduleComponent implements OnInit, OnDestroy {
  private UpdateType: any;//角色admin／user
  private sub: any;// 传递参数对象

  public loginUserData = this.commonService.getLoginMsg();
  ENTID = this.loginUserData.entId;//loginUserData.entId

  searchData: any;
  _startDate;
  sevenDays;
  _endDate = new Date();

  constructor(private fb: FormBuilder,
              private router: Router,
              private http: HttpClient,
              private _activatedRoute: ActivatedRoute,
              private commonService: CommonService,
              private confirmServ: NzModalService,
              private _notification: NzNotificationService) {
    this.sub = this._activatedRoute.params.subscribe(params => {
      this.UpdateType = params['type'];
    });

    this.sevenDays = new Date(this._endDate);
    this.sevenDays.setDate(this._endDate.getDate() - 7);
    this._startDate = this.sevenDays;
    //查询数据数初始化
    this.searchData = {
      startTime: this.commonService.formatDate(this._startDate) + ' 00:00:00', //查询开始时间
      endTime: this.commonService.formatDate(this._endDate) + ' 23:59:59', //查询结束时间
      pageNum: '1', //第几页
      pageSize: '10',  //每页多少条
      appointmentName: ''//会议名称
    };
  }

  /******* 日期选择器 start ******/
  _startValueChange = () => {
    if (this._startDate > this._endDate) {
      this._endDate = null;
    }
    this.searchData.startTime = this.commonService.formatDate(this._startDate) + ' 00:00:00';
    // console.log(this._startDate);
    this.dataSearchFn();
  };
  _endValueChange = () => {
    this.searchData.endTime = this.commonService.formatDate(this._endDate) + ' 23:59:59';
    if (new Date(this.commonService.formatDate(this._startDate) + ' 00:00:00') > this._endDate) {
      this._startDate = null;
    }
    this.dataSearchFn();
  };
  _disabledStartDate = (startValue) => {
    if (!startValue || !this._endDate) {
      return false;
    }
    return startValue && startValue.getTime() > this._endDate;
    // return startValue.getTime() >= this._endDate.getTime();
  };
  _disabledEndDate = (endValue) => {
    if (!endValue || !this._startDate) {
      return false;
    }
    return endValue && endValue.getTime() > Date.now();
    // return endValue.getTime() <= this._startDate.getTime();
  };
  /****** 日期选择器 end ******/
  /******************** 初始化声明 ******************/

    // =======表格显示数据
  public tableData: any = {//表格数据
    list: [],
    totalPages: 0,
    currentPage: 1
  };

  ngOnInit() {
    this.getTableDataFn();//页面加载 渲染表格
  }

  /* 表格列表数据初始化 */
  getTableDataFn() {
    let getData = this.commonService.formObject(this.searchData);
    return this.http.get('/uc/' + this.ENTID + '/appointments/history' + getData).subscribe(
      res => {
        let resultData: any = res;
        this.tableData = {
          list: resultData.data.list,
          totalPages: resultData.data.total,
          currentPage: resultData.data.pageNum
        };
      },
      err => {
        console.log(err);
      }
    );
  }

  //分页
  pageChanged(pagenum: any) {
    this.searchData.pageNum = pagenum;
    // alert(pagenum)
    this.tableData.currentPage = pagenum;
    this.getTableDataFn();
  }

  //查询
  dataSearchFn() {
    this.getTableDataFn();
  }

  /************** 初始化 end ****************/
  /**** 操作 ***/
  //再次预约
  instantMeetingFn() {

  }

  //组件卸载的时候取消订阅
  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
