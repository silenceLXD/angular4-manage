import { Component, OnInit, EventEmitter, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { HttpClient } from '@angular/common/http';
import { CommonService } from '@services/common.service';
import { NzNotificationService } from 'ng-zorro-antd';
import { NzModalService } from 'ng-zorro-antd';
// import { EventSource } from 'eventsource';
import * as EventSource from 'eventsource'
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-meeting-control',
  templateUrl: './meeting-control.component.html',
  styleUrls: ['./meeting-control.component.css']
})
export class MeetingControlComponent implements OnInit,OnDestroy {
  private CID : number;//路由传递过来的 cid
  private sub:any;// 传递参数对象
  eventData = new EventEmitter();
  conferenceCid:any;
  conferenceData:any = {//初始化时 会议相关信息 数据
    conferenceName:''
  };
  participantData:any = {//参会者 是否全部静音，在线方数
    muteAll:false,
  };
  attendListData:any;//初始化时 参会者表格 数据
  conferenceRoleData:any = {// 初始化时 会议权限 数据
    isCanLive:false,
    isCanRecord:false,
    isHaveHost:false,
    isTalkingId:'',
    isEnterMute:false
  };

  meetingLongTime:any; //初始化时 会议进行时长
  meetingTimeOut:any = "0分钟"; //初始化 会议超时时长
  isTimeOut:boolean = false;//会议是否超时
  intervalOutTimer:any;//超时定时器
  constructor(
    private http: HttpClient,
    private router: Router,
    private _activatedRoute:ActivatedRoute,
    private commonService: CommonService,
    private confirmServ: NzModalService,
    private _notification: NzNotificationService
  ) {

  }
  ngOnInit() {
    this.sub = this._activatedRoute.params.subscribe(params=>{
      this.CID = params["cid"];
    })
    this.conferenceCid = this.CID;//传给子组件的会议cid
    this.conferenceParticipant();
    this.getOnlineHost();
    this.sseConnect(this.conferenceCid);
  }

  /*初始化页面信息数据*/
  conferenceParticipant(){
    this.http.get('/uc/conferences/starting/'+this.CID).subscribe(
        res => {
          let resultData:any = res;
          if(resultData.code == "200"){

            this.conferenceData = resultData.data.conference;//会议信息
            this._locked = this.conferenceData.isLocked;
            // this.conferenceData.isLocked = resultData.data.conference.isLocked;

			      this.participantData = resultData.data.participant;//(是否全部静音，在线方数)
            this.participantData.muteAll = resultData.data.participant.muteAll;
            this.attendListData = resultData.data.participant.participant;//参会者表格数据

            this.conferenceRoleData.isCanLive = resultData.data.isCanLive;//初始化 判断改企业是否开通服务 购买了直播
            this.conferenceRoleData.isCanRecord = resultData.data.isCanRecord;//初始化 判断改企业是否开通服务 购买了录播
            this.conferenceRoleData.isHaveHost = resultData.data.isHaveHost;//初始化 判断该会议是否有主讲人
            this.conferenceRoleData.isTalkingId = resultData.data.invitationApiUserId;//初始化 获取该被邀请人的apiuserid
            this.conferenceRoleData.isEnterMute = resultData.data.participant.isMute;//初始化 判断当前会议是否勾选了 入会时静音

            this.meetingLongTime = this.commonService.longTime(this.conferenceData.startTime);//会议已进行时长

            //存在会议结束时间（预约会议）
            if(this.conferenceData.endTime){
              this.checkIsTimeOutFn(this.conferenceData.endTime);
            }

          }else{
            this._notification.create('error', '会议信息有误','');
          }
        },
        err => {
          console.log(err);
        });
  }

  intervalTimer = setInterval(() => {
    this.meetingLongTime = this.commonService.longTime(this.conferenceData.startTime);
    this.checkIsTimeOutFn(this.conferenceData.endTime);
  }, 1000);

