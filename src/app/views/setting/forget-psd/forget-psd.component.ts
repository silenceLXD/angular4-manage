import { Component, OnInit, OnDestroy, EventEmitter, Output, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '@services/common.service';
@Component({
  selector: 'app-forget-psd',
  templateUrl: './forget-psd.component.html',
  styleUrls: ['./forget-psd.component.css']
})
export class ForgetPsdComponent implements OnInit{
  nowDate:any;
  constructor(private http: HttpClient,private commonService: CommonService) {
    this.nowDate = new Date().getFullYear();
  }
  //修改密码步骤
  public setupState:number = 1;
  public accountParentData:any;
  getCheckData:any ={
    number:'',
    time:'',
    picCode:'',
    userId:'',
    step:'',
    email:''
  };
  ngOnInit() {
    this.getCheckData = {
      number: this.commonService.getHashParameter('number'),//验证码随机码
      time: this.commonService.getHashParameter('time'),//发送链接的时间
      picCode: this.commonService.getHashParameter('picCode'),//验证码
      userId: this.commonService.getHashParameter('userId'),//userid
      step: this.commonService.getHashParameter('step'),//当前步骤
      email: this.commonService.getHashParameter('email')//邮箱
    }
    if(this.commonService.getHashParameter('email')){
      this.checkIdentity();
    }
  }
  //监听获取 第一步子组件传来的数据
  getSetupOneData(val){
    console.log(val);
    this.accountParentData=val;
    //跳转到第二步
    this.setupState = 2;

  }
  //监听获取 第二步子组件传来的数据
  getSetupTwoData(val){
    console.log(val);
    this.accountParentData = val;
    //跳转到第三步
    this.setupState = 3;
  }
  //监听获取 第三步子组件传来的数据
  getSetupThreeData(val){
    //跳转到第四步
    this.setupState = 4;
  }

  //忘记密码--通过邮箱验证身份

  checkData:any = {
    number: '',//验证码随机码
    time: '',//发送链接的时间
    picCode: '',//验证码
  };
  checkIdentity(){
    if(!this.accountParentData){
      this.accountParentData = {
        userId:''
      }
    }
    // this.accountParentData.userId = this.getCheckData.userId;
    // this.setupState = 3;
    this.checkData= {
      number: this.getCheckData.number,//验证码随机码
      time: this.getCheckData.time,//发送链接的时间
      picCode: this.getCheckData.picCode//验证码
    };
    let getData = this.commonService.formObject(this.checkData);
    this.http.get('/uc/user/email/valadation/identity'+getData).subscribe(
      res => {
        let resData:any = res;
        if(resData.code == 200){
          this.accountParentData.userId = this.getCheckData.userId;
          this.setupState = 3;
        }
      },
      err => {
        console.log(err);
      });
  }


}
