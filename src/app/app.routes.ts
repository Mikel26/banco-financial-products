import { Routes } from '@angular/router';

/**
 * Rutas raíz de la aplicación.
 *
 * La ruta `''` es **temporal de la Fase 2**: renderiza la vitrina de componentes
 * del design system. En la Fase 3 se reemplaza por el feature `products` (lazy
 * vía `loadChildren`).
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./shared/showcase/showcase.component').then((m) => m.ShowcaseComponent),
  },
];
