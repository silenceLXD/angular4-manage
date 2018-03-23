import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormControl} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '@services/common.service';
import {NzModalService} from 'ng-zorro-antd';
import {NzNotificationService} from 'ng-zorro-antd';

@Component({
  selector: 'app-ent-video',
  templateUrl: './ent-video.component.html',
  styleUrls: ['./ent-video.component.css']
})
export class EntVideoComponent implements OnInit {

  // 服务状态
  serviceState: any;
  // 用户角色
  roleId: any;
  // 是否可用
  isAvailableOne: boolean;

  constructor(private http: HttpClient,
              private commonService: CommonService,
              private confirmServ: NzModalService,
              private _notification: NzNotificationService) {
  }

  public loginUserData = this.commonService.getLoginMsg();
  ENTID = this.loginUserData.entId; // loginUserData.entId
  /******************** 初始化声明 ******************/
    //  =======表格显示数据
  searchData: any = {
    type: '-1', // 类型：-1所有，1公开
    keywords: '', // 文件名
    pageNum: '1',  // 第几页
    pageSize: '10',   // 每页多少条
  };
  public tableData: any = { // 表格数据
    list: [],
    totalPages: 0,
    currentPage: 1
  };

  ngOnInit() {
    this.serviceState = localStorage.setEntServiceData;
    this.roleId = this.commonService.getLoginMsg().roleType;
    this.isAvailableOne = !([5, 3, 4, 2, 6].indexOf(+this.serviceState) === -1) && !([1, 2].indexOf(+this.roleId) === -1);
    this.getTableDataFn();
    this.getRecordsCount();
  }

  /* 表格列表数据初始化 */
  getTableDataFn() {
    const getData = this.commonService.formObject(this.searchData);
    return this.http.get('/uc/' + this.ENTID + '/records' + getData).subscribe(
      res => {
        const resultData: any = res;
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

  // 分页
  pageChanged(pagenum: any) {
    this.searchData.pageNum = pagenum;
    this.tableData.currentPage = pagenum;
    this.getTableDataFn();
  }

  // 查询
  dataSearchFn() {
    this.getTableDataFn();
  }

  // 获取企业存储空间
  recordsCount: any = {
    count: 0,
    sumCount: 0,
    percentage: ''
  };
  progressWidth: any = 0;

  getRecordsCount() {
    this.http.get('/uc/' + this.ENTID + '/recordsCount').subscribe(
      res => {
        const resultData: any = res;
        if (resultData.code == 200) {
          const recount: any = (resultData.data.fileCount / 1024 / 1024 / 1024).toFixed(2);
          const resumCount: any = resultData.data.sunCount;
          this.recordsCount = {
            count: recount,
            sumCount: resumCount
          };

          if (+recount === 0 || +resumCount === 0) {
            this.recordsCount.percentage = '0%';
            this.progressWidth = {'width': this.recordsCount.percentage};
          } else if (recount > resumCount) {
            this.recordsCount.percentage = '100%';
            this.progressWidth = {'width': this.recordsCount.percentage, 'background': '#f00'};
          } else {
            this.recordsCount.percentage = (recount / parseFloat(resumCount) * 100).toFixed(2) + '%';
            this.progressWidth = {'width': this.recordsCount.percentage};
          }

        }
      },
      err => {
        console.log(err);
      });
  }

  /************** 初始化 end ****************/

  /* 操作视频 */
  deleteModal: boolean = false;
  // 删除单个视频文件
  deleSingleVideo = (fileId: any) => {
    const fileIdArr = [];
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
  //  删除多个视频文件
  deleMultipleVideo = () => {
    const fileIdArr = [];
    this.selectedData.forEach(item => {
      fileIdArr.push(item.fileId);
    });
    if (fileIdArr.length > 0) {
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
    } else {
      this._notification.create('error', '无选中项', '');
    }

  };

  // 删除视频方法
  deleVideo(fileIdArr: any) {
    let deleteData = ''; // 文件id（fileId），多个用“，”隔开
    for (let i = 0; i < fileIdArr.length; i++) {
      deleteData += fileIdArr[i] + ',';
    }
    this.http.delete('/uc/records/delete?ids=' + deleteData).subscribe(
      res => {
        const resultData: any = res;
        if (+resultData.code === 200) {
          this._notification.create('success', '删除成功', '');
          this.getTableDataFn();
          this.getRecordsCount();
          this.selectedData = [];
        } else {
          this._notification.create('error', '删除失败', '');
        }
      },
      err => {
        console.log(err);
      });
  }

  // 修改录播视频对外状态
  updateState(data: any) {
    const postData = {'state': !data.common};
    this.http.post('/uc/records/' + data.fileId + '/state', postData).subscribe(
      res => {
        const resultData: any = res;
        if (+resultData.code === 200) {
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
    // 创建变量用来保存选中结果
  selectedData = [];

  updateSelected(action: any, list: any) {
    if (action === 'add' && +this.selectedData.indexOf(list) === -1) {
      this.selectedData.push(list);
    }
    if (action === 'remove' && +this.selectedData.indexOf(list) !== -1) {
      this.selectedData.splice(this.selectedData.indexOf(list), 1);
    }
  }

  // 更新某一列数据的选择
  updateSelection($event: any, list: any) {
    const checkbox = $event.target;
    const action = (checkbox.checked ? 'add' : 'remove');
    this.updateSelected(action, list);
  }

  // 全选操作
  _allchecked($event: any) {
    const checkbox = $event.target;
    const action = (checkbox.checked ? 'add' : 'remove');
    for (let i = 0; i < this.tableData.list.length; i++) {
      const contact = this.tableData.list[i];
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
