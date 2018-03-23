import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntRoomComponent } from './ent-room.component';

describe('EntRoomComponent', () => {
  let component: EntRoomComponent;
  let fixture: ComponentFixture<EntRoomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntRoomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
