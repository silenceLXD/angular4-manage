import { Component, Injectable, EventEmitter } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/delay';

@Injectable()
export class CustomizeService {

  templateType: EventEmitter<number>;
  entShowName: EventEmitter<string>; 
  slogan: EventEmitter<string>;
  logURL: EventEmitter<string>;
  constructor(private http: HttpClient) {
    this.templateType = new EventEmitter();
    this.entShowName = new EventEmitter();
    this.slogan = new EventEmitter();
    this.logURL = new EventEmitter();
  }

  /**
 * 获取当前主题颜色
 * param entId  传入企业ID
 * */
  getCurrentThemeColor(entId) {
    this.http.get('/uc/ents/customize/' + entId).subscribe(
      res => {
        let datalist: any = res;
        if (datalist.code == 200) {
          let type = datalist.data.ent.templateType;
          // let type = datalist.data.templateType;
          if (type == 0) {
            this.ModifyThemeColor = 'navbarHeaderBlack';
          } else if (type == 1) {
            this.ModifyThemeColor = 'navbarHeaderTechBlur';
          } else if (type == 2) {
            this.ModifyThemeColor = 'navbarHeaderBlur';
          } else if (type == 3) {
            this.ModifyThemeColor = 'navbarHeaderDark';
          } else if (type == 4) {
            this.ModifyThemeColor = 'navbarHeaderGreen';
          }
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  /**
   * 修改主题颜色
   * */
  ModifyThemeColor: any = '';

}
