import { Injectable } from '@angular/core';
// import { Http }       from '@angular/http';
import { Observable }     from 'rxjs/Observable';
// import { Http } from '@angular/http';
import { Headers, Http } from '@angular/http';
import { environment } from '../../environments/environment';
import 'rxjs/add/operator/toPromise';
import { CommonService } from '@services/common.service';

@Injectable()
export class TokenService {
   private apiBase = environment.apiBase;
   constructor(private commonService: CommonService, private http: Http){ }
   // public loginUserData = this.commonService.getLoginMsg();
    // authTokens:any = this.locTokenType+" "+this.locAccessToken;
    // authTokens:string = "Bearer "+this.locAccessToken;
    getToken(){
      // let locTokenType = this.commonService.getCookie("uc_token_type");
      // let locAccessToken = this.commonService.getCookie("uc_access_token");
      let locTokenType = localStorage.getItem("uc_token_type");
      let locAccessToken = localStorage.getItem("uc_access_token");

      return "Bearer "+locAccessToken;
    }
    tokenData:string = "grant_type=refresh_token&scope=web&client_id=2513608755203&client_secret=32b42c8d694d520d3e321&refresh_token="+this.commonService.getCookie("uc_refresh_token");
    private headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'});
    refreshToken(){
      return this.http.post(this.apiBase+'/oauth/token',this.tokenData,{headers: this.headers})
       .toPromise()
       .then(response => response.json().data)
       .catch();
       // .catch(this.headers);
    }
}
