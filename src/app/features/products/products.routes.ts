import { Routes } from '@angular/router';

/**
 * Rutas del feature `products` (cargado lazy desde `app.routes`).
 * Las rutas de alta (`new`) y edición (`edit/:id`) se añaden en la Fase 4.
 */
export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/product-list/product-list.component').then((m) => m.ProductListComponent),
  },
];
