import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '@services/common.service';
import {NzModalService} from 'ng-zorro-antd';
import {NzNotificationService} from 'ng-zorro-antd';

@Component({
  selector: 'app-ent-realroom',
  templateUrl: './ent-realroom.component.html',
  styleUrls: ['./ent-realroom.component.css']
})
export class EntRealroomComponent implements OnInit {

  isSureEditRoomFn = false; // 保存按钮状态
  // 服务状态
  serviceState: any;
  // 用户角色
  roleId: any;
  // 是否可用
  isAvailableOne: boolean;

  roomId: any; //会议室编号

  meetingName: string = ''; //添加会议室名称
  orgId: any; //组织Id
  searchData: any;

  public loginUserData = this.commonService.getLoginMsg();
  entId: any = this.loginUserData.entId;

  constructor(private http: HttpClient,
              private commonService: CommonService,
              private confirmServ: NzModalService,
              private _notification: NzNotificationService) {
    //查询数据数初始化
    this.searchData = {
      pageNum: '1', //第几页
      pageSize: '10',  //每页多少条
      queryStr: ''//会议名称
    };
  }


  ngOnInit() {
    this.serviceState = localStorage.setEntServiceData;
    this.roleId = this.commonService.getLoginMsg().roleType;
    this.isAvailableOne = !([5, 3, 4, 2, 6].indexOf(+this.serviceState) === -1) && !([1, 2].indexOf(+this.roleId) === -1);
    this.getRealroom();
    this.getOrganizationList();
  }

  // 查询组织列表
  getOrganizationList() {
    return this.http.get('/uc/user/ents/' + this.entId + '/orgs').subscribe(
      res => {
        let dataList: any = res;
        this.orgId = dataList.data.value;
      },
      err => {
        console.log(err);
      }
    );
  }

  public tableData: any = {//表格数据
    list: [],
    totalPages: 0,
    currentPage: 1
  };

  // 查找会议室列表
  getRealroom() {
    let getData = this.commonService.formObject(this.searchData);
    this.http.get('/uc/userRoom/room-user/' + this.entId + '/find' + getData).subscribe(
      res => {
        let resultData: any = res;
        this.tableData = {
          list: resultData.data.list,
          totalPages: resultData.data.total,
          currentPage: resultData.data.pageNum
        };
      },
      err => {
        console.log(err);
      }
    );
  }

  //分页
  pageChanged(pagenum: any) {
    this.searchData.pageNum = pagenum;
    // alert(pagenum)
    this.tableData.currentPage = pagenum;
    this.getRealroom();
  }

  // 搜索会议室
  searchMeetingRoom() {
    this.getRealroom();
  }

  // 添加会议室
  AddMeetingModal: boolean = false;

  AddMeetingRoom() {
    this.AddMeetingModal = true;
    this.meetingName = '';
  }

  // 保存添加会议室
  saveBtn_ok() {
    let getData = {
      'realName': this.meetingName,
      'orgId': this.orgId
    };
    this.http.post('/uc/userRoom/room-user', getData).subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == '200') {
          this._notification.create('success', '添加成功', '');
          this.getRealroom();
          this.AddMeetingModal = false;
        } else {
          this._notification.create('error', '添加失败', '');
        }
      },
      err => {
        console.log(err);
      });
  }

  // 删除会议室
  deleteModal: boolean = false;
  deleteRoomFn = (roomid: any) => {
    this.confirmServ.confirm({
      title: '删除',
      content: '是否确认删除此会议室？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        await this.deleteBtn_ok(roomid);
      },
      onCancel() {
      }
    });
  };

  // 确定删除会议室
  deleteBtn_ok(roomid: any) {
    this.http.delete('/uc/userRoom/room-user/' + roomid).subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == '200') {
          this._notification.create('success', '删除成功', '');
          this.getRealroom();
        } else {
          this._notification.create('error', '删除失败', '');
        }
      },
      err => {
        console.log(err);
      });
  }


  //编辑会议室
  editRoomModal: boolean = false;
  editRoomData: any = {
    realName: '',
    sipPassword: '',
    sipNumber: '',
    userId: ''
  };

  editRoomFn(data: any) {
    this.editRoomModal = true;
    this.editRoomData = {
      realName: data.realName,
      sipPassword: data.sipPassword,
      sipNumber: data.sipNumber,
      userId: data.userId,
    };
    this.inputValidatorsFn();
  }

  sureEditRoomFn(data: any) {
    let postData = {
      sipPassword: data.sipPassword,
      realName: data.realName,
      sipNumber: data.sipNumber
    };
    let roomid = data.userId;
    this.http.post('/uc/userRoom/room-user/' + roomid, postData).subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == '200') {
          this.editRoomModal = false;
          this._notification.create('success', '修改成功', '');
          this.getRealroom();
        } else {
          this._notification.create('error', '修改失败', '');
        }
      },
      err => {
        console.log(err);
      });
  }

  // 表单验证
  inputValidatorsFn() {
    setTimeout(() => {
      console.log(this.editRoomData.realName, this.editRoomData.sipPassword);
      if (this.editRoomData.realName && this.editRoomData.sipPassword) {
        this.isSureEditRoomFn = false;
      } else {
        this.isSureEditRoomFn = true;
      }
    });
  }
}
