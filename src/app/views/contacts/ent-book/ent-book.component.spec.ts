import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntBookComponent } from './ent-book.component';

describe('EntBookComponent', () => {
  let component: EntBookComponent;
  let fixture: ComponentFixture<EntBookComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntBookComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntBookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
