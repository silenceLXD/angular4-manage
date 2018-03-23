import {Component, OnInit, OnDestroy, EventEmitter, Output} from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'slider-date',
  template: `
    <div style="display: inline-block">
      <div class="slider-date" id="monthSliderDate">
        <ul class="slider-bg clearfix">
          <li *ngFor="let num of month; let index = index" (click)="sliderToDes(index)">
            {{num}}{{index > 10 ? '年' : '月'}}<span>{{num}}</span></li>
        </ul>
        <div class="slider-bar">
          <ul class="slider-bg clearfix">
            <li *ngFor="let num of month; let index = index" (click)="sliderToDes(index)">
              {{num}}{{index > 10 ? '年' : '月'}}<span>{{num}}</span></li>
          </ul>
          <span class="slider-bar-btn"><i></i><i></i></span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .slider-date {
      height: 36px;
      line-height: 36px;
      background: #e8e8e8;
      display: inline-block;
      position: relative;
    }

    .slider-date .slider-bg li {
      position: relative;
      float: left;
      width: 40px;
      border-left: solid 1px #ddd;
      font-size: 12px;
      text-align: center;
      cursor: pointer
    }

    .slider-date .slider-bg span {
      display: none;
    }

    .slider-date .slider-bg li:first-child {
      border-left: none;
    }

    .slider-date .slider-bar {
      position: absolute;
      top: -2px;
      left: 0;
      overflow: hidden;
      height: 40px;
      width: 50px;
    }

    .slider-date .slider-bar ul {
      margin-top: 1px;
      background: #07A2E8;
      color: #fff;
      height: 36px;
      width: 1000px;
    }

    .slider-date .slider-bar-btn {
      line-height: 40px;
      text-align: center;
      position: absolute;
      top: -2px;
      right: 0;
      display: block;
      width: 16px;
      height: 40px;
      background: #07A2E8;
      color: #fff;
    }

    .slider-date .slider-bar-btn i {
      display: inline-block;
      margin: 15px 2px;
      width: 2px;
      height: 12px;
      background: rgba(251, 251, 251, 0.44);
    }
  `]
})
export class SliderDateComponent implements OnInit {

  constructor() {
  }

  @Output() getSliderdate: EventEmitter<any> = new EventEmitter();
  month: any = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, '1', '2', '3'];//用于渲染页面中的月份
  purchasetime: number = 1;//默认包月服务时长为1
  ngOnInit() {
    this.getSliderdate.emit(this.purchasetime);
  }

  /* 选择服务时长 */
  sliderToDes(index: any) {
    if (index == 11) {
      this.purchasetime = 12;
    } else if (index == 12) {
      this.purchasetime = 24;
    } else if (index == 13) {
      this.purchasetime = 36;
    } else {
      this.purchasetime = index + 1;
    }
    this.sliderDateScroll(index);
    //向父组件传值（已选择的时长）
    this.getSliderdate.emit(this.purchasetime);
  }

  /* 选择服务时长 滚动效果 */
  sliderDateScroll(index: any) {
    let liWid = 40 + 1; //单个li的宽度
    //最大不能超过11
    if (index > 13) {
      index = 13;
    }
    //最小不能小于 0
    if (index < 0) {
      index = 0;
    }
    //背景动画
    $('.slider-bar').animate({
      'width': liWid * (index + 1)
    }, 500);
  }


}
