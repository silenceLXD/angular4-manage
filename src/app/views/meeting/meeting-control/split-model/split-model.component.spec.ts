import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitModelComponent } from './split-model.component';

describe('SplitModelComponent', () => {
  let component: SplitModelComponent;
  let fixture: ComponentFixture<SplitModelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SplitModelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SplitModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
