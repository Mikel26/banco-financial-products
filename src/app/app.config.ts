import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';

/**
 * Configuración raíz de la aplicación (bootstrap standalone).
 *
 * En la Fase 1 se añadirá `withInterceptors([errorInterceptor])` a
 * `provideHttpClient` para el manejo centralizado de errores HTTP.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
  ],
};
