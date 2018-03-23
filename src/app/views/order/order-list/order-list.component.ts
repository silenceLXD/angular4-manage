import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormControl} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '@services/common.service';
import {NzModalService} from 'ng-zorro-antd';
import {NzNotificationService} from 'ng-zorro-antd';


@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {
  public loginUserData = this.commonService.getLoginMsg();
  ENTID = this.loginUserData.entId;//loginUserData.entId

  searchData: any;
  nowFormatTimes: any;

  constructor(private router: Router,
              private _activatedRoute: ActivatedRoute,
              private http: HttpClient,
              private commonService: CommonService,
              private confirmServ: NzModalService,
              private _notification: NzNotificationService) {
    //查询数据数初始化
    this.searchData = {
      searchStr: '',//套餐名称
      orderState: '-1',//订单状态
      startTime: ''//下单时间
    };
    this.nowFormatTimes = new Date().getTime();
  }

  /******************** 初始化声明 ******************/
    // =======表格显示数据
  public tableData: any = {//表格数据
    list: [],
    totalPages: 0,
    currentPage: 1
  };
  //当前年份
  currentYear = new Date().getFullYear();
  yearList = [this.currentYear, this.currentYear - 1, this.currentYear - 2];

  ngOnInit() {
    this._activatedRoute.queryParams.subscribe(queryParams => {
      this.searchData.orderState = queryParams['orderStateValue'] || '-1';
    });
    this.getTableDataFn();//页面加载 渲染表格
  }

  /* 表格列表数据初始化 */
  pageNum = '1'; //第几页
  pageSize = '10'; //每页多少条
  getTableDataFn() {
    let getData = this.commonService.formObject(this.searchData);
    return this.http.get('/uc/order/' + this.pageNum + '/' + this.pageSize + getData).subscribe(
      res => {
        let resultData: any = res;
        if (resultData.data.list.length != 0) {
          this.tableData = {
            list: resultData.data.list,
            totalPages: resultData.data.total,
            currentPage: resultData.data.pageNum
          };
        }
        else {
          this.tableData = {
            list: [],
            totalPages: 0,
            currentPage: 1
          };
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

  /************* 操作订单 *************/
  deleteModal: boolean = false;
  //删除订单
  deleteOrderFn = (orderNo: any) => {
    this.confirmServ.confirm({
      title: '删除',
      content: '是否确认删除订单？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        await this.deleOrder(orderNo);
      },
      onCancel() {
      }
    });
  };

  deleOrder(orderNo: any) {
    this.http.post('/uc/order/' + orderNo, '').subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == '200') {
          this._notification.create('success', '删除成功', '');
          this.getTableDataFn();
        } else {
          this._notification.create('error', '删除失败', '');
        }
      },
      err => {
        console.log(err);
      });
  }

  //取消订单
  cancelOrderFn = (orderNo: any) => {
    this.confirmServ.confirm({
      title: '取消',
      content: '是否确认取消订单？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        await this.cancelOrder(orderNo);
      },
      onCancel() {
      }
    });
  };

  cancelOrder(orderNo: any) {
    this.http.post('/uc/order/' + orderNo + '/cancel', '').subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == '200') {
          this._notification.create('success', '取消成功', '');
          this.getTableDataFn();
        } else {
          this._notification.create('error', '取消失败', '');
        }
      },
      err => {
        console.log(err);
      });
  }

  // 续费 按钮  判断是否存在续费订单
  renewalsFn(orderNo: any, pid: any) {
    this.http.get('/uc/order/' + orderNo + '/exist/delay').subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == '200') {
          this.router.navigate(['/page/product-detail', pid], {queryParams: {orderNo: orderNo}});
          // 1商品下架，2已存在续费订单
          // if(resultData.data=='1'||resultData.data=='2'){
          //   this._notification.create('error',resultData.msg ,'');
          // }else if(resultData.data==3){//3可以续费 跳转到商品详情页面
          //     this.router.navigate(['/page/product-detail',pid]);
          // }else{
          //   this._notification.create('error', '操作失败','');
          // }
        } else {
          this._notification.create('error', resultData.msg, '');
        }

      },
      err => {
        console.log(err);
      });
  }

  // 再次购买 按钮  跳转到商品详情页面
  buyAgainFn(orderNo: any, pid: any) {
    this.http.get('/uc/order/' + this.ENTID + '/buy/' + pid + '/again').subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == '200') {
          this.router.navigate(['/page/product-detail', pid]);
          // // 1商品下架，2已存在有效订单
          // if(resultData.data==1||resultData.data==2){
          //   this._notification.create('error',resultData.msg ,'');
          // }else if(resultData.data==3){//3可以续费 跳转到商品详情页面
          //     this.router.navigate(['/page/product-detail',pid]);
          // }else{
          //   this._notification.create('error', '操作失败','');
          // }
        } else {
          this._notification.create('error', resultData.msg, '');
        }
      },
      err => {
        console.log(err);
      });
  }

  //支付 按钮
}
