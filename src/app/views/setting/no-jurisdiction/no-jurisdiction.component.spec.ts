import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoJurisdictionComponent } from './no-jurisdiction.component';

describe('NoJurisdictionComponent', () => {
  let component: NoJurisdictionComponent;
  let fixture: ComponentFixture<NoJurisdictionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoJurisdictionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoJurisdictionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
