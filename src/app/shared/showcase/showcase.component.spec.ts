import { TestBed } from '@angular/core/testing';

import { ShowcaseComponent } from './showcase.component';

describe('ShowcaseComponent', () => {
  it('crea la vitrina', () => {
    const fixture = TestBed.createComponent(ShowcaseComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('registerClick incrementa el contador', () => {
    const fixture = TestBed.createComponent(ShowcaseComponent);
    fixture.componentInstance.registerClick();
    fixture.componentInstance.registerClick();
    expect(fixture.componentInstance.clicks()).toBe(2);
  });
});
