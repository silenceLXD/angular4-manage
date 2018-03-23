import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '@services/common.service';
import {NzModalService} from 'ng-zorro-antd';
import {NzNotificationService} from 'ng-zorro-antd';
import * as $ from 'jquery';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-recharge',
  templateUrl: './recharge.component.html',
  styleUrls: ['./recharge.component.css']
})
export class RechargeComponent implements OnInit {
  public loginUserData = this.commonService.getLoginMsg();
  ENTID = this.loginUserData.entId;//loginUserData.entId
  USERID = this.loginUserData.userId;//loginUserData.userId
  receivable: any;

  constructor(private http: HttpClient,
              private _activatedRoute: ActivatedRoute,
              private commonService: CommonService,
              private confirmServ: NzModalService,
              private _notification: NzNotificationService) {
  }

  rechargeMoney: any = 10000;//默认充值金额选择
  ngOnInit() {
    this._activatedRoute.params.subscribe(params => {
      this.receivable = params['receivable'];
    });
    if (this.receivable) {
      this.inputMoney = this.receivable;
      this.inputMoneyFn(this.inputMoney);
    } else {
      this.inputMoney = '';
    }
  }

  //充值金额切换
  changeMoney = function (money: any) {
    this.rechargeMoney = money;
    this.inputMoney = '';
  };
  inputMoney: any;
  inputMoneyFn = function (money: any) {
    this.rechargeMoney = money;
  };
  returnHtml: any;

  goAliPayFn() {
    let aliPayStr = this.ENTID + ',' + this.rechargeMoney + ',' + this.USERID + ',0,0,0.01';
    this.http.post('/uc/alipay/goPay/' + this.rechargeMoney + '/' + aliPayStr, '').subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == '200') {
          this.returnHtml = resultData.data;
          // $("#resultHtml").html(resultData.data);
          $('#resultHtml').append(resultData.data);
        }
      },
      err => {
        console.log(err);
      });
  }
}
