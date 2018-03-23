import { Component, OnInit, OnDestroy, EventEmitter, Output  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import  * as $ from  'jquery';

@Component({
  selector: 'setup-one',
  template: `
  <h4 class="setup-title"><span class="setup-icon setup-lock-icon"></span> 填写账户信息</h4>
  <div class="" >
    <form class="form-horizontal" name="setupOneForm">
      <div class="form-group">
        <div class="col-xs-12">
          <input type="text" class="form-control input-radius" name="account" [(ngModel)]="account" value="" placeholder="请输入邮箱或手机号">
        </div>
      </div>
      <div class="form-group">
        <div class="col-xs-8" >
            <input type="text" class="form-control input-radius" id="Code" name="picCode" [(ngModel)]="picCode" required="" placeholder="请输入验证码" maxlength="4" >
        </div>
        <div class="col-xs-3">
          <div class="verifycode" id="verifycode" >
            <img id="imgId" alt="验证码" [src]="oImgSrc" (click)="changeCodeImg()">
          </div>
        </div>
        <p class="col-xs-12 error">{{errorMsg}}</p>
      </div>
      <div class="form-group">
        <div class="col-xs-12">
            <button type="submit" name="button" class="btn btn-svoc setup-btn" (click)="toNextStep()">下一步</button>
            <div style="margin-top: 10px;">
                <p class="pull-right forgetpsd" style="color:#000;">已有账号？<a routerLink="/login">登 录</a></p>
            </div>
        </div>
      </div>
    </form>
  </div>
  `,
  styleUrls: ['./forget-psd.component.css']
})
export class SetupOneComponent implements OnInit {

  constructor(private http: HttpClient) { }
  @Output() outPutSetupOneData:EventEmitter<any> = new EventEmitter();//子传父

  private timestamp:number;//生成图片验证码时的时间戳
  public captchaUrl  = environment.apiBase+'/uc/captcha';//验证码图片初始化

  // 所填写信息数据
  private account:string;//账户
  private picCode:string;//密码
  private accountType:string;//账户类型
  public errorMsg:string;//错误提示
  public accountData:any = {
    account:'',
    picCode:'',
    type:'',
    randomStr:'',
    userId:'',
    next:false
  }
  ngOnInit() {
    //this.outPutSetupOneData.emit(this.accountData);
    this.changeCodeImg();
  }

  //下一步(向父组件传递数据)
  toNextStep() {
    //下一步之前先判断用户输入的是手机号还是邮箱
    this.accountData = {
      account:this.account,
      picCode:this.picCode,
      type:this.accountValidator(this.account),
      randomStr:this.timestamp,
      userId:'',//用户id
      next:true
    }
    if(this.accountValidator(this.account) == 'error'){
      this.errorMsg = "输入账户格式有误，请重新输入"
    }else{
      let postData = {account:this.account,picCode:this.picCode,randomStr:this.timestamp+''};
      this.http.post('/uc/user/forget/pwd/verify/account',postData).subscribe(
        res => {
          let resData:any = res;
          if(resData.code == 200){
            this.accountData.userId = resData.data.userId;
            this.outPutSetupOneData.emit(this.accountData);
          }
        },
        err => {
          console.log(err);
        });
    }

  }
  accountValidator(val) {
    let resultType;
    // 手机号码正则
    const mobieReg = /^1(3|4|5|7|8)+\d{9}$/;
    // 邮箱正则
    const emailReg = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    if(mobieReg.test(val)){
      resultType = "phone";
    }else if(emailReg.test(val)){
      resultType = "email";
    }else{
      resultType = "error";
    }
    return resultType
  }
  //点击更换验证码
  oImgSrc:string;
  changeCodeImg() {
      this.timestamp = (new Date()).valueOf();
      this.oImgSrc = this.captchaUrl+"/"+this.timestamp
  }

}
