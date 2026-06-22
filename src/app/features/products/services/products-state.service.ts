import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, finalize, tap } from 'rxjs';

import { Product, ProductCreate, ProductUpdate } from '../models/product.model';
import { ProductsApiService } from './products-api.service';

/** Tamaños de página soportados por el selector de cantidad (F3). */
export type PageSize = 5 | 10 | 20;

/**
 * Estado de productos del lado cliente con signals. Responsabilidad única:
 * mantener la lista en memoria, exponer signals derivados (búsqueda +
 * paginación) y orquestar las llamadas al `ProductsApiService`.
 */
@Injectable({ providedIn: 'root' })
export class ProductsStateService {
  private readonly api = inject(ProductsApiService);

  private readonly _products = signal<Product[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _searchTerm = signal<string>('');
  private readonly _pageSize = signal<PageSize>(5);

  readonly products = this._products.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly searchTerm = this._searchTerm.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();

  /** Productos que pasan el filtro de búsqueda (por nombre o descripción). */
  readonly filteredProducts = computed(() => {
    const term = this._searchTerm().trim().toLowerCase();
    const all = this._products();
    if (!term) {
      return all;
    }
    return all.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term),
    );
  });

  /** Total de coincidencias del filtro — alimenta el contador "N Resultados". */
  readonly totalResults = computed(() => this.filteredProducts().length);

  /** Filas visibles en la tabla: filtradas y recortadas al tamaño de página. */
  readonly visibleProducts = computed(() => this.filteredProducts().slice(0, this._pageSize()));

  /**
   * Carga la lista desde el backend gestionando loading/error.
   *
   * Decisiones diferidas a la fase de UI (F3):
   * - El error de carga se expone como signal `error` para render inline. El
   *   `errorInterceptor` además dispara un toast: al cablear la UI hay que
   *   decidir la propiedad del feedback (p. ej. marcar este GET con un
   *   `HttpContext` para que el interceptor omita el toast en la carga).
   * - Esta suscripción es de un solo disparo. Si se añade refresco/recarga,
   *   protegerla con `loading()` o un trigger Subject + `switchMap` para evitar
   *   carreras sobre `_products`.
   */
  loadProducts(): void {
    this._loading.set(true);
    this._error.set(null);
    this.api
      .getAll()
      .pipe(finalize(() => this._loading.set(false)))
      .subscribe({
        next: (products) => this._products.set(products),
        error: () => this._error.set('No se pudieron cargar los productos'),
      });
  }

  setSearchTerm(term: string): void {
    this._searchTerm.set(term);
  }

  setPageSize(size: PageSize): void {
    this._pageSize.set(size);
  }

  /** Crea un producto y lo añade al estado local al confirmarse. */
  addProduct(product: ProductCreate): Observable<Product> {
    return this.api
      .create(product)
      .pipe(tap((created) => this._products.update((list) => [...list, created])));
  }

  /** Edita un producto y refleja el cambio en el estado local. */
  updateProduct(id: string, changes: ProductUpdate): Observable<Product> {
    return this.api
      .update(id, changes)
      .pipe(
        tap((updated) =>
          this._products.update((list) =>
            list.map((product) => (product.id === id ? { ...product, ...updated } : product)),
          ),
        ),
      );
  }

  findById(id: string): Product | undefined {
    return this._products().find((product) => product.id === id);
  }
}
