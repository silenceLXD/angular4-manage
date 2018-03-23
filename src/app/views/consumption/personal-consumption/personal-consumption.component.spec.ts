import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalConsumptionComponent } from './personal-consumption.component';

describe('PersonalConsumptionComponent', () => {
  let component: PersonalConsumptionComponent;
  let fixture: ComponentFixture<PersonalConsumptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PersonalConsumptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalConsumptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
