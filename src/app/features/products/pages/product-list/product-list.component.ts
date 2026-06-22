import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';

import { ProductTableSkeletonComponent } from '../../components/product-table-skeleton/product-table-skeleton.component';
import { ProductsStateService } from '../../services/products-state.service';

/**
 * Página de listado de productos financieros (F1). Carga los productos al
 * iniciar y renderiza skeleton / error / empty-state / tabla según el estado.
 * La búsqueda (F2) y el selector de cantidad + contador (F3) se añaden encima.
 */
@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [DatePipe, ProductTableSkeletonComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent implements OnInit {
  readonly state = inject(ProductsStateService);

  ngOnInit(): void {
    this.state.loadProducts();
  }

  /** Si el logo no carga, ocultamos la imagen y dejamos el marcador de fondo. */
  onLogoError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