  //判断是否超时
  checkIsTimeOutFn(endTime:any){
    var getNowtime = new Date().getTime();
    var outTimes = getNowtime - endTime;
    if(outTimes > 0){
      this.isTimeOut = true;
      this.meetingTimeOut = this.commonService.longTime(endTime);  //会议超时时长
    }
    // this.intervalOutTimer = setInterval(() => {
    //   this.meetingTimeOut = this.commonService.longTime(endTime);
    // }, 1000);
  }
/******** 会议日志 *******/
  moreLogData:object;
  isshowlog:boolean=true;
  showMoreLog(){
    this.isshowlog = !this.isshowlog;
    if(!this.isshowlog){
      this.http.get('/uc/conferences/'+this.CID+'/log').subscribe(
          res => {
            let resultData:any = res;
            if(resultData.code == '200'){
              this.moreLogData = resultData.data;
            }
          },
          err => {
            console.log("会议日志 error...");
          }
        );
    }
  }
/*******  添加参会者   ********/
  // addAttendModal:boolean = false;
  // addAttendees(){
  //   this.addAttendModal =true;
  // }
  //添加参会者
  modal_info_add:boolean = false; //添加参会者modal是否显示
  addAttendees() {
    if(this._locked){
      this._notification.create('error', '会议已锁定，解锁后才可添加参会者','');
      return false;
    }else{
      this.modal_info_add = true;
    }
  }

  showRoomListData:any;
  getAttendData(val:any){
    this.showRoomListData=val;
    // console.log('来自添加参会者子组件的值',val);
    let postData={ids:[]};
    val.forEach(item => {
      postData.ids.push(item.userId);
    })
    this.http.post('/uc/conferences/'+this.CID+'/dial-more',postData).subscribe(
        res => {
          let resultData:any = res;
          if(resultData.code == '200'){
            this._notification.create('success', '呼叫成功','');
          }else{
            this._notification.create('error', resultData.msg ,'');
          }
        },
        err => {
          console.log("外呼多个参会者 error...");
      });
  }
  //监听modal状态
  getHideEmitter(val:any){
    this.modal_info_add = val;
  }


/*******  在线状态   ********/
	//根据在线状态 呼叫不同状态的用户
  _dialStatus:any='5';//默认显示在线状态为 未在线
  callByState(){
    if(this._locked){
      this._notification.create('error', '会议已锁定，解锁后才可呼叫参会者','');
      return false;
    }else{
      this.http.post('/uc/conferences/'+this.CID+'/dial/status',{status:parseInt(this._dialStatus)}).subscribe(
          res => {
            let resultData:any = res;
            if(resultData.code == '200'){
              this._notification.create('success', '已呼叫','');
            }
          },
          err => {
            console.log("在线状态 error...");
        });
    }

  }

/*******  屏幕设置   ********/
  splitModeModal:boolean = false;
  splitModeFn(){
    if(this.conferenceRoleData.isTalkingId){
      this._notification.create('error', '邀请对话下，无法使用此功能','');
      return false;
    }
    if(this.onlineHostNum){
      this.splitModeModal = true;
    }else{
      this._notification.create('error', '会议无主讲人','');
      return false;
    }

  }
  submitSplitData:any;
  getSplitData(val){
    this.submitSplitData = val;
    // console.log('来自屏幕设置子组件的值',val);
  }

