import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getNumMonth'
})

/*
  根据当前时间 获取过去n个月
*/
export class GetNumMonthPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    var input = value;
    var n = args;

    var year = input.getFullYear();
		var mouth = input.getMonth()+2;
		var dt = new Date(year, mouth);
	    dt.setMonth(dt.getMonth() - n);
	    // var month = parseInt(dt.getMonth());
      var month = dt.getMonth();
	    var optionstr='' ;//yyyy-MM
	    var days; //定义当月的天数；
	    var optionsArr=[];
	    for(var i=0;i<n;i++){
	        if(mouth == 1){
	            mouth=13;
	            mouth-=1;
	            year-=1;
	        }else{
	            mouth-=1;
	        }
	        if(mouth<10){
	            mouth = "0"+mouth;
	        }

	        if(mouth == 2){
	        	//当月份为二月时，根据闰年还是非闰年判断天数
	        	days = year % 4 == 0 ? 29 : 28;
	        }else if(mouth == 1 || mouth == 3 || mouth == 5 || mouth == 7 || mouth == 8 || mouth == 10 || mouth == 12){
	        	//月份为：1,3,5,7,8,10,12 时，为大月.则天数为31；
	        	days = 31;
	        }else{
	        	//其他月份，天数为：30
	        	days = 30;
	        }
	        optionstr=year+'-'+mouth;
	        var optionobj={"date":optionstr,"days":days};
	        optionsArr.push(optionobj);
	    }
	    return optionsArr;
  }

}
