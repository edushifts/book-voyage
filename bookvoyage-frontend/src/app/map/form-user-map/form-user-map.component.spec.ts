import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormUserMapComponent } from './form-user-map.component';

describe('FormUserMapComponent', () => {
  let component: FormUserMapComponent;
  let fixture: ComponentFixture<FormUserMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormUserMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormUserMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