  //确定分屏设置
  sureSplitFn(){
    let postData:any = this.submitSplitData;
    let rightSelectArr = [];
    let rightSelectObj:any = postData.rightSelectData;
    // rightSelectObj.forEach(idx => postData.rightSelectHide.push(rightSelectObj[idx].puuid));
    for(let i=0;i<rightSelectObj.length;i++){
      let rightUserId = rightSelectObj[i].puuid;
      rightSelectArr.push(rightUserId);
    }
    if(postData.polling && rightSelectArr.length < 1){
      // return true;
      this._notification.create('error', '轮询已打开','但未选择参与轮询人员');
      return false;
    }
    // 处理提交的数据格式
    postData.rightSelectHide = rightSelectArr;
    // console.log('submitSplitData',postData);
    this.http.post('/uc/conferences/'+this.CID+'/layOut',postData).subscribe(
      res => {
        let resultData:any = res;
        if(resultData.code == '200'){
          this._notification.create('success', '屏幕设置成功','');
          this.conferenceRoleData.isTalkingId='';
          // this.splitModeModal=false;
        }else{
          this._notification.create('error', resultData.msg,'');
        }
      },
      err => {
        console.log("确定分屏设置 error...");
    });
  }


/*******  参会者静音   ********/
  _muteAll:boolean;//从数据源获取  静音-true；取消静音-false
  voiceBtnFn(){
    this._muteAll = this.participantData.muteAll;//从数据源获取  静音-true；取消静音-false
    this.http.post('/uc/conferences/'+this.CID+'/mute-all',{'mute':!this._muteAll}).subscribe(
        res => {
          let resultData:any = res;
          if(resultData.code == '200'){
            this._muteAll=!this._muteAll;
            this.participantData.muteAll = !this.participantData.muteAll;
            this._notification.create('success', !this._muteAll?'解除成功':'静音成功','');
          }else{
            this._notification.create('error', '操作失败','');
          }
        },
        err => {
          console.log("参会者静音 error...");
        });
  }

/*******  开启／关闭直播   ********/
  livePwdModal:boolean = false;
  openliveData:any = { //保存返回的直播信息
    openliveAddress:'',
    openlivePwd:''
  }
  liveBtnFn(){
    let liveurl;
    if(this.conferenceData.isLive){
			//关闭直播
			liveurl='/close-live';
		}else{
			//开启直播
			liveurl='/open-live';
      this.livePwdModal = true;
		}
    this.http.post('/uc/conferences/'+this.CID+liveurl,'').subscribe(
        res => {
          let resultData:any = res;
          if(resultData.code == '200'){
            this.conferenceData.isLive = !this.conferenceData.isLive;
            // this.openliveData.openliveAddress = resultData.data.liveAddress;
            this.openliveData.openliveAddress = this.commonService.getPath()+"#/watch-live/"+this.conferenceData.appointId
            this.openliveData.openlivePwd = resultData.data.livePwd;
            this._notification.create('success', this.conferenceData.isLive?'已开启直播':'已关闭直播','');
          }else{
            this._notification.create('error', '操作失败','');
          }
        },err => {
          console.log("开启／关闭直播 error...");
      });
  }

  //修改直播密码
  updateLiveAddress(pwd:any){
    this.http.post('/uc/lives/'+this.CID+'/update-pwd',{'livePwd':pwd}).subscribe(
      res => {
        let resultData:any = res;
        if(resultData.code == '200'){
          this.livePwdModal = false;
        }else{
          this._notification.create('error', '操作失败','');
        }
      },err => {
        console.log("开启／关闭直播 error...");
    });
  }
  //查看直播密码
  copyLivePwdModal:boolean = false;
  liveInfoData:any = {
    srcContent:'',
    srclivePwd:''
  }
  liveContent:any;
  selectLiveAddress(){
    this.copyLivePwdModal = true;
    this.http.get('/uc/lives/'+this.CID+'/info').subscribe(
      res => {
        let resultData:any = res;
        if(resultData.code == '200'){
          this.liveInfoData.srcContent = this.commonService.getPath()+"#/watch-live/"+this.conferenceData.appointId;
          this.liveInfoData.srclivePwd = resultData.data.livePwd;

          this.liveContent="直播链接:" + this.liveInfoData.srcContent + "; \n " +
         	   							  "密码:" + resultData.data.livePwd;
        }else{
          this._notification.create('error', '操作失败','');
        }
      },err => {
        console.log("查看直播密码 error...");
    });
  }
  toClipboardLive(){
    this.copyLivePwdModal = false;
    this._notification.create('success', '复制成功','');
  }
/******** 开启／关闭录制 ***********/
  recordBtnFn(){
    let recordurl;
    if(this.conferenceData.isRecord){
			//关闭录制
			recordurl='/close-record';
		}else{
			//开启录制
			recordurl='/open-record';
		}
    this.http.post('/uc/conferences/'+this.CID+recordurl,'').subscribe(
        res => {
          let resultData:any = res;
          if(resultData.code == '200'){
            this.conferenceData.isRecord = !this.conferenceData.isRecord;

            this._notification.create('success', this.conferenceData.isRecord?'开启录制中...':'停止录制','');
          }else{
            this._notification.create('error', '操作失败','');
          }
        },err => {
          console.log("开启/关闭录制 error...");
      });
  }

/******** 锁定／解锁会议 ***********/
  _locked:boolean;//从数据源获取 锁定：true；解锁：false
  lockBtnFn(){
    let postData = {'isLock':!this._locked};
    this.http.post('/uc/conferences/'+this.CID+'/lock',postData).subscribe(
        res => {
          let resultData:any = res;
          if(resultData.code == '200'){
            this._locked=!this._locked;
            this.conferenceData.isLocked = !this.conferenceData.isLocked;

            this._notification.create('success', this._locked?'会议已锁定':'会议已解锁','');

          }else{
            this._notification.create('error', '操作失败','');
          }
        },
        err => {
          console.log("锁定／解锁会议 error...");
        });
  }

/******** 结束会议 ***********/
  alertModal:boolean = false;
  _isEndingLoading:boolean = false;
  stopConferenceFn() {
      this.confirmServ.confirm({
        title: '结束会议',
        content: '会议关闭之后，参会人员将被强制退出会议，是否确认结束关闭会议？',
        okText: '确定',
        // cancelText: '取消',
        onOk: async () =>  {
          await this.sureStopConferenceFn();
        },
        onCancel() {
        }
      });
  }
  //手动结束会议
  sureStopConferenceFn(){
    this.http.post('/uc/conferences/'+this.CID+'/stop','').subscribe(
      res => {
        let resultData:any = res;
        if(resultData.code == '200'){
          this._isEndingLoading = true;
        }else{
          this._notification.create('error', '操作失败','');
        }
      },err => {
        console.log("结束会议 error...");
    });
  }
  /**********************--------------------- 分割线 ----------------------**********************/


