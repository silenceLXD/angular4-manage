import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { SettingService } from '@services/setting.service';

@Component({
  selector: 'app-header-un',
  templateUrl: './header-un.component.html',
  styleUrls: ['./header-un.component.css']
})
export class HeaderUnComponent implements OnInit {
  settingData: any;//获取设置文件数据
  webrtcAnonymousUrl: string;//webrtc访问地址
  constructor(
    private settingService: SettingService
  ) {

  }

  ngOnInit() {
    this.settingData = this.settingService.vcsSetting;
    this.webrtcAnonymousUrl = this.settingData.WEBRTC_URL+'/#type=1';
  }
}
