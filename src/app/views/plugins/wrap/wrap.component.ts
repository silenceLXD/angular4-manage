import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-wrap',
  templateUrl: './wrap.component.html',
  styleUrls: ['./wrap.component.css']
})
export class WrapComponent implements OnInit {

  @Input() title: any;

  constructor() {
  }

  ngOnInit() {
  }

}
