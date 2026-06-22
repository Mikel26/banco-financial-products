import { TestBed } from '@angular/core/testing';

import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  it('crea el componente', () => {
    const fixture = TestBed.createComponent(ButtonComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('emite `clicked` al hacer click cuando no está deshabilitado', () => {
    const fixture = TestBed.createComponent(ButtonComponent);
    let clicks = 0;
    fixture.componentInstance.clicked.subscribe(() => (clicks += 1));
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button').click();
    expect(clicks).toBe(1);
  });

  it('no emite `clicked` cuando está deshabilitado', () => {
    const fixture = TestBed.createComponent(ButtonComponent);
    fixture.componentRef.setInput('disabled', true);
    let clicks = 0;
    fixture.componentInstance.clicked.subscribe(() => (clicks += 1));
    fixture.detectChanges();

    fixture.componentInstance.onClick();
    expect(clicks).toBe(0);
  });

  it('aplica la clase de la variante', () => {
    const fixture = TestBed.createComponent(ButtonComponent);
    fixture.componentRef.setInput('variant', 'secondary');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('button').className).toContain('btn--secondary');
  });

  it('aplica `btn--full` cuando fullWidth es true', () => {
    const fixture = TestBed.createComponent(ButtonComponent);
    fixture.componentRef.setInput('fullWidth', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button').className).toContain('btn--full');
  });
});
