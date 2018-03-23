import { Component, OnInit, OnDestroy, EventEmitter, Output, Input  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import  * as $ from  'jquery';

@Component({
  selector: 'setup-three',
  template: `
  <h4 class="setup-title"><span class="setup-icon setup-edit-icon"></span> 设置新密码</h4>
  <div class="" >
    <form class="form-horizontal" name="setupThreeForm">
      <div class="form-group">
        <div class="col-xs-12">
          <input type="password" class="form-control input-radius" name="newPassword" [(ngModel)]="accountData.newPassword" placeholder="输入新密码">
        </div>
      </div>
      <div class="form-group">
        <div class="col-xs-12">
          <input type="password" class="form-control input-radius" name="repeatPassword" [(ngModel)]="accountData.repeatPassword" placeholder="再次输入新密码">
        </div>
      </div>
      <div class="error">{{errorMsg}}</div>
      <div class="form-group">
        <div class="col-xs-12">
            <button type="submit" name="button" class="btn btn-svoc setup-btn" (click)="toNextStep()">完成</button>
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
export class SetupThreeComponent implements OnInit {

  @Input() inputParentData:any;
  @Output() outPutSetupThreeData:EventEmitter<any> = new EventEmitter();//子传父
  constructor(private http: HttpClient) { }

  ngOnInit() {
  }
  errorMsg:any;
  accountData:any = {
    newPassword:'',//新密码
    repeatPassword:'',//重复新密码
    userId:''//用户ID
  }
  toNextStep(){
    this.accountData.userId = this.inputParentData.userId;
    this.http.post('/uc/user/password',this.accountData).subscribe(
      res => {
        let resData:any = res;
        if(resData.code == 200){
          this.outPutSetupThreeData.emit(this.inputParentData);
        }else{
          this.errorMsg=resData.msg;
        }
      },
      err => {
        console.log(err);
      });
  }

}
