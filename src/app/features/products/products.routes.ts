import { Routes } from '@angular/router';

import { unsavedChangesGuard } from '../../core/guards/unsaved-changes.guard';

/** Rutas del feature `products` (cargado lazy desde `app.routes`). */
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
    canDeactivate: [unsavedChangesGuard],
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./pages/product-form/product-form.component').then((m) => m.ProductFormComponent),
    canDeactivate: [unsavedChangesGuard],
  },
];
