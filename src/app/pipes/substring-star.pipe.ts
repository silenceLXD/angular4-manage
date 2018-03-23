import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'substringStar'
})

/* 截取手机号/邮箱
 * 手机号码/邮箱中间用星号代替
 * args  需要截取数据类型  email：邮箱；phone：手机号（默认为手机号）
*/
export class SubstringStarPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    let input = value;
    let output;
    if(args == "email"){
      output = input.replace(input.substring(2,input.lastIndexOf("@")-1),"*****")
    }else if(args == "phone"){
      output = input.substring(0,3)+"******"+input.substring(9,11)
    }else{
      output = input.substring(0,3)+"******"+input.substring(9,11)
    }
    return output;
  }

}
