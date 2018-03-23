import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumptionAllComponent } from './consumption-all.component';

describe('ConsumptionAllComponent', () => {
  let component: ConsumptionAllComponent;
  let fixture: ComponentFixture<ConsumptionAllComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsumptionAllComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsumptionAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
