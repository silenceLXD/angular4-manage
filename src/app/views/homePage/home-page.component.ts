import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '@services/common.service';
// import { Observable }     from 'rxjs/Observable';
// import 'rxjs/add/operator/map';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})

export class HomePageComponent implements OnInit {
  switchPageFlag: number;

  constructor(private http: HttpClient, private commonService: CommonService, private router: Router) {
    commonService.changeFlag.subscribe((value: number) => {
      this.switchPageFlag = value;
    });
  }

  public loginUserData = this.commonService.getLoginMsg();

  // 角色类型  1：一级管理员  2：二级管理员  3：企业用户  8：个人用户
  roleId = this.loginUserData.roleType;
  ENTID = this.loginUserData.entId;

  flag: any = localStorage.getItem('switchflag');

  ngOnInit() {
    this.commonService.changeFlag.emit(this.flag);
    this.commonService.setServiceSecondsChange.emit();
  }


}
