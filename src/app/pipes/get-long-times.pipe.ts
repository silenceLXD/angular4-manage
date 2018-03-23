import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getLongTimes'
})
/* 计算传入时间与当前时间之前的时间差
 * value ：传入时间   格式为时间戳（毫秒数）
 * args : 参数可选
 * */
export class GetLongTimesPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    var date = new Date().getTime();
		var longTimes;
    if(date >= value){
      longTimes = date - value;
    }else {
      longTimes = value - date;
    }
		if(Math.abs(longTimes)>0){
			//计算出相差天数
		    let leavedays = longTimes % (30 * 24 * 3600 * 1000);
		    let days = Math.floor(leavedays / (24 * 3600 * 1000));

			//计算出小时数
		    let leavehours = leavedays % (24 * 3600 * 1000);     //计算天数后剩余的毫秒数
		    let hours = Math.floor(leavehours / (3600 * 1000));

			//计算相差分钟数
		    let leaveminutes = leavehours % (3600 * 1000);         //计算小时数后剩余的毫秒数
		    let minutes = Math.floor(leaveminutes / (60 * 1000));

		    //计算相差秒数
		    let leaveseconds = leaveminutes % (60 * 1000);       //计算分钟数后剩余的毫秒数
		    let seconds = Math.round(leaveseconds / 1000);

		    if(days == 0){
		    	if(hours == 0){
		    		var showLongTime = minutes+"分钟";
		    	}else{
		    		var showLongTime = hours+"小时"+minutes+"分钟";
		    	}
		    }else{
		    	var showLongTime = days+"天"+hours+"小时"+minutes+"分钟";
		    	//var showLongTime = days+"天"+hours+"小时"+minutes+"分钟"+seconds+"秒";
		    }

  		}else{
  			var showLongTime="0分钟";
  		}
	    return showLongTime;
  }

}
