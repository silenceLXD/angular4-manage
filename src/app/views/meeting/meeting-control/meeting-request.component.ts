import { Component, OnInit, EventEmitter, Output,Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '@services/common.service';
import { NzNotificationService } from 'ng-zorro-antd';

@Component({
  selector: 'meeting-request',
  template: `
  <p class="marginTB10">当直播用户申请加入会议时，会显示在下方。</p>
  <nz-table #nzRequestTable [nzDataSource]="_dataSet" (nzDataChange)="_displayDataChange($event)" [nzIsPagination]="false" [nzScroll]="{ y: 240 }" [nzSize]="'middle'">
    <ng-template #nzFixedHeader>
      <thead nz-thead>
        <tr>
          <th nz-th [nzWidth]="'10px'" nzCheckbox>
            <label nz-checkbox [(ngModel)]="_allChecked" [nzIndeterminate]="_indeterminate" (ngModelChange)="_checkAll($event)">
            </label>
          </th>
          <th nz-th [nzWidth]="'200px'"><span>直播用户</span></th>
          <th nz-th><span>入会申请时间</span></th>
        </tr>
      </thead>
    </ng-template>
    <tbody nz-tbody>
      <tr nz-tbody-tr *ngFor="let data of nzRequestTable.data">
        <td nz-td nzCheckbox>
          <label nz-checkbox [(ngModel)]="data.checked" (ngModelChange)="_refreshStatus($event)">
          </label>
        </td>
        <td nz-td>{{data.name}}</td>
        <td nz-td>{{data.time}}</td>
      </tr>
    </tbody>
  </nz-table>
  `,
  styles: [`

    `]
})

export class meetingRequestComponent implements OnInit {
  @Output() outPutRequestData:EventEmitter<any> = new EventEmitter();//子传父
  @Input() cid:any;//父传子  获取来自父组件的数据
  constructor(private http: HttpClient, private commonService: CommonService,private _notification: NzNotificationService) {

  }

  _allChecked = false;
  _disabledButton = true;
  _checkedNumber = 0;
  _displayData: Array<any> = [];
  _operating = false;
  _dataSet = [];
  _indeterminate = false;
  _checkedList = [];

  _displayDataChange($event) {
    this._displayData = $event;
  }

  _refreshStatus() {
    const allChecked = this._displayData.every(value => value.checked === true);
    const allUnChecked = this._displayData.every(value => !value.checked);
    this._allChecked = allChecked;
    this._indeterminate = (!allChecked) && (!allUnChecked);
    this._disabledButton = !this._dataSet.some(value => value.checked);
    this._checkedList = this._dataSet.filter(value => value.checked);
    this._checkedNumber = this._dataSet.filter(value => value.checked).length;

    this.outPutRequestData.emit(this._checkedList);
  }

  _checkAll(value) {
    if (value) {
      this._displayData.forEach(data => data.checked = true);
    } else {
      this._displayData.forEach(data => data.checked = false);
    }
    this._refreshStatus();
  }

  _operateData() {
    this._operating = true;
    setTimeout(_ => {
      this._dataSet.forEach(value => value.checked = false);
      this._refreshStatus();
      this._operating = false;
    }, 1000);
  }

  ngOnInit() {
    for (let i = 0; i < 16; i++) {
      this._dataSet.push({
        userId    : i,
        name   : `name ${i}`,
        time:'2018-01-20'
      });
    }
  }

  // 允许/拒绝直播申请入会
  // /conferences/{cid}/handle-apply
  handleApplyFn(type:boolean){
    // isAllowed 允许-true,拒绝-false;  userIds 用户id数组
    let postData = {"isAllowed":type,"userIds":[]};
    this.http.post('/uc/conferences/'+this.cid+'/handle-apply',postData).subscribe(
      res => {
        let resultData:any = res;
        if(resultData.code == '200'){
          this._notification.create('success', '操作成功','');
        }else{
          this._notification.create('error', '操作失败','');
        }
      },err => {
        console.log("等待入会 error...");
    });
  }

}
