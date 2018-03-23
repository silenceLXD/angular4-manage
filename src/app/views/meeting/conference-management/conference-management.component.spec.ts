import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConferenceManagementComponent } from './conference-management.component';

describe('ConferenceManagementComponent', () => {
  let component: ConferenceManagementComponent;
  let fixture: ComponentFixture<ConferenceManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConferenceManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConferenceManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
