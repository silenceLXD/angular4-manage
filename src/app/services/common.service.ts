import {Component, Injectable, EventEmitter} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Http, Headers} from '@angular/http';
import {CookieService} from 'ngx-cookie-service';
import {environment} from '../../environments/environment';
import {Subject} from 'rxjs/Subject';
import {Router, ActivatedRoute} from '@angular/router';

@Injectable()
export class CommonService {


  changeFlag: EventEmitter<number>;
  entServiceData: EventEmitter<number>;
  setServiceSecondsChange: EventEmitter<any>;
  editRealNameFn: Subject<string> = new Subject<string>();
  msgCountFn: Subject<any> = new Subject<any>();
  voteStatus: EventEmitter<boolean>;

  constructor(private _cookieService: CookieService,
              private router: Router,
              private _activatedRoute: ActivatedRoute) {
    this.changeFlag = new EventEmitter();
    this.entServiceData = new EventEmitter();
    this.setServiceSecondsChange = new EventEmitter();
    this.voteStatus = new EventEmitter();
  }


  /* 写入cookie
   * @param
   * name string  键
   * value string 值
  */
  setCookie(name: string, value: any) {
    this._cookieService.set(name, value, 7, '/');
    // let Days = 15;
    // let exp = new Date();
    // exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
    // document.cookie = name + "=" + escape(value) + "; path=/;expires=" + exp.toGMTString();
  }

  /* 读取cookie
   * @param
   * name string  变量名
  */
  getCookie(name: string) {
    return this._cookieService.get(name);
  }

  /* 判断是否存在cookie
   * @param
   * name string  变量名
   * 返回 boolean
  */
  checkCookie(name: string) {
    return this._cookieService.check(name);
  }

  /* 删除cookie
   * @param
   * name string  变量名
  */
  deleCookie(name: string) {
    this._cookieService.delete(name);
  }

  /* 删除所有cookie
   * @param
   * name string  变量名
  */
  deleAllCookie() {
    this._cookieService.deleteAll('/');
  }

  // 解码utf8
  decodeUTF8(str) {
    return str.replace(/(\\u)(\w{4}|\w{2})/gi, function ($0, $1, $2) {
      return String.fromCharCode(parseInt($2, 16));
    });
  }

  /* 获取路径
   * @param
  */
  getPath() {
    let curWwwPath = window.document.location.href;
    let pathName = window.document.location.pathname;
    let pos = curWwwPath.indexOf('#');
    let localhostPaht = curWwwPath.substring(0, pos);
    return localhostPaht;
  }

  getOrigin() {
    let curWwwPath = window.document.location.origin;
    return curWwwPath;
  }

  /* 获取url参数
   * @param
   * name string  要获取的参数名
  */
  getQueryString(name) {
    let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    let r = window.location.search.substr(1).match(reg);
    // if (r != null) return unescape(r[2]); return null;
    if (r != null) return r[2];
    return null;
  }

  /**
   * 获取hash参数
   */
  getHashParameter(key) {
    let params = this.getHashParameters();
    return params[key];
  }

