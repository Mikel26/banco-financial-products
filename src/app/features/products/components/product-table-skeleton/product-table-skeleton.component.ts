import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Versión "fantasma" de la tabla mientras cargan los productos. Reduce el
 * Cumulative Layout Shift e informa la carga a lectores de pantalla.
 */
@Component({
  selector: 'app-product-table-skeleton',
  standalone: true,
  templateUrl: './product-table-skeleton.component.html',
  styleUrl: './product-table-skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductTableSkeletonComponent {
  readonly rows = input<number>(5);
  readonly skeletonRows = computed(() => Array.from({ length: this.rows() }));
}
