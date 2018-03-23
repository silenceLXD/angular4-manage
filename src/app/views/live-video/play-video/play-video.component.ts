import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
@Component({
  selector: 'app-play-video',
  templateUrl: './play-video.component.html',
  styleUrls: ['./play-video.component.css']
})
export class PlayVideoComponent implements OnInit, OnDestroy {
  private address: number;//会议的appointmentId
  private sub:any;// 传递参数对象
  constructor(private _activatedRoute:ActivatedRoute) {
    this.sub = this._activatedRoute.params.subscribe(params=>{
      this.address = params["mid"];
    })
 }

  ngOnInit() {
  }
  //组件卸载的时候取消订阅
  ngOnDestroy() : void {
    this.sub.unsubscribe();
  }
}
