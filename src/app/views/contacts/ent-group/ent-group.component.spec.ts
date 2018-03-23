import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntGroupComponent } from './ent-group.component';

describe('EntGroupComponent', () => {
  let component: EntGroupComponent;
  let fixture: ComponentFixture<EntGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