  /*************** 参会者 表格操作 **************/

  /**** 参会者 表头操作 start ****/
  theadStatus:any = {
    statusTxt:'在线状态',
    isMutedTxt:'语音开/关',
    roleTxt:'主讲人/参会者',
    isCallTxt:'呼叫/挂断',
  }

  searchKeyWord:any;
  searchId:any;
  searchByName(key:any,value:any){
    this.searchId = key;
    this.searchKeyWord = value;
  }
  //按角色筛选
  orderByRole(key:any,value:any,txt:any){
    this.searchId = key;
    this.searchKeyWord = value;
    this.theadStatus.roleTxt = txt;
  }
  //按在线状态筛选
  orderByStatus(key:any,value:any,txt:any){
    this.theadStatus.statusTxt = txt;
    this.searchId = key;
    this.searchKeyWord = value;
  }

  //按语音开/关筛选
  orderByisMuted(key:any,value:any,txt:any){
    this.theadStatus.isMutedTxt = txt;
    this.searchId = key;
    this.searchKeyWord = value;
  }

  //按呼叫/挂断筛选
  orderByisCall(key:any,value:any,txt:any){
    this.theadStatus.isCallTxt = txt;
    this.searchId = key;
    this.searchKeyWord = value;
  }
  /**** 参会者 表头操作 end ****/

  /* 切换主讲人/参会者身份 */
  changeHostFn(data:any,flag:any){
    let puuid=data.puuid;
    if(flag==1){//切换为主讲人
      data.role = 4001;
    }else{//切换为参会者
      data.role = 4002;
    }
    let postData = {'hostrole':data.role}; // 身份类型：host 4001,visitor 4002
    this.http.post('/uc/conferences/'+this.CID+'/convert/'+puuid,postData).subscribe(
      res => {
        let resultData:any = res;
        if(resultData.code == '200'){
          this._notification.create('success', '操作成功','');
        }else{
          this._notification.create('error', '操作失败','');
        }
      },err => {
        console.log("切换主讲人/参会者身份 error...");
    });
  }

  /* 切换语音开/关 */
  changeMuteFn(data:any,flag:any){
    let puuid=data.puuid;
    if(flag == 0){//关闭参会者语音
      data.isMuted=true;
    }else{//打开参会者语音
      data.isMuted=false;
    }
    let postData = {'mute':data.isMuted}; //静音-true；解除静音-false
    this.http.post('/uc/conferences/'+this.CID+'/mute/'+puuid,postData).subscribe(
      res => {
        let resultData:any = res;
        if(resultData.code == '200'){
          this._notification.create('success', '操作成功','');
        }else{
          this._notification.create('error', '操作失败','');
        }
      },err => {
        console.log("切换语音开/关 error...");
    });
  }
  /* 切换挂断/呼叫 */
  changeCallFn(data:any,flag:any){
    let puuid;
    let callUrl;


    if(flag == 1){//呼叫参会者
      if(this._locked){
        this._notification.create('error', '会议已锁定，解锁后才可呼叫参会者','');
        return false;
      }else{
        callUrl = '/dial';
        puuid = data.userId;
      }
    }else{//挂断参会者
      callUrl = '/disconnect';
      puuid = data.puuid;
    }
    this.http.post('/uc/conferences/'+this.CID+callUrl+'/'+puuid,'').subscribe(
      res => {
        let resultData:any = res;
        if(resultData.code == '200'){
          this._notification.create('success', '操作成功','');
        }else{
          this._notification.create('error', '操作失败','');
        }
      },err => {
        console.log("切换挂断/呼叫 error...");
    });
  }


