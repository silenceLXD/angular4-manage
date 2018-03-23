import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '@services/common.service';

@Component({
  selector: 'app-ent-book',
  templateUrl: './ent-book.component.html',
  styleUrls: ['./ent-book.component.css']
})
export class EntBookComponent implements OnInit {

  // 登录参数
  loginMsg = {
    roomNumber: '',
    password: '',
    loginRealName: ''
  };

  constructor(private http: HttpClient,
              private commonService: CommonService) {
  }

  ngOnInit() {
    this.getPathDataFn();
    this.loginMsg.loginRealName = this.commonService.getLoginMsg().realName;
  }

  /* 获取跳转链接所需参数 */
  getPathDataFn() {
    return this.http.get('/uc/support/room', {}).subscribe(
      res => {
        const resultData: any = res;
        if (+resultData.code === 200) {
          this.loginMsg.roomNumber = resultData.data.roomNumber;
          this.loginMsg.password = resultData.data.password;
        }
      },
      err => {
        console.log(err);
      }
    );
  }


}
