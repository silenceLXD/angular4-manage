import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'toSwitchNumberAbs'
})

export class ToSwitchNumberAbsPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (value < 0) {
      return Math.abs(value);
    } else {
      return value;
    }
  }

}
