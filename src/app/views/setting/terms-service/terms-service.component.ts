import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-terms-service',
  templateUrl: './terms-service.component.html',
  styleUrls: ['./terms-service.component.css']
})
export class TermsServiceComponent implements OnInit {
  nowDate:any;
  constructor() {
    this.nowDate = new Date().getFullYear();
  }

  ngOnInit() {
  }

}
