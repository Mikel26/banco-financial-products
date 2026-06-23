import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';

import { NotificationService } from '../../services/notification.service';

/** Duración (ms) antes de auto-descartar cada notificación. */
const AUTO_DISMISS_MS = 5000;

/**
 * Renderiza las notificaciones del `NotificationService` como toasts apilados
 * (error/success/info), con cierre manual y auto-descarte. Se monta una vez en
 * el shell de la app.
 */
@Component({
  selector: 'app-notifications',
  standalone: true,
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsComponent {
  private readonly service = inject(NotificationService);
  readonly notifications = this.service.notifications;

  private readonly scheduled = new Set<number>();

  constructor() {
    effect(() => {
      for (const notification of this.notifications()) {
        if (!this.scheduled.has(notification.id)) {
          this.scheduled.add(notification.id);
          setTimeout(() => {
            this.service.dismiss(notification.id);
            this.scheduled.delete(notification.id);
          }, AUTO_DISMISS_MS);
        }
      }
    });
  }

  dismiss(id: number): void {
    this.service.dismiss(id);
  }
}