  getHashParameters() {
    var url = location.hash;
    var params = {};
    if (url.indexOf('?') != -1) {
      var allarr = (location.hash || '').replace(/^\#/, '').split('?');
      var arr = allarr[1].split('&');
      for (let i = 0; i < arr.length; i++) {
        let data = arr[i].split('=');
        if (data.length == 2) {
          params[data[0]] = data[1];
        }
      }
    }
    return params;
  }

  /*
  * 从localstorage中获取登录的用户信息
  */
  getLoginMsg() {
    if (localStorage.getItem('uc_loginData')) {
      return JSON.parse(localStorage.getItem('uc_loginData'));
    } else if (this.getCookie('localStorage_uc_loginData')) {
      const objData = JSON.parse(this.getCookie('localStorage_uc_loginData'));
      if (objData.entName) {
        objData.entName = this.decodeUTF8(objData.entName);
      }
      objData.realName = this.decodeUTF8(objData.realName);
      localStorage.setItem('uc_loginData', JSON.stringify(objData));
      return JSON.parse(localStorage.getItem('uc_loginData'));
    } else {
      return '';
    }
  }

  /*
  * json对象转get请求参数格式
  */
  formObject(arr: object) {
    var str = '?';
    for (let i in arr) {
      str += i + '=' + arr[i] + '&';
    }
    let formStr = str.substring(0, str.lastIndexOf('&'));
    return formStr;
  }

  /*
    日期格式转换
    yyyy-MM-dd
  */
  formatDate(date: any) {
    if (date) {
      date = new Date(date);
      let y = date.getFullYear();
      let m = date.getMonth() + 1;
      m = m < 10 ? '0' + m : m;
      let d = date.getDate();
      d = d < 10 ? ('0' + d) : d;
      return y + '-' + m + '-' + d;
    } else {
      return '';
    }
  }

  /*
    日期格式转换
    HH:mm
  */
  formatDateTime(date: any) {
    if (date) {
      date = new Date(date);
      let h = date.getHours();
      h = h < 10 ? ('0' + h) : h;
      let mi = date.getMinutes();
      mi = mi < 10 ? ('0' + mi) : mi;

      return h + ':' + mi;
    } else {
      return '';
    }
  }

  /*
    获取传入时间date ，days天之前的日期或days天之后的日期
    例： days=7 //获取7天之后的日期
        days=-7 //获取7天之前的日期
  */
  fun_date(date, days) {
    let date1 = date;
    let time1 = date1.getFullYear() + '-' + (date1.getMonth() + 1) + '-' + date1.getDate();//time1表示当前时间
    let date2 = new Date(date1);
    date2.setDate(date1.getDate() + days);
    let date2_y = date2.getFullYear();
    let date2_m: any = date2.getMonth() + 1;
    date2_m = date2_m < 10 ? '0' + date2_m : date2_m;
    let date2_d: any = date2.getDate();
    date2_d = date2_d < 10 ? '0' + date2_d : date2_d;

    let time2 = date2_y + '-' + date2_m + '-' + date2_d;
    return time2;
  }

  /*
  * 传入数字 小于10的 补0
  */
  addZero(number) {
    return number < 10 ? '0' + number : number;
  }

  /*
  * 获取当前 年月前n个月，并将每个月日期显示追加到select框中
  * addMonthFn(dtstr, n)
  *  参数： dtstr 为当前年月，格式如时间戳;
            n 为向前推移 n 个月
    返回值：optionstr 向select框中追加的option拼接字符串
   */
  addMonthFn(dtstr, n) {
    let year = dtstr.getFullYear();
    let mouth = dtstr.getMonth() + 2;

    let dt = new Date(year, mouth);
    dt.setMonth(dt.getMonth() - n);
    let month = dt.getMonth();
    let optionstr = '';
    let days; //定义当月的天数；
    let optionsArr = [];
    for (let i = 0; i < n; i++) {
      if (mouth == 1) {
        mouth = 13;
        mouth -= 1;
        year -= 1;
      } else {
        mouth -= 1;
      }
      if (mouth < 10) {
        mouth = '0' + mouth;
      }

      if (mouth == 2) {
        //当月份为二月时，根据闰年还是非闰年判断天数
        days = year % 4 == 0 ? 29 : 28;
      } else if (mouth == 1 || mouth == 3 || mouth == 5 || mouth == 7 || mouth == 8 || mouth == 10 || mouth == 12) {
        //月份为：1,3,5,7,8,10,12 时，为大月.则天数为31；
        days = 31;
      } else {
        //其他月份，天数为：30
        days = 30;
      }
      //option +='<option value='+year+'-'+mouth+' data-days='+days+'>' + year + '年' + mouth + '月</option>';
      optionstr = year + '-' + mouth;
      let optionobj = {'date': optionstr, 'days': days};
      optionsArr.push(optionobj);
    }
    // optionstr = option;
    return optionsArr;
  }

  /**
   * 获取传入kb字节 返回GB
   * */
  getByteCode(byte: any) {
    if (byte == 0 || byte == undefined) {
      return '0 B';
    }
    var k = 1024;
    let sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let i = Math.floor(Math.log(byte) / Math.log(k));
    return (byte / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  }

  /**
   * 获取传入的 秒 返回 分钟数
   * */
  getTimeCode(number: any) {
    let minutes = Math.floor(number / 60);//计算分钟数
    let second = number - minutes * 60; //总秒数-已计算的分钟数

    let outputVal = this.addZero(minutes) + '分' + this.addZero(second) + '秒';
    return outputVal;

  }

  /* 计算传入时间与当前时间之前的时间差
   * beginTime ：传入时间   格式为时间戳（毫秒数）
   * */
  longTime(beginTime: any) {
    var date = new Date().getTime();
    var longTimes = date - beginTime;
    if (longTimes > 0) {

      //计算出相差天数
      var leavedays = longTimes % (30 * 24 * 3600 * 1000);
      var days = Math.floor(leavedays / (24 * 3600 * 1000));

      //计算出小时数
      var leavehours = leavedays % (24 * 3600 * 1000);     //计算天数后剩余的毫秒数
      var hours = Math.floor(leavehours / (3600 * 1000));

      //计算相差分钟数
      var leaveminutes = leavehours % (3600 * 1000);         //计算小时数后剩余的毫秒数
      var minutes = Math.floor(leaveminutes / (60 * 1000));

      //计算相差秒数
      var leaveseconds = leaveminutes % (60 * 1000);       //计算分钟数后剩余的毫秒数
      var seconds = Math.round(leaveseconds / 1000);

      if (days == 0) {
        if (hours == 0) {
          var showLongTime = minutes + '分钟';
        } else {
          var showLongTime = hours + '小时' + minutes + '分钟';
        }
      } else {
        var showLongTime = days + '天' + hours + '小时' + minutes + '分钟';
        //var showLongTime = days+"天"+hours+"小时"+minutes+"分钟"+seconds+"秒";
      }

    } else {
      var showLongTime = '0分钟';
    }
    return showLongTime;
  }

  /* getLocalTime(ns)  ns时间戳
 * 将时间戳转为 yyyy-MM-dd hh:mm
 * */
  getLocalTime(ns: any) {
    var d = new Date(ns);
    var year = d.getFullYear();
    var month = d.getMonth() + 1;
    var date = d.getDate();
    var hour = d.getHours();
    var minute = d.getMinutes();
    var second = d.getSeconds();
    //var day=d.getDay();
    return year + '-' + this.addZero(month) + '-' + this.addZero(date) + ' ' + this.addZero(hour) + ':' + this.addZero(minute);
  }

  /**
   * 下载
   * @paramt  url   传入下载地址
   * @paramt  name  传入文件名
   * */
  downloadExport(dataUrl: any, name: any) {
    let url = environment.apiBase + dataUrl;
    // 创建隐藏的可下载链接
    var eleLink = document.createElement('a');
    eleLink.download = name;
    eleLink.style.display = 'none';
    // 字符内容转变成blob地址
    var blob = new Blob([url]);
    eleLink.href = URL.createObjectURL(blob);
    eleLink.href = url;
    // 触发点击
    document.body.appendChild(eleLink);
    eleLink.click();
    // 然后移除
    document.body.removeChild(eleLink);
  }


  bytesToSize(bytes) {
    // var bytes = bytes/1024;
    var flow = '';
    //如果流量小于1MB.则显示为KB
    if (bytes / 1024 < 1024) {
      var kb_Flow = (bytes / 1024) > 0 ? (bytes / 1024) : 0;
      flow = kb_Flow.toFixed(2) + 'KB';
    } else if (bytes / 1024 >= 1024 && bytes / 1024 / 1024 < 1024) {
      //如果流量大于1MB且小于1GB的则显示为MB
      var mb_Flow = (bytes / 1024 / 1024) > 0 ? (bytes / 1024 / 1024) : 0;
      flow = mb_Flow.toFixed(2) + 'MB';
    } else if (bytes / 1024 / 1024 >= 1024) {
      //如果流量大于1Gb
      var gb_Flow = bytes / 1024 / 1024 / 1024;
      //toFixed(1);四舍五入保留一位小数
      flow = gb_Flow.toFixed(2) + 'GB';
    } else {
      flow = '0.00KB';
    }
    return flow;
  }

  /* 登录时设置需要本地存储的数据 */
  loginSetData(resData: any) {
    // 登录成功保存 token数据 cookie
    this.setCookie('uc_access_token', resData.access_token); // 请求token
    this.setCookie('uc_expires_in', resData.expires_in); // token有效期
    this.setCookie('uc_token_type', resData.token_type); // token类型
    this.setCookie('uc_refresh_token', resData.refresh_token); // 刷新token
    this.setCookie('uc_realName', resData.realName); // 刷新token
    const xmppCookieData: any = {
      'realName': resData.realName,
      'userId': resData.userId,
      'entId': resData.entId,
      'access_token': resData.access_token,
      'refresh_token': resData.refresh_token,
      'webrtcAddress': resData.webrtcAddress,
      'webrtcXmppIp': resData.webrtcXmppIp,
      'xmppPassword': resData.xmppPassword,
      'xmppServer': resData.xmppServer,
      'xmppUsername': resData.xmppUsername
    };
    this.setCookie('xmppCookieData', JSON.stringify(xmppCookieData));

    // localstorage存储token方式
    localStorage.setItem('uc_access_token', resData.access_token); // 请求token
    localStorage.setItem('uc_expires_in', resData.expires_in); // token有效期
    localStorage.setItem('uc_token_type', resData.token_type); // token类型
    localStorage.setItem('uc_refresh_token', resData.refresh_token); // 刷新token
    if (+resData.roleType === 1 || +resData.roleType === 2) {
      localStorage.setItem('switchflag', '0');
    } else if (+resData.roleType === 3) {
      localStorage.setItem('switchflag', '1');
    } else {
      localStorage.setItem('switchflag', '2');
    }

    localStorage.setItem('uc_loginData', JSON.stringify(resData)); // 登录返回信息
    // 判断是否跳转 webrtc
    const webType = this.getCookie('fromWeb');
    if (webType === 'webrtc') {
      this.deleCookie('fromWeb');
      window.document.location.href = window.document.location.origin + '/webrtc';
    } else {
      // 登录成功进行判断用户是否首次登录 首次登录 1：是 0：否
      if (+resData.firstLogin === 1) {
        this.router.navigate(['/bind', resData.userId]); // 跳转到手机绑定，重置密码页面['/product',1]
      } else {
        this.router.navigate(['/page']); // 跳转到index主页
      }
    }

  }

  // 判断浏览器类型
  BrowserType() {
    var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
    var isOpera = userAgent.indexOf('Opera') > -1; //判断是否Opera浏览器
    var isIE = userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1 && !isOpera; //判断是否IE浏览器
    var isEdge = userAgent.indexOf('Edge') > -1; //判断是否IE的Edge浏览器
    var isFF = userAgent.indexOf('Firefox') > -1; //判断是否Firefox浏览器
    var isSafari = userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') == -1; //判断是否Safari浏览器
    var isChrome = userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Safari') > -1; //判断Chrome浏览器

    if (isIE) {
      var reIE = new RegExp('MSIE (\\d+\\.\\d+);');
      reIE.test(userAgent);
      var fIEVersion = parseFloat(RegExp['$1']);
      if (fIEVersion == 7) {
        return 'IE7';
      } else if (fIEVersion == 8) {
        return 'IE8';
      } else if (fIEVersion == 9) {
        return 'IE9';
      } else if (fIEVersion == 10) {
        return 'IE10';
      } else if (fIEVersion == 11) {
        return 'IE11';
      } else { //IE版本过低
        return '0';
      }
    }//isIE end

    if (isFF) {
      return 'FF';
    }
    if (isOpera) {
      return 'Opera';
    }
    if (isSafari) {
      return 'Safari';
    }
    if (isChrome) {
      return 'Chrome';
    }
    if (isEdge) {
      return 'Edge';
    }
  }

  //判断是否pc
  IsPC() {
    var userAgentInfo = navigator.userAgent;
    var Agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod'];
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
      if (userAgentInfo.indexOf(Agents[v]) > 0) {
        flag = false;
        break;
      }
    }
    return flag;
  }

  /* 判断是否安装了flash插件 */
  // flashChecker() {
  //       var hasFlash = 0;         //是否安装了flash
  //       var flashVersion = 0; //flash版本
  //       var isIE = /*@cc_on!@*/0;      //是否IE浏览器
  //       var VSwf;
  //       if (isIE) {
  //           var swf = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
  //           if (swf) {
  //               hasFlash = 1;
  //               VSwf = swf.GetVariable("$version");
  //               flashVersion = parseInt(VSwf.split(" ")[1].split(",")[0]);
  //           }
  //       } else {
  //           if (navigator.plugins && navigator.plugins.length > 0) {
  //               var swf = navigator.plugins["Shockwave Flash"];
  //               if (swf) {
  //                   hasFlash = 1;
  //                   var words = swf.description.split(" ");
  //                   for (var i = 0; i < words.length; ++i) {
  //                       if (isNaN(parseInt(words[i]))) continue;
  //                       flashVersion = parseInt(words[i]);
  //                   }
  //               }
  //           }
  //       }
  //       return { f: hasFlash, v: flashVersion };
  //   }
}
