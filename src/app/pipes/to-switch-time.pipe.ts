import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toSwitchTime'
})

/* 自定义管道 toSwitchTime
 * 将毫秒数格式
 * 参数：value(毫秒数)；args（可选）
 *  “minutes”  xx时xx分；
 *  “hours”   xx分xx秒
 *  ‘’
*/
export class ToSwitchTimePipe implements PipeTransform {
  transform(value: any, args?: any): any {
    var inputVal = value;
    var outputVal;
    var totalseconds = Math.floor(inputVal / 1000);//换算成秒
    // var totalseconds = inputVal;
    if (args) {
      if (args == "minutes") {
        let minutes = Math.floor(totalseconds / 60);//计算分钟数
        let second = totalseconds - minutes * 60; //总秒数-已计算的分钟数

        outputVal = this.addZero(minutes) + "分" + this.addZero(second) + "秒";
      } else if (args == "hours") {
        let hours = Math.floor(totalseconds / 3600);//计算小时数
        let leave2 = Math.floor(totalseconds - (hours * 3600));//总秒数-已计算的小时数
        let minutes = Math.floor(leave2 / 60);//计算分钟数
        outputVal = this.addZero(hours) + "时" + this.addZero(minutes) + "分";
      } else {
        outputVal = "00分";
      }
    } else {

      let hours = Math.floor(totalseconds / 3600);//计算小时数
      let leave2 = Math.floor(totalseconds - (hours * 3600));//总秒数-已计算的小时数
      let minutes = Math.floor(leave2 / 60);//计算分钟数
      let second = totalseconds - (minutes * 60 + hours * 3600); //总秒数-已计算的分钟数+小时数

      if(hours == 0){
        outputVal = this.addZero(minutes) + "分" + this.addZero(second) + "秒";
      }else{
        outputVal = this.addZero(hours) + "时" + this.addZero(minutes) + "分";
      }

      // let minutes = Math.floor(totalseconds / 60);
      // let second = totalseconds - minutes * 60;
      // outputVal = this.addZero(minutes) + "分" + this.addZero(second) + "秒";
    }
    return outputVal;
  }
  // 判断值是否大于10，补零
  addZero(val) {
    return val < 10 ? "0" + val : val;
  }
}
