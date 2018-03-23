import {Component, OnInit, OnDestroy, EventEmitter, Output, Input, AfterViewInit, AfterContentInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '@services/common.service';


@Component({
  selector: 'attend-tree',
  template: `
    <ul class="tree-ul">
      <li *ngFor="let item of treelists">
        <input type="checkbox" class="check-box" [(ngModel)]="item.checked" (change)="warpCallback(item, $event)"/>
        <span class="text-field" (click)="itemOpenFn(item)">
          <i class="fa color-svoc"
             [ngClass]="item.children?'fa-folder-open':'fa-user'"></i> {{item.realName || item.name}}</span>
        <!--调用组件本身并 传值给下级: [treelists]="item.children"-->
        <attend-tree *ngIf="item.isopen && item.children && item.children.length" (outPutCheckedItem)="childrenItemData($event)"
                     (outPutTreeData)="childrenData($event)" [treelists]="item.children"></attend-tree>
      </li>
    </ul>
  `,
  styles: [`
    .tree-ul > li {
      margin-left: 20px;
    }

    .text-field {
      cursor: pointer;
    }
  `]
})
export class AttendTreeComponent implements OnInit, AfterContentInit {
  @Output() outPutTreeData: EventEmitter<any> = new EventEmitter();//子传父
  @Output() outPutChildData: EventEmitter<any> = new EventEmitter();//子传父

  @Output() outPutCheckedItem: EventEmitter<any> = new EventEmitter();//子传父

  @Input() treelists: any;//父传子  获取来自父组件的数据

  constructor(private http: HttpClient, private commonService: CommonService) {
  }

  ngOnInit() {
    console.log(this.treelists);
  }

  ngAfterContentInit() {//内容初始化到组件之后
  }

  itemOpenFn(item: any) {
    item.isopen = !item.isopen;
  }

  // 点击动作
  callArr: any = [];
  selectedData: any = [];

  warpCallback(item, $event) {
    this.outPutCheckedItem.emit(item);
    $event.stopPropagation();
    // 建立一个服务来接收这个值, 或者借助双向绑定, 处理动作
    let ischecked = $event.target.checked;
    // if 存在child
    if (this.hasChildItems(item)) {
      this.setChildItems(item, ischecked);
    } else {
      if (ischecked) {
        this.selectedData.push(item);
      } else {
        let itemIndex = this.getItemIndex(this.selectedData, item);
        // alert(itemIndex)
        this.selectedData.splice(itemIndex, 1);
      }
    }
    setTimeout(() => {
      this.outPutTreeData.emit(this.selectedData);
    }, 100);
  }

  childrenItemData(val: any) {
    this.outPutCheckedItem.emit(val);
  }

  childrenData(val: any) {
    this.outPutTreeData.emit(val);
  }

  getItemIndex(arr: any, item: any) {
    let itemId = item.userId;
    var index;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].userId = itemId) {
        index = i;
      } else {
        index = -1;
      }
    }
    return index;
  }

  /**** 联动选择框操作 *****/
  // 是否存在子元素
  hasChildItems(item) {
    return !!item.children && item.children.length > 0;
  }

  // 设置子元素 checked
  setChildItems(changeItem, checkedState) {
    for (var childItem of changeItem.children) {
      childItem.checked = checkedState;
      if (this.hasChildItems(childItem)) {
        this.setChildItems(childItem, checkedState);
      } else {
        if (checkedState) {
          this.selectedData.push(childItem);
        } else {
          this.selectedData.splice(this.selectedData.indexOf(childItem), 1);
        }
      }
    }

  }

  /*
    // 设置父元素
    setParentItems(changeItem){
      this.definedParentItem(this.treelists,changeItem);
    }
    // 查找父元素
    findParentItem(item,changeItem){
      this.definedParentItem(item.children,changeItem);
    }
    // 设置父元素 checked
    definedParentItem(childItems,changeItem){
        let userId;
        let parentItem = this.findParentItema(childItems,changeItem);
        // let parentItem = childItems.find(parentItem => {userId:changeItem.parentOrgId});
        // console.log(parentItem)
        // var parentItem = childItems.find({userId:changeItem.parentOrgId});
        if(!!parentItem){
            parentItem.checked = this.isAllSelected(parentItem);
            this.setParentItems(parentItem);
        }else{
          for (var childItem of childItems){
            if(this.hasChildItems(childItem)){
                this.findParentItem(childItem);
              }
          }
        }
    }
    findParentItema(item,changeItem){
      for(let i = 0; i<item.length; ++i) {
        if(item[i].userId == changeItem.parentOrgId) {
          return item[i];
        }
      }
    }

    isAllSelected(item){
        var isSelected = [];
        if(this.hasChildItems(item.children)){
            for (var childItem of item.children){
              isAllSelected.push(changeItem.checked);
            }
        }
        return isSelected.indexOf(true)!==-1;
    }
  */

}
