import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeAdminComponent } from './change-admin.component';

describe('ChangeAdminComponent', () => {
  let component: ChangeAdminComponent;
  let fixture: ComponentFixture<ChangeAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
