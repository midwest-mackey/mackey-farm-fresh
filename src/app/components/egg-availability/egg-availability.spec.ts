import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EggAvailability } from './egg-availability';

describe('EggAvailability', () => {
  let component: EggAvailability;
  let fixture: ComponentFixture<EggAvailability>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EggAvailability]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EggAvailability);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
