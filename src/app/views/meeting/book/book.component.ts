import {Component, ViewChild, OnInit, TemplateRef, OnDestroy} from '@angular/core';
import {FormGroup, FormBuilder, Validators, FormControl} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {NzNotificationService} from 'ng-zorro-antd';
import {CommonService} from '@services/common.service';

// import { defineLocale } from 'ngx-bootstrap/bs-moment';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css']
})
export class BookComponent implements OnInit, OnDestroy {
  // 服务状态
  serviceState: any;
  // 用户角色
  roleId: any;
  // 是否可用
  isAvailableOne: boolean;
  appointFormData: any = {
    appointmentName: '',//会议名称
    appointmentType: 2,//会议类型
    hostPwd: '',//会议密码
    cycleMode: '0',//周期会议重复方式
    startTime: '',//会议开始时间
    selectedDate: '',//会议开始时间
    selectedHour: '',
    // selectedMinute: '30',
    appointmentPeriod: '2',//会议时长
    isRepeat: false,//是否周期会议
    repeatStartTime: '', //周期会议开始时间
    repeatEndTime: '',//周期会议结束时间
    // cycleMode: '0',//周期会议重复类型
    repeatRule: '',//重复周期

    isMute: false,//是否静音
    isLive: false,//是否直播
    livePwd: '',//直播密码
    isRecord: false,//是否录制
    isCanLive: true,//是否允许直播
    isCanRecord: true,//是否允许录制
    appointmentDesc: '',//会议描述
    appointmentUserList: []

  };
  isNotEdit: boolean = false;//是否可再次编辑某个参数
  private appointmentId: any;//会议的appointmentId
  private appointType: number;//会议的类型
  private sub: any;// 传递参数对象

  constructor(private fb: FormBuilder,
              private router: Router,
              private _activatedRoute: ActivatedRoute,
              private http: HttpClient,
              private _notification: NzNotificationService,
              private commonService: CommonService) {
    // this.appointmentForm = fb.group(this.appointFormData)
  }


  //发起会议 数据初始化
  appointData: object = {
    selectedDate: '',//会议开始时间
    selectedHour: '',
    isRecord: false,//是否录制
    isCanLive: true,//是否允许直播
    isCanRecord: true,//是否允许录制
    appointmentUserList: []//参会者集合
  };

  /* 日历初始化 */
  selectedDate = new Date();
  selectedHour = new Date();
  repeatStartTime = null;
  repeatEndTime = null;
  //不可选的分钟数
  disabledMinutes = (h) => {
    return this.getNewArray();
  };
  _disabledStartDate = (startValue) => {
    if (!startValue || !this.repeatEndTime) {
      return false;
    }
    return startValue.getTime() >= this.repeatEndTime.getTime();
  };
  _disabledEndDate = (endValue) => {
    if (!endValue || !this.repeatStartTime) {
      return false;
    }
    return endValue.getTime() <= this.repeatStartTime.getTime();
  };

  ngOnInit() {
    this.serviceState = localStorage.setEntServiceData;
    this.roleId = this.commonService.getLoginMsg().roleType;
    this.isAvailableOne = !([5, 3, 4, 2, 6, 1].indexOf(+this.serviceState) === -1) && !([3].indexOf(+this.roleId) === -1);
    // this.getNewArray();
    this.sub = this._activatedRoute.params.subscribe(params => {
      this.appointmentId = params['appointid'];
      this.appointType = params['appointType'];
    });
    this.getTemplate();

    if (this.appointType == 1 || this.appointType == 2) {
      this.isNotEdit = true;
    }
  }

  //添加参会者
  modal_info_add: boolean = false; //添加参会者modal是否显示
  chooseUserFn() {
    this.modal_info_add = true;
    console.log(this.showUserListData);
  }

  showUserListData: any;

  getAttendData(val: any) {
    this.showUserListData = val;
    // this.appointData.appointmentUserList=[];
    var listArr = [];
    var listObj = {
      userId: '',//用户id
      realName: '',//姓名
      isHost: false,//是否主讲人
      isAutocall: false,//是否自动呼叫
      apiUserId: '',//关联edge
      userType: ''//用户类型
    };
    val.forEach(item => {
      listObj.userId = item.userId;
      listObj.realName = item.realName;
      listObj.userType = item.userType;
      listArr.push(listObj);
    });
    // console.log('listArr',listArr)
  }

