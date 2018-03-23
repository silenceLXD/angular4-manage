import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '@services/common.service';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent implements OnInit {
  public loginUserData = this.commonService.getLoginMsg();
  ENTID = this.loginUserData.entId;//loginUserData.entId
  serviceState: any;//服务状态
  constructor(private http: HttpClient,
              private commonService: CommonService) {
    /*commonService.entServiceData.subscribe((value: number) => {
      this.serviceState = value;
    });*/
  }

  ngOnInit() {
    this.getIndexDataFn();
    this.serviceState = localStorage.setEntServiceData;
    this.commonService.entServiceData.subscribe(value => {
      localStorage.setEntServiceData = value;
      this.serviceState = localStorage.setEntServiceData;
    });
    // this.serviceState = 5;
  }


  //企业管理员首页数据
  serviceData: any = {
    orderCount: '0',//待处理订单
    conferenceCount: '0',//进行中的会议

    startServiceTime: new Date().getTime(),//有效期开始时间
    finishServiceTime: new Date().getTime(),//有效期结束时间
    servicesDay: '0',//有效期时间剩余
    usedSpace: '0',//云存储空间 已使用（单位 b/1024/1024/1024）
    cloudSpace: '0',//云存储空间 总量
    account: '0',//账户余额
    productType: 3,//套餐类型
    usedFlow: 0,//已使用流量
    usedTime: 0,//已使用时间

    inServiceOrder: []//服务中的产品
  };

  getIndexDataFn() {
    return this.http.get('/uc/order/index').subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == 200) {
          // this.indexData = resultData.data;
          this.serviceData.orderCount = resultData.data.orderCount;
          this.serviceData.conferenceCount = resultData.data.conferenceCount;
          this.serviceData.startServiceTime = resultData.data.startServiceTime;
          this.serviceData.finishServiceTime = resultData.data.finishServiceTime;
          this.serviceData.servicesDay = resultData.data.servicesDay;
          this.serviceData.usedSpace = (resultData.data.usedSpace / 1024 / 1024 / 1024).toFixed(2);
          this.serviceData.cloudSpace = resultData.data.cloudSpace;
          this.serviceData.account = resultData.data.account;
          this.serviceData.productType = resultData.data.productType;
          this.serviceData.usedFlow = resultData.data.usedFlow;
          this.serviceData.usedTime = resultData.data.usedTime;

          this.serviceData.inServiceOrder = resultData.data.inServiceOrder;

        }
      },
      err => {
        console.log(err);
      });
  }


  //充值页面跳转
  toReCharge() {

  }
}
