import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toSwitchTimeTwo'
})
/**
 * 自定義管道
 * 傳入秒 返回 分 秒
 * */
export class ToSwitchTimeTwoPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    // let time: any;
    // if (value < 60) {
    //   time = value + '秒';
    //   return time;
    // } else if (value >= 60) {
    //   time = Math.floor(value / 60) + ":" + (value % 60 / 100).toFixed(2).slice(-2) + '分钟';
    //   return time;
    // } else {
    //   time = 0 + '秒';
    //   return time;
    // }
  }

}
