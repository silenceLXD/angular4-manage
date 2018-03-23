import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '@services/common.service';
import {NzModalService} from 'ng-zorro-antd';
import {NzNotificationService} from 'ng-zorro-antd';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit {

  roleId = this.commonService.getLoginMsg().roleType;
  searchData: any;
  // 能够查询的数据
  ableCheckData = {
    dataIdList: [],
    dataIndex: null,
    isPrevMsgBool: false,
    isNextMsgBool: false,
    lastPage: null
  };

  constructor(private http: HttpClient,
              private commonService: CommonService,
              private confirmServ: NzModalService,
              private _notification: NzNotificationService) {
    // 查询数据数初始化
    this.searchData = {
      pageNum: '1',  // 第几页
      pageSize: '10',  // 每页多少条
      isRead: '', // 是否已读
      messageType: '', // 消息类型：产品消息-4，服务消息-5，会议消息-6
      isReadActivityMessage: '', // 是否读取群发消息（0否,1是）
      createTime: '' // 登录人创建时间
    };
  }

  isdisabled: boolean = true;//是否禁用
  isactive = -1;//选中状态
  isRead = -1;//是否已读 -1全部；1已读
  messageType = -1;//消息类型
  /******************** 初始化声明 ******************/
    // =======表格显示数据
  public tableData: any = {//表格数据
    list: [],
    totalPages: 0,
    currentPage: 1
  };

  ngOnInit() {
    this.getMsgCount();
    this.getTableDataFn();//页面加载 渲染表格
    if (+this.roleId !== 1) {
      this.roleId = '0';
    } else {
      this.roleId = '1';
    }
  }

  updateTableData: any = [];//用于操作的list数据
  /* 表格列表数据初始化 */
  getTableDataFn() {
    this.searchData.isRead = this.isRead;
    this.searchData.messageType = this.messageType;
    this.searchData.isReadActivityMessage = this.roleId;
    this.searchData.createTime = localStorage.accountcreateTime;
    let getData = this.commonService.formObject(this.searchData);
    return this.http.get('/uc/message' + getData).subscribe(
      res => {
        let resultData: any = res;
        this.tableData = {
          list: resultData.data.list,
          totalPages: resultData.data.total,
          currentPage: resultData.data.pageNum
        };
        this.updateTableData = resultData.data.list;
        this.ableCheckData.lastPage = resultData.data.lastPage;
        this.ableCheckData.dataIdList = [];
        this.updateTableData.forEach(item => {
          this.ableCheckData.dataIdList.push(item);
        });
      },
      err => {
        console.log(err);
      });
  }

  //分页
  pageChanged(pagenum: any) {
    this.searchData.pageNum = pagenum;
    this.tableData.currentPage = pagenum;
    this.getTableDataFn();
  }

  //查询
  dataSearchFn() {
    this.getTableDataFn();
  }

  /************** 初始化 end ****************/

  /****** 操作 *****/

    //获取消息总数和未读总数
  msgCountSearch: any = { //查询条件数据
    isReadActivityMessage: '',//是否读取群发消息（1是 管理员,0否 用户）
    isRead: '',
    createTime: ''//登录人创建时间
  };
  msgCountData: any = {
    allCount: '',//总数
    readCount: ''//已读数
  };

  // 获取消息总数和已读数
  getMsgCount() {
    this.msgCountSearch.isReadActivityMessage = this.roleId;
    if (+this.msgCountSearch.isReadActivityMessage === 1) {
      this.msgCountSearch.createTime = localStorage.accountcreateTime;
    } else {
      this.msgCountSearch.createTime = '0';
    }
    const getData = this.commonService.formObject(this.msgCountSearch);
    this.http.get('/uc/message/count' + getData).subscribe(
      res => {
        let resultData: any = res;
        this.msgCountData = resultData.data;
        this.commonService.msgCountFn.next(this.msgCountData.allCount - this.msgCountData.readCount);
      },
      err => {
        console.log(err);
      });
  }

  //标记消息为已读 方法
  markToReaded() {
    let postData = [];
    this.selectedData.forEach((value, index, array) => {
      let ids = {'id': value.id, 'messageType': value.messageType};
      postData.push(ids);
    });
    this.http.post('/uc/message/sign', {'ids': postData}).subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == '200') {
          this._notification.create('success', '已标记为已读', '');
          this.getMsgCount();
          this.getTableDataFn();
          this.selectedData = [];
          this.isdisabled = true;
        } else {
          this._notification.create('error', '标记为已读失败', '');
        }
      },
      err => {
        console.log(err);
      });
  }

  deleteModal: boolean = false;
  //删除消息 按钮
  deleteMsgFn = () => {
    this.confirmServ.confirm({
      title: '删除',
      content: '是否删除选中消息？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        await this.deleteMsg();
      },
      onCancel() {
      }
    });
  };

  //删除消息 方法
  deleteMsg() {
    let postData = [];
    this.selectedData.forEach((value, index, array) => {
      let ids = {'id': value.id, 'messageType': value.messageType};
      postData.push(ids);
    });
    this.http.post('/uc/message/delete', {'ids': postData}).subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == '200') {
          this._notification.create('success', '删除成功', '');
          this.getMsgCount();
          this.getTableDataFn();
          this.selectedData = [];
          this.isdisabled = true;
          this.isShowDetail = false;
        } else {
          this._notification.create('error', '删除失败', '');
        }
      },
      err => {
        console.log(err);
      });
  }

  //查询消息内容
  isShowDetail: boolean = false;
  detailMsgData: any = {
    title: ''
  };

  // 点击查看详情
  showDetailMsg(msg: any) {
    this.http.get('/uc/message/' + msg.id).subscribe(
      res => {
        const resultData: any = res;
        this.detailMsgData = resultData.data;
        this.getMsgCount();
        this.ableCheckData.dataIdList.forEach((item, i) => {
          if (+item.id === +msg.id) {
            this.ableCheckData.dataIndex = i;
            if (i === 0 && +this.tableData.currentPage === 1) {
              this.ableCheckData.isPrevMsgBool = true;
              this.ableCheckData.isNextMsgBool = false;
            } else if (i === this.ableCheckData.dataIdList.length - 1 && +this.ableCheckData.lastPage === +this.tableData.currentPage) {
              this.ableCheckData.isPrevMsgBool = false;
              this.ableCheckData.isNextMsgBool = true;
            } else {
              this.ableCheckData.isPrevMsgBool = false;
              this.ableCheckData.isNextMsgBool = false;
            }
          }
        });
        if (!this.isShowDetail) {
          this.isShowDetail = true;
        }
      },
      err => {
        console.log(err);
      });
  }

  // 查看上一封详情
  prevMsg() {
    if (this.tableData.currentPage !== 1 && this.ableCheckData.dataIndex === 0) {
      this.searchData.pageNum = this.tableData.currentPage - 1;
      this.getTableDataFn().add(() => {
        this.showDetailMsg(this.ableCheckData.dataIdList[9]);
      });
    } else {
      const num = this.ableCheckData.dataIndex - 1;
      this.showDetailMsg(this.ableCheckData.dataIdList[num]);
    }
  }

  // 查看下一封详情
  nextMsg() {
    if (+this.ableCheckData.lastPage !== +this.tableData.currentPage && this.ableCheckData.dataIndex === 9) {
      this.searchData.pageNum = this.tableData.currentPage + 1;
      this.getTableDataFn().add(() => {
        this.showDetailMsg(this.ableCheckData.dataIdList[0]);
      });
    } else {
      const num = this.ableCheckData.dataIndex + 1;
      this.showDetailMsg(this.ableCheckData.dataIdList[num]);
    }
  }

  //删除
  detailDelMsg(msg: any) {
    this.selectedData.push(msg);
    this.confirmServ.confirm({
      title: '删除',
      content: '是否删除当前消息？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        await this.deleteMsg();
      },
      onCancel() {
      }
    });
  }

  //返回
  backTolistFn() {
    this.selectedData = [];
    this.isShowDetail = false;
    this.getMsgCount();
    this.getTableDataFn();
  }

  //查看已读的所有消息
  searchReaded(type: any) {
    this.isactive = type;
    this.isRead = type;
    this.getTableDataFn();
  }

  searchType(type: any) {
    if (type == -1) {
      this.isRead = -1;
    }
    this.isactive = type;
    this.messageType = type;
    this.getTableDataFn();
  }


  /*************** 复选框 选择操作 *****************/
    //创建变量用来保存选中结果
  selectedData = [];

  updateSelected(action: any, list: any) {
    if (action == 'add' && this.selectedData.indexOf(list) == -1) {
      this.selectedData.push(list);
    }
    if (action == 'remove' && this.selectedData.indexOf(list) != -1) {
      this.selectedData.splice(this.selectedData.indexOf(list), 1);
    }
    if (this.selectedData.length > 0) {
      this.isdisabled = false;
    } else {
      this.isdisabled = true;
    }
  }

  //更新某一列数据的选择
  updateSelection($event: any, list: any) {
    let checkbox = $event.target;
    let action = (checkbox.checked ? 'add' : 'remove');
    this.updateSelected(action, list);
  }

  //全选操作
  _allchecked($event: any) {
    let checkbox = $event.target;
    let action = (checkbox.checked ? 'add' : 'remove');
    for (let i = 0; i < this.updateTableData.length; i++) {
      let contact = this.updateTableData[i];
      this.updateSelected(action, contact);
    }
  }

  isSelected(list: any) {
    return this.selectedData.indexOf(list) >= 0;
  }

  isSelectedAll() {
    if (this.updateTableData.length > 0) {
      return this.selectedData.length === this.updateTableData.length;
    } else {
      return false;
    }

  }

  /*************** 复选框 选择操作 end*****************/
}
