import { TestBed } from '@angular/core/testing';

import { DateInputComponent } from './date-input.component';

describe('DateInputComponent', () => {
  it('crea el componente', () => {
    const fixture = TestBed.createComponent(DateInputComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('writeValue refleja la fecha en el input', () => {
    const fixture = TestBed.createComponent(DateInputComponent);
    fixture.componentInstance.writeValue('2026-07-01');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input').value).toBe('2026-07-01');
  });

  it('propaga cambios vía registerOnChange', () => {
    const fixture = TestBed.createComponent(DateInputComponent);
    let captured = '';
    fixture.componentInstance.registerOnChange((v: string) => (captured = v));
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    input.value = '2027-01-15';
    input.dispatchEvent(new Event('input'));
    expect(captured).toBe('2027-01-15');
  });

  it('aplica el atributo min', () => {
    const fixture = TestBed.createComponent(DateInputComponent);
    fixture.componentRef.setInput('min', '2026-06-22');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input').getAttribute('min')).toBe('2026-06-22');
  });

  it('writeValue(null) deja el valor vacío', () => {
    const fixture = TestBed.createComponent(DateInputComponent);
    fixture.componentInstance.writeValue(null);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input').value).toBe('');
  });

  it('onBlur dispara onTouched', () => {
    const fixture = TestBed.createComponent(DateInputComponent);
    let touched = false;
    fixture.componentInstance.registerOnTouched(() => (touched = true));
    fixture.detectChanges();

    fixture.nativeElement.querySelector('input').dispatchEvent(new Event('blur'));
    expect(touched).toBe(true);
  });

  it('setDisabledState deshabilita el input', () => {
    const fixture = TestBed.createComponent(DateInputComponent);
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input').disabled).toBe(true);
  });

  it('aplica el atributo max', () => {
    const fixture = TestBed.createComponent(DateInputComponent);
    fixture.componentRef.setInput('max', '2027-06-22');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input').getAttribute('max')).toBe('2027-06-22');
  });

  it('muestra el mensaje de error y marca aria-invalid', () => {
    const fixture = TestBed.createComponent(DateInputComponent);
    fixture.componentRef.setInput('errorMessage', 'Fecha inválida');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(fixture.nativeElement.querySelector('.field__error').textContent).toContain(
      'Fecha inválida',
    );
  });

  it('marca aria-required cuando required es true', () => {
    const fixture = TestBed.createComponent(DateInputComponent);
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input').getAttribute('aria-required')).toBe('true');
  });

  it('renderiza el hint y lo enlaza con aria-describedby', () => {
    const fixture = TestBed.createComponent(DateInputComponent);
    fixture.componentRef.setInput('hint', 'Se calcula automáticamente.');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    const hint = fixture.nativeElement.querySelector('.field__hint');
    expect(hint.textContent).toContain('Se calcula automáticamente.');
    expect(input.getAttribute('aria-describedby')).toBe(hint.getAttribute('id'));
  });

  it('aria-describedby combina hint y error cuando hay ambos', () => {
    const fixture = TestBed.createComponent(DateInputComponent);
    fixture.componentRef.setInput('hint', 'Ayuda');
    fixture.componentRef.setInput('errorMessage', 'Error');
    fixture.detectChanges();

    const describedBy = fixture.nativeElement
      .querySelector('input')
      .getAttribute('aria-describedby');
    expect(describedBy).toContain('-hint');
    expect(describedBy).toContain('-error');
  });
});
