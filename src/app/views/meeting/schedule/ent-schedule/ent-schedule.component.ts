import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormControl} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '@services/common.service';
import {NzModalService} from 'ng-zorro-antd';
import {NzNotificationService} from 'ng-zorro-antd';

@Component({
  selector: 'app-ent-schedule',
  templateUrl: './ent-schedule.component.html',
  styleUrls: ['./ent-schedule.component.css']
})
export class EntScheduleComponent implements OnInit {
  // 服务状态
  serviceState: any;
  // 用户角色
  roleId: any;
  // 是否可用
  isAvailableOne: boolean;
  public loginUserData = this.commonService.getLoginMsg();
  ENTID = this.loginUserData.entId; // loginUserData.entId

  searchData: any;
  _startDate = new Date();
  sevenDays;
  _endDate;

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
      pageNum: '1', //第几页
      pageSize: '10',  //每页多少条
      appointmentName: ''//会议名称
    };
  }

  /******* 日期选择器 start ******/
  _startValueChange = () => {
    if (this._startDate > this._endDate) {
      this._endDate = null;
    }
    this.searchData.startTime = this.commonService.formatDate(this._startDate) + ' 00:00:00';
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
    this.serviceState = localStorage.setEntServiceData;
    this.roleId = this.commonService.getLoginMsg().roleType;
    this.isAvailableOne = !([5, 3, 4, 2, 6].indexOf(+this.serviceState) === -1) && !([1, 2].indexOf(+this.roleId) === -1);
    this.getTableDataFn();//页面加载 渲染表格
  }

  /* 表格列表数据初始化 */
  getTableDataFn() {
    let getData = this.commonService.formObject(this.searchData);
    return this.http.get('/uc/' + this.ENTID + '/appointments' + getData).subscribe(
      res => {
        let resultData: any = res;
        this.tableData.list = [];
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
    this.getTableDataFn();
  }

  //查询
  dataSearchFn() {
    this.getTableDataFn();
  }

  /************** 初始化 end ****************/

  /******** 操作 *******/
  alertModal: boolean = false;
  deleteModal: boolean = false;
  haveRepeat: boolean = false; //是否存在重复会议
  // 删除单个会议
  deleteMeetingFn = (data: any) => {
    if (data.isRepeat) {
      this.judgeIsRepeat(data.appointmentId);
      this.deleteModal = true;
    } else {
      let idsArr = [];
      idsArr.push(data.appointmentId);
      this.confirmServ.confirm({
        title: '删除',
        content: '是否确认删除会议？',
        okText: '确定',
        cancelText: '取消',
        onOk: async () => {
          this.sureDeleteMeetingFn(idsArr);
        },
        onCancel() {
        }
      });
    }
  };
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

  // 删除会议 方法
  sureDeleteMeetingFn(idsArr: any,type?:any) {
    if(type){
      var typeM = "取消";
    }else{
      var typeM = "删除";
    }
    let deleteData = ''; //会议id，多个用‘，’隔开
    for (let i = 0; i < idsArr.length; i++) {
      deleteData += idsArr[i] + ',';
    }
    return this.http.delete('/uc/appointments/delete?appointmentIds=' + deleteData).subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == '200') {
          this._notification.create('success', typeM+'成功', '');
          this.getTableDataFn();
          this.deleteModal = false;
        } else {
          this._notification.create('error', typeM+'失败', '');
        }
      },
      err => {
        console.log('删除会议... err');
      });
  }

  // 取消预约
  cancelMeetingFn = (data: any) => {
    let idsArr = [];
    idsArr.push(data.appointmentId);
    this.confirmServ.confirm({
      title: '取消预约',
      content: '是否确认取消预约会议？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        this.sureDeleteMeetingFn(idsArr,"cancel");
      },
      onCancel() {
      }
    });
  };
  // 结束会议
  isLoadingEnd: boolean = false;
  endMeetingFn = (data: any) => {
    let listData: any = data;
    this.confirmServ.confirm({
      title: '结束会议',
      content: '会议关闭之后，参会人员将被强制退出会议，是否确认结束关闭会议？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        this.isLoadingEnd = true;
        await this.endMeeting(listData.controlId);
      },
      onCancel() {
      }
    });
  };

  //结束会议方法
  endMeeting(cid: any) {
    this.http.post('/uc/conferences/' + cid + '/stop', '').subscribe(
      res => {
        const resultData: any = res;
        if (+resultData.code === 200) {
          setTimeout(() => {
            this.isLoadingEnd = false;
            this.getTableDataFn();
            this._notification.create('success', '会议已结束', '');
          }, 30000);

        } else {
          this._notification.create('error', '操作失败', '');
        }
      }, err => {
        console.log('结束会议 error...');
      });
  };


  // 直播链接 按钮
  liveSrcModal: boolean = false;
  srcContent: string;//直播链接地址
  liveSrcFn(list: any) { //根据会议id获取直播信息
    this.liveSrcModal = true;
    let appointmentId = list.appointmentId;
    this.srcContent = this.commonService.getPath() + '#/watch-live/' + appointmentId;
    // this.http.get('/uc/appointments/'+appointmentId+'/live').subscribe(
    //   res => {
    //     let resultData:any = res;
    //     this.srcContent = resultData.data.liveAddress
    //   },
    //   err => {
    //     console.log(err);
    //   });
  }

  copyLiveSrcFn() {
    this.liveSrcModal = false;
    this._notification.create('success', '复制成功', '');
  }

  // 启动会议 按钮
  beginMeetingFn(data: any) {
    let appointmentId = data.appointmentId;
    this.http.post('/uc/appointments/' + appointmentId + '/start', '').subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == '200') {
          this._notification.create('success', '启动成功', '');
          this.getTableDataFn();
        } else {
          this._notification.create('error', '启动失败', '');
        }
      },
      err => {
        console.log(err);
      });
  }


  /******** 操作 end ********/

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
    // console.log(this.selectedData);
    // if(this.selectedData.length > 0){
    //   this.isdisabled = false;
    // }else{
    //   this.isdisabled = true;
    // }
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
