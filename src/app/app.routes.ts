import { Routes } from '@angular/router';

/**
 * Rutas raíz de la aplicación. El feature `products` se carga de forma diferida
 * (lazy) con `loadChildren`; sus rutas hijas viven en `products.routes.ts`.
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'products',
    pathMatch: 'full',
  },
  {
    path: 'products',
    loadChildren: () =>
      import('./features/products/products.routes').then((m) => m.PRODUCTS_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'products',
  },
];
