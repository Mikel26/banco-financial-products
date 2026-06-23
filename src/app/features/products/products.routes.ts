import { Routes } from '@angular/router';

/**
 * Rutas del feature `products` (cargado lazy desde `app.routes`).
 * La ruta de edición (`edit/:id`) y el guard de cambios sin guardar se añaden
 * en el paso F5.
 */
export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/product-list/product-list.component').then((m) => m.ProductListComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/product-form/product-form.component').then((m) => m.ProductFormComponent),
  },
];
