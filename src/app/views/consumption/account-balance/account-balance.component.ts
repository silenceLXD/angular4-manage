import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '@services/common.service';
import { NzModalService } from 'ng-zorro-antd';
import { NzNotificationService } from 'ng-zorro-antd';
@Component({
  selector: 'app-account-balance',
  templateUrl: './account-balance.component.html',
  styleUrls: ['./account-balance.component.css']
})
export class AccountBalanceComponent implements OnInit {
  public loginUserData = this.commonService.getLoginMsg();
  ENTID = this.loginUserData.entId;//loginUserData.entId

  searchData: any;
  _startDate = null;
  // sevenDays;
  _endDate = null;
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private commonService: CommonService,
    private confirmServ: NzModalService,
    private _notification: NzNotificationService
  ) {
    // this.sevenDays = new Date(this._startDate);
    // this.sevenDays.setDate(this._startDate.getDate()-7);
    // this._endDate = this.sevenDays;
    //查询数据数初始化
    this.searchData = {
      startTime: '', //查询开始时间
      endTime: '', //查询结束时间
      accountNumber: ''//企业id
    }
  }

  /******* 日期选择器 start ******/
  _startValueChange = () => {
    if (this._startDate > this._endDate) {
      this._endDate = null;
    }
    this.searchData.startTime = this.commonService.formatDate(this._startDate);
    // console.log(this._startDate);
  };
  _endValueChange = () => {
    this.searchData.endTime = this.commonService.formatDate(this._endDate);
    if (new Date(this.commonService.formatDate(this._startDate) + ' 00:00:00') > this._endDate) {
      this._startDate = null;
    }
    this.dataSearchFn();
  };
  _disabledStartDate = (startValue) => {
    if (!startValue || !this._endDate) {
      return false;
    }
    return startValue.getTime() > this._endDate.getTime();
    // return startValue.getTime() >= this._endDate.getTime();
  };
  _disabledEndDate = (endValue) => {
    if (!endValue || !this._startDate) {
      return false;
    }
    return endValue.getTime() < this._startDate.getTime();
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
    this.getAccountMoney();
    this.getTableDataFn();//页面加载 渲染表格

  }
  pageNum = '1'; //第几页
  pageSize = '10';  //每页多少条
  /* 表格列表数据初始化 */
  getTableDataFn() {
    this.searchData.accountNumber = this.ENTID;
    let getData = this.commonService.formObject(this.searchData)
    return this.http.get('/uc/account/detail/' + this.pageNum + '/' + this.pageSize + getData).subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == '200') {
          let newData: any = JSON.parse(resultData.data);
          if (newData.list.list.length != 0) {
            this.tableData = {
              list: newData.list.list,
              totalPages: newData.list.total,
              currentPage: newData.list.pageNum
            };
            this.tableData.list = newData.list.list.filter(obj => {
              return +obj.accrual !== 0;
            });
          }
          else {
            this.tableData = {
              list: [],
              totalPages: 0,
              currentPage: 1
            }
          }
        }
      },
      err => {
        console.log(err);
      });
  }

  //分页
  pageChanged(pagenum: any) {
    this.pageNum = pagenum;
    // alert(pagenum)
    this.tableData.currentPage = pagenum;
    this.getTableDataFn();
  }
  //查询
  dataSearchFn() {
    this.getTableDataFn();
  }
  /************** 初始化 end ****************/
  //根据企业id获取企业可用余额  账号id
  accountData: any = 0;//余额
  getAccountMoney() {
    this.http.get('/uc/account/' + this.ENTID + '/avaible-blance').subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == '200') {
          this.accountData = resultData.data;
        }
      },
      err => {
        console.log(err);
      });
  }

}
