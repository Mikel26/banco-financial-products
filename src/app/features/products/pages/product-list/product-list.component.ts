import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { TextInputComponent } from '../../../../shared/components/text-input/text-input.component';
import { ProductTableSkeletonComponent } from '../../components/product-table-skeleton/product-table-skeleton.component';
import { ProductsStateService } from '../../services/products-state.service';

/**
 * Página de listado de productos financieros.
 * F1: carga + skeleton / error / empty-state / tabla (responsive).
 * F2: búsqueda con debounce (este archivo).
 */
@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, TextInputComponent, ProductTableSkeletonComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent implements OnInit {
  readonly state = inject(ProductsStateService);

  /** Búsqueda (F2): se aplica con debounce para no filtrar en cada pulsación. */
  readonly searchControl = new FormControl('', { nonNullable: true });

  constructor() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((term) => this.state.setSearchTerm(term));
  }

  ngOnInit(): void {
    this.state.loadProducts();
  }

  /** Si el logo no carga, ocultamos la imagen y dejamos el marcador de fondo. */
  onLogoError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