  //预约界面移除已选参会者
  removeUser(user: any) {
    this.showUserListData.splice(this.showUserListData.indexOf(user), 1);
    // this.appointData.appointmentUserList.splice(this.appointData.appointmentUserList.indexOf(user),1);
  }

  //监听modal状态
  getHideEmitter(val: any) {
    this.modal_info_add = val;
  }

  //查询发起会议模板
  templateData: any = {
    type: 0, //类型：0新增，1修改，2历史，3群组
    infoId: 0  //对应类型：0默认‘0’，1为‘appointmentId’，2为‘cid’，3为‘groupId’
  };

  getTemplate() {
    this.templateData.infoId = this.appointmentId;
    this.templateData.type = this.appointType;
    this.http.get('/uc/conferences/template?type=' + this.templateData.type + '&infoId=' + this.templateData.infoId).subscribe(
      res => {
        let resultData: any = res;
        this.appointFormData = resultData.data;
        this.appointFormData.appointmentType = resultData.data.appointmentType + '';
        this.appointFormData.cycleMode = resultData.data.cycleMode + '';

        // console.log(this.weekDayArr)
        //this.appointmentForm = fb.group(resultData.data);
        this.appointFormData.selectedDate = resultData.data.startTime;
        this.appointFormData.selectedHour = resultData.data.startTime;
        this.showUserListData = resultData.data.users;
        if (resultData.data.repeatRule) {
          var repeatRuleArr = resultData.data.repeatRule.split(',');
        } else {
          var repeatRuleArr = resultData.data.repeatWeekRule.split(',');
        }

        if (resultData.data.cycleMode == 0) {
          repeatRuleArr.forEach(item => {
            this.weekDayArr.push(parseInt(item));
          });
        } else {
          repeatRuleArr.forEach(item => {
            this.selectMonthDate.push(parseInt(item));
          });
        }


      },
      err => {
        console.log(err);
      }
    );
  }

  // inputParentData:any;//需要回显的预约详情
  showDetails: boolean = false;
  isLoadingSubmit: boolean = false;

  // 发起会议 （提交）
  postFormData(val: any) {

    //会议开始时间
    let stringTime: string = this.commonService.formatDate(val.selectedDate) + ' ' + this.commonService.formatDateTime(val.selectedHour) + ':00';
    val.startTime = new Date(stringTime).getTime();
    //重复会议起始时间
    val.repeatStartTime = this.commonService.formatDate(val.repeatStartTime);
    val.repeatEndTime = this.commonService.formatDate(val.repeatEndTime);
    //参会人员
    val.appointmentUserList = this.showUserListData;
    //周期
    if (val.cycleMode == '0') {
      val.cycleMode = 0;
      val.repeatRule = this.weekDayArr.join(',');
    } else {
      val.cycleMode = 1;
      val.repeatRule = this.selectMonthDate.join(',');
    }
    //历史会议再次发起 不传appointmentId
    if (this.appointType == 2) {
      val.appointmentId = '0';
    }
    //验证会议时长
    let checkPeriodBack = this.checkPeriod(val.appointmentPeriod);
    //验证会议名称
    let judgeNameBack = this.judgeNameFn(val.appointmentName);
    /***********************************************/
    // 验证结束后 post提交form信息
    let formData = val;
    if (checkPeriodBack && judgeNameBack) {
      this.isLoadingSubmit = true;
      this.submitFormDataFn(formData);
    }


  }

