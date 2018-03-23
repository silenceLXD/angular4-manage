import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormControl} from '@angular/forms';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '@services/common.service';
import {CustomizeService} from '@services/customize.service';
import {AuthService} from '@services/auth.service';
import {NzModalService} from 'ng-zorro-antd';
import {NzNotificationService} from 'ng-zorro-antd';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-customize',
  templateUrl: './customize.component.html',
  styleUrls: ['./customize.component.css']
})
export class CustomizeComponent implements OnInit {

  // 服务状态
  serviceState: any;
  // 用户角色
  roleId: any;
  // 是否可用
  isAvailableOne: boolean;
  entData: any = {
    entDomainName: '',   //
    entShowName: '',  //显示名称
    entDomain: '',    //绑定域名
    logoUrl: '',  //  企业logo
    slogan: ''  //企业标语
  };
  isActive: number = 1;  // 1 为企业模板 2 为企业配置
  istpl: number = 0; // 企业模板 0 为默认颜色，
  previewImageLogo: any; //上传的logo
  logoId: number = 0; //上传的logo的ID

  public loginUserData = this.commonService.getLoginMsg();
  entId: any = this.loginUserData.entId;
  userId: any = this.loginUserData.userId;

  constructor(private router: Router, private fb: FormBuilder, private http: HttpClient, private commonService: CommonService, private confirmServ: NzModalService, private _notification: NzNotificationService, private authService: AuthService, private customizeService: CustomizeService) {
  }

  ngOnInit() {
    this.serviceState = localStorage.setEntServiceData;
    this.roleId = this.commonService.getLoginMsg().roleType;
    this.isAvailableOne = !([5, 3, 4, 2, 6].indexOf(+this.serviceState) === -1) && !([1, 2].indexOf(+this.roleId) === -1);
    this.getCustomizeEntList();  //通过企业ID查询企业订制信息
  }

  /* 通过企业ID查询企业订制信息 */
  getCustomizeEntList() {
    if (this.entId == 'undefined') {
      this.entId = 0;
    }
    this.http.get('/uc/ents/customize/' + this.entId).subscribe(
      res => {
        let datalist: any = res;
        if (datalist.code == 200) {
          this.istpl = datalist.data.ent.templateType;
          this.entData.entDomainName = datalist.data.entDomainName;
          this.entData.entShowName = datalist.data.ent.entShowName;
          this.entData.entDomain = datalist.data.ent.entDomain;
          this.entData.logoUrl = datalist.data.ent.logoUrl;
          this.entData.slogan = datalist.data.ent.slogan;
          this.customizeService.templateType.emit(datalist.data.ent.templateType);
          this.customizeService.entShowName.emit(datalist.data.ent.entShowName);
          this.customizeService.slogan.emit(datalist.data.ent.slogan);
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  /* 选择企业模板 */
  chooseTplFn(value: any) {
    this.istpl = value;
    this.customizeService.templateType.emit(value);
  }

  /* 修改企业模板 */
  applyTemplateFn() {
    if (this.entId == '') {
      this.entId = 0;
    }
    if (!this.istpl) {
      this.istpl = 0;
    }
    this.http.post('/uc/ents/' + this.entId + '/' + this.istpl, '').subscribe(
      res => {
        // console.log(res);
        let datalist: any = res;
        if (datalist.code == 200) {
          this._notification.create('success', '应用成功', '');
        } else {
          this._notification.create('error', '应用失败', '');
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  /* 企业配置 企业模板切换 */
  changeTab(value: any) {
    this.isActive = value;
  }

  /* 选择的logo */
  imgUrlName: any;

  previewImage(value: any) {
    let imgSize = (value.target.files[0].size / 1024).toFixed(0);
    if (parseInt(imgSize) > 200) {
      this._notification.create('error', '文件大小不能超过200K请重新上传', '');
    } else {
      // var reader = new FileReader();
      // reader.onloadend = function (e) {
      //   console.log('1222222222');
      // }
      // console.log(value.target.value);
      var reader = new FileReader();
      reader.onload = function (evt) {
      };
      this.imgUrlName = value.target.files[0].name;
      this.previewImageLogo = value.target.files[0];
    }
  }

  /* 检测 域名 */
  checkDomain() {
    // http://172.18.4.55:9108/
    if (this.entData.entDomain) {
      let url = '/' + this.entData.entDomain + '/uc/ents/testIP';
      this.http.get(url).subscribe(
        res => {
          let datalist: any = res;
          if (datalist.code == 200) {

          }
        },
        err => {
          console.log(err);
        }
      );
    }
  }

  /* 保存 企业配置 */
  updateConfigFn() {
    if (('undefined' != typeof (this.previewImageLogo)) || (null != this.previewImageLogo)) {
      this.entData.logoUrl = this.previewImageLogo.name;
      const formData = new FormData();
      formData.append('upFile', this.previewImageLogo);
      // 上传企业logo文件
      this.http.post('/uc/ents/upload/logo/file', formData).subscribe(
        res => {
          // console.log(res);
          let datalist: any = res;
          if (datalist.code == 200) {
            this.logoId = datalist.data;
            this.imgUrlName = '';
            this.updateCollocate();
          }
        },
        err => {
          console.log(err);
        }
      );
    } else {
      this.entData.logoUrl = '';
      this.updateCollocate();
    }

  }

  /* 保存企业个性化地址 */
  updateCollocate() {
    let getData = {
      showName: this.entData.entShowName,
      domain: this.entData.entDomain,
      slogan: this.entData.slogan,
      url: this.logoId + ''
    };
    this.http.post('/uc/ents/setting/', getData).subscribe(
      res => {
        // console.log(res);
        let datalist: any = res;
        if (datalist.code == 200) {
          this._notification.create('success', '保存成功', '');
          this.getCustomizeEntList();
          this.getEntUserInfo();
        } else {
          this._notification.create('error', '保存失败', '');
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  /* 根據企業ID獲取企業信息 */
  getEntUserInfo() {
    this.http.get('/uc/ents/' + this.entId).subscribe(
      res => {
        let datalist: any = res;
        if (datalist.code == 200) {
          if (datalist.data.logoUrl) {
            this.customizeService.logURL.emit(environment.apiBase + '/uc/ents/logo/logoUrl?logoUrl=' + datalist.data.logoUrl);
          }
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  /* 獲取企業logo圖片信息 */
  getUserInfoEntId(logourl: any) {

    // this.http.get('/uc/ents/logo/logoUrl?logoUrl='+logourl).subscribe(
    //   res => {
    //     console.log(res);
    //     let datalist: any = res;

    //   },
    //   err => {
    //     console.log(err);
    //   }
    // );
  }
}
