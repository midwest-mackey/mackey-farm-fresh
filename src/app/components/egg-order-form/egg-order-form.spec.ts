import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EggOrderForm } from './egg-order-form';

describe('EggOrderForm', () => {
  let component: EggOrderForm;
  let fixture: ComponentFixture<EggOrderForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EggOrderForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EggOrderForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
