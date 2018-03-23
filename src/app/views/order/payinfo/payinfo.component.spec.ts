import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayinfoComponent } from './payinfo.component';

describe('PayinfoComponent', () => {
  let component: PayinfoComponent;
  let fixture: ComponentFixture<PayinfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayinfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayinfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
