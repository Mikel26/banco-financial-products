import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let uniqueId = 0;

/**
 * Input de fecha del design system, integrable con Reactive Forms vía CVA.
 * Acepta `min`/`max` (ISO) para acotar el rango — útil p. ej. para exigir
 * fecha de liberación ≥ hoy en la Fase 4.
 */
@Component({
  selector: 'app-date-input',
  standalone: true,
  templateUrl: './date-input.component.html',
  styleUrl: './date-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateInputComponent),
      multi: true,
    },
  ],
})
export class DateInputComponent implements ControlValueAccessor {
  readonly label = input<string>('');
  readonly errorMessage = input<string | null>(null);
  readonly min = input<string | null>(null);
  readonly max = input<string | null>(null);
  readonly required = input<boolean>(false);
  readonly hint = input<string>('');

  readonly inputId = `app-date-input-${(uniqueId += 1)}`;
  readonly value = signal<string>('');
  readonly disabled = signal<boolean>(false);

  /** Ids que describen el campo (ayuda y/o error) para `aria-describedby`. */
  readonly describedBy = computed(() => {
    const ids = [
      this.hint() ? `${this.inputId}-hint` : null,
      this.errorMessage() ? `${this.inputId}-error` : null,
    ].filter(Boolean);
    return ids.length ? ids.join(' ') : null;
  });

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.onChange(value);
  }

  onBlur(): void {
    this.onTouched();
  }
}
