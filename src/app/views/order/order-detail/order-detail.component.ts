import {Component, OnInit, EventEmitter} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {ActivatedRoute} from '@angular/router';
import {CommonService} from '@services/common.service';
import {NzModalService} from 'ng-zorro-antd';
import {NzNotificationService} from 'ng-zorro-antd';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit {
  public loginUserData = this.commonService.getLoginMsg();
  ENTID = this.loginUserData.entId;//loginUserData.entId
  private orderNo: number;//订单号 order
  private sub: any;// 传递参数对象
  isWrap: boolean; // 屏蔽层
  nowFormatTimes: any;

  constructor(private router: Router,
              private _activatedRoute: ActivatedRoute,
              private http: HttpClient,
              private commonService: CommonService,
              private confirmServ: NzModalService,
              private _notification: NzNotificationService) {
    //获取当前时间(时间戳)
    this.nowFormatTimes = new Date().getTime();
  }

  ngOnInit() {
    this.sub = this._activatedRoute.params.subscribe(params => {
      this.orderNo = params['orderNo'];
      // console.log(`获取的参数orderNo:${this.orderNo}`)
    });
    this.getOrderDetailFn();
  }

  // 根据订单号orderNo查询订单详情
  // order/{orderNo}/detail
  detailData: any = {//订单详情数据
    orderState: '',
    product: {
      communicationPrice: '',
      detailList: []
    },
  };
  // detailListData:any={
  //   communicationPrice:''
  // };
  getOrderDetailFn() {
    return this.http.get('/uc/order/' + this.orderNo + '/detail').subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == '200') {
          this.detailData = resultData.data;
          // this.detailListData = resultData.data.product.detailList;
        }
      },
      err => {
        console.log('查询订单详情err....');
      });
  }

  /*****************************/

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

  deleteModal: boolean = false;
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
          this.getOrderDetailFn();
        } else {
          this._notification.create('error', '取消失败', '');
        }
      },
      err => {
        console.log(err);
      });
  }

  //打印订单
  printitFn() {
    this.isWrap = true;
    // let prnhtml = this.innerHTML;
    let bdhtml = document.getElementById('printCon').innerHTML;
    // let bdhtml=window.document.body.innerHTML;
    let sprnstr = '<!--startprint-->';
    let eprnstr = '<!--endprint-->';
    let prnhtml = bdhtml.substring(bdhtml.indexOf(sprnstr) + 17);

    prnhtml = prnhtml.substring(0, prnhtml.indexOf(eprnstr));
    let newwindow = window.open('', '打印订单');

    newwindow.document.write(bdhtml);
    setTimeout(() => {
      newwindow.window.print();
      newwindow.window.close();
      this.isWrap = false;
    }, 50);

    // this.isWrap = false;
    /* const newWindow = window.open('打印窗口', '_blank');
     newWindow.document.write(bdhtml);
     console.log(newWindow);*/
    // newWindow.document.getElementById('btn').click();
    // newWindow.print();
  }

  //组件卸载的时候取消订阅
  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
