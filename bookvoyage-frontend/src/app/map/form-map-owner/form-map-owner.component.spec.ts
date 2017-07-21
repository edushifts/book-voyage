import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormMapOwnerComponent } from './form-map-owner.component';

describe('FormMapOwnerComponent', () => {
  let component: FormMapOwnerComponent;
  let fixture: ComponentFixture<FormMapOwnerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormMapOwnerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormMapOwnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
