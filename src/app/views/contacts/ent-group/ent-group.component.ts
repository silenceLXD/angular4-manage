import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '@services/common.service';
import {NzModalService} from 'ng-zorro-antd';
import {NzNotificationService} from 'ng-zorro-antd';

@Component({
  selector: 'app-ent-group',
  templateUrl: './ent-group.component.html',
  styleUrls: ['./ent-group.component.css']
})
export class EntGroupComponent implements OnInit {

  // 服务状态
  serviceState: any;
  // 用户角色
  roleId: any;
  // 是否可用
  isAvailableOne: boolean;

  groupList: any; //左侧分组列表数据
  checkGroupMembers: any = {
    list: [],
    totalPages: 0,
    currentPage: 1
  }; //右侧列表数据
  members: any = []; // 添加成员列表
  cancelGroupName: any;  //组名称
  groupName: any;  //组名称
  checkUserCount: any;  //群组的人数
  groupNameAdd: any; //添加组名称
  groupId: any;  //组ID
  isHaveValue: boolean = false;

  constructor(private http: HttpClient, private commonService: CommonService, private confirmServ: NzModalService, private _notification: NzNotificationService) {
  }

  public loginUserData = this.commonService.getLoginMsg();
  entId: any = this.loginUserData.entId;
  userId: any = this.loginUserData.userId;

  ngOnInit() {
    this.serviceState = localStorage.setEntServiceData;
    this.roleId = this.commonService.getLoginMsg().roleType;
    this.isAvailableOne = !([5, 3, 4, 2, 6].indexOf(+this.serviceState) === -1) && !([1, 2].indexOf(+this.roleId) === -1);
    this.getUserGroup();
  }

  // 获取当前用户的所有分组(公开和人)
  searchName: any = '';

