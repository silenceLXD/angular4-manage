import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '@services/common.service';
import {NzModalService} from 'ng-zorro-antd';
import {NzNotificationService} from 'ng-zorro-antd';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-ent-contacts',
  templateUrl: './ent-contacts.component.html',
  styleUrls: ['./ent-contacts.component.css']
})
export class EntContactsComponent implements OnInit, AfterViewInit {
  // 服务状态
  serviceState: any;
  // 用户角色
  roleId: any;
  // 是否可用
  isAvailableOne: boolean;
  public loginUserData = this.commonService.getLoginMsg();
  ENTID: any = this.loginUserData.entId;
  USERID: any = this.loginUserData.userId;
  emailUsed: any = false;
  phoneUsed: any = false;
  sipalert = true;
  emailUsedList: any;
  phoneUsedList: any;
  isDisabledButton = true;

  /* 异步手机号和邮箱 */
  asyncValidtorBool = {
    isDisabledButton: null, // 判断重复禁用保存
    emailRepeat: false, // 判断邮件是否重复
    mobilePhoneRepeat: false // 判断手机号是否重复
  };

  constructor(private http: HttpClient,
              private commonService: CommonService,
              private confirmServ: NzModalService,
              private _notification: NzNotificationService) {
  }

  @ViewChild('addUserForm') addUserForm: NgForm;
  searchByName: any = ''; // 通过姓名查找通讯录用户
  position: any = ''; // 职务
  // 左侧 组织列表数据
  organList: any = {
    userName: '', // 名称
    count: 0,  // 总人数
    value: '', // 组织Id
    level: 0, // 组织级别
    submenu: [] // list
  };

  ngOnInit() {
    this.serviceState = localStorage.setEntServiceData;
    this.roleId = this.commonService.getLoginMsg().roleType;
    this.isAvailableOne = !([5, 3, 4, 2, 6].indexOf(+this.serviceState) === -1) && !([1, 2].indexOf(+this.roleId) === -1);
    this.getOrganizationList();
    this.getSipCount();
    // this.getSipRemaining();
    this.getEntPosition();

  }

  ngAfterViewInit(): void {
    // 订阅表单值改变事件
    this.addUserForm.valueChanges
      .debounceTime(500)
      .subscribe(data => {
        this.onValueChanged(data);
      });
    // 验证邮件表单选项唯一
    /*this.addUserForm.controls.email.valueChanges
      .do(() => this.asyncValidtorBool.emailRepeat = false)
      .debounceTime(500)
      .subscribe(
        value => {
          console.log('email');
          if (value !== '' && !this.addUserForm.hasError('email', ['email'])) {
            this.getEmailRepeat(value);
          }
        }
      );*/
    // 验证手机表单选项唯一
    /*this.addUserForm.controls.mobilePhone.valueChanges
      .do(() => this.asyncValidtorBool.mobilePhoneRepeat = false)
      .debounceTime(500)
      .subscribe(
        value => {
          if (value !== '' && !this.addUserForm.hasError('mobilePhone', ['mobilePhone'])) {
            this.getMobilePhoneRepeat(value);
          }
        }
      );*/
  }

  onValueChanged(data) {
    this.isDisabledButton = this.addUserForm.valid;
    if (this.addUserForm.controls.email) {
      if (!this.addUserForm.controls.email.errors) {  // 验证邮件表单选项唯一
        this.getEmailRepeat(data.email);
      }
    }
    if (this.addUserForm.controls.mobilePhone) {
      if (!this.addUserForm.controls.mobilePhone.errors) {  // 验证手机表单选项唯一
        this.getMobilePhoneRepeat(data.mobilePhone);
      }
    }

    // console.log(data, this.addUserForm);
  }

  /***************** 初始化 获取数据  *******************/
  // 查询获取 组织列表
  getOrganizationList() {
    return this.http.get('/uc/user/ents/' + this.ENTID + '/orgs?searchInput=' + this.searchByName).subscribe(
      res => {
        // console.log(res);
        let dataList: any = res;
        this.organList = dataList.data;
        this.itemName = dataList.data.name;//初始化显示企业名称
        // 根据组织ID查询通讯录用户
        this.getOrganUser();//查询所有
      },
      err => {
        console.log(err);
      }
    );
  }

