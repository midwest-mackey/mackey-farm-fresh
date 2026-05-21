import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoreItems } from './more-items';

describe('MoreItems', () => {
  let component: MoreItems;
  let fixture: ComponentFixture<MoreItems>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MoreItems]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoreItems);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
