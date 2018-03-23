import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingControlComponent } from './meeting-control.component';

describe('MeetingControlComponent', () => {
  let component: MeetingControlComponent;
  let fixture: ComponentFixture<MeetingControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeetingControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeetingControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
