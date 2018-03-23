import {Component, OnInit, TemplateRef} from '@angular/core';
import {FormBuilder, FormGroup, FormControl} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {NzNotificationService} from 'ng-zorro-antd';
import {CommonService} from '@services/common.service';

@Component({
  selector: 'app-user-room',
  templateUrl: './user-room.component.html',
  styleUrls: ['./user-room.component.css']
})
export class UserRoomComponent implements OnInit {
  // 服务状态
  serviceState: any;
  // 用户角色
  roleId: any;
  // 是否可用
  isAvailableOne: boolean;
  isAvailableTwo: boolean;
  public loginUserData = this.commonService.getLoginMsg();
  USERID: any = this.loginUserData.userId;

  constructor(private http: HttpClient,
              private _notification: NzNotificationService,
              private commonService: CommonService) {
  }

  /******************** 初始化声明 ******************/
  // =======表格显示数据

  ngOnInit() {
    this.serviceState = localStorage.setEntServiceData;
    this.roleId = this.commonService.getLoginMsg().roleType;
    this.isAvailableOne = !([5, 3, 4, 2, 6].indexOf(+this.serviceState) === -1) && !([3].indexOf(+this.roleId) === -1);
    this.isAvailableTwo = !([1].indexOf(+this.serviceState) === -1) && !([3].indexOf(+this.roleId) === -1);
    this.getTableDataFn();
  }

  //获取会议室列表 表格数据
  /* 表格列表数据初始化 */
  ficData: any;

  getTableDataFn() {
    return this.http.get('/uc/' + this.USERID + '/rooms').subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == 200) {
          this.ficData = resultData.data;
        }
      },
      err => {
        console.log(err);
      });
  }

  /************** 初始化 end ****************/

    //编辑
  editRoomModal: boolean = false;
  editData: any = {
    vmrNumber: '',
    vmrName: '',
    participantPin: '',
  };

  editFicFn(data: any) {
    if (data.status == 2) {
      this._notification.create('error', '会议室使用中暂不可编辑', '');
    } else {
      this.editRoomModal = true;
      this.editData = {
        vmrNumber: data.vmrNumber,
        vmrName: data.vmrName,
        participantPin: data.participantPin
      };
    }


  }

  // 确定编辑 修改专属会议室
  submitUpdateFn(data: any) {
    //vmrName:会议室名称; participantPin:访客密码
    let postData = {'vmrName': data.vmrName, 'participantPin': data.participantPin};
    this.http.post('/uc/rooms/' + data.vmrNumber, postData).subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == '200') {
          this._notification.create('success', '修改成功', '');
          this.getTableDataFn();
          this.editRoomModal = false;
        } else {
          this._notification.create('error', '修改失败', '');
        }
      },
      err => {
        console.log(err);
      });
  }

}
