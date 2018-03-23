import { Injectable } from '@angular/core';
@Injectable()
export class SettingService {
  constructor() { }
  vcsSetting:any = {
    "VCS_TITLE":'云起云',
    "VCS_LOGO_IMG":'assets/img/logo_white.png',
    "VCS_THEME_COLOR":'navbarHeaderBlack',
    "WEBRTC_URL":"http://localhost:8000",
  }
}
