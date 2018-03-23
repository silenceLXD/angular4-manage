import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserScheduleComponent } from './user-schedule.component';

describe('UserScheduleComponent', () => {
  let component: UserScheduleComponent;
  let fixture: ComponentFixture<UserScheduleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserScheduleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