  getUserGroup() {
    this.http.get('/uc/userGroup/find/open?groupName=' + this.searchName).subscribe(
      res => {
        let datalist: any = res;
        if (datalist.code == 200) {
          this.groupList = datalist.data.list;
          if (this.groupList.length != 0) {
            this.checkMember(datalist.data.list[0]);
            this.isHaveValue = true;
          } else {
            this.isHaveValue = false;
          }
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  // 按组名称查询
  searchGroupFn() {
    this.getUserGroup();
  }

  getUserData: any = {
    groupname: '',  //分组名称
    pageNum: '1',  //页码
    pageSize: '10', //每页条数
  };
  // 根据群组编号获取该组中所有人员信息
  getDataGroup: any;

  checkMember(list: any) {
    this.cancelGroupName = list.groupName;
    this.members = [];
    this.chosedMembers = this.members;
    // this.groupNameAdd = list.groupName;
    this.groupId = list.groupId;
    if (list) {
      this.getUserData.groupname = list.groupName;
      this.groupName = list.groupName;
      this.checkUserCount = '（' + list.userCount + '）';
      this.groupId = list.groupId;
    }
    this.getDataGroup = this.commonService.formObject(this.getUserData);
    this.getGroupIdList();
  }

  /* 右侧列表信息 */
  getGroupIdList() {
    this.http.get('/uc/userGroup/find/user/' + this.groupId + this.getDataGroup).subscribe(
      res => {
        let datalist: any = res;
        if (datalist.code == 200) {
          this.checkGroupMembers = {
            list: datalist.data.list,
            totalPages: datalist.data.total,
            currentPage: datalist.data.pageNum
          };
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  //分页
  pageChanged(pagenum: any) {
    this.checkGroupMembers.pageNum = pagenum;
    this.checkGroupMembers.currentPage = pagenum;
    this.getGroupIdList();
  }

  // 获取该分组以外的其他分组
  moveOtherGroupsList: any;
  isHaveGroup: boolean = true;

  getUserGroupOther() {
    this.http.get('/uc/userGroup/other/open/' + this.groupId).subscribe(
      res => {
        let datalist: any = res;
        if (datalist.code == 200) {
          this.moveOtherGroupsList = datalist.data;
          if (datalist.data) {
            this.isHaveGroup = false;
          }
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  /****************** 添加联系人 *********************/
  addContactsModal: boolean = false;

  addContacts(value: any) {
    this.isAddUpdate = value;
    this.addContactsModal = true;
    this.getChooseLevelContact(this.entId, 'one'); // 查询一级部门
    this.getQueryPositions(); // 查询职务
    this.getContactsList() // 查询联系人列表
      .add(() => this._allchecked());
  }

  /* 获取联系人列表 */
  memberList: any = []; //联系人展示列表
  getContactsList() {
    let getData = {
      deptId: this.deptId,
      subdeptId: this.subdeptId,
      threedeptId: this.threedeptId,
      position: this.position,
      searchInput: this.realName
    };
    return this.http.post('/uc/userGroup/entuser/inGroup', getData).subscribe(
      res => {
        let datalist: any = res;
        if (datalist.code == 200) {
          this.memberList = datalist.data;
          // console.log(this.memberList);
          // console.log(this.checkGroupMembers.list);
          if (+this.isAddUpdate === 2) {
            for (let i = 0; i < this.memberList.length; i++) {
              for (let j = 0; j < this.checkGroupMembers.list.length; j++) {
                if (this.memberList[i].userId == this.checkGroupMembers.list[j].userId) {
                  this.memberList[i].isInGroup = true;
                  this.members.push(this.checkGroupMembers.list[j]);
                  this.chosedMembers = this.members;
                }
              }
            }
          }
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  // 取消添加组员
  cancelAddContactsFn() {
    this.members = [];
    this.addContactsModal = false;
  }

  /* 确定添加联系人 */
  saveAddContactsFn() {
    if (this.isAddUpdate == 2) {
      this.getGroupUserList();
    }
    this.addContactsModal = false;
  }

  /* 编辑分组内人员 */
  getGroupUserList() {
    let getData = {
      idArr: ''
    };
    this.chosedMembers.forEach(value => {
      getData.idArr += value.userId + ',';
    });
    getData.idArr = getData.idArr.substring(0, getData.idArr.length - 1);

    this.http.post('/uc/userGroup/update/user/' + this.groupId, getData).subscribe(
      res => {
        let datalist: any = res;
        if (datalist.code == 200) {
          this.getUserGroup();
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  /* 选择联系人 选择一级部门 */
  oneDepartmentList: any = [];  //一级部门数据列表
  deptName: any = '';   //已选择的一级部门
  deptId: number; // 一级部门ID
  getChooseLevelContact(paramId: any, deptType: any) {
    this.http.get('/uc/organization/select/' + paramId).subscribe(
      res => {
        let datalist: any = res;
        if (datalist.code == 200) {
          if (deptType == 'one') {
            this.oneDepartmentList = datalist.data;
          } else if (deptType == 'two') {
            this.TwoDepartmentList = datalist.data;
          } else if (deptType == 'three') {
            this.ThreeDepartmentList = datalist.data;
          }
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  /* 全选 联系人 */
  chosedMembers: any;
  allcheckedValue: any;

  _allchecked($event?: any) {
    this.members = [];
    if (!$event) {
      this.allcheckedValue = false;
      this.memberList.forEach(value => {
        value.isInGroup = false;
        this.members = [];
      });
    } else {
      if ($event.target.checked) {
        this.memberList.forEach(value => {
          value.isInGroup = true;
          this.members.push(value);
        });
      } else {
        this.memberList.forEach(value => {
          value.isInGroup = false;
          this.members = [];
        });
      }
    }
    this.chosedMembers = this.members;
  }

  /* 单选 联系人 */
  updateSelection($event: any, item: any) {
    if ($event.target.checked) {
      this.members.push(item);
    } else {
      for (let i = 0; i < this.members.length; i++) {
        if (this.members[i].userId == item.userId) {
          this.members.splice(i, 1);
        }
      }
    }
    this.chosedMembers = this.members;
  }

  /* 点击×号 关闭联系人 */
  closeMember(item: any) {
    item.isInGroup = false;
    for (let i = 0; i < this.members.length; i++) {
      if (this.members[i].userId == item.userId) {
        this.members.splice(i, 1);
      }
    }
    this.chosedMembers = this.members;
  }


  /* 一级部门选择 change事件 查询二级部门 */
  TwoDepartmentList: any = [];  //二级部门列表
  subdeptName: any = '';  //已选择的二级部门
  subdeptId: number; //二级部门ID
  getSecondDepat(item: any) {
    if (item != '') {
      this.deptId = item;
      this.subdeptId = null;
      this.threedeptId = null;
      this.subdeptName = '';
      this.threedeptName = '';
      this.getContactsList();
      this.getChooseLevelContact(item, 'two');
    } else {
      this.deptId = null;
      this.subdeptId = null;
      this.threedeptId = null;
      this.deptName = '';
      this.subdeptName = '';
      this.threedeptName = '';
      this.getContactsList();
      this.TwoDepartmentList = [];
      this.ThreeDepartmentList = [];
    }

  }

  /* 二级部门change事件 查询三级部门 */
  ThreeDepartmentList: any = []; //三级部门列表
  threedeptName: any = '';   //已选择的三级部门
  threedeptId: number;  //三级部门ID
  getThirdDepat(item) {
    if (item != '') {
      this.subdeptId = item;
      this.getContactsList();
      this.getChooseLevelContact(item, 'three');
    } else {
      this.threedeptId = null;
      this.threedeptName = '';
      this.getContactsList();
      this.ThreeDepartmentList = [];
    }

  }

  /*选择三级部门 change 事件*/
  searchUser(item) {
    if (item != '') {
      this.threedeptId = item;
      this.getContactsList();
    }
  }

  /* 查询职位 */
  positionsList: any = [];
  position: any = '';

  getQueryPositions() {
    this.http.get('/uc/user/ent/position').subscribe(
      res => {
        let datalist: any = res;
        if (datalist.code == 200) {
          this.positionsList = datalist.data;
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  /* 选择职务 change事件 */
  searchPositions(item: any) {
    this.position = item;
    this.getContactsList();
  }

  /* 姓名 工号 Key 搜搜 */
  realName: any = '';

  searchRealName(item) {
    this.realName = item;
    this.getContactsList();
  }


  /*****************添加联系人END ****************************/

    // 移动到
  isMoveGroup: boolean = false;
  moveGroupList: any;

  moveGroup(list) {
    this.moveGroupList = list;
    this.getUserGroupOther();
    this.isMoveGroup = true;
  }

  // 确定移动
  moveGroupOk(list) {
    this.isMoveGroup = false;
    let getData = {
      groupid: list.groupId, //要移动到分组
      userid: this.moveGroupList.userId, //用户ID
      thisgid: this.groupId //用户所在的当前分组
    };
    let getDataString = this.commonService.formObject(getData);
    this.http.patch('/uc/userGroup/move/user' + getDataString, '').subscribe(
      res => {
        let datalist: any = res;
        if (datalist.code == 200) {
          this.getUserGroup();
          this._notification.create('success', '移动成功', '');
        } else {
          this._notification.create('error', '移动失败', '');
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  // 复制到
  isCopyGroup: boolean = false;
  copyGrouplist: any;

  copyGroup(list) {
    this.copyGrouplist = list;
    this.getUserGroupOther();
    this.isCopyGroup = true;
  }

  // 确定复制
  copyGroupOk(list) {
    this.isCopyGroup = false;
    let getData = {
      userid: this.copyGrouplist.userId, //用户ID
      thisgid: list.groupId //要复制到分组
    };
    let getDataString = this.commonService.formObject(getData);
    this.http.patch('/uc/userGroup/copy/user' + getDataString, '').subscribe(
      res => {
        let datalist: any = res;
        if (datalist.code == 200) {
          this.getUserGroup();
          this._notification.create('success', '复制成功', '');
        } else {
          this._notification.create('error', '复制失败', '');
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  // 删除
  deleteUser(list: any) {
    this.confirmServ.confirm({
      title: '删除',
      content: ' 是否确定删除用户？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        await this.sureDeleteUser(list);
      },
      onCancel() {
      }
    });
  }

  sureDeleteUser(list) {
    this.http.delete('/uc/userGroup/user/' + this.groupId + '/' + list.userId).subscribe(
      res => {
        let datalist: any = res;
        if (datalist.code == 200) {
          this._notification.create('success', '删除成功', '');
          this.getUserGroup();
        } else {
          this._notification.create('error', '删除失败', '');
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  // 根据分组ID删除分组信息
  // groupId: any;
  DeleteGroup = (list: any) => {
    this.groupId = list.groupId;
    this.confirmServ.confirm({
      title: '删除',
      content: ' 您删除此组后，人员也将会被删除，是否删除组别？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        await this.saveDeleteGroup();
      },
      onCancel() {
      }
    });
  };

  saveDeleteGroup() {
    this.http.delete('/uc/userGroup/' + this.groupId).subscribe(
      res => {
        let datalist: any = res;
        if (datalist.code == 200) {
          this._notification.create('success', '删除成功', '');
          this.getUserGroup();
        } else {
          this._notification.create('error', '删除失败', '');
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  // 回车确认修改
  editGroupNameKey(e) {
    if (e.keyCode === 13) {
      this.editGroupName();
    }
  }

  // 取消编辑
  cancelEdit() {
    this.groupName = this.cancelGroupName;
  }

  // 确定编辑
  sureEdit() {
    this.cancelGroupName = this.groupName;
  }

  // 修改分组名称
  isEditGroupName: boolean = false;

  editGroupName() {
    if (this.isEditGroupName) {
      let getData = {
        groupName: this.groupName
      };
      this.http.post('/uc/userGroup/update/name/' + this.groupId, getData).subscribe(
        res => {
          let datalist: any = res;
          if (datalist.code == 200) {
            this._notification.create('success', '修改成功', '');
            this.isEditGroupName = !this.isEditGroupName;
            this.getUserGroup();
          } else {
            this._notification.create('error', '修改失败', '');
          }
        },
        err => {
          console.log(err);
        }
      );
    }
    // this.isEditGroupName = !this.isEditGroupName;
  }

  // 添加组
  addGroupModal: boolean = false;

  // 点击添加组
  AddGroupFn() {
    this.members = [];
    this.groupNameAdd = '';
    this.addGroupModal = true;
  }

  // 取消添加群组
  cancelAddGroupFn() {

  }

  // 确定添加群组
  saveAddGroupFn() {
    let getData = {
      groupName: this.groupNameAdd,  //分组名称
      idArr: ''    //用户ID，  逗号分隔
    };
    this.chosedMembers.forEach(value => {
      getData.idArr += value.userId + ',';
    });
    getData.idArr = getData.idArr.substring(0, getData.idArr.length - 1);
    this.http.post('/uc/userGroup/admin', getData).subscribe(
      res => {
        let datalist: any = res;
        if (datalist.code == 200) {
          this.getUserGroup();
          this._notification.create('success', '添加成功', '');
          this.addGroupModal = false;
        } else {
          this._notification.create('error', '添加失败', '');
          this.addGroupModal = false;
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  // 添加成员
  isAddUpdate: number;

  // 点击添加成员
  chooseMemberDialog(value: any) {
    this.chosedMembers = [];
    this.isAddUpdate = value;
    this.addContacts(value);
    this._allchecked();
  }

  // 删除成员
  closeAddMember(item: any) {

  }

}
