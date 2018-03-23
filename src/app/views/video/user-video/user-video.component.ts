import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormControl} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '@services/common.service';
import {NzModalService} from 'ng-zorro-antd';
import {NzNotificationService} from 'ng-zorro-antd';

@Component({
  selector: 'app-user-video',
  templateUrl: './user-video.component.html',
  styleUrls: ['./user-video.component.css']
})
export class UserVideoComponent implements OnInit {
  // 服务状态
  serviceState: any;
  // 用户角色
  roleId: any;
  // 是否可用
  isAvailableOne: boolean;
  isAvailableTwo: boolean;
  isActive = 1;//默认显示个人视频列表
  //查询数据
  searchData: any = {
    keywords: '',//文件名
    pageNum: '1', //第几页
    pageSize: '10',  //每页多少条
  };

  constructor(private http: HttpClient,
              private commonService: CommonService,
              private confirmServ: NzModalService,
              private _notification: NzNotificationService) {
  }

  /******************** 初始化声明 ******************/
    // =======表格显示数据
  public tableData: any = {//表格数据
    list: [],
    totalPages: 0,
    currentPage: 1
  };

  ngOnInit() {
    this.serviceState = localStorage.setEntServiceData;
    this.roleId = this.commonService.getLoginMsg().roleType;
    this.isAvailableOne = !([5, 3, 4, 2, 6].indexOf(+this.serviceState) === -1) && !([3].indexOf(+this.roleId) === -1);
    this.isAvailableTwo = !([1].indexOf(+this.serviceState) === -1) && !([3].indexOf(+this.roleId) === -1);
    this.getTableDataFn();
    if (this.isAvailableTwo) {
      this._notification.create('error', '企业已冻结！', '');
    }
  }

  /* 表格列表数据初始化 */
  getTableDataFn() {
    let getData = this.commonService.formObject(this.searchData);
    return this.http.get('/uc/records' + getData).subscribe(
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
    if (this.isActive == 1) {
      this.getTableDataFn();
    } else {
      this.getEntTableData();
    }
    // this.getTableDataFn();
  }

  /************** 初始化 end ****************/

  //切换个人视频或企业视频查询
  changeTab(flag: any) {
    this.isActive = flag;
    if (flag == '1') {//查询个人
      this.getTableDataFn();
    } else {//查询企业
      this.getEntTableData();
    }
  }

  //查询企业公共录播文件列表
  getEntTableData() {
    let getData = this.commonService.formObject(this.searchData);
    return this.http.get('/uc/records/public' + getData).subscribe(
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
      });
  }

  /*********************** 操作视频 *********************/
  deleteModal: boolean = false;
  //删除单个视频文件
  deleSingleVideo = (fileId: any) => {
    let fileIdArr = [];
    fileIdArr.push(fileId);
    this.confirmServ.confirm({
      title: '删除',
      content: '是否确认删除视频文件？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        await this.deleVideo(fileIdArr);
      },
      onCancel() {
      }
    });
  };
  // 删除多个视频文件
  deleMultipleVideo = () => {
    let fileIdArr = [];
    this.selectedData.forEach(item => {
      fileIdArr.push(item.fileId);
    });
    this.confirmServ.confirm({
      title: '删除',
      content: '是否确认删除已选中的视频文件？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        await this.deleVideo(fileIdArr);
      },
      onCancel() {
      }
    });
  };

  //删除视频方法
  deleVideo(fileIdArr: any) {
    let deleteData = ''; //文件id（fileId），多个用“，”隔开
    for (let i = 0; i < fileIdArr.length; i++) {
      deleteData += fileIdArr[i] + ',';
    }
    this.http.delete('/uc/records/delete?ids=' + deleteData).subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == '200') {
          this._notification.create('success', '删除成功', '');
          this.getTableDataFn();
        } else {
          this._notification.create('error', '删除失败', '');
        }
      },
      err => {
        console.log(err);
      });
  }

  //修改录播视频对外状态
  updateState(data: any) {
    let postData = {'state': !data.common};
    this.http.post('/uc/records/' + data.fileId + '/state', postData).subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == '200') {
          this._notification.create('success', '更改成功', '');
          this.getTableDataFn();
        } else {
          this._notification.create('error', '更改失败', '');
        }
      },
      err => {
        console.log(err);
      });
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
    for (let i = 0; i < this.tableData.list.length; i++) {
      let contact = this.tableData.list[i];
      this.updateSelected(action, contact);
    }
  }

  isSelected(list: any) {
    return this.selectedData.indexOf(list) >= 0;
  }

  isSelectedAll() {
    if (this.tableData.list.length > 0) {
      return this.selectedData.length === this.tableData.list.length;
    } else {
      return false;
    }

  }

  /*************** 复选框 选择操作 end*****************/

}
