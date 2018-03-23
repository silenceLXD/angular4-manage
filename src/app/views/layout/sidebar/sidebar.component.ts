import { Component, OnInit, Input } from '@angular/core';
// import { HttpInterceptorService } from '@services/HttpUtils.Service';
// import { Http } from "@angular/http";
import { HttpClient } from '@angular/common/http';
import { CommonService } from '@services/common.service';
import { CustomizeService } from '@services/customize.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  bgColor: any = '';

  /* 初始化数据 */
  //switchflag(个人和企业控制台的切换)0：企业控制的菜单，1：个人控制台
  //角色类型roleType  1：一级管理员  2：二级管理员  3：企业用户  8：个人用户
  switchflag: number;

  constructor(private http: HttpClient, private commonService: CommonService, private customizeService: CustomizeService) {
    commonService.changeFlag.subscribe((value: number) => {
      this.switchflag = value;
      this.getMenuFn(this.switchflag);
    })

    this.getCurrentThemeColor();
    customizeService.templateType.subscribe((value: number) => {
      if (value == 0) {
        this.bgColor = 'navbarHeaderBlack';
      } else if (value == 1) {
        this.bgColor = 'navbarHeaderTechBlur';
      } else if (value == 2) {
        this.bgColor = 'navbarHeaderBlur';
      } else if (value == 3) {
        this.bgColor = 'navbarHeaderDark';
      } else if (value == 4) {
        this.bgColor = 'navbarHeaderGreen';
      }
    })

  }
  public loginUserData = this.commonService.getLoginMsg();

  sidebarData: any;
  entId: any = this.loginUserData.entId;
  roleType = this.loginUserData.roleType;

  ngOnInit() {
    this.getCurrentThemeColor();
  }

  getCurrentThemeColor() {
    if (this.roleType == 8) {
      this.bgColor = 'navbarHeaderBlack';
      this.customizeService.templateType.emit(0);
    } else {
      this.http.get('/uc/ents/customize/' + this.entId).subscribe(
        res => {
          // console.log(res);
          let datalist: any = res;
          if (datalist.code == 200) {
            let type = datalist.data.ent.templateType;
            // let type = datalist.data.templateType;
            if (type == 0) {
              this.bgColor = 'navbarHeaderBlack';
            } else if (type == 1) {
              this.bgColor = 'navbarHeaderTechBlur';
            } else if (type == 2) {
              this.bgColor = 'navbarHeaderBlur';
            } else if (type == 3) {
              this.bgColor = 'navbarHeaderDark';
            } else if (type == 4) {
              this.bgColor = 'navbarHeaderGreen';
            }
            this.customizeService.templateType.emit(type);
          }
        },
        err => {
          console.log(err);
        }
      );
    }
  }

  //获取菜单
  getMenuFn(flag) {
    // if(this.switchflag == 0){
    //   this.sidebarData = this.adminSidebarData;
    // }else{
    //   this.sidebarData = this.userSidebarData;
    // }
    this.http.get('/uc/user/menus/' + flag).subscribe(
      res => {
        // console.log(res);//打印返回的数据
        let resData: any = res;
        this.sidebarData = resData.data;
      },
      err => {
        console.log(err);
      }
    );

  }
}
