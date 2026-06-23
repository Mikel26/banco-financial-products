import { CanDeactivateFn } from '@angular/router';

/** Componente que puede vetar la salida si tiene cambios sin guardar. */
export interface CanComponentDeactivate {
  canDeactivate(): boolean;
}

/**
 * Guard `CanDeactivate`: si el componente reporta cambios sin guardar, pide
 * confirmación antes de abandonar la ruta.
 */
export const unsavedChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (component) =>
  component.canDeactivate() || confirm('Tienes cambios sin guardar. ¿Salir de todos modos?');
