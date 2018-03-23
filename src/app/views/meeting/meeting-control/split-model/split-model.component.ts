import { Component, OnInit, EventEmitter, ElementRef, Input, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@services/auth.service';
import { NzNotificationService } from 'ng-zorro-antd';
@Component({
  selector: 'split-model',
  templateUrl: './split-model.component.html',
  styleUrls: ['./split-model.component.css']
})
export class SplitModelComponent implements OnInit {
  @Output() outPutSplitData:EventEmitter<any> = new EventEmitter();//子传父
  @Input() inputParentData:any;//父传子  获取来自父组件的数据

  // 存放屏幕设置获取的数据
  splitModeData:any = {
    splitMode:5, //设置分屏模式
    mode_show:'2', //设置轮询屏
    selectAttendeData:[],//用于分屏模式里面指定人(去除不在线后的参会者)
    leftSelectData:[],//
    rightSelectData:[]
  }
  splitModeSubmitData:any = {
    splitMode:5, //设置分屏模式
    mode_show:'2', //设置轮询屏
    pollingtime:'15', //轮询时间
    splitArrHide:[],  //左边分屏选择的人员列表
    rightSelectHide:[], //右边轮询的人
    polling:false,  //是否轮询
    isFirst:false,  //是否第一次设置
    isSame:false,

    selectAttendeData:[],//用于分屏模式里面指定人(去除不在线后的参会者)
    leftSelectData:[],//
    rightSelectData:[]
  }
  selectModel:any = [];
  constructor(
    private el:ElementRef,
    private http: HttpClient,
    private authService: AuthService,
    private _notification: NzNotificationService
  ) { }

  ngOnInit() {
    this.getSplitScreen();

    // for (let i = 0; i < 20; i++) {
    //   this.splitModeSubmitData.leftSelectData.push({
    //     key: i.toString(),
    //     title: `content${i + 1}`,
    //     disabled: i % 3 < 1,
    //     displayName:`name${i + 1}`
    //   });
    // }

    // [ 2, 3 ].forEach(idx => this.splitModeSubmitData.leftSelectData[idx].direction = 'right');
  }

  /********* 获取分屏信息及轮询的人 *********/
  getSplitScreen(){
    this.http.get('/uc/conferences/'+this.inputParentData+'/split-screen').subscribe(
        res => {
          let resultData:any = res;
          if(resultData.code == '200'){
            // this.splitModeSubmitData = resultData.data;
            this.outPutSplitData.emit(this.splitModeSubmitData);

            //第一次设置分屏 初始化轮询信息
            if(resultData.data.isFirst){
              this.splitModeSubmitData.splitMode = 5; //设置分屏模式 默认自动分屏
              this.splitModeSubmitData.selectAttendeData = resultData.data.onLineList;//分屏模式里的在线人员
              this.splitModeSubmitData.leftSelectData = resultData.data.onLineList;//不参与轮询的人
            }else{ //已设置过分屏

              this.selectModel = resultData.data.splitArrHide;
              this.splitModeSubmitData.mode_show = resultData.data.mode_show;//设置分屏模式
              this.splitModeSubmitData.splitMode = resultData.data.splitMode;//设置轮询屏
              this.splitWay(resultData.data.splitMode);
              this.splitModeSubmitData.polling = resultData.data.polling;//是否轮询
              this.splitModeSubmitData.pollingtime = this.pollingtime = resultData.data.pollingtime;//轮询间隔时间
              this.splitModeSubmitData.selectAttendeData = resultData.data.onLineList;//分屏模式里的在线人员

              this.splitModeSubmitData.leftSelectData = resultData.data.onLineList;//回显不参与轮询的人 字符串转数组
              // this.splitModeSubmitData.rightSelectData = resultData.data.rightSelectData;//回显参与轮询的人 字符串转数组
              // this.pollingtime = resultData.data.pollingtime;//轮询间隔时间
              //轮询列表回显
              var left = resultData.data.onLineList;
              var rightPuuid = resultData.data.rightSelectHide;
              //判断是否存在
              let intersectionSet = left.filter(function(v){ return rightPuuid.indexOf(v.puuid) > -1 });

              intersectionSet.forEach(item => {
                item.direction = 'right';
                this.splitModeSubmitData.rightSelectData.push(item);
              })
            }
          }else{
            this._notification.create('error', '操作失败','');
          }
        },
        err => {
          console.log(" error...");
        });
  }
  // 设置相同分屏
  // isSame:boolean = false;
  setSameSplit(state:any){
    this.splitModeSubmitData.isSame = state;
  }
  /****** 分屏方式 设置 *******/
  splitBox1:any;
  splitBox2:any;
  splitBox3:any;
  modeSelectArr:any;
  isAutoSplit:boolean=true; //是否自动分屏
  isPolling:any;  //是否轮询
  splitWayFn(way:any){
    this.splitModeSubmitData.splitMode = way;
    this.splitWay(way+"");

  }

  splitWay(way:any){
		this.splitBox1=this.splitBox2=this.splitBox3=[];
    this.splitModeSubmitData.splitArrHide = [];
    // this.selectModel = [];
    // if(this.splitModeSubmitData.splitMode != way){
    //   this.selectModel = [];
    // }
    if(this.splitModeSubmitData.polling && way==0){
      this.changeModeShow(1);
    }else{
      // this.splitModeSubmitData.mode_show = 2;
    }
    switch (way) {
        case "0"://分屏方式 一分屏
    			this.splitBox1=[1];
          this.selectModel = [];
    			//轮询屏
    			this.modeSelectArr=[1];
          for(let i=0;i<1;i++){
            this.splitModeSubmitData.splitArrHide.push("")
            this.selectModel.push("");
          }
          this.isAutoSplit = false;
        break;
        case "1"://分屏方式 1+7
          this.splitBox1=[1];
          this.splitBox3=[2,3,4,5,6,7,8];
          this.selectModel = [];
          //轮询屏
          this.modeSelectArr=[1,2,3,4,5,6,7,8];
          for(let i=0;i<8;i++){
            this.splitModeSubmitData.splitArrHide.push("");
            this.selectModel.push("");
          }
          this.isAutoSplit = false;
        break;
        case "2"://分屏方式 1+21
    			this.splitBox1=[1];
    			this.splitBox3=[2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22];
          this.selectModel = [];
    			//轮询屏
    			this.modeSelectArr=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22];
          for(let i=0;i<22;i++){
            this.splitModeSubmitData.splitArrHide.push("");
            this.selectModel.push("");
          }
          this.isAutoSplit = false;
        break;
        case "3"://分屏方式 四分屏
    			this.splitBox2=[1,2,3,4];
    			//轮询屏
    			this.modeSelectArr=[1,2,3,4];
          this.selectModel = [];
          for(let i=0;i<4;i++){
            this.splitModeSubmitData.splitArrHide.push("");
            this.selectModel.push("");
          }
          this.isAutoSplit = false;
        break;
        case "4"://分屏方式 2+21
          this.splitBox2=[1,2];
          this.splitBox3=[3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
          this.selectModel = [];
          //轮询屏
          this.modeSelectArr=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
          for(let i=0;i<23;i++){
            this.splitModeSubmitData.splitArrHide.push("");
            this.selectModel.push("");
          }
          this.isAutoSplit = false;
        break;
        case "5": //分屏方式 自动分屏
          this.isAutoSplit = true;
          this.isPolling = 0;
          this.splitModeSubmitData.polling = false;
        break;
        // default:

    }
    console.log(this.selectModel);

	}


  changePolling(){
    if(this.splitModeSubmitData.polling){
      if(this.splitModeSubmitData.mode_show == 0){
          this.changeModeShow(1);
      }else{
        this.changeModeShow(this.splitModeSubmitData.mode_show);
      }
    }
  }

  /*轮询屏幕*/
  changeModeShow(modeShow:any){
    this.splitModeSubmitData.mode_show = modeShow;
    let Modeindex = parseInt(modeShow)-1;
    this.splitModeSubmitData.splitArrHide[Modeindex] = "";
    if(modeShow!="undefind"){
      let idkey = "select_"+modeShow
      // document.getElementById(idkey).value = "";
      this.el.nativeElement.querySelector('#'+idkey).value = "";
    }
  }


  /**** 指定屏幕参会者 ****/
  // splitModeSubmitData.splitArrHide:any = [];
  changeUser($event,n){
    let selectIndex = n-1;
    let selectPuuid = $event.target.value;
    if(this.isInArray(selectPuuid)){
      this._notification.create('error', '不能重复选择指定人员','');
      $event.target.value="";
    }else{
      this.splitModeSubmitData.splitArrHide[selectIndex] = selectPuuid;
    }
    // if(this.splitModeSubmitData.polling && parseInt(this.splitModeSubmitData.mode_show) == n){
    //   $event.target.value=""
    // }
    console.log(this.splitModeSubmitData.splitArrHide);
  }
  /**
 * 使用循环的方式判断一个元素是否存在于一个数组中
 *  {Object} arr 数组
 *  {Object} value 元素值
 */
 isInArray(value){
   if(value){
     for(let i = 0; i < this.splitModeSubmitData.splitArrHide.length; i++){
         if(value === this.splitModeSubmitData.splitArrHide[i]){
             return true;
         }
     }
       return false;
   }
   return false;

}
  /***** 轮询列表操作 ******/
  // list: any[] = [];
  pollingtime:any = 15; //轮询间隔时间
  leftSelectData:any = [];//用于渲染dom  左侧不参与轮询的人
  rightSelectData:any = [];//用于渲染dom 右侧参与轮询的人
  select(ret: any) {
    console.log('nzSelectChange', ret);
  }
  change(ret: any) {
    console.log('nzChange', ret);
    let list:any = ret.list;
    for(let i=0;i<list.length;i++){
      if(ret.from == 'left'){
        this.splitModeSubmitData.rightSelectData.push(list[i]);
      }else{
        this.splitModeSubmitData.rightSelectData.splice(this.splitModeSubmitData.rightSelectData.indexOf(list[i]),1);
      }

    }

  }
}
