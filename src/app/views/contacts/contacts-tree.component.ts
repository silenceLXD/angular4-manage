import { Component, OnInit, OnDestroy, EventEmitter, Output, Input, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '@services/common.service';


@Component({
  selector: 'contacts-tree',
  template: `
  <ul class="contactsUlMenu">
    <li *ngFor="let item of treelists;let i = index">
      <a href="javascript:;" [ngClass]="'level'+item.level" [class.isActive]="item.value == _liActive" (click)="itemClick(item)">
        <i *ngIf="item.submenu && item.submenu.length" class="fa" [ngClass]="item.value == _liActive?'fa-caret-down':'fa-caret-right'"></i> <i class="fa fa-folder"></i> {{item.name}} ({{ item.count }})
      </a>
      <!--调用组件本身并 传值给下级: [treelists]="item.submenu"-->
      <contacts-tree *ngIf="item._open && item.submenu && item.submenu.length" (outPutTreeData)="childrenData($event)" [treelists]="item.submenu"></contacts-tree>
    </li>
  </ul>
  `,
  styles:[`

    .contactsUlMenu li{
      margin: 2px 0;
    }
    .contactsUlMenu li a{
        display: block;
        padding: 8px 20px;
        text-decoration: none;
        overflow: hidden;
    }
    .contactsUlMenu a:hover{
        background: rgb(7, 162, 232);
        color: #fff;
        text-decoration: none;
    }
    .isActive{
        background: rgb(7, 162, 232);
        color: #fff;
    }
    .level1{
      text-indent:10px
    }
    .level2{
      text-indent:16px
    }
    .level3{
      text-indent:28px
    }
    .level4{
      text-indent:24px
    }
    `]
})

export class ContactsTreeComponent implements OnInit {
  @Output() outPutTreeData:EventEmitter<any> = new EventEmitter();//子传父
  @Input() treelists:any;//父传子  获取来自父组件的数据

  constructor(private http: HttpClient, private commonService: CommonService) { }
  _liOpen:boolean = false;
  _liActive:any;//判断是否选中(value)
  indentNum="18px";
  ngOnInit() {
  }
  // 点击动作
  itemClick(item:any) {
    // item.setItem('_open',false);
    // 建立一个服务来接收这个值, 或者借助双向绑定, 处理动作
    item._open = !item._open;  // 本例只简单演示开关, 借助 treelists本身实现
    this._liActive=item.value;
    // console.log(item)
    this.outPutTreeData.emit(item);
  }
  childrenData(val:any){
    this.outPutTreeData.emit(val);
  }

}
