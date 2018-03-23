import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {Router} from '@angular/router';
import {CommonService} from '@services/common.service';
import {NzModalService} from 'ng-zorro-antd';
import {NzNotificationService} from 'ng-zorro-antd';
import * as $ from 'jquery';

@Component({
  selector: 'app-payinfo',
  templateUrl: './payinfo.component.html',
  styleUrls: ['./payinfo.component.css']
})
export class PayinfoComponent implements OnInit {
  public loginUserData = this.commonService.getLoginMsg();
  ENTID = this.loginUserData.entId; // 登录者entId
  USERID = this.loginUserData.userId; // 登录者userid

  private orderNo: number; // 订单号 orderorderNo
  private sub: any; // 传递参数对象
  // 账户和支付宝的选择
  ableSurePayFn: any = {
    balancePay: false,
    alipayPay: false
  };
  ablePayBool = true;

  constructor(private _activatedRoute: ActivatedRoute,
              private http: HttpClient,
              private router: Router,
              private commonService: CommonService,
              private confirmServ: NzModalService,
              private _notification: NzNotificationService) {
  }

  ngOnInit() {
    this.sub = this._activatedRoute.params.subscribe(params => {
      this.orderNo = params['orderNo'];
    });
    this.getOrderDetailFn();

    this.getAccountMoney();
    this.setAbleSurePayFn();
    // if(this.chooseBalance){
    //   if(this.accountData >= this.orderdata.amount){
    // 		this.aliPayAmount = this.orderdata.amount - this.accountData;
    // 	}
    // }
  }

  isshowOrderDetail: boolean = false;//默认不显示订单详情
  ischeckedPay: boolean = false;//默认不现实余额支付
  // 根据订单号orderNo查询订单详情
  orderdata: any = {//订单详情数据
    orderState: '',
    product: {
      communicationPrice: '',
      detailList: []
    },
  };

  getOrderDetailFn() {
    return this.http.get('/uc/order/' + this.orderNo + '/detail').subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == '200') {
          this.orderdata = resultData.data;
        }
      },
      err => {
        console.log('查询订单详情err....');
      });
  }

  //根据企业id获取企业账户可用余额  entid
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

  /************* 第二种支付方式 余额支付 金额 **********/
    // aliPayAmount = 0;
  payMoney: any = {'balancePay': 0, 'alipayPay': 0};

  //余额支付
  chooseBalance: boolean = false; // 是否选择余额支付
  chooseBalanceFn(ischecked: any) {
    this.ableSurePayFn.balancePay = ischecked;
    if (ischecked) {
      //if 余额>=订单金额
      if (this.accountData >= this.orderdata.amount) {
        //余额支付金额=订单金额
        this.payMoney.balancePay = this.orderdata.amount;
        this.payMoney.alipayPay = 0;
      } else {
        //余额支付金额=账号余额
        this.payMoney.balancePay = this.accountData;
      }
    } else {
      this.payMoney.balancePay = 0;
      //支付宝支付金额=订单金额
      this.payMoney.alipayPay = this.orderdata.amount;
    }
    this.setAbleSurePayFn();
  }

  //支付宝支付
  chooseAlipayFn(ischecked: any) {
    this.ableSurePayFn.alipayPay = ischecked;
    if (ischecked) {
      //支付宝支付金额=订单金额-余额支付金额
      this.payMoney.alipayPay = this.orderdata.amount - this.payMoney.balancePay;
    } else {
      this.payMoney.alipayPay = 0;
    }
    this.setAbleSurePayFn();
  }

  // 确认支付按钮的禁用
  setAbleSurePayFn() {
    if (this.ableSurePayFn.alipayPay) {
      this.ablePayBool = false;
    } else {
      if (!this.ableSurePayFn.balancePay) {
        this.ablePayBool = true;
      } else {
        if (this.accountData < this.orderdata.amount) {
          this.ablePayBool = true;
        } else {
          this.ablePayBool = false;
        }
      }
    }
    // this.ablePayBool
  }

  //确认支付
  surePayFn() {
    let balanceData = {
      orderNo: this.orderdata.orderNo,//订单号
      receipts: this.payMoney.balancePay//本次收款金额
    };
    let total = parseFloat(this.payMoney.balancePay) + parseFloat(this.payMoney.alipayPay);//支付总额
    /*if 余额支付金额==订单金额  直接走账户支付方法
      消费类型:consumeType 7-订单充值
    */
    if (this.payMoney.balancePay == this.orderdata.amount) {
      this.http.post('/uc/order/' + this.orderdata.orderNo + '/receipt', balanceData).subscribe(
        res => {
          let resultData: any = res;
          if (resultData.code == '200') {
            this.commonService.setServiceSecondsChange.emit();
            this._notification.create('success', resultData.msg, '');
            this.router.navigateByUrl('/page/order-list');
          } else {
            this._notification.create('error', resultData.msg, '');
          }
        },
        err => {
          console.log(err);
        });
    } else if (total < this.orderdata.amount && total != 0) {
      this._notification.create('error', '账户余额不足', '');
    } else {//支付宝支付方法entId,alipayPay,userId,orderNo,amount,productType
      let aliPayStr = this.ENTID + ',' + this.payMoney.alipayPay + ',' + this.USERID + ',' + this.orderdata.orderNo + ',' + this.orderdata.amount + ',' + this.orderdata.productType;
      this.http.post('/uc/alipay/goPay/' + this.payMoney.alipayPay + '/' + aliPayStr, '').subscribe(
        res => {
          let resultData: any = res;
          if (resultData.code == '200') {
            $('#resultHtml').append(resultData.data);
          }
        },
        err => {
          console.log(err);
        });
    }
  }

  //组件卸载的时候取消订阅
  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

}
