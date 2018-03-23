import { Component, OnInit, OnDestroy, EventEmitter, Output  } from '@angular/core';
import  * as $ from  'jquery';

@Component({
  selector: 'setup-four',
  template: `
    <div style="margin:50px 0;">
      <p class="text-center">新密码设置成功！</p>
      <p class="text-center">请牢记您新设置的密码。<a routerLink="/login" style="font-size: 16px;">返回登录</a></p>
    </div>
  `,
  styles:[`

    `]
})
export class SetupFourComponent implements OnInit {

  constructor() { }
  // @Output() getSliderdate:EventEmitter<any> = new EventEmitter();
  // purchasetime:number = 1;//默认包月服务时长为1
  ngOnInit() {
    // this.getSliderdate.emit(this.purchasetime);
  }

}
