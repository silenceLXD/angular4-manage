import { Component, OnInit } from '@angular/core';
import {FormGroup, FormBuilder, Validators, FormControl} from "@angular/forms";
import {Router} from "@angular/router";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  private registerForm:FormGroup;
  constructor(private fb:FormBuilder) {
    this.registerForm = this.fb.group({
      realName:'',  //用户名称
      entName:'', //企业名称
      email:'', //邮箱
      password:'',  //密码
      mobile:'',  //手机号
      verificationCode:'',  //验证码
    })
  }
  registertype:string = 'per';//默认显示为个人注册per; ent为企业注册
  ngOnInit() {
  }
  //注册
  postFormData(val:any){
    if(this.registertype == 'per'){//提交个人注册

    }else if(this.registertype == 'ent'){//提交企业注册

    }

  }

}
