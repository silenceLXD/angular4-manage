import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '@services/common.service';
@Component({
  selector: 'app-conference-management',
  templateUrl: './conference-management.component.html',
  styleUrls: ['./conference-management.component.css']
})
export class ConferenceManagementComponent implements OnInit {
  public loginUserData = this.commonService.getLoginMsg();
  ENTID = this.loginUserData.entId;//loginUserData.entId
  /* 资源 图表数据初始化定义 */
  showloading:boolean = true;//loading加载效果
  public onlineCireOption: any;//会议在线资源
  public numberCireOption: any;//云会议室使用数

  manageData:object;//进行中会议表格数据
  outTimeData:object;//超时会议数据
  // 饼图测试数据
  onlineCireData:any = {
    onlineselectArr:{},
    onlineData:[]
  }
  numberCireData:any = {
    vmrselectArr:{},
    vmrNumData:[]
  }

  constructor(private http: HttpClient, private commonService: CommonService) {
    setTimeout(()=> {
        this.showloading = false;
      }, 1000);
  }

  ngOnInit() {
    this.meetingOnGongSelect();


    /* 云会议室使用数  饼状图 */


  }

  meetingOnGongSelect(){
    this.http.get('/uc/'+this.ENTID+'/conferences/starting').subscribe(
        res => {
          let resultData:any = res;
          this.manageData = resultData.data.manager.list;//进行中会议表格数据
          this.outTimeData = resultData.data.outTime;//超时会议数据


          let resourcesData = resultData.data.resources;
          let vmrStatusData = resultData.data.vmrStatus;
          /* 会议在线资源 数据 */
          let n;
          for(var i in resourcesData){
            if(i == "effective"){
              n = "有效占用";
            }else if(i == "reserved"){
              n = "预留占用";
            }else if(i == "idle"){
              n = "空闲可用"
            }
            let arr = {"value":resourcesData[i],"name":n};
        		if(resourcesData[i] == 0){
    					this.onlineCireData.onlineselectArr[n] = false;
    				}else{
    					this.onlineCireData.onlineselectArr[n] = true;
    				}
            this.onlineCireData.onlineData.push(arr);
          }

          this.onlineCireEchart(this.onlineCireData);//调用会议在线资源

          /* 云会议室使用数 数据 */
          let m;
          for (var i in vmrStatusData){
            if(i == "normal"){
    					m = "正常数";
    				}else if(i == "outTime"){
    					m = "超时数";
    				}else if(i == "aviable"){
    					m="可用数"
    				}
            let arr = {"value":vmrStatusData[i],"name":m};
        		if(vmrStatusData[i] == 0){
        			this.numberCireData.vmrselectArr[m] = false;
    				}else{
    					this.numberCireData.vmrselectArr[m] = true;
    				}
            this.numberCireData.vmrNumData.push(arr);
          }
          this.numberCireEchart(this.numberCireData);// 调用云会议室使用数
        },
        err => {
          console.log(err);
        }
      );
  }
  /*会议在线资源 饼状图*/
  onlineCireEchart(echartData){
    this.onlineCireOption = {
      title : {
	            text: '会议在线资源',
	            x:'center'
        },
        tooltip : {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        color:['#07A2E8','#ff9900','#AEDF7F'],
        legend: {
            orient: 'vertical',
            left: 'left',
            data: ['有效占用','预留占用','空闲可用'],
            selected:echartData.onlineselectArr
        },
        series : [{
              name: '会议在线资源',
              type: 'pie',
              radius : '55%',
              center: ['50%', '60%'],
              data:echartData.onlineData,
              itemStyle: {
                  emphasis: {
                      shadowBlur: 10,
                      shadowOffsetX: 0,
                      shadowColor: 'rgba(0, 0, 0, 0.5)'
                  }
              },
              label:{
              	normal:{
              		position:'inner',
              		formatter:'{c}'
              	}
              }
          }]
    }
  }

  /*虚拟会议室使用数  饼状图*/
  numberCireEchart(echartData){
    this.numberCireOption = {
      title : {
	            text: '云会议室使用数',
	            x:'center'
	        },
	        tooltip : {
	            trigger: 'item',
	            formatter: "{a} <br/>{b} : {c} ({d}%)"
	        },
	        color:['#07A2E8','#AEDF7F','#FF3333'],
	        legend: {
	            orient: 'vertical',
	            left: 'left',
	            data: ['正常数','超时数','可用数'],
	            selected:echartData.vmrselectArr
	        },
	        series : [{
              name: '云会议室使用数',
              type: 'pie',
              radius : '55%',
              center: ['50%', '60%'],
              data:echartData.vmrNumData,
              itemStyle: {
                  emphasis: {
                      shadowBlur: 10,
                      shadowOffsetX: 0,
                      shadowColor: 'rgba(0, 0, 0, 0.5)'
                  }
              },
              label:{
              	normal:{
              		position:'inner',
              		formatter:'{c}'
              	}
              }
          }]
    }
  }







}
