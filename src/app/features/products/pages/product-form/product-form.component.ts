import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { CanComponentDeactivate } from '../../../../core/guards/unsaved-changes.guard';
import { NotificationService } from '../../../../core/services/notification.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { DateInputComponent } from '../../../../shared/components/date-input/date-input.component';
import { TextInputComponent } from '../../../../shared/components/text-input/text-input.component';
import { Product, ProductCreate, ProductUpdate } from '../../models/product.model';
import { ProductsApiService } from '../../services/products-api.service';
import { ProductsStateService } from '../../services/products-state.service';
import { idUniqueValidator } from '../../validators/id-unique.validator';
import { formatLocalDate, parseLocalDate } from '../../validators/parse-local-date';
import { releaseDateValidator } from '../../validators/release-date.validator';
import { revisionDateValidator } from '../../validators/revision-date.validator';

/**
 * Formulario de alta (F4) y edición (F5), maquetado según el diseño D2.
 * - La fecha de revisión se autocompleta (liberación + 1 año) y queda deshabilitada.
 * - En edición, el `id` se carga y se deshabilita; el envío hace `PUT` en vez de `POST`.
 * Implementa `CanComponentDeactivate` para el guard de cambios sin guardar.
 */
@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, TextInputComponent, DateInputComponent, ButtonComponent],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormComponent implements CanComponentDeactivate {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ProductsApiService);
  private readonly state = inject(ProductsStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notification = inject(NotificationService);

  private readonly editId = this.route.snapshot.paramMap.get('id');
  readonly isEdit = this.editId !== null;
  readonly submitting = signal(false);
  readonly today = formatLocalDate(new Date());

  /** Se activa al navegar tras un guardado exitoso (evita el aviso del guard). */
  private leaving = false;

  /**
   * Valores del producto cargado en edición. En ese modo "Reiniciar" descarta
   * los cambios y restaura este punto (sin vaciar el `id`); en alta es `null`.
   */
  private pristineValue: ProductCreate | null = null;

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

    if (this.editId !== null) {
      this.loadForEdit(this.editId);
    }
  }

  /** Carga el producto a editar (del estado en memoria o, si no, del backend). */
  private loadForEdit(id: string): void {
    this.form.controls.id.disable();
    const existing = this.state.findById(id);
    if (existing) {
      this.form.patchValue(existing);
      this.pristineValue = this.form.getRawValue();
      return;
    }
    this.api.getById(id).subscribe({
      next: (product: Product) => {
        this.form.patchValue(product);
        this.pristineValue = this.form.getRawValue();
      },
      error: () => {
        this.notification.showError('No se encontró el producto a editar');
        this.router.navigate(['/products']);
      },
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
    const raw = this.form.getRawValue();
    const request$ =
      this.isEdit && this.editId !== null
        ? this.state.updateProduct(this.editId, this.toUpdate(raw))
        : this.state.addProduct(raw as ProductCreate);

    request$.pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: () => {
        this.leaving = true;
        this.notification.showSuccess(
          this.isEdit ? 'Producto actualizado correctamente' : 'Producto creado correctamente',
        );
        this.router.navigate(['/products']);
      },
      error: () => undefined,
    });
  }

  onReset(): void {
    // En edición restaura el producto cargado (sin vaciar el id deshabilitado);
    // en alta, `pristineValue` es null y `reset` limpia el formulario.
    this.form.reset(this.pristineValue ?? undefined);
  }

  canDeactivate(): boolean {
    return this.leaving || !this.form.dirty;
  }

  private toUpdate(raw: ProductCreate): ProductUpdate {
    const { name, description, logo, date_release, date_revision } = raw;
    return { name, description, logo, date_release, date_revision };
  }
}
