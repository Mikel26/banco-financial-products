import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { NotificationService } from '../../../../core/services/notification.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { DateInputComponent } from '../../../../shared/components/date-input/date-input.component';
import { TextInputComponent } from '../../../../shared/components/text-input/text-input.component';
import { ProductCreate } from '../../models/product.model';
import { ProductsApiService } from '../../services/products-api.service';
import { ProductsStateService } from '../../services/products-state.service';
import { idUniqueValidator } from '../../validators/id-unique.validator';
import { formatLocalDate, parseLocalDate } from '../../validators/parse-local-date';
import { releaseDateValidator } from '../../validators/release-date.validator';
import { revisionDateValidator } from '../../validators/revision-date.validator';

/**
 * Formulario de alta de producto (F4), maquetado según el diseño D2.
 * La fecha de revisión se autocompleta (liberación + 1 año) y queda deshabilitada.
 */
@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, TextInputComponent, DateInputComponent, ButtonComponent],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ProductsApiService);
  private readonly state = inject(ProductsStateService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  readonly submitting = signal(false);
  readonly today = formatLocalDate(new Date());

  readonly form = this.fb.nonNullable.group({
    id: [
      '',
      {
        validators: [Validators.required, Validators.minLength(3), Validators.maxLength(10)],
        asyncValidators: [idUniqueValidator(this.api)],
        updateOn: 'blur' as const,
      },
    ],
    name: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
    logo: ['', Validators.required],
    date_release: ['', [Validators.required, releaseDateValidator]],
    date_revision: [
      { value: '', disabled: true },
      [Validators.required, revisionDateValidator('date_release')],
    ],
  });

  constructor() {
    // La revisión se calcula automáticamente: liberación + 1 año exacto.
    this.form.controls.date_release.valueChanges.pipe(takeUntilDestroyed()).subscribe((release) => {
      const date = parseLocalDate(release);
      if (!date) {
        this.form.controls.date_revision.setValue('');
        return;
      }
      const revision = new Date(date);
      revision.setFullYear(revision.getFullYear() + 1);
      this.form.controls.date_revision.setValue(formatLocalDate(revision));
    });
  }

  /** Mensaje de error a mostrar para un campo (o null si es válido / sin tocar). */
  errorFor(name: string): string | null {
    const control = this.form.get(name);
    if (!control || !control.touched || !control.errors) {
      return null;
    }
    const errors = control.errors;
    if (errors['required']) {
      return 'Este campo es requerido';
    }
    if (errors['idTaken']) {
      return 'El ID ya existe';
    }
    if (errors['minlength']) {
      return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    }
    if (errors['maxlength']) {
      return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    }
    if (errors['releaseDateInvalid']) {
      return 'La fecha debe ser hoy o posterior';
    }
    if (errors['revisionDateInvalid']) {
      return 'Debe ser un año posterior a la liberación';
    }
    return 'Campo inválido';
  }

  onSubmit(): void {
    // `!valid` cubre también el estado PENDING del validador async de id.
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    const product = this.form.getRawValue() as ProductCreate;
    this.state
      .addProduct(product)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.notification.showSuccess('Producto creado correctamente');
          this.router.navigate(['/products']);
        },
        error: () => undefined,
      });
  }

  onReset(): void {
    this.form.reset();
  }
}
