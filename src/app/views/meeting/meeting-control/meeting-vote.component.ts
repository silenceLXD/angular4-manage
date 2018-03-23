import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CommonService } from '@services/common.service';
import { NzNotificationService } from 'ng-zorro-antd';
import { NzModalService } from 'ng-zorro-antd';

@Component({
  selector: 'meeting-vote',
  template: `
  <nz-modal [nzVisible]="meetingVoteModal" [nzTitle]="'投票'" [nzContent]="meetingVoteContent" [nzFooter]="false" (nzOnCancel)="handCancle()">
    <ng-template #meetingVoteContent>
      <div class="">
    <div class="vote-body">
      <div class="vote-nav">
        <a href="javascript:;" class="nav-btn radius-left" [ngClass]="active==1?'active':''" (click)="getVoteData()">在线投票</a>
        <a href="javascript:;" class="nav-btn radius-right" [ngClass]="active==2?'active':''" style="margin-left:-10px;" (click)="historyVoteFn()">历史投票</a>
      </div>
      <!-- ======================== 在线投票 ========================-->
      <div class="" *ngIf="active == 1">
        <div class="marginTB10" *ngIf="!isCanAdd">
          <div (click)="addVoteFn()" style="display:inline-block;">
            <span class="addVote-icon"></span>
            <p>新增投票</p>
          </div>
        </div>
        <!-- ============ 发起投票 ============ -->
        <div class="vote-item" *ngIf="isCanAdd">
          <form name="addVoteForm">
          <!-- 投票主题 -->
          <div class="vote-item-part">
            <div class="vote-item-input">
              <input type="text" [(ngModel)]="addVoteFormData.voteTheme" name="voteTheme" placeholder="请输入投票主题">
            </div>
          </div>

          <div class="vote-item-part">
            <!-- 投票选项 -->
            <div class="">
              <ul class="vote-item-ul">
                <li class="vote-item-li" *ngFor="let control of controlArray;let i = index">
                  <div nz-row class="vote-item-input">
                      <div nz-col [nzSpan]="4" style="line-height:30px;">选项{{i+1}}</div>
                      <div nz-form-control nz-col [nzSpan]="20">
                        <nz-input [(ngModel)]="control.controlInstance" [name]="control.item" [nzPlaceHolder]="'添加选项'" [nzSize]="'large'" style="width: 85%; margin-right:8px;"></nz-input>
                        <i class="anticon anticon-minus-circle-o dynamic-delete-button" (click)="removeField(control,$event)"></i>
                      </div>
                  </div>
                </li>
                <li class="vote-item-li">
                  <div class="text-center">
                    <button nz-button [nzType]="'dashed'" [nzSize]="'large'" style="width:60%" (click)="addInput($event)">
                      <i class="anticon anticon-plus"></i>
                      <span> 新增选项 </span>
                    </button>
                  </div>
                </li>
              </ul>
            </div>
            <!-- 投票类型 -->
            <div class="" style="border-top:1px solid #999;padding:8px;">
              <label for="" style="margin-right:15px;">投票类型 </label>
              <nz-radio-group name="type" [(ngModel)]="addVoteFormData.type">
                <label nz-radio [nzValue]="'1'">
                  <span>单选</span>
                </label>
                <label nz-radio [nzValue]="'2'">
                  <span>多选</span>
                </label>
              </nz-radio-group>
            </div>
          </div>

          <!-- 投票有效时间 -->
          <div class="vote-item-part">
            <label for="">投票有效时间</label>
            <span style="margin-left: 40px;">
              <nz-input-number name="effectiveTime" [(ngModel)]="addVoteFormData.effectiveTime" [nzMin]="1" [nzMax]="999" [nzStep]="1"></nz-input-number> 分钟
            </span>
          </div>

          <!-- 投票操作按钮 -->
          <div class="vote-item-btn">
            <button nz-button [nzType]="'default'" [nzSize]="'large'" (click)="isCanAdd=false"> 取 消 </button>
            <button nz-button [nzSize]="'large'" [nzType]="'primary'" (click)="submitAddVoteForm()">确认</button>
          </div>
          </form>
        </div>

        <!-- ================ 投票列表 ================ -->
        <div *ngIf="!isCanAdd">
          <div class="vote-item-part clearfix" *ngFor="let list of voteDta">
            <div class="marginTB10">
              <b>投票结果</b>
            </div>
            <div class="vote-item-list">
              <b class="marginTB10">{{list.voteTheme}}</b>
              <p nz-row class="item-list-name">
                <span nz-col [nzSpan]="16">{{list.createUserName}}发起了投票</span>
                <span nz-col [nzSpan]="8">{{list.type==1?'单选':'多选'}}</span>
              </p>
              <ul class="vote-item-ul">
                <li class="vote-item-li" *ngFor="let item of list.options"> {{item.content}} <span class="pull-right">{{item.count}}票</span></li>
              </ul>

              <div class="list-time">
                <p nz-row>
                  <span nz-col [nzSpan]="16">截止时间：{{list.endTime | date:'yyyy-MM-dd HH:mm'}}</span>
                  <span nz-col [nzSpan]="8">{{list.waivers.length}}人弃权</span>
                </p>
              </div>
            </div>

            <div class="vote-item-btn">
              <a href="javascript:;" class="btn-border" (click)="stopVoteFn(list.id)">结束本次投票</a>
              <a href="javascript:;" class="btn-sure" (click)="cancelVoteFn(list.id)">取消本次投票</a>
            </div>
          </div>
        </div>
        <!-- ================ 投票结果 ================ -->
      </div>

      <!-- ======================== 历史投票 ========================-->
      <div class="" *ngIf="active==2">
        <div class="history-vote-list vote-item-part" *ngFor="let list of historyVoteData">
          <div nz-row class="item-list-name">
            <b nz-col [nzSpan]="16">{{list.voteTheme}}</b>
            <a href="javascript:;" nz-col [nzSpan]="8" (click)="showDetail=!showDetail">{{showDetail?'收起':'查看数据'}}</a>
          </div>
          <ul class="vote-item-ul" *ngIf="showDetail">
            <li class="vote-item-li" *ngFor="let item of list.options"> {{item.content}} <span class="pull-right">{{item.count}}票</span></li>
          </ul>
          <div nz-row class="item-list-name">
            <span nz-col [nzSpan]="16">{{list.createUserName}}发起了投票</span>
            <span nz-col [nzSpan]="8">{{list.type==1?'单选':'多选'}}</span>
          </div>
          <div nz-row>
            <span nz-col [nzSpan]="16">截止时间：{{list.endTime | date:'yyyy-MM-dd HH:mm'}}</span>
            <span nz-col [nzSpan]="8">{{list.total - list.users.length}}人弃权</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</ng-template>
</nz-modal>
  `,
  styles: [`
    .addVote-icon{
      width: 32px;
      height: 32px;
      display: inline-block;
      cursor: pointer;
      background: url(../../../../assets/img/icon/vote_add_icon.png) no-repeat;
      background-size: cover;
      margin: 0 10;
    }
    .vote-content{
      width: 280px;
      height: 480px;
      margin-left: 1px;
      background-color: #3f4a5d;
      border-radius: 2px;
      box-shadow: 2px 0px 4px #716f6f;
      font-size: 12px;
    }
    .vote-content .vote-header{
      text-align: left;
      color: #ffffff;
      border-bottom: 1px solid #bdbcbc;
      padding: 8px 8px;
    }
    .vote-body{
      min-height:300px;
      margin:5px 50px;
      overflow-y: auto;
    }
    .vote-body .vote-nav{
      text-align: center;
      margin: 10px 0;
    }
    .vote-nav .nav-btn{
      font-size: 10px;
      padding: 10px 15px;
      color: #000;
      text-decoration:none;
    }
    .vote-nav .nav-btn.active{
      background-color: #4990e2;
      color: #fff;
      text-decoration:none;
    }
    .vote-nav .radius-left{
      border-top-left-radius: 20px;
      border-bottom-left-radius: 20px;
      border:1px solid #4990e2;
    }
    .vote-nav .radius-right{
      border-top-right-radius: 20px;
      border-bottom-right-radius: 20px;
      border:1px solid #4990e2;
    }
    .initiate-vote{
      /* text-align: left; */
      float: left;
      display: inline-block;
      cursor: pointer;
      margin: 0 10px;
    }
    .initiate-vote-icon{
      display: inline-block;
      width:25px;
    	height:25px;
    	/* margin-right:5px; */
    }
    .initate-txt{
      vertical-align: super;
      font-size: 10px;
    }
    .vote-item{
      padding: 0 5px;
    }

    .vote-item-part{
      border-radius: 9.8px;
    	border: 1px solid #ccc;
      padding:8px 5px;
      text-align: left;
      margin-bottom: 10px;

    }
    .vote-item-input>input[type="text"] {

        border: none;
        border-radius: 10px;
        color: #666;
        padding: 5px 8px;
        width:100%;
    }
    .vote-item-input ::-webkit-input-placeholder { /* WebKit browsers */
        color:    #ccc;
    }
    .vote-item-input :-moz-placeholder { /* Mozilla Firefox 4 to 18 */
        color:    #ccc;
    }
    .vote-item-input ::-moz-placeholder { /* Mozilla Firefox 19+ */
        color:    #ccc;
    }
    .vote-item-input :-ms-input-placeholder { /* Internet Explorer 10+ */
        color:    #ccc;
    }

    .vote-item-ul{
      text-align: left;
    }
    .vote-item-ul .vote-item-li{
      margin-left: 20px;
      overflow: hidden;
      padding: 6px;
    }
    .vote-item-btn{
      margin: 15px 0;
      text-align:center;
    }
    .vote-item-btn>.btn-border{
      padding: 10px;
      border-radius: 15px;
      border: solid 0.5px #4990e2;
      color: #4990e2;
    }
    .vote-item-btn>.btn-sure{
      padding: 10px;
      border-radius: 15px;
      border: solid 0.5px #4990e2;
      color: #fff;
      background: #4990e2;
    }

    .addBtn,.deleteBtn{
      color: #999999;
      font-size: 12px;
      margin-top:5px;!important;
    }
    .deleteBtn{
      display: inline-block;
      cursor: pointer;
      /* height: 30px;
      line-height: 30px;
      border: 1px solid #ededed;
      padding: 0px 5px;
      border-right: 0px; */
      padding: 3px 5px;
      background-color: #fafafc;
    	border: solid 0.5px #8c90a2;
    }
    .addBtn{
      margin-left: -2px;
      display: inline-block;
      cursor: pointer;
      /* height: 30px;
      line-height: 30px;
      border: 1px solid #ededed;
      padding: 0px 5px;
      border-left: 0px; */

      padding: 3px 5px;
      background-color: #fafafc;
    	border: solid 0.5px #8c90a2;
    }
    .numInput[type="text"]{
      width: 30px;
      margin-left: -1px;
      /* border: 1px solid #EDEDED; */
      text-align: center;
      padding: 3px 0;
      /* margin-top: -5px; */
      position: relative;
    }

    .vote-item-list{

      margin: 10px 20px;
    }
    .vote-item-list ul>li{
      border-bottom:1px solid #ccc;
    }
    .vote-item-list .list-time{
      text-align: left;
      color: #999;
    }
    .vote-item-list .item-list-name{
      border-bottom:1px solid #ccc;
    }
    /* 历史投票 */
    .history-vote-list{
      margin-top:18px;
    }
    .history-vote-list div{
      margin:12px;
    }

    `]
})