  /* 切换是否邀请对话 */
  // '/conferences/{cid}/invitation-dialogue/{userId}'邀请对话
  //'/conferences/{cid}/cancel-invitation'解除邀请对话
  changeDialogue(data:any){
    let thisPuuid = data.puuid;
    let postUrl;
    if(this.conferenceRoleData.isTalkingId == thisPuuid){//取消
      postUrl = '/uc/conferences/'+this.CID+'/cancel-invitation';
      this.conferenceRoleData.isTalkingId='';
    }else{
      if(this.onlineHostNum){
        postUrl = '/uc/conferences/'+this.CID+'/invitation-dialogue/'+thisPuuid;
        this.conferenceRoleData.isTalkingId = thisPuuid;
      }else{
        this._notification.create('error', '会议无主讲人','');
      }

    }
    this.http.post(postUrl,'').subscribe(
      res => {
        let resultData:any = res;
        if(resultData.code == '200'){
          this._notification.create('success', '操作成功','');
        }else{
          this._notification.create('error', resultData.msg,'');
        }
      },err => {
        console.log("邀请对话 error...");
    });
  }


  /* 处理举手 */
  handsUpFn(data:any){
    let thisPuuid = data.puuid;
    this.http.post('/uc/conferences/'+this.CID+'/un-hand-up/'+thisPuuid,'').subscribe(
      res => {
        let resultData:any = res;
        if(resultData.code == '200'){
          this._notification.create('success', '操作成功','');
          this.SSE_PARTICIPANTDto(data);
        }else{
          this._notification.create('error', '操作失败','');
        }
      },err => {
        console.log("处理举手 error...");
    });
  }

