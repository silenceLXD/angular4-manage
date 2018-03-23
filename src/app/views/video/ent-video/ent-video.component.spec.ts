import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntVideoComponent } from './ent-video.component';

describe('EntVideoComponent', () => {
  let component: EntVideoComponent;
  let fixture: ComponentFixture<EntVideoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntVideoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