export class meetingVoteComponent implements OnInit {
  @Output() outPutVoteData:EventEmitter<any> = new EventEmitter();//子传父
  @Output() hide_emitter = new EventEmitter();// 发射隐藏modal的事件

  @Input() meetingVoteModal:boolean; //父传子  获取来自父组件的modal
  @Input() cid:any;//父传子  获取来自父组件的数据
  vote_status:any;//获取投票状态(根据sse推送判断当前投票是否结束)
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private commonService: CommonService,
    private confirmServ: NzModalService,
    private _notification: NzNotificationService
  ) {
    commonService.voteStatus.subscribe((value: any) => {
      this.vote_status = value;
      if(this.vote_status){
        this.historyVoteFn();
      }
    });
  }

  active=1;
  // 新增投票 按钮
  isCanAdd:boolean=false;
  addVoteFn(){
    this.isCanAdd=true;
    this.controlArray = [];
    this.addVoteFormData = {
      voteTheme:'',//主题内容
      effectiveTime:'1',//投票时长，单位分钟
      type:'1',//单选1，多选2
      voteContext:[]//选项内容
    }
  }

  controlArray:any = [
    {
      id:0,
      controlInstance: '',
      item:'item1'
    },
    {
      id:1,
      controlInstance: '',
      item:'item2'
    }
  ];
  addVoteFormData:any = {
    voteTheme:'',//主题内容
    effectiveTime:'1',//投票时长，单位分钟
    type:'1',//单选1，多选2
    voteContext:[]//选项内容
  }
  ngOnInit() {
    this.getVoteData();

  }

  addInput(e?: MouseEvent){
    if (e) {
      e.preventDefault();
    }
    const id = (this.controlArray.length > 0) ? this.controlArray[this.controlArray.length - 1].id + 1 : 0;
    const control = {
      id,
      controlInstance: '',
      item:`item${id+1}`
    };
    const index = this.controlArray.push(control);
    // console.log(this.controlArray)
  }
  removeField(i, e: MouseEvent) {
    e.preventDefault();
    if (this.controlArray.length > 2) {
      const index = this.controlArray.indexOf(i);
      this.controlArray.splice(index, 1);
      // console.log(this.controlArray);
    }
  }
  //提交新增投票
  submitAddVoteForm(){
    this.controlArray.forEach(item => {
      this.addVoteFormData.voteContext.push(item.controlInstance);
    })

    this.http.post('/uc/conferences/'+this.cid+'/vote',this.addVoteFormData).subscribe(
      res => {
        let resultData:any = res;
        if(resultData.code == '200'){
          this._notification.create('success', '新增投票成功','');
          this.isCanAdd=false;
          this.getVoteData();
        }else{
          this._notification.create('error', resultData.msg ,'');
        }
      },err => {
        console.log("新增投票 error...");
    });
  }

  //查看会议进行中的投票
  voteDta:any;
  getVoteData(){
    this.active = 1
    this.http.get('/uc/conferences/'+this.cid+'/vote').subscribe(
      res => {
        let resultData:any = res;
        if(resultData.code == '200'){
          this.voteDta = resultData.data;
        }else{
        }
      },err => {
        console.log("查看投票 error...");
    });
  }

  //取消投票
  cancelVoteFn(voteId:any){
    this.meetingVoteModal = false;
    this.hide_emitter.emit(this.meetingVoteModal);
    this.confirmServ.confirm({
      title: '取消投票',
      content: '是否取消本次投票？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () =>  {
        this.sureCancelVoteFn(voteId);
      },
      onCancel() {

      }
    });
  }
  //确定取消投票
  sureCancelVoteFn(voteId:any){
    this.http.post('/uc/conferences/'+this.cid+'/vote/'+voteId+'/cancel','').subscribe(
      res => {
        let resultData:any = res;
        if(resultData.code == '200'){
          this._notification.create('success', '取消投票成功','');
          this.getVoteData();
        }else{
          this._notification.create('error', '取消投票失败' ,'');
        }
      },err => {
        console.log("取消投票 error...");
    });
  }
  //结束投票 /conferences/{cid}/vote/{voteId}/stop
  stopVoteFn(voteId:any){
    this.meetingVoteModal = false;
    this.hide_emitter.emit(this.meetingVoteModal);
    this.confirmServ.confirm({
      title: '结束投票',
      content: '是否结束本次投票？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () =>  {
        this.sureStopVoteFn(voteId);
      },
      onCancel() {

      }
    });
  }
  //确定结束投票
  sureStopVoteFn(voteId:any){
    this.http.post('/uc/conferences/'+this.cid+'/vote/'+voteId+'/stop','').subscribe(
      res => {
        let resultData:any = res;
        if(resultData.code == '200'){
          this._notification.create('success', '结束投票成功','');
          this.historyVoteFn();
        }else{
          this._notification.create('error', '结束投票失败' ,'');
        }
      },err => {
        console.log("结束投票 error...");
    });
  }


  // 获取历史投票记录
  showDetail:boolean=false;
  historyVoteData:any;
  historyVoteFn(){
    this.active=2;
    this.http.get('/uc/conferences/'+this.cid+'/vote/history').subscribe(
      res => {
        let resultData:any = res;
        if(resultData.code == '200'){
          this.historyVoteData = resultData.data;
        }else{
        }
      },err => {
        console.log("历史投票 error...");
    });
  }

  handCancle(){
    this.meetingVoteModal = false;
    this.hide_emitter.emit(this.meetingVoteModal);
  }


}
