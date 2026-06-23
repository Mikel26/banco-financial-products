import { TestBed } from '@angular/core/testing';

import { TextInputComponent } from './text-input.component';

describe('TextInputComponent', () => {
  it('crea el componente', () => {
    const fixture = TestBed.createComponent(TextInputComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('writeValue refleja el valor en el input', () => {
    const fixture = TestBed.createComponent(TextInputComponent);
    fixture.componentInstance.writeValue('hola');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input').value).toBe('hola');
  });

  it('propaga cambios vía registerOnChange', () => {
    const fixture = TestBed.createComponent(TextInputComponent);
    let captured = '';
    fixture.componentInstance.registerOnChange((v: string) => (captured = v));
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    input.value = 'mundo';
    input.dispatchEvent(new Event('input'));
    expect(captured).toBe('mundo');
  });

  it('setDisabledState deshabilita el input', () => {
    const fixture = TestBed.createComponent(TextInputComponent);
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input').disabled).toBe(true);
  });

  it('muestra el mensaje de error y marca aria-invalid', () => {
    const fixture = TestBed.createComponent(TextInputComponent);
    fixture.componentRef.setInput('errorMessage', 'Campo requerido');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(fixture.nativeElement.querySelector('.field__error').textContent).toContain(
      'Campo requerido',
    );
  });

  it('writeValue(null) deja el valor vacío', () => {
    const fixture = TestBed.createComponent(TextInputComponent);
    fixture.componentInstance.writeValue(null);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input').value).toBe('');
  });

  it('onBlur dispara onTouched', () => {
    const fixture = TestBed.createComponent(TextInputComponent);
    let touched = false;
    fixture.componentInstance.registerOnTouched(() => (touched = true));
    fixture.detectChanges();

    fixture.nativeElement.querySelector('input').dispatchEvent(new Event('blur'));
    expect(touched).toBe(true);
  });

  it('renderiza la etiqueta cuando se provee', () => {
    const fixture = TestBed.createComponent(TextInputComponent);
    fixture.componentRef.setInput('label', 'Nombre');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('label')?.textContent).toContain('Nombre');
  });

  it('marca aria-required cuando required es true (y lo omite si no)', () => {
    const fixture = TestBed.createComponent(TextInputComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input').getAttribute('aria-required')).toBeNull();

    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input').getAttribute('aria-required')).toBe('true');
  });
});
