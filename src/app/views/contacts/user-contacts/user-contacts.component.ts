import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '@services/common.service';
import { NzModalService } from 'ng-zorro-antd';
import { NzNotificationService } from 'ng-zorro-antd';
@Component({
  selector: 'app-user-contacts',
  templateUrl: './user-contacts.component.html',
  styleUrls: ['./user-contacts.component.css']
})
export class UserContactsComponent implements OnInit {
  public loginUserData = this.commonService.getLoginMsg();
  ENTID: any = this.loginUserData.entId;
  USERID: any = this.loginUserData.userId;

  constructor(
    private http: HttpClient,
    private commonService: CommonService,
    private confirmServ: NzModalService,
    private _notification: NzNotificationService
  ) { }

  searchByName: any = ''; //通过姓名查找通讯录用户
  position: any = ''; //职务
  // 左侧 组织列表数据
  organList: any = {
    userName: '', // 名称
    count: 0, //总人数
    value: '', //组织Id
    level: 0, //组织级别
    list: []//list
  }

  ngOnInit() {
    this.getOrganizationList();
    this.getEntPosition();
  }

  /***************** 初始化 获取数据  *******************/
  // 查询获取 组织列表
  getOrganizationList() {
    return this.http.get('/uc/user/ents/' + this.ENTID + '/orgs?searchInput=' + this.searchByName).subscribe(
      res => {
        let dataList: any = res;
        this.organList = dataList.data;
        this.itemName = dataList.data.name;//初始化显示企业名称
        // 根据组织ID查询通讯录用户
        this.getOrganUser();//查询所有
      },
      err => {
        console.log(err);
      });
  }
  //获取职务列表
  positionList:any;
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
  userListData: any = {
    list: [],
    totalPages: 0,
    currentPage: 1
  }
  // 根据组织ID查询数据
  getUserData = {
    pageNum: '1',//页码
    pageSize: '10',//每页条数
    searchInput: '',//查询条件
    position: ''//职务
  }
  // 组织id查询通讯录用户(orgLevel:0表示entId是公司，1表示entId是一级部门，2表示entId是2级部门，3表示entId是3级部门)
  getOrganUser() {
    let getData = this.commonService.formObject(this.getUserData);
    return this.http.get('/uc/user/ents/' + this.orgId + '/users/' + this.orgLevel + getData).subscribe(
      res => {
        let resultData: any = res;
        this.userListData = {
          list: resultData.data.list,
          totalPages: resultData.data.total,
          currentPage: resultData.data.pageNum
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

  /***************  操作 start*********************/
  itemName: any = ''; //右侧所属部门（默认显示公司名称）
  orgLevel: any = 0;//查询部门等级默认为全部 0
  orgId: any = this.ENTID;//查询部门id

  // 点击获取组件数据
  getTreeItemData(val: any) {
    this.assignment(val);

  }
  // 赋值
  assignment(item: any) {
    this.itemName = item.name;  //部门名称
    this.orgLevel = item.level; //部门等级
    this.orgId = item.value;  //部门id
    this.getOrganUser();
  }
  // 检索通讯录用户 查看全部
  positionSearch:any="";
  searchData() {
    this.getUserData.searchInput = this.searchByName;
    this.getUserData.position = this.positionSearch;
    if (this.itemName == '个人收藏') {
      this.toUserCollection();
    } else {
      this.getOrganUser();
    }
  }
  searchAll(id, level, name) {
    this.orgLevel = level;
    this.orgId = id;
    this.itemName = name;
    this.getOrganUser();
  }

  /*** 添加收藏/取消（按钮） ***/
  collectUserFn(user: any) {
    let userId = user.userId;
    if (user.isCollection) {
      //取消收藏
      this.delCollectUser(user);
    } else {
      //添加收藏
      this.addCollectUser(user)
    }
  }
  //添加收藏 方法
  addCollectUser(user: any) {
    let friendUserId = user.userId;
    this.http.post('/uc/user/addressbook', { 'friendUserId': friendUserId }).subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == '200') {
          this._notification.create('success', '添加收藏成功', '');
          user.isCollection = true;
          this.getOrganUser();
          this.toUserCollection();
        } else {
          this._notification.create('error', '添加收藏失败', '');
        }
      },
      err => {
        console.log(err);
      });
  }
  //取消收藏 方法 friendUserId 好友id
  delCollectUser(user: any) {
    let friendUserId = user.userId;
    this.http.delete('/uc/user/addressbook/' + friendUserId).subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == '200') {
          this._notification.create('success', '取消收藏成功', '');
          user.isCollection = false;
          this.toUserCollection();
        } else {
          this._notification.create('error', '取消收藏失败', '');
        }
      },
      err => {
        console.log(err);
      });
  }


  /*** 查看个人收藏列表 **/
  toUserCollection() {
    this.itemName = '个人收藏';
    let getUserData: any = {
      pageNum: this.getUserData.pageNum,
      pageSize: this.getUserData.pageSize,
      searchStr: this.getUserData.searchInput
    }
    let getData = this.commonService.formObject(getUserData);
    this.http.get('/uc/user/user-addressbook/search' + getData).subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == '200') {
          if (resultData.data.list.length > 0) {
            this.userListData = {
              list: resultData.data.list,
              totalPages: resultData.data.total,
              currentPage: resultData.data.pageNum
            }
          }
        }
      },
      err => {
        console.log(err);
      });
  }


}
