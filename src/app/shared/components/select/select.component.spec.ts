import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { SelectComponent, SelectOption } from './select.component';

/** Host que ejerce el CVA del SelectComponent vía Reactive Forms. */
@Component({
  standalone: true,
  imports: [ReactiveFormsModule, SelectComponent],
  template: `
    <form [formGroup]="form">
      <app-select [options]="options" formControlName="amount"></app-select>
    </form>
  `,
})
class HostComponent {
  readonly options: SelectOption[] = [
    { value: 5, label: 'Cinco' },
    { value: 10, label: 'Diez' },
  ];
  readonly form = new FormGroup({
    amount: new FormControl<number | null>(5),
  });
}

describe('SelectComponent', () => {
  function setup() {
    const fixture = TestBed.createComponent(SelectComponent);
    fixture.componentRef.setInput('options', [
      { value: 5, label: 'Cinco' },
      { value: 10, label: 'Diez' },
    ]);
    return fixture;
  }

  it('crea el componente', () => {
    const fixture = setup();
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renderiza una opción por cada item', () => {
    const fixture = setup();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('option').length).toBe(2);
  });

  it('emite el valor tipado (number) al cambiar', () => {
    const fixture = setup();
    let captured: string | number | null = null;
    fixture.componentInstance.registerOnChange((v) => (captured = v));
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('select');
    select.value = '10';
    select.dispatchEvent(new Event('change'));
    expect(captured).toBe(10);
  });

  it('writeValue fija la opción seleccionada', () => {
    const fixture = setup();
    fixture.componentInstance.writeValue(10);
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe(10);
    expect(fixture.componentInstance.isSelected({ value: 10, label: 'Diez' })).toBe(true);
  });

  it('writeValue refleja el valor en el <select> nativo del DOM', () => {
    const fixture = setup();
    fixture.componentInstance.writeValue(10);
    fixture.detectChanges();

    const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');
    const options = fixture.nativeElement.querySelectorAll('option');
    // El reflejo del valor depende únicamente de [selected] sobre <option>:
    // verificamos que el <select> nativo lo refleje, no solo el signal interno.
    expect(select.value).toBe('10');
    expect((options[0] as HTMLOptionElement).selected).toBe(false);
    expect((options[1] as HTMLOptionElement).selected).toBe(true);
  });

  it('writeValue(null) limpia la selección', () => {
    const fixture = setup();
    fixture.componentInstance.writeValue(10);
    fixture.componentInstance.writeValue(null);
    expect(fixture.componentInstance.value()).toBeNull();
  });

  it('aplica aria-label al <select> cuando se provee', () => {
    const fixture = setup();
    fixture.componentRef.setInput('ariaLabel', 'Cantidad a mostrar');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('select').getAttribute('aria-label')).toBe(
      'Cantidad a mostrar',
    );
  });

  it('onBlur dispara onTouched', () => {
    const fixture = setup();
    let touched = false;
    fixture.componentInstance.registerOnTouched(() => (touched = true));
    fixture.detectChanges();

    fixture.nativeElement.querySelector('select').dispatchEvent(new Event('blur'));
    expect(touched).toBe(true);
  });

  it('emite null si el valor no coincide con ninguna opción', () => {
    const fixture = setup();
    let captured: string | number | null = 5;
    fixture.componentInstance.registerOnChange((v) => (captured = v));
    fixture.detectChanges();

    fixture.componentInstance.onSelect({
      target: { value: '999' },
    } as unknown as Event);
    expect(captured).toBeNull();
  });

  it('renderiza el placeholder cuando se provee', () => {
    const fixture = setup();
    fixture.componentRef.setInput('placeholder', 'Elige una opción');
    fixture.detectChanges();
    const options = fixture.nativeElement.querySelectorAll('option');
    expect(options[0].textContent).toContain('Elige una opción');
  });

  it('setDisabledState deshabilita el select', () => {
    const fixture = setup();
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('select').disabled).toBe(true);
  });

  it('muestra el mensaje de error, lo asocia por id y marca aria-invalid', () => {
    const fixture = setup();
    fixture.componentRef.setInput('errorMessage', 'Selecciona una opción');
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('select');
    const error = fixture.nativeElement.querySelector('.field__error');
    expect(select.getAttribute('aria-invalid')).toBe('true');
    expect(select.getAttribute('aria-describedby')).toBe(error.id);
    expect(error.textContent).toContain('Selecciona una opción');
  });

  describe('integración con Reactive Forms', () => {
    function hostSetup() {
      TestBed.configureTestingModule({ imports: [HostComponent] });
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      return fixture;
    }

    it('refleja el valor inicial del FormControl en el <select> del DOM', () => {
      const fixture = hostSetup();
      const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');
      expect(select.value).toBe('5');
    });

    it('refleja en el DOM el patchValue del FormControl', () => {
      const fixture = hostSetup();
      const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');
      expect(select.value).toBe('5');

      fixture.componentInstance.form.patchValue({ amount: 10 });
      fixture.detectChanges();

      const options = fixture.nativeElement.querySelectorAll('option');
      expect(select.value).toBe('10');
      expect((options[0] as HTMLOptionElement).selected).toBe(false);
      expect((options[1] as HTMLOptionElement).selected).toBe(true);
    });
  });
});
