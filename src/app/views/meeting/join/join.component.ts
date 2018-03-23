import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {NzNotificationService} from 'ng-zorro-antd';
import {CommonService} from '@services/common.service';
import {FormBuilder, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.css']
})
export class JoinComponent implements OnInit {
  // 服务状态
  serviceState: any;
  // 用户角色
  roleId: any;
  // 是否可用
  isAvailableOne: boolean;
  isAvailableTwo: boolean;
  isAvailableThree: boolean;

  joinFormModel: FormGroup;
  webRtcUrl: string; // webrtc入会连接
  vmrNumber: string; // 会议号
  isCanJoin: boolean;

  constructor(private _notification: NzNotificationService,
              private http: HttpClient,
              private fb: FormBuilder,
              private commonService: CommonService) {
  }

  ngOnInit() {
    this.serviceState = localStorage.setEntServiceData;
    this.roleId = this.commonService.getLoginMsg().roleType;
    this.isAvailableOne = !([5, 3, 4, 2].indexOf(+this.serviceState) === -1) && !([3].indexOf(+this.roleId) === -1);
    this.isAvailableTwo = !([6].indexOf(+this.serviceState) === -1) && !([3].indexOf(+this.roleId) === -1);
    this.isAvailableThree = !([1].indexOf(+this.serviceState) === -1) && !([3].indexOf(+this.roleId) === -1);
    this.joinFormModel = this.fb.group({
      vmrNumber: '',
    });
    this.isCanJoin = false;
    this.joinFormModel.get('vmrNumber').valueChanges
      .debounceTime(500)
      .subscribe(
        value => {
          if (value === '') {
            this._notification.create('error', '请输入会议号！', '');
            this.isCanJoin = false;
          } else {
            this.checkVmrFn(value);
          }
        }
      );
  }

  sureJoinFn(number: any) {
    // console.log(number)
    if (number) {
      if (this.isCanJoin) {
        this.joinVmrFn(number);
        this.webRtcUrl = '/webrtc/#conference=' + number;
      }
    }
  }

  // 加入会议
  joinVmrFn(number: any) {
    return this.http.post('/uc/conferences/' + number + '/check', '').subscribe(
      res => {
        const resultData: any = res;
        if (+resultData.code === 200) {
          this._notification.create('success', '加入成功', '');
        } else {
          this._notification.create('error', resultData.msg, '');
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  // 检查会议号
  checkVmrFn(number: any) {
    // console.log(number);
    // 根据会议室号检验用户是否可以入会
    return this.http.post(`/uc/conferences/${number}/check-type`, '').subscribe(
      res => {
        const resultData: any = res;
        if (+resultData.code === 200) {
          if (+resultData.data === 0) {
            this._notification.create('error', '无此会议号！', '');
            this.isCanJoin = false;
            // this.isCanJoin = true;
          } else if (+resultData.data === 2 && this.isAvailableOne) {
            this._notification.create('error', '无法加入会议！', '');
            this.isCanJoin = false;
          } else if (+resultData.data === 4 && this.isAvailableThree) {
            this._notification.create('error', '企业已冻结！', '');
            this.isCanJoin = false;
          } else {
            this.isCanJoin = true;
          }
        } else {
          this._notification.create('error', resultData.msg, '');
        }
      },
      err => {
        console.log(err);
      }
    );
  }
}
