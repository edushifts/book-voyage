import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormMapComponent } from './form-map.component';

describe('FormMapComponent', () => {
  let component: FormMapComponent;
  let fixture: ComponentFixture<FormMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
