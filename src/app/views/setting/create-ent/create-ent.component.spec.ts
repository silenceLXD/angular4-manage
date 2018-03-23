import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEntComponent } from './create-ent.component';

describe('CreateEntComponent', () => {
  let component: CreateEntComponent;
  let fixture: ComponentFixture<CreateEntComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateEntComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateEntComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
