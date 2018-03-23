import {Component, OnInit, EventEmitter, Input, Output} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {NzNotificationService} from 'ng-zorro-antd';
import {CommonService} from '@services/common.service';

@Component({
  selector: 'add-attend',
  templateUrl: './add-attend.component.html',
  styleUrls: ['./add-attend.component.css']
})
export class AddAttendComponent implements OnInit {
  @Output() outPutAttendData: EventEmitter<any> = new EventEmitter(); // 子传父
  @Output() hide_emitter = new EventEmitter(); //  发射隐藏modal的事件

  @Input() commonId: any; // 父传子  获取来自父组件的cid
  @Input() addAttendModal: boolean;  // 父传子  获取来自父组件的modal
  @Input() modalType: any;  // 父传子  判断用于什么场景 1:预约邀请；2:会控邀请

  public loginUserData = this.commonService.getLoginMsg();
  ENTID = this.loginUserData.entId; // loginUserData.entId
  isActiveTab = 1;
  searchByName = '';

  // 左侧公司全部人员数据
  theUserListData: any = [];

  // 获取会议室数据
  theRoomListData: any = [];

  userList: any = []; // 参会者数组
  roomList: any = []; // 会议室数组

  userListData: any = []; // 渲染参会者
  roomListData: any = []; // 渲染参会者

  checkedLength: number = 0; // 已选人数

  attendListData: any = [];

  constructor(private http: HttpClient,
              private _notification: NzNotificationService,
              private commonService: CommonService) {
  }

  ngOnInit() {

    this.loadUserData();
    this.loadRoomData();
  }

  //  userListData:any = [];
  loadUserData() {
    //  param: methodFlag 方法标识。
    // 1：发起会议菜单数据格式。2：会议议程数据格式。（选中已在会议中的人）3：预约邀请参会人数据格式。会控（踢掉已在会中的人） 	 * 4：从群组发起会议。5：从历史会议查询会议。  默认查询（1）的发起会议。没有任何ischecked
    let getData: any = {'search': this.searchByName, 'commonId': this.commonId};
    this.http.get('/uc/user/tree/group/3' + this.commonService.formObject(getData)).subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == '200') {
          this.theUserListData = resultData.data;
        } else {
        }
      },
      err => {
        console.log('获取公司人员数据 error...');
      });
  }

  //  roomListData:any = [];
  loadRoomData() {
    let getData: any = {'queryStr': this.searchByName, 'pageNum': '-1', 'pageSize': '-1'};
    this.http.get('/uc/userRoom/room-user/' + this.ENTID + '/find' + this.commonService.formObject(getData)).subscribe(
      res => {
        let resultData: any = res;
        if (resultData.code == '200') {
          this.theRoomListData = resultData.data;
        } else {
        }
      },
      err => {
        console.log('获取会议室数据 error...');
      });
  }

  /* 选择人员  选择会议室操作 */
  getTreeItemData(val: any) {
    //  this.userListData = val;
  }

  // 获取子组件点击的对象
  selectedData: any = [];

  getCheckedItem(item: any) {
    //  console.log(item)
    let ischecked = item.checked;
    if (this.hasChildItems(item)) {
      this.setChildItems(item, ischecked);
    } else {
      if (ischecked) {
        this.selectedData.push(item);
      } else {
        let itemIndex = this.getItemIndex(this.selectedData, item);
        this.selectedData.splice(itemIndex, 1);
      }
    }
    this.userListData = this.uniqueList(this.selectedData);
    console.log(this.userListData);
  }

  //  选择会议室
  selRoomFn($event, room) {
    let ischecked = $event.target.checked;
    if (ischecked) {
      this.roomList.push(room);
    } else {
      this.removeListById(this.roomList, room);
    }
    this.roomListData = this.roomList;
  }

  //  移除会议室
  removeRoom(room: any) {
    room.checked = false;
    this.removeListById(this.roomListData, room);
  }

  removeUser(user: any) {
    user.checked = false;
    this.removeListById(this.userListData, user);
  }

  // 清空参会方
  emptyUserFn() {
    // 参会者
    this.userList = [];
    this.userListData = [];

    // 会议室
    this.roomList = [];
    this.roomListData = [];
  }

  /* 通过userid判断元素是否在数组内 */
  removeListById(arr, list) {
    var i = arr.length;
    while (i--) {
      if (arr[i].userId === list.userId) {
        arr.splice(i, 1);
        return true;
      }
    }
    //  return false;
    return arr;
  }


  // 选择主讲人
  hostUserId: any;

  chooseHostFn(list: any, $event) {
    if ($event.target.checked) {
      this.hostUserId = list.userId;
    }
  }

  //  确定提交所选参会者
  sureAttendFn() {
    this.attendListData = [];
    this.userListData.forEach(item => {
      this.attendListData.push(item);
    });
    this.roomListData.forEach(item => {
      this.attendListData.push(item);
    });
    this.attendListData.forEach(item => {
      if (item.userId == this.hostUserId) {
        item.isHost = true;
      } else {
        item.isHost = false;
      }
    });
    this.outPutAttendData.emit(this.attendListData);
    this.addAttendModal = false;
    this.hide_emitter.emit(this.addAttendModal);
  }

  handCancle() {
    this.addAttendModal = false;
    this.hide_emitter.emit(this.addAttendModal);
  }

  // 组件卸载的时候取消订阅
  //  ngOnDestroy() : void {
  //    this.addAttendModal.unsubscribe();
  //  }

  /**** 联动选择框操作 *****/
  // 根据userid判断是否存在重复数据
  uniqueList(arr: any) {
    var res = [];
    var json = {};
    for (var i = 0; i < arr.length; i++) {
      if (!json[arr[i].userId]) {
        res.push(arr[i]);
        json[arr[i].userId] = 1;
      }
    }
    return res;
  }

  //  获取已存在的值的下标
  getItemIndex(arr: any, item: any) {
    let itemId = item.userId;
    var index = -1;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].userId == itemId) {
        return index = i;
      }
    }
    return index;
  }

  //  是否存在子元素
  hasChildItems(item) {
    return !!item.children;
  }

  //  设置子元素 checked
  setChildItems(changeItem, checkedState) {
    for (var childItem of changeItem.children) {
      childItem.checked = checkedState;
      if (this.hasChildItems(childItem)) {
        this.setChildItems(childItem, checkedState);
      } else {
        if (checkedState) {
          this.selectedData.push(childItem);
        } else {
          //  this.selectedData.splice(this.selectedData.indexOf(childItem),1);
          let itemIndex = this.getItemIndex(this.selectedData, childItem);
          this.selectedData.splice(itemIndex, 1);

        }
      }
    }

  }
}
