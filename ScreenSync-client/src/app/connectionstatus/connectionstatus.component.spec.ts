import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionstatusComponent } from './connectionstatus.component';

describe('ConnectionstatusComponent', () => {
  let component: ConnectionstatusComponent;
  let fixture: ComponentFixture<ConnectionstatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConnectionstatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectionstatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
