import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntHistoryComponent } from './ent-history.component';

describe('EntHistoryComponent', () => {
  let component: EntHistoryComponent;
  let fixture: ComponentFixture<EntHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
