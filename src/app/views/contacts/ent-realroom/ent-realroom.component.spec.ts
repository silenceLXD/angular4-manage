import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntRealroomComponent } from './ent-realroom.component';

describe('EntRealroomComponent', () => {
  let component: EntRealroomComponent;
  let fixture: ComponentFixture<EntRealroomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntRealroomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntRealroomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
