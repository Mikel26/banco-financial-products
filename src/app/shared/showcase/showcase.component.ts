import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { ButtonComponent } from '../components/button/button.component';
import { DateInputComponent } from '../components/date-input/date-input.component';
import { SelectComponent, SelectOption } from '../components/select/select.component';
import { TextInputComponent } from '../components/text-input/text-input.component';

/**
 * Vitrina temporal de la Fase 2 para previsualizar y probar a mano los
 * componentes del design system. Se elimina en la Fase 3 (la ruta `''` pasará
 * a renderizar el feature `products`).
 */
@Component({
  selector: 'app-showcase',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    JsonPipe,
    ButtonComponent,
    TextInputComponent,
    SelectComponent,
    DateInputComponent,
  ],
  templateUrl: './showcase.component.html',
  styleUrl: './showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowcaseComponent {
  private readonly fb = inject(FormBuilder);

  readonly clicks = signal(0);

  readonly sizeOptions: SelectOption[] = [
    { value: 5, label: '5 por página' },
    { value: 10, label: '10 por página' },
    { value: 20, label: '20 por página' },
  ];

  readonly form = this.fb.group({
    name: [''],
    size: [5],
    release: [''],
  });

  registerClick(): void {
    this.clicks.update((n) => n + 1);
  }
}
