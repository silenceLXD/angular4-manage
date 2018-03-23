import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRealroomComponent } from './user-realroom.component';

describe('UserRealroomComponent', () => {
  let component: UserRealroomComponent;
  let fixture: ComponentFixture<UserRealroomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserRealroomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserRealroomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
