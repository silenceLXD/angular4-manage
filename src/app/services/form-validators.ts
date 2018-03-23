import { FormControl,FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

export class FormValidators{
    mobileValidator(control:FormControl):any {
        let myReg = /^1(3|4|5|7|8)+\d{9}$/;
        let valid = myReg.test(control.value);
        console.log("moblie的校验结果是"+valid)
        return valid ? null : {mobile:true};//如果valid是true 返回是null
      }
    //异步校验器，返回的不是对象，而是一个异步校验流
    mobileAsyncValidator(control:FormControl):any {
        let myReg = /^1(3|4|5|7|8)+\d{9}$/;
        let valid = myReg.test(control.value);
        console.log("moblie的校验结果是"+valid)
        return Observable.of(
            valid ? null : {mobile:true}
        ).delay(5000)//延迟5秒
      }
    euqalValidator(group:FormGroup):any {
      let password :FormControl = group.get("password") as FormControl;
      let pwconfrim :FormControl = group.get("pwconfrim") as FormControl;
      let valid :boolean = (password.value === pwconfrim.value);
      console.log("密码校验结果是"+valid);
      return valid ? null : {equal:{descx:"密码和确认密码不匹配"}};
    }
}
