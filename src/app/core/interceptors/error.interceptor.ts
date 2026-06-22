import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { NotificationService } from '../services/notification.service';

/** Traduce un error HTTP a un mensaje de usuario en español. */
export function resolveErrorMessage(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'No hay conexión con el servidor';
  }
  // El backend devuelve 400 tanto para errores de validación del DTO como para
  // id duplicado (no usa 409). El feedback específico de "id duplicado" se
  // resuelve en el formulario con el validador async (verifyId), no aquí.
  if (error.status === 400) {
    return 'Datos inválidos. Revisa los campos del formulario';
  }
  if (error.status === 404) {
    return 'Recurso no encontrado';
  }
  // 409 hoy no lo emite este backend; se mantiene por compatibilidad defensiva.
  if (error.status === 409) {
    return 'El recurso ya existe';
  }
  if (error.status >= 500) {
    return 'Error del servidor. Inténtalo más tarde';
  }
  return 'Ocurrió un error inesperado';
}

/**
 * Interceptor funcional de errores: centraliza el feedback al usuario.
 * Notifica el error traducido y vuelve a propagarlo para que cada llamador
 * pueda reaccionar (p. ej. el formulario manteniendo su estado).
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationService);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      notification.showError(resolveErrorMessage(error));
      return throwError(() => error);
    }),
  );
};
