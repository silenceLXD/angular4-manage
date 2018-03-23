import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '@services/common.service';
import { NzModalService } from 'ng-zorro-antd';
import { NzNotificationService } from 'ng-zorro-antd';

@Component({
	selector: 'app-consumption-all',
	templateUrl: './consumption-all.component.html',
	styleUrls: ['./consumption-all.component.css']
})
export class ConsumptionAllComponent implements OnInit {
	nowtime: number = 3660000;//测试

	sixMonthArr: any = '';  //获取当前日期前六个月的时间
	/* 本月企业所消耗费用 */
	ConsumptionCosts: any = {
		amount: '', //本月消费
		liveAmount: '', //直播费
		monthlyAmount: '', //月租费
		conferenceAmount: '', //会议费
		recordAmount: '',  //点播费
	}
	/* 本月企业会议直播点播概览  START */
	// 会议
	conferenceMap: any = {
		conferenceNumber: '', //会议数
		consumeTime: ''     //消耗分钟数
	}
	// 直播
	liveMap: any = {
		liveNumber: '',   //直播个数
		watchPerson: '',  //观看人次
		liveConsumingTraffic: '' //直播消耗流量
	}
	// 点播
	fileMap: any = {
		count: '', // 点播人次
		traffic: '' //点播流量
	}
	/* 本月企业会议直播点播概览   END */

	/* 资源 图表数据初始化定义 */
	showloading: boolean = true;//loading加载效果
	public meetingRadarOption: any;//会议分布
	public numbersBarOption: any;//预约会议次数TOP5
	public minutesBarOption: any;//总消耗分钟数TOP5
	public minutesLineOption: any;//本月消耗分钟数情况（日）
	public meetingListOption: any; //本月消耗分钟数
	public meetingLiveOption: any; //本月消耗直播流量

	public loginUserData = this.commonService.getLoginMsg();
	entId: any = this.loginUserData.entId;
	userId: any = this.loginUserData.userId;
	constructor(private http: HttpClient, private commonService: CommonService, private confirmServ: NzModalService, private _notification: NzNotificationService) {
		setTimeout(() => {
			this.showloading = false;
		}, 1000);
	}
	//会议分布 数据
	meetingRadarData: any = {
		// indicatorArr: [{ value: [1, 2, 3, 1, 1, 5, 1, 3, 3, 5, 4, 9], name: '时间：场数' }],
		// meetingdata: [{ "text": 24, "max": 10 }, { "text": 22, "max": 10 }, { "text": 20, "max": 10 }, { "text": 18, "max": 10 }, { "text": 16, "max": 10 }, { "text": 14, "max": 10 },
		// { "text": 12, "max": 10 }, { "text": 10, "max": 10 }, { "text": 8, "max": 10 }, { "text": 6, "max": 10 }, { "text": 4, "max": 10 },
		// { "text": 2, "max": 10 }]
		xAxisdata: [],
		minutesdata: []
	}
	// 本月消耗分钟数数据
	drawMinutesListData: any = {
		xAxisdata: [],
		minutesdata: []
	}
	// 本月消耗直播流量数据
	drawMinuteLiveData: any = {
		xAxisdata: [],
		minutesdata: []
	}

	//预约会议次数TOP5 数据
	numbersBarData: any = {
		yAxisdata: [],
		seriesdata: []
	}
	// 总消耗分钟数TOP5 数据
	minutesBarData: any = {
		yAxisdata: [],
		seriesdata: []
	}

	//本月消耗情况 数据
	// minutesLineData: any = {
	// 	minuName: ['消耗分钟数', '直播流量', '点播流量'],
	// 	minutesConsume: [],
	// 	minutesDay: [],
	// 	minutesFile: [],
	// 	minutesLive: []
	// }