  userListData: any = {
    list: [],
    totalPages: 0,
    currentPage: 1
  };
  // 根据组织ID查询数据
  getUserData = {
    pageNum: '1',//页码
    pageSize: '10',//每页条数
    searchInput: this.searchByName,//查询条件
    position: this.position//职务
  };

  // 组织id查询通讯录用户(orgLevel:0表示entId是公司，1表示entId是一级部门，2表示entId是2级部门，3表示entId是3级部门)
  getOrganUser() {
    let getData = this.commonService.formObject(this.getUserData);
    return this.http.get('/uc/user/ents/' + this.orgId + '/users/' + this.orgLevel + getData).subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == 200) {
          if (resultData.data.list.length > 0) {
            this.userListData = {
              list: resultData.data.list,
              totalPages: resultData.data.total,
              currentPage: resultData.data.pageNum
            };
          } else {
            this.userListData = {
              list: [],
              totalPages: 0,
              currentPage: 1
            };
          }
        }

      },
      err => {
        console.log(err);
      });
  }

  //分页
  pageChanged(pagenum: any) {
    this.getUserData.pageNum = pagenum;
    this.userListData.currentPage = pagenum;
    this.getOrganUser();
  }

  positionList: any;

  getEntPosition() {
    this.http.get('/uc/user/ent/position').subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == '200') {
          this.positionList = resultData.data;
        }
      },
      err => {
        console.log(err);
      });
  }

