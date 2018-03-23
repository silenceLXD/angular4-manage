import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Pipe, PipeTransform} from '@angular/core';

// 引入所有自定义的管道文件
import {ToSwitchTimePipe} from './to-switch-time.pipe';
import {GetNumMonthPipe} from './get-num-month.pipe';
import {GetLongTimesPipe} from './get-long-times.pipe';
import {SubstringStarPipe} from './substring-star.pipe';
import {SearchPhonePipe} from './search-phone.pipe' ;
import {SearchBykeyPipe} from './search-bykey.pipe' ;
import {ToSwitchTimeTwoPipe} from './to-switch-time-two.pipe';
import {BateBySizePipe} from './bate-by-size.pipe';
import {ToSwitchNumberAbsPipe} from '@pipes/to-switch-number-abs.pipe';


@NgModule({
  declarations: [
    ToSwitchTimePipe,
    GetNumMonthPipe,
    GetLongTimesPipe,
    SearchPhonePipe,
    SubstringStarPipe,
    ToSwitchTimeTwoPipe,
    SearchBykeyPipe,
    BateBySizePipe,
    ToSwitchNumberAbsPipe
  ],
  imports: [
    CommonModule,
  ],
  providers: [],
  // 若管道要在其他模块中使用就必须把管道导出，否则只能在当前组件中使用
  exports: [
    ToSwitchTimePipe,
    GetNumMonthPipe,
    GetLongTimesPipe,
    SubstringStarPipe,
    SearchPhonePipe,
    SearchBykeyPipe,
    BateBySizePipe,
    ToSwitchNumberAbsPipe
  ]
})
export class AllPipesModule {
}
