import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntScheduleComponent } from './ent-schedule.component';

describe('EntScheduleComponent', () => {
  let component: EntScheduleComponent;
  let fixture: ComponentFixture<EntScheduleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntScheduleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