	ngOnInit() {
		this.drawMeetingRadar(this.meetingRadarData);
		this.drawMinutesList(this.drawMinutesListData); //本月消耗分钟数
		this.drawMinuteLive(this.drawMinuteLiveData); //本月消耗直播流量

		this.drawPartBar(this.numbersBarData);
		this.minutesBar(this.minutesBarData);
		// this.drawMinutesLine(this.minutesLineData);
		this.getSixMonth();  //获取当前日期为前六个月的时间
		this.getAllList();
	}
	getAllList() {
		this.getSelectEntBillByMonth(); //查询本月企业所消耗费用
		this.getSelectEntBillOverview(); //查看本月企业会议直播点播概览
		this.getMeetingCount(); //查询企业部门开会次数 Top5
		this.getMeetingTime()  //查询会议总消耗分钟数 Top5
		this.getMeetingDistributed(); //查询本月会议分布
		this.getConsumeMinutes() // 本月消耗
	}
	/* 获取当前日期为前六个月的时间 */
	monthSt: any = ''; //当前选择月份
	getSixMonth() {
		let date = new Date();
		this.sixMonthArr = this.commonService.addMonthFn(date, 6);
		this.monthSt = this.sixMonthArr[0].date;
	}
	/* 下拉选择日期 */
	SelectMonthFn(item) {
		this.meetingRadarData.xAxisdata = [];
		this.meetingRadarData.minutesdata = [];
		this.numbersBarData.yAxisdata = [];
		this.numbersBarData.seriesdata = [];
		this.minutesBarData.yAxisdata = [];
		this.minutesBarData.seriesdata = [];
		// this.minutesLineData.minutesDay = [];
		// this.minutesLineData.minutesConsume = [];
		// this.minutesLineData.minutesLive = [];
		// this.minutesLineData.minutesFile = [];
		this.monthSt = item;
		this.getAllList();
	}
	/* 查询本月企业所消耗费用 */
	getSelectEntBillByMonth() {
		this.http.get('/uc/ents/' + this.entId + '/' + this.monthSt + '/selectEntBillByMonth').subscribe(
			res => {
				// console.log(res);
				let datalist: any = res;
				if (datalist.code == 200) {
					this.ConsumptionCosts = datalist.data;
				}
			},
			err => {
				console.log(err);
			}
		);
	}
	/* 查看本月企业会议直播点播概览 */
	getSelectEntBillOverview() {
		this.http.get('/uc/ents/' + this.entId + '/' + this.monthSt + '/selectEntBillOverview').subscribe(
			res => {
				// console.log(res);
				let datalist: any = res;
				if (datalist.code == 200) {
					this.conferenceMap = datalist.data.conferenceMap;
					this.liveMap = datalist.data.liveMap;
					this.fileMap = datalist.data.fileMap;
					this.liveMap.liveConsumingTraffic = this.commonService.bytesToSize(datalist.data.liveMap.liveConsumingTraffic);
					this.fileMap.traffic = this.commonService.bytesToSize(datalist.data.fileMap.traffic);
					this.conferenceMap.consumeTime = this.commonService.getTimeCode(datalist.data.conferenceMap.consumeTime);
				}
			},
			err => {
				console.log(err);
			}
		);
	}
	/* 查询企业部门开会次数 Top5 */
	getMeetingCount() {
		this.http.get('/uc/ents/' + this.entId + '/' + this.monthSt + '/countTop5').subscribe(
			res => {
				// console.log(res);
				let datalist: any = res;
				if (datalist.code == 200) {
					datalist.data.forEach(item => {
						this.numbersBarData.yAxisdata.push(item.deptName);
						this.numbersBarData.seriesdata.push(item.count);
					});
					this.drawPartBar(this.numbersBarData);
				}
			},
			err => {
				console.log(err);
			}
		);
	}
	/* 查询会议总消耗分钟数 Top5 */
	getMeetingTime() {
		this.http.get('/uc/ents/' + this.entId + '/' + this.monthSt + '/timeTop5').subscribe(
			res => {
				// console.log(res);
				let datalist: any = res;
				if (datalist.code == 200) {
					datalist.data.forEach(item => {
						this.minutesBarData.yAxisdata.push(item.deptName);
						this.minutesBarData.seriesdata.push(item.consumeTime);
					});
					this.minutesBar(this.minutesBarData);
				}
			},
			err => {
				console.log(err);
			}
		);
	}
	/* 查询本月会议分布 */
	getMeetingDistributed() {
		this.http.get('/uc/ents/' + this.entId + '/' + this.monthSt + '/count/point').subscribe(
			res => {
				let datalist: any = res;
				if (datalist.code == 200) {
					if (datalist.data.length != 0) {
						datalist.data.forEach(item => {
							this.meetingRadarData.xAxisdata.push(item.time);
							this.meetingRadarData.minutesdata.push(item.count);
						});
					}
					this.drawMeetingRadar(this.meetingRadarData);
				}
			},
			err => {
				console.log(err);
			}
		);
	}
	/* 本月消耗 */
	getConsumeMinutes() {
		this.http.get('/uc/ents/' + this.entId + '/' + this.monthSt + '/groupbyday').subscribe(
			res => {
				let datalist: any = res;
				if (datalist.code == 200) {
					if (datalist.data.length != 0) {
						// datalist.data.fileList.forEach(item => {
						// 	this.minutesLineData.minutesDay.push(item.day);
						// 	this.minutesLineData.minutesFile.push(this.getByteCode(item.recordPlayTraffic) + '');
						// });
						datalist.data.liveList.forEach(item => {
							this.drawMinuteLiveData.minutesdata.push(this.getByteCode(item.liveConsumingTraffic));
							this.drawMinuteLiveData.xAxisdata.push(item.day.slice(8,10));
							// this.minutesLineData.minutesLive.push(this.getByteCode(item.liveConsumingTraffic) + '');
						});
						datalist.data.minuteList.forEach(item => {
							this.drawMinutesListData.minutesdata.push((parseFloat(item.consumeTime)/60).toFixed(0));
							this.drawMinutesListData.xAxisdata.push(item.day.slice(8,10));
							// this.getTimeCodeTwo() this.minutesLineData.minutesConsume.push(this.getTimeCodeTwo(item.consumeTime) + '');
						});
					}
					this.drawMinutesList(this.drawMinutesListData); //本月消耗分钟数
					this.drawMinuteLive(this.drawMinuteLiveData); //本月消耗直播流量
					// console.log(this.drawMinutesListData);
					// this.drawMinutesLine(this.minutesLineData);
				}
			},
			err => {
				console.log(err);
			}
		);
	}