  /* 允许/拒绝等待申请入会 */
  handleWaitFn(data:any,type:any){
    let thisPuuid = data.puuid;
    let postData = {'isAllowed':type};//isAllowed 允许-true；拒绝-false
    this.http.post('/uc/conferences/'+this.CID+'/handle-wairing/'+thisPuuid,postData).subscribe(
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
  /**********************--------------------- 分割线 ----------------------**********************/
  /* 入会时是否静音 */
  changeEnterMuteFn($event){
    let isChecked = $event.target.checked;
    let postData = {"isEnterMute":isChecked};
    this.http.post('/uc/conferences/'+this.CID+'/mute-in-conference',postData).subscribe(
      res => {
        let resultData:any = res;
        if(resultData.code == '200'){
          this._notification.create('success', '操作成功','');
        }else{
          this._notification.create('error', '操作失败','');
        }
      },err => {
        console.log("入会时是否静音 error...");
    });
  }
  /* 入会申请 */
  meetingRequestModal:boolean=false;
  handleApplyData:any=[];
  getRequestData(val:any){  // 监听子组件传过来的数据
    // console.log(val)
    this.handleApplyData = val;
  }
  handleApplyFn(type:boolean){
    // isAllowed 允许-true,拒绝-false;  userIds 用户id数组
    let postData = {"isAllowed":type,"userIds":[]};
    this.handleApplyData.forEach(item => {
      postData.userIds.push(item.userId);
    })
    this.http.post('/uc/conferences/'+this.CID+'/handle-apply',postData).subscribe(
      res => {
        let resultData:any = res;
        if(resultData.code == '200'){
          this._notification.create('success', '操作成功','');
          this.meetingRequestModal=false;
        }else{
          this._notification.create('error', '操作失败','');
        }
      },err => {
        console.log("入会申请 error...");
    });
  }

  /* 投票 */
  modal_info_vote:boolean = false;
  vote_status:boolean = false;//当前投票状态
  // meetingVoteModal:boolean = false;
  getVoteData(val:any){// 监听子组件传过来的数据
    // alert(val)
  }
  getHideVoteModel(val:any){
    this.modal_info_vote = val;
  }

  /* 查询在线主讲人数 */
  onlineHostNum:boolean = false;
  getOnlineHost(){
    this.http.get('/uc/conferences/'+this.CID+'/online-host').subscribe(
      res => {
        let resultData:any = res;
        if(resultData.code == '200'){
          if(resultData.data == 1){
            this.onlineHostNum = true;//存在一个主讲人 true
          }else{
            this.onlineHostNum = false;
          }
        }
      },err => {
        console.log("查询在线主讲人数 error...");
    });
  }

  /* 声音提示 */
  isopenAudio:boolean = false;
  audioTitle:any = '打开声音提示';
  openAudioFn(){
    this.isopenAudio = !this.isopenAudio;
    this.audioTitle = this.isopenAudio ? '关闭声音提示' : '打开声音提示';
  }

/**********************--------------------- 分割线  SSE 消息推送----------------------**********************/
  // private sources = new EventSource<any>();
  access_token=localStorage.getItem('uc_access_token');
  source:any;
  sseConnect(cid:any){
    // EventSource实例 建立sse连接 cid:会议id
    this.source = new EventSource(environment.apiBase+'/uc/sse/longConnect/'+cid+'?access_token='+this.access_token);
    // var source = this.sources(environment.apiBase+'/uc/sse/longConnect/'+cid)
    // 监听sse连接
    this.source.addEventListener("open", function(event) {
      console.log("sse 连接成功");
    }, false);
    // 监听sse消息
    this.source.addEventListener("message", (e) => {
        let data = JSON.parse(e.data);
        console.log(`sseType ${data.type}：`,data);
        this.appendSSEData(data);
        // async () =>  {
        //   await this.appendSSEData(data);
        // }
    }, false);
    // 监听sse错误
    this.source.addEventListener("error", function(e) {
      this.source.close();//关闭 SSE 连接
      console.log("sse 断开连接");
    }, false);
  }


  /* 处理返回的sse消息
  * type = 0 PARTICIPANT 参会者改变 (type,ParticipantDto,isMute,online,invitePuuid)
  * type = 1 ONLINESUM 会议在线人数   (type,online)
  * type = 2 ISMUTE 是否全部静音   (type,isMute)
  * type = 3 END 结束会议   (type,online)
  * type = 4 LOG 会控操作日志 (type,content)
  * type = 6 CREATE 新增参会者 (type,ParticipantDto,isMute,online)
  * type = 7 RECORD_ERROR 录制失败 (type,isMute,online)
  * type = 8 RECORD_SUCCESS 录制成功 (type,isMute,online)
  * type = 9 PARTICIPANT_LEFT 参会者离开 (type,ParticipantDto,content,isMute,online)
  * type = 10 VOICE_UPDATE 语音切换 (type,ParticipantDto,isMute,online)
  * type = 11 HANDS_UP 举手 (type,ParticipantDto)
  * type = 12 APPLYCONFERENCE 申请入会 (type)
  * type = 13 WAITCONFERENCE 等待入会 (type,ParticipantDto)
  * type = 14 LEFT_WAIT_CONFERENCE 离开等待入会 (type,ParticipantDto)
  * type = 15 VOTE_STOP 投票结束 (type)
  */
  // 操作日志
  SSE_LOG(data:any){
    let returnData:any={time:'',content:''};
    let datatime = data.context.split("**");
		returnData.time = datatime[0];
		returnData.content = datatime[1];
    return returnData;
  }
  // 是否全部静音
  SSE_ISMUTE(data:any){
    return data.isMuteAll
  }
  // 在线总人数
  SSE_ONLINESUM(data:any){
    return data.online
  }
  // 被邀请对话者等puuid
  SSE_INVITEPUUID(data:any){
    return data.invitePuuid
  }
  // 结束会议
  SSE_ENDMEETING(data:any){
    this.confirmServ.success({
      title: '结束会议',
      content: '此会议已结束',
      okText: '确定',
      onOk: async () =>  {
        this._isEndingLoading = false;
        await this.router.navigateByUrl("/page/conference-management");
      },
    });
  }
  //获取参会者列表（排序）/conferences/{cid}/participants/sort
  SSE_PARTICIPANTDto(data:any){
    // let thisPuuid = data.participantDto.puuid;
    // let olddata = this.attendListData.find((e) => {return e.puuid == thisPuuid });
    this.getOnlineHost();//查询主讲人人数
    this.http.get('/uc/conferences/'+this.CID+'/participants/sort').subscribe(
      res => {
        let resultData:any = res;
        this.attendListData = resultData.data;
      },err => {
        console.log("获取参会者列表（排序） error...");
    });
  }
  //会控上线／下线／断会提示音
  audioHtml:any;
  SSE_AUDIO(type:any){
    if(this.isopenAudio){
      if(type == 3){ //结束会议
        this.audioHtml = '<audio autoplay><source src="/assets/img/mp3/break.mp3" type="audio/mpeg"></audio>'
      }else if(type == 9){ //参会者离开
        this.audioHtml = '<audio autoplay><source src="/assets/img/mp3/offline.mp3" type="audio/mpeg"></audio>'
      }else if(type == 6){ //新增参会者
        this.audioHtml = '<audio autoplay><source src="/assets/img/mp3/online.mp3" type="audio/mpeg"></audio>'
      }
    }else{
      this.audioHtml = ''
    }
  }

  //投票结束
  SSE_VOTESTOP(data:any){
    this.vote_status = data.voteStop;
    this.commonService.voteStatus.emit(this.vote_status);
  }

  SSE_LogView:any={time:'',content:''};//会控操作日志
  appendSSEData(data:any){
    switch (data.type){
      case 0:
        this.participantData.muteAll = this.SSE_ISMUTE(data);
        this.conferenceData.actualOnLine = this.SSE_ONLINESUM(data);
        this.conferenceRoleData.isTalkingId = this.SSE_INVITEPUUID(data);
        this.SSE_PARTICIPANTDto(data);
        break;
      case 1:
        this.conferenceData.actualOnLine = this.SSE_ONLINESUM(data)
        break;
      case 2:
        this.participantData.muteAll = this.SSE_ISMUTE(data);
        break;
      case 3:
        this.conferenceData.actualOnLine = this.SSE_ONLINESUM(data);
        this.SSE_ENDMEETING(data);
        this.SSE_AUDIO(3);
        break;
      case 4:
        this.SSE_LogView = this.SSE_LOG(data);
        break;
      case 6:
        this.participantData.muteAll = this.SSE_ISMUTE(data);
        this.conferenceData.actualOnLine = this.SSE_ONLINESUM(data);
        this.SSE_PARTICIPANTDto(data);
        this.SSE_AUDIO(6);
        break;
      case 7:
        this.participantData.muteAll = this.SSE_ISMUTE(data);
        this.conferenceData.actualOnLine = this.SSE_ONLINESUM(data)
        break;
      case 8:
        this.participantData.muteAll = this.SSE_ISMUTE(data);
        this.conferenceData.actualOnLine = this.SSE_ONLINESUM(data)
        break;
      case 9:
        this.participantData.muteAll = this.SSE_ISMUTE(data);
        this.conferenceData.actualOnLine = this.SSE_ONLINESUM(data)
        this.SSE_PARTICIPANTDto(data);
        this.SSE_AUDIO(9);
        break;
      case 10:
        this.participantData.muteAll = this.SSE_ISMUTE(data);
        this.conferenceData.actualOnLine = this.SSE_ONLINESUM(data);
        this.SSE_PARTICIPANTDto(data);
        break;
      case 11:
        this.SSE_PARTICIPANTDto(data);
        break;
      case 12:
        break;
      case 13:
        this.SSE_PARTICIPANTDto(data);
        break;
      case 14:
        this.SSE_PARTICIPANTDto(data);
        break;
      case 15:
        this.SSE_VOTESTOP(data);
        break;
    }
  }

  // 销毁组件时清除定时器
  ngOnDestroy() {
    // this.sseConnect(this.conferenceCid);
    this.source.close();//关闭 SSE 连接
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
    }
    if(this.intervalOutTimer){
      clearInterval(this.intervalOutTimer);
    }
  }
}
