import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAttendComponent } from './add-attend.component';

describe('AddAttendComponent', () => {
  let component: AddAttendComponent;
  let fixture: ComponentFixture<AddAttendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddAttendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAttendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
