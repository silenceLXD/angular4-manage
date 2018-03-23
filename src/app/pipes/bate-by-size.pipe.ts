import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'bateBySize'
})

/* 自定义管道 bateBySize
 * 计算流量单位的方法
 * 参数：value(B)
*/
export class BateBySizePipe implements PipeTransform {
  transform(value: any, args?: any): any {
    var bytes = value;
    var flow = "";
    //如果流量小于1MB.则显示为KB
    if(bytes/1024 < 1024){
      var kb_Flow = (bytes/1024) > 0 ? (bytes/1024) : 0;
      flow = kb_Flow.toFixed(2) + 'KB';
    }else if(bytes/1024 >= 1024 && bytes/1024/1024 < 1024){
        //如果流量大于1MB且小于1GB的则显示为MB
        var mb_Flow = (bytes/1024/1024) > 0 ? (bytes/1024/1024) : 0;
        flow = mb_Flow.toFixed(2) + 'MB';
    }else if(bytes/1024/1024 >= 1024){
        //如果流量大于1Gb
        var gb_Flow = bytes/1024/1024/1024;
        //toFixed(2);四舍五入保留2位小数
        flow = gb_Flow.toFixed(2)+'GB';
    }else{
        flow = "0.00KB";
    }
    return flow;
  }

}
