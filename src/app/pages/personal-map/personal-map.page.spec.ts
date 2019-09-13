import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalMapPage } from './personal-map.page';

describe('PersonalMapPage', () => {
  let component: PersonalMapPage;
  let fixture: ComponentFixture<PersonalMapPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PersonalMapPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalMapPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
