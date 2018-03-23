import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormControl} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '@services/common.service';
import {NzModalService} from 'ng-zorro-antd';
import {NzNotificationService} from 'ng-zorro-antd';

@Component({
  selector: 'app-user-schedule',
  templateUrl: './user-schedule.component.html',
  styleUrls: ['./user-schedule.component.css']
})
export class UserScheduleComponent implements OnInit {
  // 服务状态
  serviceState: any;
  // 用户角色
  roleId: any;
  // 是否可用
  isAvailableOne: boolean;

  searchData: any;
  _startDate = new Date();
  sevenDays;
  _endDate;
  public loginUserData = this.commonService.getLoginMsg();

  constructor(private fb: FormBuilder,
              private http: HttpClient,
              private commonService: CommonService,
              private confirmServ: NzModalService,
              private _notification: NzNotificationService) {
    this.sevenDays = new Date(this._startDate);
    this.sevenDays.setDate(this._startDate.getDate() + 7);
    this._endDate = this.sevenDays;
    //查询数据数初始化
    this.searchData = {
      startTime: this.commonService.formatDate(this._startDate) + ' 00:00:00', //查询开始时间
      endTime: this.commonService.formatDate(this._endDate) + ' 23:59:59', //查询结束时间
      type: '', //会议类型
      pageNum: '1', //第几页
      pageSize: '5',  //每页多少条
      appointmentName: ''//会议名称
    };

    this.serviceState = localStorage.setEntServiceData;
    this.roleId = this.commonService.getLoginMsg().roleType;
    this.isAvailableOne = !([5, 3, 4, 2, 6, 1].indexOf(+this.serviceState) === -1) && !([3].indexOf(+this.roleId) === -1);
  }

  /******* 日期选择器 start ******/
  _startValueChange = () => {
    if (this._startDate > this._endDate) {
      this._endDate = null;
    }
    this.searchData.startTime = this.commonService.formatDate(this._startDate) + ' 00:00:00';
    // console.log(this._startDate);
    this.dataSearchFn();
  };
  _endValueChange = () => {
    this.searchData.endTime = this.commonService.formatDate(this._endDate) + ' 23:59:59';
    if (new Date(this.commonService.formatDate(this._startDate) + ' 00:00:00') > this._endDate) {
      this._startDate = null;
    }
    this.dataSearchFn();
  };
  _disabledStartDate = (startValue) => {
    if (!startValue || !this._endDate) {
      return false;
    }
    return startValue.getTime() > this._endDate.getTime();
    // return startValue.getTime() >= this._endDate.getTime();
  };
  _disabledEndDate = (endValue) => {
    if (!endValue || !this._startDate) {
      return false;
    }
    return endValue.getTime() + 86399999 < this._startDate.getTime();
    // return endValue.getTime() <= this._startDate.getTime();
  };
  /****** 日期选择器 end ******/

  /******************** 初始化声明 ******************/
    // =======表格显示数据
  public tableData: any = {//表格数据
    list: [],
    totalPages: 0,
    currentPage: 1
  };

  ngOnInit() {
    this.getTableDataFn();//页面加载 渲染表格
  }

  /* 表格列表数据初始化 */
  getTableDataFn() {
    let getData = this.commonService.formObject(this.searchData);
    return this.http.get('/uc/appointments' + getData).subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == 200) {
          this.tableData = {
            list: resultData.data.list,
            totalPages: resultData.data.total,
            currentPage: resultData.data.pageNum
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
    this.searchData.pageNum = pagenum;
    // alert(pagenum)
    this.tableData.currentPage = pagenum;
    this.getTableDataFn();
  }

  //查询
  dataSearchFn() {
    this.getTableDataFn();
  }

  /************** 初始化 end ****************/

  /******************** 操作 start ********************/
  /**** 删除会议 按钮 ****/
  alertModal: boolean = false;
  deleteModal: boolean = false;
  haveRepeat: boolean = false; //是否存在重复会议
  deleteMeetingFn(list) {
    //先判断是否存在重复会议this.haveRepeat
    if (list.isRepeat) {
      this.judgeIsRepeat(list.appointmentId);
      this.deleteModal = true;
    } else {
      let deleteArr = [];
      deleteArr.push(list.appointmentId);
      this.confirmServ.confirm({
        title: '删除',
        content: '是否确认删除会议？',
        okText: '确定',
        cancelText: '取消',
        onOk: async () => {
          await this.sureDeleteMeetingFn(deleteArr);
        },
        onCancel() {
        }
      });
    }
  }

  // 获取重复会议
  repeatListData: any = [];

  judgeIsRepeat(appointmentId: any) {
    this.http.get('/uc/appointments/' + appointmentId + '/repeat').subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == 200) {
          this.repeatListData = resultData.data;
          if (resultData.data && resultData.code.length > 0) {
            this.haveRepeat = true;
          } else {
            this.haveRepeat = false;
          }
        }
      },
      err => {
        console.log(err);
      });
  }

  // 删除重复会议
  deleteRepeatFn() {
    let deleteArr = [];
    this.selectedData.forEach(item => {
      deleteArr.push(item.appointmentId);
    });
    this.sureDeleteMeetingFn(deleteArr);
  }

  // 确定删除已选择会议
  sureDeleteMeetingFn(arr: any) {
    let deleteData = ''; //会议id，多个用‘，’隔开
    arr.forEach(item => {
      deleteData += item + ',';
    });
    return this.http.delete('/uc/appointments/delete?appointmentIds=' + deleteData).subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == '200') {
          this._notification.create('success', '操作成功', '');
          this.getTableDataFn();
        } else {
          this._notification.create('error', '操作失败', '');
        }
        this.deleteModal = false;
      },
      err => {
        console.log(err);
      });
  }

  /** 取消预约 按钮 **/
  cancelMeetingFn(list: any) {
    let cancelArr = [];
    cancelArr.push(list.appointmentId);
    this.confirmServ.confirm({
      title: '取消预约',
      content: '是否确认取消预约会议？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        await this.sureDeleteMeetingFn(cancelArr);
      },
      onCancel() {
      }
    });
  }

  /** 会议控制 按钮 **/
  controlMeetingFn(list) {

  }

  /** 入会 按钮 **/
  enterWebRtcFn(list) {

  }

  /** 直播链接 按钮 **/
  liveSrcModal: boolean = false;
  srcContent: string;//直播链接地址
  liveSrcFn(list: any) { //根据会议id获取直播信息
    this.liveSrcModal = true;
    let appointmentId = list.appointmentId;
    this.srcContent = this.commonService.getPath() + '#/watch-live/' + appointmentId;
    // this.http.get('/uc/appointments/'+appointmentId+'/live').subscribe(
    //     res => {
    //       let resultData:any = res;
    //       // this.srcContent = resultData.data.liveAddress
    //
    //     },
    //     err => {
    //       console.log(err);
    //     });
  }

  copyLiveSrcFn() {
    this.liveSrcModal = false;
    this._notification.create('success', '复制成功', '');
  }

  /******************** 操作 end ********************/

  /*************** 复选框 选择操作 *****************/
    //创建变量用来保存选中结果
  selectedData = [];
  isdisabled: boolean = false;

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
    for (let i = 0; i < this.repeatListData.length; i++) {
      let contact = this.repeatListData[i];
      this.updateSelected(action, contact);
    }
  }

  isSelected(list: any) {
    return this.selectedData.indexOf(list) >= 0;
  }

  isSelectedAll() {
    if (this.repeatListData.length > 0) {
      return this.selectedData.length === this.repeatListData.length;
    } else {
      return false;
    }

  }

  /*************** 复选框 选择操作 end*****************/
}