  submitFormDataFn(val: any) {
    this.http.post('/uc/conferences/launch', val).subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == 200) {
          this._notification.create('success', '发起会议成功', '');
          this.router.navigate(['/page/book-detail', resultData.data.appointmentId]);
        } else {
          this._notification.create('error', resultData.msg, '');
        }
        this.isLoadingSubmit = false;
      },
      err => {
        console.log(err);
        this.isLoadingSubmit = false;
      });
  }

  //判断输入的会议时长是否为5的倍数
  checkPeriod(time: any) {
    if(this.appointFormData.appointmentType == "0"){
      if (!time) {
        this._notification.create('error', '会议时长不能为空', '');
        return false;
      } else {
        if (time % 0.5 != 0) {
          this._notification.create('error', '最少时长0.5小时', '');
          return false;
        } else {
          return true;
        }
      }
    }else{
      return true
    }

  }

  //判断 会议名称不能为空
  judgeNameFn(name: any) {
    if (!name) {
      this._notification.create('error', '会议名称不能为空', '');
      return false;
    } else {
      return true;
    }
  }

  /* 重复周期 */
  changeCycle(type: any) {
    this.appointFormData.repeatRule = [];
  }

  //按周重复
  repeatWeeks: any = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  weekDayArr: any = [];

  chooseWeekFn($event: any, week: any) {
    let isChecked = $event.target.checked;
    if (isChecked) {
      if (this.weekDayArr.indexOf(week) == -1) {
        this.weekDayArr.push(week);
      }
    } else {
      this.weekDayArr.splice(this.weekDayArr.indexOf(week), 1);
    }
    // console.log(this.weekDayArr);
  }

  //工作日
  workDayText = '工作日';
  isWorkDay = false;

  workDayFn() {
    this.isWorkDay = !this.isWorkDay;
    this.workDayText = this.isWorkDay ? '取消' : '工作日';
    if (this.isWorkDay) {
      this.weekDayArr = [1, 2, 3, 4, 5];
    } else {
      this.weekDayArr = [];
    }
  }

  //全选
  weektext = '全选';
  isAllWeek = false;//默认不全选
  allWeekFn() {
    this.isAllWeek = !this.isAllWeek;
    this.weektext = this.isAllWeek ? '全不选' : '全选';
    if (this.isAllWeek) {
      this.weekDayArr = [1, 2, 3, 4, 5, 6, 7];
    } else {
      this.weekDayArr = [];
    }
    // console.log(this.weekDayArr);
  }

  isCheckedWeek(num: any) {
    return this.weekDayArr.indexOf(num) >= 0;
  }

// 按月重复
  oneMonthDate: any = [{'day': 1, 'type': false}, {'day': 2, 'type': false}, {'day': 3, 'type': false}, {'day': 4, 'type': false},
    {'day': 5, 'type': false}, {'day': 6, 'type': false}, {'day': 7, 'type': false}, {'day': 8, 'type': false}, {'day': 9, 'type': false},
    {'day': 10, 'type': false}, {'day': 11, 'type': false}, {'day': 12, 'type': false}, {'day': 13, 'type': false}, {
      'day': 14,
      'type': false
    },
    {'day': 15, 'type': false}, {'day': 16, 'type': false}, {'day': 17, 'type': false}, {'day': 18, 'type': false}, {
      'day': 19,
      'type': false
    },
    {'day': 20, 'type': false}, {'day': 21, 'type': false}, {'day': 22, 'type': false}, {'day': 23, 'type': false}, {
      'day': 24,
      'type': false
    },
    {'day': 25, 'type': false}, {'day': 26, 'type': false}, {'day': 27, 'type': false}, {'day': 28, 'type': false}, {
      'day': 29,
      'type': false
    }, {'day': 30, 'type': false}, {'day': 31, 'type': false}];
  monthDateArr: any = [];
  selectMonthDate: any = [];

  selectMonth(num: any) {
    let daytype = num.type;
    if (!daytype) {
      num.type = true;
      this.monthDateArr.push(num.day);
    } else {
      num.type = false;
      let oldindex = this.monthDateArr.indexOf(num.day);
      this.monthDateArr.splice(oldindex, 1);
    }
    this.selectMonthDate = this.monthDateArr;
  }

  //点击已选择的日期 进行删除当前日期
  deleteThisDay(day: any) {
    this.oneMonthDate[day - 1].type = false;
    var updateArr = this.monthDateArr;
    for (var i = 0; i < updateArr.length; i++) {
      if (updateArr[i] == day) {
        this.monthDateArr.splice(i, 1);
      }
    }
    this.selectMonthDate = this.monthDateArr;
  }

  //返回不是10的倍数的数组
  getNewArray() {
    const result = [];
    for (let i = 0; i <= 60; i++) {
      if (i % 10 != 0) {
        result.push(i);
      }
    }
    return result;
  }

  //组件卸载的时候取消订阅
  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
