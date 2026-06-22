import { Injectable, signal } from '@angular/core';

export type NotificationType = 'error' | 'success' | 'info';

export interface AppNotification {
  readonly id: number;
  readonly type: NotificationType;
  readonly message: string;
}

/**
 * Store de notificaciones para feedback al usuario (errores HTTP, confirmaciones).
 * Expone un signal de solo lectura que un componente de UI renderiza (Fase 3).
 * Sin temporizadores aquí: el auto-cierre es responsabilidad de la vista, lo que
 * mantiene este servicio determinista y fácil de testear.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _notifications = signal<AppNotification[]>([]);
  readonly notifications = this._notifications.asReadonly();

  private nextId = 0;

  showError(message: string): void {
    this.push('error', message);
  }

  showSuccess(message: string): void {
    this.push('success', message);
  }

  showInfo(message: string): void {
    this.push('info', message);
  }

  dismiss(id: number): void {
    this._notifications.update((list) => list.filter((n) => n.id !== id));
  }

  clear(): void {
    this._notifications.set([]);
  }

  private push(type: NotificationType, message: string): void {
    const id = this.nextId++;
    this._notifications.update((list) => [...list, { id, type, message }]);
  }
}
