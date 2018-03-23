import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntContactsComponent } from './ent-contacts.component';

describe('EntContactsComponent', () => {
  let component: EntContactsComponent;
  let fixture: ComponentFixture<EntContactsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntContactsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntContactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