	/* 绘制会议分布雷达图  */
	drawMeetingRadar(optionData) {
		this.meetingRadarOption = {
			title: {
				// text: '会议分布'
			},
			tooltip: {
				trigger: 'axis',
				formatter: "会议数：{c}" //这里可以使用默认；
			},
			xAxis: {
				boundaryGap: false,

				axisLine: {
					onZero: false
				},
				axisTick: {
					show: false
				},
				data: optionData.xAxisdata
			},
			yAxis: {
				splitNumber: 3,
				axisLabel: {
					formatter: '{value}'
				},
				axisLine: {
					show: false
				},
				axisTick: {
					show: false
				}
			},
			series: [{
				name: '时间点',
				type: 'line',
				symbolSize: 10,
				data: optionData.minutesdata
			}]
		}
	}

	/* 绘制各部门使用情况 横向柱状图  */
	drawPartBar(optionData: any) {
		this.numbersBarOption = {
			color: ['#00A0E9'],
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: null // 默认为直线，可选为：'line' | 'shadow'
				}
			},
			grid: {
				left: '3%',
				right: '4%',
				top: '10%',
				height: 200, //设置grid高度
				containLabel: true
			},
			xAxis: [{
				type: 'value',
				axisLabel: {
					show: false
				},
				axisTick: {
					show: false
				},
				axisLine: {
					show: false
				},
				splitLine: {
					show: false
				}
			}],
			yAxis: [{
				type: 'category',
				boundaryGap: true,
				axisTick: {
					show: true
				},
				axisLabel: {
					interval: null
				},
				data: optionData.yAxisdata,
				splitLine: {
					show: false
				}
			}],
			series: [{
				name: '数量',
				type: 'bar',
				barWidth: 15,
				label: {
					normal: {
						show: true,
						position: 'right'
					}
				},
				data: optionData.seriesdata
			}]
		}
	}
	minutesBar(optionData: any) {
		this.minutesBarOption = {
			color: ['#00A0E9'],
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: null // 默认为直线，可选为：'line' | 'shadow'
				}
			},
			grid: {
				left: '3%',
				right: '4%',
				top: '10%',
				height: 200, //设置grid高度
				containLabel: true
			},
			xAxis: [{
				type: 'value',
				axisLabel: {
					show: false
				},
				axisTick: {
					show: false
				},
				axisLine: {
					show: false
				},
				splitLine: {
					show: false
				}
			}],
			yAxis: [{
				type: 'category',
				boundaryGap: true,
				axisTick: {
					show: true
				},
				axisLabel: {
					interval: null
				},
				data: optionData.yAxisdata,
				splitLine: {
					show: false
				}
			}],
			series: [{
				name: '数量',
				type: 'bar',
				barWidth: 15,
				label: {
					normal: {
						show: true,
						position: 'right'
					}
				},
				data: optionData.seriesdata
			}]
		}
	}

	/* 绘制 本月消耗 消耗分钟数 */
	drawMinutesList(optionData) {

		this.meetingListOption = {
			title: {
				// text: '消耗分钟数'
			},
			tooltip: {
				trigger: 'axis',
				formatter: '分钟数： {c} 分'
				// function(data:any) {
				// 			let number = parseInt(data);
				// 			let minutes = Math.floor(number / 60);
				// 			let second = number - minutes * 60;
				// 			let outputVal = minutes + "分" + second + "秒";
				// 			return outputVal;
        //    }
			},
			xAxis: {
				boundaryGap: false,

				axisLine: {
					onZero: false
				},
				axisTick: {
					show: false
				},
				data: optionData.xAxisdata
			},
			yAxis: {
				splitNumber: 3,
				axisLabel: {
					formatter: '{value}'
				},
				axisLine: {
					show: false
				},
				axisTick: {
					show: false
				}
			},
			series: [{
				name: '时间点',
				type: 'line',
				symbolSize: 10,
				data: optionData.minutesdata
			}]
		}
	}
	/* 绘制 本月消耗 直播流量 */
	drawMinuteLive(optionData) {
		this.meetingLiveOption = {
			title: {
				// text: '直播流量'
			},
			tooltip: {
				trigger: 'axis',
				formatter: "流量：{c} MB" //这里可以使用默认；
			},
			xAxis: {
				boundaryGap: false,

				axisLine: {
					onZero: false
				},
				axisTick: {
					show: false
				},
				data: optionData.xAxisdata
			},
			yAxis: {
				splitNumber: 3,
				axisLabel: {
					formatter: '{value}'
				},
				axisLine: {
					show: false
				},
				axisTick: {
					show: false
				}
			},
			series: [{
				name: '时间点',
				type: 'line',
				symbolSize: 10,
				data: optionData.minutesdata
			}]
		}
	}

	/* 绘制本月消耗分钟数情况 */
	// drawMinutesLine(optionData: any) {
	// 	this.minutesLineOption = {
	// 		title: {
	// 			text: '本月消耗'
	// 		},
	// 		tooltip: {
	// 			trigger: 'axis'
	// 		},
	// 		legend: {
	// 			data: this.minutesLineData.minuName //['消耗分钟数','直播流量','点播流量']
	// 		},
	// 		grid: {
	// 			left: '3%',
	// 			right: '4%',
	// 			bottom: '3%',
	// 			containLabel: true
	// 		},
	// 		toolbox: {
	// 			feature: {
	// 				saveAsImage: {}
	// 			}
	// 		},
	// 		xAxis: {
	// 			type: 'category',
	// 			data: optionData.minutesDay
	// 		},
	// 		yAxis: {
	// 			type: 'value'
	// 		},
	// 		series: [
	// 			{
	// 				name: this.minutesLineData.minuName[0], //'消耗分钟数',
	// 				type: 'line',
	// 				step: 'start',
	// 				data:  optionData.minutesConsume
	// 			},
	// 			{
	// 				name: this.minutesLineData.minuName[1], //'直播流量',
	// 				type: 'line',
	// 				step: 'middle',
	// 				data: optionData.minutesLive
	// 			},
	// 			{
	// 				name: this.minutesLineData.minuName[2], //'点播流量',
	// 				type: 'line',
	// 				step: 'end',
	// 				data: optionData.minutesFile
	// 			}
	// 		]
	// 	}
	// }

	getTimeCodeTwo(number) {
		// let time: any;
		// if (number < 60) {
		// 	time = number;
		// 	return time;
		// } else if (number >= 60) {
		// 	time = Math.floor(number / 60) // + ":" + (number % 60 / 100).toFixed(2).slice(-2);
		// 	return time;
		// } else {
		// 	time = 0;
		// 	return time;
		// }
		let minutes = Math.floor(number / 60);
		let second = number - minutes * 60;
		let outputVal = this.addZero(minutes) + "分" + this.addZero(second) + "秒";
		return outputVal;
	}
	// 判断值是否大于10，补零
	addZero(val) {
		return val < 10 ? "0" + val : val;
	}

	getByteCode(byte: any) {
		if (byte == 0 || byte == undefined) {
			return '0';
		}
		var k = 1024;
		// let i = Math.floor(Math.log(byte) / Math.log(k) / Math.log(k) / Math.log(k));
		let i = byte / 1024;
		i = i / 1024;
		// i = i / 1024;
		return i.toFixed(2);
		// return (byte / Math.pow(k, i)).toFixed(2);
	}

}
