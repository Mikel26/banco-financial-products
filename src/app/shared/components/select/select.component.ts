import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  readonly value: string | number;
  readonly label: string;
}

let uniqueId = 0;

/** Select del design system, integrable con Reactive Forms vía CVA. */
@Component({
  selector: 'app-select',
  standalone: true,
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent implements ControlValueAccessor {
  readonly label = input<string>('');
  readonly options = input<SelectOption[]>([]);
  readonly placeholder = input<string>('');
  readonly errorMessage = input<string | null>(null);

  readonly selectId = `app-select-${(uniqueId += 1)}`;
  readonly value = signal<string | number | null>(null);
  readonly disabled = signal<boolean>(false);

  private onChange: (value: string | number | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: string | number | null): void {
    this.value.set(value ?? null);
  }

  registerOnChange(fn: (value: string | number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  isSelected(option: SelectOption): boolean {
    return this.value() !== null && String(option.value) === String(this.value());
  }

  onSelect(event: Event): void {
    const raw = (event.target as HTMLSelectElement).value;
    const match = this.options().find((option) => String(option.value) === raw);
    const next = match ? match.value : null;
    this.value.set(next);
    this.onChange(next);
  }

  onBlur(): void {
    this.onTouched();
  }
}