// 查询企业的最大sip数量
  sipCount: any = 0;

  getSipCount() {
    this.http.get('/uc/user/entservice/ent').subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == '200') {
          this.sipCount = resultData.data.sipCount;
        } else {
          this.sipCount = 0;
        }
      },
      err => {
        console.log(err);
      });
  }

  // 查询企业剩余多少账号数
  sipRemaining: any = 0;

  getSipRemaining() {
    this.http.get('/uc/ents/sip/remaining').subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == '200') {
          this.sipRemaining = resultData.data;
        } else {
          this.sipRemaining = 0;
        }
      },
      err => {
        console.log(err);
      });
  }

  /*************** 公司部门层级数结构 操作 start*********************/
  itemName: any = ''; //右侧所属部门（默认显示公司名称）
  orgLevel: any = 0;//查询部门等级默认为全部 0
  orgId: any = this.ENTID;//查询部门id

  isShowUpdateBtn: boolean = false;//是否显示操作按钮（添加子部门，添加用户，删除用户）
  isCanDelet: boolean = true;//是否disabled（删除部门）按钮

  // 点击获取组件数据
  getTreeItemData(val: any) {
    this.assignment(val);
    this.isShowUpdateBtn = true;//显示部门可操作按钮
    if (val.count > 0) {//如果存在用户则不能点击
      this.isCanDelet = false;
    } else {
      this.isCanDelet = true;
    }
  }

  // 赋值
  assignment(item: any) {
    this.itemName = item.name;  //部门名称
    this.orgLevel = item.level; //部门等级
    this.orgId = item.value;  //部门id

    this.addUserData.orgLevel = item.level; //部门等级
    this.addUserData.parentOrgId = item.value;  //部门id
    this.getOrganUser();
    // console.log(this.addUserData)
  }

  // 检索通讯录用户 查看全部
  positionSearch: any = '';

  searchData() {
    this.getUserData.searchInput = this.searchByName;
    this.getUserData.position = this.positionSearch;
    this.getOrganUser();
  }

  searchAll(id, level, name) {
    this.orgLevel = level;
    this.orgId = id;
    this.itemName = name;
    this.isShowUpdateBtn = false;//不显示部门可操作按钮
    this.getOrganUser();
  }

  /******* 编辑部门名称 *******/
  isEditOrgpName: boolean = false;

  editOrgName() {
    let postData = {
      orgName: this.itemName, //部门名称
      departmentalLevel: this.addUserData.orgLevel //部门等级
    };
    this.http.post('/uc/organization/update/' + this.orgId, postData).subscribe(
      res => {
        let datalist: any = res;
        if (datalist.code == 200) {
          this._notification.create('success', '修改成功', '');
          this.isEditOrgpName = !this.isEditOrgpName;
          this.getOrganUser();
          this.getOrganizationList();
        } else {
          this._notification.create('error', '修改失败', '');
        }
      },
      err => {
        console.log(err);
      });
  }

  updateName: any;

  sureEdit() {
    this.updateName = this.itemName;
  }

  cancelEditOrgName() {
    this.itemName = this.updateName;
  }

  // 回车确认修改
  editOrgNameKey(e) {
    if (e.keyCode === 13) {
      this.editOrgName();
    }
  }

  /***** 添加部门分公司 *****/
  depatName: any;// 添加部门分公司名称
  AddDepartmentBranchModal: boolean = false;

  // 点击添加部门/分公司
  AddDepartmentBranch() {
    this.AddDepartmentBranchModal = true;
    this.depatName = '';
  }

  saveBtn_ok() {
    let getData = {
      'orgName': this.depatName
    };

    this.http.post('/uc/organization/add/' + this.orgLevel + '/' + this.organList.value, getData).subscribe(
      res => {
        let resultData: any = res;
        this.AddDepartmentBranchModal = false;
        this.getOrganUser();
        if (resultData.code == '200') {
          this._notification.create('success', '添加成功', '');
          this.getOrganizationList();
        } else {
          this._notification.create('error', '添加失败', '');
        }
      },
      err => {
        console.log(err);
      });
  }


  /***** 添加子部门 *****/
  addOtherDepatModal: boolean = false;
  otherdepatName: any = '';

  // 点击添加子部门
  addOtherDepateFn() {
    this.otherdepatName = '';
    this.addOtherDepatModal = true;
  }

  saveAddOtherFn() {
    // console.log(this.addUserData.orgLevel); //部门等级
    // console.log(this.addUserData.parentOrgId); //组织ID
    // console.log(this.otherdepatName);
    let getData = {
      orgName: this.otherdepatName
    };
    this.http.post('/uc/organization/add/' + this.orgLevel + '/' + this.addUserData.parentOrgId, getData).subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == '200') {
          this._notification.create('success', '添加成功', '');
          this.addOtherDepatModal = false;
          this.getOrganizationList();
        } else {
          this._notification.create('error', '添加失败', '');
        }
      },
      err => {
        console.log(err);
      });
  }

  /***** 删除部门 ****/
  deleteModal: boolean = false;
  deletDepatFn = () => {
    this.confirmServ.confirm({
      title: '删除',
      content: '是否确认删除当前部门？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        await this.sureDeleteDepatFn();
      },
      onCancel() {
      }
    });
  };

  // 确定删除部门
  sureDeleteDepatFn() {
    this.http.delete('/uc/organization/' + this.addUserData.parentOrgId).subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == '200') {
          this._notification.create('success', '删除成功', '');
          this.getOrganizationList();
        } else {
          this._notification.create('error', '删除失败', '');
        }
      },
      err => {
        console.log(err);
      });
  }

  /************************* 公司部门 操作end ************************************/


  /************************* 用户user操作 start ************************************/
  /***** 添加用户 *****/
  addUserModal: boolean = false;

  addUserFn() {
    const objArr = ['itemName', 'roleId'];
    for (const key in this.addUserForm.controls) {
      if (objArr.indexOf(key) === -1) {
        this.addUserForm.controls[key].reset();
      }
    }
    this.getSipRemaining();
    // 提交数据字段
    this.addUserData = {
      empno: '',  // 工号
      realName: '', //姓名
      // itemName: this.itemName,  //所属部门
      orgLevel: '',  //部门等级
      parentOrgId: '',  //用户所在部门ID
      position: '', //职务
      email: '',  //邮箱
      mobilePhone: '', // 手机
      roleId: 3  //角色
    };
    setTimeout(() => {
      if (this.sipRemaining <= 0) {
        this._notification.create('error', '通讯录账号数已达上限,不能添加用户', '');
      } else {
        this.addUserModal = true;
      }
    }, 200);

  }

  // 提交数据字段
  addUserData: any = {
    empno: '',  // 工号
    realName: '', //姓名
    // itemName : '',  //所属部门
    orgLevel: '',  //部门等级
    parentOrgId: '',  //用户所在部门ID
    position: '', //职务
    email: '',  //邮箱
    mobilePhone: '', // 手机
    roleId: ''  //角色
  };

  // 提交表单
  saveAddUserFn() {
    this.addUserData.orgLevel = this.orgLevel;
    this.addUserData.parentOrgId = this.orgId;
    this.http.post('/uc/user', this.addUserData).subscribe(
      res => {
        const resultData: any = res;
        if (+resultData.code === 200) {
          this._notification.create('success', '添加成功', '');
          this.addUserModal = false;
          this.getOrganizationList();
        } else if (+resultData.code === 32610) {
          // this.DidNotBuyServiceNoUser();
          this._notification.create('error', '通讯录账号数已达上限,不能添加用户', '');
        } else if (+resultData.code === 32617) {
          this._notification.create('error', '未购买服务,不能添加用户', '');
        } else {
          this._notification.create('error', '添加失败', '');
        }
      },
      err => {
        console.log(err);
      });
  }

  /* 未购买服务 不能添加用户 */
  // DidNotBuyServiceNoUser = () => {
  //   this.confirmServ.confirm({
  //     title: '消息',
  //     content: '未购买服务 不能添加用户',
  //     okText: '确定',
  //     cancelText: '取消'
  //   });
  // }


  /****** 编辑用户 *********/
  updateUserModal: boolean = false;
  updateUserData: any = {
    empno: '',
    userName: '',
    position: '',
    email: '',
    mobilePhone: '',
    roleId: '',
    deptId: '',
    subdeptId: '',
    threedeptId: '',
  };

  //編輯
  updateUserFn(user: any) {
    this.updateUserModal = true;
    this.updateUserData = user;
    this.getFirstDepat(this.ENTID);
    this.getSecondDepat(user.deptId);
    this.getThirdDepat(user.subdeptId);
  }

  sureUpdateUserFn(userId: any) {
    this.http.post('/uc/user/' + userId, this.updateUserData).subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == '200') {
          this._notification.create('success', '修改成功', '');
          this.updateUserModal = false;
          this.getOrganizationList();
        } else {
          this._notification.create('error', '修改失败', '');
        }
      },
      err => {
        console.log(err);
      });
  }

  /****** 删除用户 *********/
  deleteUserFn = (userId: any) => {
    this.confirmServ.confirm({
      title: '删除',
      content: '是否确认删除用户？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        await this.sureDeleteUserFn(userId);
      },
      onCancel() {
      }
    });
  };

  sureDeleteUserFn(userId: any) {
    this.http.delete('/uc/user/' + userId).subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == '200') {
          this._notification.create('success', '删除成功', '');
          this.getOrganizationList();
        } else {
          this._notification.create('error', '删除失败', '');
        }
      },
      err => {
        console.log(err);
      });
  }


  /****** 重置用户密码 *********/
  restPwdUserData: any = {
    userId: 0,
    newPassword: '123456',
    repeatPassword: '123456'
  };
  restPwd = (userId: any) => {
    this.confirmServ.confirm({
      title: '重置密码',
      content: '是否将登陆密码重置为123456',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        await this.sureRestPwdFn(userId);
      },
      onCancel() {
      }
    });
  };

  sureRestPwdFn(userId: any) {
    this.restPwdUserData.userId = userId;
    this.http.post('/uc/user/password', this.restPwdUserData).subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == '200') {
          this._notification.create('success', '密码重置成功', '');
          this.getOrganizationList();
        } else {
          this._notification.create('error', '密码重置失败', '');
        }
      },
      err => {
        console.log(err);
      });
  }

  /************************* 用户user操作 end ************************************/

  /***** 导入通讯录 *****/
  isImport: boolean = false; //判断是否导入通讯录  true为 导入
  showRepeatDataModal: boolean = false;
  ImportList: any;  //第一步导入 可以导入的数据列表
  ImportListLength: any = 0; //显示导入总条数
  openImprotFileModal: boolean = false;
  excelFile: any = ''; // 选择文件名
  openImprotFile() {
    this.getSipRemaining();
    setTimeout(() => {
      if (this.sipRemaining <= 0) {
        this._notification.create('error', '通讯录账号数已达上限,不能添加用户', '');
      } else {
        this.openImprotFileModal = true;
        this.fileName = '';
      }
    }, 200);

  }

  // 下载通讯录模板
  downloadBookTemplate() {
    let url = '/uc/user/download/template/' + this.USERID;
    this.commonService.downloadExport(url, 'userBookTemplate');
  }

  file: any; //选择的文件
  fileName: any = ''; //选择的文件名
  previewImage(value: any) {
    this.file = value.target.files[0];
    if (this.file) {
      this.fileName = this.file.name;
    }
  }

  // 上传导入文件
  uploadBtn_ok(flag: any) {
    const formData = new FormData();
    formData.append('file', this.file);
    // 导入通讯录第一步
    this.http.post('/uc/user/ent/excel/data/' + flag, formData).subscribe(
      res => {
        let datalist: any = res;
        if (datalist.data == 2) {
          // 第一步导入提示
          this.openImprotFileModal = false;
          this.ImportSecond();
          //the upload file is empty
        } else if (datalist.code == 32607) {
          this.openImprotFileModal = false;
          this.fileIsEmpty();
          //the enterprise not buy service
        } else if (datalist.code == 32617) {
          this.openImprotFileModal = false;
          this.DidNotBuyService();
          //sip resource transfinite
        } else if (datalist.code == 32610) {
          this.openImprotFileModal = false;
          this.SipServiceTransfiniteService();
          //the file type error
        } else if (datalist.code == 32609) {
          this.openImprotFileModal = false;
          this.fileTypeError();
          //the upload file content error
        } else if (datalist.data == 1000) {
          this.openImprotFileModal = false;
          this.fileContentError();
          //upload file content is empty
        } else if (datalist.data.totalRows == 0) {
          this.openImprotFileModal = false;
          this.fileContentIsNull();
        } else {
          this.openImprotFileModal = false;
          this.ImportList = datalist.data.list;
          this.ImportListLength = datalist.data.totalRows;
          if (this.ImportListLength < 0) {
            this.ImportListLength = 0;
          }
          this.saveImportSecond();

        }
      },
      err => {
        console.log(err);
      }
    );
  }

  /* 导入第二步 */
  saveImportSecond() {
    // 导入通讯录第二步
    this.http.get('/uc/user/ent/validation/data/repetition').subscribe(
      res => {
        let datalist: any = res;
        if (datalist.code == 200) {
          var emailData = datalist.data.userListByEmail;
          var phoneData = datalist.data.userListByPhone;
          if (emailData == null || emailData.length == 0) {
            this.emailUsed = false;
          } else {
            this.emailUsed = true;
          }
          this.emailUsedList = emailData;
          if (phoneData == null || phoneData.length == 0) {
            this.phoneUsed = false;
          } else {
            this.phoneUsed = true;
          }
          this.phoneUsedList = phoneData;
          if (this.phoneUsed == false && this.emailUsed == false) {
            this.isImport = true;
            this.showRepeatDataModal = false;
          } else {
            this.isImport = true;
            this.showRepeatDataModal = true;
          }
        } else if (datalist.code == 32609) {
          this.fileIsHaveNullValue();
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  /* 确定导入 -- 导入第三步 */
  insertUser() {
    this.http.get('/uc/user/ent/excel/data/user').subscribe(
      res => {
        let datalist: any = res;
        if (datalist.code == 200) {
          this.isImport = false;
          this.getOrganUser();
          this.getEntPosition();
          this.getOrganizationList();
          this._notification.create('success', '导入成功', '');
        } else {
          this.isImport = false;
          this._notification.create('error', '导入失败', '');
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  // 第一步导入提示
  ImportSecond = () => {
    this.confirmServ.confirm({
      title: '消息',
      content: '您要导入的文件sheet名称与您所在单位不符，是否继续导入？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        await this.uploadBtn_ok('1');
      },
      onCancel() {
      }
    });
  };
  /* 提示为购买服务 */
  DidNotBuyService = () => {
    this.confirmServ.confirm({
      title: '消息',
      content: '未购买服务，不能导入通讯录',
      okText: '确定',
      cancelText: '取消'
    });
  };

  /* sip资源超限 */
  SipServiceTransfiniteService() {
    this.confirmServ.confirm({
      title: '消息',
      content: '通讯录账号数已达上限，不能导入通讯录',
      okText: '确定',
      cancelText: '取消'
    });
  }


  /* Excel为空 */
  fileIsEmpty = () => {
    this.confirmServ.confirm({
      title: '消息',
      content: 'Excel为空',
      okText: '确定',
      cancelText: '取消'
    });
  };
  /* 文件格式的错误 */
  fileTypeError = () => {
    this.confirmServ.confirm({
      title: '消息',
      content: '文件格式错误',
      okText: '确定',
      cancelText: '取消'
    });
  };

  /* 文件内容的错误 */
  fileContentError = () => {
    this.confirmServ.confirm({
      title: '消息',
      content: '文件格式不正确，请检查你要导入的文件是否正确',
      okText: '确定',
      cancelText: '取消'
    });
  };

  /* 文件内容为空*/
  fileContentIsNull = () => {
    this.confirmServ.confirm({
      title: '消息',
      content: '文件信息为空',
      okText: '确定',
      cancelText: '取消'
    });
  };

  /* 必填内容有空值*/
  fileIsHaveNullValue = () => {
    this.confirmServ.confirm({
      title: '消息',
      content: '文件格式错误或必填为空，无法导入，请补全内容后重试。',
      okText: '确定',
      cancelText: '取消'
    });
  };

  /* 返回导入 */
  back() {
    this.isImport = false;
  }

  /***** 导出通讯录 *****/
  exportBook() {
    let url = '/uc/user/export?userId=' + this.USERID;
    this.commonService.downloadExport(url, this.organList.name);
  }

  /**** 获取部门数据 **/

  /** 根据entid 获取一级部门数据 */
  firstDeptData: any;

  getFirstDepat(id: any) {
    this.http.get('/uc/organization/select/' + id).subscribe(
      res => {
        let resultData: any = res;
        this.firstDeptData = resultData.data;
      },
      err => {
        console.log(err);
      });
  }

  /** 根据entid 获取二级部门数据 */
  secondDeptData: any;

  getSecondDepat(id: any) {
    this.http.get('/uc/organization/select/' + id).subscribe(
      res => {
        let resultData: any = res;
        this.secondDeptData = resultData.data;
      },
      err => {
        console.log(err);
      });
  }

  /** 根据entid 获取三级部门数据 */
  thirdDepatData: any;

  getThirdDepat(id: any) {
    this.http.get('/uc/organization/select/' + id).subscribe(
      res => {
        let resultData: any = res;
        this.thirdDepatData = resultData.data;
      },
      err => {
        console.log(err);
      });
  }

  //获取部门数据
  deptData: any;

  getDepatFn(parentId: any) {
    this.http.get('/uc/organization/select/' + parentId).subscribe(
      res => {
        let resultData: any = res;
        this.deptData = resultData.data;
        return resultData.data;
      },
      err => {
        console.log(err);
      });


  }

  /**************验证器***************/

  // 企业名称或邮箱或手机号重复时对保存的禁用
  setDisabledButton() {
    this.asyncValidtorBool.isDisabledButton = this.asyncValidtorBool.emailRepeat || this.asyncValidtorBool.mobilePhoneRepeat;
  }

  // 邮箱重复验证
  getEmailRepeat(value) {
    this.http.get(`/uc/user/validation/email?email=${value}`).subscribe(
      res => {
        const resultData: any = res;
        if (+resultData.code === 200) {
          this.asyncValidtorBool.emailRepeat = false;
          this.setDisabledButton();
        } else {
          this.asyncValidtorBool.emailRepeat = true;
          this.setDisabledButton();
        }
      },
      err => {
        console.log(err);
      });
  }

  // 手机重复验证
  getMobilePhoneRepeat(value) {
    this.http.get(`/uc/user/validation/phone?phone=${value}`).subscribe(
      res => {
        const resultData: any = res;
        if (+resultData.code === 200) {
          this.asyncValidtorBool.mobilePhoneRepeat = false;
          this.setDisabledButton();
        } else {
          this.asyncValidtorBool.mobilePhoneRepeat = true;
          this.setDisabledButton();
        }
      },
      err => {
        console.log(err);
      });
  }
}
