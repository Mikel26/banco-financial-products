import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { ButtonComponent } from '../../../../shared/components/button/button.component';
import {
  SelectComponent,
  SelectOption,
} from '../../../../shared/components/select/select.component';
import { TextInputComponent } from '../../../../shared/components/text-input/text-input.component';
import { ProductTableSkeletonComponent } from '../../components/product-table-skeleton/product-table-skeleton.component';
import { PageSize, ProductsStateService } from '../../services/products-state.service';

/**
 * Página de listado de productos financieros.
 * F1: carga + skeleton / error / empty-state / tabla (responsive).
 * F2: búsqueda con debounce.
 * F3: selector de cantidad (5/10/20) + contador de resultados.
 */
@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    TextInputComponent,
    SelectComponent,
    ButtonComponent,
    ProductTableSkeletonComponent,
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent implements OnInit {
  readonly state = inject(ProductsStateService);
  private readonly router = inject(Router);

  /** Búsqueda (F2): se aplica con debounce para no filtrar en cada pulsación. */
  readonly searchControl = new FormControl('', { nonNullable: true });

  /** Cantidad de registros (F3): tamaños soportados por el listado. */
  readonly pageSizeOptions: SelectOption[] = [
    { value: 5, label: '5' },
    { value: 10, label: '10' },
    { value: 20, label: '20' },
  ];
  readonly pageSizeControl = new FormControl<PageSize>(5, { nonNullable: true });

  constructor() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((term) => this.state.setSearchTerm(term));

    this.pageSizeControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((size) => this.state.setPageSize(size));
  }

  ngOnInit(): void {
    this.state.loadProducts();
  }

  /** Navega al formulario de alta (F4). */
  goToNew(): void {
    this.router.navigate(['/products/new']);
  }

  /** Si el logo no carga, ocultamos la imagen y dejan ver las iniciales de fondo. */
  onLogoError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  /** Iniciales del producto (hasta 2) para el marcador del logo, según diseño D1. */
  initials(name: string): string {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase();
  }
}
