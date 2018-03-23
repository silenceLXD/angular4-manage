import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '@services/common.service';
@Component({
  selector: 'app-check-email',
  templateUrl: './check-email.component.html',
  styleUrls: ['./check-email.component.css']
})
export class CheckEmailComponent implements OnInit {
  nowDate:any;
  constructor(private http: HttpClient,private commonService: CommonService) {
    this.nowDate = new Date().getFullYear();
  }
  getCheckData:any ={
    randomNum:'',
    type:'',
    email:''
  };
  ngOnInit() {
    this.getCheckData = {
      randomNum: this.commonService.getHashParameter('randomNum'),//验证码随机码
      type: this.commonService.getHashParameter('type'),//激活类型。1：注册企业，2：个人用户创建企业
      email: this.commonService.getHashParameter('email')//邮箱
    }
    this.checkIdentity();
  }
  isSuccess:boolean = false;
  personSuccess:boolean = false;
  checkIdentity(){
    let getData = this.commonService.formObject(this.getCheckData);
    this.http.get('/uc/ents/person/success/html'+getData).subscribe(
      res => {
        let resData:any = res;
        if(resData.code == 200){
          this.isSuccess = true;
        }else{
          this.isSuccess = false;
          if(resData.code == 32619){
            this.personSuccess = true;
          }
        }
      },
      err => {
        console.log(err);
      });
  }

  // 重新发送邮件验证
  reCheckEmail(){
    this.http.get('/uc/user/insert/send/email?email='+this.getCheckData.email).subscribe(
      res => {
        let resData:any = res;
        if(+resData.code == 200){
          this.loginEmail(this.getCheckData.email);
        }else if(+resData.code == 32602) {
        	this.personSuccess = true;
        }
      },
      err => {
        console.log(err);
      });
    }
    // 邮箱 下一步操作
    loginEmail(email:any) {
      // let email = email;
      /* 截取@后面.前面的所有数据 */
      let index = email.lastIndexOf("@");
      email = email.substring(index + 1, email .length);
      let dotIndex=email.indexOf('.');
      email= email.substring(0, dotIndex);
      // 跳转到对应邮箱网站
      window.open("http://mail."+email+".com/","_blank");

    }

}
