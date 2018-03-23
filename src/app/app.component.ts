import { Component, OnInit } from '@angular/core';
// import { Http } from '@angular/http';
import { HttpClient } from '@angular/common/http';//新增行
import 'rxjs/add/operator/map';

interface Member {
    id: string;
    login: string;
    avatar_url: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  constructor(private http: HttpClient){}

    ngOnInit(){
      // this.http.post('https://api.github.com/users/seeschweiler').subscribe(
      //   res => {
      //     console.log(res);
      //   },
      //   err => {
      //     console.log(err);
      //     console.log("Error occured");
      //   }
      // );
    }

}
