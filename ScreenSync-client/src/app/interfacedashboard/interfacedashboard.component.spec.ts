import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InterfacedashboardComponent } from './interfacedashboard.component';

describe('InterfacedashboardComponent', () => {
  let component: InterfacedashboardComponent;
  let fixture: ComponentFixture<InterfacedashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InterfacedashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InterfacedashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
